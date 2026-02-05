import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-gray-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">MenuFlow</h1>
          <div className="flex gap-4">
            <Link 
              href="/pricing"
              className="text-gray-300 hover:text-orange-400 font-semibold px-4 py-2 transition"
            >
              الأسعار
            </Link>
            <Link 
              href="/auth"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all active:scale-95 shadow-lg shadow-orange-500/30"
            >
              دخول
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <section className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <p className="text-orange-400 text-sm font-semibold">🚀 منصة إدارة المنيو الذكية</p>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            منيو رقمي احترافي<br />لمطعمك
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            إنشاء وإدارة المنيو الرقمي بسهولة، مشاركة عبر QR Code، تحليل الطلبات والمبيعات، وتعزيز نموك بأدوات احترافية — كل شيء في مكان واحد.
          </p>

          <div className="flex gap-4 justify-center mb-16 flex-wrap">
            <Link 
              href="/pricing"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-orange-500/40 transition-all active:scale-95"
            >
              ابدأ معانا الآن
            </Link>
            <Link 
              href="/pricing"
              className="border border-orange-500 text-orange-400 hover:bg-orange-500/10 px-10 py-4 rounded-xl text-lg font-bold transition-all"
            >
              عرض الأسعار 💰
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex justify-center gap-8 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">✅ <span>QRمجاني</span></div>
            <div className="flex items-center gap-2">⚡ <span>سريع جداً</span></div>
            <div className="flex items-center gap-2">🔒 <span>آمن وموثوق</span></div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="mb-20">
          <h3 className="text-4xl font-bold text-center mb-12">المميزات الرئيسية</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'سرعة فائقة', desc: 'تحميل فوري وأداء عالي' },
              { icon: '📱', title: 'QR Code', desc: 'مشاركة مباشرة مع الزبائن' },
              { icon: '🌍', title: 'لغات متعددة', desc: 'عربي، إنجليزي، اليابانية' },
              { icon: '📊', title: 'احصائيات مفصلة', desc: 'تحليل المبيعات والطلبات' },
              { icon: '🛒', title: 'إدارة سلة الشراء', desc: 'تحديثات فورية وآمنة' },
              { icon: '💳', title: 'دفع متعدد', desc: 'نقد، كارت، InstaPay' },
              { icon: '🎯', title: 'عروض وخصم', desc: 'إدارة العروض بسهولة' },
              { icon: '🔔', title: 'إخطارات فورية', desc: 'تنبيهات للطلبات الجديدة' },
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10 group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-500/30 rounded-3xl p-12 mb-20 text-center">
          <h3 className="text-3xl font-bold mb-12">الاف الطلبات تُدار يومياً</h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '50', label: 'مطعم نشط' },
              { number: '3433+', label: 'طلب شهري' },
              { number: '99.9%', label: 'توفر الخدمة' },
              { number: '2+', label: 'دول' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold text-orange-400 mb-2">{stat.number}</p>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h3 className="text-4xl font-bold mb-4">جاهز لتطوير مطعمك؟</h3>
          <p className="text-gray-400 mb-8 text-lg">ابدأ الآن ولا تحتاج إلى بطاقة ائتمان</p>
          
          <Link
            href="/auth"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 rounded-xl text-lg font-bold shadow-xl shadow-orange-500/40 transition-all active:scale-95"
          >
            ابدأ معانا الآن
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8 text-center text-gray-500">
        <p>&copy; 2026 MenuFlow. جميع الحقوق محفوظة</p>
      </footer>
    </div>
  )
}