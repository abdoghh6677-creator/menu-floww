'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { translateText } from '@/lib/translate'
import PlanManagement from '@/components/PlanManagement'
import { notifyRestaurantOwner } from '@/lib/whatsapp'
import { translations as paymentTranslations, detectLanguage } from '@/lib/translations'

// 🔊 دالة لتشغيل صوت الإشعار
const playNotificationSound = () => {
  try {
    // 1️⃣ محاولة استخدام Web Audio API (صوت مولد)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // نمط الجرس: نوتات مختلفة
      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
      
      console.log('✅ Web Audio API تشغيل ناجح')
    } catch (webAudioErr) {
      console.log('Web Audio API failed, trying sound files...', webAudioErr)
      
      // 2️⃣ جرب صوت من Mixkit
      const soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
      const audio = new Audio(soundUrl)
      audio.volume = 1
      audio.play().catch(e => {
        console.log('Mixkit sound failed, trying alternative...', e)
        
        // 3️⃣ جرب صوت بديل
        const beep = new Audio('https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3')
        beep.volume = 1
        beep.play().catch(err => console.log('Alternative sound also failed', err))
      })
    }
  } catch (e) {
    console.error('Audio error:', e)
  }
}

// 🪟 دالة لإظهار Desktop Notification (إشعارات النظام)
const showDesktopNotification = (title, options = {}) => {
  try {
    // طلب الإذن أولاً إذا لم يتم إعطاؤه
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          icon: '🔔',
          badge: '🔔',
          tag: 'order-notification',
          requireInteraction: true, // لا تُغلق تلقائياً
          ...options
        })
        console.log('✅ Desktop Notification مرسلة')
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              icon: '🔔',
              badge: '🔔',
              tag: 'order-notification',
              requireInteraction: true,
              ...options
            })
          }
        })
      }
    }
  } catch (e) {
    console.error('Desktop Notification error:', e)
  }
}

// 💫 دالة لجعل عنوان الصفحة يومض
const flashPageTitle = (message, originalTitle) => {
  let count = 0
  const interval = setInterval(() => {
    count++
    document.title = count % 2 === 0 ? originalTitle : `🔔 ${message}`
    
    // توقف بعد 10 ثوانٍ
    if (count >= 20) {
      clearInterval(interval)
      document.title = originalTitle
    }
  }, 500)
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showQRDownload, setShowQRDownload] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('menu')
  const [darkMode, setDarkMode] = useState(false)
  const [lastCheckedOrderId, setLastCheckedOrderId] = useState(null) // تتبع آخر طلب تم عرض إشعاره

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboardTheme')
    if (savedTheme === 'dark') setDarkMode(true)
  }, [])

  const [currentPlan, setCurrentPlan] = useState(null)
  const [notification, setNotification] = useState(null)
  const [analyticsData, setAnalyticsData] = useState({
    daily: [],
    monthly: [],
    totalOrders: 0,
    totalRevenue: 0,
    topItems: [],
    bottomItems: [],
    allItems: [],
    categorySales: []
  })
  const [analyticsRange, setAnalyticsRange] = useState('30_days')
  const [settings, setSettings] = useState({
    logo_url: '',
    cover_image_url: '',
    working_hours: '',
    is_open: false,
    delivery_fee: 0,
    accepts_delivery: true,
    accepts_dine_in: true,
    accepts_pickup: true,
    accepts_instapay: false,
    instapay_username: '',
    instapay_link: '',
    instapay_receipt_number: '',
    accepts_visa: false,
    instapay_phone: '',
    accepts_cash: true,
    whatsapp_notifications: false,
    whatsapp_number: ''
  })

  const language = (typeof window !== 'undefined') ? detectLanguage() : 'ar'
  const t = paymentTranslations[language] || paymentTranslations['ar']
  
  const [newItem, setNewItem] = useState({
    name: '',
    name_en: '',
    name_ja: '',
    description: '',
    description_en: '',
    description_ja: '',
    description_fr: '',
    description_de: '',
    description_ru: '',
    price: '',
    category: 'مشروبات',
    image_url: '',
    has_promotion: false,
    promotion_discount: 0,
    hide_when_available: false
  })

  const [addons, setAddons] = useState([])
  const [newAddon, setNewAddon] = useState({ name: '', price: '' })
  const [variants, setVariants] = useState([])
  const [newVariant, setNewVariant] = useState({ name: '', price: '' })

  const router = useRouter()

  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)
    localStorage.setItem('dashboardTheme', newTheme ? 'dark' : 'light')
  }

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (!restaurant?.id) {
      console.log('⏳ Waiting for restaurant data...')
      return
    }

    console.log('🔄 Setting up realtime subscription for:', restaurant.id)

    let channel = null
    
    const setupSubscription = async () => {
      try {
        channel = supabase
          .channel(`realtime-orders-${restaurant.id}-${Date.now()}`, {
            config: {
              broadcast: { self: true },
              presence: { key: restaurant.id }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'orders',
              filter: `restaurant_id=eq.${restaurant.id}`
            },
            async (payload) => {
              console.log('✅ NEW ORDER EVENT RECEIVED:', payload.new)
              
              const orderType = payload.new.order_type === 'delivery' ? '🚗 توصيل' : payload.new.order_type === 'dine-in' ? '🍽️ محلي' : '🏪 استلام'
              const customerName = payload.new.customer_name
              const totalAmount = payload.new.total_amount
              
              // 🔊 تشغيل صوت الإشعار المتقدم (جرسين)
              playNotificationSound()
              setTimeout(() => {
                playNotificationSound()
              }, 500)
              
              // 🪟 إظهار Desktop Notification (إشعارات النظام)
              showDesktopNotification(`🔔 طلب جديد!`, {
                body: `👤 ${customerName}\n${orderType}\n💰 ${totalAmount} ج`,
                tag: 'new-order'
              })
              
              // 💫 جعل عنوان الصفحة يومض
              flashPageTitle(`طلب جديد من ${customerName}!`, document.title)

              // 📳 اهتزاز الجهاز (إذا كان متاحاً - للهاتف)
              try {
                if ('vibrate' in navigator) {
                  navigator.vibrate([300, 150, 300, 150, 300])
                }
              } catch (e) {
                console.log('Vibration not supported', e)
              }

              // 💬 الإشعار داخل الصفحة
              const notificationText = `📱 طلب جديد!\n👤 ${customerName}\n${orderType}\n💰 ${totalAmount} ج`
              setNotification(notificationText)
              
              // إعادة تحميل الطلبات
              console.log('🔄 Reloading orders...')
              await loadOrders(restaurant.id)
              
              // إبقاء الإشعار لمدة 10 ثوانٍ
              setTimeout(() => setNotification(null), 10000)
            }
          )
          .on('subscribe', (status) => {
            console.log('📡 Subscription status:', status)
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to realtime orders')
            }
          })
          .on('error', (error) => {
            console.error('❌ Subscription error:', error)
          })
          .subscribe((status) => {
            console.log('📊 Subscribe callback status:', status)
          })

        console.log('✅ Subscription setup completed')
      } catch (error) {
        console.error('❌ Error setting up subscription:', error)
      }
    }

    setupSubscription()

    return () => {
      console.log('🧹 Cleaning up subscription')
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [restaurant?.id])

  useEffect(() => {
    if (activeTab === 'analytics' && restaurant) {
      loadAnalytics()
    }
  }, [activeTab, restaurant, menuItems, analyticsRange])

  // 🔄 Polling: فحص الطلبات الجديدة كل 3 ثوانٍ
  useEffect(() => {
    if (!restaurant?.id) return

    console.log('⏰ Setting up order polling...')
    
    const checkNewOrders = async () => {
      try {
        const { data: latestOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (latestOrders && latestOrders.length > 0) {
          const latestOrder = latestOrders[0]
          
          // تحقق إذا كان هناك طلب جديد لم نعرض له إشعار بعد
          if (lastCheckedOrderId !== latestOrder.id && latestOrder.status === 'pending') {
            console.log('📱 NEW ORDER DETECTED via polling:', latestOrder)
            
            // تحديث آخر طلب تم عرض إشعاره
            setLastCheckedOrderId(latestOrder.id)
            
            const orderType = latestOrder.order_type === 'delivery' ? '🚗 توصيل' : latestOrder.order_type === 'dine-in' ? '🍽️ محلي' : '🏪 استلام'
            const customerName = latestOrder.customer_name
            const totalAmount = latestOrder.total_amount
            
            // 🔊 تشغيل صوت الإشعار (جرسين)
            playNotificationSound()
            setTimeout(() => {
              playNotificationSound()
            }, 500)
            
            // 🪟 Desktop Notification
            showDesktopNotification(`🔔 طلب جديد!`, {
              body: `👤 ${customerName}\n${orderType}\n💰 ${totalAmount} ج`,
              tag: 'new-order-polling'
            })
            
            // 💫 جعل عنوان الصفحة يومض
            flashPageTitle(`طلب جديد من ${customerName}!`, document.title)

            // 📳 اهتزاز
            try {
              if ('vibrate' in navigator) {
                navigator.vibrate([300, 150, 300, 150, 300])
              }
            } catch (e) {
              console.log('Vibration not supported', e)
            }

            // 💬 الإشعار داخل الصفحة
            const notificationText = `📱 طلب جديد!\n👤 ${customerName}\n${orderType}\n💰 ${totalAmount} ج`
            setNotification(notificationText)
            setTimeout(() => setNotification(null), 10000)
          }
        }
      } catch (error) {
        console.error('❌ Polling error:', error)
      }
    }

    // فحص فوري عند التحميل
    checkNewOrders()

    // ثم فحص كل 3 ثوانٍ
    const pollingInterval = setInterval(checkNewOrders, 3000)

    return () => {
      console.log('🧹 Cleaning up polling')
      clearInterval(pollingInterval)
    }
  }, [restaurant?.id, lastCheckedOrderId])

  useEffect(() => {
    if (restaurant) {
      // محاولة تحميل إعدادات الدفع من localStorage أولاً
      let paymentSettings = {}
      try {
        const saved = localStorage.getItem(`payment_settings_${restaurant.id}`)
        if (saved) {
          paymentSettings = JSON.parse(saved)
        }
      } catch (e) {
        console.error('Error loading saved payment settings:', e)
      }

      setSettings({
        logo_url: restaurant.logo_url || '',
        cover_image_url: restaurant.cover_image_url || '',
        working_hours: restaurant.working_hours || '',
        is_open: restaurant.is_open,
        delivery_fee: restaurant.delivery_fee || 0,
        accepts_delivery: paymentSettings.accepts_delivery ?? restaurant.accepts_delivery ?? true,
        accepts_dine_in: paymentSettings.accepts_dine_in ?? restaurant.accepts_dine_in ?? true,
        accepts_pickup: paymentSettings.accepts_pickup ?? restaurant.accepts_pickup ?? true,
        accepts_instapay: paymentSettings.accepts_instapay ?? restaurant.accepts_instapay ?? false,
        instapay_username: paymentSettings.instapay_username ?? restaurant.instapay_username ?? '',
        instapay_link: paymentSettings.instapay_link ?? restaurant.instapay_link ?? '',
        instapay_receipt_number: paymentSettings.instapay_receipt_number ?? restaurant.instapay_receipt_number ?? '',
        accepts_visa: paymentSettings.accepts_visa ?? restaurant.accepts_visa ?? false,
        instapay_phone: paymentSettings.instapay_phone ?? restaurant.instapay_phone ?? '',
        accepts_cash: paymentSettings.accepts_cash ?? (restaurant.accepts_cash !== false ? true : false),
        whatsapp_notifications: paymentSettings.whatsapp_notifications ?? restaurant.whatsapp_notifications ?? false,
        whatsapp_number: paymentSettings.whatsapp_number ?? restaurant.whatsapp_number ?? ''
      })
    }
  }, [restaurant])

const checkUser = async () => {
  console.log('👤 Checking user...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || !user.email) {
    console.error("❌ User not logged in or email missing");
    router.push('/auth')
    return
  }

  console.log('✅ User authenticated:', user.email)
  setUser(user)

  // البحث عن المطعم باستخدام user_id لضمان جلب السجل الصحيح
  const { data: restaurantData, error: fetchError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    console.error("❌ No restaurant found:", fetchError.message);
  } else {
    console.log("✅ Restaurant loaded:", restaurantData.name, '(ID:', restaurantData.id, ')')
  }

  setRestaurant(restaurantData)

  if (restaurantData) {
    console.log('📦 Loading menu items, orders, plan...')
    loadMenuItems(restaurantData.id)
    loadOrders(restaurantData.id)
    loadCurrentPlan(restaurantData.plan_id)
  }

  setLoading(false)
}
  const loadCurrentPlan = async (planId) => {
    if (!planId) {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('name', 'مجاني')
        .single()
      setCurrentPlan(data)
      return
    }
    
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()
    
    setCurrentPlan(data)
  }

  const loadMenuItems = async (restaurantId) => {
    const { data } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_addons(*),
        menu_item_variants(*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    setMenuItems(data || [])
  }

  const loadOrders = async (restaurantId) => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(20)

    setOrders(data || [])
  }

  const loadAnalytics = async () => {
    if (!restaurant) return

    let query = supabase
      .from('orders')
      .select(`
        created_at, 
        total_amount,
        order_items (
          item_name,
          quantity,
          price,
          menu_item_id
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: true })

    const now = new Date()
    if (analyticsRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      query = query.gte('created_at', start)
    } else if (analyticsRange === '7_days') {
      const start = new Date()
      start.setDate(now.getDate() - 7)
      query = query.gte('created_at', start.toISOString())
    } else if (analyticsRange === '30_days') {
      const start = new Date()
      start.setDate(now.getDate() - 30)
      query = query.gte('created_at', start.toISOString())
    }

    const { data: ordersData, error } = await query

    if (error) {
      console.error('Error loading analytics:', error)
      return
    }

    const safeOrdersData = ordersData || []
    const dailyMap = {}
    const monthly = {}
    const itemCounts = {}
    const categoryStats = {}
    const itemCategoryMap = {}
    let totalRev = 0
    let totalItemsSold = 0
    const uniqueCustomersSet = new Set()
    
    menuItems.forEach(item => {
      itemCategoryMap[item.id] = item.category
    })

    safeOrdersData.forEach(order => {
      const date = new Date(order.created_at)
      const dayKey = date.toLocaleDateString('en-CA')
      const monthKey = date.toLocaleDateString('en-CA').slice(0, 7)
      const amount = parseFloat(order.total_amount) || 0

      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + amount
      monthly[monthKey] = (monthly[monthKey] || 0) + amount
      totalRev += amount

      if (order.order_items) {
        order.order_items.forEach(item => {
            const name = item.item_name
            const qty = item.quantity || 1
            itemCounts[name] = (itemCounts[name] || 0) + qty
            
            // Category Stats
            const cat = itemCategoryMap[item.menu_item_id] || 'غير مصنف'
            const itemAmount = (parseFloat(item.price) || 0) * qty
            categoryStats[cat] = (categoryStats[cat] || 0) + itemAmount
            totalItemsSold += qty
        })
      }
    })

    // Fill gaps for Daily Chart
    const dailyData = []
    let daysToGenerate = 30
    if (analyticsRange === '7_days') daysToGenerate = 7
    if (analyticsRange === 'today') daysToGenerate = 1
    
    if (analyticsRange === 'all') {
        Object.keys(dailyMap).sort().forEach(date => {
            dailyData.push({ date, total: dailyMap[date] })
        })
    } else {
        for (let i = daysToGenerate - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(now.getDate() - i)
            const dateStr = d.toLocaleDateString('en-CA')
            dailyData.push({ date: dateStr, total: dailyMap[dateStr] || 0 })
        }
    }

    // 1. Top selling based on actual sales
    const salesBasedItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

    // 2. All items stats (merging current menu with sales data to find 0 sales)
    const allItemsStats = menuItems.map(item => ({
        name: item.name,
        count: itemCounts[item.name] || 0
    })).sort((a, b) => b.count - a.count)

    const totalSales = Object.values(categoryStats).reduce((a, b) => a + b, 0) || 1
    const categorySales = Object.entries(categoryStats)
      .map(([name, value]) => ({ name, value, percentage: (value / totalSales) * 100 }))
      .sort((a, b) => b.value - a.value)

    setAnalyticsData({
      daily: dailyData,
      monthly: Object.entries(monthly).map(([month, total]) => ({ month, total })),
      totalOrders: safeOrdersData.length,
      totalRevenue: totalRev,
      avgOrderValue: safeOrdersData.length > 0 ? (totalRev / safeOrdersData.length) : 0,
      ordersToday: safeOrdersData.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length,
      uniqueCustomers: uniqueCustomersSet.size,
      avgItemsPerOrder: safeOrdersData.length > 0 ? (totalItemsSold / safeOrdersData.length) : 0,
      topItems: salesBasedItems.slice(0, 5),
      bottomItems: allItemsStats.slice(-5).reverse(),
      allItems: allItemsStats,
      categorySales
    })
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    
    if (!restaurant) return

    if (currentPlan?.max_items && menuItems.length >= currentPlan.max_items) {
      alert(`⚠️ وصلت للحد الأقصى! خطتك تسمح بـ ${currentPlan.max_items} صنف فقط.`)
      setActiveTab('plan')
      return
    }
    
    // التحقق من البيانات المعلقة غير المكتملة
    if (newVariant.name && newVariant.price === '') {
      alert('يرجى تحديد سعر للحجم/النوع قبل الحفظ')
      return
    }
    if (newAddon.name && newAddon.price === '') {
      alert('يرجى تحديد سعر للإضافة قبل الحفظ')
      return
    }

    // تضمين الإضافات والأحجام المعلقة في المدخلات
    let finalAddons = [...addons]
    if (newAddon.name && newAddon.price !== '') {
      finalAddons.push({ ...newAddon })
    }

    let finalVariants = [...variants]
    if (newVariant.name && newVariant.price !== '') {
      finalVariants.push({ ...newVariant })
    }

    // ترجمة الوصف تلقائياً
    const translations = await translateText(newItem.description)

    // prepare payload
    const payload = {
      ...newItem,
      ...translations,
      restaurant_id: restaurant.id,
      price: parseFloat(newItem.price)
    }

    // try insert; if DB doesn't have promotion columns, retry without them
    let itemData = null
    let error = null
    try {
      const res = await supabase.from('menu_items').insert([payload]).select()
      itemData = res.data
      error = res.error
    } catch (e) {
      // supabase client may throw in some environments
      console.error('Unexpected error inserting item (throw):', e)
      error = e
    }

    if (error && typeof error === 'object') {
      // inspect error for missing column clues
      const errMsg = (error.message || error.details || JSON.stringify(error)).toLowerCase()
      if (errMsg.includes('has_promotion') || errMsg.includes('promotion_discount') || errMsg.includes('column') && errMsg.includes('does not exist')) {
        console.warn('Promotion columns appear missing in DB. Retrying insert without promotion fields.')
        const fallback = { ...payload }
        delete fallback.has_promotion
        delete fallback.promotion_discount
        try {
          const res2 = await supabase.from('menu_items').insert([fallback]).select()
          itemData = res2.data
          error = res2.error
        } catch (e2) {
          console.error('Unexpected error inserting fallback item (throw):', e2)
          error = e2
        }
        if (!error) {
          alert('تم إضافة الصنف بنجاح (بدون حقول العروض — الرجاء تحديث قاعدة البيانات لاحقاً).')
        }
      }
    }

    if (!error && itemData && finalAddons.length > 0) {
      // ترجمة أسماء الإضافات
      const addonsToInsert = await Promise.all(finalAddons.map(async (addon) => {
        const addonTranslations = await translateText(addon.name)
        return {
          menu_item_id: itemData[0].id,
          name: addon.name,
          name_en: addonTranslations.en,
          name_fr: addonTranslations.fr,
          name_de: addonTranslations.de,
          name_ru: addonTranslations.ru,
          name_ja: addonTranslations.ja,
          price: parseFloat(addon.price) || 0
        }
      }))

      const { error: addonsError } = await supabase
        .from('menu_addons')
        .insert(addonsToInsert)
      
      if (addonsError) console.error('Error adding addons:', addonsError)
    }

    // إضافة الأحجام مع الترجمة
    if (!error && itemData && variants.length > 0) {
      const variantsToInsert = await Promise.all(variants.map(async (variant) => {
        const variantTranslations = await translateText(variant.name)
        return {
          menu_item_id: itemData[0].id,
          name: variant.name,
          name_en: variantTranslations.en,
          name_fr: variantTranslations.fr,
          name_de: variantTranslations.de,
          name_ru: variantTranslations.ru,
          name_ja: variantTranslations.ja,
          price: parseFloat(variant.price),
          is_default: variant.is_default || false
        }
      }))
      
      await supabase.from('item_variants').insert(variantsToInsert)
    }

    if (error) {
      // better logging for debugging
      console.error('Error adding item:', error)
      try {
        // show richer info when available
        const info = error.message || error.details || error.hint || JSON.stringify(error)
        alert('حدث خطأ أثناء إضافة الصنف: ' + info)
      } catch (e) {
        alert('حدث خطأ أثناء إضافة الصنف')
      }
    }

    if (!error) {
      resetForm()
      loadMenuItems(restaurant.id)
    }
  }

  const handleEditItem = async (e) => {
    e.preventDefault()
    
    if (!restaurant) return

    // التحقق من البيانات المعلقة غير المكتملة
    if (newVariant.name && newVariant.price === '') {
      alert('يرجى تحديد سعر للحجم/النوع قبل الحفظ')
      return
    }
    if (newAddon.name && newAddon.price === '') {
      alert('يرجى تحديد سعر للإضافة قبل الحفظ')
      return
    }

    // تضمين الإضافات والأحجام المعلقة في المدخلات
    let finalAddons = [...addons]
    if (newAddon.name && newAddon.price !== '') {
      finalAddons.push({ ...newAddon })
    }

    let finalVariants = [...variants]
    if (newVariant.name && newVariant.price !== '') {
      finalVariants.push({ ...newVariant })
    }

    // ترجمة الوصف تلقائياً إذا تم تعديله
    const translations = await translateText(newItem.description)

    // build update payload and retry without promotion fields if needed
    const updatePayload = {
      name: newItem.name,
      name_en: newItem.name_en,
      name_ja: newItem.name_ja,
      description: newItem.description,
      description_en: translations.en,
      description_ja: translations.ja,
      description_fr: translations.fr,
      description_de: translations.de,
      description_ru: translations.ru,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image_url: newItem.image_url,
      has_promotion: newItem.has_promotion || false,
      promotion_discount: newItem.promotion_discount || null,
      hide_when_available: newItem.hide_when_available || false
    }

    let updError = null
    try {
      const res = await supabase.from('menu_items').update(updatePayload).eq('id', editingItem.id)
      updError = res.error
    } catch (e) {
      console.error('Unexpected error updating item (throw):', e)
      updError = e
    }

    if (updError && typeof updError === 'object') {
      const errMsg = (updError.message || updError.details || JSON.stringify(updError)).toLowerCase()
      if (errMsg.includes('has_promotion') || errMsg.includes('promotion_discount') || (errMsg.includes('column') && errMsg.includes('does not exist'))) {
        console.warn('Promotion columns appear missing in DB. Retrying update without promotion fields.')
        const fallback = { ...updatePayload }
        delete fallback.has_promotion
        delete fallback.promotion_discount
        delete fallback.hide_when_available
        try {
          const res2 = await supabase.from('menu_items').update(fallback).eq('id', editingItem.id)
          updError = res2.error
        } catch (e2) {
          console.error('Unexpected error updating fallback item (throw):', e2)
          updError = e2
        }
      }
    }

    const error = updError

    if (error) {
      console.error('Error updating item:', error)
      alert('حدث خطأ أثناء تحديث الصنف: ' + (error.message || JSON.stringify(error)))
      return
    }

    const { error: deleteAddonsError } = await supabase
      .from('menu_addons')
      .delete()
      .eq('menu_item_id', editingItem.id)

    if (deleteAddonsError) {
      console.error('Error deleting addons:', deleteAddonsError)
    } else if (finalAddons.length > 0) {
      const addonsToInsert = await Promise.all(finalAddons.map(async (addon) => {
        const addonTranslations = await translateText(addon.name)
        return {
          menu_item_id: editingItem.id,
          name: addon.name,
          name_en: addonTranslations.en,
          name_fr: addonTranslations.fr,
          name_de: addonTranslations.de,
          name_ru: addonTranslations.ru,
          name_ja: addonTranslations.ja,
          price: parseFloat(addon.price) || 0
        }
      }))

      const { error: insertAddonsError } = await supabase
        .from('menu_addons')
        .insert(addonsToInsert)
      
      if (insertAddonsError) console.error('Error inserting addons:', insertAddonsError)
    }

    // حذف الأحجام القديمة وإضافة الجديدة
    await supabase
      .from('item_variants')
      .delete()
      .eq('menu_item_id', editingItem.id)

    if (variants.length > 0) {
      const variantsToInsert = await Promise.all(variants.map(async (variant) => {
        const variantTranslations = await translateText(variant.name)
        return {
          menu_item_id: editingItem.id,
          name: variant.name,
          name_en: variantTranslations.en,
          name_fr: variantTranslations.fr,
          name_de: variantTranslations.de,
          name_ru: variantTranslations.ru,
          name_ja: variantTranslations.ja,
          price: parseFloat(variant.price),
          is_default: variant.is_default || false
        }
      }))

      await supabase.from('item_variants').insert(variantsToInsert)
    }

    resetForm()
    loadMenuItems(restaurant.id)
  }

  const startEdit = async (item) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      name_en: item.name_en || '',
      name_ja: item.name_ja || '',
      description: item.description || '',
      description_en: item.description_en || '',
      description_ja: item.description_ja || '',
      description_fr: item.description_fr || '',
      description_de: item.description_de || '',
      description_ru: item.description_ru || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      has_promotion: item.has_promotion || false,
      promotion_discount: item.promotion_discount || '',
      hide_when_available: item.hide_when_available || false
    })

    const { data } = await supabase
      .from('menu_addons')
      .select('*')
      .eq('menu_item_id', item.id)

    // جلب الأحجام
    const { data: variantsData } = await supabase
      .from('item_variants')
      .select('*')
      .eq('menu_item_id', item.id)
    
    setAddons(data || [])
    setVariants(variantsData || [])
    setShowAddForm(true)
  }

  const resetForm = () => {
    setNewItem({
      name: '',
      name_en: '',
      name_ja: '',
      description: '',
      description_en: '',
      description_ja: '',
      price: '',
      category: 'مشروبات',
      image_url: '',
      has_promotion: false,
      promotion_discount: 0,
      hide_when_available: false
    })
    setAddons([])
    setNewAddon({ name: '', price: '' })
    setVariants([])
    setNewVariant({ name: '', price: '' })
    setEditingItem(null)
    setShowAddForm(false)
  }

  const handleDeleteItem = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      if (restaurant) loadMenuItems(restaurant.id)
    }
  }

  const addAddonToList = () => {
    if (newAddon.name && newAddon.price !== '') {
      setAddons([...addons, { ...newAddon, id: Date.now() }])
      setNewAddon({ name: '', price: '' })
    }
  }

  const removeAddon = (id) => {
    setAddons(addons.filter(a => a.id !== id))
  }

  const addVariantToList = () => {
    if (newVariant.name && newVariant.price) {
      setVariants([...variants, { 
        ...newVariant, 
        id: Date.now(),
        is_default: variants.length === 0 
      }])
      setNewVariant({ name: '', price: '' })
    }
  }

  const removeVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const setDefaultVariant = (id) => {
    setVariants(variants.map(v => ({
      ...v,
      is_default: v.id === id
    })))
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    if (restaurant) loadOrders(restaurant.id)
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    // حفظ الحقول الأساسية فقط (الموجودة في قاعدة البيانات)
    const settingsToSave = {
      logo_url: settings.logo_url,
      cover_image_url: settings.cover_image_url,
      working_hours: settings.working_hours,
      is_open: settings.is_open,
      delivery_fee: parseFloat(settings.delivery_fee) || 0
    ,instapay_link: settings.instapay_link || null
    ,instapay_receipt_number: settings.instapay_receipt_number || null
    }

    const { error } = await supabase
      .from('restaurants')
      .update(settingsToSave)
      .eq('id', restaurant.id)
    
    if (!error) {
      // حفظ إعدادات الدفع والواتساب في localStorage
      const paymentSettings = {
        accepts_delivery: settings.accepts_delivery,
        accepts_dine_in: settings.accepts_dine_in,
        accepts_pickup: settings.accepts_pickup,
        accepts_cash: settings.accepts_cash,
        accepts_visa: settings.accepts_visa,
        accepts_instapay: settings.accepts_instapay,
        instapay_link: settings.instapay_link,
        instapay_receipt_number: settings.instapay_receipt_number,
        whatsapp_notifications: settings.whatsapp_notifications,
        whatsapp_number: settings.whatsapp_number
      }
      
      localStorage.setItem(`payment_settings_${restaurant.id}`, JSON.stringify(paymentSettings))
      
      alert('تم حفظ الإعدادات بنجاح! 🎉')
      checkUser()
    } else {
      alert('حدث خطأ أثناء الحفظ: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen text-right font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-800'}`} dir="rtl">
      {notification && (
        <div className="fixed top-4 right-4 max-w-sm z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-orange-300 flex items-start gap-3">
            <span className="text-3xl animate-pulse">🔔</span>
            <div className="flex-1">
              <p className="font-bold text-lg whitespace-pre-line">{notification}</p>
              <p className="text-xs text-orange-100 mt-2">⏰ جديد الآن</p>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="text-white hover:text-orange-100 font-bold text-xl ml-2 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {restaurant?.logo_url && (
              <img 
                src={restaurant.logo_url} 
                alt="Logo" 
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-sm"
              />
            )}
            <h1 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {restaurant?.name || 'لوحة التحكم'}
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all active:scale-95 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <a
              href={`/menu/${restaurant?.id}`}
              target="_blank"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
            >
              عرض المنيو
            </a>
            <button
              onClick={() => setShowQRDownload(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
            >
              📱 QR Code
            </button>
            <button
              onClick={handleLogout}
              className={`px-5 py-2 rounded-xl font-medium transition-all active:scale-95 ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8 flex justify-center">
        <div className={`p-1.5 rounded-2xl shadow-sm border inline-flex flex-wrap gap-2 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          {['menu', 'orders', 'analytics', 'plan', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
              }`}
            >
              {tab === 'menu' && `📋 المنيو (${menuItems.length})`}
              {tab === 'orders' && `🛎️ الطلبات (${orders.filter(o => o.status === 'pending').length})`}
              {tab === 'analytics' && '📊 الإحصائيات'}
              {tab === 'plan' && '💎 الخطة'}
              {tab === 'settings' && '⚙️ الإعدادات'}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               {/* Time Filters */}
               <div className="flex flex-wrap gap-2">
                 {[
                   { id: 'today', label: 'اليوم' },
                   { id: '7_days', label: 'آخر 7 أيام' },
                   { id: '30_days', label: 'آخر 30 يوم' },
                   { id: 'all', label: 'الكل' }
                 ].map(filter => (
                   <button
                     key={filter.id}
                     onClick={() => setAnalyticsRange(filter.id)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                       analyticsRange === filter.id 
                         ? 'bg-slate-800 text-white shadow-md scale-105' 
                         : (darkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-white text-gray-600 hover:bg-gray-100')
                     }`}
                   >
                     {filter.label}
                   </button>
                 ))}
               </div>

               {/* Summary Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المبيعات</h3>
                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">{analyticsData.totalRevenue} ج</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي الإيرادات للفترة المحددة</p>
                  </div>

                  <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>عدد الطلبات</h3>
                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{analyticsData.totalOrders}</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي الطلبات خلال الفترة</p>
                  </div>

                  <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-yellow-400 to-amber-500"></div>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>قيمة الطلب المتوسط</h3>
                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400">{analyticsData.avgOrderValue ? analyticsData.avgOrderValue.toFixed(2) : 0} ج</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>متوسط قيمة الطلب الواحد</p>
                  </div>

                  <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-purple-400 to-purple-600"></div>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>طلبات اليوم</h3>
                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">{analyticsData.ordersToday}</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>عدد الطلبات الواردة اليوم</p>
                  </div>
               </div>

               {/* Daily Sales */}
               <div className={`p-6 rounded-3xl shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                 <div className="flex justify-between items-center mb-6">
                   <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>📈 المبيعات اليومية</h3>
                   <span className={`text-xs font-medium px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}>
                     {analyticsRange === 'today' ? 'اليوم' : analyticsRange === '7_days' ? 'آخر 7 أيام' : analyticsRange === '30_days' ? 'آخر 30 يوم' : 'الكل'}
                   </span>
                 </div>
                 
                 <div className="relative h-80 w-full">
                   {/* Grid lines */}
                   <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12">
                     {[...Array(6)].map((_, i) => (
                       <div key={i} className={`border-b border-dashed w-full h-0 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}></div>
                     ))}
                   </div>

                   {/* Bars Container */}
                   <div className="absolute inset-0 overflow-x-auto pb-2">
                     <div className="h-full flex items-end gap-3 px-2 pb-12 min-w-full w-max">
                     {analyticsData.daily.length > 0 ? analyticsData.daily.map((day, index) => {
                       const maxVal = Math.max(...analyticsData.daily.map(d => d.total)) || 1
                       const heightPercent = (day.total / maxVal) * 90
                       
                       return (
                         <div key={index} className="flex-1 min-w-[40px] flex flex-col justify-end items-center group relative h-full">
                           {/* Tooltip */}
                           <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-gray-900 text-white text-xs font-bold rounded py-1 px-3 whitespace-nowrap z-20 pointer-events-none shadow-lg">
                             {day.total} ج
                             <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                           </div>
                           
                           {/* Value Label */}
                           <span 
                             className={`absolute text-[10px] font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}
                             style={{ bottom: heightPercent === 0 ? '4px' : `${heightPercent}%` }}
                           >
                             {day.total > 0 ? day.total : ''}
                           </span>

                           {/* Bar */}
                           <div 
                              className={`w-full max-w-[40px] rounded-t-md transition-all duration-700 ease-out relative overflow-hidden ${
                                heightPercent === 0 ? (darkMode ? 'bg-slate-700 h-1' : 'bg-gray-50 h-1') : 'bg-gradient-to-t from-orange-500 to-orange-400 group-hover:from-orange-600 group-hover:to-orange-500 shadow-sm'
                              }`}
                              style={{ height: heightPercent === 0 ? '4px' : `${heightPercent}%` }}
                           ></div>
                           
                           {/* Date Label */}
                           <span className="absolute top-full mt-2 text-[10px] text-gray-400 rotate-45 origin-left whitespace-nowrap font-medium left-1/2 transform -translate-x-1/2">
                             {day.date.slice(5).replace('-', '/')}
                           </span>
                         </div>
                       )
                     }) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                         لا توجد بيانات لعرضها
                       </div>
                     )}
                     </div>
                 </div>
               </div>
             </div>

               {/* Monthly Sales */}
               <div className={`p-6 rounded-3xl shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                 <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>المبيعات الشهرية</h3>
                 <div className="space-y-3">
                   {analyticsData.monthly.map((month) => (
                     <div key={month.month} className="flex items-center gap-4 min-w-0">
                       <span className={`w-20 text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{month.month}</span>
                       <div className={`flex-1 min-w-0 rounded-full h-4 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                         <div 
                           className="bg-green-500 h-full" 
                           style={{ width: `${(month.total / (Math.max(...analyticsData.monthly.map(m=>m.total)) || 1)) * 100}%` }}
                         ></div>
                       </div>
                       <span className={`w-24 text-sm font-bold text-right truncate ${darkMode ? 'text-white' : 'text-black'}`}>{month.total} ج</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Category Distribution Pie Chart */}
               <div className={`p-6 rounded-3xl shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                 <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>توزيع المبيعات حسب القسم</h3>
                 <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                   <div className="relative w-48 h-48 rounded-full flex-shrink-0 shadow-lg" style={{
                     background: `conic-gradient(${analyticsData.categorySales.length > 0 ? analyticsData.categorySales.map((cat, i) => {
                       const start = analyticsData.categorySales.slice(0, i).reduce((sum, c) => sum + c.percentage, 0)
                       const end = start + cat.percentage
                       const color = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'][i % 8]
                       return `${color} ${start}% ${end}%`
                     }).join(', ') : '#e5e7eb 0% 100%'})`
                   }}>
                     <div className={`absolute inset-0 m-10 rounded-full flex items-center justify-center shadow-inner ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                       <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>المبيعات</span>
                     </div>
                   </div>
                   
                   <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {analyticsData.categorySales.map((cat, i) => (
                       <div key={cat.name} className="flex items-center gap-2 text-sm">
                         <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'][i % 8] }}></span>
                         <span className={`truncate flex-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{cat.name}</span>
                         <span className="font-bold">{cat.percentage.toFixed(1)}%</span>
                       </div>
                     ))}
                     {analyticsData.categorySales.length === 0 && <p className="text-gray-500">لا توجد بيانات</p>}
                   </div>
                 </div>
               </div>

               {/* Top & Bottom Items */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-6 rounded-3xl shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <h3 className="font-bold mb-4 text-green-700 flex items-center gap-2">🏆 الأكثر مبيعاً</h3>
                    <div className="space-y-3">
                      {analyticsData.topItems.length > 0 ? analyticsData.topItems.map((item, i) => (
                        <div key={i} className={`flex justify-between items-center border-b pb-2 last:border-0 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>{item.count} طلب</span>
                        </div>
                      )) : <p className="text-gray-500 text-sm">لا توجد بيانات</p>}
                    </div>
                  </div>

                  <div className={`p-6 rounded-3xl shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <h3 className="font-bold mb-4 text-red-700 flex items-center gap-2">📉 الأقل مبيعاً</h3>
                    <div className="space-y-3">
                      {analyticsData.bottomItems.length > 0 ? analyticsData.bottomItems.map((item, i) => (
                        <div key={i} className={`flex justify-between items-center border-b pb-2 last:border-0 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>{item.count} طلب</span>
                        </div>
                      )) : <p className="text-gray-500 text-sm">لا توجد بيانات</p>}
                    </div>
                  </div>
               </div>
            </div>

            {/* Side List */}
            <div className={`p-6 rounded-3xl shadow-lg h-fit lg:sticky lg:top-24 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
               <h3 className={`font-bold mb-4 text-lg border-b pb-2 ${darkMode ? 'text-white border-slate-700' : 'text-gray-900 border-gray-100'}`}>📦 كل الأصناف</h3>
               <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                 {analyticsData.allItems.map((item, i) => (
                   <div key={i} className={`flex justify-between items-center p-2 rounded-xl transition ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}>
                     <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{item.name}</span>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-800'}`}>{item.count}</span>
                   </div>
                 ))}
                 {analyticsData.allItems.length === 0 && <p className="text-gray-500 text-center">لا توجد أصناف</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && <PlanManagement restaurant={restaurant} onUpdate={() => checkUser()} darkMode={darkMode} />}

        {activeTab === 'menu' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
              >
                {showAddForm ? 'إلغاء' : '+ إضافة صنف جديد'}
              </button>
            </div>

            {showAddForm && (
              <div className={`rounded-3xl shadow-xl border p-8 mb-8 animate-fade-in ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <form onSubmit={editingItem ? handleEditItem : handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="اسم الصنف (عربي)" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} required />
                    <input type="text" placeholder="اسم الصنف (English)" value={newItem.name_en} onChange={(e) => setNewItem({...newItem, name_en: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} />
                    <input type="text" placeholder="اسم الصنف (日本語)" value={newItem.name_ja} onChange={(e) => setNewItem({...newItem, name_ja: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} />
                    <input type="number" step="0.01" placeholder="السعر" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} required />
                    <div className="flex flex-col gap-2">
                      <input type="url" placeholder="رابط الصورة الرئيسية" value={newItem.image_url} onChange={(e) => setNewItem({...newItem, image_url: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} />
                      {newItem.image_url && (
                        <img src={newItem.image_url} alt="Preview" className="w-full h-32 object-cover rounded-xl bg-gray-100" />
                      )}
                    </div>
                    <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}>
                      <option>مشروبات</option>
                      <option>أطباق رئيسية</option>
                      <option>مقبلات</option>
                      <option>حلويات</option>
                    </select>
                    <textarea placeholder="الوصف (عربي)" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className={`px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} />
                  </div>

                  {/* قسم الإضافات */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>الإضافات (اختياري)</h4>
                    <p className="text-sm text-gray-500 mb-2">ضع السعر 0 لتكون الإضافة مجانية</p>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="اسم الإضافة (مثال: جبنة زيادة)" value={newAddon.name} onChange={(e) => setNewAddon({...newAddon, name: e.target.value})} className={`flex-1 px-4 py-2 border rounded-xl outline-none transition ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} />
                      <input type="number" placeholder="السعر (0 = مجاني)" value={newAddon.price} onChange={(e) => setNewAddon({...newAddon, price: e.target.value})} className={`w-32 px-4 py-2 border rounded-xl outline-none transition ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`} />
                      <button type="button" onClick={addAddonToList} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">إضافة</button>
                    </div>
                    <div className="space-y-2">
                      {addons.map(addon => (
                        <div key={addon.id} className={`flex justify-between p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                          <span className={darkMode ? 'text-white' : 'text-black'}>{addon.name} - {parseFloat(addon.price) === 0 ? 'مجاني' : `${addon.price} ج`}</span>
                          <button type="button" onClick={() => removeAddon(addon.id)} className="text-red-600">حذف</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-3">الأحجام / الأنواع</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="الحجم (مثال: صغير، وسط، كبير)"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                        className={`flex-1 px-4 py-2 border rounded-xl outline-none transition ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="السعر"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                        className={`w-32 px-4 py-2 border rounded-xl outline-none transition ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                      />
                      <button
                        type="button"
                        onClick={addVariantToList}
                        className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
                      >
                        إضافة
                      </button>
                    </div>

                    {variants.length > 0 && (
                      <div className="space-y-2">
                        {variants.map((variant) => (
                          <div key={variant.id} className={`flex justify-between items-center p-3 rounded-xl border ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="defaultVariant"
                                checked={variant.is_default}
                                onChange={() => setDefaultVariant(variant.id)}
                                className="w-4 h-4"
                              />
                              <div>
                                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>{variant.name}</span>
                                <span className={`ml-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{variant.price} ج</span>
                                {variant.is_default && (
                                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded ml-2">
                                    افتراضي
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(variant.id)}
                              className="text-red-600"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {variants.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 اختر الحجم الافتراضي الذي سيظهر أولاً للعميل
                      </p>
                    )}
                  </div>

                  {/* قسم العروض والخصم */}
                  <div className="border-t pt-4">
                    <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>🔥 العروض والخصم (اختياري)</h4>
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="hasPromo"
                        checked={newItem.has_promotion || false}
                        onChange={(e) => setNewItem({...newItem, has_promotion: e.target.checked, promotion_discount: e.target.checked ? newItem.promotion_discount : 0})}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="hasPromo" className={`font-bold cursor-pointer ${darkMode ? 'text-white' : 'text-black'}`}>
                        تفعيل عرض خاص على هذا الصنف
                      </label>
                    </div>
                    
                    {newItem.has_promotion && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <label className={`block font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>نسبة الخصم (%)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="مثال: 20 (للخصم 20%)"
                            value={newItem.promotion_discount || 0}
                            onChange={(e) => setNewItem({...newItem, promotion_discount: parseInt(e.target.value) || 0})}
                            className={`flex-1 px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-red-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'}`}
                          />
                          {newItem.promotion_discount && parseFloat(newItem.promotion_discount) > 0 && (
                            <div className={`px-4 py-3 rounded-xl font-bold text-lg whitespace-nowrap ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                              خصم {newItem.promotion_discount}%
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <label className={`inline-flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-black'}`}>
                            <input type="checkbox" checked={newItem.hide_when_available || false} onChange={(e) => setNewItem({...newItem, hide_when_available: e.target.checked})} className="w-4 h-4" />
                            <span className="font-medium">إخفاء هذا الصنف عند توافره</span>
                          </label>
                        </div>
                        {newItem.promotion_discount && parseFloat(newItem.promotion_discount) > 0 && (
                          <p className={`mt-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            السعر بعد الخصم: <span className="font-bold">{(parseFloat(newItem.price) * (100 - parseFloat(newItem.promotion_discount)) / 100).toFixed(2)} ج</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95">حفظ التغييرات</button>
                </form>
              </div>
            )}

            <div className={`rounded-3xl shadow-xl border p-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>قائمة الطعام</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className={`group relative rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} border border-transparent hover:border-orange-100`}>
                    <div className={`w-full h-48 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl text-gray-300">🍽️</span>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.name}
                        {item.hide_when_available && (
                          <span className="mr-2 inline-block px-2 py-1 text-xs font-bold rounded-lg bg-gray-200 text-gray-700 ml-3">مخفي عند التوافر</span>
                        )}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${darkMode ? 'bg-slate-700 text-white' : 'bg-orange-50 text-orange-700'}`}>{item.price} ج</span>
                    </div>
                    
                    {item.has_promotion && item.promotion_discount && (
                      <div className="bg-red-100 border-2 border-red-500 rounded-xl p-2 mb-2 text-center">
                        <p className="text-red-700 font-bold">🔥 عرض {item.promotion_discount}% خصم</p>
                        <p className="text-red-600 text-sm">السعر الجديد: {(parseFloat(item.price) * (100 - parseFloat(item.promotion_discount)) / 100).toFixed(2)} ج</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.menu_item_variants?.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          📏 {item.menu_item_variants.length} أحجام
                        </span>
                      )}
                      {item.menu_addons?.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                          ➕ {item.menu_addons.length} إضافات
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => startEdit(item)} className={`flex-1 border py-2 rounded-xl transition font-medium text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        ✏️ تعديل
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-xl hover:bg-red-100 transition font-medium text-sm">
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className={`rounded-3xl shadow-xl border p-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>الطلبات</h3>
              <button 
                onClick={() => {
                  const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3')
                  audio.play().catch(e => console.log('Audio play failed', e))
                  setNotification('🔔 تجربة إشعار: طلب جديد بقيمة 00 ج')
                  setTimeout(() => setNotification(null), 5000)
                }}
                className={`text-sm px-4 py-2 rounded-xl font-medium ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                🔔 تجربة الإشعار
              </button>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`rounded-3xl p-6 transition-all hover:shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} border border-transparent ${order.status === 'pending' ? 'shadow-orange-100 border-r-4 border-r-orange-500' : 'shadow-green-100 border-r-4 border-r-green-500'}`}>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className={`font-bold text-xl mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{order.customer_name}</h4>
                       <div className={`text-sm mt-1 space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                         <p className="flex items-center gap-2">📞 {order.customer_phone}</p>
                         <p className="flex items-center gap-2 font-medium">
                           {order.order_type === 'delivery' ? <span className="text-blue-600">🚗 توصيل</span> : 
                            order.order_type === 'pickup' ? <span className="text-purple-600">🏪 استلام من الفرع</span> : 
                            <span className="text-green-600">🍽️ محلي (داخل المطعم)</span>}
                         </p>
                         {order.order_type === 'dine-in' && order.table_number && (
                           <p className="text-orange-600 font-bold">طاولة رقم: {order.table_number}</p>
                         )}
                         {order.order_type === 'delivery' && order.delivery_address && (
                           <p className={darkMode ? 'text-gray-300' : 'text-gray-800'}>📍 {order.delivery_address}</p>
                         )}
                         {order.notes && (
                           <div className="mt-2 bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-gray-800">
                             <span className="font-bold">📝 تفاصيل / ملاحظات:</span> {order.notes}
                           </div>
                         )}
                       </div>
                     </div>
                     <span className="font-bold text-orange-600 text-xl">{order.total_amount} ج</span>
                   </div>

                   {/* حالة الدفع */}
                   {order.payment_method === 'instapay' && (
                     <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3">
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold text-purple-900">💳 دفع InstaPay</p>
                           <p className="text-sm text-purple-700">
                             {order.payment_status === 'pending_verification' && '⏳ في انتظار التحقق'}
                             {order.payment_status === 'paid' && '✅ تم التحقق'}
                           </p>
                         </div>
                         {order.payment_status === 'pending_verification' && (
                           <button
                             onClick={async () => {
                               await supabase
                                 .from('orders')
                                 .update({ payment_status: 'paid' })
                                 .eq('id', order.id)
                               loadOrders(restaurant.id)
                             }}
                             className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700"
                           >
                             ✓ تأكيد الدفع
                           </button>
                         )}
                       </div>
                     </div>
                   )}

                   {/* عرض طريقة الدفع */}
                   {order.payment_method && order.payment_method !== 'instapay' && (
                     <div className={`mb-3 p-3 border rounded-xl ${darkMode ? 'bg-blue-950 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                       <p className={`text-sm font-bold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                         {order.payment_method === 'cash' && '💵 طريقة الدفع: الدفع عند الاستلام (كاش)'}
                         {order.payment_method === 'visa' && '💳 طريقة الدفع: الدفع عبر Visa/Mastercard (عند الاستلام)'}
                       </p>
                     </div>
                   )}

                   {/* عرض تفاصيل الأصناف */}
                   <div className={`border-t pt-3 mb-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                     <h5 className={`font-bold text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>تفاصيل الطلب:</h5>
                     <div className="space-y-2">
                       {order.order_items && order.order_items.map((item, idx) => (
                         <div key={idx} className={`flex justify-between items-start p-3 rounded-xl text-sm ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                           <div>
                             <span className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{item.quantity}x {item.item_name}</span>
                             {item.addons && item.addons.length > 0 && (
                               <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>+ {item.addons.map(a => a.name).join(', ')}</div>
                             )}
                           </div>
                           <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.price} ج</span>
                         </div>
                       ))}
                     </div>
                   </div>

                   {restaurant?.whatsapp_number && (
                     <button
                       onClick={() => {
                         const orderData = {
                           customer_name: order.customer_name,
                           customer_phone: order.customer_phone,
                           order_type: order.order_type,
                           table_number: order.table_number,
                           delivery_address: order.delivery_address,
                           total_amount: order.total_amount,
                           payment_method: order.payment_method,
                           notes: order.notes
                         }
                         
                         const items = order.order_items?.map(item => ({
                           name: item.item_name,
                           totalPrice: item.price,
                           selectedAddons: item.addons || []
                         })) || []
                         
                         // تحميل إعدادات الواتساب من localStorage
                         let whatsappSettings = {}
                         try {
                           const saved = localStorage.getItem(`payment_settings_${restaurant.id}`)
                           if (saved) {
                             whatsappSettings = JSON.parse(saved)
                           }
                         } catch (e) {
                           console.error('Error loading WhatsApp settings:', e)
                         }

                         const restaurantWithWhatsApp = {
                           ...restaurant,
                           whatsapp_notifications: whatsappSettings.whatsapp_notifications ?? restaurant.whatsapp_notifications,
                           whatsapp_number: whatsappSettings.whatsapp_number ?? restaurant.whatsapp_number
                         }
                         
                         notifyRestaurantOwner(restaurantWithWhatsApp, orderData, items)
                       }}
                       className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 mt-2 font-bold"
                     >
                       <span>📱</span>
                       إرسال إشعار WhatsApp
                     </button>
                   )}
                   
                   {order.is_split && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3 mt-2">
                      <h5 className="font-semibold mb-2">💰 فاتورة مقسمة ({order.split_count} أشخاص)</h5>
                      <button
                        onClick={async () => {
                          const { data } = await supabase
                            .from('bill_splits')
                            .select('*')
                            .eq('order_id', order.id)
                          
                          alert(data.map(s => `${s.participant_name}: ${s.amount} ج`).join('\n'))
                        }}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  )}

                  {order.latitude && order.longitude && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 mt-2">
                      <p className="text-sm font-semibold mb-2">📍 موقع التوصيل:</p>
                      <p className="text-sm text-gray-700 mb-2">{order.location_name}</p>
                      <a
                        href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        فتح في خرائط جوجل →
                      </a>
                    </div>
                  )}

                  {/* عرض التقييم */}
                  {order.rating && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-yellow-800">التقييم:</span>
                        <div className="flex text-yellow-500 text-lg">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < order.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      {order.rating_feedback && (
                        <p className="text-sm text-gray-700 italic">"{order.rating_feedback}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className={`rounded-3xl shadow-xl border p-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>إعدادات المطعم</h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>رابط الشعار (Logo)</label>
                  <input
                    type="url"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({...settings, logo_url: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                    placeholder="https://example.com/logo.png"
                  />
                  {settings.logo_url && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-white">
                        <img 
                          src={settings.logo_url} 
                          alt="Logo Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* صورة الغلاف */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>صورة الغلاف (Header)</label>
                  <input
                    type="url"
                    value={settings.cover_image_url}
                    placeholder="https://example.com/cover.jpg"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                    onChange={(e) => setSettings({...settings, cover_image_url: e.target.value})}
                  />
                  {settings.cover_image_url && (
                    <div
                      aria-hidden
                      className="mt-3 w-full h-40 border rounded-xl bg-center bg-no-repeat bg-cover"
                      style={{ backgroundImage: `url(${settings.cover_image_url})` }}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    💡 يُفضل صورة بأبعاد 1200x400 بكسل
                  </p>
                </div>

                {/* مواعيد العمل */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>مواعيد العمل</label>
                  <input
                    type="text"
                    value={settings.working_hours}
                    placeholder="من 10 صباحاً حتى 12 منتصف الليل"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                    onChange={(e) => setSettings({...settings, working_hours: e.target.value})}
                  />
                </div>

                {/* حالة المطعم */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_open"
                    checked={settings.is_open}
                    onChange={(e) => setSettings({...settings, is_open: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <label htmlFor="is_open" className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-black'}`}>المطعم مفتوح الآن</label>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>رسوم التوصيل</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.delivery_fee}
                    onChange={(e) => setSettings({...settings, delivery_fee: parseFloat(e.target.value)})}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                  />
                </div>

                {/* WhatsApp Notifications Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>📱 إشعارات WhatsApp</h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="whatsapp_notifications"
                      checked={settings.whatsapp_notifications}
                      onChange={(e) => setSettings({...settings, whatsapp_notifications: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="whatsapp_notifications" className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-black'}`}>
                      تفعيل إرسال تفاصيل الطلب تلقائياً للواتساب
                    </label>
                  </div>

                  {settings.whatsapp_notifications && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>
                        رقم الواتساب (مع كود الدولة)
                      </label>
                      <input
                        type="tel"
                        value={settings.whatsapp_number}
                        placeholder="201xxxxxxxxx"
                        className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                        onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        سيتم إرسال رسالة بتفاصيل الطلب لهذا الرقم عند تأكيد أي طلب جديد
                      </p>
                    </div>
                  )}
                </div>

                {/* Visa/Mastercard Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>💳 إعدادات طرق الدفع الأخرى</h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="accepts_visa"
                      checked={settings.accepts_visa}
                      onChange={(e) => setSettings({...settings, accepts_visa: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="accepts_visa" className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-black'}`}>تفعيل الدفع عبر Visa / Mastercard (عند الاستلام)</label>
                  </div>
                </div>

                {/* InstaPay Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>💳 إعدادات InstaPay</h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="accepts_instapay"
                      checked={settings.accepts_instapay}
                      onChange={(e) => setSettings({...settings, accepts_instapay: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="accepts_instapay" className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-black'}`}>تفعيل الدفع بـ InstaPay</label>
                  </div>

                  {/* Removed InstaPay username and phone inputs per request. Receipt number field remains below. */}
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>رقم استقبال إيصالات التحويل (ليرسل الزبائن إيصال التحويل إليه)</label>
                    <input
                      type="tel"
                      value={settings.instapay_receipt_number}
                      placeholder="01xxxxxxxxx"
                      onChange={(e) => setSettings({...settings, instapay_receipt_number: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">سيظهر هذا الرقم في صفحة الدفع لتوجيه الزبائن لإرسال صورة إيصال التحويل.</p>
                  </div>

                  {settings.accepts_instapay && (!settings.instapay_username || !settings.instapay_phone) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ يرجى إدخال بيانات InstaPay لتفعيل الدفع الإلكتروني
                      </p>
                    </div>
                  )}
                  
                  {/* InstaPay direct link */}
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>رابط الدفع المباشر (InstaPay link)</label>
                    <input
                      type="url"
                      value={settings.instapay_link}
                      placeholder="https://pay.instapay/..."
                      onChange={(e) => setSettings({...settings, instapay_link: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">إذا أدخلت رابط الدفع، سيُفتح مباشرة من صفحة المنيو عند اختيار InstaPay.</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>{t.paymentMethod}</h4>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="cash"
                      checked={settings.accepts_cash !== false}
                      onChange={(e) => setSettings({...settings, accepts_cash: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="cash" className={darkMode ? 'text-gray-300' : 'text-black'}>{t.cash}</label>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="visa"
                      checked={settings.accepts_visa}
                      onChange={(e) => setSettings({...settings, accepts_visa: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="visa" className={darkMode ? 'text-gray-300' : 'text-black'}>{t.visa}</label>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="instapay"
                      checked={settings.accepts_instapay}
                      onChange={(e) => setSettings({...settings, accepts_instapay: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="instapay" className={darkMode ? 'text-gray-300' : 'text-black'}>{t.instapay}</label>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>أنواع الطلبات</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="delivery"
                    checked={settings.accepts_delivery}
                    onChange={(e) => setSettings({...settings, accepts_delivery: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <label htmlFor="delivery" className={darkMode ? 'text-gray-300' : 'text-black'}>قبول طلبات التوصيل</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dinein"
                    checked={settings.accepts_dine_in}
                    onChange={(e) => setSettings({...settings, accepts_dine_in: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <label htmlFor="dinein" className={darkMode ? 'text-gray-300' : 'text-black'}>قبول طلبات داخل المطعم</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pickup"
                    checked={settings.accepts_pickup !== false}
                    onChange={(e) => setSettings({...settings, accepts_pickup: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <label htmlFor="pickup" className={darkMode ? 'text-gray-300' : 'text-black'}>قبول طلبات الاستلام من الفرع</label>
                </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95">
                  حفظ التغييرات
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Download Modal */}
      {showQRDownload && restaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">QR Code مطعمك 📱</h3>
              <button onClick={() => setShowQRDownload(false)} className="text-gray-500 hover:text-gray-700 text-3xl">×</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-center">
              <div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-xl mb-4">
                  {restaurant.qr_code_url ? (
                    <img src={restaurant.qr_code_url} alt="QR Code" className="w-full max-w-xs mx-auto" />
                  ) : (
                    <QRCodeCanvas
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${restaurant.id}`}
                      size={300}
                      level="H"
                      includeMargin={true}
                      className="mx-auto"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <a
                    href={restaurant.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/menu/' + restaurant.id)}`}
                    download={`${restaurant.name}-QR.png`}
                    target="_blank"
                    className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    📥 تحميل QR (PNG)
                  </a>
                  
                  <button
                    onClick={() => {
                      const qrUrl = restaurant.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/menu/' + restaurant.id)}`
                      window.open(qrUrl, '_blank')
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                  >
                    🖨️ فتح للطباعة
                  </button>
                </div>
              </div>

              <div className="text-right space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3">📌 كيفية الاستخدام:</h4>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li>1️⃣ حمّل الـ QR Code</li>
                    <li>2️⃣ اطبعه على ورق لامع</li>
                    <li>3️⃣ ضعه على طاولات المطعم</li>
                    <li>4️⃣ العملاء يمسحونه!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Small animated number counter (no external deps)
function CountUp({ value = 0, duration = 800, formatter = v => v }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = null
    const from = 0
    const to = Number(value) || 0
    if (to === 0) {
      setDisplay(0)
      return
    }
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const current = Math.floor(from + (to - from) * progress)
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{formatter(display)}</>
}

// Simple responsive animated SVG Line Chart (uses analytics.daily)
function LineChart({ data = [], height = 140, stroke = '#FB923C' }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // trigger animation when data changes
    setReady(false)
    const t = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(t)
  }, [data])

  if (!data || data.length === 0) return (
    <div className="w-full h-36 flex items-center justify-center text-gray-500">لا توجد بيانات</div>
  )

  const values = data.map(d => Number(d.total) || 0)
  const max = Math.max(...values) || 1
  const width = Math.max(300, data.length * 40)
  const stepX = width / (data.length - 1 || 1)

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - (v / max) * (height - 20)
    return [x, y]
  })

  const pathD = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  const dashLen = 1000

  return (
    <div className="overflow-x-auto w-full">
      <svg width={width} height={height} className="block mx-auto">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* area fill */}
        <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill="url(#g1)" opacity="0.6" />
        {/* animated line */}
        <path
          d={pathD}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'stroke-dashoffset 900ms ease', strokeDasharray: dashLen, strokeDashoffset: ready ? 0 : dashLen }}
        />
        {/* points */}
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#fff" stroke={stroke} strokeWidth={2} style={{ transformOrigin: `${p[0]}px ${p[1]}px`, transform: ready ? 'scale(1)' : 'scale(0)', transition: `transform 300ms ${i * 60}ms ease` }} />
        ))}
      </svg>
    </div>
  )
}