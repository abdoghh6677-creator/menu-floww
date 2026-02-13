
'use client'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { notifyRestaurantOwner } from '@/lib/whatsapp'
import { supabase } from '@/lib/supabase'
import translationsFallback, { detectLanguage } from '@/lib/translations'
import BillSplitter from '@/components/BillSplitter'
import { getOptimizedImage } from '@/lib/imageHelpers'

// load themes lazily to keep initial bundle small


export default function MenuPage({ params }) {
  const { id } = use(params)
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('__ALL__')
  const [language, setLanguage] = useState('ar')
  const [showLangList, setShowLangList] = useState(false)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutRestaurant, setCheckoutRestaurant] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [promotions, setPromotions] = useState([])
  const [showPromotion, setShowPromotion] = useState(false)
  const [currentPromo, setCurrentPromo] = useState(null)
  const [showPromoAlert, setShowPromoAlert] = useState(false)
  const [showBillSplit, setShowBillSplit] = useState(false)
  const [billSplitData, setBillSplitData] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showInstaPayModal, setShowInstaPayModal] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [lastOrderId, setLastOrderId] = useState(null)
  const [ratingValue, setRatingValue] = useState(5)
  const [ratingFeedback, setRatingFeedback] = useState('')
  const [showAddedNotification, setShowAddedNotification] = useState(false)
  const [theme, setTheme] = useState(null)
  const [themesState, setThemesState] = useState(null)
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  useEffect(() => {
    // استرجاع تفضيل المستخدم
    const savedTheme = localStorage.getItem('menuTheme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
    }

    // التحقق من وجود طلب سابق للتقييم
    const savedOrderId = localStorage.getItem(`last_order_${id}`)
    if (savedOrderId) {
      setLastOrderId(savedOrderId)
    }

    // استرجاع بيانات العميل المحفوظة
    const savedCustomerInfo = localStorage.getItem('savedCustomerInfo')
    if (savedCustomerInfo) {
      try {
        const parsed = JSON.parse(savedCustomerInfo)
        setCustomerInfo(prev => ({
          ...prev,
          name: parsed.name || '',
          phone: parsed.phone || '',
          deliveryAddress: parsed.deliveryAddress || ''
        }))
      } catch (e) {
        console.error('Error loading saved info', e)
      }
    }
  }, [])
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    orderType: 'dine-in',
    tableNumber: '',
    deliveryAddress: '',
    notes: ''
  })

  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)
    localStorage.setItem('menuTheme', newTheme ? 'dark' : 'light')
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const detected = detectLanguage()
        setLanguage(detected)
      } catch (e) {
        setLanguage('ar')
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    import('@/lib/themes')
      .then((m) => { if (mounted) setThemesState(m.THEMES || m.default || m) })
      .catch((e) => console.error('Failed loading themes', e))
    return () => { mounted = false }
  }, [])

  const [translationsState, setTranslationsState] = useState(null)
  useEffect(() => {
    let mounted = true
    import('@/lib/menuTranslations')
      .then((m) => { if (mounted) setTranslationsState(m.default || m) })
      .catch((e) => console.error('Failed loading menu translations', e))
    return () => { mounted = false }
  }, [])

  const t = (translationsState ? (translationsState[language] || translationsState['ar']) : (translationsFallback[language] || translationsFallback['ar']))

  // قائمة اللغات المدعومة وترجمات الأسماء للزر
  const SUPPORTED_LANGS = ['ar', 'en', 'fr', 'de', 'ru', 'ja']
  const LANG_LABELS = {
    ar: 'عربي',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    ru: 'Русский',
    ja: '日本語'
  }

  // قاموس ترجمة الفئات والكلمات الشائعة
  const categoryTranslations = {
    ar: {
      'drinks': 'مشروبات',
      'beverages': 'مشروبات',
      'appetizers': 'مقبلات',
      'starters': 'مقبلات',
      'main courses': 'أطباق رئيسية',
      'mains': 'أطباق رئيسية',
      'desserts': 'حلويات',
      'sweets': 'حلويات',
      'salads': 'سلطات',
      'soups': 'شوربة',
      'burgers': 'برجر',
      'pizza': 'بيتزا',
      'pasta': 'معكرونة',
      'sandwiches': 'ساندويتشات',
      'seafood': 'مأكولات بحرية',
      'chicken': 'دجاج',
      'beef': 'لحم بقري',
      'vegetarian': 'نباتي'
    },
    en: {
      'drinks': 'Drinks',
      'beverages': 'Beverages',
      'appetizers': 'Appetizers',
      'starters': 'Starters',
      'main courses': 'Main Courses',
      'mains': 'Main Courses',
      'desserts': 'Desserts',
      'sweets': 'Sweets',
      'salads': 'Salads',
      'soups': 'Soups',
      'burgers': 'Burgers',
      'pizza': 'Pizza',
      'pasta': 'Pasta',
      'sandwiches': 'Sandwiches',
      'seafood': 'Seafood',
      'chicken': 'Chicken',
      'beef': 'Beef',
      'vegetarian': 'Vegetarian'
    },
    fr: {
      'drinks': 'Boissons',
      'beverages': 'Boissons',
      'appetizers': 'Entrées',
      'starters': 'Entrées',
      'main courses': 'Plats Principaux',
      'mains': 'Plats Principaux',
      'desserts': 'Desserts',
      'sweets': 'Sucreries',
      'salads': 'Salades',
      'soups': 'Soupes',
      'burgers': 'Hamburgers',
      'pizza': 'Pizza',
      'pasta': 'Pâtes',
      'sandwiches': 'Sandwichs',
      'seafood': 'Fruits de Mer',
      'chicken': 'Poulet',
      'beef': 'Boeuf',
      'vegetarian': 'Végétarien'
    },
    de: {
      'drinks': 'Getränke',
      'beverages': 'Getränke',
      'appetizers': 'Vorspeisen',
      'starters': 'Vorspeisen',
      'main courses': 'Hauptgerichte',
      'mains': 'Hauptgerichte',
      'desserts': 'Nachtische',
      'sweets': 'Süßigkeiten',
      'salads': 'Salate',
      'soups': 'Suppen',
      'burgers': 'Hamburger',
      'pizza': 'Pizza',
      'pasta': 'Nudeln',
      'sandwiches': 'Sandwiches',
      'seafood': 'Meeresfrüchte',
      'chicken': 'Huhn',
      'beef': 'Rindfleisch',
      'vegetarian': 'Vegetarisch'
    },
    ru: {
      'drinks': 'Напитки',
      'beverages': 'Напитки',
      'appetizers': 'Закуски',
      'starters': 'Закуски',
      'main courses': 'Основные блюда',
      'mains': 'Основные блюда',
      'desserts': 'Десерты',
      'sweets': 'Сладости',
      'salads': 'Салаты',
      'soups': 'Супы',
      'burgers': 'Бургеры',
      'pizza': 'Пицца',
      'pasta': 'Паста',
      'sandwiches': 'Сэндвичи',
      'seafood': 'Морепродукты',
      'chicken': 'Курица',
      'beef': 'Говядина',
      'vegetarian': 'Вегетарианское'
    },
    ja: {
      'drinks': 'ドリンク',
      'beverages': 'ドリンク',
      'appetizers': '前菜',
      'starters': '前菜',
      'main courses': 'メインコース',
      'mains': 'メインコース',
      'desserts': 'デザート',
      'sweets': 'スイーツ',
      'salads': 'サラダ',
      'soups': 'スープ',
      'burgers': 'バーガー',
      'pizza': 'ピザ',
      'pasta': 'パスタ',
      'sandwiches': 'サンドウィッチ',
      'seafood': 'シーフード',
      'chicken': 'チキン',
      'beef': 'ビーフ',
      'vegetarian': 'ベジタリアン'
    }
  }

  // دالة لترجمة النصوص (الفئات والكلمات الشائعة)
  const translateText = (text) => {
    if (!text) return text
    const lowerText = text.toLowerCase().trim()

    // محاولة الترجمة المباشرة باستخدام المفتاح (مفيدة إذا كان المخزن باللغة الإنجليزية)
    const langTrans = categoryTranslations[language] || categoryTranslations['en']
    if (langTrans[lowerText]) return langTrans[lowerText]

    // إذا لم نجد تطابقاً كمفتاح، قد يكون النص نفسه ترجمة (مثلاً 'مشروبات').
    // نبحث عبر قواميس الفئات في كل لغة للعثور على المفتاح الإنجليزي المقابل ثم نرجع الترجمات للغة المطلوبة.
    for (const [srcLang, map] of Object.entries(categoryTranslations)) {
      for (const [engKey, translatedValue] of Object.entries(map)) {
        if (!translatedValue) continue
        try {
          if (translatedValue.toLowerCase().trim() === lowerText) {
            // found the canonical english key (engKey); return its translation in target language
            const targetMap = categoryTranslations[language] || categoryTranslations['en']
            return targetMap[engKey] || translatedValue
          }
        } catch (e) {
          // ignore non-string values
        }
      }
    }

    // fallback: return original text
    return text
  }

  // دالة للحصول على ترجمات النصوص الثابتة
  const getFixedText = (key) => {
    return (t && t[key]) || key
  }

  useEffect(() => {
    loadMenu()
  }, [id])

  // إغلاق إشعار العروض تلقائياً بعد 5 ثواني عند ظهوره
  useEffect(() => {
    if (!showPromoAlert) return
    const timer = setTimeout(() => {
      setShowPromoAlert(false)
    }, 5000) // 5000ms = 5s
    return () => clearTimeout(timer)
  }, [showPromoAlert])

  useEffect(() => {
    if (restaurant) {
      // Use DB values as source of truth for payment/delivery settings
      const restaurantSettings = {
        accepts_dine_in: restaurant.accepts_dine_in ?? true,
        accepts_delivery: restaurant.accepts_delivery ?? true,
        accepts_pickup: restaurant.accepts_pickup ?? true,
        accepts_cash: restaurant.accepts_cash !== undefined ? restaurant.accepts_cash : true,
        accepts_instapay: restaurant.accepts_instapay === true,
        whatsapp_notifications: restaurant.whatsapp_notifications ?? false,
        whatsapp_number: restaurant.whatsapp_number ?? ''
      }

      // update default order type based on restaurant settings
      const validTypes = []
      if (restaurantSettings.accepts_dine_in) validTypes.push('dine-in')
      if (restaurantSettings.accepts_delivery) validTypes.push('delivery')
      if (restaurantSettings.accepts_pickup !== false) validTypes.push('pickup')

      setCustomerInfo(prev => {
        if (validTypes.length > 0 && !validTypes.includes(prev.orderType)) {
          return { ...prev, orderType: validTypes[0] }
        }
        return prev
      })

      // update default payment method if cash is not accepted
      if (restaurantSettings.accepts_cash === false) {
        if (restaurantSettings.accepts_instapay) setPaymentMethod('instapay')
        else setPaymentMethod('')
      }
    }
  }, [restaurant])

  // Subscribe to restaurant updates so open menu pages (phones/desktops)
  // receive admin changes immediately and ignore local overrides.
  useEffect(() => {
    if (!supabase || !id || loading) return

    let channel
    try {
      channel = supabase
        .channel(`restaurants_changes_${id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'restaurants', filter: `id=eq.${id}` },
          (payload) => {
            console.log('🔔 Realtime update received:', payload)
            try {
              // clear local override so DB becomes authoritative
              localStorage.removeItem(`payment_settings_${id}`)
            } catch (e) {
              // ignore
            }
            if (payload && payload.new) {
              console.log('✅ Updating restaurant state from realtime:', payload.new)
              setRestaurant(prev => ({ ...prev, ...payload.new }))
              // Also update checkout restaurant if it's open
              setCheckoutRestaurant(prev => prev ? { ...prev, ...payload.new } : payload.new)
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.error('Realtime subscription error:', e)
    }

    return () => {
      try {
        if (channel) {
          channel.unsubscribe()
          if (supabase.removeChannel) supabase.removeChannel(channel)
        }
      } catch (e) {
        // ignore
      }
    }
  }, [id, loading])

  // When user opens checkout, ensure we have freshest DB values (avoid stale localStorage on phones)
  useEffect(() => {
    if (!showCheckout) return
    let mounted = true

    const refetch = async () => {
      try {
        const { data: fresh, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error refetching restaurant for checkout:', error)
          return
        }

        try {
          localStorage.removeItem(`payment_settings_${id}`)
        } catch (e) {
          // ignore
        }

        if (mounted && fresh) setRestaurant(fresh)
      } catch (e) {
        console.error('Refetch exception:', e)
      }
    }

    refetch()

    return () => { mounted = false }
  }, [showCheckout, id])

  // When the page becomes visible or gains focus, refetch restaurant data
  // This helps mobile users receive admin changes (payment/delivery) when they return
  useEffect(() => {
    if (!supabase || !id) return
    let mounted = true

    const refetchRestaurant = async () => {
      try {
        const { data: fresh, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.warn('Visibility refetch error:', error)
          return
        }

        try { localStorage.removeItem(`payment_settings_${id}`) } catch (e) {}

        if (mounted && fresh) {
          setRestaurant(fresh)
          setCheckoutRestaurant(prev => prev ? { ...prev, ...fresh } : null)
        }
      } catch (e) {
        console.error('Visibility refetch exception:', e)
      }
    }

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refetchRestaurant()
      }
    }

    window.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', refetchRestaurant)

    return () => {
      mounted = false
      try {
        window.removeEventListener('visibilitychange', handleVisibility)
        window.removeEventListener('focus', refetchRestaurant)
      } catch (e) {}
    }
  }, [id])

  const loadMenu = async () => {
    try {
      setLoading(true)

      const restaurantQ = supabase.from('restaurants').select('*').eq('id', id).single()
      const themeQ = supabase.from('restaurant_themes').select('*').eq('restaurant_id', id).single()
      const itemsQ = supabase
        .from('menu_items')
        .select(`
          id,
          name,
          name_en,
          name_fr,
          name_de,
          name_ru,
          name_ja,
          description,
          description_en,
          description_fr,
          description_de,
          description_ru,
          description_ja,
          price,
          category,
          image_url,
          has_promotion,
          promotion_discount,
          addons_header,
          hide_when_available,
          created_at,
          menu_addons(id,name,price,name_en,name_fr,name_de,name_ru,name_ja),
          item_variants(id,name,price,is_default,name_en,name_fr,name_de,name_ru,name_ja)
        `)
        .eq('restaurant_id', id)
        .order('category')

      const [restaurantRes, themeRes, itemsRes] = await Promise.all([restaurantQ, themeQ, itemsQ])

      const { data: restaurantData, error: restaurantError } = restaurantRes || {}
      const { data: themeData } = themeRes || {}
      const { data: itemsData, error: itemsError } = itemsRes || {}

      if (restaurantError) {
        console.error('Error loading restaurant:', restaurantError)
      }

      // Ensure safe defaults for payment/delivery settings from DB
      if (restaurantData) {
        restaurantData.accepts_delivery = restaurantData.accepts_delivery ?? true
        restaurantData.accepts_dine_in = restaurantData.accepts_dine_in ?? true
        restaurantData.accepts_pickup = restaurantData.accepts_pickup ?? true
        restaurantData.accepts_cash = restaurantData.accepts_cash !== undefined ? restaurantData.accepts_cash : true
        restaurantData.accepts_instapay = restaurantData.accepts_instapay === true
        restaurantData.accepts_visa = restaurantData.accepts_visa !== false
        setRestaurant(restaurantData)
      }

      if (themeData) {
        const chosen = themesState && themesState[themeData.theme_id] ? themesState[themeData.theme_id] : (themesState && themesState.modern ? themesState.modern : null)
        if (chosen) setTheme(chosen)
      }

      if (itemsError) {
        console.error('Error loading menu items:', itemsError.message || itemsError)
      }

      setMenuItems(itemsData || [])

      if (itemsData) {
        const itemsWithPromo = itemsData.filter(item => item.has_promotion && item.promotion_discount)
        if (itemsWithPromo.length > 0) {
          setTimeout(() => setShowPromoAlert(true), 500)
        }
      }
    } catch (e) {
      console.error('loadMenu exception:', e)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['__ALL__', ...new Set(menuItems.map(item => item.category))]
  
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === '__ALL__' || item.category === selectedCategory
    const query = searchQuery.toLowerCase()
    if (!query) return matchesCategory

    const matchesSearch = (
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.name_en && item.name_en.toLowerCase().includes(query)) ||
      (item.name_fr && item.name_fr.toLowerCase().includes(query)) ||
      (item.name_de && item.name_de.toLowerCase().includes(query)) ||
      (item.name_ru && item.name_ru.toLowerCase().includes(query)) ||
      (item.name_ja && item.name_ja.toLowerCase().includes(query)) ||
      (item.description_en && item.description_en.toLowerCase().includes(query)) ||
      (item.description_fr && item.description_fr.toLowerCase().includes(query)) ||
      (item.description_de && item.description_de.toLowerCase().includes(query)) ||
      (item.description_ru && item.description_ru.toLowerCase().includes(query)) ||
      (item.description_ja && item.description_ja.toLowerCase().includes(query))
    )

    return matchesCategory && matchesSearch
  })

  const visibleFilteredItems = filteredItems.slice(0, visibleCount)

  const addToCart = (item, selectedAddons = [], selectedVariant = null) => {
    const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(item.price)
    const promoDiscount = item.has_promotion && item.promotion_discount ? parseFloat(item.promotion_discount) : 0
    const effectivePrice = promoDiscount > 0 ? (basePrice * (100 - promoDiscount) / 100) : basePrice
    
    // البحث عن صنف مطابق في السلة لزيادة الكمية
    const existingItemIndex = cart.findIndex(cartItem => {
      if (cartItem.isAddon) return false
      if (cartItem.id !== item.id) return false
      
      const variantMatch = selectedVariant 
        ? cartItem.selectedVariant?.id === selectedVariant.id 
        : !cartItem.selectedVariant
      if (!variantMatch) return false

      // التحقق من تطابق الإضافات
      const currentItemAddons = cart.filter(a => a.parentCartId === cartItem.cartId)
      if (currentItemAddons.length !== selectedAddons.length) return false
      
      return selectedAddons.every(newAddon => 
        currentItemAddons.some(existingAddon => existingAddon.id === newAddon.id)
      )
    })

    if (existingItemIndex !== -1) {
      const existingItem = cart[existingItemIndex]
      // increase only the main item's quantity; addons remain as separate optional lines
      const updatedCart = cart.map(cartItem => {
        if (cartItem.cartId === existingItem.cartId) {
          return { ...cartItem, quantity: cartItem.quantity + 1 }
        }
        return cartItem
      })

      // if user selected addons with this add action, append new addon entries (independent)
      const newAddonItems = selectedAddons.map((addon, index) => ({
        id: addon.id,
        name: `${addon.name} (إضافة)`,
        price: parseFloat(addon.price),
        totalPrice: parseFloat(addon.price),
        cartId: uuidv4(),
        // keep a loose reference to the main item for UI grouping but do not auto-remove
        parentCartId: existingItem.cartId,
        quantity: 1,
        selectedAddons: [],
        selectedVariant: null,
        isAddon: true
      }))

      setCart([...updatedCart, ...newAddonItems])
      setShowAddedNotification(true)
      return
    }

    const mainCartId = uuidv4()
    
    const mainItem = {
      ...item,
      cartId: mainCartId,
      quantity: 1,
      selectedAddons: [],
      selectedVariant,
      totalPrice: effectivePrice
    }

    const addonItems = selectedAddons.map((addon, index) => ({
      id: addon.id,
      name: `${addon.name} (إضافة)`,
      price: parseFloat(addon.price),
      totalPrice: parseFloat(addon.price),
      cartId: uuidv4(),
      parentCartId: mainCartId,
      quantity: 1,
      selectedAddons: [],
      selectedVariant: null,
      isAddon: true
    }))

    setCart([...cart, mainItem, ...addonItems])
    setShowAddedNotification(true)
  }

  // Add selected addons as independent cart lines without adding the main item
  const addAddonsOnly = (item, selectedAddons = []) => {
    if (!selectedAddons || selectedAddons.length === 0) return

    // find last index of the same main item in cart to place addons after it, if exists
    const lastMainIndex = cart.reduce((acc, ci, idx) => {
      if (!ci.isAddon && ci.id === item.id) return idx
      return acc
    }, -1)

    const parentCartId = lastMainIndex !== -1 ? cart[lastMainIndex].cartId : uuidv4()

    const addonItems = selectedAddons.map((addon, index) => ({
      id: addon.id,
      name: `${addon.name} (إضافة)`,
      price: parseFloat(addon.price),
      totalPrice: parseFloat(addon.price),
      cartId: uuidv4(),
      parentCartId,
      quantity: 1,
      selectedAddons: [],
      selectedVariant: null,
      isAddon: true
    }))

    let newCart = []
    if (lastMainIndex !== -1) {
      newCart = [
        ...cart.slice(0, lastMainIndex + 1),
        ...addonItems,
        ...cart.slice(lastMainIndex + 1)
      ]
    } else {
      newCart = [...cart, ...addonItems]
    }

    setCart(newCart)
    setShowAddedNotification(true)
  }

  const increaseQuantity = (cartId) => {
    // increase only the specified item's quantity (do not auto-increase linked addons)
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: item.quantity + 1 }
      }
      return item
    }))
  }

  const removeFromCart = (cartId, decrease = false) => {
    if (decrease) {
      const item = cart.find(i => i.cartId === cartId)
      if (item && item.quantity > 1) {
        // decrease only the specified item quantity
        setCart(cart.map(i => {
          if (i.cartId === cartId) {
            return { ...i, quantity: i.quantity - 1 }
          }
          return i
        }))
        return
      }
    }
    
    // remove only the specified item; keep addon lines so they can act as independent optional items
    setCart(cart.filter(item => item.cartId !== cartId))
  }

  const getCartTotal = () => {
    const itemsTotal = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)
    
    // حساب الخصم إذا وجد كوبون
    let discountAmount = 0
    if (appliedCoupon && appliedCoupon.discount_percentage) {
      discountAmount = (itemsTotal * appliedCoupon.discount_percentage) / 100
    }

    const deliveryFee = customerInfo.orderType === 'delivery' ? parseFloat(restaurant?.delivery_fee || 0) : 0
    return Math.max(0, itemsTotal - discountAmount + deliveryFee)
  }

  const handleCheckout = async (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert(t.alertEmpty)
      return
    }

    // التحقق من العنوان في حالة التوصيل
    if (customerInfo.orderType === 'delivery' && !customerInfo.deliveryAddress?.trim()) {
      alert(t.alertLoc)
      return
    }

    // التحقق من ملء البيانات المطلوبة
    if (!customerInfo.name || !customerInfo.phone) {
      alert('يرجى ملء البيانات المطلوبة (الاسم والهاتف)')
      return
    }

    if (customerInfo.orderType === 'dine-in' && !customerInfo.tableNumber) {
      alert('يرجى إدخال رقم الطاولة')
      return
    }

    try {
      // حساب تفاصيل الخصم
      const itemsTotal = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)
      const discountAmount = appliedCoupon 
        ? (itemsTotal * appliedCoupon.discount_percentage) / 100 
        : 0

      

      const orderData = {
        restaurant_id: id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        order_type: customerInfo.orderType,
        table_number: customerInfo.orderType === 'dine-in' ? customerInfo.tableNumber : null,
        delivery_address: customerInfo.orderType === 'delivery' ? customerInfo.deliveryAddress : null,
        total_amount: getCartTotal(),
        
        status: 'pending',
        payment_method: paymentMethod || 'cash',
        notes: customerInfo.notes || null
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()

      if (error) {
        console.error('Order insert error - Full error:', JSON.stringify(error))
        console.error('Order insert error - Message:', error?.message || 'No message')
        console.error('Order insert error - Code:', error?.code || 'No code')
        console.error('Order insert error - Details:', error?.details || 'No details')
        console.error('Order data being inserted:', JSON.stringify(orderData))
        throw new Error(error?.message || 'فشل في إنشاء الطلب. تأكد من أن جميع البيانات صحيحة.')
      }

      if (!order || !order[0]) {
        throw new Error('لم يتم إنشاء الطلب بنجاح')
      }

      if (error) {
        console.error('Order insert error - Full error:', JSON.stringify(error))
        console.error('Order insert error - Message:', error?.message || 'No message')
        console.error('Order insert error - Code:', error?.code || 'No code')
        console.error('Order insert error - Details:', error?.details || 'No details')
        console.error('Order data being inserted:', JSON.stringify(orderData))
        throw new Error(error?.message || 'فشل في إنشاء الطلب. تأكد من أن جميع البيانات صحيحة.')
      }

      if (!order || !order[0]) {
        throw new Error('لم يتم إنشاء الطلب بنجاح')
      }

      // حفظ معرف الطلب للتقييم لاحقاً
      localStorage.setItem(`last_order_${id}`, order[0].id)
      setLastOrderId(order[0].id)

      // حفظ بيانات العميل للمرات القادمة
      localStorage.setItem('savedCustomerInfo', JSON.stringify({
        name: customerInfo.name,
        phone: customerInfo.phone,
        deliveryAddress: customerInfo.deliveryAddress
      }))

      const orderItems = cart.map(item => ({
        order_id: order[0].id,
        menu_item_id: (item.isPromo || item.isAddon) ? null : item.id,
        item_name: item.name + (item.selectedVariant ? ` (${item.selectedVariant.name})` : ''),
        quantity: item.quantity,
        price: item.totalPrice,
        addons: item.selectedAddons
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) {
        console.error('Order items insert error:', itemsError)
      }

      // 🆕 إرسال إشعار WhatsApp (بشكل آمن بدون عرقلة المتابعة)
      // تحميل إعدادات الواتساب من localStorage للتأكد من أن لدينا البيانات الحالية
      if (restaurant) {
        try {
          let whatsappSettings = {}
          try {
            const saved = localStorage.getItem(`payment_settings_${restaurant.id}`)
            if (saved) {
              whatsappSettings = JSON.parse(saved)
            }
          } catch (e) {
            console.error('Error loading WhatsApp settings:', e)
          }

          const whatsappEnabled = whatsappSettings.whatsapp_notifications ?? restaurant.whatsapp_notifications ?? false
          const whatsappNumber = whatsappSettings.whatsapp_number ?? restaurant.whatsapp_number

          if (whatsappEnabled && whatsappNumber) {
            const restaurantWithWhatsApp = {
              ...restaurant,
              whatsapp_notifications: whatsappEnabled,
              whatsapp_number: whatsappNumber
            }
            
            setTimeout(() => {
              notifyRestaurantOwner(restaurantWithWhatsApp, orderData, cart)
            }, 500)
          }
        } catch (whatsappError) {
          console.error('WhatsApp notification error:', whatsappError)
          // لا نوقف العملية إذا فشل الواتساب
        }
      }

      // إذا كان هناك تقسيم للفاتورة
      if (billSplitData) {
        const splits = billSplitData.map(participant => ({
          order_id: order[0].id,
          participant_name: participant.name,
          participant_phone: participant.phone,
          amount: participant.amount,
          payment_status: 'pending'
        }))

        const { error: splitsError } = await supabase.from('bill_splits').insert(splits)
        if (splitsError) {
          console.error('Bill splits insert error:', splitsError)
        }
      }

      // no rating reminder scheduled (feature disabled)

      // حساب الوقت المتوقع
      const baseTime = customerInfo.orderType === 'delivery' ? 30 : 15
      const itemsTime = cart.length * 5
      setEstimatedTime(baseTime + itemsTime)

      setOrderSuccess(true)
      setShowCheckout(false)
      setShowCart(false)
      setShowAddedNotification(false)
      setShowBillSplit(false)
      setShowPromotion(false)
      setShowLangList(false)

      // رسالة مخصصة حسب طريقة الدفع
      if (paymentMethod === 'instapay') {
        alert('✅ تم إرسال طلبك بنجاح!\n\n⏳ سيتم مراجعة الدفع وتأكيد الطلب خلال دقائق')
      } else {
        alert('تم إرسال طلبك بنجاح! 🎉\nسيتم التواصل معك قريباً')
      }
      
      setTimeout(() => {
        setCart([])
        setBillSplitData(null)
        // لا نقوم بمسح البيانات الشخصية والعنوان لتسهيل الطلب القادم
        setCustomerInfo(prev => ({
          ...prev,
          orderType: 'dine-in',
          tableNumber: '',
          deliveryAddress: '',
          notes: ''
        }))
        setAppliedCoupon(null)
        setCouponCode('')
      }, 5000)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.\n' + error.message)
    }
  }

  const handleSubmitRating = async () => {
    if (!lastOrderId) return

    const { error } = await supabase
      .from('orders')
      .update({
        rating: ratingValue,
        rating_feedback: ratingFeedback
      })
      .eq('id', lastOrderId)

    if (!error) {
      alert(t.ratingThanks)
      setShowRating(false)
      localStorage.removeItem(`last_order_${id}`)
      setLastOrderId(null)
    } else {
      alert(t.alertErr)
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode) return

    // البحث في العروض المحملة عن كود مطابق
    const promo = promotions ? promotions.find(p => 
        p.code && p.code.toUpperCase() === couponCode.toUpperCase() && p.is_active
      ) : null

    if (promo) {
      setAppliedCoupon(promo)
      setShowCouponInput(false)
    } else {
      alert(t.invalidCoupon)
      setAppliedCoupon(null)
    }

  }

  // Open checkout: refetch restaurant from DB to ensure freshest payment/delivery settings
  const openCheckout = async () => {
    try {
      console.log('🟢 openCheckout: STARTING refetch for restaurant', id)
      console.log('📊 Current restaurant state:', restaurant)
      setCheckoutLoading(true)
      setShowCart(false)
      setShowAddedNotification(false)
      setShowBillSplit(false)
      setShowPromotion(false)
      setShowLangList(false)

      // Force disable any caching on this query
      const { data: fresh, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

      console.log('🟢 openCheckout: DB response - error:', error)
      console.log('📊 Fresh from DB:', fresh)

      if (error) {
        console.error('❌ Error refetching restaurant for checkout:', error)
        console.warn('⚠️ Falling back to current restaurant state')
        setCheckoutRestaurant(restaurant || {})
        setShowCheckout(true)
        return
      }

      if (fresh) {
        console.log('✅ Comparing DB data:')
        console.log('   accepts_cash (fresh):', fresh.accepts_cash, '| (current):', restaurant?.accepts_cash)
        console.log('   accepts_instapay (fresh):', fresh.accepts_instapay, '| (current):', restaurant?.accepts_instapay)
        console.log('   accepts_delivery (fresh):', fresh.accepts_delivery, '| (current):', restaurant?.accepts_delivery)
        console.log('   accepts_dine_in (fresh):', fresh.accepts_dine_in, '| (current):', restaurant?.accepts_dine_in)
        console.log('   accepts_pickup (fresh):', fresh.accepts_pickup, '| (current):', restaurant?.accepts_pickup)
        
        setRestaurant(fresh)
        setCheckoutRestaurant(fresh)
        
        // Clear all localStorage payment overrides
        try { 
          localStorage.removeItem(`payment_settings_${id}`)
          console.log('✅ Cleared localStorage payment_settings')
        } catch (e) {}
        
        // Critical: force React re-render
        setShowCheckout(false)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      console.log('✅ Setting showCheckout to true with fresh data')
      setShowCheckout(true)
    } catch (e) {
      console.error('❌ openCheckout exception:', e)
      setCheckoutRestaurant(restaurant || {})
      setShowCheckout(true)
    } finally {
      setCheckoutLoading(false)
    }
  }

  // استخراج العروض المتاحة من الأصناف
  const availablePromotions = menuItems.filter(item => item.has_promotion && item.promotion_discount)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-2xl font-bold text-black">{t.loading}</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">{t.notFound}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : ''}`} style={{ backgroundColor: darkMode ? undefined : UI_THEME.pageBg, fontFamily: UI_THEME.fontFamily, color: UI_THEME.text }}>
      {/* Promotions Alert Modal - showing items with discounts */}
      {showPromoAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <button
              onClick={() => setShowPromoAlert(false)}
              className={`absolute top-4 right-4 hover:opacity-70 text-3xl font-bold`}
            >
              ×
            </button>
            <h2 className="text-3xl font-bold mb-2">🔥 عروض خاصة</h2>
            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>عروض حصرية على أصناف مختارة</p>
            
            <div className="space-y-3 mb-6">
              {menuItems
                .filter(item => item.has_promotion && item.promotion_discount)
                .map(item => (
                  <div key={item.id} className={`rounded-xl p-4 border-2 border-red-500 ${darkMode ? 'bg-slate-700/50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          السعر الأصلي: <span className="line-through">{item.price} ج</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-lg">
                          {item.promotion_discount}% خصم
                        </div>
                        <p className="text-green-600 font-bold mt-1">
                          {(parseFloat(item.price) * (100 - parseFloat(item.promotion_discount)) / 100).toFixed(2)} ج
                        </p>
                      </div>
                    </div>
                    {/* per-item add button removed: items are added via 'اطلب الآن' or from menu */}
                  </div>
                ))}
            </div>
            
            <button
              onClick={() => {
                try { localStorage.setItem(`promo_dismissed_${id}`, 'true') } catch (e) {}
                // add all promo items to cart
                menuItems.filter(item => item.has_promotion && item.promotion_discount).forEach(item => {
                  const defaultVariant = item.item_variants && item.item_variants.length > 0
                    ? (item.item_variants.find(v => v.is_default) || item.item_variants[0])
                    : null
                  addToCart(item, [], defaultVariant)
                })
                setShowPromoAlert(false)
                // close promo modal and reveal the menu (cart preserved)
                setShowCart(false)
                setShowCheckout(false)
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
            >
              اطلب الآن 🛒
            </button>
          </div>
        </div>
      )}

      {/* Old Promotion Modal - keeping for backward compatibility if needed */}
      {showPromotion && currentPromo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 max-w-lg w-full text-white text-center relative animate-scale-in shadow-2xl">
            <button
              onClick={() => setShowPromotion(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl font-bold"
            >
              ×
            </button>
            {currentPromo.image_url && (
              <img
                src={currentPromo.image_url}
                alt={currentPromo.title}
                loading="lazy"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
            )}
            <h2 className="text-4xl font-bold mb-4">
              {language === 'en' && currentPromo.title_en ? currentPromo.title_en : language === 'ja' && currentPromo.title_ja ? currentPromo.title_ja : currentPromo.title}
            </h2>
            {currentPromo.discount_percentage && (
              <div className="bg-white text-orange-600 rounded-full px-8 py-3 inline-block mb-4 text-3xl font-black">
                {currentPromo.discount_percentage}% خصم
              </div>
            )}
            {currentPromo.discount_text && (
              <p className="text-2xl font-bold mb-4">
                🎁 {currentPromo.discount_text}
              </p>
            )}
            {currentPromo.description && (
              <p className="text-lg mb-6 opacity-90">
                {language === 'en' && currentPromo.description_en ? currentPromo.description_en : language === 'ja' && currentPromo.description_ja ? currentPromo.description_ja : currentPromo.description}
              </p>
            )}
            {currentPromo.end_date && (
              <p className="text-sm opacity-75">
                {t.validUntil} {new Date(currentPromo.end_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </p>
            )}
            <button
              onClick={() => setShowPromotion(false)}
              className="mt-6 bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition"
            >
                {t.add || 'Start Order'} 🛒
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`rounded-2xl p-6 max-w-sm w-full text-center shadow-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-xl font-bold mb-4">{t.ratingTitle}</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  {star <= ratingValue ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder={t.feedbackPh}
              className={`w-full p-3 rounded-lg mb-4 border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-black'}`}
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRating(false)}
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700"
              >
                {t.submitRating}
              </button>
            </div>
          </div>
        </div>
      )}
{/* Header - High Quality Version */}
<div className="relative overflow-hidden">
  {/* Background Image */}
      <div className="relative h-72">
    {restaurant.cover_image_url ? (
      <img
        src={getOptimizedImage(restaurant.cover_image_url)}
        alt={restaurant.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <div className={`absolute inset-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
  </div>

  {/* Content - باقي الكود كما هو */}
  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
    {/* Status - Right */}
    <div className="absolute top-4 right-4 z-20">
      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md ${
        restaurant.is_open 
          ? 'bg-green-500/90 text-white' 
          : 'bg-red-500/90 text-white'
      }`}>
        {restaurant.is_open ? '🟢 مفتوح' : '🔴 مغلق'}
      </span>
    </div>

    {/* Hours - Left */}
    <div className="absolute top-4 left-4 z-20">
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full text-white border border-white/10">
        <span className="text-lg">🕐</span>
        <span className="font-semibold text-xs md:text-sm">
          {restaurant.working_hours || '10 ص - 12 م'}
        </span>
      </div>
    </div>

    {/* Center: Logo & Name */}
    <div className="flex flex-col items-center z-10">
      <div className="bg-white p-1 rounded-full shadow-2xl mb-2 sm:mb-4 w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden border-4 border-white/30">
        {restaurant.logo_url ? (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover rounded-full"
            style={{ imageRendering: 'high-quality' }}
          />
        ) : (
          <span className="text-3xl sm:text-6xl">🍽️</span>
        )}
      </div>
      
      <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl text-center px-2">
        {restaurant.name}
      </h1>
    </div>
  </div>

</div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 mt-3 sm:mt-6 flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all shadow-sm active:scale-95 text-lg sm:text-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="flex-1">
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border outline-none transition-all shadow-sm focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-black placeholder-gray-400'}`}
            />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLangList(prev => !prev)}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap ${darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
              >
                {LANG_LABELS[language] || language.toUpperCase()}
              </button>

              {showLangList && (
                <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-lg z-40 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                  {SUPPORTED_LANGS.map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        setLanguage(lng)
                        try { localStorage.setItem('siteLanguage', lng) } catch (e) {}
                        setShowLangList(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {LANG_LABELS[lng] || lng.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
      </div>

      {/* Categories */}
      <div className={`max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 sticky top-0 z-30 backdrop-blur-sm transition-all ${darkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'}`}>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-lg scale-105'
                  : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200')
              }`}
            >
              {cat === '__ALL__' ? t.all : cat === '__PROMOTIONS__' ? t.promotions : translateText(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div id="menu" className="max-w-4xl mx-auto px-2 sm:px-4">
        {filteredItems.length === 0 ? (
          <div className={`text-center py-8 sm:py-12 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={darkMode ? 'text-gray-300' : 'text-black'}>{t.noItems}</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {visibleFilteredItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                language={language}
                t={t}
                onAddToCart={addToCart}
                onAddAddonsOnly={addAddonsOnly}
                onRemoveFromCart={removeFromCart}
                cart={cart}
                darkMode={darkMode}
              />
            ))}
            {filteredItems.length > visibleCount && (
              <div className="text-center py-4">
                <button onClick={() => setVisibleCount(prev => prev + 20)} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                  تحميل المزيد
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Modal Placeholder */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t.cart}</h3>
              <button onClick={() => setShowCart(false)}>×</button>
            </div>
            {cart.length === 0 ? (
              <p className="text-center py-4">{t.emptyCart}</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex justify-between items-start border-b pb-3">
                      <div className="flex-1">
                        <h4 className="font-bold">
                          {item.quantity > 1 && <span className="text-orange-600 mx-1">{item.quantity}x</span>}
                          {item.name}
                        </h4>
                        {item.selectedVariant && (
                          <p className="text-sm text-purple-600">
                            الحجم: {item.selectedVariant.name}
                          </p>
                        )}
                        {item.selectedAddons.length > 0 && (
                          <p className="text-sm text-gray-600">
                            + {item.selectedAddons.map(a => a.name).join(', ')}
                          </p>
                        )}
                        <p className="text-orange-600 font-semibold">{item.totalPrice} ج</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t.delete}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>{t.total}</span>
                  <span>{getCartTotal()} {t.currency}</span>
                </div>
                <button 
                  onClick={() => { setShowCart(false); openCheckout(); }}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold"
                >
                  {t.checkout}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal Placeholder */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md overflow-y-auto" style={{ background: UI_THEME.cardBg, borderRadius: UI_THEME.radii.card, padding: 24, boxShadow: UI_THEME.shadow, color: UI_THEME.text, maxHeight: '95vh' }}>
            <h3 className="text-xl font-bold mb-4">{t.checkout}</h3>
            {checkoutLoading && (
              <div className="text-center py-4">
                <div className="text-lg font-semibold">🔄 جاري تحديث الإعدادات...</div>
              </div>
            )}
            {!checkoutLoading && (
            <form onSubmit={handleCheckout} className="space-y-4">
              <input 
                type="text" 
                placeholder={t.name} 
                required 
                className={`w-full`}
                style={{ padding: 14, borderRadius: UI_THEME.radii.input, border: `2px solid ${UI_THEME.inputBorder}`, background: UI_THEME.cardBg, color: UI_THEME.text }}
                value={customerInfo.name}
                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder={t.phone} 
                required 
                className={`w-full`}
                style={{ padding: 14, borderRadius: UI_THEME.radii.input, border: `2px solid ${UI_THEME.inputBorder}`, background: UI_THEME.cardBg, color: UI_THEME.text }}
                value={customerInfo.phone}
                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />

              {/* Tip (optional) removed */}

              {/* Order Type Selection */}
              <div className={`grid gap-2 ${
                [(checkoutRestaurant || restaurant)?.accepts_dine_in, (checkoutRestaurant || restaurant)?.accepts_delivery, (checkoutRestaurant || restaurant)?.accepts_pickup !== false].filter(Boolean).length === 3 ? 'grid-cols-3' : 
                [(checkoutRestaurant || restaurant)?.accepts_dine_in, (checkoutRestaurant || restaurant)?.accepts_delivery, (checkoutRestaurant || restaurant)?.accepts_pickup !== false].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'
              }`}>
                {(checkoutRestaurant || restaurant)?.accepts_dine_in && (
                  <button
                    type="button"
                    onClick={() => setCustomerInfo({ ...customerInfo, orderType: 'dine-in' })}
                    className={`p-2 rounded border text-sm transition-colors ${customerInfo.orderType === 'dine-in' ? 'bg-orange-100 border-orange-500 text-orange-700' : (darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')}`}
                  >
                    <span className="flex items-center gap-2"><Icon name="dineIn" size={18} />{t.dineIn}</span>
                  </button>
                )}
                {(checkoutRestaurant || restaurant)?.accepts_delivery && (
                  <button
                    type="button"
                    onClick={() => setCustomerInfo({ ...customerInfo, orderType: 'delivery' })}
                    className={`p-2 rounded border text-sm transition-colors ${customerInfo.orderType === 'delivery' ? 'bg-orange-100 border-orange-500 text-orange-700' : (darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')}`}
                  >
                    <span className="flex items-center gap-2"><Icon name="delivery" size={18} />{t.deliveryType}</span>
                  </button>
                )}
                {(checkoutRestaurant || restaurant)?.accepts_pickup !== false && (
                  <button
                    type="button"
                    onClick={() => setCustomerInfo({ ...customerInfo, orderType: 'pickup' })}
                    className={`p-2 rounded border text-sm transition-colors ${customerInfo.orderType === 'pickup' ? 'bg-orange-100 border-orange-500 text-orange-700' : (darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')}`}
                  >
                    <span className="flex items-center gap-2"><Icon name="pickup" size={18} />{t.pickup}</span>
                  </button>
                )}
              </div>

              {/* Conditional Inputs */}
              {customerInfo.orderType === 'dine-in' && (
                <input
                  type="text"
                  placeholder={t.table}
                  required
                  className={`w-full`}
                  style={{ padding: 14, borderRadius: UI_THEME.radii.input, border: `2px solid ${UI_THEME.inputBorder}`, background: UI_THEME.cardBg, color: UI_THEME.text }}
                  value={customerInfo.tableNumber}
                  onChange={e => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                />
              )}

              {customerInfo.orderType === 'delivery' && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold">{t.address}</label>
                  <textarea
                    placeholder={t.addressExample}
                    required
                    className={`w-full`}
                    style={{ padding: 14, borderRadius: UI_THEME.radii.input, border: `2px solid ${UI_THEME.inputBorder}`, background: UI_THEME.cardBg, color: UI_THEME.text }}
                    rows="4"
                    value={customerInfo.deliveryAddress || ''}
                    onChange={e => setCustomerInfo({ ...customerInfo, deliveryAddress: e.target.value })}
                  />
                  {customerInfo.deliveryAddress && (
                    <p className="text-xs text-green-600 font-semibold">{t.addressEntered}</p>
                  )}
                </div>
              )}

              {/* Notes / Details Field */}
              <div>
                <label className="block text-sm font-bold mb-1">{t.notes}</label>
                <textarea
                  placeholder={t.notesPh}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}
                  rows="2"
                  value={customerInfo.notes}
                  onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                />
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-4">
                {!showCouponInput && !appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(true)}
                    className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-2"
                  >
                    <Icon name="tag" size={16} />
                    {t.haveCoupon}
                  </button>
                ) : (
                  <div className="space-y-2">
                    {appliedCoupon ? (
                      <div className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-200">
                        <span className="text-green-700 font-bold text-sm">
                          ✅ {t.discount} {appliedCoupon.discount_percentage}% ({appliedCoupon.code})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null)
                            setCouponCode('')
                          }}
                          className="text-red-500 text-xs font-bold hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t.couponCode}
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className={`flex-1`}
                          style={{ padding: 12, borderRadius: UI_THEME.radii.input, border: `2px solid ${UI_THEME.inputBorder}`, background: UI_THEME.cardBg, color: UI_THEME.text }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          style={{ background: UI_THEME.applyBtn, color: '#fff', padding: '10px 14px', borderRadius: UI_THEME.radii.smallBtn, fontWeight: 600 }}
                        >
                          {t.apply}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* طريقة الدفع */}
              <div className="border-t pt-4">
                <label className="block font-medium mb-3">{t.paymentMethod} *</label>
                <div className="space-y-2">
                  {(checkoutRestaurant || restaurant)?.accepts_cash !== false && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full py-3 rounded-lg font-semibold border-2 transition flex items-center justify-center gap-2 ${
                      paymentMethod === 'cash'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    <Icon name="cash" size={20} />
                    <span>{t.cash}</span>
                  </button>
                  )}

                  {(checkoutRestaurant || restaurant)?.accepts_instapay && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`w-full py-3 rounded-lg font-semibold border-2 transition flex items-center justify-center gap-2 ${
                        paymentMethod === 'instapay'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      <Icon name="card" size={20} />
                      <span>{t.instapay}</span>
                    </button>
                  )}

                  {(checkoutRestaurant || restaurant)?.accepts_visa !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('visa')}
                      className={`w-full py-3 rounded-lg font-semibold border-2 transition flex items-center justify-center gap-2 ${
                        paymentMethod === 'visa'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <Icon name="card" size={20} />
                      <span>{t.visa}</span>
                    </button>
                  )}
                </div>

                {paymentMethod === 'instapay' && (
                  <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-3 sm:p-4">
                    <h5 className="font-bold text-purple-900 mb-3 text-sm sm:text-base">💳 {t.instapay}</h5>

                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                      {(checkoutRestaurant || restaurant)?.instapay_link && (
                        <div className="space-y-3">
                          <a
                            href={restaurant.instapay_link}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full inline-flex items-center justify-center px-3 sm:px-6 py-3 sm:py-6 bg-white rounded-lg hover:shadow-2xl transition border-2 border-gray-300 hover:border-purple-500"
                            aria-label="Pay with InstaPay"
                          >
                            <img
                                    src="/instapay.png"
                                    alt="InstaPay"
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                    className="h-16 sm:h-24 md:h-28 lg:h-32 w-auto object-contain"
                                  />
                          </a>
                          {/* Total amount */}
                          <p className="text-center text-base sm:text-lg font-bold text-purple-900">💰 {t.currency || 'LE'}: {getCartTotal()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {paymentMethod === 'cash' && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold">{t.payment}</p>
                  <p className="text-sm text-gray-600 mt-1">{t.paymentNote}</p>
                </div>
              )}

              {paymentMethod === 'instapay' && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <p className="font-semibold text-purple-900">💳 {t.instapay}</p>
                  <p className="text-sm text-purple-700 mt-1">
                    {t.paymentInstruction} <strong dir="ltr">{(checkoutRestaurant || restaurant)?.instapay_receipt_number || (checkoutRestaurant || restaurant)?.instapay_phone || '-'}</strong>
                  </p>
                </div>
              )}

              {paymentMethod === 'visa' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900">💳 {t.visa}</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {language === 'ar' ? 'سيتم الدفع عند استلام الطلب ببطاقتك الائتمانية أو الخصم' : (language === 'en' ? 'Payment will be made upon order delivery by your credit or debit card' : (language === 'fr' ? 'Le paiement sera effectué à la livraison par votre carte bancaire' : (language === 'de' ? 'Zahlung bei Lieferung mit Ihrer Kreditkarte' : (language === 'ru' ? 'Оплата при доставке вашей кредитной картой' : 'お支払いはご配達時にクレジットカードでお願いします'))))}
                  </p>
                </div>
              )}

              {/* Total Summary before submit */}
              <div className="flex justify-between items-center font-bold text-lg border-t pt-4 mb-4">
                <span>{t.grandTotal}</span>
                <div className="text-right">
                  {appliedCoupon && <span className="block text-xs text-green-600 font-normal">({t.discount} {appliedCoupon.discount_percentage}%)</span>}
                  <span>{getCartTotal()} {t.currency}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-lg font-bold text-lg text-white`}
                style={{ background: UI_THEME.applyBtn, borderRadius: UI_THEME.radii.mainBtn }}
              >
                {paymentMethod === 'instapay' ? `💳 ${t.confirm}` : t.confirm}
              </button>
              <button type="button" onClick={() => setShowCheckout(false)} className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg">{t.cancel}</button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center" style={{ background: UI_THEME.cardBg, borderRadius: UI_THEME.radii.card, padding: 24, boxShadow: UI_THEME.shadow, color: UI_THEME.text }}>
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: UI_THEME.text }}>{t.success}</h3>
            <button onClick={() => setOrderSuccess(false)} className="w-full text-white py-2 mt-4" style={{ background: UI_THEME.primary, borderRadius: UI_THEME.radii.mainBtn, padding: '10px 12px', fontWeight: 600 }}>{t.ok}</button>

            {restaurant?.whatsapp_number && (
              <a
                href={`https://wa.me/${restaurant.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، أنا ${customerInfo.name}\nأود الاستفسار عن طلبي`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 mt-3"
                style={{ background: '#25D366', borderRadius: UI_THEME.radii.mainBtn }}
              >
                <Icon name="whatsapp" size={18} />
                {language === 'ar' ? 'تواصل عبر WhatsApp' : (language === 'en' ? 'Contact via WhatsApp' : (language === 'fr' ? 'Contacter via WhatsApp' : (language === 'de' ? 'Kontakt per WhatsApp' : (language === 'ru' ? 'Связаться через WhatsApp' : 'WhatsAppで連絡'))))}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Added Notification - تختفي عند فتح صفحة الدفع */}
      {showAddedNotification && !showCheckout && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center justify-between gap-4 border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
            <div>
              <p className="font-bold text-sm">{t.cartReady}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {getCartTotal()} {t.currency}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // open cart but keep the added-notification visible
                setShowCart(true)
              }}
              className="bg-orange-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-orange-700 whitespace-nowrap"
            >
              {t.checkout}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Menu Item Component with Addons
function MenuItem({ item, language, t, onAddToCart, onAddAddonsOnly, onRemoveFromCart, cart, darkMode }) {
  const [selectedAddons, setSelectedAddons] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    if (item.item_variants && item.item_variants.length > 0) {
      const defaultVariant = item.item_variants.find(v => v.is_default) || item.item_variants[0]
      setTimeout(() => setSelectedVariant(defaultVariant), 0)
    }
  }, [item])

  // حساب كمية الصنف في السلة (مع مراعاة الحجم المختار)
  const getItemQuantity = () => {
    if (!cart) return 0
    return cart.reduce((total, cartItem) => {
      const sameId = cartItem.id === item.id && !cartItem.isAddon
      const sameVariant = selectedVariant 
        ? cartItem.selectedVariant?.id === selectedVariant.id 
        : !cartItem.selectedVariant
      return (sameId && sameVariant) ? total + cartItem.quantity : total
    }, 0)
  }

  const quantity = getItemQuantity()

  const handleRemoveOne = () => {
    if (!cart) return
    // حذف آخر عنصر تم إضافته بنفس المواصفات
    const itemToRemove = [...cart].reverse().find(cartItem => {
      const sameId = cartItem.id === item.id && !cartItem.isAddon
      const sameVariant = selectedVariant 
        ? cartItem.selectedVariant?.id === selectedVariant.id 
        : !cartItem.selectedVariant
      return sameId && sameVariant
    })

    if (itemToRemove) {
      onRemoveFromCart(itemToRemove.cartId, true)
    }
  }

  const handleAddToCart = (lang = language) => {
    if (item.item_variants && item.item_variants.length > 0 && !selectedVariant) {
      const alertMessages = {
        ar: 'اختر الحجم أولاً',
        en: 'Please select a size first',
        fr: 'Veuillez d\'abord sélectionner une taille',
        de: 'Bitte wählen Sie zuerst eine Größe',
        ru: 'Сначала выберите размер',
        ja: 'サイズを選択してください'
      }
      alert(alertMessages[lang] || alertMessages.en)
      return
    }
    
    onAddToCart(item, selectedAddons, selectedVariant)
  }

  const toggleAddon = (addon) => {
    const already = selectedAddons.find(a => a.id === addon.id)
    if (already) {
      // uncheck: remove from selected and remove one matching addon cart item if present
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id))

      // find corresponding main item instance in cart (match variant if any)
      const mainInstance = [...(cart || [])].reverse().find(ci => !ci.isAddon && ci.id === item.id && (selectedVariant ? ci.selectedVariant?.id === selectedVariant.id : !ci.selectedVariant))

      const addonCartItem = (cart || []).find(ci => ci.isAddon && ci.id === addon.id && (mainInstance ? ci.parentCartId === mainInstance.cartId : true))
      if (addonCartItem) {
        onRemoveFromCart && onRemoveFromCart(addonCartItem.cartId)
      }
    } else {
      // check: add to selected and immediately add addon as independent cart line
      setSelectedAddons([...selectedAddons, addon])
      if (onAddAddonsOnly) {
        onAddAddonsOnly(item, [addon])
      }
    }
  }

  const name = (language === 'en' && item.name_en) ? item.name_en
    : (language === 'fr' && item.name_fr) ? item.name_fr
    : (language === 'de' && item.name_de) ? item.name_de
    : (language === 'ru' && item.name_ru) ? item.name_ru
    : (language === 'ja' && item.name_ja) ? item.name_ja
    : item.name
  const description = language === 'en' && item.description_en ? item.description_en : language === 'ja' && item.description_ja ? item.description_ja : language === 'fr' && item.description_fr ? item.description_fr : language === 'de' && item.description_de ? item.description_de : language === 'ru' && item.description_ru ? item.description_ru : item.description
  
  const currentImage = item.image_url

  const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(item.price)
  const promoDiscount = item.has_promotion && item.promotion_discount ? parseFloat(item.promotion_discount) : 0
  const effectivePrice = promoDiscount > 0 ? (basePrice * (100 - promoDiscount) / 100) : basePrice
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)} role="button" tabIndex={0} className={`lux-card cursor-pointer group ${darkMode ? '' : 'shadow-none'}`}>
        <div className="flex gap-4">
          <div className={`w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 relative ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {currentImage ? (
              <img
                src={getOptimizedImage(currentImage)}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <span className="text-4xl text-gray-300">🍽️</span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="lux-title">{name}</h3>
                {description && (
                  <p className={`lux-desc line-clamp-2 ${darkMode ? '' : '!text-gray-900'}`}>{description}</p>
                )}
              </div>
                <div className="flex flex-col items-end gap-2">
                {promoDiscount > 0 ? (
                  <div className="text-right">
                    <div className="text-sm text-gray-300 line-through">{basePrice.toFixed(2)} {t.currency}</div>
                    <div className="bg-orange-600 text-white px-4 py-1 rounded-full font-bold ml-2">{effectivePrice.toFixed(2)} {t.currency}</div>
                  </div>
                ) : (
                  <span className="bg-orange-600 text-white px-4 py-1 rounded-full font-bold ml-2">
                    {basePrice} {t.currency}
                  </span>
                )}
              </div>
            </div>

            {/* الأحجام والإضافات مخفية على الكرت؛ تظهر فقط داخل مودال التفاصيل */}

            {/* Show a single view button on the card; full ordering moved to modal */}
            <div className="mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(true) }}
                className={`ghost-btn w-full`}
              >
                {t.viewItem}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Item Detail Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50" onClick={() => setOpen(false)}>
          <div className={`w-full max-w-lg rounded-lg p-4 sm:p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-36 h-32 sm:h-36 rounded-xl overflow-hidden flex-shrink-0">
                {currentImage ? <img src={getOptimizedImage(currentImage)} alt={name} loading="lazy" className="w-full h-full object-cover" /> : <span className="text-4xl">🍽️</span>}
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-1">{name}</h3>
                {description && <p className={`text-xs sm:text-sm mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-900'}`}>{description}</p>}
                <div className="mb-2">
                  <span className="font-semibold text-sm sm:text-base">{t.sizes}</span>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {item.item_variants && item.item_variants.length > 0 ? item.item_variants.map(variant => {
                      // عرض النص المترجم حسب اللغة
                      const variantName = language === 'en' && variant.name_en ? variant.name_en 
                        : language === 'fr' && variant.name_fr ? variant.name_fr 
                        : language === 'de' && variant.name_de ? variant.name_de 
                        : language === 'ru' && variant.name_ru ? variant.name_ru 
                        : language === 'ja' && variant.name_ja ? variant.name_ja 
                        : variant.name
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${selectedVariant?.id === variant.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {variantName} - {variant.price} {t.currency}
                        </button>
                      )
                    }) : <span className="text-sm">{basePrice} {t.currency}</span>}
                  </div>
                </div>

                {item.menu_addons && item.menu_addons.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm font-semibold mb-2">{item.addons_header ? item.addons_header : t.addons}</p>
                    <div className="space-y-2">
                      {item.menu_addons.map(addon => {
                        // عرض النص المترجم حسب اللغة
                        const addonName = language === 'en' && addon.name_en ? addon.name_en 
                          : language === 'fr' && addon.name_fr ? addon.name_fr 
                          : language === 'de' && addon.name_de ? addon.name_de 
                          : language === 'ru' && addon.name_ru ? addon.name_ru 
                          : language === 'ja' && addon.name_ja ? addon.name_ja 
                          : addon.name
                        return (
                          <label key={addon.id} onClick={(e) => e.stopPropagation()} className="flex items-center justify-between p-2 rounded-lg border cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={!!selectedAddons.find(a => a.id === addon.id)} onChange={() => toggleAddon(addon)} />
                              <span>{addonName}</span>
                            </div>
                            <span className="font-bold">+{addon.price} {t.currency}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button onClick={() => { handleRemoveOne() }} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition">−</button>
                  <div className="font-bold text-lg">{quantity}</div>
                  <button onClick={() => handleAddToCart()} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition">+</button>
                </div>
                <div className="mt-4">
                  <button onClick={() => setOpen(false)} className="ghost-btn prominent">{t.continueShopping}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CountdownTimer({ targetDate, t, darkMode }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    // نفترض أن العرض ينتهي بنهاية اليوم المحدد
    const end = new Date(targetDate)
    end.setHours(23, 59, 59, 999)
    
    const difference = +end - +new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
      }
    }
    return timeLeft
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const hasTimeLeft = Object.keys(timeLeft).length > 0

  if (!hasTimeLeft) return null

  return (
    <div className={`text-sm font-bold mt-2 flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
      <span>{t.endsIn}</span>
      <span dir="ltr" className="flex gap-1 font-mono">
        {timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
        <span>{timeLeft.h}h</span>
        <span>{timeLeft.m}m</span>
        <span>{timeLeft.s}s</span>
      </span>
    </div>
  )
}

// UI Theme variables (applied to Checkout/Success UI)
const UI_THEME = {
  pageBg: '#E8E8E8',
  cardBg: '#FFFFFF',
  headerBg: '#2D2D2D',
  primary: '#8B1A1A',
  applyBtn: '#991B1B',
  text: '#000000',
  placeholder: '#6B7280',
  star: '#DC2626',
  inputBorder: '#D1D5DB',
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  radii: {
    card: '18px',
    input: '12px',
    smallBtn: '8px',
    mainBtn: '12px'
  },
  shadow: '0 1px 3px rgba(0,0,0,0.08)'
}

// Simple inline SVG icon set (professional-looking, lightweight)
function Icon({ name, className = 'inline-block', size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  switch (name) {
    case 'dineIn':
      return (
        <svg {...common} className={className}>
          <path d="M7 3v11" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 3v11" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 14c0 2.8 2 4 5 4s5-1.2 5-4" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'delivery':
      return (
        <svg {...common} className={className}>
          <path d="M3 6h11v7h4l3 3V6" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7.5" cy="18.5" r="1.5" fill={UI_THEME.primary}/>
          <circle cx="18.5" cy="18.5" r="1.5" fill={UI_THEME.primary}/>
        </svg>
      )
    case 'pickup':
      return (
        <svg {...common} className={className}>
          <path d="M5 11h14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6z" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'whatsapp':
      return (
        <svg {...common} className={className}>
          <path d="M21 11.5A9.5 9.5 0 1 0 11.5 21L7 22l1.1-4.5A9.5 9.5 0 0 0 21 11.5z" fill="#25D366"/>
          <path d="M15.5 14.2c-.3 0-1 .1-1.9-.4-.4-.2-1.2-.6-2-.9-.6-.2-1-.3-1.4.3-.4.6-.9.9-1.6.8-.6-.1-1.3-.8-2-1.6-.6-.8-.2-1.3.4-1.9.4-.4.8-.9.9-1.3.1-.4 0-.9-.1-1.4-.1-.5-.5-.8-1-1.1-.4-.2-1-.4-1.5-.6-.5-.1-1-.2-1.3-.2-.2 0-.4 0-.6.1" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'cash':
      return (
        <svg {...common} className={className}>
          <rect x="2" y="6" width="20" height="12" rx="2" stroke={UI_THEME.primary} strokeWidth="1.6" fill="none"/>
          <path d="M7 12h10" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )
    case 'card':
      return (
        <svg {...common} className={className}>
          <rect x="2" y="6" width="20" height="12" rx="2" stroke={UI_THEME.primary} strokeWidth="1.6" fill="none"/>
          <rect x="6" y="10" width="4" height="2" fill={UI_THEME.primary} />
        </svg>
      )
    case 'tag':
      return (
        <svg {...common} className={className}>
          <path d="M2 12l8 8 10-10-8-8L2 12z" stroke={UI_THEME.primary} strokeWidth="1.4" fill="none" />
          <circle cx="8" cy="8" r="1" fill={UI_THEME.primary} />
        </svg>
      )
    default:
      return null
  }
}