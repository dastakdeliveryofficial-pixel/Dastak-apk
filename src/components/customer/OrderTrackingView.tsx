import React from 'react';
import { 
  ArrowLeft, CheckCircle2, Clock, MapPin, Phone, 
  MessageCircle, Bike, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { OrderStatus } from '../../types';
import { generateWhatsAppOrderMessage, openWhatsAppChat } from '../../utils/whatsapp';

interface OrderTrackingViewProps {
  orderId: string;
  onBack: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orderId,
  onBack
}) => {
  const { orders, simulateAdvanceOrderStatus, triggerToast, t } = useApp();

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-[#1F2937]">
        <AlertCircle className="w-12 h-12 text-pink-300 mb-2" />
        <h3 className="font-bold text-gray-800 text-lg">Order Not Found</h3>
        <p className="text-xs text-gray-400 mt-1">This order may have been removed or updated.</p>
        <button
          onClick={onBack}
          className="mt-4 bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: t.orderPlaced, desc: 'Sent to restaurant' },
    { key: 'confirmed', label: t.orderConfirmed, desc: 'Restaurant accepted' },
    { key: 'preparing', label: t.orderPreparing, desc: 'In the kitchen' },
    { key: 'out_for_delivery', label: t.outForDelivery, desc: 'Rider on the road' },
    { key: 'delivered', label: t.delivered, desc: 'Food arrived at doorstep' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const handleShareWhatsApp = () => {
    const msg = generateWhatsAppOrderMessage(order, 'customer');
    openWhatsAppChat(order.restaurantPhone, msg);
    triggerToast('WhatsApp Opened', 'Sharing order details on WhatsApp', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FFF5F8] pb-28 text-[#1F2937]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100 px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-[#E11D74] font-semibold text-xs bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider block">{t.orderTracking}</span>
          <span className="text-xs font-bold text-gray-900">Order #{order.orderNumber}</span>
        </div>

        {/* WhatsApp Share Bill Button */}
        <button
          onClick={handleShareWhatsApp}
          className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp Bill</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Status Card & ETA */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-pink-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E11D74] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.estimatedDelivery}: {order.estimatedDeliveryTime || '20-30 min'}
                </span>
                {order.paymentStatus === 'paid' ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Paid ({order.paymentMethod.toUpperCase()})
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    Cash on Delivery (₨ {order.total})
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 tracking-tight">
                {isCancelled ? t.orderCancelled : steps[currentStepIndex]?.label || 'In Progress'}
              </h1>
            </div>

            {/* Demo Advance Status Simulator Button */}
            {!isCancelled && order.status !== 'delivered' && (
              <button
                onClick={() => simulateAdvanceOrderStatus(order.id)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                <span>Simulate Next Step ⚡</span>
              </button>
            )}
          </div>

          {/* Stepper Progress Bar */}
          {!isCancelled ? (
            <div className="pt-2">
              <div className="grid grid-cols-5 gap-1 relative">
                {steps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#E11D74] text-white shadow-xs'
                            : 'bg-pink-50 text-pink-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold mt-1.5 line-clamp-1 ${
                        isCurrent ? 'text-[#E11D74]' : isDone ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[9px] text-gray-400 hidden sm:block">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800">
              Reason: {order.cancelReason || 'Order was cancelled by customer or vendor.'}
            </div>
          )}
        </div>

        {/* Live Interactive Map of Matli */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-pink-900/70 uppercase tracking-wider">
              Live Delivery Route (Matli Town)
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Real-time GPS Simulator
            </span>
          </div>

          <InteractiveMap
            restaurantName={order.restaurantName}
            restaurantArea={order.restaurantAddress}
            customerAddress={`${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.area}`}
            riderName={order.riderName || 'Assigning nearest Matli rider...'}
            status={order.status}
          />
        </div>

        {/* Rider & Contact Info */}
        {order.riderName && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-pink-100 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#E11D74] border border-pink-200 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#E11D74] bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                  {t.assignedRider}
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-0.5">{order.riderName}</h4>
                <p className="text-xs text-gray-400">Contact: {order.riderPhone || '0301-8899112'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.riderPhone || '03018899112'}`}
                className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-[#E11D74] transition-colors"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  const msg = `Salam ${order.riderName}! Where are you for Order #${order.orderNumber}?`;
                  openWhatsAppChat(order.riderPhone || '923018899112', msg);
                }}
                className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors"
                title="WhatsApp Rider"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Order Details & Bill Breakdown */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-pink-100 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-900 pb-2 border-b border-pink-100">
            {t.orderSummary}
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-pink-50 text-[#E11D74] font-bold flex items-center justify-center text-[10px]">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">₨ {item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-pink-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>{t.subtotal}</span>
              <span>₨ {order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>{t.deliveryFee}</span>
              <span>₨ {order.deliveryFee}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>{t.discount}</span>
                <span>- ₨ {order.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-pink-100">
              <span>{t.grandTotal}</span>
              <span className="text-[#E11D74] font-black">₨ {order.total}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-pink-100 text-xs text-gray-600 flex items-start gap-2 bg-pink-50/40 p-3 rounded-xl border border-pink-100">
            <MapPin className="w-4 h-4 text-[#E11D74] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block">{t.deliveryAddress}:</span>
              <p>{order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}, Matli</p>
              {order.deliveryAddress.landmark && (
                <p className="text-[11px] text-gray-400">Landmark: {order.deliveryAddress.landmark}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
