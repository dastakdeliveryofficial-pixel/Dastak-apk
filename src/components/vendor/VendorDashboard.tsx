import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UtensilsCrossed, TrendingUp, DollarSign, Clock, ShoppingBag, 
  CheckCircle2, XCircle, User, Phone, MapPin, Bike, Sparkles, 
  Plus, Edit, Trash2, Power, MessageCircle, AlertCircle, 
  ChevronRight, BarChart3, Settings, Flame, Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem, Order, OrderStatus } from '../../types';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const VendorDashboard: React.FC = () => {
  const { 
    restaurants, 
    activeVendorRestaurantId, 
    setActiveVendorRestaurantId,
    menuItems, 
    orders, 
    riders,
    updateOrderStatus, 
    assignRiderToOrder,
    toggleRestaurantStatus,
    updateRestaurantDetails,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    triggerToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'deals' | 'reports' | 'profile'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('active');

  // Modal states for Menu Item CRUD
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemNameUrdu, setItemNameUrdu] = useState('');
  const [itemCategory, setItemCategory] = useState('biryani');
  const [itemPrice, setItemPrice] = useState<number>(250);
  const [itemDiscountedPrice, setItemDiscountedPrice] = useState<number | undefined>(undefined);
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemPrepTime, setItemPrepTime] = useState('15 min');
  const [itemIsCombo, setItemIsCombo] = useState(false);
  const [itemComboItemsStr, setItemComboItemsStr] = useState('');

  // Sample image suggestions for quick upload/selection
  const sampleImages = [
    { label: 'Biryani Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Zinger Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
    { label: 'Karahi / Curry', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80' },
    { label: 'BBQ Boti & Kabab', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80' },
    { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sweets & Kheer', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80' },
    { label: 'Karak Chai', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80' }
  ];

  const currentRestaurant = restaurants.find(r => r.id === activeVendorRestaurantId) || restaurants[0];
  const restaurantOrders = currentRestaurant ? orders.filter(o => o.restaurantId === currentRestaurant.id) : [];
  const restaurantMenu = currentRestaurant ? menuItems.filter(i => i.restaurantId === currentRestaurant.id) : [];

  // Filter orders by tab
  const filteredOrders = restaurantOrders.filter(order => {
    if (orderFilter === 'active') {
      return order.status !== 'delivered' && order.status !== 'cancelled';
    }
    if (orderFilter === 'completed') return order.status === 'delivered';
    if (orderFilter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  // Calculate stats
  const todayOrders = restaurantOrders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);
  const pendingOrdersCount = restaurantOrders.filter(o => o.status === 'placed' || o.status === 'confirmed' || o.status === 'preparing').length;

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemNameUrdu('');
    setItemCategory(currentRestaurant.categories[0] || 'biryani');
    setItemPrice(250);
    setItemDiscountedPrice(undefined);
    setItemDescription('');
    setItemImage(sampleImages[0].url);
    setItemPrepTime('15 min');
    setItemIsCombo(false);
    setItemComboItemsStr('');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemNameUrdu(item.nameUrdu || '');
    setItemCategory(item.category);
    setItemPrice(item.price);
    setItemDiscountedPrice(item.discountedPrice);
    setItemDescription(item.description);
    setItemImage(item.image);
    setItemPrepTime(item.preparationTime || '15 min');
    setItemIsCombo(!!item.isCombo);
    setItemComboItemsStr(item.comboItems ? item.comboItems.join(', ') : '');
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const comboItems = itemIsCombo && itemComboItemsStr.trim()
      ? itemComboItemsStr.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const itemData = {
      restaurantId: currentRestaurant.id,
      name: itemName.trim(),
      nameUrdu: itemNameUrdu.trim() || undefined,
      category: itemCategory,
      price: Number(itemPrice),
      discountedPrice: itemDiscountedPrice ? Number(itemDiscountedPrice) : undefined,
      description: itemDescription.trim() || 'Freshly prepared delicious item in Matli.',
      image: itemImage.trim() || sampleImages[0].url,
      isAvailable: editingItem ? editingItem.isAvailable : true,
      preparationTime: itemPrepTime,
      isCombo: itemIsCombo,
      comboItems: comboItems
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }

    setIsItemModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 text-[#1F2937]">
      {/* Top Banner & Active Restaurant Selector */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center font-bold shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded">
                  Vendor Control Panel
                </span>
                <span className="text-xs text-gray-400">Matli, Sindh</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {currentRestaurant.name}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{currentRestaurant.address}, {currentRestaurant.area}</span>
              </p>
            </div>
          </div>

          {/* Quick Controls: Switch Hotel & Open/Closed Status Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Restaurant Selector */}
            <div className="bg-gray-50 p-1 rounded-xl border border-gray-200 flex items-center gap-2">
              <span className="text-xs text-gray-500 pl-2 font-medium">Switch Kitchen:</span>
              <select
                value={activeVendorRestaurantId}
                onChange={(e) => setActiveVendorRestaurantId(e.target.value)}
                className="bg-white text-xs font-bold text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Store Open/Close Switch */}
            <button
              onClick={() => toggleRestaurantStatus(currentRestaurant.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                currentRestaurant.isOpen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentRestaurant.isOpen ? 'STORE IS OPEN' : 'STORE CLOSED'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today's Orders</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-gray-900">{todayOrders.length}</span>
              <span className="text-xs text-[#FF6B00] font-bold">{pendingOrdersCount} pending</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today's Revenue</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">₨ {todayRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Customer Rating</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-500">★ {currentRestaurant.rating}</span>
              <span className="text-xs text-gray-400">({currentRestaurant.reviewsCount})</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Menu Items</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-gray-900">{restaurantMenu.length}</span>
              <span className="text-xs text-gray-400 font-medium">available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-white text-[#FF6B00] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Menu ({restaurantMenu.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deals'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Combos & Deals</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sales & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {(['active', 'all', 'completed', 'cancelled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold capitalize transition-colors ${
                      orderFilter === filter
                        ? 'bg-[#FF6B00] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'active' ? '⚡ Active / Incoming' : filter}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-400 font-medium">
                {filteredOrders.length} orders
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="font-bold text-gray-800 text-sm">No orders in this view</h3>
                <p className="text-xs text-gray-400 mt-1">Incoming customer orders in Matli will appear here live.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleTimeString('en-PK', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl p-4 border shadow-sm transition-all space-y-3.5 ${
                        order.status === 'placed'
                          ? 'border-[#FF6B00] ring-1 ring-orange-200 bg-orange-50/10'
                          : 'border-gray-100'
                      }`}
                    >
                      {/* Order Top Bar */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">
                              Order #{order.orderNumber}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              order.status === 'placed'
                                ? 'bg-orange-50 text-[#FF6B00] animate-pulse font-extrabold'
                                : order.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700'
                                : order.status === 'preparing'
                                ? 'bg-amber-50 text-amber-700'
                                : order.status === 'out_for_delivery'
                                ? 'bg-purple-50 text-purple-700'
                                : order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Received: {dateStr} • {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-gray-900 block">₨ {order.total}</span>
                          <span className="text-[10px] text-gray-400">{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                        </div>
                      </div>

                      {/* Customer Info & Matli Address */}
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {order.customerName}
                          </span>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-gray-600 hover:text-gray-900 bg-white border border-gray-200 p-1 rounded-lg"
                              title="Call customer"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => {
                                const msg = `Salam ${order.customerName}! Your order #${order.orderNumber} from ${currentRestaurant.name} is being processed.`;
                                openWhatsAppChat(order.customerPhone, msg);
                              }}
                              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-1 rounded-lg"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-500 text-[11px] flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#FF6B00] shrink-0" />
                          <span>{order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}, Matli</span>
                        </p>
                        {order.specialInstructions && (
                          <p className="text-orange-900 text-[10px] font-medium bg-orange-50 p-1.5 rounded border border-orange-100">
                            Note: "{order.specialInstructions}"
                          </p>
                        )}
                      </div>

                      {/* Items Breakdown */}
                      <div className="space-y-1 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-0.5 border-b border-gray-50 text-[11px]">
                            <span className="font-medium text-gray-700">
                              <strong className="text-[#FF6B00]">{item.quantity}x</strong> {item.name}
                            </span>
                            <span className="font-bold text-gray-900">₨ {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Assigned Rider Indicator & Assign Selector */}
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Bike className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                          <div>
                            <span className="font-bold text-gray-800 text-[11px]">
                              Rider: {order.riderName || 'Not assigned yet'}
                            </span>
                            {order.riderPhone && (
                              <span className="text-[9px] text-gray-400 block">{order.riderPhone}</span>
                            )}
                          </div>
                        </div>

                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            value={order.riderId || ''}
                            onChange={(e) => assignRiderToOrder(order.id, e.target.value)}
                            className="text-[10px] font-bold bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          >
                            <option value="">Assign Rider...</option>
                            {riders.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.isOnline ? 'Online' : 'Offline'})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                        {order.status === 'placed' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="flex-1 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-2 rounded-xl transition-colors"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled', undefined, 'Store busy or item sold out')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                          >
                            Start Preparing (Kitchen)
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => {
                              const autoRider = riders.find(r => r.isOnline) || riders[0];
                              updateOrderStatus(order.id, 'out_for_delivery', order.riderId || autoRider.id);
                            }}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                          >
                            Food Ready → Handover to Rider
                          </button>
                        )}

                        {order.status === 'out_for_delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                          >
                            Mark Delivered & Complete
                          </button>
                        )}

                        {order.status === 'delivered' && (
                          <div className="w-full text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
                            ✓ Order successfully delivered & paid
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Menu Items Catalog ({restaurantMenu.length})
                </h3>
                <p className="text-xs text-gray-500">Manage dishes, prices (₨ PKR), photos, and availability status</p>
              </div>

              <button
                onClick={openAddItemModal}
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurantMenu.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col justify-between gap-3 ${
                    item.isAvailable ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-60 bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="relative h-32 rounded-xl overflow-hidden mb-2.5 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="text-[9px] font-bold bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded uppercase">
                          {item.category}
                        </span>
                        {item.isCombo && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                            Deal
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleMenuItemAvailability(item.id)}
                        className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded shadow-xs transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Sold Out'}
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                    {item.nameUrdu && (
                      <p className="text-xs font-urdu text-gray-400 font-medium">{item.nameUrdu}</p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-gray-900">
                          ₨ {item.discountedPrice || item.price}
                        </span>
                        {item.discountedPrice && (
                          <span className="text-[10px] text-gray-400 line-through">₨ {item.price}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400">Prep: {item.preparationTime || '15 min'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="Edit dish"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: COMBOS & DEALS */}
        {activeTab === 'deals' && (
          <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Combo Deals & Discount Pricing
                </h3>
                <p className="text-xs text-gray-500">Create family bundles and discounted packages for Matli customers</p>
              </div>

              <button
                onClick={() => {
                  openAddItemModal();
                  setItemIsCombo(true);
                }}
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Deal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurantMenu.filter(i => i.isCombo || i.discountedPrice).map((deal) => (
                <div key={deal.id} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-[#FF6B00] bg-orange-50 px-1.5 py-0.5 rounded">
                        Active Deal
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 mt-1">{deal.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{deal.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-gray-900 block">
                        ₨ {deal.discountedPrice || deal.price}
                      </span>
                      {deal.discountedPrice && (
                        <span className="text-[10px] text-gray-400 line-through">₨ {deal.price}</span>
                      )}
                    </div>
                  </div>

                  {deal.comboItems && (
                    <div className="text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-200">
                      <strong>Includes:</strong> {deal.comboItems.join(', ')}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => openEditItemModal(deal)}
                      className="text-xs font-bold text-[#FF6B00] hover:underline"
                    >
                      Edit Deal Settings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: SALES REPORTS */}
        {activeTab === 'reports' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Lifetime Sales</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
                  ₨ {currentRestaurant.totalRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  +18% growth this month in Matli
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Orders Processed</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
                  {currentRestaurant.totalOrdersCount}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Average ticket: ₨ 850
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Platform Commission</span>
                <span className="text-xl sm:text-2xl font-black text-[#FF6B00] mt-1 block">
                  {currentRestaurant.commissionRate}%
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Weekly payout to JazzCash/Bank
                </span>
              </div>
            </div>

            {/* Sales Bar Graphic representation */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">
                Weekly Revenue Overview (PKR ₨)
              </h3>

              <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-gray-100">
                {[
                  { day: 'Mon', amount: 14500, height: '40%' },
                  { day: 'Tue', amount: 18200, height: '52%' },
                  { day: 'Wed', amount: 16900, height: '48%' },
                  { day: 'Thu', amount: 22400, height: '65%' },
                  { day: 'Fri', amount: 38000, height: '95%' },
                  { day: 'Sat', amount: 42000, height: '100%' },
                  { day: 'Sun', amount: 35000, height: '85%' }
                ].map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₨ {bar.amount / 1000}k
                    </span>
                    <div
                      style={{ height: bar.height }}
                      className="w-full max-w-[32px] bg-[#FF6B00] rounded-t-lg group-hover:brightness-95 transition-all shadow-xs"
                    />
                    <span className="text-[11px] font-bold text-gray-600 mt-1">{bar.day}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-gray-400 text-right">
                *Peak order days in Matli: Friday, Saturday & Sunday evenings
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: RESTAURANT PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-2xl space-y-4">
            <h3 className="font-bold text-base text-gray-900 pb-2 border-b border-gray-100">
              Restaurant Details & Timings
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={currentRestaurant.name}
                  onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Name in Urdu</label>
                <input
                  type="text"
                  value={currentRestaurant.nameUrdu || ''}
                  onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { nameUrdu: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-urdu font-semibold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={currentRestaurant.phone}
                    onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">WhatsApp Order Number</label>
                  <input
                    type="text"
                    value={currentRestaurant.whatsappNumber}
                    onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { whatsappNumber: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery Time (min)</label>
                  <input
                    type="text"
                    value={currentRestaurant.deliveryTime}
                    onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { deliveryTime: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery Fee (₨)</label>
                  <input
                    type="number"
                    value={currentRestaurant.deliveryFee}
                    onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { deliveryFee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={currentRestaurant.openingHours}
                  onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { openingHours: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Address in Matli</label>
                <input
                  type="text"
                  value={currentRestaurant.address}
                  onChange={(e) => updateRestaurantDetails(currentRestaurant.id, { address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dish Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">
                {editingItem ? 'Edit Dish Details' : 'Add New Menu Dish / Deal'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dish Name (English)</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Special Chicken Biryani"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Dish Name (Urdu - Optional)</label>
                <input
                  type="text"
                  value={itemNameUrdu}
                  onChange={(e) => setItemNameUrdu(e.target.value)}
                  placeholder="مثلاً: سپیشل چکن بریانی"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-urdu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="biryani">Biryani & Pulao</option>
                    <option value="fastfood">Fast Food & Burgers</option>
                    <option value="bbq">BBQ & Karahi</option>
                    <option value="desserts">Sweets & Desserts</option>
                    <option value="drinks">Chai & Drinks</option>
                    <option value="deals">Super Combo Deals</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price (₨ PKR)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Discounted Promo Price (Optional)</label>
                <input
                  type="number"
                  value={itemDiscountedPrice || ''}
                  onChange={(e) => setItemDiscountedPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Leave empty if no discount"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Fresh basmati rice cooked with spicy Sindhi masala..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Image URL & Quick Sample Pickers */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dish Image URL</label>
                <input
                  type="text"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mb-2 font-mono text-[11px]"
                />
                
                <span className="text-[10px] text-gray-400 block mb-1 font-semibold">
                  Or pick a photo template:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleImages.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setItemImage(s.url)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                        itemImage === s.url
                          ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Combo deal toggle */}
              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemIsCombo}
                    onChange={(e) => setItemIsCombo(e.target.checked)}
                    className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span className="font-bold text-gray-900">Mark as Combo Deal / Bundle</span>
                </label>

                {itemIsCombo && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Included Items (comma separated)
                    </label>
                    <input
                      type="text"
                      value={itemComboItemsStr}
                      onChange={(e) => setItemComboItemsStr(e.target.value)}
                      placeholder="e.g. 2x Zinger Burger, 1x Large Fries, 2x 345ml Pepsi"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Add Dish to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
