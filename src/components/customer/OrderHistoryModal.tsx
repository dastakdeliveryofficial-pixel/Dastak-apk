import React from 'react';
import { motion } from 'motion/react';
import { 
  X, ShoppingBag, Clock, RotateCcw, MessageCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateWhatsAppOrderMessage, openWhatsAppChat } from '../../utils/whatsapp';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder
}) => {
  const { orders, currentUser, reorderPastOrder, triggerToast, t } = useApp();

  if (!isOpen) return null;

  const customerOrders = orders.filter(o => o.customerId === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">{t.delivered}</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">{t.orderCancelled}</span>;
      case 'out_for_delivery':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">{t.outForDelivery}</span>;
      default:
        return <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded capitalize">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-pink-100 overflow-hidden max-h-[85vh] flex flex-col text-[#1F2937]"
      >
        {/* Header */}
        <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-[#FFF5F8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#E11D74] border border-pink-200 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">{t.orderHistory}</h3>
              <p className="text-xs text-gray-400">Matli food delivery orders & receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {customerOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-pink-200 mx-auto mb-2" />
              <p className="font-bold text-gray-700 text-sm">{t.noOrders}</p>
              <p className="text-xs text-gray-400 mt-1">Your orders will appear here once placed.</p>
            </div>
          ) : (
            customerOrders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm space-y-3 hover:border-pink-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{order.restaurantName}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Order #{order.orderNumber} • {dateStr}
                      </span>
                    </div>

                    <span className="font-black text-gray-900 text-sm">
                      ₨ {order.total}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-gray-600 space-y-1 bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold text-gray-800">₨ {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        const msg = generateWhatsAppOrderMessage(order, 'customer');
                        openWhatsAppChat(order.restaurantPhone, msg);
                      }}
                      className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Bill</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onTrackOrder(order.id);
                        }}
                        className="text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-pink-200 hover:bg-pink-50 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Track Status
                      </button>

                      <button
                        onClick={() => {
                          reorderPastOrder(order.id);
                          triggerToast('Order Loaded', 'Items added to your cart', 'success');
                          onClose();
                        }}
                        className="text-xs font-bold text-white bg-[#E11D74] hover:bg-[#C2185B] px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
