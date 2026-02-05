// دالة لتنسيق رقم الهاتف
export function formatPhoneNumber(phone) {
  if (!phone) return null
  
  // إزالة أي مسافات أو رموز
  let cleaned = phone.replace(/\D/g, '')
  
  // إذا بدأ بـ 0، استبدلها بكود مصر
  if (cleaned.startsWith('0')) {
    cleaned = '20' + cleaned.substring(1)
  }
  
  // إذا لم يبدأ بكود دولي، أضف كود مصر
  if (!cleaned.startsWith('20')) {
    cleaned = '20' + cleaned
  }
  
  return cleaned
}

// دالة لإنشاء رسالة الطلب
export function createOrderMessage(orderDetails) {
  const {
    restaurantName,
    customerName,
    customerPhone,
    orderType,
    tableNumber,
    deliveryAddress,
    items,
    totalAmount,
    paymentMethod,
    notes
  } = orderDetails

  let message = `🔔 *طلب جديد - ${restaurantName}*\n\n`
  
  message += `👤 *العميل:* ${customerName}\n`
  message += `📱 *الهاتف:* ${customerPhone}\n\n`
  
  message += `📦 *نوع الطلب:* ${orderType === 'delivery' ? '🚗 توصيل' : '🍽️ داخل المطعم'}\n`
  
  if (orderType === 'dine-in' && tableNumber) {
    message += `🪑 *رقم الطاولة:* ${tableNumber}\n`
  }
  
  if (orderType === 'delivery' && deliveryAddress) {
    message += `📍 *العنوان:* ${deliveryAddress}\n`
  }
  
  message += `\n━━━━━━━━━━━━━━━━\n`
  message += `*🛒 الأصناف المطلوبة:*\n\n`
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}`
    
    if (item.selectedVariant) {
      message += ` (${item.selectedVariant.name})`
    }
    
    message += ` - ${item.totalPrice} ج`
    
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      message += `\n   ➕ ${item.selectedAddons.map(a => a.name).join(', ')}`
    }
    
    message += `\n`
  })
  
  message += `\n━━━━━━━━━━━━━━━━\n`
  message += `💰 *الإجمالي:* ${totalAmount} ج\n`
  message += `💳 *طريقة الدفع:* ${paymentMethod === 'cash' ? 'كاش عند الاستلام' : 'InstaPay'}\n`
  
  if (notes) {
    message += `\n📝 *ملاحظات:* ${notes}\n`
  }
  
  message += `\n⏰ *الوقت:* ${new Date().toLocaleString('ar-EG')}\n`
  
  return message
}

// دالة لفتح WhatsApp مع الرسالة
export function sendWhatsAppNotification(whatsappNumber, message) {
  const formattedNumber = formatPhoneNumber(whatsappNumber)
  
  if (!formattedNumber) {
    console.error('رقم WhatsApp غير صحيح')
    return false
  }
  
  // ترميز الرسالة للـ URL
  const encodedMessage = encodeURIComponent(message)
  
  // إنشاء رابط WhatsApp
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`
  
  // فتح WhatsApp في نافذة جديدة
  window.open(whatsappUrl, '_blank')
  
  return true
}

// دالة شاملة لإرسال إشعار الطلب
export function notifyRestaurantOwner(restaurant, orderData, cartItems) {
  console.log('🔔 notifyRestaurantOwner called with:')
  console.log('- whatsapp_notifications:', restaurant.whatsapp_notifications)
  console.log('- whatsapp_number:', restaurant.whatsapp_number)
  console.log('- restaurant:', restaurant)
  
  if (!restaurant.whatsapp_notifications || !restaurant.whatsapp_number) {
    console.warn('❌ WhatsApp notifications disabled or no number set')
    return false
  }
  
  const message = createOrderMessage({
    restaurantName: restaurant.name,
    customerName: orderData.customer_name,
    customerPhone: orderData.customer_phone,
    orderType: orderData.order_type,
    tableNumber: orderData.table_number,
    deliveryAddress: orderData.delivery_address,
    items: cartItems,
    totalAmount: orderData.total_amount,
    paymentMethod: orderData.payment_method,
    notes: orderData.notes
  })
  
  console.log('📩 Sending WhatsApp message to:', restaurant.whatsapp_number)
  console.log('📄 Message:', message)
  
  return sendWhatsAppNotification(restaurant.whatsapp_number, message)
}
 
