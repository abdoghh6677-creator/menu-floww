'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly') // monthly or yearly

  const plans = [
    {
      id: 'monthly',
      name: 'شهري',
      price: 500,
      period: 'شهر',
      description: 'اشتراك شهري كامل',
      features: [
        '✅ منتجات غير محدودة',
        '✅ طلبات غير محدودة',
        '✅ تحليلات كاملة',
        '✅ دعم فني',
        '✅ تحديثات مستمرة',
        '✅ QR Code مخصص',
      ],
      popular: false,
    },
    {
      id: 'yearly',
      name: 'سنوي',
      price: 4500,
      period: 'سنة',
      description: 'توفير 25% عند الاشتراك السنوي',
      features: [
        '✅ منتجات غير محدودة',
        '✅ طلبات غير محدودة',
        '✅ تحليلات كاملة',
        '✅ دعم فني أولوية',
        '✅ تحديثات مستمرة',
        '✅ QR Code مخصص',
        '✨ خصم 25% على السعر',
      ],
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          خطط الاشتراك 💳
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          اختر الخطة المناسبة لمطعمك وابدأ الآن
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition ${
              billingCycle === 'monthly'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            شهري 📅
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition ${
              billingCycle === 'yearly'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            سنوي ✨ (توفير 25%)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl shadow-2xl overflow-hidden transition transform hover:scale-105 ${
              plan.popular
                ? 'bg-gradient-to-br from-orange-600 to-orange-700 border-2 border-orange-400'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="bg-yellow-400 text-slate-900 py-2 text-center font-bold">
                ⭐ الخطة الأشهر
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
              <p className="text-sm text-gray-300 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-xl text-gray-300">ج.م</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">لكل {plan.period}</p>
              </div>

              {/* CTA Button */}
              <a
                href={`https://wa.me/2001020385787?text=${encodeURIComponent(
                  `مرحبًا، أرغب بالتسجيل في الخطة ${plan.name} - ${plan.price} ج.م.\nاسم المطعم:`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-4 rounded-xl font-bold text-lg text-center transition mb-8 ${
                  plan.popular
                    ? 'bg-white text-orange-600 hover:bg-gray-100'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                اختر هذه الخطة عبر واتساب 🚀
              </a>

              {/* Features */}
              <div className="space-y-3">
                <p className="font-bold text-sm text-gray-300 mb-4">المميزات:</p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-8 border border-slate-700">
        <h3 className="text-2xl font-bold mb-8 text-center">❓ أسئلة شائعة</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-lg mb-2">هل يمكنني تغيير الخطة لاحقاً؟</h4>
            <p className="text-gray-300">نعم، يمكنك التحويل بين الخطط في أي وقت من لوحة التحكم.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">هل هناك فترة تجريبية مجانية؟</h4>
            <p className="text-gray-300">ستتمكن من استخدام المنصة لمدة 7 أيام بدون تكلفة.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">كيف يتم الدفع؟</h4>
            <p className="text-gray-300">ندعم بطاقات الائتمان والتحويلات البنكية والمحافظ الرقمية.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">هل يمكنني إلغاء الاشتراك؟</h4>
            <p className="text-gray-300">نعم، يمكنك إلغاء اشتراكك في أي وقت بدون مخاوف.</p>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="text-orange-400 hover:text-orange-300 font-semibold text-lg underline"
        >
          ← العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  )
}
