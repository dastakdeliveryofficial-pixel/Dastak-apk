import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { OmniNotificationCenter } from './components/common/OmniNotificationCenter';
import { CustomerHome } from './components/customer/CustomerHome';
import { RestaurantMenuModal } from './components/customer/RestaurantMenuModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { OrderTrackingView } from './components/customer/OrderTrackingView';
import { OrderHistoryModal } from './components/customer/OrderHistoryModal';
import { AddressManagementModal } from './components/customer/AddressManagementModal';
import { ApkDownloadModal } from './components/common/ApkDownloadModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { RiderApp } from './components/rider/RiderApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Restaurant } from './types';
import { MessageCircle, Smartphone, ShieldAlert } from 'lucide-react';
import { openWhatsAppChat } from './utils/whatsapp';

const MainAppContent: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    isAuthenticated, 
    loginUser, 
    platformSettings, 
    language, 
    setLanguage, 
    t, 
    triggerToast,
    isNotificationCenterOpen,
    closeNotificationCenter,
    isApkModalOpen,
    setIsApkModalOpen,
    openApkModal,
    closeApkModal
  } = useApp();

  // Modals & Navigation state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  const handleOpenRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleOrderPlaced = (orderId: string) => {
    setIsCartOpen(false);
    setSelectedRestaurant(null);
    setActiveTrackingOrderId(orderId);
  };

  const handleTrackOrderFromHistory = (orderId: string) => {
    setIsHistoryOpen(false);
    setActiveTrackingOrderId(orderId);
  };

  // If not authenticated, always show the full-screen Login & Role Selection portal first
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <OmniNotificationCenter 
          isOpen={isNotificationCenterOpen} 
          onClose={closeNotificationCenter} 
        />
        <ApkDownloadModal
          isOpen={isApkModalOpen}
          onClose={closeApkModal}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-[#1F2937] flex flex-col font-sans selection:bg-[#E11D74] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Universal Header with Role Switcher & Cart */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAddresses={() => setIsAddressOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main View Router based on Selected Role */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentRole === 'customer' && (
          activeTrackingOrderId ? (
            <OrderTrackingView
              orderId={activeTrackingOrderId}
              onBack={() => setActiveTrackingOrderId(null)}
            />
          ) : selectedRestaurant ? (
            <RestaurantMenuModal
              restaurant={selectedRestaurant}
              onBack={() => setSelectedRestaurant(null)}
              onOpenCart={() => {
                setIsCartOpen(true);
              }}
            />
          ) : (
            <CustomerHome
              onSelectRestaurant={handleOpenRestaurant}
              onOpenCart={() => setIsCartOpen(true)}
              onTrackOrder={handleTrackOrderFromHistory}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          )
        )}

        {currentRole === 'vendor' && <VendorDashboard />}

        {currentRole === 'rider' && <RiderApp />}

        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Clean Minimalist App Footer */}
      <footer className="bg-white border-t border-pink-100 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 w-full max-w-full">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <span>&copy; {new Date().getFullYear()} Dastak Delivery • Matli, Sindh</span>
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="text-[#E11D74] hover:text-[#C2185B] font-bold flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📲 Download APK (Android App)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {/* Quick Language Switcher in Footer */}
          <div className="flex items-center bg-pink-50 border border-pink-200 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                language === 'en' ? 'bg-[#E11D74] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ur')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                language === 'ur' ? 'bg-[#E11D74] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => setLanguage('sd')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                language === 'sd' ? 'bg-[#E11D74] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              سنڌي
            </button>
          </div>

          <span className="text-[#E11D74] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Matli Live Support Active
          </span>
        </div>
      </footer>

      {/* Customer Drawers and Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        onOpenAddresses={() => {
          setIsCartOpen(false);
          setIsAddressOpen(true);
        }}
      />

      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onTrackOrder={handleTrackOrderFromHistory}
      />

      <AddressManagementModal
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
      />

      {/* APK & Android App Installation Center */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Authentication & Role ID Login Modal */}
      <AuthModal />

      {/* WhatsApp Quick Support Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            const msg = `Salam Dastak Delivery Matli! I need help with an order or inquiry.`;
            openWhatsAppChat(platformSettings.supportWhatsApp, msg);
          }}
          className="bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white p-3 rounded-full shadow-lg shadow-pink-200 transition-all flex items-center gap-2 group hover:scale-105 border border-white/20"
          title="Chat with Matli Support on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-1">
            Matli Support
          </span>
        </button>
      </div>

      {/* Omni-Role Notification Center Drawer */}
      <OmniNotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={closeNotificationCenter}
        onNavigateToOrder={(orderId) => setActiveTrackingOrderId(orderId)}
      />

      {/* Global Notifications System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
