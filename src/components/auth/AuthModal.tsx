import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Store, Bike, ShieldAlert, KeyRound, Mail, Phone, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalRole, 
    setAuthModalRole, 
    loginUser, 
    restaurants, 
    riders, 
    allUsers, 
    triggerToast,
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(authModalRole || 'customer');
  const [isSignUp, setIsSignUp] = useState(false);

  // Customer Form State
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Vendor Form State
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || 'rest-1');
  const [vendorPassword, setVendorPassword] = useState('vendor123');

  // Rider Form State
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || 'rider-1');
  const [riderPin, setRiderPin] = useState('1234');

  // Admin Form State
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      triggerToast('Email Required', 'Please enter your email to login or sign up', 'warning');
      return;
    }
    loginUser(customerEmail.trim(), 'customer', {
      name: customerName.trim() || customerEmail.split('@')[0],
    });
  };

  const handleGuestContinue = () => {
    loginUser('guest@dastak.pk', 'customer', { name: 'Matli Guest' });
    triggerToast('Guest Mode', 'You can order by entering your WhatsApp number and address at checkout!', 'info');
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(`vendor_${selectedRestaurantId}@dastak.pk`, 'vendor', {
      restaurantId: selectedRestaurantId
    });
  };

  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(`rider_${selectedRiderId}@dastak.pk`, 'rider', {
      riderId: selectedRiderId
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow demo admin login or with password
    if (adminPassword === 'admin123' || adminPassword === '1234' || adminPassword === 'admin' || !adminPassword) {
      loginUser('admin@dastak.pk', 'admin');
    } else {
      setAdminError('Invalid Admin Password. Try "admin123" or leave blank for demo access.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-pink-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 bg-linear-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E11D74] text-white flex items-center justify-center shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900">
                  {language === 'ur' ? 'لاگ ان اور اکاؤنٹ پورٹل' : language === 'sd' ? 'لاگ ان ۽ اڪائونٽ پورٽل' : 'Dastak Login & Portal'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'ur' ? 'اپنا رول منتخب کریں اور رسائی حاصل کریں' : language === 'sd' ? 'پنهنجو ڪردار چونڊيو ۽ داخل ٿيو' : 'Select your role for secure access in Matli'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Navigation Tabs */}
          <div className="p-3 bg-pink-50/50 border-b border-pink-100 grid grid-cols-4 gap-1.5">
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
              <span className="text-[11px] leading-tight">Vendor</span>
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

            <button
              onClick={() => { setActiveTab('admin'); setAdminError(''); }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                activeTab === 'admin'
                  ? 'bg-gray-900 text-white shadow-xs font-bold'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50 text-xs font-medium'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <span className="text-[11px] leading-tight">Admin</span>
            </button>
          </div>

          {/* Form Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* 1. CUSTOMER TAB */}
            {activeTab === 'customer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    {isSignUp ? 'Create Customer Account' : 'Customer Sign In'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs font-bold text-[#E11D74] hover:underline"
                  >
                    {isSignUp ? 'Already have account? Sign In' : 'New here? Sign Up'}
                  </button>
                </div>

                <form onSubmit={handleCustomerSubmit} className="space-y-3">
                  {isSignUp && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Muhammad Ali"
                        className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        className="w-full text-xs pl-9 p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
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
                    className="w-full py-3 bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{isSignUp ? 'Create Free Account' : 'Sign In with Email'}</span>
                  </button>
                </form>

                {/* Guest / Skip email prompt */}
                <div className="pt-2 border-t border-pink-100">
                  <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#E11D74] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-pink-950 font-bold block">Don't want to sign in with email?</strong>
                        <p className="text-pink-900/80 text-[11px] mt-0.5">
                          You can order directly! When checking out, simply provide your WhatsApp phone number & address. Map location is optional.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGuestContinue}
                      className="w-full py-2 bg-white hover:bg-pink-100 text-[#E11D74] font-bold text-xs rounded-xl border border-pink-300 transition-colors"
                    >
                      Continue as Guest (No Email Required) →
                    </button>
                  </div>
                </div>

                {/* Quick 1-click customer profiles for testing */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Demo 1-Click Customer Logins:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setCustomerEmail(u.email);
                          loginUser(u.email, 'customer', { name: u.name });
                        }}
                        className="text-[11px] font-semibold bg-gray-50 hover:bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-lg text-gray-800 transition-colors"
                      >
                        {u.name} ({u.email.split('@')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. VENDOR TAB */}
            {activeTab === 'vendor' && (
              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div className="bg-orange-50/60 p-3 rounded-2xl border border-orange-200 text-xs text-orange-950">
                  <span className="font-bold block">Restaurant & Hotel Partner Portal</span>
                  <p className="text-[11px] text-orange-900/80 mt-0.5">
                    Manage incoming food orders, update menu prices, and toggle kitchen availability in Matli.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Select Your Restaurant</label>
                  <select
                    value={selectedRestaurantId}
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                    className="w-full p-3 bg-pink-50/40 border border-pink-200 rounded-xl font-bold text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  >
                    {restaurants.map((rest) => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name} — {rest.area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Vendor Passcode</label>
                  <input
                    type="password"
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    placeholder="Enter hotel pin"
                    className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Default demo pin is prefilled</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Access Restaurant Console</span>
                </button>
              </form>
            )}

            {/* 3. RIDER TAB */}
            {activeTab === 'rider' && (
              <form onSubmit={handleRiderSubmit} className="space-y-4">
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-950">
                  <span className="font-bold block">Dastak Rider Delivery Fleet</span>
                  <p className="text-[11px] text-emerald-900/80 mt-0.5">
                    Log in to receive delivery jobs, navigation routing, and live earnings in Matli.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Select Rider Profile</label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full p-3 bg-pink-50/40 border border-pink-200 rounded-xl font-bold text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  >
                    {riders.map((rd) => (
                      <option key={rd.id} value={rd.id}>
                        {rd.name} ({rd.currentArea}) — {rd.vehiclePlateNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Rider Security PIN</label>
                  <input
                    type="password"
                    value={riderPin}
                    onChange={(e) => setRiderPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Bike className="w-4 h-4" />
                  <span>Start Delivering as Rider</span>
                </button>
              </form>
            )}

            {/* 4. SUPER ADMIN TAB */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="bg-gray-900 p-3.5 rounded-2xl text-white text-xs space-y-1">
                  <span className="font-black text-orange-400 uppercase tracking-wider block">Super Admin Command Center</span>
                  <p className="text-[11px] text-gray-300">
                    Full control over all Matli restaurants, universal menu rates, order confirmations, WhatsApp kitchen dispatches & rider privacy.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Super Admin Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                    placeholder="Enter admin password (e.g. admin123)"
                    className="w-full text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                  {adminError ? (
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {adminError}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Demo password is <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">admin123</code> (or click Unlock below)
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-orange-500" />
                  <span>Unlock Super Admin Access</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
