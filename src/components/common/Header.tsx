import React, { useState } from 'react';
import { 
  ShoppingBag, MapPin, ChevronDown, User, Clock, Globe, Check,
  LogIn, LogOut, KeyRound, ShieldAlert, Store, Bike,
  Smartphone, Download, ShieldCheck, Bell
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
    currentUser, 
    logoutUser,
    cartItemCount, 
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
    t,
    getRestaurantName,
    unreadNotificationCount,
    openNotificationCenter,
    openApkModal
  } = useApp();

  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState('Shahi Bazaar, Matli');

  // Check active order for current customer
  const activeOrder = (orders || []).find(
    o => o.customerId === currentUser?.id && o.status !== 'delivered' && o.status !== 'cancelled'
  ) || (orders || []).find(o => o.id === trackingOrderId);

  const languageOptions: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
    { code: 'sd', label: 'Sindhi', nativeLabel: 'سنڌي' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs w-full max-w-full overflow-hidden">
      {/* Main Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 text-left">
            <DastakLogo size="sm" showText={true} />
          </div>

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
                        <MapPin className="w-3.5 h-3.5 text-[#E11D74] shrink-0" />
                        <span className="truncate">{area}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vendor Active Shop Selector */}
          {currentRole === 'vendor' && (
            <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-pink-100">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t.vendor}:</span>
              <select
                value={activeVendorRestaurantId}
                onChange={(e) => setActiveVendorRestaurantId(e.target.value)}
                className="text-xs font-semibold bg-amber-50/60 border border-amber-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

        {/* Right Actions: Logged-in Role Badge, Logout, Tracker & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Active Role Badge */}
          <div className="flex items-center gap-1.5 bg-pink-50/80 border border-pink-200/80 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs">
            {currentRole === 'customer' && <User className="w-3.5 h-3.5 text-[#E11D74]" />}
            {currentRole === 'vendor' && <Store className="w-3.5 h-3.5 text-amber-700" />}
            {currentRole === 'rider' && <Bike className="w-3.5 h-3.5 text-emerald-700" />}
            {currentRole === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />}
            <span className="text-xs font-bold text-gray-800 capitalize">
              {currentRole === 'admin' ? 'Super Admin' : currentRole === 'customer' ? t.customer : currentRole === 'vendor' ? t.vendor : t.rider}
            </span>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={() => logoutUser()}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-xs"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'ur' ? 'لاگ آؤٹ' : language === 'sd' ? 'لاگ آئوٽ' : 'Logout'}
            </span>
          </button>

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
                <span className="bg-white text-[#E11D74] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Download APK / Android App Button */}
          <button
            onClick={openApkModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-xs transition-transform active:scale-95"
            title="Download APK / Install Android App"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Download APK</span>
            <span className="sm:hidden text-[11px]">APK</span>
          </button>

          {/* Omni Notification Bell */}
          <button
            onClick={openNotificationCenter}
            className="relative p-2 rounded-xl border border-pink-200/80 bg-white/80 hover:bg-pink-50 text-gray-700 hover:text-[#E11D74] transition-colors"
            title="Omni-Role Notifications"
          >
            <Bell className="w-4 h-4 text-[#E11D74]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E11D74] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-xl border border-pink-200/80 bg-white/80 hover:bg-pink-50 text-gray-700 text-xs font-bold transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-[#E11D74]" />
              <span className="uppercase text-[11px]">{language}</span>
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-pink-100 p-1.5 z-50">
                {languageOptions.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-pink-50 text-[#E11D74] font-bold'
                        : 'text-gray-700 hover:bg-pink-50/50'
                    }`}
                  >
                    <span>{l.nativeLabel}</span>
                    {language === l.code && <Check className="w-3.5 h-3.5 text-[#E11D74]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile More / Profile Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-xl border border-pink-200/80 bg-white/80 hover:bg-pink-50 text-gray-700 text-xs transition-colors"
            >
              <User className="w-4 h-4 text-[#E11D74]" />
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-pink-100 p-3 z-50">
                <div className="pb-2 border-b border-pink-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-gray-800">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{currentRole}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logoutUser();
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg"
                  >
                    {language === 'ur' ? 'لاگ آؤٹ' : 'Logout'}
                  </button>
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
