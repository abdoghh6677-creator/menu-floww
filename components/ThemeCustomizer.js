'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

async function loadThemeInitial(restaurant, setTheme) {
  const { data } = await supabase
    .from('restaurant_themes')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .single()

  if (data) {
    setTheme(data)
  }
}

export default function ThemeCustomizer({ restaurant, currentPlan }) {
  const [theme, setTheme] = useState({
    primary_color: '#ea580c',
    secondary_color: '#fb923c',
    font_family: 'system',
    background_style: 'gradient',
    card_style: 'shadow',
    button_style: 'rounded'
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!restaurant) return
    setTimeout(() => { loadThemeInitial(restaurant, setTheme) }, 0)
  }, [restaurant])

  const saveTheme = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('restaurant_themes')
      .upsert({
        restaurant_id: restaurant.id,
        ...theme
      })

    if (!error) {
      alert('تم حفظ التصميم بنجاح! ✅')
    }

    setSaving(false)
  }

  if (!currentPlan?.custom_theme) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">🔒 ميزة مقفولة</h3>
        <p className="text-gray-700 mb-6">
          تخصيص التصميم متاح فقط في الخطة الاحترافية
        </p>
        <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700">
          ترقية الخطة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-6">تخصيص تصميم المنيو 🎨</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اللون الأساسي */}
          <div>
            <label className="block font-medium mb-2">اللون الأساسي</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.primary_color}
                onChange={(e) => setTheme({...theme, primary_color: e.target.value})}
                className="w-16 h-12 rounded border"
              />
              <input
                type="text"
                value={theme.primary_color}
                onChange={(e) => setTheme({...theme, primary_color: e.target.value})}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* اللون الثانوي */}
          <div>
            <label className="block font-medium mb-2">اللون الثانوي</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.secondary_color}
                onChange={(e) => setTheme({...theme, secondary_color: e.target.value})}
                className="w-16 h-12 rounded border"
              />
              <input
                type="text"
                value={theme.secondary_color}
                onChange={(e) => setTheme({...theme, secondary_color: e.target.value})}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* الخط */}
          <div>
            <label className="block font-medium mb-2">نوع الخط</label>
            <select
              value={theme.font_family}
              onChange={(e) => setTheme({...theme, font_family: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="system">النظام الافتراضي</option>
              <option value="cairo">Cairo (عربي)</option>
              <option value="tajawal">Tajawal (عربي)</option>
              <option value="roboto">Roboto (English)</option>
            </select>
          </div>

          {/* نمط الخلفية */}
          <div>
            <label className="block font-medium mb-2">نمط الخلفية</label>
            <select
              value={theme.background_style}
              onChange={(e) => setTheme({...theme, background_style: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="solid">لون ثابت</option>
              <option value="gradient">تدرج لوني</option>
              <option value="pattern">نقشة</option>
            </select>
          </div>

          {/* نمط الكروت */}
          <div>
            <label className="block font-medium mb-2">نمط البطاقات</label>
            <select
              value={theme.card_style}
              onChange={(e) => setTheme({...theme, card_style: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="shadow">ظل خفيف</option>
              <option value="border">إطار</option>
              <option value="flat">مسطح</option>
              <option value="elevated">بارز</option>
            </select>
          </div>

          {/* نمط الأزرار */}
          <div>
            <label className="block font-medium mb-2">نمط الأزرار</label>
            <select
              value={theme.button_style}
              onChange={(e) => setTheme({...theme, button_style: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="rounded">دائري</option>
              <option value="square">مربع</option>
              <option value="pill">حبة دواء</option>
            </select>
          </div>
        </div>

        <button
          onClick={saveTheme}
          disabled={saving}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التصميم ✅'}
        </button>
      </div>

      {/* معاينة */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-bold mb-4">معاينة التصميم</h4>
        <div
          className="p-6 rounded-lg"
          style={{
            background: theme.background_style === 'gradient'
              ? `linear-gradient(to br, ${theme.primary_color}20, ${theme.secondary_color}20)`
              : theme.primary_color + '10'
          }}
        >
          <div
            className={`bg-white p-4 mb-4 ${
              theme.card_style === 'shadow' ? 'shadow-lg' :
              theme.card_style === 'border' ? 'border-2' :
              theme.card_style === 'elevated' ? 'shadow-2xl' : ''
            }`}
            style={{ borderRadius: theme.card_style === 'flat' ? '0' : '0.5rem' }}
          >
            <h5 className="font-bold mb-2" style={{ fontFamily: theme.font_family }}>
              مثال على صنف
            </h5>
            <p className="text-gray-600 text-sm mb-3">وصف الصنف هنا...</p>
            <button
              className="px-6 py-2 text-white font-semibold"
              style={{
                background: theme.primary_color,
                borderRadius: theme.button_style === 'pill' ? '9999px' : 
                            theme.button_style === 'square' ? '0.25rem' : '0.5rem'
              }}
            >
              إضافة للطلب
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}