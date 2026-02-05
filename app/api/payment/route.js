import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId, planType, cardData } = await request.json()

    // التحقق من البيانات المطلوبة
    if (!userId || !planType || !cardData) {
      return NextResponse.json(
        { error: 'بيانات غير كاملة' },
        { status: 400 }
      )
    }

    // في الإنتاج: معالجة الدفع عبر بوابة حقيقية (Paymob, Stripe, إلخ)
    // للآن نقبل البطاقة بدون معالجة حقيقية (للاختبار فقط)

    const planPrice = planType === 'monthly' ? 500 : 4500
    const planDuration = planType === 'monthly' ? 30 : 365
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + planDuration)

    // تحديث الاشتراك
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('plan_type', planType)
      .select()
      .single()

    if (subError) {
      console.error('❌ خطأ في تحديث الاشتراك:', subError)
      return NextResponse.json(
        { error: 'فشل تأكيد الدفع' },
        { status: 500 }
      )
    }

    // إضافة سجل الدفع
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          amount: planPrice,
          plan_type: planType,
          status: 'completed',
          transaction_id: `TXN_${Date.now()}`,
          payment_method: 'card',
        }
      ])

    if (paymentError) {
      console.error('❌ خطأ في إضافة سجل الدفع:', paymentError)
    }

    return NextResponse.json({
      success: true,
      subscription: subscription,
      message: '✅ تم الدفع بنجاح!'
    })

  } catch (error) {
    console.error('❌ خطأ في معالجة الدفع:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    )
  }
}
