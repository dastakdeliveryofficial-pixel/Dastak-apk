import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, UserRole, Restaurant, MenuItem, Order, Rider, 
  Category, BannerPromo, PlatformSettings, Address, OrderItem, OrderStatus, Language, AloChatMessage, AppNotification 
} from '../types';
import { 
  INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS, INITIAL_ORDERS, 
  INITIAL_RIDERS, INITIAL_CUSTOMERS, CATEGORIES, 
  BANNER_PROMOS, INITIAL_SETTINGS 
} from '../data/mockData';
import { sounds } from '../utils/audio';
import { TRANSLATIONS, Translations, getLocalizedName, getLocalizedDescription, getLocalizedPromo } from '../utils/translations';
import { 
  auth, 
  db, 
  doc, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onAuthStateChanged 
} from '../lib/firebase';
import { 
  seedInitialFirestoreData, 
  registerFirebaseUser, 
  loginFirebaseUser, 
  resetFirebasePassword, 
  logoutFirebaseUser,
  subscribeToOrders,
  subscribeToRestaurants,
  subscribeToMenuItems,
  subscribeToRiders,
  subscribeToUsers,
  createFirestoreOrder,
  updateFirestoreOrderStatus,
  clearAllRestaurantsAndMenuFromFirestore
} from '../lib/firestoreService';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface CartState {
  restaurantId: string | null;
  items: OrderItem[];
  specialInstructions: string;
  promoCode: string;
  discount: number;
}

interface AppContextType {
  // Language & Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
  getRestaurantName: (r: Restaurant) => string;
  getRestaurantDesc: (r: Restaurant) => string;
  getItemName: (item: MenuItem) => string;
  getItemDesc: (item: MenuItem) => string;
  getCategoryName: (cat: Category) => string;
  getPromoContent: (promo: BannerPromo) => { title: string; subtitle: string };

  // Auth & Session
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalRole: UserRole;
  setAuthModalRole: (role: UserRole) => void;
  openLoginModal: (role?: UserRole) => void;
  loginWithEmailPassword: (email: string, pass: string, role?: UserRole) => Promise<void>;
  registerWithEmailPassword: (data: {
    email: string;
    pass: string;
    name: string;
    phone: string;
    role: UserRole;
    address?: string;
    area?: string;
    shopName?: string;
    shopOwner?: string;
    vehiclePlate?: string;
  }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginUser: (emailOrPhone: string, role: UserRole, extra?: { name?: string; restaurantId?: string; riderId?: string }) => void;
  registerCustomerAccount: (data: { name: string; phone: string; email?: string; password?: string; address?: string; area?: string }) => Promise<User>;
  registerNewVendor: (vendorData: {
    name: string;
    nameUrdu?: string;
    ownerName: string;
    phone: string;
    whatsappNumber: string;
    address: string;
    area: string;
    categories: string[];
    email?: string;
    minOrder?: number;
    deliveryFee?: number;
    deliveryTime?: string;
    openingHours?: string;
    image?: string;
    description?: string;
    password?: string;
  }) => Promise<{ restaurantId: string; vendorId: string; restaurant: Restaurant }>;
  registerRider: (riderData: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    cnicNumber?: string;
    vehicleType?: 'bike' | 'loader' | 'bicycle';
    vehiclePlateNumber?: string;
    currentArea?: string;
  }) => Promise<Rider>;
  logoutUser: () => void;

  // Privacy & Permissions
  allowRiderViewCustomerInfo: boolean;
  setAllowRiderViewCustomerInfo: (val: boolean) => void;

  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  toggleUserBlock: (userId: string) => void;
  
  // Active Profiles
  activeVendorRestaurantId: string;
  setActiveVendorRestaurantId: (id: string) => void;
  activeRiderId: string;
  setActiveRiderId: (id: string) => void;
  
  // Data
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  riders: Rider[];
  categories: Category[];
  bannerPromos: BannerPromo[];
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  
  // Customer View State & Cart
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cart: CartState;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;
  cartItemCount: number;
  addToCart: (restaurant: Restaurant, item: MenuItem, quantity?: number, variation?: { name: string; price: number }) => void;
  updateCartQuantity: (menuItemId: string, delta: number) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  setSpecialInstructions: (instructions: string) => void;
  
  // Orders & Flow
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  placeOrder: (deliveryAddress: Address, paymentMethod: 'cod' | 'jazzcash' | 'easypaisa') => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, riderId?: string, cancelReason?: string) => Promise<void>;
  assignRiderToOrder: (orderId: string, riderId: string) => Promise<void>;
  reorderPastOrder: (orderId: string) => boolean;
  
  // Addresses
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  
  // Vendor Menu & Profile
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;
  updateRestaurantDetails: (id: string, updates: Partial<Restaurant>) => void;
  toggleRestaurantStatus: (id: string) => void;
  
  // Rider Functions
  toggleRiderOnline: (riderId: string) => void;
  riderClaimDelivery: (orderId: string, riderId: string) => Promise<void>;
  riderCompleteDelivery: (orderId: string) => Promise<void>;
  
  // Admin Operations (Universal Menu, All Restaurants, Approval)
  approveVendor: (restaurantId: string) => void;
  toggleVendorStatus: (restaurantId: string) => void;
  deleteRestaurant: (restaurantId: string) => Promise<void>;
  clearAllRestaurantsAndVendors: () => Promise<void>;
  adminAddNewProduct: (item: Omit<MenuItem, 'id'>) => void;
  adminUpdateProduct: (id: string, updates: Partial<MenuItem>) => void;
  adminDeleteProduct: (id: string) => void;
  onboardRider: (rider: Omit<Rider, 'id' | 'totalDeliveries' | 'rating' | 'earningsToday' | 'earningsWeekly' | 'totalEarnings' | 'walletBalance'>) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addBannerPromo: (promo: Omit<BannerPromo, 'id'>) => void;
  deleteBannerPromo: (id: string) => void;

  // Alo Chat Support
  aloChatMessages: AloChatMessage[];
  sendAloChatMessage: (orderId: string, sender: 'customer' | 'rider' | 'admin', senderName: string, text: string) => void;
  isAloChatOpen: boolean;
  activeAloChatOrderId: string | null;
  openAloChat: (orderId: string) => void;
  closeAloChat: () => void;
  
  // Notifications & UI
  notifications: ToastNotification[];
  dismissNotification: (id: string) => void;
  triggerToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  
  // Omni-Role Notifications (Customer, Vendor, Rider, Admin cross-account real-time alerts)
  appNotifications: AppNotification[];
  unreadNotificationCount: number;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeAppNotification: (id: string) => void;
  clearAllAppNotifications: () => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  triggerTestRoleNotification: (role: UserRole) => void;

  // Reset demo data
  resetToDefaultData: () => void;

  // APK Download Modal
  isApkModalOpen: boolean;
  setIsApkModalOpen: (open: boolean) => void;
  openApkModal: () => void;
  closeApkModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dastak_delivery_app_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_lang');
    return (saved === 'en' || saved === 'ur' || saved === 'sd') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_KEY + '_lang', lang);
  };

  const isRTL = language === 'ur' || language === 'sd';
  const t = TRANSLATIONS[language];

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add('font-urdu');
    } else {
      document.body.classList.remove('font-urdu');
    }
  }, [language, isRTL]);

  const getRestaurantName = (r: Restaurant) => getLocalizedName(r, language);
  const getRestaurantDesc = (r: Restaurant) => getLocalizedDescription(r, language);
  const getItemName = (item: MenuItem) => getLocalizedName(item, language);
  const getItemDesc = (item: MenuItem) => getLocalizedDescription(item, language);
  const getCategoryName = (cat: Category) => getLocalizedName(cat, language);
  const getPromoContent = (promo: BannerPromo) => getLocalizedPromo(promo, language);

  const defaultGuestUser: User = {
    id: 'guest-customer',
    name: 'Matli Customer',
    phone: '0300-1234567',
    email: 'customer@dastak.pk',
    role: 'customer',
    addresses: [],
    isBlocked: false,
    createdAt: new Date().toISOString()
  };

  // Initial Auth Session Loader from localStorage
  const getInitialAuthSession = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated && parsed.currentUser) {
          return {
            isAuthenticated: true,
            currentUser: parsed.currentUser as User,
            currentRole: (parsed.currentRole || parsed.currentUser.role || 'customer') as UserRole,
            activeVendorRestaurantId: (parsed.activeVendorRestaurantId || 'rest-1') as string,
            activeRiderId: (parsed.activeRiderId || 'rider-1') as string
          };
        }
      }
    } catch (e) {
      console.error('Error restoring auth session:', e);
    }
    return {
      isAuthenticated: false,
      currentUser: INITIAL_CUSTOMERS[0] || defaultGuestUser,
      currentRole: 'customer' as UserRole,
      activeVendorRestaurantId: 'rest-1',
      activeRiderId: 'rider-1'
    };
  };

  const initialSession = getInitialAuthSession();

  const [currentRole, setCurrentRoleState] = useState<UserRole>(initialSession.currentRole);
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(initialSession.isAuthenticated);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');

  // Rider & Customer privacy toggle
  const [allowRiderViewCustomerInfo, setAllowRiderViewCustomerInfo] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY + '_rider_privacy') === 'true';
  });

  const [activeVendorRestaurantId, setActiveVendorRestaurantIdState] = useState<string>(initialSession.activeVendorRestaurantId);
  const [activeRiderId, setActiveRiderIdState] = useState<string>(initialSession.activeRiderId);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Alo Chat State
  const [aloChatMessages, setAloChatMessages] = useState<AloChatMessage[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_alochat');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAloChatOpen, setIsAloChatOpen] = useState<boolean>(false);
  const [activeAloChatOrderId, setActiveAloChatOrderId] = useState<string | null>(null);

  // Core Persistent State
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_CUSTOMERS);
  const [currentUser, setCurrentUserState] = useState<User>(initialSession.currentUser);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [bannerPromos, setBannerPromos] = useState<BannerPromo[]>(BANNER_PROMOS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);

  // Session Synchronization helper
  const syncAuthSession = (
    authed: boolean,
    user: User,
    role: UserRole,
    vendorRestId?: string,
    riderId?: string
  ) => {
    setIsAuthenticatedState(authed);
    setCurrentUserState(user);
    setCurrentRoleState(role);
    if (vendorRestId) setActiveVendorRestaurantIdState(vendorRestId);
    if (riderId) setActiveRiderIdState(riderId);

    if (authed) {
      try {
        const payload = {
          isAuthenticated: true,
          currentUser: user,
          currentRole: role,
          activeVendorRestaurantId: vendorRestId || activeVendorRestaurantId,
          activeRiderId: riderId || activeRiderId
        };
        localStorage.setItem(LOCAL_STORAGE_KEY + '_auth_session', JSON.stringify(payload));
      } catch (e) {
        console.error('Failed to save session to localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY + '_auth_session');
      } catch {}
    }
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.currentRole = role;
        localStorage.setItem(LOCAL_STORAGE_KEY + '_auth_session', JSON.stringify(parsed));
      }
    } catch {}
  };

  const setActiveVendorRestaurantId = (id: string) => {
    setActiveVendorRestaurantIdState(id);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.activeVendorRestaurantId = id;
        localStorage.setItem(LOCAL_STORAGE_KEY + '_auth_session', JSON.stringify(parsed));
      }
    } catch {}
  };

  const setActiveRiderId = (id: string) => {
    setActiveRiderIdState(id);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.activeRiderId = id;
        localStorage.setItem(LOCAL_STORAGE_KEY + '_auth_session', JSON.stringify(parsed));
      }
    } catch {}
  };

  const [cart, setCart] = useState<CartState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_cart');
    return saved ? JSON.parse(saved) : {
      restaurantId: null,
      items: [],
      specialInstructions: '',
      promoCode: '',
      discount: 0
    };
  });

  // Omni-Role Notifications State (Persists even across logouts)
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_omni_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const openApkModal = () => setIsApkModalOpen(true);
  const closeApkModal = () => setIsApkModalOpen(false);
  const [isSoundEnabled, setIsSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_sound_pref');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setIsSoundEnabled = (val: boolean) => {
    setIsSoundEnabledState(val);
    localStorage.setItem(LOCAL_STORAGE_KEY + '_sound_pref', val ? 'true' : 'false');
  };

  const dispatchOmniNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'timestamp'>) => {
    const now = Date.now();
    const newNotif: AppNotification = {
      ...notification,
      id: 'notif-' + now + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      read: false,
      timestamp: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    };

    setAppNotifications(prev => {
      const updated = [newNotif, ...prev.slice(0, 49)];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_omni_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSoundEnabled) {
      sounds.playIncomingAlert();
    }

    // Trigger desktop notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/favicon.ico'
        });
      } catch {}
    }
  };

  const markNotificationAsRead = (id: string) => {
    setAppNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_omni_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setAppNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_omni_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeAppNotification = (id: string) => {
    setAppNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_omni_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllAppNotifications = () => {
    setAppNotifications([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_omni_notifications');
    } catch {}
  };

  const openNotificationCenter = () => setIsNotificationCenterOpen(true);
  const closeNotificationCenter = () => setIsNotificationCenterOpen(false);
  const unreadNotificationCount = appNotifications.filter(n => !n.read).length;

  const triggerTestRoleNotification = (role: UserRole) => {
    const testNum = Math.floor(1000 + Math.random() * 9000);
    if (role === 'vendor') {
      dispatchOmniNotification({
        targetRole: 'vendor',
        title: `🔔 [Vendor] New Order #DST-${testNum}`,
        message: `₨ 850 • 2x Chicken Biryani + 1x Raita from Ahmed Ali. Tap to accept & cook!`,
        type: 'order',
        action: { role: 'vendor' }
      });
    } else if (role === 'rider') {
      dispatchOmniNotification({
        targetRole: 'rider',
        title: `🛵 [Rider Fleet] Delivery Request #DST-${testNum}`,
        message: `Pickup at Shahi Bazaar Matli - ₨ 70 delivery fee. Tap to accept!`,
        type: 'rider',
        action: { role: 'rider' }
      });
    } else if (role === 'admin') {
      dispatchOmniNotification({
        targetRole: 'admin',
        title: `👑 [Super Admin] New Matli Order #DST-${testNum}`,
        message: `Live order recorded across Matli network (₨ 1,200).`,
        type: 'system',
        action: { role: 'admin' }
      });
    } else {
      dispatchOmniNotification({
        targetRole: 'customer',
        title: `🛍️ [Customer] Order #DST-${testNum} Dispatched`,
        message: `Rider is on the way to your address with hot meal!`,
        type: 'status',
        action: { role: 'customer' }
      });
    }
  };

  const initialOrdersLoadedRef = useRef(false);
  const prevOrdersMapRef = useRef<Map<string, OrderStatus>>(new Map());

  // 1. Initial Firestore Seeding & Realtime Listeners
  useEffect(() => {
    // Seed initial data if Firestore is fresh
    seedInitialFirestoreData();

    // Subscribe to real-time Orders with Omni-Role Notifications
    const unsubOrders = subscribeToOrders((liveOrders) => {
      const ordersList = liveOrders || [];
      setOrders(ordersList);

      if (!initialOrdersLoadedRef.current) {
        ordersList.forEach(o => prevOrdersMapRef.current.set(o.id, o.status));
        initialOrdersLoadedRef.current = true;
        return;
      }

      // Check for incoming orders or status transitions
      ordersList.forEach(order => {
        const prevStatus = prevOrdersMapRef.current.get(order.id);

        if (!prevStatus) {
          // BRAND NEW ORDER DETECTED
          // 1. Vendor Alert
          dispatchOmniNotification({
            targetRole: 'vendor',
            targetEntityId: order.restaurantId,
            orderId: order.id,
            title: `🔔 New Order #${order.orderNumber} (${order.restaurantName})`,
            message: `₨ ${order.total} • ${order.items.length} items from ${order.customerName}. Accept & start preparing!`,
            type: 'order',
            action: {
              role: 'vendor',
              restaurantId: order.restaurantId,
              orderId: order.id
            }
          });

          // 2. Rider Alert
          dispatchOmniNotification({
            targetRole: 'rider',
            orderId: order.id,
            title: `🛵 Delivery Request #${order.orderNumber}`,
            message: `Pickup at ${order.restaurantName} (${order.restaurantAddress || 'Matli'}) - ₨ ${order.deliveryFee} fare.`,
            type: 'rider',
            action: {
              role: 'rider',
              orderId: order.id
            }
          });

          // 3. Admin Alert
          dispatchOmniNotification({
            targetRole: 'admin',
            orderId: order.id,
            title: `👑 New Matli Order #${order.orderNumber}`,
            message: `Order for ${order.restaurantName} by ${order.customerName} (₨ ${order.total}).`,
            type: 'system',
            action: {
              role: 'admin',
              orderId: order.id
            }
          });

          // 4. Customer Alert
          dispatchOmniNotification({
            targetRole: 'customer',
            targetEntityId: order.customerId,
            orderId: order.id,
            title: `🛍️ Order #${order.orderNumber} Placed`,
            message: `Sent to ${order.restaurantName}. We'll notify you as soon as the kitchen confirms.`,
            type: 'status',
            action: {
              role: 'customer',
              orderId: order.id
            }
          });
        } else if (prevStatus !== order.status) {
          // STATUS TRANSITION DETECTED
          if (order.status === 'confirmed' || order.status === 'preparing') {
            dispatchOmniNotification({
              targetRole: 'customer',
              targetEntityId: order.customerId,
              orderId: order.id,
              title: `🍳 Order #${order.orderNumber} Confirmed`,
              message: `${order.restaurantName} is now preparing your food.`,
              type: 'status',
              action: { role: 'customer', orderId: order.id }
            });
            dispatchOmniNotification({
              targetRole: 'rider',
              orderId: order.id,
              title: `🛵 Order #${order.orderNumber} Preparing`,
              message: `Ready soon for pickup at ${order.restaurantName}.`,
              type: 'rider',
              action: { role: 'rider', orderId: order.id }
            });
          } else if (order.status === 'out_for_delivery') {
            dispatchOmniNotification({
              targetRole: 'customer',
              targetEntityId: order.customerId,
              orderId: order.id,
              title: `🚀 Order #${order.orderNumber} Out for Delivery!`,
              message: `Rider ${order.riderName || 'assigned'} has picked up your food and is on the way!`,
              type: 'status',
              action: { role: 'customer', orderId: order.id }
            });
            dispatchOmniNotification({
              targetRole: 'vendor',
              targetEntityId: order.restaurantId,
              orderId: order.id,
              title: `📦 Order #${order.orderNumber} Dispatched`,
              message: `Rider ${order.riderName || ''} is delivering to customer.`,
              type: 'vendor',
              action: { role: 'vendor', restaurantId: order.restaurantId, orderId: order.id }
            });
          } else if (order.status === 'delivered') {
            dispatchOmniNotification({
              targetRole: 'customer',
              targetEntityId: order.customerId,
              orderId: order.id,
              title: `🎉 Order #${order.orderNumber} Delivered!`,
              message: `Enjoy your meal from ${order.restaurantName}!`,
              type: 'status',
              action: { role: 'customer', orderId: order.id }
            });
            dispatchOmniNotification({
              targetRole: 'vendor',
              targetEntityId: order.restaurantId,
              orderId: order.id,
              title: `💰 Order #${order.orderNumber} Completed`,
              message: `Delivered to ${order.customerName}.`,
              type: 'vendor',
              action: { role: 'vendor', restaurantId: order.restaurantId, orderId: order.id }
            });
            dispatchOmniNotification({
              targetRole: 'admin',
              orderId: order.id,
              title: `✅ Order #${order.orderNumber} Delivered`,
              message: `Delivery completed in Matli (₨ ${order.total}).`,
              type: 'system',
              action: { role: 'admin', orderId: order.id }
            });
          } else if (order.status === 'cancelled') {
            dispatchOmniNotification({
              targetRole: 'customer',
              targetEntityId: order.customerId,
              orderId: order.id,
              title: `❌ Order #${order.orderNumber} Cancelled`,
              message: order.cancelReason || 'Order was cancelled.',
              type: 'status',
              action: { role: 'customer', orderId: order.id }
            });
            dispatchOmniNotification({
              targetRole: 'vendor',
              targetEntityId: order.restaurantId,
              orderId: order.id,
              title: `❌ Order #${order.orderNumber} Cancelled`,
              message: order.cancelReason || 'Order was cancelled.',
              type: 'vendor',
              action: { role: 'vendor', restaurantId: order.restaurantId, orderId: order.id }
            });
          }
        }

        prevOrdersMapRef.current.set(order.id, order.status);
      });
    });

    // Subscribe to real-time Restaurants
    const unsubRestaurants = subscribeToRestaurants((liveRest) => {
      if (liveRest && liveRest.length > 0) {
        setRestaurants(liveRest);
      } else {
        setRestaurants(INITIAL_RESTAURANTS);
      }
    });

    // Subscribe to real-time Menu Items
    const unsubMenu = subscribeToMenuItems((liveMenu) => {
      if (liveMenu && liveMenu.length > 0) {
        setMenuItems(liveMenu);
      } else {
        setMenuItems(INITIAL_MENU_ITEMS);
      }
    });

    // Subscribe to real-time Riders
    const unsubRiders = subscribeToRiders((liveRiders) => {
      setRiders(liveRiders || []);
    });

    // Subscribe to real-time Users
    const unsubUsers = subscribeToUsers((liveUsers) => {
      setAllUsers(liveUsers || []);
    });

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          let resolvedUser: User;
          if (userDocSnap.exists()) {
            resolvedUser = userDocSnap.data() as User;
          } else {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
            if (saved) {
              resolvedUser = JSON.parse(saved).currentUser;
            } else {
              resolvedUser = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || (firebaseUser.email?.split('@')[0] ?? 'Matli Customer'),
                email: firebaseUser.email || `${firebaseUser.uid}@dastak.pk`,
                phone: firebaseUser.phoneNumber || '0300-1234567',
                role: (firebaseUser.email?.includes('admin') ? 'admin' : firebaseUser.email?.includes('vendor') ? 'vendor' : firebaseUser.email?.includes('rider') ? 'rider' : 'customer') as UserRole,
                addresses: [],
                isBlocked: false,
                createdAt: new Date().toISOString()
              };
            }
          }
          syncAuthSession(true, resolvedUser, resolvedUser.role);
        } catch (err) {
          console.error('Error checking auth user profile:', err);
        }
      }
    });

    return () => {
      unsubOrders();
      unsubRestaurants();
      unsubMenu();
      unsubRiders();
      unsubUsers();
      unsubAuth();
    };
  }, [isSoundEnabled]);

  const lastToastRef = useRef<{ title: string; message: string; time: number }>({ title: '', message: '', time: 0 });

  const triggerToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const now = Date.now();
    if (
      lastToastRef.current.title === title && 
      lastToastRef.current.message === message && 
      now - lastToastRef.current.time < 1200
    ) {
      return;
    }
    lastToastRef.current = { title, message, time: now };

    const id = 'toast-' + now + '-' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    };

    setNotifications([newToast]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(t => t.id !== id));
  };

  // Cart Calculations
  const cartSubtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentCartRestaurant = restaurants.find(r => r.id === cart.restaurantId);
  const cartDeliveryFee = cart.items.length > 0 ? (currentCartRestaurant?.deliveryFee ?? platformSettings.baseDeliveryFee) : 0;
  const cartTotal = Math.max(0, cartSubtotal + cartDeliveryFee - cart.discount);
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (
    restaurant: Restaurant, 
    item: MenuItem, 
    quantity: number = 1,
    variation?: { name: string; price: number }
  ) => {
    sounds.playClick();
    const finalPrice = variation ? variation.price : (item.discountedPrice || item.price);
    const finalName = variation ? `${item.name} (${variation.name})` : item.name;

    setCart(prev => {
      if (prev.restaurantId && prev.restaurantId !== restaurant.id && prev.items.length > 0) {
        triggerToast('Cart Replaced', `Switched cart items to ${restaurant.name}`, 'warning');
        return {
          restaurantId: restaurant.id,
          items: [{
            id: 'ci-' + Date.now(),
            menuItemId: item.id,
            name: finalName,
            price: finalPrice,
            quantity: quantity,
            selectedVariation: variation?.name,
            image: item.image
          }],
          specialInstructions: '',
          promoCode: '',
          discount: 0
        };
      }

      const existingIndex = prev.items.findIndex(
        i => i.menuItemId === item.id && (variation ? i.selectedVariation === variation.name : !i.selectedVariation)
      );
      let updatedItems: OrderItem[];

      if (existingIndex > -1) {
        updatedItems = [...prev.items];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: 'ci-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            menuItemId: item.id,
            name: finalName,
            price: finalPrice,
            quantity: quantity,
            selectedVariation: variation?.name,
            image: item.image
          }
        ];
      }

      triggerToast('Added to Cart', `${finalName} added (₨ ${finalPrice})`, 'success');

      return {
        ...prev,
        restaurantId: restaurant.id,
        items: updatedItems
      };
    });
  };

  const updateCartQuantity = (menuItemId: string, delta: number) => {
    sounds.playClick();
    setCart(prev => {
      const existing = prev.items.find(i => i.menuItemId === menuItemId);
      if (!existing) return prev;

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const remaining = prev.items.filter(i => i.menuItemId !== menuItemId);
        return {
          ...prev,
          restaurantId: remaining.length === 0 ? null : prev.restaurantId,
          items: remaining,
          discount: remaining.length === 0 ? 0 : prev.discount
        };
      }

      return {
        ...prev,
        items: prev.items.map(i => i.menuItemId === menuItemId ? { ...i, quantity: newQty } : i)
      };
    });
  };

  const removeFromCart = (menuItemId: string) => {
    sounds.playClick();
    setCart(prev => {
      const remaining = prev.items.filter(i => i.menuItemId !== menuItemId);
      return {
        ...prev,
        restaurantId: remaining.length === 0 ? null : prev.restaurantId,
        items: remaining,
        discount: remaining.length === 0 ? 0 : prev.discount
      };
    });
  };

  const clearCart = () => {
    setCart({
      restaurantId: null,
      items: [],
      specialInstructions: '',
      promoCode: '',
      discount: 0
    });
  };

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const promo = bannerPromos.find(p => p.code.toUpperCase() === trimmed && p.active);
    
    if (!promo) {
      return { success: false, message: 'Invalid promo code. Try MATLI20 or FREESHIP' };
    }

    const calculatedDiscount = Math.round((cartSubtotal * promo.discountPercent) / 100);
    setCart(prev => ({
      ...prev,
      promoCode: promo.code,
      discount: calculatedDiscount
    }));

    sounds.playClick();
    triggerToast('Promo Applied!', `${promo.discountPercent}% discount (₨ ${calculatedDiscount} OFF)`, 'success');
    return { success: true, message: `Promo applied! You saved ₨ ${calculatedDiscount}` };
  };

  const removePromoCode = () => {
    setCart(prev => ({ ...prev, promoCode: '', discount: 0 }));
  };

  const setSpecialInstructions = (instructions: string) => {
    setCart(prev => ({ ...prev, specialInstructions: instructions }));
  };

  // Addresses
  const addresses = currentUser.addresses || [];

  const addAddress = async (newAddr: Omit<Address, 'id'>) => {
    const addressWithId: Address = {
      ...newAddr,
      id: 'addr-' + Date.now(),
      isDefault: addresses.length === 0 ? true : !!newAddr.isDefault
    };

    const updatedAddresses = addressWithId.isDefault
      ? [...addresses.map(a => ({ ...a, isDefault: false })), addressWithId]
      : [...addresses, addressWithId];

    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    setCurrentUser(updatedUser);
    
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { addresses: updatedAddresses });
    } catch {
      // Local fallback
    }

    triggerToast('Address Saved', `Added ${newAddr.label} in ${newAddr.area}`, 'success');
  };

  const deleteAddress = async (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    const updatedUser = { ...currentUser, addresses: updated };
    setCurrentUser(updatedUser);
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { addresses: updated });
    } catch {}
  };

  const setDefaultAddress = async (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    const updatedUser = { ...currentUser, addresses: updated };
    setCurrentUser(updatedUser);
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { addresses: updated });
    } catch {}
  };

  // Real Order Creation in Firestore
  const placeOrder = async (deliveryAddress: Address, paymentMethod: 'cod' | 'jazzcash' | 'easypaisa'): Promise<Order> => {
    const restaurant = restaurants.find(r => r.id === cart.restaurantId) || restaurants[0];
    const orderNum = 'DST-' + Math.floor(1000 + Math.random() * 9000);

    const orderData: Omit<Order, 'id'> = {
      orderNumber: orderNum,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: deliveryAddress.phone || currentUser.phone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantPhone: restaurant.phone,
      restaurantAddress: restaurant.address,
      items: [...cart.items],
      subtotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      discount: cart.discount,
      total: cartTotal,
      status: 'placed',
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specialInstructions: cart.specialInstructions,
      estimatedDeliveryTime: restaurant.deliveryTime
    };

    let createdOrder: Order;
    try {
      createdOrder = await createFirestoreOrder(orderData);
    } catch (err) {
      console.error('Error creating order in Firestore:', err);
      // Fallback local
      const fallbackId = 'ord-' + Date.now();
      createdOrder = { ...orderData, id: fallbackId };
      setOrders(prev => [createdOrder, ...prev]);
    }

    // Clear cart & set tracking
    clearCart();
    setTrackingOrderId(createdOrder.id);

    // Audio & Confetti
    sounds.playOrderSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    triggerToast('Order Placed in Firestore!', `Order #${orderNum} recorded live for ${restaurant.name}`, 'success');
    return createdOrder;
  };

  // Real Order Status Updates in Firestore
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, riderId?: string, cancelReason?: string) => {
    let assignedRiderName: string | undefined;
    let assignedRiderPhone: string | undefined;

    if (riderId) {
      const foundRider = riders.find(r => r.id === riderId);
      if (foundRider) {
        assignedRiderName = foundRider.name;
        assignedRiderPhone = foundRider.phone;
      }
    }

    try {
      await updateFirestoreOrderStatus(orderId, newStatus, riderId, assignedRiderName, assignedRiderPhone, cancelReason);
    } catch (err) {
      console.error('Firestore status update error:', err);
      // Local fallback
      setOrders(prev => prev.map(ord => ord.id === orderId ? {
        ...ord,
        status: newStatus,
        riderId: riderId || ord.riderId,
        riderName: assignedRiderName || ord.riderName,
        riderPhone: assignedRiderPhone || ord.riderPhone,
        cancelReason: cancelReason || ord.cancelReason,
        updatedAt: new Date().toISOString()
      } : ord));
    }

    if (newStatus === 'confirmed' || newStatus === 'out_for_delivery') {
      sounds.playIncomingAlert();
    } else if (newStatus === 'delivered') {
      sounds.playOrderSuccess();
    }

    triggerToast('Order Updated in Firestore', `Status marked as: ${newStatus.toUpperCase()}`, 'info');
  };

  const assignRiderToOrder = async (orderId: string, riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    await updateOrderStatus(orderId, 'confirmed', riderId);
    triggerToast('Rider Assigned', `${rider.name} assigned to deliver`, 'success');
  };

  const reorderPastOrder = (orderId: string): boolean => {
    const pastOrder = orders.find(o => o.id === orderId);
    if (!pastOrder) return false;

    const rest = restaurants.find(r => r.id === pastOrder.restaurantId);
    if (!rest) return false;

    setCart({
      restaurantId: rest.id,
      items: [...pastOrder.items],
      specialInstructions: pastOrder.specialInstructions || '',
      promoCode: '',
      discount: 0
    });

    sounds.playClick();
    triggerToast('Items Added to Cart', `Re-added ${pastOrder.items.length} items from previous order`, 'success');
    return true;
  };

  // Vendor Menu Management with Firestore
  const addMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
    const newItemId = 'item-' + Date.now();
    const newItem: MenuItem = {
      ...itemData,
      id: newItemId
    };

    try {
      await setDoc(doc(db, 'menuItems', newItemId), newItem);
    } catch {}

    setMenuItems(prev => [newItem, ...prev]);
    triggerToast('Dish Added', `${newItem.name} is now live on your menu`, 'success');
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      await updateDoc(doc(db, 'menuItems', id), updates);
    } catch {}

    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerToast('Dish Updated', 'Menu item changes saved', 'success');
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch {}
    setMenuItems(prev => prev.filter(item => item.id !== id));
    triggerToast('Dish Deleted', 'Menu item removed', 'info');
  };

  const toggleMenuItemAvailability = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    updateMenuItem(id, { isAvailable: !item.isAvailable });
  };

  const updateRestaurantDetails = async (id: string, updates: Partial<Restaurant>) => {
    try {
      await updateDoc(doc(db, 'restaurants', id), updates);
    } catch {}
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    triggerToast('Settings Saved', 'Shop details updated successfully', 'success');
  };

  const toggleRestaurantStatus = (id: string) => {
    const r = restaurants.find(item => item.id === id);
    if (!r) return;
    updateRestaurantDetails(id, { isOpen: !r.isOpen });
  };

  // Rider Management
  const toggleRiderOnline = async (riderId: string) => {
    const rd = riders.find(r => r.id === riderId);
    if (!rd) return;

    try {
      await updateDoc(doc(db, 'riders', riderId), { isOnline: !rd.isOnline });
    } catch {}

    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, isOnline: !r.isOnline } : r));
    triggerToast('Status Changed', !rd.isOnline ? 'You are now ONLINE and ready for orders' : 'You are now OFFLINE', 'info');
  };

  const riderClaimDelivery = async (orderId: string, riderId: string) => {
    const rd = riders.find(r => r.id === riderId);
    await updateOrderStatus(orderId, 'out_for_delivery', riderId);
    triggerToast('Order Picked Up!', `You claimed order #${orderId.slice(-4)}. Navigate to delivery location.`, 'success');
  };

  const riderCompleteDelivery = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
    triggerToast('Delivery Completed! 🎉', 'Order marked delivered. Payment added to your wallet.', 'success');
  };

  // Admin Controls
  const approveVendor = async (restaurantId: string) => {
    await updateRestaurantDetails(restaurantId, { isApproved: true });
    triggerToast('Vendor Approved', 'Vendor is now verified and active', 'success');
  };

  const toggleVendorStatus = async (restaurantId: string) => {
    const r = restaurants.find(rest => rest.id === restaurantId);
    if (!r) return;
    await updateRestaurantDetails(restaurantId, { isOpen: !r.isOpen });
  };

  const deleteRestaurant = async (restaurantId: string) => {
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId));
      const itemsToDelete = menuItems.filter(i => i.restaurantId === restaurantId);
      for (const item of itemsToDelete) {
        await deleteDoc(doc(db, 'menuItems', item.id));
      }
    } catch (err) {
      console.error('Error deleting restaurant:', err);
    }
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    setMenuItems(prev => prev.filter(i => i.restaurantId !== restaurantId));
    triggerToast('Shop Deleted', 'Restaurant and menu items removed successfully', 'info');
  };

  const clearAllRestaurantsAndVendors = async () => {
    try {
      await clearAllRestaurantsAndMenuFromFirestore();
    } catch (err) {
      console.error('Error clearing vendors:', err);
    }
    setRestaurants([]);
    setMenuItems([]);
    setOrders([]);
    triggerToast('Vendors Cleared', 'All dummy restaurants and vendor data have been cleared', 'success');
  };

  const toggleUserBlock = async (userId: string) => {
    const u = allUsers.find(user => user.id === userId);
    if (!u) return;

    try {
      await updateDoc(doc(db, 'users', userId), { isBlocked: !u.isBlocked });
    } catch {}

    setAllUsers(prev => prev.map(usr => usr.id === userId ? { ...usr, isBlocked: !usr.isBlocked } : usr));
    triggerToast('User Status Updated', !u.isBlocked ? 'User blocked from ordering' : 'User unblocked', 'warning');
  };

  const onboardRider = async (riderData: Omit<Rider, 'id' | 'totalDeliveries' | 'rating' | 'earningsToday' | 'earningsWeekly' | 'totalEarnings' | 'walletBalance'>) => {
    const riderId = 'rider-' + Date.now();
    const newRider: Rider = {
      ...riderData,
      id: riderId,
      totalDeliveries: 0,
      rating: 5.0,
      earningsToday: 0,
      earningsWeekly: 0,
      totalEarnings: 0,
      walletBalance: 0
    };

    try {
      await setDoc(doc(db, 'riders', riderId), newRider);
    } catch {}

    setRiders(prev => [newRider, ...prev]);
    triggerToast('Rider Onboarded', `${newRider.name} added to fleet in ${newRider.currentArea}`, 'success');
  };

  const updatePlatformSettings = async (settingsUpdates: Partial<PlatformSettings>) => {
    const updated = { ...platformSettings, ...settingsUpdates };
    setPlatformSettings(updated);
    try {
      await setDoc(doc(db, 'settings', 'main_config'), updated);
    } catch {}
    triggerToast('Settings Saved', 'Platform rates and contact details updated', 'success');
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const catId = 'cat-' + Date.now();
    const newCat: Category = { ...catData, id: catId };
    try {
      await setDoc(doc(db, 'categories', catId), newCat);
    } catch {}
    setCategories(prev => [...prev, newCat]);
    triggerToast('Category Created', `${newCat.name} added`, 'success');
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch {}
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addBannerPromo = async (promoData: Omit<BannerPromo, 'id'>) => {
    const promoId = 'promo-' + Date.now();
    const newPromo: BannerPromo = { ...promoData, id: promoId };
    try {
      await setDoc(doc(db, 'promos', promoId), newPromo);
    } catch {}
    setBannerPromos(prev => [newPromo, ...prev]);
    triggerToast('Banner Added', 'New promotion published', 'success');
  };

  const deleteBannerPromo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promos', id));
    } catch {}
    setBannerPromos(prev => prev.filter(p => p.id !== id));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.currentUser = user;
        localStorage.setItem(LOCAL_STORAGE_KEY + '_auth_session', JSON.stringify(parsed));
      }
    } catch {}
  };

  const setIsAuthenticated = (authVal: boolean) => {
    setIsAuthenticatedState(authVal);
    try {
      if (!authVal) {
        localStorage.removeItem(LOCAL_STORAGE_KEY + '_auth_session');
      } else {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_auth_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.isAuthenticated = true;
          localStorage.setItem(LOCAL_STORAGE_KEY + '_auth_session', JSON.stringify(parsed));
        }
      }
    } catch {}
  };

  // Real Email/Password Auth System
  const loginWithEmailPassword = async (email: string, pass: string, role?: UserRole) => {
    const user = await loginFirebaseUser(email, pass);
    const targetRole = role || user.role;
    let vendorRestId: string | undefined;
    let riderId: string | undefined;

    if (targetRole === 'vendor') {
      const rest = restaurants.find(r => r.vendorId === user.id);
      if (rest) vendorRestId = rest.id;
    } else if (targetRole === 'rider') {
      const rd = riders.find(r => r.userId === user.id);
      if (rd) riderId = rd.id;
    }

    syncAuthSession(true, user, targetRole, vendorRestId, riderId);
    setIsAuthModalOpen(false);
    triggerToast('Welcome Back!', `Logged in successfully as ${user.name || user.email}`, 'success');
  };

  const registerWithEmailPassword = async (data: {
    email: string;
    pass: string;
    name: string;
    phone: string;
    role: UserRole;
    address?: string;
    area?: string;
    shopName?: string;
    shopOwner?: string;
    vehiclePlate?: string;
  }) => {
    const userAddresses: Address[] = data.address ? [{
      id: 'addr-' + Date.now(),
      label: 'Home',
      area: data.area || 'Shahi Bazaar',
      streetAddress: data.address,
      phone: data.phone,
      isDefault: true
    }] : [];

    const { user } = await registerFirebaseUser(data.email, data.pass, {
      name: data.name,
      phone: data.phone,
      role: data.role,
      addresses: userAddresses
    });

    let vendorRestId: string | undefined;
    let riderId: string | undefined;

    // If vendor role, create restaurant record in Firestore
    if (data.role === 'vendor' && data.shopName) {
      vendorRestId = 'rest-' + Date.now();
      const newRest: Restaurant = {
        id: vendorRestId,
        vendorId: user.id,
        name: data.shopName,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        categories: ['Fast Food', 'Biryani'],
        rating: 5.0,
        reviewsCount: 0,
        isOpen: true,
        deliveryTime: '20-30 min',
        minOrder: 150,
        deliveryFee: 50,
        address: `${data.area || 'Shahi Bazaar'}, Matli`,
        area: data.area || 'Shahi Bazaar',
        phone: data.phone,
        whatsappNumber: data.phone,
        description: `Authentic food and takeaway from ${data.shopName}, Matli.`,
        commissionRate: 10,
        openingHours: '11:00 AM - 12:00 AM',
        totalOrdersCount: 0,
        totalRevenue: 0,
        isApproved: true
      };
      await setDoc(doc(db, 'restaurants', vendorRestId), newRest);
    } else if (data.role === 'rider') {
      riderId = 'rider-' + Date.now();
      const newRider: Rider = {
        id: riderId,
        userId: user.id,
        name: data.name,
        phone: data.phone,
        vehicleType: 'bike',
        vehiclePlateNumber: data.vehiclePlate || 'MATLI-BIKE',
        cnicNumber: '41103-XXXXXXX-1',
        isOnline: true,
        isVerified: true,
        currentArea: data.area || 'Shahi Bazaar',
        totalDeliveries: 0,
        rating: 5.0,
        earningsToday: 0,
        earningsWeekly: 0,
        totalEarnings: 0,
        walletBalance: 0
      };
      await setDoc(doc(db, 'riders', riderId), newRider);
    }

    syncAuthSession(true, user, data.role, vendorRestId, riderId);
    setIsAuthModalOpen(false);
    sounds.playOrderSuccess();
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    triggerToast('Account Created Live!', `Welcome to Dastak Delivery, ${data.name}!`, 'success');
  };

  const sendPasswordReset = async (email: string) => {
    await resetFirebasePassword(email);
    triggerToast('Password Reset Email Sent', 'Check your inbox for the password reset link.', 'info');
  };

  const openLoginModal = (role: UserRole = 'customer') => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const loginUser = (emailOrPhone: string, role: UserRole, extra?: { name?: string; restaurantId?: string; riderId?: string }) => {
    let targetUser: User;
    if (role === 'customer') {
      const existingUser = allUsers.find(u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone);
      if (existingUser) {
        targetUser = existingUser;
      } else {
        targetUser = {
          id: 'user-' + Date.now(),
          name: extra?.name || (emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Matli Customer'),
          phone: emailOrPhone.includes('@') ? '0300-1234567' : emailOrPhone,
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/[^0-9]/g, '')}@dastak.pk`,
          role: 'customer',
          addresses: [],
          isBlocked: false,
          createdAt: new Date().toISOString()
        };
      }
    } else {
      targetUser = {
        id: 'usr-' + role + '-' + Date.now(),
        name: extra?.name || (role === 'vendor' ? 'Haji Rashid' : role === 'rider' ? 'Zeeshan Ali' : 'Super Admin'),
        email: emailOrPhone.includes('@') ? emailOrPhone : `${role}@dastak.pk`,
        phone: '0300-1234567',
        role: role,
        addresses: [],
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
    }

    syncAuthSession(true, targetUser, role, extra?.restaurantId, extra?.riderId);
    setIsAuthModalOpen(false);
  };

  const registerCustomerAccount = async (data: { 
    name: string; 
    phone: string; 
    email?: string; 
    password?: string; 
    address?: string; 
    area?: string;
  }): Promise<User> => {
    const cleanPhone = data.phone.trim();
    const userEmail = data.email?.trim() || `${cleanPhone.replace(/[^0-9]/g, '')}@dastak.pk`;
    const userPass = data.password?.trim() || 'dastak123456';

    try {
      await registerWithEmailPassword({
        email: userEmail,
        pass: userPass,
        name: data.name,
        phone: cleanPhone,
        role: 'customer',
        address: data.address,
        area: data.area
      });
      return currentUser;
    } catch {
      // Fallback in-memory
      const fallbackUser: User = {
        id: 'user-' + Date.now(),
        name: data.name,
        phone: cleanPhone,
        email: userEmail,
        role: 'customer',
        addresses: data.address ? [{
          id: 'addr-' + Date.now(),
          label: 'Home',
          area: data.area || 'Shahi Bazaar',
          streetAddress: data.address,
          phone: cleanPhone,
          isDefault: true
        }] : [],
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
      syncAuthSession(true, fallbackUser, 'customer');
      return fallbackUser;
    }
  };

  const registerNewVendor = async (vendorData: {
    name: string;
    nameUrdu?: string;
    ownerName: string;
    phone: string;
    whatsappNumber: string;
    address: string;
    area: string;
    categories: string[];
    email?: string;
    minOrder?: number;
    deliveryFee?: number;
    deliveryTime?: string;
    openingHours?: string;
    image?: string;
    description?: string;
    password?: string;
  }): Promise<{ restaurantId: string; vendorId: string; restaurant: Restaurant }> => {
    const timestamp = Date.now();
    const restaurantId = 'rest-' + timestamp;
    const cleanPhone = vendorData.phone.trim();
    const vendorEmail = vendorData.email?.trim() || `vendor_${cleanPhone.replace(/[^0-9]/g, '')}@dastak.pk`;
    const vendorPass = vendorData.password?.trim() || 'vendor123456';

    try {
      await registerWithEmailPassword({
        email: vendorEmail,
        pass: vendorPass,
        name: vendorData.ownerName,
        phone: cleanPhone,
        role: 'vendor',
        area: vendorData.area,
        shopName: vendorData.name,
        shopOwner: vendorData.ownerName
      });
    } catch {}

    const newRestaurant: Restaurant = {
      id: restaurantId,
      vendorId: 'vnd-' + timestamp,
      name: vendorData.name.trim(),
      nameUrdu: vendorData.nameUrdu?.trim() || vendorData.name.trim(),
      image: vendorData.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      categories: vendorData.categories.length > 0 ? vendorData.categories : ['Fast Food', 'Biryani'],
      rating: 5.0,
      reviewsCount: 1,
      isOpen: true,
      deliveryTime: vendorData.deliveryTime || '20-30 min',
      minOrder: vendorData.minOrder || 150,
      deliveryFee: vendorData.deliveryFee || 50,
      address: vendorData.address || `${vendorData.area}, Matli`,
      area: vendorData.area || 'Shahi Bazaar',
      phone: vendorData.phone,
      whatsappNumber: vendorData.whatsappNumber || vendorData.phone,
      description: vendorData.description || `Specialty food & delicacies from ${vendorData.name}, Matli.`,
      descriptionUrdu: `دستک پر ${vendorData.name} کا اسپیشل مینیو۔ تیز ہوم ڈلیوری۔`,
      commissionRate: 10,
      openingHours: vendorData.openingHours || '11:00 AM - 12:00 AM',
      totalOrdersCount: 0,
      totalRevenue: 0,
      isApproved: true
    };

    await setDoc(doc(db, 'restaurants', restaurantId), newRestaurant);
    setActiveVendorRestaurantId(restaurantId);
    return { restaurantId, vendorId: newRestaurant.vendorId, restaurant: newRestaurant };
  };

  const registerRider = async (riderData: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    cnicNumber?: string;
    vehicleType?: 'bike' | 'loader' | 'bicycle';
    vehiclePlateNumber?: string;
    currentArea?: string;
  }): Promise<Rider> => {
    const cleanPhone = riderData.phone.trim();
    const riderEmail = riderData.email?.trim() || `rider_${cleanPhone.replace(/[^0-9]/g, '')}@dastak.pk`;
    const riderPass = riderData.password?.trim() || 'rider123456';

    try {
      await registerWithEmailPassword({
        email: riderEmail,
        pass: riderPass,
        name: riderData.name,
        phone: cleanPhone,
        role: 'rider',
        area: riderData.currentArea,
        vehiclePlate: riderData.vehiclePlateNumber
      });
    } catch {}

    const riderId = 'rider-' + Date.now();
    const newRider: Rider = {
      id: riderId,
      userId: 'user-rd-' + Date.now(),
      name: riderData.name.trim(),
      phone: cleanPhone,
      vehicleType: riderData.vehicleType || 'bike',
      vehiclePlateNumber: riderData.vehiclePlateNumber || 'MATLI-BIKE',
      cnicNumber: riderData.cnicNumber || '41103-XXXXXXX-1',
      isOnline: true,
      isVerified: true,
      currentArea: riderData.currentArea || 'Shahi Bazaar',
      totalDeliveries: 0,
      rating: 5.0,
      earningsToday: 0,
      earningsWeekly: 0,
      totalEarnings: 0,
      walletBalance: 0
    };

    await setDoc(doc(db, 'riders', riderId), newRider);
    setActiveRiderId(riderId);
    return newRider;
  };

  const logoutUser = async () => {
    try {
      await logoutFirebaseUser();
    } catch {}
    syncAuthSession(false, INITIAL_CUSTOMERS[0], 'customer');
    triggerToast('Logged Out', 'Signed out from Dastak Delivery.', 'info');
  };

  const handleSetAllowRiderViewCustomerInfo = (val: boolean) => {
    setAllowRiderViewCustomerInfo(val);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_rider_privacy', val ? 'true' : 'false');
    } catch {}
    triggerToast('Privacy Setting Updated', val ? 'Riders can view customer contact details' : 'Customer numbers are masked and hidden from riders', 'info');
  };

  // Admin Universal Product Controls
  const adminAddNewProduct = async (itemData: Omit<MenuItem, 'id'>) => {
    const newItemId = 'item-' + Date.now();
    const newItem: MenuItem = {
      ...itemData,
      id: newItemId
    };
    try {
      await setDoc(doc(db, 'menuItems', newItemId), newItem);
    } catch {}
    setMenuItems(prev => [newItem, ...prev]);
    triggerToast('Product Created by Admin', `${newItem.name} added to catalog in Firestore`, 'success');
  };

  const adminUpdateProduct = async (id: string, updates: Partial<MenuItem>) => {
    try {
      await updateDoc(doc(db, 'menuItems', id), updates);
    } catch {}
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerToast('Product Updated by Admin', 'Product rates and details saved across Firestore', 'success');
  };

  const adminDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch {}
    setMenuItems(prev => prev.filter(item => item.id !== id));
    triggerToast('Product Deleted', 'Item removed from restaurant catalog', 'info');
  };

  // Alo Chat Support
  const sendAloChatMessage = async (orderId: string, sender: 'customer' | 'rider' | 'admin', senderName: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: AloChatMessage = {
      id: 'alo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      orderId,
      sender,
      senderName,
      message: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setAloChatMessages(prev => [...prev, newMsg]);
    try {
      await addDoc(collection(db, 'chats'), newMsg);
    } catch {}
    sounds.playMessage();
  };

  const openAloChat = (orderId: string) => {
    setActiveAloChatOrderId(orderId);
    setIsAloChatOpen(true);
  };

  const closeAloChat = () => {
    setIsAloChatOpen(false);
  };

  const resetToDefaultData = () => {
    setAllUsers(INITIAL_CUSTOMERS);
    setCurrentUser(INITIAL_CUSTOMERS[0]);
    setRestaurants(INITIAL_RESTAURANTS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setRiders(INITIAL_RIDERS);
    setCategories(CATEGORIES);
    setBannerPromos(BANNER_PROMOS);
    setPlatformSettings(INITIAL_SETTINGS);
    clearCart();
    triggerToast('Reset Complete', 'App restored to initial state', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        getRestaurantName,
        getRestaurantDesc,
        getItemName,
        getItemDesc,
        getCategoryName,
        getPromoContent,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalRole,
        setAuthModalRole,
        openLoginModal,
        loginWithEmailPassword,
        registerWithEmailPassword,
        sendPasswordReset,
        loginUser,
        registerCustomerAccount,
        registerNewVendor,
        registerRider,
        logoutUser,
        allowRiderViewCustomerInfo,
        setAllowRiderViewCustomerInfo: handleSetAllowRiderViewCustomerInfo,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        allUsers,
        toggleUserBlock,
        activeVendorRestaurantId,
        setActiveVendorRestaurantId,
        activeRiderId,
        setActiveRiderId,
        restaurants,
        menuItems,
        orders,
        riders,
        categories,
        bannerPromos,
        platformSettings,
        updatePlatformSettings,
        selectedRestaurant,
        setSelectedRestaurant,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        cartItemCount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        removePromoCode,
        setSpecialInstructions,
        trackingOrderId,
        setTrackingOrderId,
        placeOrder,
        updateOrderStatus,
        assignRiderToOrder,
        reorderPastOrder,
        addresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        updateRestaurantDetails,
        toggleRestaurantStatus,
        toggleRiderOnline,
        riderClaimDelivery,
        riderCompleteDelivery,
        approveVendor,
        toggleVendorStatus,
        deleteRestaurant,
        clearAllRestaurantsAndVendors,
        adminAddNewProduct,
        adminUpdateProduct,
        adminDeleteProduct,
        onboardRider,
        addCategory,
        deleteCategory,
        addBannerPromo,
        deleteBannerPromo,
        aloChatMessages,
        sendAloChatMessage,
        isAloChatOpen,
        activeAloChatOrderId,
        openAloChat,
        closeAloChat,
        notifications,
        dismissNotification,
        triggerToast,
        appNotifications,
        unreadNotificationCount,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        openNotificationCenter,
        closeNotificationCenter,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeAppNotification,
        clearAllAppNotifications,
        isSoundEnabled,
        setIsSoundEnabled,
        triggerTestRoleNotification,
        resetToDefaultData,
        isApkModalOpen,
        setIsApkModalOpen,
        openApkModal,
        closeApkModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
