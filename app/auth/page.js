
'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword, sanitizeInput, checkRateLimit } from '@/lib/securityUtils'

function AuthContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const router = useRouter()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrors({})

    try {
      // التحقق من معدل الطلبات
      if (!checkRateLimit('auth_attempts', 5, 60000)) {
        throw new Error('محاولات متعددة جداً. حاول لاحقاً.')
      }

      // التحقق من البريد الإلكتروني
      if (!validateEmail(email)) {
        setErrors({ email: 'بريد إلكتروني غير صحيح' })
        throw new Error('بريد إلكتروني غير صحيح')
      }

      // التحقق من كلمة المرور
      if (!isLogin) {
        const pwdValidation = validatePassword(password)
        if (!pwdValidation.valid) {
          setErrors({ password: pwdValidation.message })
          throw new Error(pwdValidation.message)
        }
      }

      // تنظيف المدخلات
      const cleanEmail = sanitizeInput(email.toLowerCase())
      const cleanRestaurantName = sanitizeInput(restaurantName)

      if (isLogin) {
        // تسجيل الدخول
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (error) {
          if (error.message.includes('Invalid')) {
            throw new Error('بريد إلكتروني أو كلمة مرور غير صحيحة')
          }
          throw error
        }
        setMessage('✅ تم تسجيل الدخول بنجاح!')
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        // التحقق من حقول التسجيل
        if (!cleanRestaurantName) {
          setErrors({ restaurantName: 'اسم المطعم مطلوب' })
          throw new Error('اسم المطعم مطلوب')
        }

        // إنشاء حساب جديد
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              restaurant_name: cleanRestaurantName
            }
          }
        })
        if (authError) throw authError

        // إضافة مطعم جديد بعد إنشاء الحساب
        if (authData?.user) {
          // توليد slug من اسم المطعم
          const slug = cleanRestaurantName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-\u0600-\u06FF]/g, '') // يدعم العربية

          const { error: restError } = await supabase
            .from('restaurants')
            .insert([
              {
                name: cleanRestaurantName,
                user_id: authData.user.id,
                is_open: true,
                slug
              }
            ])
          if (restError) {
            console.error('❌ خطأ في إنشاء المطعم:', restError)
            throw new Error('فشل إنشاء المطعم. حاول لاحقاً.')
          }
        }
        setMessage('✅ تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.')
        setTimeout(() => {
          setEmail('')
          setPassword('')
          setRestaurantName('')
          setIsLogin(true)
        }, 2000)
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ غير متوقع'
      setMessage(`❌ ${errorMessage}`)
      console.error('Auth Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
          {isLogin ? '🔐 تسجيل الدخول' : '📝 إنشاء حساب جديد'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4 text-gray-900">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                اسم المطعم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-700 ${
                  errors.restaurantName ? 'border-red-500' : 'border-gray-300'
                }`}
                required={!isLogin}
                maxLength={100}
                placeholder="مطعم الأصالة"
              />
              {errors.restaurantName && <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-700 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              maxLength={254}
              placeholder="example@email.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-700 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              minLength={isLogin ? 1 : 8}
              maxLength={128}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                🔐 كلمة قوية: 8+ أحرف، حروف كبيرة وصغيرة، أرقام
              </p>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.includes('❌') 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-bold hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '⏳ جاري المعالجة...' : (isLogin ? '🔓 دخول' : '✅ إنشاء حساب')}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
              setErrors({})
            }}
            className="text-orange-600 hover:underline font-medium"
          >
            {isLogin ? '📝 ليس لديك حساب؟ سجل الآن' : '🔐 لديك حساب؟ سجل دخول'}
          </button>
        </div>

        {/* ملاحظات أمان */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p className="font-semibold mb-1">🔒 ملاحظات أمان مهمة:</p>
          <ul className="space-y-1">
            <li>✓ جميع البيانات مشفرة عند الإرسال</li>
            <li>✓ لا نحفظ كلمات المرور بصيغة نص عادي</li>
            <li>✓ تفعيل البريد الإلكتروني مطلوب</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return <AuthContent />
}