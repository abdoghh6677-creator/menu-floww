'use client'

export default function Analytics({ restaurant }) {
  if (!restaurant) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        لم يتم تحميل بيانات المطعم
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">📊 الإحصائيات</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-gray-500">إجمالي الطلبات</p>
          <p className="text-2xl font-bold text-orange-600">—</p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="text-gray-500">إجمالي المبيعات</p>
          <p className="text-2xl font-bold text-green-600">—</p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="text-gray-500">أكثر صنف مبيعًا</p>
          <p className="text-lg font-semibold">—</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-6">
        سيتم تفعيل الإحصائيات التفصيلية لاحقًا
      </p>
    </div>
  )
}
