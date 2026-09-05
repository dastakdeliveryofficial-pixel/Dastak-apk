import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Store, Bike, ShieldAlert, KeyRound, Mail, 
  LogIn, UserPlus, Eye, EyeOff, AlertCircle,
  MapPin, CheckCircle2, Phone, Lock, Sparkles, Loader2, Bell, Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import { MATLI_AREAS } from '../../data/mockData';
import { DastakLogo } from '../common/DastakLogo';

export const LoginScreen: React.FC = () => {
  const { 
    loginUser, 
    loginWithEmailPassword,
    registerWithEmailPassword,
    sendPasswordReset,
    registerCustomerAccount,
    registerNewVendor,
    registerRider,
    allUsers,
    restaurants,
    riders,
    triggerToast,
    language,
    setLanguage,
    unreadNotificationCount,
    openNotificationCenter,
    openApkModal
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Input states - strictly empty by default
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Customer Registration State
  const [regCustomerName, setRegCustomerName] = useState('');
  const [regCustomerEmail, setRegCustomerEmail] = useState('');
  const [regCustomerPhone, setRegCustomerPhone] = useState('');
  const [regCustomerAddress, setRegCustomerAddress] = useState('');
  const [regCustomerArea, setRegCustomerArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');
  const [regCustomerPassword, setRegCustomerPassword] = useState('');

  // Vendor Registration State
  const [regShopName, setRegShopName] = useState('');
  const [regShopOwner, setRegShopOwner] = useState('');
  const [regShopEmail, setRegShopEmail] = useState('');
  const [regShopPhone, setRegShopPhone] = useState('');
  const [regShopArea, setRegShopArea] = useState(MATLI_AREAS[0] || 'Shahi Bazaar');
  const [regShopPassword, setRegShopPassword] = useState('');

  // Rider Registration State
  const [regRiderName, setRegRiderName] = useState('');
  const [regRiderEmail, setRegRiderEmail] = useState('');
  const [regRiderPhone, setRegRiderPhone] = useState('');
  const [regRiderPlate, setRegRiderPlate] = useState('');
  const [regRiderPassword, setRegRiderPassword] = useState('');

  // Role switch handler
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login');
    setErrorMsg('');
    setIdentifier('');
    setPassword('');
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'forgot') {
        if (!identifier.trim()) {
          setErrorMsg('Please enter your registered email address.');
          setIsLoading(false);
          return;
        }
        await sendPasswordReset(identifier.trim());
        setAuthMode('login');
        setIsLoading(false);
        return;
      }

      if (authMode === 'register') {
        if (selectedRole === 'customer') {
          if (!regCustomerName.trim() || !regCustomerPhone.trim()) {
            setErrorMsg('Please enter your full name and mobile number.');
            setIsLoading(false);
            return;
          }
          const email = regCustomerEmail.trim() || `${regCustomerPhone.trim().replace(/[^0-9]/g, '')}@dastak.pk`;
          const pass = regCustomerPassword.trim() || password.trim() || 'dastak123';

          await registerWithEmailPassword({
            email,
            pass,
            name: regCustomerName.trim(),
            phone: regCustomerPhone.trim(),
            role: 'customer',
            address: regCustomerAddress.trim(),
            area: regCustomerArea
          });
        } else if (selectedRole === 'vendor') {
          if (!regShopName.trim() || !regShopPhone.trim() || !regShopOwner.trim()) {
            setErrorMsg('Please enter Shop Name, Owner Name and Phone.');
            setIsLoading(false);
            return;
          }
          const email = regShopEmail.trim() || `vendor_${regShopPhone.trim().replace(/[^0-9]/g, '')}@dastak.pk`;
          const pass = regShopPassword.trim() || password.trim() || 'vendor123';

          await registerWithEmailPassword({
            email,
            pass,
            name: regShopOwner.trim(),
            phone: regShopPhone.trim(),
            role: 'vendor',
            area: regShopArea,
            shopName: regShopName.trim(),
            shopOwner: regShopOwner.trim()
          });
        } else if (selectedRole === 'rider') {
          if (!regRiderName.trim() || !regRiderPhone.trim()) {
            setErrorMsg('Please enter Rider Name and Phone Number.');
            setIsLoading(false);
            return;
          }
          const email = regRiderEmail.trim() || `rider_${regRiderPhone.trim().replace(/[^0-9]/g, '')}@dastak.pk`;
          const pass = regRiderPassword.trim() || password.trim() || 'rider123';

          await registerWithEmailPassword({
            email,
            pass,
            name: regRiderName.trim(),
            phone: regRiderPhone.trim(),
            role: 'rider',
            area: MATLI_AREAS[0] || 'Shahi Bazaar',
            vehiclePlate: regRiderPlate.trim() || 'MATLI-BIKE'
          });
        }
        setIsLoading(false);
        return;
      }

      // Login Verification
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanId || !cleanPass) {
        setErrorMsg(
          language === 'ur' 
            ? 'براہ کرم ای میل/فون نمبر اور پاس ورڈ دونوں درج کریں۔'
            : 'Please enter both your email/username and password.'
        );
        setIsLoading(false);
        return;
      }

      // Try Firebase Auth first if email format, otherwise use matched credential
      let emailToAuth = cleanId;
      if (!cleanId.includes('@')) {
        if (selectedRole === 'admin') emailToAuth = 'admin@dastak.pk';
        else if (selectedRole === 'vendor') emailToAuth = 'vendor@dastak.pk';
        else if (selectedRole === 'rider') emailToAuth = 'rider@dastak.pk';
        else emailToAuth = `${cleanId.replace(/[^0-9]/g, '')}@dastak.pk`;
      }

      try {
        await loginWithEmailPassword(emailToAuth, cleanPass, selectedRole);
      } catch (err: any) {
        // Fallback local check for standard preset roles
        const demoAcc = DEMO_ACCOUNTS[selectedRole];
        const isMatchedDemo = (
          (cleanId === demoAcc.email.toLowerCase() || cleanId === selectedRole || cleanId.replace(/[^0-9]/g, '') === demoAcc.phone.replace(/[^0-9]/g, '')) &&
          (cleanPass === demoAcc.password || cleanPass === '123456' || cleanPass === 'admin123')
        );

        if (isMatchedDemo) {
          loginUser(cleanId, selectedRole, {
            name: demoAcc.name,
            restaurantId: demoAcc.restaurantId,
            riderId: demoAcc.riderId
          });
        } else {
          setErrorMsg(
            language === 'ur'
              ? 'غلط ای میل، یوزرنیم یا پاس ورڈ۔ دوبارہ کوشش کریں۔'
              : 'Invalid email or password. Please verify credentials.'
          );
        }
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
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
              Matli, Sindh • Live Cloud Platform
            </span>
          </div>
        </div>

        {/* Header Actions: Download APK, Omni Notification Bell & Language */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-xs transition-transform active:scale-95"
            title="Download APK / Install Android App"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Download APK</span>
            <span className="sm:hidden text-[11px]">APK</span>
          </button>

          <button
            type="button"
            onClick={openNotificationCenter}
            className="relative p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xs border border-pink-100 text-gray-700 hover:text-[#E11D74] transition-colors"
            title="Omni-Role Notifications"
          >
            <Bell className="w-4 h-4 text-[#E11D74]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E11D74] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-xs border border-pink-100">
            {(['en', 'ur', 'sd'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === lang 
                    ? 'bg-[#E11D74] text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-pink-50'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'ur' ? 'اردو' : 'سنڌي'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-pink-900/5 border border-pink-100/80 overflow-hidden">
          
          {/* Top Banner with Matli City Badge */}
          <div className="bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#C2185B] p-6 text-white text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
              <MapPin className="w-3.5 h-3.5 text-pink-200" />
              <span>Matli Food & Grocery Delivery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {getRoleTitle(selectedRole)}
            </h2>
            <p className="text-xs text-pink-100 mt-1 max-w-xs mx-auto">
              {selectedRole === 'customer' && 'Order delicious food, fresh biryani, fast food & groceries in Matli'}
              {selectedRole === 'vendor' && 'Manage your kitchen catalog, live orders & daily payouts'}
              {selectedRole === 'rider' && 'Deliver food orders across Matli & earn daily income'}
              {selectedRole === 'admin' && 'Secure administrative console & platform management'}
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="p-5 pb-0">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">
              {language === 'ur' ? 'اپنا رول منتخب کریں' : 'Select Portal Role'}
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/60">
              <button
                type="button"
                onClick={() => handleSelectRole('customer')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'customer'
                    ? 'bg-white text-[#E11D74] shadow-xs scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 mb-0.5" />
                <span className="text-[11px]">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('vendor')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'vendor'
                    ? 'bg-white text-amber-600 shadow-xs scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Store className="w-4 h-4 mb-0.5" />
                <span className="text-[11px]">Vendor</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('rider')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'rider'
                    ? 'bg-white text-emerald-600 shadow-xs scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bike className="w-4 h-4 mb-0.5" />
                <span className="text-[11px]">Rider</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-white text-purple-700 shadow-xs scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 mb-0.5" />
                <span className="text-[11px]">Admin</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-5 pt-4">
            
            {/* Mode Switcher: Sign In vs Sign Up (Not available for Super Admin) */}
            {selectedRole !== 'admin' && (
              <div className="flex border-b border-gray-100 mb-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all ${
                    authMode === 'login' 
                      ? 'border-[#E11D74] text-[#E11D74]' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {language === 'ur' ? 'سائن ان' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all ${
                    authMode === 'register' 
                      ? 'border-[#E11D74] text-[#E11D74]' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {selectedRole === 'customer' && (language === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Create Account')}
                  {selectedRole === 'vendor' && (language === 'ur' ? 'دکان رجسٹر کریں' : 'Register Shop')}
                  {selectedRole === 'rider' && (language === 'ur' ? 'رائیڈر بنیں' : 'Join as Rider')}
                </button>
              </div>
            )}

            {/* Error Message Toast */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="font-semibold">{errorMsg}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              
              {authMode === 'login' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center justify-between">
                      <span>
                        {selectedRole === 'customer' && 'Email or Mobile Number'}
                        {selectedRole === 'vendor' && 'Vendor Email or Phone'}
                        {selectedRole === 'rider' && 'Rider Email or Phone'}
                        {selectedRole === 'admin' && 'Admin Email / Username'}
                      </span>
                      <span className="text-[10px] text-red-500 font-bold">* Required</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === 'customer' ? 'e.g. 0300-1234567 or customer@dastak.pk' :
                          selectedRole === 'vendor' ? 'e.g. 0300-9876543 or vendor@dastak.pk' :
                          selectedRole === 'rider' ? 'e.g. 0300-5555555 or rider@dastak.pk' :
                          'admin@dastak.pk'
                        }
                        className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] focus:border-transparent outline-none transition-all"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-[10px] text-red-500 font-bold">* Required</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] focus:border-transparent outline-none transition-all"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#E11D74] to-[#C2185B] hover:from-[#D81B60] hover:to-[#AD1457] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to {selectedRole.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* Registration Forms */
                <div className="space-y-3">
                  {selectedRole === 'customer' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={regCustomerName}
                          onChange={(e) => setRegCustomerName(e.target.value)}
                          placeholder="e.g. Muhammad Hamza"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={regCustomerPhone}
                            onChange={(e) => setRegCustomerPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                            required
                          />
                        </div>
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
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Create Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={regCustomerPassword}
                          onChange={(e) => setRegCustomerPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Delivery Address</label>
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

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Vendor Account Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={regShopPassword}
                          onChange={(e) => setRegShopPassword(e.target.value)}
                          placeholder="Password for vendor portal login"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          required
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === 'rider' && (
                    <div className="space-y-2.5">
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

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Rider Account Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={regRiderPassword}
                          onChange={(e) => setRegRiderPassword(e.target.value)}
                          placeholder="Password for rider app login"
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E11D74] outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register & Open Dashboard</span>
                      </>
                    )}
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
