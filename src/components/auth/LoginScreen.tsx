import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Store, Bike, ShieldAlert, KeyRound, Mail, 
  LogIn, UserPlus, Eye, EyeOff, AlertCircle,
  MapPin, CheckCircle2, Phone, Lock, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import { MATLI_AREAS } from '../../data/mockData';
import { DastakLogo } from '../common/DastakLogo';

export const LoginScreen: React.FC = () => {
  const { 
    loginUser, 
    registerCustomerAccount,
    registerNewVendor,
    registerRider,
    allUsers,
    restaurants,
    riders,
    triggerToast,
    language,
    setLanguage 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Input states - strictly empty by default
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Customer Registration State
  const [regCustomerName, setRegCustomerName] = useState('');
  const [regCustomerPhone, setRegCustomerPhone] = useState('');
  const [regCustomerAddress, setRegCustomerAddress] = useState('');
  const [regCustomerArea, setRegCustomerArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');
  const [regCustomerPassword, setRegCustomerPassword] = useState('');

  // Vendor Registration State
  const [regShopName, setRegShopName] = useState('');
  const [regShopOwner, setRegShopOwner] = useState('');
  const [regShopPhone, setRegShopPhone] = useState('');
  const [regShopArea, setRegShopArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');
  const [regShopCategory, setRegShopCategory] = useState('Fast Food');

  // Rider Registration State
  const [regRiderName, setRegRiderName] = useState('');
  const [regRiderPhone, setRegRiderPhone] = useState('');
  const [regRiderPlate, setRegRiderPlate] = useState('');

  // Role switch handler
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login');
    setErrorMsg('');
    setIdentifier('');
    setPassword('');
  };

  // Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'register') {
      if (selectedRole === 'customer') {
        if (!regCustomerName.trim() || !regCustomerPhone.trim()) {
          setErrorMsg('Please enter your full name and mobile number.');
          return;
        }
        if (!regCustomerPassword.trim() && !password.trim()) {
          setErrorMsg('Please enter a password for your account.');
          return;
        }
        registerCustomerAccount({
          name: regCustomerName.trim(),
          phone: regCustomerPhone.trim(),
          address: regCustomerAddress.trim(),
          area: regCustomerArea,
          password: regCustomerPassword.trim() || password.trim() || '123456'
        });
      } else if (selectedRole === 'vendor') {
        if (!regShopName.trim() || !regShopPhone.trim() || !regShopOwner.trim()) {
          setErrorMsg('Please enter Shop Name, Owner Name and Phone.');
          return;
        }
        registerNewVendor({
          name: regShopName.trim(),
          ownerName: regShopOwner.trim(),
          phone: regShopPhone.trim(),
          whatsappNumber: regShopPhone.trim(),
          address: `${regShopArea}, Matli`,
          area: regShopArea,
          categories: [regShopCategory]
        });
      } else if (selectedRole === 'rider') {
        if (!regRiderName.trim() || !regRiderPhone.trim()) {
          setErrorMsg('Please enter Rider Name and Phone Number.');
          return;
        }
        registerRider({
          name: regRiderName.trim(),
          phone: regRiderPhone.trim(),
          cnicNumber: '41103-XXXXXXX-1',
          vehicleType: 'bike',
          vehiclePlateNumber: regRiderPlate.trim() || 'MATLI-BIKE',
          currentArea: MATLI_AREAS[0] || 'Shahi Bazaar'
        });
      }
      return;
    }

    // Login Verification
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Mandatory Email/Username & Password Checks
    if (!cleanId || !cleanPass) {
      setErrorMsg(
        language === 'ur' 
          ? 'براہ کرم ای میل/فون نمبر اور پاس ورڈ دونوں درج کریں۔'
          : 'Please enter both your email/username and password.'
      );
      return;
    }

    // 2. Strict Role Credentials Validation
    if (selectedRole === 'admin') {
      const validAdminIds = ['admin@dastak.pk', 'admin', '03000000000', '0300-0000000', 'superadmin', 'admin@dastakdelivery.pk'];
      const validAdminPass = ['admin123', 'adminpass2026', 'admin'];

      if (validAdminIds.includes(cleanId) && validAdminPass.includes(cleanPass)) {
        loginUser(cleanId, 'admin', { name: 'Super Admin Matli' });
      } else {
        setErrorMsg(
          language === 'ur'
            ? 'غلط ایڈمن ای میل یا پاس ورڈ۔ دوبارہ کوشش کریں۔'
            : 'Invalid email/username or password for Super Admin.'
        );
      }
      return;
    }

    if (selectedRole === 'vendor') {
      const validVendorIds = ['vendor@dastak.pk', 'vendor', '03009876543', '0300-9876543'];
      const validVendorPass = ['vendor123', 'vendor', '123456', '1234'];
      
      const isDefaultVendor = validVendorIds.includes(cleanId) && validVendorPass.includes(cleanPass);
      const isRegisteredRestaurant = restaurants.some(
        r => (r.phone && r.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')) || 
             (r.whatsappNumber && r.whatsappNumber.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')) ||
             r.id.toLowerCase() === cleanId
      );

      if (isDefaultVendor || (isRegisteredRestaurant && cleanPass.length >= 4)) {
        loginUser(cleanId, 'vendor', {
          restaurantId: 'rest-1'
        });
      } else {
        setErrorMsg(
          language === 'ur'
            ? 'غلط وینڈر ای میل/فون یا پاس ورڈ۔'
            : 'Invalid email/phone or password.'
        );
      }
      return;
    }

    if (selectedRole === 'rider') {
      const validRiderIds = ['rider@dastak.pk', 'rider', '03005555555', '0300-5555555'];
      const validRiderPass = ['rider123', 'rider', '123456', '1234'];

      const isDefaultRider = validRiderIds.includes(cleanId) && validRiderPass.includes(cleanPass);
      const isRegisteredRider = riders.some(
        rd => rd.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '') || rd.id.toLowerCase() === cleanId
      );

      if (isDefaultRider || (isRegisteredRider && cleanPass.length >= 4)) {
        loginUser(cleanId, 'rider', {
          riderId: 'rider-1'
        });
      } else {
        setErrorMsg(
          language === 'ur'
            ? 'غلط رائڈر ای میل/فون یا پاس ورڈ۔'
            : 'Invalid email/phone or password.'
        );
      }
      return;
    }

    // Customer
    const validCustomerIds = ['customer@dastak.pk', 'customer', '03001234567', '0300-1234567'];
    const validCustomerPass = ['customer123', 'customer', '123456', '1234'];

    const isDefaultCustomer = validCustomerIds.includes(cleanId) && validCustomerPass.includes(cleanPass);
    const registeredCust = (allUsers || []).find(
      c => (c.phone && c.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')) || 
           (c.email && c.email.toLowerCase() === cleanId) ||
           (c.name && c.name.toLowerCase() === cleanId)
    );

    if (isDefaultCustomer || (registeredCust && cleanPass.length >= 4) || (cleanPass.length >= 4 && cleanId.length >= 3)) {
      loginUser(cleanId, 'customer', {
        name: registeredCust ? registeredCust.name : isDefaultCustomer ? 'Matli Customer' : cleanId
      });
    } else {
      setErrorMsg(
        language === 'ur'
          ? 'غلط ای میل/فون نمبر یا پاس ورڈ۔'
          : 'Invalid email or password.'
      );
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'customer': return language === 'ur' ? 'گاہک لاگ ان' : 'Customer Sign In';
      case 'vendor': return language === 'ur' ? 'ہوٹل / دکان لاگ ان' : 'Vendor / Shop Sign In';
      case 'rider': return language === 'ur' ? 'ڈلیوری بوائے لاگ ان' : 'Rider Sign In';
      case 'admin': return language === 'ur' ? 'سپر ایڈمن لاگ ان' : 'Super Admin Sign In';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F5] via-[#FFF5F8] to-[#FCE4EC] flex flex-col justify-between py-6 px-3 sm:px-6 relative overflow-x-hidden">
      
      {/* Background Subtle Ambient Shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-2.5">
          <DastakLogo size="sm" showText={false} />
          <div>
            <h1 className="text-base sm:text-lg font-black text-gray-900 leading-none">
              DASTAK DELIVERY
            </h1>
            <span className="text-[10px] font-bold text-[#E11D74] uppercase tracking-wider">
              Matli, Sindh • Multi-Role Portal
            </span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center bg-white/90 backdrop-blur-xs border border-pink-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'en' ? 'bg-[#E11D74] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ur')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'ur' ? 'bg-[#E11D74] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            اردو
          </button>
          <button
            onClick={() => setLanguage('sd')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'sd' ? 'bg-[#E11D74] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            سنڌي
          </button>
        </div>
      </header>

      {/* Main Login Screen */}
      <main className="max-w-xl mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl border border-pink-200/90 shadow-2xl shadow-pink-500/10 overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 text-center">
            <div className="inline-flex items-center justify-center p-2.5 bg-pink-100/70 rounded-2xl mb-3 text-[#E11D74]">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {getRoleTitle(selectedRole)}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ur' 
                ? 'اپنے مطلوبہ رول کا انتخاب کریں اور لاگ ان تفصیلات درج کریں۔'
                : 'Select your role and enter your credentials to access the platform.'}
            </p>
          </div>

          {/* 4-Role Selector Tabs */}
          <div className="p-3 sm:p-4 bg-gray-50/70 border-b border-pink-100">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2 px-1 text-center">
              {language === 'ur' ? 'رول منتخب کریں' : 'Select Account Role'}:
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Customer Tab */}
              <button
                type="button"
                onClick={() => handleSelectRole('customer')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedRole === 'customer'
                    ? 'bg-[#E11D74] text-white shadow-md shadow-pink-500/20 font-bold scale-102'
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-pink-50 font-medium'
                }`}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Customer</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRole === 'customer' ? 'bg-white/20 text-white' : 'text-gray-400'
                }`}>Food Ordering</span>
              </button>

              {/* Vendor Tab */}
              <button
                type="button"
                onClick={() => handleSelectRole('vendor')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedRole === 'vendor'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 font-bold scale-102'
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-amber-50 font-medium'
                }`}
              >
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Vendor</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRole === 'vendor' ? 'bg-white/20 text-white' : 'text-gray-400'
                }`}>Shop / Hotel</span>
              </button>

              {/* Rider Tab */}
              <button
                type="button"
                onClick={() => handleSelectRole('rider')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedRole === 'rider'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold scale-102'
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-emerald-50 font-medium'
                }`}
              >
                <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Rider</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRole === 'rider' ? 'bg-white/20 text-white' : 'text-gray-400'
                }`}>Fleet Delivery</span>
              </button>

              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                  selectedRole === 'admin'
                    ? 'bg-purple-800 text-white shadow-md shadow-purple-500/20 font-bold scale-102'
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-purple-50 font-medium'
                }`}
              >
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span className="text-xs">Super Admin</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRole === 'admin' ? 'bg-white/20 text-white' : 'text-gray-400'
                }`}>Master Panel</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Mode Switch (Sign In vs Register Account) */}
            {selectedRole !== 'admin' && (
              <div className="flex items-center justify-between bg-pink-50/60 p-1.5 rounded-2xl border border-pink-100">
                <div className="flex gap-1 w-full">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                      authMode === 'login'
                        ? 'bg-[#E11D74] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {language === 'ur' ? 'لاگ ان کریں' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                      authMode === 'register'
                        ? 'bg-[#E11D74] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {selectedRole === 'vendor' ? '+ Register Shop' : selectedRole === 'rider' ? '+ Register Rider' : '+ Create Account'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {authMode === 'login' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ur' ? 'ای میل، فون نمبر یا یوزر نیم' : 'Email, Phone Number or Username'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(''); }}
                        placeholder={
                          selectedRole === 'admin' 
                            ? 'Enter Admin email or username'
                            : selectedRole === 'vendor'
                            ? 'Enter Shop email or phone'
                            : selectedRole === 'rider'
                            ? 'Enter Rider mobile number'
                            : 'Enter email or mobile number'
                        }
                        className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D74] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D74] focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 hover:opacity-95 ${
                      selectedRole === 'admin'
                        ? 'bg-purple-800 shadow-purple-500/20'
                        : selectedRole === 'vendor'
                        ? 'bg-amber-600 shadow-amber-500/20'
                        : selectedRole === 'rider'
                        ? 'bg-emerald-600 shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-[#E11D74] to-[#C2185B] shadow-pink-500/20'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {language === 'ur'
                        ? `${selectedRole.toUpperCase()} کے طور پر لاگ ان کریں`
                        : `Sign In as ${selectedRole.toUpperCase()}`}
                    </span>
                  </button>
                </>
              ) : (
                /* Registration Forms */
                <div className="space-y-3">
                  {selectedRole === 'customer' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={regCustomerName}
                            onChange={(e) => setRegCustomerName(e.target.value)}
                            placeholder="e.g. Asif Memon"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Mobile / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={regCustomerPhone}
                            onChange={(e) => setRegCustomerPhone(e.target.value)}
                            placeholder="0300-1122334"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Matli Area</label>
                          <select
                            value={regCustomerArea}
                            onChange={(e) => setRegCustomerArea(e.target.value)}
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          >
                            {MATLI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Choose Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={regCustomerPassword}
                            onChange={(e) => setRegCustomerPassword(e.target.value)}
                            placeholder="Create password"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Street Address</label>
                        <input
                          type="text"
                          value={regCustomerAddress}
                          onChange={(e) => setRegCustomerAddress(e.target.value)}
                          placeholder="House / Street / Landmark"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === 'vendor' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Shop / Hotel Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={regShopName}
                            onChange={(e) => setRegShopName(e.target.value)}
                            placeholder="e.g. Royal Fast Food"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Owner Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={regShopOwner}
                            onChange={(e) => setRegShopOwner(e.target.value)}
                            placeholder="e.g. Haji Rashid"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Phone / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={regShopPhone}
                            onChange={(e) => setRegShopPhone(e.target.value)}
                            placeholder="0300-1122334"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Matli Market Area</label>
                          <select
                            value={regShopArea}
                            onChange={(e) => setRegShopArea(e.target.value)}
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          >
                            {MATLI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === 'rider' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Rider Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={regRiderName}
                          onChange={(e) => setRegRiderName(e.target.value)}
                          placeholder="e.g. Zeeshan Ali"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={regRiderPhone}
                          onChange={(e) => setRegRiderPhone(e.target.value)}
                          placeholder="0300-5555555"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Open Dashboard</span>
                  </button>
                </div>
              )}
            </form>

          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-gray-400 py-3 mt-4">
        <span>&copy; {new Date().getFullYear()} Dastak Delivery • Matli, Sindh • Fast Doorstep Delivery Service</span>
      </footer>

    </div>
  );
};
