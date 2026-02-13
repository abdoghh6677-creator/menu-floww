'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { THEMES } from '@/lib/themes'

export default function MenuThemes({ restaurant, currentTheme, onThemeChange }) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'modern')
  const [saving, setSaving] = useState(false)

  const handleThemeSelect = async (themeId) => {
    setSelectedTheme(themeId)
    setSaving(true)

    const theme = THEMES[themeId]
    
    await supabase
      .from('restaurant_themes')
      .upsert({
        restaurant_id: restaurant.id,
        theme_id: themeId,
        primary_color: theme.colors.primary,
        secondary_color: theme.colors.secondary,
        background_style: theme.colors.background,
        card_style: theme.styles.cardStyle,
        button_style: theme.styles.buttonStyle
      })

    setSaving(false)
    if (onThemeChange) onThemeChange(themeId)
    alert('✅ تم تطبيق الثيم بنجاح!')
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-2">🎨 ثيمات المنيو</h3>
        <p className="opacity-90">اختر التصميم المناسب لمطعمك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(THEMES).map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`cursor-pointer rounded-xl p-6 transition-all duration-300 ${
              selectedTheme === theme.id
                ? 'ring-4 ring-purple-500 shadow-2xl scale-105'
                : 'hover:scale-102 hover:shadow-lg'
            }`}
            style={{
              background: theme.colors.background,
              color: theme.colors.text
            }}
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{theme.preview}</div>
              <h4 className="text-xl font-bold">{theme.name}</h4>
            </div>

            <div className="space-y-3">
              {/* Preview Card */}
              <div
                className={`p-4 rounded-lg ${theme.styles.cardStyle}`}
                style={{ 
                  background: theme.colors.card,
                  color: theme.colors.text
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">صنف تجريبي</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ 
                      background: theme.colors.primary,
                      color: '#ffffff'
                    }}
                  >
                    50 ج
                  </span>
                </div>
                <p className="text-sm opacity-75">وصف الصنف هنا...</p>
              </div>

              {/* Preview Button */}
              <button
                className={`w-full py-2 text-white font-semibold ${theme.styles.buttonStyle}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThemeSelect(theme.id)
                }}
              >
                {selectedTheme === theme.id ? '✓ مُطبّق' : 'تطبيق'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin text-6xl mb-4 text-center">⏳</div>
            <p className="text-xl font-bold">جاري تطبيق الثيم...</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-3">💡 نصائح:</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✓ الثيم يتطبق فوراً على صفحة المنيو</li>
          <li>✓ يمكنك التبديل بين الثيمات في أي وقت</li>
          <li>✓ جرّب عدة ثيمات لتختار الأنسب</li>
          <li>✓ التصميم يتكيف تلقائياً مع الموبايل</li>
        </ul>
      </div>
    </div>
  )
}

// Export الثيمات للاستخدام في صفحة المنيو
export { THEMES }