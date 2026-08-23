import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Store, Bike, ShieldAlert, KeyRound, Mail, Phone, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus,
  MapPin, Clock, DollarSign, Building2, UtensilsCrossed, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { MATLI_AREAS } from '../../data/mockData';
import { DastakLogo } from '../common/DastakLogo';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalRole, 
    loginUser, 
    registerCustomerAccount,
    registerNewVendor,
    registerRider,
    restaurants, 
    riders, 
    triggerToast,
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(authModalRole || 'customer');

  // Customer State
  const [isCustomerSignUp, setIsCustomerSignUp] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerArea, setCustomerArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');
  const [customerPassword, setCustomerPassword] = useState('');

  // Vendor State
  const [vendorMode, setVendorMode] = useState<'login' | 'register'>('login');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || 'rest-1');
  const [vendorPassword, setVendorPassword] = useState('vendor123');
  
  // Vendor Registration Form State
  const [shopName, setShopName] = useState('');
  const [shopNameUrdu, setShopNameUrdu] = useState('');
  const [shopOwnerName, setShopOwnerName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopWhatsApp, setShopWhatsApp] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopArea, setShopArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');
  const [shopCategory, setShopCategory] = useState('Fast Food');
  const [shopMinOrder, setShopMinOrder] = useState<number>(150);
  const [shopDeliveryTime, setShopDeliveryTime] = useState('20-30 min');
  const [shopOpeningHours, setShopOpeningHours] = useState('11:00 AM - 12:00 AM');

  // Rider State
  const [riderMode, setRiderMode] = useState<'login' | 'register'>('login');
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || 'rider-1');
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderCnic, setRiderCnic] = useState('');
  const [riderVehicleType, setRiderVehicleType] = useState<'bike' | 'loader' | 'bicycle'>('bike');
  const [riderPlate, setRiderPlate] = useState('');
  const [riderArea, setRiderArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');

  // Admin State
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  if (!isAuthModalOpen) return null;

  // 1. Customer Handlers
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomerSignUp) {
      if (!customerName.trim() || !customerPhone.trim()) {
        triggerToast('Missing Fields', 'Please enter your name and phone number', 'warning');
        return;
      }
      registerCustomerAccount({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        area: customerArea,
        password: customerPassword
      });
    } else {
      if (!customerPhone.trim() && !customerEmail.trim()) {
        triggerToast('Required', 'Please enter your Phone or Email to login', 'warning');
        return;
      }
      loginUser(customerPhone.trim() || customerEmail.trim(), 'customer', {
        name: customerName.trim() || 'Matli Customer'
      });
    }
  };

  const handleGuestContinue = () => {
    loginUser('guest@dastak.pk', 'customer', { name: 'Matli Guest' });
    triggerToast('Guest Mode Active', 'You can browse and order with instant WhatsApp delivery!', 'info');
  };

  // 2. Vendor Handlers
  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorMode === 'register') {
      if (!shopName.trim() || !shopPhone.trim() || !shopOwnerName.trim()) {
        triggerToast('Incomplete Form', 'Please enter Shop Name, Owner Name, and Contact Number', 'warning');
        return;
      }
      registerNewVendor({
        name: shopName,
        nameUrdu: shopNameUrdu || shopName,
        ownerName: shopOwnerName,
        phone: shopPhone,
        whatsappNumber: shopWhatsApp || shopPhone,
        address: shopAddress || `${shopArea}, Matli`,
        area: shopArea,
        categories: [shopCategory],
        minOrder: Number(shopMinOrder),
        deliveryTime: shopDeliveryTime,
        openingHours: shopOpeningHours
      });
    } else {
      loginUser(`vendor_${selectedRestaurantId}@dastak.pk`, 'vendor', {
        restaurantId: selectedRestaurantId
      });
    }
  };

  // 3. Rider Handlers
  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (riderMode === 'register') {
      if (!riderName.trim() || !riderPhone.trim()) {
        triggerToast('Required', 'Please enter Rider Name and Phone number', 'warning');
        return;
      }
      registerRider({
        name: riderName,
        phone: riderPhone,
        cnicNumber: riderCnic || '41103-XXXXXXX-1',
        vehicleType: riderVehicleType,
        vehiclePlateNumber: riderPlate || 'MATLI-BIKE',
        currentArea: riderArea
      });
    } else {
      loginUser(`rider_${selectedRiderId}@dastak.pk`, 'rider', {
        riderId: selectedRiderId
      });
    }
  };

  // 4. Admin Handlers
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123' || adminPassword === '1234' || adminPassword === 'admin' || !adminPassword) {
      loginUser('admin@dastakdelivery.pk', 'admin');
    } else {
      setAdminError('Invalid password. Default is "admin123" or leave blank for demo.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-pink-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header with official Dastak Brand Logo */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DastakLogo size="md" showText={false} />
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-900 leading-tight">
                  {language === 'ur' ? 'دستک پورٹل لاگ ان اور رجسٹریشن' : language === 'sd' ? 'دستڪ پورٽل لاگ ان ۽ رجسٽريشن' : 'Dastak Portal & ID Login'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ur' ? 'کسٹمر، دکاندار یا ایڈمن کے طور پر داخل ہوں' : 'Customer, Shop Vendor or Admin Access'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Navigation Tabs */}
          <div className="p-2 sm:p-3 bg-pink-50/60 border-b border-pink-100 grid grid-cols-4 gap-1 sm:gap-2">
            <button
              onClick={() => { setActiveTab('customer'); setAdminError(''); }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                activeTab === 'customer'
                  ? 'bg-[#E11D74] text-white shadow-xs font-bold'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50 text-xs font-medium'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-[11px] leading-tight">Customer</span>
            </button>

            <button
              onClick={() => { setActiveTab('vendor'); setAdminError(''); }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                activeTab === 'vendor'
                  ? 'bg-[#E11D74] text-white shadow-xs font-bold'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50 text-xs font-medium'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="text-[11px] leading-tight">Vendor / Shop</span>
            </button>

            <button
              onClick={() => { setActiveTab('admin'); setAdminError(''); }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                activeTab === 'admin'
                  ? 'bg-gray-900 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50 text-xs font-medium'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] leading-tight">Admin</span>
            </button>

            <button
              onClick={() => { setActiveTab('rider'); setAdminError(''); }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                activeTab === 'rider'
                  ? 'bg-[#E11D74] text-white shadow-xs font-bold'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50 text-xs font-medium'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span className="text-[11px] leading-tight">Rider</span>
            </button>
          </div>

          {/* Form Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* 1. CUSTOMER TAB */}
            {activeTab === 'customer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-pink-50 p-2.5 rounded-2xl border border-pink-100">
                  <span className="text-xs font-bold text-gray-800">
                    {isCustomerSignUp ? 'Create New Customer Account' : 'Customer Sign In'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomerSignUp(!isCustomerSignUp)}
                    className="text-xs font-extrabold text-[#E11D74] hover:underline"
                  >
                    {isCustomerSignUp ? 'Existing User? Sign In' : 'New? Sign Up Here'}
                  </button>
                </div>

                <form onSubmit={handleCustomerSubmit} className="space-y-3">
                  {isCustomerSignUp && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Your Full Name / آپ کا نام</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Muhammad Ali"
                        className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Mobile / WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full text-xs pl-9 pr-3 py-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        required
                      />
                    </div>
                  </div>

                  {isCustomerSignUp && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Matli Area / محلہ یا بازار</label>
                        <select
                          value={customerArea}
                          onChange={(e) => setCustomerArea(e.target.value)}
                          className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        >
                          {MATLI_AREAS.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Street Address / Landmark</label>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="e.g. House #14, Near Jamia Masjid"
                          className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Password / پن کوڈ</label>
                    <input
                      type="password"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-linear-to-r from-[#E11D74] to-[#C2185B] text-white font-bold rounded-xl text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isCustomerSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{isCustomerSignUp ? 'Create My Customer Account' : 'Sign In as Customer'}</span>
                  </button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-pink-100"></div>
                  <span className="shrink mx-3 text-[11px] text-gray-400 font-bold uppercase">Or</span>
                  <div className="grow border-t border-pink-100"></div>
                </div>

                <button
                  onClick={handleGuestContinue}
                  className="w-full py-3 bg-pink-50 border border-pink-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-pink-100/70 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#E11D74]" />
                  <span>Continue as Guest in Matli (No Password Needed)</span>
                </button>
              </div>
            )}

            {/* 2. VENDOR / SHOP TAB */}
            {activeTab === 'vendor' && (
              <div className="space-y-4">
                {/* Mode Selector: Login vs Register */}
                <div className="flex bg-pink-50 p-1 rounded-2xl border border-pink-200">
                  <button
                    type="button"
                    onClick={() => setVendorMode('login')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      vendorMode === 'login' 
                        ? 'bg-[#E11D74] text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Existing Shop Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorMode('register')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      vendorMode === 'register' 
                        ? 'bg-[#E11D74] text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    + Register New Shop ID
                  </button>
                </div>

                {vendorMode === 'login' ? (
                  <form onSubmit={handleVendorSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Select Your Restaurant / Shop</label>
                      <select
                        value={selectedRestaurantId}
                        onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74] font-semibold"
                      >
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.area}) - ID: {r.vendorId || r.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Vendor Portal Password</label>
                      <input
                        type="password"
                        value={vendorPassword}
                        onChange={(e) => setVendorPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Default demo password: vendor123</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-linear-to-r from-[#E11D74] to-[#C2185B] text-white font-bold rounded-xl text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Store className="w-4 h-4" />
                      <span>Open Shop Vendor Dashboard</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVendorSubmit} className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Register your Matli hotel, shop, or home kitchen to start receiving orders online!</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Shop / Hotel Name (English)</label>
                        <input
                          type="text"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Bismillah Fast Food"
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Shop Name (اردو / سنڌي)</label>
                        <input
                          type="text"
                          value={shopNameUrdu}
                          onChange={(e) => setShopNameUrdu(e.target.value)}
                          placeholder="بسم اللہ فاسٹ فوڈ"
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Owner / Manager Name</label>
                        <input
                          type="text"
                          value={shopOwnerName}
                          onChange={(e) => setShopOwnerName(e.target.value)}
                          placeholder="e.g. Haji Rashid"
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Contact Phone Number</label>
                        <input
                          type="tel"
                          value={shopPhone}
                          onChange={(e) => setShopPhone(e.target.value)}
                          placeholder="0300-9876543"
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">WhatsApp for Orders</label>
                        <input
                          type="tel"
                          value={shopWhatsApp}
                          onChange={(e) => setShopWhatsApp(e.target.value)}
                          placeholder="0300-9876543"
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                        <select
                          value={shopCategory}
                          onChange={(e) => setShopCategory(e.target.value)}
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        >
                          <option value="Fast Food">Fast Food & Burgers</option>
                          <option value="Biryani">Biryani & Pulao</option>
                          <option value="Karahi & Handi">Karahi & Desi Food</option>
                          <option value="Sweets & Bakers">Sweets, Kheer & Bakery</option>
                          <option value="BBQ & Kabab">BBQ & Sajji</option>
                          <option value="Chai & Cafe">Tea & Cafe</option>
                          <option value="Grocery & Store">Grocery & Mart</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Matli Market Area</label>
                        <select
                          value={shopArea}
                          onChange={(e) => setShopArea(e.target.value)}
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        >
                          {MATLI_AREAS.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Min Order Amount (PKR)</label>
                        <input
                          type="number"
                          value={shopMinOrder}
                          onChange={(e) => setShopMinOrder(Number(e.target.value))}
                          className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Exact Shop Location & Address</label>
                      <input
                        type="text"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="e.g. Shop #4, Main Shahi Bazaar, Near Clock Tower, Matli"
                        className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Create Shop ID & Enter Vendor Dashboard</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 3. ADMIN TAB */}
            {activeTab === 'admin' && (
              <div className="space-y-4">
                <div className="bg-gray-900 text-white p-4 rounded-2xl border border-gray-800 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Dastak Master Admin Console</h4>
                      <p className="text-[11px] text-gray-400">Full control over Matli restaurants, products, orders & revenue</p>
                    </div>
                  </div>
                </div>

                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Admin Passcode / پن کوڈ</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                        placeholder="Enter Admin Password (e.g. admin123)"
                        className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">Default password: <strong>admin123</strong> (or click below)</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Open Admin Control Dashboard</span>
                  </button>
                </form>

                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => loginUser('admin@dastakdelivery.pk', 'admin')}
                    className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100/70 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Instant Master Admin Access (Demo Bypass)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. RIDER TAB */}
            {activeTab === 'rider' && (
              <div className="space-y-4">
                <div className="flex bg-pink-50 p-1 rounded-2xl border border-pink-200">
                  <button
                    type="button"
                    onClick={() => setRiderMode('login')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      riderMode === 'login' 
                        ? 'bg-[#E11D74] text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Rider Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiderMode('register')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      riderMode === 'register' 
                        ? 'bg-[#E11D74] text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    + Join Delivery Fleet
                  </button>
                </div>

                {riderMode === 'login' ? (
                  <form onSubmit={handleRiderSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Select Rider Profile</label>
                      <select
                        value={selectedRiderId}
                        onChange={(e) => setSelectedRiderId(e.target.value)}
                        className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74] font-semibold"
                      >
                        {riders.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.vehiclePlateNumber}) - {r.currentArea}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-linear-to-r from-[#E11D74] to-[#C2185B] text-white font-bold rounded-xl text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Enter Rider Delivery Screen</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRiderSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Rider Full Name</label>
                      <input
                        type="text"
                        value={riderName}
                        onChange={(e) => setRiderName(e.target.value)}
                        placeholder="e.g. Zeeshan Ali"
                        className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={riderPhone}
                          onChange={(e) => setRiderPhone(e.target.value)}
                          placeholder="0300-1122334"
                          className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">CNIC Number</label>
                        <input
                          type="text"
                          value={riderCnic}
                          onChange={(e) => setRiderCnic(e.target.value)}
                          placeholder="41103-XXXXXXX-1"
                          className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Vehicle Type</label>
                        <select
                          value={riderVehicleType}
                          onChange={(e) => setRiderVehicleType(e.target.value as any)}
                          className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        >
                          <option value="bike">Motorcycle 🏍️</option>
                          <option value="loader">Rickshaw / Loader 🛺</option>
                          <option value="bicycle">Bicycle 🚲</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Bike Plate #</label>
                        <input
                          type="text"
                          value={riderPlate}
                          onChange={(e) => setRiderPlate(e.target.value)}
                          placeholder="KHI-9821"
                          className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Register & Start Delivering in Matli</span>
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Footer Info */}
          <div className="p-3 bg-gray-50 border-t border-pink-100 text-center">
            <p className="text-[11px] text-gray-500">
              Dastak Delivery • Matli, Sindh • Fast Doorstep Service
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
