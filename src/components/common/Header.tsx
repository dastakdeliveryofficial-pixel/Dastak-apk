import React, { useState } from 'react';
import { 
  ShoppingBag, MapPin, ChevronDown, User, Clock, Globe, Check,
  LogIn, LogOut, KeyRound, ShieldAlert, Sparkles, Store, Bike,
  Smartphone, Download, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, Language } from '../../types';
import { MATLI_AREAS } from '../../data/mockData';
import { DastakLogo } from './DastakLogo';

interface HeaderProps {
  onOpenCart?: () => void;
  onOpenTracking?: () => void;
  onOpenHistory?: () => void;
  onOpenAddresses?: () => void;
  onOpenApkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenTracking,
  onOpenHistory,
  onOpenAddresses,
  onOpenApkModal
}) => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser, 
    isAuthenticated,
    loginUser,
    openLoginModal,
    logoutUser,
    cartItemCount, 
    cartTotal, 
    orders, 
    trackingOrderId,
    setTrackingOrderId,
    platformSettings,
    restaurants,
    activeVendorRestaurantId,
    setActiveVendorRestaurantId,
    riders,
    activeRiderId,
    setActiveRiderId,
    language,
    setLanguage,
    triggerToast,
    t,
    getRestaurantName
  } = useApp();

  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState('Shahi Bazaar, Matli');

  // Check active order for current customer
  const activeOrder = orders.find(
    o => o.customerId === currentUser.id && o.status !== 'delivered' && o.status !== 'cancelled'
  ) || orders.find(o => o.id === trackingOrderId);

  const roles: { id: UserRole; short: string; label: string; bgClass: string; textClass: string; activeClass: string }[] = [
    { id: 'customer', short: 'C', label: t.customer, bgClass: 'bg-pink-100', textClass: 'text-[#E11D74]', activeClass: 'ring-2 ring-[#E11D74] bg-pink-50 text-[#E11D74]' },
    { id: 'vendor', short: 'V', label: t.vendor, bgClass: 'bg-amber-100', textClass: 'text-amber-700', activeClass: 'ring-2 ring-amber-500 bg-amber-50 text-amber-700' },
    { id: 'rider', short: 'R', label: t.rider, bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', activeClass: 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-700' },
    { id: 'admin', short: 'A', label: t.admin, bgClass: 'bg-purple-100', textClass: 'text-purple-700', activeClass: 'ring-2 ring-purple-600 bg-purple-50 text-purple-800' }
  ];

  const languageOptions: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
    { code: 'sd', label: 'Sindhi', nativeLabel: 'سنڌي' }
  ];

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'admin') {
      loginUser('admin@dastakdelivery.pk', 'admin', 'admin');
      setCurrentRole('admin');
      triggerToast('Super Admin Active', 'Switched to Super Admin Console', 'success');
    } else {
      setCurrentRole(role);
    }
  };


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs w-full max-w-full overflow-hidden">
      {/* Main Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentRole('customer')}
            className="flex items-center gap-2 text-left group"
          >
            <DastakLogo size="sm" showText={true} />
          </button>

          {/* Delivery Location Selector (Customer View) */}
          {currentRole === 'customer' && (
            <div className="relative hidden md:block ml-2 pl-3 border-l border-pink-100">
              <button
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#E11D74] transition-colors bg-pink-50/60 hover:bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E11D74]" />
                <span className="font-medium truncate max-w-[150px]">{selectedArea}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isLocationMenuOpen && (
                <div className="absolute top-full left-3 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1">
                    {t.selectArea}
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                    {MATLI_AREAS.map((area) => (
                      <button
                        key={area}
                        onClick={() => {
                          setSelectedArea(area + ', Matli');
                          setIsLocationMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                          selectedArea.startsWith(area)
                            ? 'bg-pink-50 text-[#E11D74] font-bold'
                            : 'text-gray-700 hover:bg-pink-50/50'
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-[#E11D74] shrink-0" />
                        <span className="truncate">{area}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vendor Active Store Switcher */}
          {currentRole === 'vendor' && (
            <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-pink-100">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t.vendor}:</span>
              <select
                value={activeVendorRestaurantId}
                onChange={(e) => setActiveVendorRestaurantId(e.target.value)}
                className="text-xs font-semibold bg-pink-50/50 border border-pink-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {getRestaurantName(r)} ({r.area})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rider Active Profile Switcher */}
          {currentRole === 'rider' && (
            <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-pink-100">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t.rider}:</span>
              <select
                value={activeRiderId}
                onChange={(e) => setActiveRiderId(e.target.value)}
                className="text-xs font-semibold bg-emerald-50/60 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {riders.map((rd) => (
                  <option key={rd.id} value={rd.id}>
                    {rd.name} ({rd.vehicleType.toUpperCase()} - {rd.currentArea})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Actions: Role Selector Avatars, Tracker & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Overlapping Clean Role Switcher Avatars */}
          <div className="flex items-center gap-1 bg-pink-50/70 border border-pink-200/80 p-0.5 sm:px-2 sm:py-1 rounded-full">
            <div className="flex -space-x-1.5 sm:-space-x-2 items-center">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  title={`Switch to ${r.label}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${r.bgClass} border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold ${r.textClass} transition-transform hover:scale-110 hover:z-10 ${
                    currentRole === r.id ? 'ring-2 ring-[#E11D74] scale-105 z-10' : 'opacity-80'
                  }`}
                >
                  {r.short}
                </button>
              ))}
            </div>
            <button
              onClick={() => openLoginModal(currentRole)}
              className="text-[11px] font-bold text-pink-900 pr-1 hover:text-[#E11D74] hidden md:flex items-center gap-1 capitalize"
              title="Click to open login portal"
            >
              <span>{roles.find(r => r.id === currentRole)?.label}</span>
              <KeyRound className="w-3 h-3 opacity-60" />
            </button>
          </div>

          {/* Active Order Live Tracker Pill */}
          {currentRole === 'customer' && activeOrder && (
            <button
              onClick={() => {
                setTrackingOrderId(activeOrder.id);
                if (onOpenTracking) onOpenTracking();
              }}
              className="flex items-center gap-1 bg-[#E11D74] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-xs hover:bg-[#C2185B] transition-all"
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span className="text-[10px] font-bold">#{activeOrder.orderNumber}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </button>
          )}

          {/* Customer History & Addresses on Desktop */}
          {currentRole === 'customer' && (
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={onOpenHistory}
                className="text-xs font-semibold text-gray-700 hover:text-[#E11D74] px-2.5 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
              >
                {t.orders}
              </button>
              <button
                onClick={onOpenAddresses}
                className="text-xs font-semibold text-gray-700 hover:text-[#E11D74] px-2.5 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
              >
                {t.addresses}
              </button>
            </div>
          )}

          {/* Cart Trigger Button */}
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t.cart}</span>
              {cartItemCount > 0 && (
                <span className="bg-amber-300 text-pink-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Profile Button */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50/80 border border-pink-200 flex items-center justify-center text-pink-800 hover:bg-pink-100 transition-colors"
              title="Account & Settings"
            >
              <User className="w-4 h-4" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-pink-100 p-3 z-50">
                <div className="pb-2 border-b border-pink-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-500">{currentUser.phone}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 bg-pink-50 text-[#E11D74] rounded border border-pink-200">
                      Role: {currentRole}
                    </span>
                  </div>
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsProfileMenuOpen(false);
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        openLoginModal(currentRole);
                        setIsProfileMenuOpen(false);
                      }}
                      className="text-xs font-bold bg-[#E11D74] text-white px-2.5 py-1 rounded-lg hover:bg-[#C2185B]"
                    >
                      Login
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-1 text-xs border-b border-pink-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    {t.selectLanguage}
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1 pt-1">
                    {languageOptions.map(l => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`py-1 rounded-lg text-center text-xs font-bold transition-all ${
                          language === l.code
                            ? 'bg-[#E11D74] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-[#E11D74]'
                        }`}
                      >
                        {l.nativeLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1.5 space-y-1 text-xs">
                  {/* Direct Switch to Super Admin */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleRoleSelect('admin');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                      <span>👑 Super Admin Console</span>
                    </span>
                    <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-bold">Direct</span>
                  </button>

                  {/* Download APK option */}
                  {onOpenApkModal && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenApkModal();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#E11D74] font-bold flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>📲 Download Android APK</span>
                      </span>
                      <span className="text-[10px] bg-pink-200 text-pink-900 px-1.5 py-0.2 rounded font-bold">Install</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openLoginModal(currentRole);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-pink-50 text-gray-700 font-semibold flex items-center justify-between"
                  >
                    <span>Multi-Role Login Portal</span>
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>

                  {currentRole === 'customer' && (
                    <>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenHistory) onOpenHistory();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-pink-50 text-gray-700 font-medium"
                      >
                        {t.orderHistory}
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenAddresses) onOpenAddresses();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-pink-50 text-gray-700 font-medium"
                      >
                        {t.savedAddresses}
                      </button>
                    </>
                  )}

                  <div className="pt-2 text-[11px] text-gray-500">
                    <p>Matli Helpline: {platformSettings.supportPhone}</p>
                    <p>WhatsApp: {platformSettings.supportWhatsApp}</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
