'use client'
import { useRef } from 'react'

export default function PrintInvoice({ order, restaurant, darkMode }) {
  const printRef = useRef()

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'height=800,width=600')
      printWindow.document.write(printRef.current.innerHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getOrderTypeLabel = (type) => {
    switch (type) {
      case 'delivery':
        return 'توصيل 🚗'
      case 'pickup':
        return 'استلام من الفرع 🏪'
      case 'dine-in':
        return 'محلي (داخل المطعم) 🍽️'
      default:
        return type
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-EG') + ' ' + date.toLocaleTimeString('ar-EG')
  }

  return (
    <div>
      <button
        onClick={handlePrint}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 mt-2 font-bold"
      >
        <span>🖨️</span>
        طباعة الفاتورة
      </button>

      {/* محتوى الفاتورة المخفي للطباعة */}
      <div
        ref={printRef}
        style={{ display: 'none' }}
        className="invoice-print-content"
      >
        <div style={{
          fontFamily: 'Arial, sans-serif',
          direction: 'rtl',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#fff',
          color: '#000'
        }}>
          {/* رأس الفاتورة */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #333',
            paddingBottom: '15px'
          }}>
            {restaurant?.logo_url && (
              <img
                src={restaurant.logo_url}
                alt="Logo"
                style={{
                  maxWidth: '100px',
                  maxHeight: '100px',
                  marginBottom: '10px'
                }}
              />
            )}
            <h1 style={{ margin: '10px 0', fontSize: '24px', fontWeight: 'bold' }}>
              {restaurant?.name || 'المطعم'}
            </h1>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
              {restaurant?.working_hours || 'مواعيد العمل'}
            </p>
          </div>

          {/* معلومات الفاتورة */}
          <div style={{
            marginBottom: '20px',
            fontSize: '12px',
            lineHeight: '1.8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>رقم الفاتورة:</span>
              <span>{order?.id?.slice(0, 8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>التاريخ والوقت:</span>
              <span>{formatDate(order?.created_at)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>اسم العميل:</span>
              <span>{order?.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>رقم الهاتف:</span>
              <span>{order?.customer_phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>نوع الطلب:</span>
              <span>{getOrderTypeLabel(order?.order_type)}</span>
            </div>
            {order?.order_type === 'dine-in' && order?.table_number && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>رقم الطاولة:</span>
                <span>{order.table_number}</span>
              </div>
            )}
            {order?.order_type === 'delivery' && order?.delivery_address && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>عنوان التوصيل:</span>
                <span style={{ maxWidth: '200px', textAlign: 'left' }}>{order.delivery_address}</span>
              </div>
            )}
          </div>

          {/* الفاصل */}
          <div style={{
            borderTop: '2px solid #333',
            borderBottom: '2px solid #333',
            padding: '10px 0',
            marginBottom: '15px'
          }} />

          {/* تفاصيل الأصناف */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>تفاصيل الطلب:</h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>الصنف</th>
                  <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', width: '60px' }}>الكمية</th>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', width: '60px' }}>السعر</th>
                </tr>
              </thead>
              <tbody>
                {order?.order_items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ textAlign: 'right', padding: '8px' }}>
                      <div>{item.item_name}</div>
                      {item.addons && item.addons.length > 0 && (
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>
                          + {item.addons.map(a => a.name).join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'left', padding: '8px' }}>{item.price} ج</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الملاحظات */}
          {order?.notes && (
            <div style={{
              backgroundColor: '#fffacd',
              border: '1px solid #daa520',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '15px',
              fontSize: '12px'
            }}>
              <strong>ملاحظات:</strong> {order.notes}
            </div>
          )}

          {/* الفاصل */}
          <div style={{
            borderTop: '2px solid #333',
            margin: '15px 0'
          }} />

          {/* الملخص المالي */}
          <div style={{
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span>الإجمالي:</span>
              <span style={{ fontWeight: 'bold' }}>{order?.total_amount} ج</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>طريقة الدفع:</span>
              <span>
                {order?.payment_method === 'cash' && 'الدفع عند الاستلام'}
                {order?.payment_method === 'instapay' && 'InstaPay'}
                {order?.payment_method === 'visa' && 'Visa / Mastercard'}
              </span>
            </div>
            {order?.payment_status && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: order?.payment_status === 'paid' ? '#28a745' : '#ff9800'
              }}>
                <span>حالة الدفع:</span>
                <span>
                  {order?.payment_status === 'paid' && '✅ تم الدفع'}
                  {order?.payment_status === 'pending' && '⏳ في الانتظار'}
                  {order?.payment_status === 'pending_verification' && '⏳ في انتظار التحقق'}
                </span>
              </div>
            )}
          </div>

          {/* التذييل */}
          <div style={{
            textAlign: 'center',
            borderTop: '2px solid #333',
            paddingTop: '15px',
            fontSize: '12px',
            color: '#666'
          }}>
            <p>شكراً لتعاملكم معنا 🙏</p>
            <p style={{ marginTop: '10px', fontSize: '10px' }}>
              طُبعت بواسطة: {new Date().toLocaleDateString('ar-EG')} {new Date().toLocaleTimeString('ar-EG')}
            </p>
          </div>
        </div>
      </div>

      {/* CSS للطباعة */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
          }
          .invoice-print-content {
            display: block !important;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
