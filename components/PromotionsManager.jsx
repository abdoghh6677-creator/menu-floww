'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PromotionsManager({ restaurant }) {
  const [promotions, setPromotions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(null) // تتبع الإجراء الجاري
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    code: '',
    image_url: '',
    discount_percentage: '',
    discount_text: '',
    start_date: '',
    end_date: '',
    display_duration: 5,
    is_active: true,
    price: '',
    available_for: 'all'
  })

  useEffect(() => {
    if (restaurant?.id) {
      loadPromotions()
    }
  }, [restaurant?.id])

  const loadPromotions = async () => {
    if (!restaurant?.id) return
    
    console.log('📥 Loading promotions for restaurant:', restaurant.id)
    try {
      // مسح الـ cache لضمان جلب البيانات الحديثة
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading promotions:', error)
      } else {
        console.log('✅ Loaded', data?.length || 0, 'promotions:', data)
        setPromotions(data || [])
      }
    } catch (err) {
      console.error('❌ Exception loading promotions:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // تجهيز البيانات بشكل آمن لتجنب أخطاء قاعدة البيانات
    const promoData = {
      restaurant_id: restaurant.id,
      title: formData.title,
      title_en: formData.title_en,
      description: formData.description,
      description_en: formData.description_en,
      code: formData.code || null,
      image_url: formData.image_url,
      discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
      discount_text: formData.discount_text,
      price: formData.price ? parseFloat(formData.price) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      display_duration: parseInt(formData.display_duration) || 5,
      is_active: formData.is_active
      // تم استبعاد available_for لأنه غير موجود في قاعدة البيانات حالياً ويسبب فشل الحفظ
    }

    let error = null

    if (editing) {
      const { error: err } = await supabase
        .from('promotions')
        .update(promoData)
        .eq('id', editing.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('promotions')
        .insert([promoData])
      error = err
    }

    if (error) {
      console.error('Error saving promotion:', error)
      alert('حدث خطأ أثناء حفظ العرض: ' + (error.message || JSON.stringify(error)))
      return
    }

    resetForm()
    loadPromotions()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      code: '',
      image_url: '',
      discount_percentage: '',
      discount_text: '',
      start_date: '',
      end_date: '',
      display_duration: 5,
      is_active: true,
      price: '',
      available_for: 'all'
    })
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (promo) => {
    setEditing(promo)
    setFormData({
      title: promo.title,
      title_en: promo.title_en || '',
      description: promo.description || '',
      description_en: promo.description_en || '',
      code: promo.code || '',
      image_url: promo.image_url || '',
      discount_percentage: promo.discount_percentage || '',
      discount_text: promo.discount_text || '',
      start_date: promo.start_date || '',
      end_date: promo.end_date || '',
      display_duration: promo.display_duration || 5,
      is_active: promo.is_active,
      price: promo.price || '',
      available_for: promo.available_for || 'all'
    })
    setShowForm(true)
  }

  const deletePromotion = async (id) => {
    if (actionInProgress) {
      console.log('⏳ العملية السابقة لم تكتمل بعد')
      return
    }

    if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      console.log('🗑️ Deleting promotion:', id)
      setActionInProgress(`delete-${id}`)
      
      // حذف فوري من الـ UI
      const oldPromotions = promotions
      setPromotions(prev => prev.filter(p => p.id !== id))
      console.log('✅ Promotion removed from UI immediately')
      
      try {
        // حذف من قاعدة البيانات
        const { error } = await supabase
          .from('promotions')
          .delete()
          .eq('id', id)
        
        if (error) {
          console.error('❌ Error deleting promotion:', error)
          // إرجاع العرض إذا فشل الحذف
          setPromotions(oldPromotions)
          alert('حدث خطأ أثناء الحذف: ' + error.message)
          return
        }

        console.log('✅ Promotion deleted successfully from DB')
        // لا نعيد تحميل البيانات - العرض محذوف بالفعل
        
      } catch (err) {
        console.error('❌ Exception deleting promotion:', err)
        // إرجاع العرض إذا فشل الحذف
        setPromotions(oldPromotions)
        alert('حدث خطأ: ' + err.message)
      } finally {
        setActionInProgress(null)
      }
    }
  }

  const toggleActive = async (promo) => {
    if (actionInProgress) {
      console.log('⏳ العملية السابقة لم تكتمل بعد')
      return
    }

    console.log('🔄 Toggling promotion status:', promo.id, 'from', promo.is_active, 'to', !promo.is_active)
    setActionInProgress(`toggle-${promo.id}`)
    
    const newStatus = !promo.is_active
    const oldPromotions = promotions
    
    try {
      // تحديث فوري في الـ UI
      setPromotions(prev => 
        prev.map(p => p.id === promo.id ? { ...p, is_active: newStatus } : p)
      )
      console.log('✅ Promotion status updated in UI immediately:', newStatus)
      
      // تحديث في قاعدة البيانات
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: newStatus })
        .eq('id', promo.id)
      
      if (error) {
        console.error('❌ Error updating promotion:', error)
        // إرجاع الحالة القديمة إذا فشل التحديث
        setPromotions(oldPromotions)
        alert('حدث خطأ أثناء تحديث الحالة: ' + error.message)
        return
      }

      console.log('✅ Promotion status updated successfully in DB')
      // لا نعيد تحميل البيانات - الحالة محدثة بالفعل
      
    } catch (err) {
      console.error('❌ Exception updating promotion:', err)
      // إرجاع الحالة القديمة إذا فشل التحديث
      setPromotions(oldPromotions)
      alert('حدث خطأ: ' + err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code: result })
  }

  return (
    <div className="space-y-6">
      {/* زر إضافة عرض */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">العروض الترويجية 🎁</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          {showForm ? 'إلغاء' : '+ إضافة عرض جديد'}
        </button>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-bold mb-4">
            {editing ? 'تعديل العرض' : 'عرض جديد'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">عنوان العرض (عربي) *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="خصم 50٪ على كل الوجبات!"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">عنوان العرض (English)</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="50% OFF on all meals!"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">كود الخصم (اختياري)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                    placeholder="مثال: SAVE20"
                  />
                  <button type="button" onClick={generateCode} className="bg-gray-200 px-3 rounded-lg text-sm hover:bg-gray-300">
                    توليد
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">نسبة الخصم (%)</label>
                <input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">متاح لـ</label>
                <select
                  value={formData.available_for}
                  onChange={(e) => setFormData({...formData, available_for: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="all">الكل (توصيل وداخل المطعم)</option>
                  <option value="delivery">توصيل فقط 🛵</option>
                  <option value="dine-in">داخل المطعم فقط 🍽️</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">نص العرض</label>
                <input
                  type="text"
                  value={formData.discount_text}
                  onChange={(e) => setFormData({...formData, discount_text: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="اشترِ 2 واحصل على 1 مجاناً"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">تاريخ البداية</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">تاريخ النهاية</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">مدة العرض (ثواني)</label>
                <input
                  type="number"
                  value={formData.display_duration}
                  onChange={(e) => setFormData({...formData, display_duration: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="3"
                  max="15"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5"
                />
                <label htmlFor="is_active" className="font-medium">العرض مفعّل</label>
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-2">رابط الصورة</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">الوصف (عربي)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows="2"
                placeholder="تفاصيل العرض..."
              />
            </div>

            <div>
              <label className="block font-medium mb-2">الوصف (English)</label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows="2"
                placeholder="Promotion details..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editing ? 'حفظ التعديلات' : 'إضافة العرض'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة العروض */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">لا توجد عروض بعد</p>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {promo.image_url && (
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold">{promo.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    promo.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {promo.is_active ? '✓ مفعّل' : '✗ غير مفعّل'}
                  </span>
                </div>

                {promo.code && (
                  <div className="mb-2">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded font-mono text-sm tracking-wider border-2 border-dashed border-gray-400">
                      CODE: {promo.code}
                    </span>
                  </div>
                )}

                {promo.discount_percentage && (
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full inline-block mb-2">
                    خصم {promo.discount_percentage}%
                  </div>
                )}

                {promo.discount_text && (
                  <p className="text-sm text-gray-700 mb-2">🎁 {promo.discount_text}</p>
                )}

                {promo.available_for && promo.available_for !== 'all' && (
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${promo.available_for === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {promo.available_for === 'delivery' ? '🛵 توصيل فقط' : '🍽️ داخل المطعم فقط'}
                    </span>
                  </div>
                )}

                {promo.description && (
                  <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                )}

                {(promo.start_date || promo.end_date) && (
                  <p className="text-xs text-gray-500 mb-3">
                    📅 {promo.start_date} → {promo.end_date || 'مفتوح'}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(promo)}
                    disabled={actionInProgress === `toggle-${promo.id}`}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      actionInProgress === `toggle-${promo.id}`
                        ? 'opacity-50 cursor-not-allowed'
                        : promo.is_active
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {actionInProgress === `toggle-${promo.id}` ? '⏳ جاري...' : promo.is_active ? '⏹️ إيقاف' : '▶️ تفعيل'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(promo)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePromotion(promo.id)}
                    disabled={actionInProgress === `delete-${promo.id}`}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      actionInProgress === `delete-${promo.id}`
                        ? 'opacity-50 cursor-not-allowed bg-red-400'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {actionInProgress === `delete-${promo.id}` ? '⏳ جاري...' : '🗑️ حذف'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}