import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Store, Bike, ShieldAlert, User, Phone, MapPin, 
  ClipboardList, Smartphone, Globe, MessageCircle, 
  Volume2, VolumeX, LogOut, ChevronRight, Sparkles, Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { openWhatsAppChat } from '../../utils/whatsapp';

interface CustomerNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  onOpenAddresses: () => void;
  onOpenApkModal: () => void;
  onOpenFavorites: () => void;
}

export const CustomerNavDrawer: React.FC<CustomerNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenAddresses,
  onOpenApkModal,
  onOpenFavorites
}) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    logoutUser,
    language,
    setLanguage,
    platformSettings,
    isSoundEnabled,
    setIsSoundEnabled,
    orders
  } = useApp();

  const customerOrdersCount = (orders || []).filter(
    o => o.customerId === currentUser?.id || (currentUser?.phone && o.customerPhone === currentUser?.phone)
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header with Radiant Magenta Brand Identity */}
            <div className="bg-gradient-to-br from-[#D81B60] via-[#E11D74] to-[#C2185B] text-white p-5 pt-7 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👑</span>
                <span className="font-black text-xl tracking-tight text-white drop-shadow-xs">
                  Dastak Delivery
                </span>
              </div>
              <p className="text-[11px] text-pink-100 font-medium italic">
                Darwaze par hi nahi, dil par bhi hogi dastak ♡
              </p>

              {/* User Profile Card */}
              <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#E11D74] font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm truncate text-white leading-tight">
                    {currentUser?.name || 'Matli Customer'}
                  </h4>
                  <p className="text-[11px] text-pink-100 flex items-center gap-1 mt-0.5 truncate">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{currentUser?.phone || '0300-1234567'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Role Switcher Section */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2 px-1">
                  Switch Portal / پورٹل تبدیل کریں
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('customer');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs font-bold flex items-center gap-2 ${
                      currentRole === 'customer'
                        ? 'border-[#E11D74] bg-pink-50 text-[#E11D74]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#E11D74]" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('vendor');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl text-left border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all text-xs font-bold flex items-center gap-2"
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Vendor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('rider');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl text-left border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all text-xs font-bold flex items-center gap-2"
                  >
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span>Rider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('admin');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl text-left border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all text-xs font-bold flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Main Customer Actions */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1 px-1">
                  Customer Shortcuts
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOrders();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 text-gray-700 hover:text-[#E11D74] transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 text-[#E11D74]" />
                    <span>My Orders & History</span>
                  </div>
                  {customerOrdersCount > 0 && (
                    <span className="bg-[#E11D74] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {customerOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFavorites();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 text-gray-700 hover:text-[#E11D74] transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-[#E11D74]" />
                    <span>Saved Favorites</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddresses();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 text-gray-700 hover:text-[#E11D74] transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#E11D74]" />
                    <span>Saved Delivery Addresses</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApkModal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 transition-colors text-xs font-bold border border-emerald-200/70"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Download Android App (.APK)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-black">
                    FREE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    const msg = `Salam Dastak Delivery Matli! I need help with an order or inquiry.`;
                    openWhatsAppChat(platformSettings.supportWhatsApp, msg);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-50/60 hover:bg-teal-50 text-teal-800 transition-colors text-xs font-bold border border-teal-200/70"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-teal-600" />
                    <span>Matli WhatsApp Support</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-600">Active</span>
                </button>
              </div>

              {/* Preferences: Language & Sound */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block px-1">
                  App Preferences
                </span>

                {/* Language Switcher */}
                <div>
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'en'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('ur')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'ur'
                          ? 'bg-[#E11D74] text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      اردو
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('sd')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'sd'
                          ? 'bg-[#E11D74] text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      سنڌي
                    </button>
                  </div>
                </div>

                {/* Sound FX Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isSoundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Sound Effects & Chimes</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSoundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isSoundEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Footer with Logout */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logoutUser();
                }}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <span className="text-[10px] text-gray-400">
                v2.5 • Matli, Sindh
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
