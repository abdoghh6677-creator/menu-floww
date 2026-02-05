import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'معرّف المستخدم مطلوب' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'فشل جلب بيانات الاشتراك' },
        { status: 500 }
      )
    }

    // التحقق من انتهاء الاشتراك
    if (subscription) {
      const expiryDate = new Date(subscription.expires_at)
      const isExpired = expiryDate < new Date()

      if (isExpired) {
        // تحديث حالة الاشتراك إلى منتهي الصلاحية
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id)

        return NextResponse.json({
          active: false,
          status: 'expired',
          message: 'انتهت صلاحية الاشتراك'
        })
      }

      return NextResponse.json({
        active: true,
        subscription: {
          plan_type: subscription.plan_type,
          expires_at: subscription.expires_at,
          created_at: subscription.created_at,
          days_remaining: Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
        }
      })
    }

    return NextResponse.json({
      active: false,
      status: 'no_subscription',
      message: 'لا يوجد اشتراك نشط'
    })

  } catch (error) {
    console.error('❌ خطأ في التحقق من الاشتراك:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    )
  }
}
