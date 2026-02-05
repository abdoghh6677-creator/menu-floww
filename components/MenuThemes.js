'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const THEMES = {
  modern: {
    id: 'modern',
    name: 'حديث',
    preview: '🎨',
    colors: {
      primary: '#ea580c',
      secondary: '#fb923c',
      background: 'linear-gradient(to br, #fff7ed, #ffedd5)',
      card: '#ffffff',
      text: '#1f2937'
    },
    styles: {
      cardStyle: 'shadow-lg hover:shadow-xl transition-all duration-300',
      buttonStyle: 'rounded-lg bg-gradient-to-r from-orange-500 to-orange-600',
      headerStyle: 'bg-white/80 backdrop-blur-lg sticky top-0'
    }
  },
  
  dark: {
    id: 'dark',
    name: 'داكن',
    preview: '🌙',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: 'linear-gradient(to br, #1f2937, #111827)',
      card: '#1f2937',
      text: '#f9fafb'
    },
    styles: {
      cardStyle: 'shadow-2xl border border-gray-700 hover:border-orange-500 transition-all',
      buttonStyle: 'rounded-lg bg-orange-600 hover:bg-orange-700',
      headerStyle: 'bg-gray-900/90 backdrop-blur-lg sticky top-0 border-b border-gray-700'
    }
  },

  neon: {
    id: 'neon',
    name: 'نيون',
    preview: '⚡',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      background: 'linear-gradient(to br, #1e1b4b, #0f172a)',
      card: '#1e293b',
      text: '#f1f5f9'
    },
    styles: {
      cardStyle: 'shadow-[0_0_15px_rgba(236,72,153,0.3)] border-2 border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all',
      buttonStyle: 'rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.5)]',
      headerStyle: 'bg-slate-900/90 backdrop-blur-lg sticky top-0 border-b-2 border-pink-500/50'
    }
  },

  minimal: {
    id: 'minimal',
    name: 'بسيط',
    preview: '⚪',
    colors: {
      primary: '#000000',
      secondary: '#4b5563',
      background: '#ffffff',
      card: '#f9fafb',
      text: '#111827'
    },
    styles: {
      cardStyle: 'border border-gray-200 hover:border-black transition-all',
      buttonStyle: 'rounded-none bg-black hover:bg-gray-800',
      headerStyle: 'bg-white sticky top-0 border-b border-gray-200'
    }
  },

  glass: {
    id: 'glass',
    name: 'زجاجي',
    preview: '💎',
    colors: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      background: 'linear-gradient(to br, #e0f2fe, #bae6fd)',
      card: 'rgba(255, 255, 255, 0.7)',
      text: '#0c4a6e'
    },
    styles: {
      cardStyle: 'backdrop-blur-md bg-white/70 border border-white/50 shadow-xl hover:bg-white/80 transition-all',
      buttonStyle: 'rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 backdrop-blur-sm',
      headerStyle: 'bg-white/60 backdrop-blur-xl sticky top-0 border-b border-white/50'
    }
  },

  luxury: {
    id: 'luxury',
    name: 'فاخر',
    preview: '👑',
    colors: {
      primary: '#d97706',
      secondary: '#ca8a04',
      background: 'linear-gradient(to br, #422006, #1c1917)',
      card: '#292524',
      text: '#fef3c7'
    },
    styles: {
      cardStyle: 'border-2 border-yellow-600/50 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_40px_rgba(217,119,6,0.5)] transition-all',
      buttonStyle: 'rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 shadow-lg',
      headerStyle: 'bg-stone-900/95 backdrop-blur-lg sticky top-0 border-b-2 border-yellow-600/50'
    }
  },

  nature: {
    id: 'nature',
    name: 'طبيعي',
    preview: '🌿',
    colors: {
      primary: '#16a34a',
      secondary: '#84cc16',
      background: 'linear-gradient(to br, #f0fdf4, #dcfce7)',
      card: '#ffffff',
      text: '#14532d'
    },
    styles: {
      cardStyle: 'shadow-lg border-2 border-green-200 hover:border-green-400 transition-all',
      buttonStyle: 'rounded-full bg-gradient-to-r from-green-600 to-lime-500',
      headerStyle: 'bg-white/90 backdrop-blur-lg sticky top-0 border-b-2 border-green-300'
    }
  },

  sunset: {
    id: 'sunset',
    name: 'غروب',
    preview: '🌅',
    colors: {
      primary: '#dc2626',
      secondary: '#f59e0b',
      background: 'linear-gradient(to br, #fef2f2, #fed7aa)',
      card: '#ffffff',
      text: '#7c2d12'
    },
    styles: {
      cardStyle: 'shadow-xl hover:shadow-2xl transition-all duration-300',
      buttonStyle: 'rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500',
      headerStyle: 'bg-white/80 backdrop-blur-lg sticky top-0'
    }
  }
}

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