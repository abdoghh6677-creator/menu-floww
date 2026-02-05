import { supabase } from '@/lib/supabaseClient'

/**
 * التحقق من الاشتراك النشط
 * @param {string} userId - معرّف المستخدم
 * @returns {Promise<{active: boolean, subscription: object|null}>}
 */
export async function checkSubscriptionStatus(userId) {
  try {
    if (!userId) {
      return { active: false, subscription: null }
    }

    // جلب الاشتراك النشط
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ خطأ في جلب الاشتراك:', error)
      return { active: false, subscription: null }
    }

    if (!subscription) {
      return { active: false, subscription: null }
    }

    // التحقق من انتهاء الاشتراك
    const expiryDate = new Date(subscription.expires_at)
    const isExpired = expiryDate < new Date()

    if (isExpired) {
      // تحديث حالة الاشتراك
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id)

      return { active: false, subscription: null }
    }

    return {
      active: true,
      subscription: {
        id: subscription.id,
        plan_type: subscription.plan_type,
        expires_at: subscription.expires_at,
        created_at: subscription.created_at,
        status: subscription.status,
        daysRemaining: Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      }
    }
  } catch (error) {
    console.error('❌ خطأ في التحقق من الاشتراك:', error)
    return { active: false, subscription: null }
  }
}

/**
 * الحصول على معلومات الاشتراك
 * @param {string} userId - معرّف المستخدم
 * @returns {Promise<object|null>}
 */
export async function getSubscriptionInfo(userId) {
  const { active, subscription } = await checkSubscriptionStatus(userId)
  return active ? subscription : null
}

/**
 * التحقق من انتهاء الاشتراك
 * @param {string} userId - معرّف المستخدم
 * @returns {Promise<boolean>}
 */
export async function isSubscriptionExpired(userId) {
  const { active } = await checkSubscriptionStatus(userId)
  return !active
}
