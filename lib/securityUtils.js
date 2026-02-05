/**
 * 🔒 أدوات الأمان الشاملة
 * - التحقق من المستخدم
 * - تنظيف البيانات
 * - حماية من XSS والتجاوزات
 */

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * التحقق من قوة كلمة المرور
 * - على الأقل 8 أحرف
 * - يحتوي على أحرف كبيرة وصغيرة
 * - يحتوي على رقم
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'يجب أن تحتوي على أحرف صغيرة' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'يجب أن تحتوي على أحرف كبيرة' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'يجب أن تحتوي على أرقام' }
  }
  return { valid: true, message: 'كلمة مرور قوية' }
}

/**
 * تنظيف المدخلات من XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000) // حد أقصى 1000 حرف
}

/**
 * التحقق من أن المستخدم لديه صلاحيات
 */
export const hasPermission = (user, restaurant, permission) => {
  if (!user || !restaurant) return false
  
  // مالك المطعم لديه صلاحيات كاملة
  if (user.id === restaurant.user_id) return true
  
  // تحقق من الصلاحيات المخصصة
  if (restaurant.admins && Array.isArray(restaurant.admins)) {
    return restaurant.admins.includes(user.id)
  }
  
  return false
}

/**
 * التحقق من صلاحيات الوصول للموارد
 */
export const checkResourceAccess = (userId, resourceOwnerId) => {
  if (!userId || !resourceOwnerId) return false
  return userId === resourceOwnerId
}

/**
 * تشفير البيانات الحساسة في localStorage
 */
export const secureStorage = {
  set: (key, value) => {
    try {
      // فقط خزن البيانات غير الحساسة
      const allowedKeys = ['siteLanguage', 'dashboardTheme', 'savedCustomerInfo']
      if (!allowedKeys.includes(key)) {
        console.warn(`⚠️ محاولة حفظ بيانات حساسة: ${key}`)
        return false
      }
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('❌ خطأ في حفظ البيانات:', e)
      return false
    }
  },
  
  get: (key) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error('❌ خطأ في قراءة البيانات:', e)
      return null
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('❌ خطأ في حذف البيانات:', e)
      return false
    }
  }
}

/**
 * حماية من CSRF - إنشاء توكن
 */
export const generateCSRFToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * التحقق من معدل الطلبات (Rate Limiting)
 */
export const checkRateLimit = (key, maxRequests = 10, timeWindowMs = 60000) => {
  const now = Date.now()
  const data = window.__rateLimitData = window.__rateLimitData || {}
  
  if (!data[key]) {
    data[key] = { count: 1, startTime: now }
    return true
  }
  
  const timeDiff = now - data[key].startTime
  if (timeDiff > timeWindowMs) {
    data[key] = { count: 1, startTime: now }
    return true
  }
  
  if (data[key].count >= maxRequests) {
    return false
  }
  
  data[key].count++
  return true
}

/**
 * تسجيل الأحداث الأمنية
 */
export const logSecurityEvent = async (supabase, eventType, details) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('security_logs')
      .insert([
        {
          user_id: user?.id,
          event_type: eventType,
          details: JSON.stringify(details),
          ip_address: details.ip || 'unknown',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }
      ])
  } catch (e) {
    console.error('❌ خطأ في تسجيل الحدث الأمني:', e)
  }
}

/**
 * التحقق من انتهاء الجلسة
 */
export const checkSessionExpiry = async (supabase) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { valid: false, message: 'الجلسة انتهت' }
    }
    
    // تحقق من انتهاء صلاحية التوكن
    const expiresIn = session.expires_in
    if (expiresIn < 300) { // أقل من 5 دقائق
      return { valid: true, expiringSoon: true, message: 'الجلسة ستنتهي قريباً' }
    }
    
    return { valid: true, expiringSoon: false }
  } catch (e) {
    console.error('❌ خطأ في التحقق من الجلسة:', e)
    return { valid: false }
  }
}

export default {
  validateEmail,
  validatePassword,
  sanitizeInput,
  hasPermission,
  checkResourceAccess,
  secureStorage,
  generateCSRFToken,
  checkRateLimit,
  logSecurityEvent,
  checkSessionExpiry
}
