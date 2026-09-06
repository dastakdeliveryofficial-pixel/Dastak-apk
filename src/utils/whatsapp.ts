import { Order } from '../types';

export function generateWhatsAppOrderMessage(order: Order, type: 'vendor' | 'customer' | 'rider' = 'vendor'): string {
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentText = order.paymentMethod === 'cod' 
    ? '💵 Cash on Delivery (COD)' 
    : order.paymentMethod === 'jazzcash' 
      ? '📱 JazzCash (' + order.paymentStatus.toUpperCase() + ')' 
      : '📱 EasyPaisa (' + order.paymentStatus.toUpperCase() + ')';

  let itemsList = '';
  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const restTag = item.restaurantName ? ` [${item.restaurantName}]` : '';
    itemsList += `${index + 1}. *${item.name}*${restTag} x ${item.quantity} = ₨ ${itemTotal}\n`;
  });

  const message = `
*🛵 DASTAK DELIVERY - MATLI (دستک ڈیلیوری)*
━━━━━━━━━━━━━━━━━━━━
*Order ID:* #${order.orderNumber}
*Date/Time:* ${dateStr}
*Status:* ${order.status.toUpperCase()}

*🏪 Restaurant:* ${order.restaurantName}
*📍 Area:* ${order.restaurantAddress}

*👤 Customer Details:*
• Name: *${order.customerName}*
• Phone: *${order.customerPhone}*
• Address: *${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.area}, Matli*
${order.deliveryAddress.landmark ? `• Landmark: ${order.deliveryAddress.landmark}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
*🛒 ORDER ITEMS:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
• Subtotal: ₨ ${order.subtotal}
• Delivery Fee: ₨ ${order.deliveryFee}
${order.discount > 0 ? `• Discount: -₨ ${order.discount}\n` : ''}
*💰 TOTAL BILL: ₨ ${order.total}*
• Payment: *${paymentText}*
${order.specialInstructions ? `\n📝 Note: "${order.specialInstructions}"` : ''}
━━━━━━━━━━━━━━━━━━━━
_Thank you for ordering with Dastak Delivery Matli!_
_Apka Khana, Apki Dastak Par!_ 🍲
`.trim();

  return message;
}

export function generateRestaurantOrderDispatchSlip(order: Order): string {
  let itemsList = '';
  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    itemsList += `${index + 1}. *${item.name}* (${item.quantity} عدد) = ₨ ${itemTotal}\n`;
  });

  const message = `
*🔔 نیا آرڈر موصول ہوا - DASTAK DELIVERY MATLI*
━━━━━━━━━━━━━━━━━━━━
*آرڈر نمبر:* #${order.orderNumber}
*ہوٹل کا نام:* *${order.restaurantName}*
*وقت:* ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

*🛒 تیار کرنے کے آئٹمز (KITCHEN ITEMS):*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
*کل رقم (Total Bill):* ₨ ${order.total} (بل بشمول ڈیلیوری)
*ادائیگی کا طریقہ:* ${order.paymentMethod === 'cod' ? 'نقد ادائیگی (Cash on Delivery)' : 'آن لائن پیڈ'}
${order.specialInstructions ? `\n📝 *گاہک کی خصوصی ہدایت:* "${order.specialInstructions}"` : ''}

*📍 ڈیلیوری کا علاقہ:*
${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.area}, ماتلی
${order.deliveryAddress.landmark ? `(نزدیک: ${order.deliveryAddress.landmark})` : ''}

━━━━━━━━━━━━━━━━━━━━
_براہ کرم کھانا فوری طور پر تازہ تیار کریں تاکہ رائیڈر وقت پر اٹھا سکے۔_
_دستک ڈیلیوری ماتلی - ہیلپ لائن: 0301-2345678_
`.trim();

  return message;
}

export function openWhatsAppChat(phone: string, text: string) {

  // Clean phone number (replace leading 0 with 92, remove hyphens/spaces)
  let cleanNumber = phone.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '92' + cleanNumber.slice(1);
  }
  
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
  window.open(url, '_blank');
}
