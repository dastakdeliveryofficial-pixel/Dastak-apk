import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, X, Check, CheckCheck, Trash2, Volume2, VolumeX, 
  Store, Bike, User, ShieldAlert, ChevronRight, Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification, UserRole } from '../../types';

interface OmniNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrder?: (orderId: string) => void;
}

export const OmniNotificationCenter: React.FC<OmniNotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateToOrder
}) => {
  const { 
    appNotifications, 
    unreadNotificationCount, 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    clearAllAppNotifications,
    removeAppNotification,
    isSoundEnabled,
    setIsSoundEnabled,
    setCurrentRole,
    setActiveVendorRestaurantId,
    setActiveRiderId,
    setTrackingOrderId,
    isAuthenticated,
    loginUser,
    triggerTestRoleNotification
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<'all' | 'customer' | 'vendor' | 'rider' | 'admin'>('all');

  if (!isOpen) return null;

  const filteredNotifications = appNotifications.filter(n => {
    if (selectedTab === 'all') return true;
    return n.targetRole === selectedTab;
  });

  const handleActionClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    if (n.action) {
      // If user is currently logged out or in different role, switch and navigate seamlessly
      if (n.action.role) {
        if (!isAuthenticated) {
          loginUser('0300-1234567', n.action.role, {
            restaurantId: n.action.restaurantId,
            riderId: n.action.riderId
          });
        } else {
          setCurrentRole(n.action.role);
          if (n.action.restaurantId) {
            setActiveVendorRestaurantId(n.action.restaurantId);
          }
          if (n.action.riderId) {
            setActiveRiderId(n.action.riderId);
          }
        }
      }

      if (n.action.orderId) {
        setTrackingOrderId(n.action.orderId);
        if (onNavigateToOrder) {
          onNavigateToOrder(n.action.orderId);
        }
      }
    }
    onClose();
  };

  const getRoleBadge = (role: AppNotification['targetRole']) => {
    switch (role) {
      case 'vendor':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Store className="w-3 h-3" /> Vendor
          </span>
        );
      case 'rider':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Bike className="w-3 h-3" /> Rider Fleet
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3" /> Super Admin
          </span>
        );
      case 'customer':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-[#E11D74] border border-pink-200">
            <User className="w-3 h-3" /> Customer
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-pink-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 bg-linear-to-r from-pink-50/70 via-white to-pink-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E11D74] text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <span>Omni-Role Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] bg-[#E11D74] text-white font-black px-2 py-0.5 rounded-full shadow-2xs">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-gray-500">Live alerts for Customer, Shop, Rider & Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className={`p-2 rounded-xl transition-colors ${
                  isSoundEnabled ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                }`}
                title={isSoundEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-pink-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedTab === 'all'
                  ? 'bg-[#E11D74] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              All ({appNotifications.length})
            </button>
            <button
              onClick={() => setSelectedTab('customer')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                selectedTab === 'customer'
                  ? 'bg-[#E11D74] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              <User className="w-3 h-3" /> Customer
            </button>
            <button
              onClick={() => setSelectedTab('vendor')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                selectedTab === 'vendor'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-pink-100'
              }`}
            >
              <Store className="w-3 h-3" /> Vendor
            </button>
            <button
              onClick={() => setSelectedTab('rider')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                selectedTab === 'rider'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 border border-pink-100'
              }`}
            >
              <Bike className="w-3 h-3" /> Rider
            </button>
            <button
              onClick={() => setSelectedTab('admin')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                selectedTab === 'admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-purple-50 border border-pink-100'
              }`}
            >
              <ShieldAlert className="w-3 h-3" /> Admin
            </button>
          </div>
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-gray-400">
              <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <h4 className="font-bold text-sm text-gray-700">No Notifications Yet</h4>
              <p className="text-xs max-w-xs leading-relaxed text-gray-500">
                You will receive real-time notifications here for customer orders, vendor shop updates, rider broadcasts, and admin events across Matli — even when logged out!
              </p>
              
              {/* Quick simulation buttons for testing multi-role notifications */}
              <div className="pt-2 w-full space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Test Notifications</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => triggerTestRoleNotification('vendor')}
                    className="p-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5" /> + Vendor Alert
                  </button>
                  <button
                    onClick={() => triggerTestRoleNotification('rider')}
                    className="p-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Bike className="w-3.5 h-3.5" /> + Rider Alert
                  </button>
                  <button
                    onClick={() => triggerTestRoleNotification('customer')}
                    className="p-2 rounded-xl text-xs font-semibold bg-pink-50 text-[#E11D74] border border-pink-200 hover:bg-pink-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" /> + Customer Alert
                  </button>
                  <button
                    onClick={() => triggerTestRoleNotification('admin')}
                    className="p-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> + Admin Alert
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2 ${
                    n.read 
                      ? 'bg-white border-pink-100 text-gray-700' 
                      : 'bg-pink-50/40 border-pink-300/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getRoleBadge(n.targetRole)}
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#E11D74] animate-pulse" />
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">{n.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!n.read && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="text-gray-400 hover:text-emerald-600 p-1 transition-colors"
                          title="Mark as Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeAppNotification(n.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 text-xs sm:text-sm">{n.title}</h5>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  </div>

                  {n.action && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleActionClick(n)}
                        className="w-full py-2 px-3 bg-white hover:bg-pink-50 text-[#E11D74] font-bold text-xs rounded-xl border border-pink-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>
                          {n.action.role === 'vendor' ? 'Open Vendor Dashboard' : 
                           n.action.role === 'rider' ? 'Open Rider App' : 
                           n.action.role === 'admin' ? 'Open Super Admin' : 'Track Order Details'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-pink-100 bg-gray-50/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-bold text-[#E11D74] hover:text-[#C2185B] flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            {appNotifications.length > 0 && (
              <button
                onClick={clearAllAppNotifications}
                className="text-xs font-semibold text-gray-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <button
            onClick={() => triggerTestRoleNotification('vendor')}
            className="text-[11px] font-bold text-gray-500 hover:text-gray-800 bg-white border border-pink-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-2xs"
            title="Simulate incoming order"
          >
            <Sparkles className="w-3 h-3 text-[#E11D74]" />
            <span>Test Alert</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
