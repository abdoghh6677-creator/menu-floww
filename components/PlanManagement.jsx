'use client'

export default function PlanManagement({ restaurant, onUpdate, darkMode = false }) {
  if (!restaurant) {
    return <div className={`p-6 rounded-lg ${darkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>لا توجد بيانات</div>
  }

  const currentPlan = {
    name: 'غير محدود',
    emoji: '💎',
    description: 'خطتك توفر كل المزايا بدون قيود',
    features: [
      { icon: '📊', title: 'احصائيات متقدمة', desc: 'تحليلات شاملة للطلبات والمبيعات والعملاء' },
      { icon: '⚡', title: 'سرعة فائقة', desc: 'تحميل فوري وأداء عالي على جميع الأجهزة' },
      { icon: '📱', title: 'QR Code غير محدود', desc: 'إنشاء وتشغيل QR Codes بدون حد أقصى' },
      { icon: '🌍', title: 'لغات متعددة', desc: 'عربي، إنجليزي، يابانية وأكثر' },
      { icon: '🛒', title: 'منيو غير محدود', desc: 'أضف أصناف وفئات بدون قيود' },
      { icon: '💳', title: 'دفع متعدد', desc: 'نقد، كارت ائتمان، InstaPay وغيرها' },
      { icon: '🎯', title: 'عروض وخصم مرن', desc: 'إدارة عروض خاصة لكل صنف' },
      { icon: '🔔', title: 'إخطارات فورية', desc: 'تنبيهات واتساب وصوتية وديسكتوب' },
      { icon: '🏪', title: 'إدارة الفروع', desc: 'استيراد وتصدير وإدارة متعددة الفروع' },
      { icon: '🔒', title: 'أمان عالي', desc: 'بيانات محمية بـ Supabase وSSL' },
      { icon: '📈', title: 'تقارير شهرية', desc: 'تحليلات مفصلة وتقارير شاملة' },
      { icon: '🤝', title: 'دعم 24/7', desc: 'فريق دعم متواجد طوال الوقت' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Main Plan Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-500`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-5xl font-black mb-2">{currentPlan.emoji} {currentPlan.name}</h2>
              <p className="text-white/90 text-lg">{currentPlan.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>المزايا المتاحة</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPlan.features.map((feature, i) => (
            <div key={i} className={`rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700 hover:border-purple-500' 
                : 'bg-white border border-gray-200 hover:border-purple-500'
            }`}>
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className={`rounded-2xl p-6 border-l-4 ${darkMode ? 'bg-slate-800 border-purple-500 text-gray-200' : 'bg-purple-50 border-purple-500 text-purple-900'}`}>
        <p className="font-semibold mb-2">✨ خطتك الحالية توفر كل المزايا!</p>
        <p className="text-sm">استمتع بجميع الميزات المتقدمة بدون قيود أو حدود أقصى. لا توجد رسوم إضافية أو اشتراكات.</p>
      </div>
    </div>
  )
}
