import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bike, Power, MapPin, Phone, MessageCircle, DollarSign, 
  CheckCircle2, Navigation, Clock, ShieldCheck, Wallet, 
  AlertCircle, ChevronRight, User, Sparkles, Store, Home, Banknote,
  MessageSquare, Lock, PhoneOff, Bell, LogOut, Volume2, VolumeX
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const RiderApp: React.FC = () => {
  const { 
    riders, 
    activeRiderId, 
    setActiveRiderId, 
    orders, 
    toggleRiderOnline, 
    riderClaimDelivery, 
    riderCompleteDelivery,
    updateOrderStatus,
    allowRiderViewCustomerInfo,
    openAloChat,
    openLoginModal,
    triggerToast,
    unreadNotificationCount,
    openNotificationCenter,
    logoutUser,
    firestoreNotifications,
    markNotificationAsRead,
    isSoundEnabled,
    setIsSoundEnabled
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'earnings' | 'profile'>('active');

  const currentRider = riders.find(r => r.id === activeRiderId) || riders[0];

  // Rider's active assigned delivery
  const riderActiveOrder = currentRider ? orders.find(
    o => o.riderId === currentRider.id && o.status !== 'delivered' && o.status !== 'cancelled'
  ) : undefined;

  // Orders available for pickup (status: placed or confirmed or preparing, without rider assigned)
  const availableOrders = orders.filter(
    o => (!o.riderId || o.riderId === '') && (o.status === 'confirmed' || o.status === 'preparing' || o.status === 'placed')
  );

  // Rider's completed deliveries
  const completedOrders = currentRider ? orders.filter(
    o => o.riderId === currentRider.id && o.status === 'delivered'
  ) : [];

  const handleMarkPickedUp = (orderId: string) => {
    updateOrderStatus(orderId, 'out_for_delivery');
    triggerToast('Order Picked Up', 'You are now on the way to the customer in Matli', 'success');
  };

  const handleCompleteOrder = (orderId: string) => {
    riderCompleteDelivery(orderId);
  };

  if (!currentRider) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 text-[#1F2937]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-pink-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Rider Profile Registered</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Join the Matli delivery fleet today to earn per delivery across all areas of Matli with instant payouts.
          </p>
          <button
            onClick={() => openLoginModal('rider')}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Bike className="w-4 h-4" />
            <span>+ Join Delivery Fleet as Rider</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 text-[#1F2937]">
      {/* Top Rider Bar */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center font-bold shadow-xs">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded">
                  Dastak Delivery Partner
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> CNIC Verified
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {currentRider.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Vehicle: {currentRider.vehiclePlateNumber} • Zone: {currentRider.currentArea}, Matli
              </p>
            </div>
          </div>

          {/* Quick Profile Switcher & Online Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Rider Selector */}
            <div className="bg-gray-50 p-1 rounded-xl border border-gray-200 flex items-center gap-2">
              <span className="text-xs text-gray-500 pl-2 font-medium">Switch Rider:</span>
              <select
                value={activeRiderId}
                onChange={(e) => setActiveRiderId(e.target.value)}
                className="bg-white text-xs font-bold text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              >
                {riders.map((rd) => (
                  <option key={rd.id} value={rd.id}>
                    {rd.name} ({rd.currentArea})
                  </option>
                ))}
              </select>
            </div>

            {/* Online / Offline Switch */}
            <button
              onClick={() => toggleRiderOnline(currentRider.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                currentRider.isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentRider.isOnline ? 'ONLINE (Ready)' : 'OFFLINE'}</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={openNotificationCenter}
              className="relative p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs transition-all flex items-center gap-1.5"
              title="Real-time Order Notifications"
            >
              <Bell className="w-4 h-4 text-[#FF6B00]" />
              <span className="text-xs font-bold hidden sm:inline text-gray-700">Alerts</span>
              {unreadNotificationCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-xs">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
                isSoundEnabled
                  ? 'bg-orange-50 border-orange-200 text-[#FF6B00]'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
              title={isSoundEnabled ? 'Alert Chime Sound: ON' : 'Alert Chime Sound: OFF'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Rider Logout Button (Clean hard reload & state purge) */}
            <button
              onClick={() => logoutUser()}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Logout from Rider Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Real-time Order Notification Banner */}
        {firestoreNotifications.some(n => !n.read) && (
          <div className="max-w-7xl mx-auto mt-4 p-3 bg-gradient-to-r from-[#FF6B00] to-amber-600 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-base shrink-0 animate-bounce">
                🔔
              </span>
              <div className="min-w-0">
                <p className="font-black text-xs sm:text-sm truncate">
                  New order placed in Matli!
                </p>
                <p className="text-[11px] text-orange-100 truncate">
                  {firestoreNotifications.find(n => !n.read)?.customerName} • {firestoreNotifications.find(n => !n.read)?.items} (₨ {firestoreNotifications.find(n => !n.read)?.total})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const unread = firestoreNotifications.find(n => !n.read);
                  if (unread) markNotificationAsRead(unread.id);
                  openNotificationCenter();
                }}
                className="bg-white text-[#FF6B00] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:bg-orange-50 transition-colors"
              >
                View & Mark Read
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today's Deliveries</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
              {currentRider.earningsToday > 0 ? Math.round(currentRider.earningsToday / 60) : 0} Orders
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today's Earnings</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">
              ₨ {currentRider.earningsToday.toLocaleString()}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Rider Rating</span>
            <span className="text-xl sm:text-2xl font-black text-amber-500 mt-1 block">
              ★ {currentRider.rating}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
              ₨ {currentRider.walletBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Active Delivery</span>
            {riderActiveOrder && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'available'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Available Requests ({availableOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'earnings'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Earnings & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Vehicle</span>
          </button>
        </div>

        {/* Tab 1: ACTIVE DELIVERY FLOW */}
        {activeTab === 'active' && (
          <div className="mt-6 space-y-6">
            {!riderActiveOrder ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <Bike className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-gray-800">No Active Delivery Task</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  {currentRider.isOnline 
                    ? 'You are online and ready! Check available requests tab to claim a delivery in Matli.'
                    : 'You are currently offline. Turn on your status above to receive delivery tasks.'}
                </p>
                {currentRider.isOnline && availableOrders.length > 0 && (
                  <button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    View {availableOrders.length} Available Orders
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Order Card Header */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[9px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        Current Delivery Job
                      </span>
                      <h2 className="text-lg font-black text-gray-900 mt-1">
                        Order #{riderActiveOrder.orderNumber}
                      </h2>
                      <span className="text-xs text-gray-400">
                        Payment: <strong className="text-gray-700">{riderActiveOrder.paymentMethod.toUpperCase()}</strong> ({riderActiveOrder.paymentStatus})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Total Bill</span>
                        <span className="text-base font-black text-gray-900">₨ {riderActiveOrder.total}</span>
                      </div>
                      <div className="text-right border-l border-gray-200 pl-3">
                        <span className="text-[10px] text-gray-400 block">Your Fee</span>
                        <span className="text-base font-black text-emerald-600">₨ {riderActiveOrder.deliveryFee}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Delivery Workflow Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className={`p-2.5 rounded-xl border text-xs ${
                      riderActiveOrder.status === 'confirmed' || riderActiveOrder.status === 'preparing'
                        ? 'bg-orange-50 border-orange-200 text-[#FF6B00] font-bold'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <span className="block text-[9px] opacity-70">Step 1</span>
                      <span>Go to Restaurant</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-xs ${
                      riderActiveOrder.status === 'preparing'
                        ? 'bg-orange-50 border-orange-200 text-[#FF6B00] font-bold'
                        : riderActiveOrder.status === 'out_for_delivery'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      <span className="block text-[9px] opacity-70">Step 2</span>
                      <span>Pick Up Food</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-xs ${
                      riderActiveOrder.status === 'out_for_delivery'
                        ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      <span className="block text-[9px] opacity-70">Step 3</span>
                      <span>Deliver to Customer</span>
                    </div>

                    <div className="p-2.5 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 text-xs">
                      <span className="block text-[9px] opacity-70">Step 4</span>
                      <span>Collect Cash / Complete</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Navigation & Route Map (Matli)
                  </h3>
                  <InteractiveMap
                    restaurantName={riderActiveOrder.restaurantName}
                    restaurantArea={riderActiveOrder.restaurantAddress}
                    customerAddress={`${riderActiveOrder.deliveryAddress.streetAddress}, ${riderActiveOrder.deliveryAddress.area}`}
                    riderName={currentRider.name}
                    status={riderActiveOrder.status}
                  />
                </div>

                {/* Location Cards: Pickup Point & Dropoff Point */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pickup: Restaurant */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded uppercase">
                        1. Pickup From
                      </span>
                      <a
                        href={`tel:${riderActiveOrder.restaurantPhone}`}
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 p-1.5 rounded-lg"
                        title="Call restaurant"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-[#FF6B00]" />
                        {riderActiveOrder.restaurantNames && riderActiveOrder.restaurantNames.length > 1 ? (
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span>{riderActiveOrder.restaurantName}</span>
                            <span className="bg-orange-100 text-[#FF6B00] text-[10px] font-bold px-1.5 py-0.2 rounded">
                              {riderActiveOrder.restaurantNames.length} Pickups
                            </span>
                          </span>
                        ) : (
                          riderActiveOrder.restaurantName
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{riderActiveOrder.restaurantAddress}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Phone: {riderActiveOrder.restaurantPhone}</p>
                    </div>

                    {riderActiveOrder.status !== 'out_for_delivery' && (
                      <button
                        onClick={() => handleMarkPickedUp(riderActiveOrder.id)}
                        className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-xs"
                      >
                        ✓ Confirm Picked Up from {riderActiveOrder.restaurantNames && riderActiveOrder.restaurantNames.length > 1 ? 'All Restaurants' : 'Restaurant'}
                      </button>
                    )}
                  </div>

                  {/* Dropoff: Customer */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                        2. Deliver To
                      </span>

                      {/* Contact Options: Privacy protected or Admin Approved */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openAloChat(riderActiveOrder.id)}
                          className="bg-pink-50 hover:bg-pink-100 text-[#E11D74] border border-pink-200 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
                          title="Open In-App Alo Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Alo Chat</span>
                        </button>

                        {allowRiderViewCustomerInfo ? (
                          <>
                            <a
                              href={`tel:${riderActiveOrder.customerPhone}`}
                              className="text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 p-1.5 rounded-lg"
                              title="Call customer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                const msg = `Salam ${riderActiveOrder.customerName}! I am your Dastak Delivery rider with Order #${riderActiveOrder.orderNumber}.`;
                                openWhatsAppChat(riderActiveOrder.customerPhone, msg);
                              }}
                              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg border border-emerald-200"
                              title="WhatsApp customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span 
                            title="Direct number hidden by Admin. Use In-App Alo Chat for customer communication." 
                            className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 flex items-center gap-1"
                          >
                            <PhoneOff className="w-3 h-3 text-rose-500" />
                            <span>Privacy Mode</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-emerald-600" />
                        {riderActiveOrder.customerName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {riderActiveOrder.deliveryAddress.streetAddress}, {riderActiveOrder.deliveryAddress.area}, Matli
                      </p>
                      {riderActiveOrder.deliveryAddress.landmark && (
                        <p className="text-[10px] text-orange-900 bg-orange-50 p-1 rounded mt-1 border border-orange-100">
                          Landmark: {riderActiveOrder.deliveryAddress.landmark}
                        </p>
                      )}
                      {!allowRiderViewCustomerInfo && (
                        <p className="text-[10px] text-gray-400 mt-1 italic">
                          🔒 Phone number protected. Communicate seamlessly via Alo Chat.
                        </p>
                      )}
                    </div>

                    {/* Completion Action */}
                    {riderActiveOrder.status === 'out_for_delivery' ? (
                      <button
                        onClick={() => handleCompleteOrder(riderActiveOrder.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Delivered & Collect ₨ {riderActiveOrder.total}</span>
                      </button>
                    ) : (
                      <span className="block text-center text-gray-400 text-xs py-2">
                        Pick up from restaurant first
                      </span>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AVAILABLE REQUESTS */}
        {activeTab === 'available' && (
          <div className="mt-6 space-y-4">
            <h3 className="font-bold text-base text-gray-900">
              New Delivery Requests in Matli ({availableOrders.length})
            </h3>

            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-sm">No pending delivery requests</h4>
                <p className="text-xs text-gray-400 mt-1">New customer orders will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-[#FF6B00] bg-orange-50 px-1.5 py-0.5 rounded">
                          {order.status.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 mt-1">
                          Order #{order.orderNumber}
                        </h4>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <span>{order.restaurantName}</span>
                          {order.restaurantNames && order.restaurantNames.length > 1 && (
                            <span className="bg-orange-100 text-[#FF6B00] text-[9px] font-bold px-1 rounded">
                              {order.restaurantNames.length} Pickups
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Earning</span>
                        <span className="text-sm font-black text-emerald-600">₨ {order.deliveryFee || 60}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span className="truncate"><strong>Pickup:</strong> {order.restaurantAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate"><strong>Drop:</strong> {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] pt-1">
                        <Banknote className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Collect Cash: ₨ {order.total} ({order.paymentMethod.toUpperCase()})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        riderClaimDelivery(order.id, currentRider.id);
                        setActiveTab('active');
                      }}
                      className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-2 rounded-xl shadow-xs transition-colors"
                    >
                      Accept Delivery Task 🛵
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: EARNINGS & PAYOUTS */}
        {activeTab === 'earnings' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today's Earnings</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">
                  ₨ {currentRider.earningsToday.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  From {currentRider.earningsToday > 0 ? Math.round(currentRider.earningsToday / 60) : 0} deliveries today
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">This Week's Earnings</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
                  ₨ {currentRider.earningsWeekly.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Direct JazzCash transfer every Monday
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">All-time Lifetime Earnings</span>
                <span className="text-xl sm:text-2xl font-black text-[#FF6B00] mt-1 block">
                  ₨ {currentRider.totalEarnings.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  {currentRider.totalDeliveries} total completed deliveries
                </span>
              </div>
            </div>

            {/* Delivery History */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900">
                  Completed Deliveries History ({completedOrders.length})
                </h3>
                <span className="text-xs text-emerald-600 font-bold">
                  Total Earned: ₨ {completedOrders.reduce((sum, o) => sum + (o.deliveryFee || 60), 0).toLocaleString()}
                </span>
              </div>

              {completedOrders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                  <Bike className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">No completed deliveries recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {completedOrders.map((order) => {
                    const timeStr = new Date(order.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={order.id}
                        className="p-3 bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">Order #{order.orderNumber}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                              Delivered ✓
                            </span>
                          </div>
                          <span className="text-gray-500 text-[11px] block">
                            <strong>{order.restaurantName}</strong> → {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {timeStr} • Total Bill: ₨ {order.total} ({order.paymentMethod.toUpperCase()})
                          </span>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-1.5 sm:pt-0 border-gray-200">
                          <span className="text-xs font-black text-emerald-600">
                            + ₨ {order.deliveryFee || 60} Earned
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Cash Collected: ₨ {order.total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: RIDER PROFILE */}
        {activeTab === 'profile' && (
          <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-xl space-y-4">
            <h3 className="font-bold text-base text-gray-900 pb-2 border-b border-gray-100">
              Rider Identity & Verification
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-emerald-900 block">Verified Delivery Partner</span>
                    <span className="text-[11px] text-emerald-700">Govt. CNIC & Driving License Checked</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded shadow-xs">
                  ACTIVE
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={currentRider.name}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  disabled
                  value={currentRider.phone}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">CNIC Number</label>
                <input
                  type="text"
                  disabled
                  value={currentRider.cnicNumber}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Vehicle Plate Number</label>
                <input
                  type="text"
                  disabled
                  value={currentRider.vehiclePlateNumber}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Operating Zone</label>
                <input
                  type="text"
                  disabled
                  value={`${currentRider.currentArea}, Matli (Sindh)`}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => logoutUser()}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout from Rider Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
