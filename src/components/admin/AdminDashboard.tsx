import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, TrendingUp, DollarSign, Store, Bike, 
  Users, MapPin, Plus, Check, X, Edit, Trash2, 
  Settings, Tag, Sparkles, AlertCircle, ShoppingBag, 
  Phone, Smartphone, CheckCircle2, ChevronRight, BarChart2,
  UtensilsCrossed, MessageSquare, Send, ShieldCheck, PhoneOff, Eye,
  Lock, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, Rider, PromoCode, OrderStatus, MenuItem } from '../../types';
import { MATLI_AREAS } from '../../data/mockData';
import { generateRestaurantOrderDispatchSlip, openWhatsAppChat } from '../../utils/whatsapp';

export const AdminDashboard: React.FC = () => {
  const { 
    restaurants, 
    riders, 
    orders, 
    menuItems,
    categories,
    platformSettings, 
    updatePlatformSettings,
    updateRestaurantDetails,
    updateOrderStatus,
    adminAddNewProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    registerNewVendor,
    allowRiderViewCustomerInfo,
    setAllowRiderViewCustomerInfo,
    openAloChat,
    triggerToast,
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'vendors' | 'riders' | 'settings' | 'vouchers'>('overview');

  // Stats calculation
  const totalPlatformRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);
  const platformEarnings = Math.round(totalPlatformRevenue * 0.10); // average ~10% platform fee
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;

  // Modals / forms
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorArea, setNewVendorArea] = useState(MATLI_AREAS[0]);
  const [newVendorPhone, setNewVendorPhone] = useState('0300-1122334');
  const [newVendorCommission, setNewVendorCommission] = useState(10);

  // Universal Product Form State
  const [selectedProductRestId, setSelectedProductRestId] = useState<string>('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productFormRestId, setProductFormRestId] = useState(restaurants[0]?.id || 'rest-1');
  const [productFormName, setProductFormName] = useState('');
  const [productFormNameSd, setProductFormNameSd] = useState('');
  const [productFormNameUr, setProductFormNameUr] = useState('');
  const [productFormCategory, setProductFormCategory] = useState(categories[0]?.id || 'biryani');
  const [productFormPrice, setProductFormPrice] = useState(250);
  const [productFormDesc, setProductFormDesc] = useState('');
  const [productFormImage, setProductFormImage] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80');

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  // Promo code form state
  const [promoCodesList, setPromoCodesList] = useState<PromoCode[]>([
    { code: 'MATLI20', discountType: 'percentage', discountValue: 20, minOrderValue: 300, maxDiscount: 150, expiryDate: '2026-12-31', isActive: true },
    { code: 'FREESHIP', discountType: 'fixed', discountValue: 60, minOrderValue: 400, expiryDate: '2026-12-31', isActive: true },
    { code: 'WELCOME100', discountType: 'fixed', discountValue: 100, minOrderValue: 500, expiryDate: '2026-12-31', isActive: true }
  ]);

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState(20);
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormName.trim()) {
      triggerToast('Name Required', 'Please enter a product title', 'error');
      return;
    }
    adminAddNewProduct({
      restaurantId: productFormRestId,
      name: productFormName.trim(),
      name_sd: productFormNameSd.trim() || undefined,
      name_ur: productFormNameUr.trim() || undefined,
      description: productFormDesc.trim() || 'Delicious fresh food prepared in Matli',
      price: Number(productFormPrice),
      category: productFormCategory,
      image: productFormImage || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      rating: 4.8
    });
    setIsAddProductOpen(false);
    setProductFormName('');
    setProductFormNameSd('');
    setProductFormNameUr('');
    setProductFormDesc('');
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    adminUpdateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      description: editingProduct.description,
      isAvailable: editingProduct.isAvailable
    });
    setEditingProduct(null);
  };

  const handleSendToRestaurantWhatsApp = (order: typeof orders[0]) => {
    const targetRest = restaurants.find(r => r.id === order.restaurantId);
    const slip = generateRestaurantOrderDispatchSlip(order);
    const phone = targetRest?.whatsappNumber || '923001234567';
    openWhatsAppChat(phone, slip);
    triggerToast('Dispatch Slip Sent', `Sent order #${order.orderNumber} slip to ${targetRest?.name || 'Restaurant'} WhatsApp`, 'success');
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    setPromoCodesList([
      ...promoCodesList,
      {
        code: newPromoCode.trim().toUpperCase(),
        discountType: newPromoType,
        discountValue: Number(newPromoValue),
        minOrderValue: 250,
        expiryDate: '2026-12-31',
        isActive: true
      }
    ]);
    setNewPromoCode('');
    triggerToast('Promo Created', `Promo voucher ${newPromoCode.toUpperCase()} activated for Matli`, 'success');
  };

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) {
      triggerToast('Required', 'Please enter Restaurant name', 'warning');
      return;
    }
    const created = registerNewVendor({
      name: newVendorName.trim(),
      ownerName: 'Manager',
      phone: newVendorPhone || '0300-1122334',
      whatsappNumber: newVendorPhone || '0300-1122334',
      address: `${newVendorArea}, Matli`,
      area: newVendorArea,
      categories: ['Fast Food', 'Biryani']
    });
    if (newVendorCommission && created.restaurantId) {
      updateRestaurantDetails(created.restaurantId, { commissionRate: Number(newVendorCommission) });
    }
    setIsAddVendorOpen(false);
    setNewVendorName('');
  };

  const filteredMenuItems = selectedProductRestId === 'all'
    ? menuItems
    : menuItems.filter(item => item.restaurantId === selectedProductRestId);

  return (
    <div className="min-h-screen bg-[#FDF8FA] pb-20 text-[#1F2937]">
      {/* Top Admin Banner */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-6 border-b border-pink-100 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E11D74] bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                  Super Admin Console
                </span>
                <span className="text-xs text-gray-500">Matli Platform Controller</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                Dastak Delivery Super Admin
              </h1>
            </div>
          </div>

          {/* Quick Privacy and City Status Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-pink-50/70 border border-pink-200 px-3 py-1.5 rounded-2xl">
              <div className="text-xs">
                <span className="text-gray-400 block text-[9px] font-bold uppercase">Rider Privacy Mode</span>
                <span className="text-[#E11D74] font-bold flex items-center gap-1 text-xs">
                  {allowRiderViewCustomerInfo ? (
                    <><Eye className="w-3.5 h-3.5" /> Number Visible</>
                  ) : (
                    <><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Masked (Alo Chat Only)</>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
              <div className="text-xs">
                <span className="text-emerald-950 block text-[9px] font-bold uppercase">Operations</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Matli Hub Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global KPI Metrics */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Platform GMV</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
              ₨ {totalPlatformRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">{orders.length} total orders placed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Platform Commission</span>
            <span className="text-xl sm:text-2xl font-black text-[#E11D74] mt-1 block">
              ₨ {platformEarnings.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400">~10% Matli service fee</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Restaurants Catalog</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
              {restaurants.length} Hotels
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {menuItems.length} active menu items
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Delivery Fleet</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 mt-1 block">
              {riders.length} Riders
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {riders.filter(r => r.isOnline).length} riders currently active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pink-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders & Dispatches ({orders.length})</span>
            {activeOrdersCount > 0 && (
              <span className="bg-white text-[#E11D74] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Universal Products & Rates ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'vendors'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Hotels & Vendors ({restaurants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('riders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'riders'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Riders Fleet ({riders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'vouchers'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Coupons & Deals</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Privacy</span>
          </button>
        </div>

        {/* TAB 1: ALL ORDERS, INSTANT CONFIRMATION & WHATSAPP DISPATCH */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Real-time Matli Order Control & WhatsApp Dispatch
                </h3>
                <p className="text-xs text-gray-500">
                  Confirm incoming customer orders and instantly forward kitchen slips to hotel WhatsApp numbers.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-pink-50/60 border-b border-pink-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Restaurant</th>
                      <th className="p-3.5">Customer & Items</th>
                      <th className="p-3.5">Rider</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900">
                          #{order.orderNumber}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800">
                          {order.restaurantName}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-gray-900 block">{order.customerName}</span>
                          <span className="text-[11px] text-gray-500">{order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}</span>
                          <span className="text-[10px] text-pink-700 font-semibold block mt-0.5">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {order.riderName ? (
                            <span className="font-medium text-gray-800 flex items-center gap-1">
                              <Bike className="w-3 h-3 text-[#E11D74]" />
                              {order.riderName}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3.5 font-black text-gray-900">
                          ₨ {order.total}
                          <span className="block text-[10px] text-gray-400 uppercase font-normal">
                            {order.paymentMethod} ({order.paymentStatus})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : order.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-pink-50 text-[#E11D74] border border-pink-200'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Order Confirmation */}
                            {order.status === 'placed' && (
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.id, 'confirmed');
                                  triggerToast('Order Confirmed', `Order #${order.orderNumber} confirmed by Super Admin`, 'success');
                                }}
                                className="bg-[#E11D74] hover:bg-[#C2185B] text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs transition-colors"
                              >
                                Accept & Confirm
                              </button>
                            )}

                            {/* WhatsApp Dispatch to Restaurant Kitchen */}
                            <button
                              onClick={() => handleSendToRestaurantWhatsApp(order)}
                              title="Send Kitchen Dispatch Slip to Restaurant WhatsApp"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp to Hotel</span>
                            </button>

                            {/* Alo Chat */}
                            <button
                              onClick={() => openAloChat(order.id)}
                              className="bg-pink-50 hover:bg-pink-100 text-[#E11D74] border border-pink-200 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-colors"
                            >
                              Alo Chat
                            </button>

                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-xl transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNIVERSAL PRODUCTS & RATES MANAGEMENT ACROSS ALL RESTAURANTS */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#E11D74] flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Universal Product & Menu Controller
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add new dishes to any restaurant, change rates/prices, or delete items instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedProductRestId}
                  onChange={(e) => setSelectedProductRestId(e.target.value)}
                  className="text-xs font-bold bg-pink-50/50 border border-pink-200 rounded-xl p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                >
                  <option value="all">All Restaurants ({menuItems.length} items)</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product to Any Hotel</span>
                </button>
              </div>
            </div>

            {/* Add Product Modal / Collapsible Form */}
            <AnimatePresence>
              {isAddProductOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-3xl p-5 border border-pink-200 shadow-md space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-pink-100">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E11D74]" />
                      <span>Create & Add New Product (Admin Override)</span>
                    </h4>
                    <button
                      onClick={() => setIsAddProductOpen(false)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Target Restaurant</label>
                        <select
                          value={productFormRestId}
                          onChange={(e) => setProductFormRestId(e.target.value)}
                          className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        >
                          {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name} — {r.area}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Product Name (English)</label>
                        <input
                          type="text"
                          required
                          value={productFormName}
                          onChange={(e) => setProductFormName(e.target.value)}
                          placeholder="e.g. Special Matli Beef Biryani"
                          className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Price / Rate (₨ PKR)</label>
                        <input
                          type="number"
                          required
                          min={10}
                          value={productFormPrice}
                          onChange={(e) => setProductFormPrice(Number(e.target.value))}
                          className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Category</label>
                        <select
                          value={productFormCategory}
                          onChange={(e) => setProductFormCategory(e.target.value)}
                          className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Sindhi Title (سنڌي نالو)</label>
                        <input
                          type="text"
                          value={productFormNameSd}
                          onChange={(e) => setProductFormNameSd(e.target.value)}
                          placeholder="سنڌي ۾ کاڌي جو نالو"
                          className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Image URL</label>
                        <input
                          type="url"
                          value={productFormImage}
                          onChange={(e) => setProductFormImage(e.target.value)}
                          className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Description</label>
                      <input
                        type="text"
                        value={productFormDesc}
                        onChange={(e) => setProductFormDesc(e.target.value)}
                        placeholder="e.g. Served with hot raita, salad, and spicy Matli masala"
                        className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddProductOpen(false)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-colors"
                      >
                        Publish Product Platform-wide
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid with inline rate editor & delete */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => {
                const rest = restaurants.find(r => r.id === item.restaurantId);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-4 border border-pink-100 shadow-xs flex flex-col justify-between gap-3 hover:border-pink-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-pink-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#E11D74] uppercase tracking-wider block truncate">
                          {rest?.name || 'Restaurant'}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {item.name}
                        </h4>
                        {item.name_sd && (
                          <span className="text-[11px] text-gray-500 block font-medium">
                            {item.name_sd}
                          </span>
                        )}
                        <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-pink-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 font-semibold">Rate:</span>
                        <span className="text-sm font-black text-gray-900">₨ {item.price}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct(item)}
                          className="p-1.5 text-gray-600 hover:text-[#E11D74] hover:bg-pink-50 rounded-xl transition-colors"
                          title="Edit Rate & Product Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${item.name}?`)) {
                              adminDeleteProduct(item.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 border border-pink-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-pink-100">
                <h3 className="font-bold text-sm text-gray-900">
                  Edit Product & Change Rate
                </h3>
                <button onClick={() => setEditingProduct(null)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price / Rate (₨ PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isAvailable}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                      className="rounded text-[#E11D74] focus:ring-[#E11D74]"
                    />
                    <span className="font-bold text-gray-700">Available in stock</span>
                  </label>

                  <button
                    type="submit"
                    className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* TAB 3: VENDORS */}
        {activeTab === 'vendors' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Registered Matli Restaurants ({restaurants.length})
                </h3>
                <p className="text-xs text-gray-400">Manage vendor listings, commission rates, and approval status</p>
              </div>

              <button
                onClick={() => setIsAddVendorOpen(!isAddVendorOpen)}
                className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddVendorOpen ? 'Close Form' : 'Add Restaurant'}</span>
              </button>
            </div>

            {/* Add Vendor Form */}
            <AnimatePresence>
              {isAddVendorOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-3xl p-5 border border-pink-200 shadow-md overflow-hidden"
                >
                  <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#E11D74]" />
                    <span>Register New Matli Restaurant Partner</span>
                  </h4>
                  <form onSubmit={handleAddVendorSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Restaurant Name</label>
                      <input
                        type="text"
                        value={newVendorName}
                        onChange={(e) => setNewVendorName(e.target.value)}
                        placeholder="e.g. Matli Royal Biryani"
                        className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Matli Market Area</label>
                      <select
                        value={newVendorArea}
                        onChange={(e) => setNewVendorArea(e.target.value)}
                        className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      >
                        {MATLI_AREAS.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={newVendorPhone}
                        onChange={(e) => setNewVendorPhone(e.target.value)}
                        placeholder="0300-1122334"
                        className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Platform Commission (%)</label>
                      <input
                        type="number"
                        value={newVendorCommission}
                        onChange={(e) => setNewVendorCommission(Number(e.target.value))}
                        className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddVendorOpen(false)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-colors"
                      >
                        Register Restaurant & Create Vendor ID
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vendor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-3xl p-4 border border-pink-100 shadow-sm flex flex-col justify-between gap-3.5"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-pink-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {restaurant.name}
                        </h4>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                          restaurant.isOpen ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {restaurant.isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{restaurant.address}, {restaurant.area}</p>
                      <span className="text-[11px] text-amber-500 font-semibold block mt-0.5">
                        ★ {restaurant.rating} ({restaurant.reviewsCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Commission Rate</span>
                      <span className="font-bold text-gray-900">{restaurant.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Lifetime Orders</span>
                      <span className="font-semibold text-gray-800">{restaurant.totalOrdersCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total GMV</span>
                      <span className="font-black text-emerald-600">₨ {restaurant.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-500">WhatsApp: {restaurant.whatsappNumber}</span>
                    <button
                      onClick={() => {
                        const newRate = prompt(`Enter new commission rate for ${restaurant.name} (%)`, restaurant.commissionRate.toString());
                        if (newRate && !isNaN(Number(newRate))) {
                          updateRestaurantDetails(restaurant.id, { commissionRate: Number(newRate) });
                          triggerToast('Commission Updated', `${restaurant.name} rate set to ${newRate}%`, 'info');
                        }
                      }}
                      className="text-xs font-bold text-gray-700 hover:text-[#E11D74] bg-white border border-pink-200 hover:bg-pink-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Edit Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RIDERS */}
        {activeTab === 'riders' && (
          <div className="mt-6 space-y-4">
            <h3 className="font-bold text-base text-gray-900">
              Matli Delivery Fleet ({riders.length} Riders)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riders.map((rider) => (
                <div
                  key={rider.id}
                  className="bg-white rounded-3xl p-4 border border-pink-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#E11D74] flex items-center justify-center font-bold">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{rider.name}</h4>
                        <span className="text-xs text-gray-400 block">{rider.phone}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                          rider.isOnline ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {rider.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ★ {rider.rating}
                    </span>
                  </div>

                  <div className="bg-pink-50/40 p-3 rounded-2xl border border-pink-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vehicle No.</span>
                      <span className="font-mono font-bold text-gray-900">{rider.vehiclePlateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Operating Area</span>
                      <span className="font-semibold text-gray-800">{rider.currentArea}, Matli</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-pink-100">
                      <span className="text-gray-500">Total Deliveries</span>
                      <span className="font-bold text-gray-900">{rider.totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Payout</span>
                      <span className="font-black text-emerald-600">₨ {rider.totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerToast('Payout Processed', `Dispatched payout to ${rider.name} via JazzCash`, 'success')}
                    className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-xs"
                  >
                    Disburse Weekly Payout
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VOUCHERS */}
        {activeTab === 'vouchers' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">
                Create New Promo Code for Matli Customers
              </h3>

              <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Voucher Code</label>
                  <input
                    type="text"
                    required
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MATLIDAZZLE"
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as any)}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Rupees (₨)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    + Activate Voucher
                  </button>
                </div>
              </form>
            </div>

            {/* Active Vouchers List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promoCodesList.map((promo) => (
                <div
                  key={promo.code}
                  className="bg-white rounded-3xl p-4 border border-pink-100 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono font-bold text-sm text-[#E11D74] bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
                      {promo.code}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-600">
                    <p className="font-bold text-gray-900">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₨ ${promo.discountValue} FLAT OFF`}
                    </p>
                    <p className="text-gray-400">Minimum Order: ₨ {promo.minOrderValue}</p>
                    <p className="text-[10px] text-gray-400">Valid until {promo.expiryDate}</p>
                  </div>

                  <div className="pt-2 border-t border-pink-100 flex justify-end">
                    <button
                      onClick={() => setPromoCodesList(promoCodesList.filter(p => p.code !== promo.code))}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & RIDER PRIVACY POLICY */}
        {activeTab === 'settings' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Privacy Rules Card */}
            <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-pink-100">
                <ShieldCheck className="w-5 h-5 text-[#E11D74]" />
                <div>
                  <h3 className="font-bold text-base text-gray-900">Rider & Customer Privacy</h3>
                  <p className="text-xs text-gray-500">Control direct phone number visibility</p>
                </div>
              </div>

              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">
                      Mask Customer Numbers (Alo Chat Only)
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      When enabled, riders will only see delivery address & order items. Direct phone number is hidden and communication is strictly conducted via the in-app <strong>Alo Chat</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setAllowRiderViewCustomerInfo(false)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      !allowRiderViewCustomerInfo
                        ? 'bg-[#E11D74] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-pink-200'
                    }`}
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>Strict Masking (Alo Chat)</span>
                  </button>

                  <button
                    onClick={() => setAllowRiderViewCustomerInfo(true)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      allowRiderViewCustomerInfo
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-pink-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Allow Direct Call</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Financial Settings */}
            <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900 pb-2 border-b border-pink-100">
                City & Financial Configuration
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Base Delivery Fee (₨)</label>
                    <input
                      type="number"
                      value={platformSettings.baseDeliveryFee}
                      onChange={(e) => updatePlatformSettings({ baseDeliveryFee: Number(e.target.value) })}
                      className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Free Delivery Min (₨)</label>
                    <input
                      type="number"
                      value={platformSettings.freeDeliveryThreshold}
                      onChange={(e) => updatePlatformSettings({ freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Official JazzCash Merchant Number</label>
                  <input
                    type="text"
                    value={platformSettings.jazzCashAccount}
                    onChange={(e) => updatePlatformSettings({ jazzCashAccount: e.target.value })}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Support WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={platformSettings.supportWhatsApp}
                    onChange={(e) => updatePlatformSettings({ supportWhatsApp: e.target.value })}
                    className="w-full p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl font-mono font-semibold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => triggerToast('Settings Saved', 'Platform rates updated for Matli', 'success')}
                    className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
