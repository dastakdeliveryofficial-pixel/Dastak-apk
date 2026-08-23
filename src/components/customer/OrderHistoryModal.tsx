import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, ShoppingBag, Clock, RotateCcw, MessageCircle, 
  MapPin, Bike, Search, CheckCircle2, ChevronRight,
  ExternalLink, Phone, Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateWhatsAppOrderMessage, openWhatsAppChat } from '../../utils/whatsapp';
import { Order } from '../../types';

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter orders for the current customer (matching by customerId, phone, or name)
  const customerOrders = orders.filter(o => {
    const isOwner = o.customerId === currentUser.id || 
                    (currentUser.phone && o.customerPhone === currentUser.phone) ||
                    (currentUser.name && o.customerName === currentUser.name);
    return isOwner;
  });

  const filteredOrders = customerOrders.filter(order => {
    // Tab filter
    if (activeFilter === 'active') {
      if (order.status === 'delivered' || order.status === 'cancelled') return false;
    } else if (activeFilter === 'delivered') {
      if (order.status !== 'delivered') return false;
    } else if (activeFilter === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchRest = order.restaurantName.toLowerCase().includes(q);
      const matchItem = order.items.some(i => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchRest && !matchItem) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t.delivered}
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {t.orderCancelled}
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-amber-300">
            <Bike className="w-3 h-3 text-amber-700" />
            {t.outForDelivery}
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-orange-100 text-orange-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-orange-300">
            <Clock className="w-3 h-3 text-orange-700" />
            {t.orderPreparing}
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {t.orderConfirmed}
          </span>
        );
      default:
        return (
          <span className="bg-pink-100 text-[#E11D74] text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
            {status}
          </span>
        );
    }
  };

  const activeCount = customerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-pink-100 overflow-hidden max-h-[90vh] flex flex-col text-[#1F2937]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-[#FFF5F8] to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#E11D74] border border-pink-200 flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-gray-900">{t.orderHistory}</h3>
                {activeCount > 0 && (
                  <span className="bg-[#E11D74] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {activeCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">View live tracking, past deliveries & bills for Matli</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-pink-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-pink-50 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-pink-100 bg-white space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant, item, or order #..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-[#E11D74] text-white shadow-2xs'
                  : 'bg-pink-50/60 text-gray-600 hover:bg-pink-100'
              }`}
            >
              All Orders ({customerOrders.length})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                activeFilter === 'active'
                  ? 'bg-[#E11D74] text-white shadow-2xs'
                  : 'bg-pink-50/60 text-gray-600 hover:bg-pink-100'
              }`}
            >
              <span>Active</span>
              {activeCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveFilter('delivered')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeFilter === 'delivered'
                  ? 'bg-[#E11D74] text-white shadow-2xs'
                  : 'bg-pink-50/60 text-gray-600 hover:bg-pink-100'
              }`}
            >
              Completed ({customerOrders.filter(o => o.status === 'delivered').length})
            </button>
            <button
              onClick={() => setActiveFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeFilter === 'cancelled'
                  ? 'bg-[#E11D74] text-white shadow-2xs'
                  : 'bg-pink-50/60 text-gray-600 hover:bg-pink-100'
              }`}
            >
              Cancelled ({customerOrders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-3 border border-pink-200">
                <ShoppingBag className="w-8 h-8 text-pink-300" />
              </div>
              <h4 className="font-bold text-gray-800 text-base">{t.noOrders}</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {searchQuery ? 'No orders match your search criteria.' : 'Your placed orders in Matli will appear here with live tracking & receipts.'}
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                {t.exploreRestaurants}
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs space-y-3.5 ${
                    isActive 
                      ? 'border-[#E11D74] ring-2 ring-pink-100 shadow-md' 
                      : 'border-pink-100 hover:border-pink-300'
                  }`}
                >
                  {/* Top Row: Restaurant, Order # & Status */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-pink-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm sm:text-base text-gray-900">
                          {order.restaurantName}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span className="font-mono font-bold text-gray-600">#{order.orderNumber}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-base sm:text-lg text-gray-900 block">
                        ₨ {order.total}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-gray-700 space-y-1.5 bg-pink-50/40 p-3 rounded-xl border border-pink-100/80">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-white border border-pink-200 text-[#E11D74] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-medium truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 shrink-0 ml-2">
                          ₨ {item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-1 border-t border-pink-100 flex justify-between text-[11px] text-gray-500">
                      <span>Delivery ({order.deliveryAddress?.area || 'Matli'})</span>
                      <span>₨ {order.deliveryFee}</span>
                    </div>
                  </div>

                  {/* Delivery Location & Rider info if assigned */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#E11D74] shrink-0" />
                      <span className="truncate">
                        {order.deliveryAddress?.streetAddress ? `${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.area}` : 'Matli Delivery'}
                      </span>
                    </div>
                    {order.riderName && (
                      <div className="flex items-center gap-1.5 shrink-0 text-emerald-700 font-semibold text-[11px]">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Rider: {order.riderName}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const msg = generateWhatsAppOrderMessage(order, 'customer');
                          openWhatsAppChat(order.restaurantPhone, msg);
                        }}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                        title="Send / View WhatsApp Bill"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Bill</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Live Tracking Button */}
                      <button
                        onClick={() => {
                          onClose();
                          onTrackOrder(order.id);
                        }}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white shadow-xs'
                            : 'bg-white border border-pink-200 text-gray-700 hover:bg-pink-50'
                        }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>{isActive ? 'Track Live Status' : 'View Tracking'}</span>
                      </button>

                      {/* Reorder Button */}
                      <button
                        onClick={() => {
                          reorderPastOrder(order.id);
                          triggerToast('Order Loaded', `Items from ${order.restaurantName} added to your cart`, 'success');
                          onClose();
                        }}
                        className="text-xs font-bold text-gray-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#E11D74]" />
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
