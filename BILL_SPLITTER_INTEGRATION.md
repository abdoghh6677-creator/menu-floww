# 🔌 كيفية دمج Bill Splitter في صفحة المنيو

## المتطلبات

- ✅ React hooks مثبت
- ✅ BillSplitter component موجود في `components/BillSplitter.js`
- ✅ قائمة العناصر متاحة من Supabase

---

## الخطوة 1: الاستيراد

في `app/menu/[id]/page.js`، أضف الاستيراد:

```javascript
import BillSplitter from '@/components/BillSplitter'
```

---

## الخطوة 2: إضافة State

في component، أضف حالة جديدة لتتبع وضع التقسيم:

```javascript
const [showBillSplitter, setShowBillSplitter] = useState(false)
const [splitParticipants, setSplitParticipants] = useState(null)
```

---

## الخطوة 3: دالة معالجة التقسيم

أضف دالة جديدة للتعامل مع البيانات المقسمة:

```javascript
const handleBillSplit = (participants) => {
  // participants = [
  //   {
  //     id: 1,
  //     name: "أحمد",
  //     phone: "01xxxxxxxxx",
  //     amount: 100,
  //     percentage: 100,
  //     selectedItems: [...]
  //   },
  //   ...
  // ]
  
  setSplitParticipants(participants)
  setShowBillSplitter(false)
  
  // يمكن حفظ في localStorage أيضاً:
  localStorage.setItem('lastBillSplit', JSON.stringify(participants))
  
  alert(`✅ تم تقسيم الفاتورة بين ${participants.length} أشخاص!`)
}
```

---

## الخطوة 4: زر التقسيم في السلة

في قسم عرض السلة (Cart View)، أضف زر:

```jsx
{/* في قسم السلة */}
<div className="mb-4">
  <button
    onClick={() => setShowBillSplitter(!showBillSplitter)}
    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition mb-2"
  >
    {showBillSplitter ? '✕ إغلاق تقسيم الفاتورة' : '💰 تقسيم الفاتورة مع الأصدقاء'}
  </button>
</div>
```

---

## الخطوة 5: عرض BillSplitter Modal

أضف BillSplitter عندما يكون `showBillSplitter = true`:

```jsx
{showBillSplitter && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border-2 border-purple-200">
    <h3 className="text-xl font-bold mb-4">🍽️ تقسيم الفاتورة</h3>
    <BillSplitter
      totalAmount={subtotal}  // مجموع الأصناف بدون توصيل
      deliveryFee={deliveryFee}  // رسوم التوصيل
      restaurantName={restaurant?.name}
      items={items}  // قائمة العناصر (الأصناف المتاحة)
      onSplitConfirm={handleBillSplit}
    />
  </div>
)}
```

---

## الخطوة 6: عرض ملخص التقسيم

بعد التقسيم، اعرض الملخص:

```jsx
{splitParticipants && (
  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
    <h4 className="font-bold mb-3">✅ ملخص التقسيم:</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {splitParticipants.map((p, idx) => (
        <div key={p.id} className="bg-white p-3 rounded-lg border-l-4 border-purple-500">
          <p className="font-bold">{idx + 1}. {p.name}</p>
          <p className="text-xl text-purple-600 font-bold">{p.amount.toFixed(2)} ج</p>
          {p.selectedItems?.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">{p.selectedItems.length} عنصر</p>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

---

## الخطوة 7: دمج مع الكود الموجود

### الموقع الأفضل في الصفحة:

```jsx
// ترتيب العناصر المقترح:

<div className="space-y-4">
  {/* 1. عنوان السلة */}
  <h2>🛒 سلة الطلبات</h2>
  
  {/* 2. قائمة العناصر */}
  {cartItems.map(item => (...))}
  
  {/* 3. ~~~ خط فاصل ~~~ */}
  
  {/* 4. زر التقسيم ← أضف هنا */}
  <button onClick={() => setShowBillSplitter(!showBillSplitter)}>
    💰 تقسيم الفاتورة
  </button>
  
  {/* 5. BillSplitter Modal ← أضف هنا */}
  {showBillSplitter && <BillSplitter ... />}
  
  {/* 6. ملخص التقسيم ← أضف هنا */}
  {splitParticipants && <div>...</div>}
  
  {/* 7. ~~~ خط فاصل ~~~ */}
  
  {/* 8. المجموع والرسوم */}
  <div className="bg-gray-100">
    الإجمالي: {total}
  </div>
  
  {/* 9. زر التأكيد النهائي */}
  <button onClick={handleCheckout}>
    تأكيد الطلب
  </button>
</div>
```

---

## مثال كامل للتكامل

```jsx
'use client'
import { useState } from 'react'
import BillSplitter from '@/components/BillSplitter'

export default function MenuPage() {
  const [cart, setCart] = useState([])
  const [showBillSplitter, setShowBillSplitter] = useState(false)
  const [splitParticipants, setSplitParticipants] = useState(null)

  // حساب الإجماليات
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const deliveryFee = restaurant?.deliveryFee || 0
  const total = subtotal + deliveryFee

  // معالجة التقسيم
  const handleBillSplit = (participants) => {
    setSplitParticipants(participants)
    setShowBillSplitter(false)
    
    // خيار: إرسال بيانات التقسيم إلى الخادم
    // saveOrderWithSplitInfo(participants)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* عنوان */}
      <h2 className="text-2xl font-bold mb-4">🛒 سلة الطلبات</h2>

      {/* قائمة العناصر */}
      {cart.length === 0 ? (
        <p>السلة فارغة</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} className="border p-3 mb-2 rounded">
              {item.name} - {item.price} ج
            </div>
          ))}

          {/* زر التقسيم */}
          <button
            onClick={() => setShowBillSplitter(!showBillSplitter)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold mt-4"
          >
            {showBillSplitter ? '✕ إغلاق' : '💰 تقسيم الفاتورة'}
          </button>

          {/* BillSplitter Modal */}
          {showBillSplitter && (
            <BillSplitter
              totalAmount={subtotal}
              deliveryFee={deliveryFee}
              restaurantName={restaurant?.name}
              items={cart}
              onSplitConfirm={handleBillSplit}
            />
          )}

          {/* ملخص التقسيم */}
          {splitParticipants && (
            <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg mt-4">
              <h3 className="font-bold mb-2">✅ تم التقسيم بين:</h3>
              {splitParticipants.map(p => (
                <p key={p.id}>{p.name}: {p.amount.toFixed(2)} ج</p>
              ))}
              <button
                onClick={() => setSplitParticipants(null)}
                className="mt-2 text-blue-600 underline"
              >
                تعديل التقسيم
              </button>
            </div>
          )}

          {/* الملخص النهائي */}
          <div className="bg-gray-100 p-4 rounded-lg mt-4 space-y-2">
            <p>المجموع: {subtotal.toFixed(2)} ج</p>
            <p>التوصيل: {deliveryFee.toFixed(2)} ج</p>
            <p className="font-bold text-lg">
              الإجمالي: {total.toFixed(2)} ج
            </p>
          </div>

          {/* زر التأكيد */}
          <button
            onClick={() => submitOrder()}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold mt-4"
          >
            ✅ تأكيد الطلب
          </button>
        </>
      )}
    </div>
  )
}
```

---

## 📋 الخطوات الفعلية (Quick Checklist)

- [ ] استيراد BillSplitter
- [ ] إضافة state: `showBillSplitter`, `splitParticipants`
- [ ] إنشاء دالة `handleBillSplit`
- [ ] إضافة زر التقسيم
- [ ] إضافة modal BillSplitter
- [ ] إضافة عرض ملخص التقسيم
- [ ] اختبار على browser
- [ ] التحقق من Responsive design
- [ ] commit و push

---

## 🎯 النقاط المهمة

| النقطة | الشرح |
|-------|------|
| **items prop** | يجب أن يكون مصفوفة مع id, name, price |
| **totalAmount** | المبلغ **بدون** توصيل |
| **deliveryFee** | رسوم التوصيل بشكل منفصل |
| **onSplitConfirm** | callback يستقبل array من participants |
| **localStorage** | (اختياري) حفظ آخر تقسيمة |

---

## 🆘 تحري الأخطاء

### خطأ: "BillSplitter is not defined"
```
✓ تأكد من import الصحيح
import BillSplitter from '@/components/BillSplitter'
```

### خطأ: "items is empty"
```
✓ تأكد من تمرير cart items أو items list
<BillSplitter items={cart} ... />
```

### المنطق غير صحيح
```
✓ تحقق من معالج الـ callback
onSplitConfirm={(participants) => {
  console.log(participants)  // تحقق هنا
}}
```

---

**النسخة:** 1.0  
**آخر تحديث:** فبراير 2026  
**التوافقية:** React 19+, Next.js 16+
