import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, UserRole, Restaurant, MenuItem, Order, Rider, 
  Category, BannerPromo, PlatformSettings, Address, OrderItem, OrderStatus, Language, AloChatMessage 
} from '../types';
import { 
  INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS, INITIAL_ORDERS, 
  INITIAL_RIDERS, INITIAL_CUSTOMERS, CATEGORIES, 
  BANNER_PROMOS, INITIAL_SETTINGS 
} from '../data/mockData';
import { sounds } from '../utils/audio';
import { TRANSLATIONS, Translations, getLocalizedName, getLocalizedDescription, getLocalizedPromo } from '../utils/translations';

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
  loginUser: (emailOrPhone: string, role: UserRole, extra?: { name?: string; restaurantId?: string; riderId?: string }) => void;
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
  addToCart: (restaurant: Restaurant, item: MenuItem, quantity?: number) => void;
  updateCartQuantity: (menuItemId: string, delta: number) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  setSpecialInstructions: (instructions: string) => void;
  
  // Orders & Flow
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  placeOrder: (deliveryAddress: Address, paymentMethod: 'cod' | 'jazzcash' | 'easypaisa') => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, riderId?: string, cancelReason?: string) => void;
  assignRiderToOrder: (orderId: string, riderId: string) => void;
  reorderPastOrder: (orderId: string) => boolean;
  simulateAdvanceOrderStatus: (orderId: string) => void;
  
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
  riderClaimDelivery: (orderId: string, riderId: string) => void;
  riderCompleteDelivery: (orderId: string) => void;
  
  // Admin Operations (Universal Menu, All Restaurants, Approval)
  approveVendor: (restaurantId: string) => void;
  toggleVendorStatus: (restaurantId: string) => void;
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
  
  // Reset demo data
  resetToDefaultData: () => void;
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

  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY + '_auth') === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');

  // Rider & Customer privacy toggle (default: false = phone numbers hidden unless admin approves)
  const [allowRiderViewCustomerInfo, setAllowRiderViewCustomerInfo] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY + '_rider_privacy') === 'true';
  });

  const [activeVendorRestaurantId, setActiveVendorRestaurantId] = useState<string>('rest-1');
  const [activeRiderId, setActiveRiderId] = useState<string>('rider-1');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>('ord-1001');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Alo Chat State
  const [aloChatMessages, setAloChatMessages] = useState<AloChatMessage[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_alochat');
    return saved ? JSON.parse(saved) : [
      {
        id: 'msg-1',
        orderId: 'ord-1001',
        sender: 'rider',
        senderName: 'Tariq Mehmood (Rider)',
        message: 'Assalam o Alaikum! I have picked up your order from Al-Madina Biryani and heading towards Shahi Bazaar.',
        timestamp: '1:42 PM',
        isRead: true
      },
      {
        id: 'msg-2',
        orderId: 'ord-1001',
        sender: 'customer',
        senderName: 'Muhammad Hamza',
        message: 'Walaikum Assalam! Bhai please ring the bell once you arrive at House #14.',
        timestamp: '1:44 PM',
        isRead: true
      }
    ];
  });
  const [isAloChatOpen, setIsAloChatOpen] = useState<boolean>(false);
  const [activeAloChatOrderId, setActiveAloChatOrderId] = useState<string | null>(null);


  // Core Persistent State
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_users');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(allUsers[0] || INITIAL_CUSTOMERS[0]);

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_restaurants');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [riders, setRiders] = useState<Rider[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_riders');
    return saved ? JSON.parse(saved) : INITIAL_RIDERS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  const [bannerPromos, setBannerPromos] = useState<BannerPromo[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_promos');
    return saved ? JSON.parse(saved) : BANNER_PROMOS;
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

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

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_users', JSON.stringify(allUsers));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_restaurants', JSON.stringify(restaurants));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_menu', JSON.stringify(menuItems));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_orders', JSON.stringify(orders));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_riders', JSON.stringify(riders));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_categories', JSON.stringify(categories));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_promos', JSON.stringify(bannerPromos));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_settings', JSON.stringify(platformSettings));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_cart', JSON.stringify(cart));
    } catch {
      // Storage error safeguard
    }
  }, [allUsers, restaurants, menuItems, orders, riders, categories, bannerPromos, platformSettings, cart]);

  const lastToastRef = useRef<{ title: string; message: string; time: number }>({ title: '', message: '', time: 0 });

  const triggerToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const now = Date.now();
    // Prevent duplicate toast spam within 1.2 seconds
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

    // Keep only 1 non-intrusive toast on screen at a time
    setNotifications([newToast]);

    // Auto dismiss quickly (2.2 seconds)
    setTimeout(() => {
      setNotifications(prev => prev.filter(t => t.id === id));
    }, 2200);
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

  const addToCart = (restaurant: Restaurant, item: MenuItem, quantity: number = 1) => {
    sounds.playClick();
    setCart(prev => {
      // If adding from different restaurant, confirm or replace
      if (prev.restaurantId && prev.restaurantId !== restaurant.id && prev.items.length > 0) {
        triggerToast('Cart Replaced', `Switched cart items to ${restaurant.name}`, 'warning');
        return {
          restaurantId: restaurant.id,
          items: [{
            id: 'ci-' + Date.now(),
            menuItemId: item.id,
            name: item.name,
            price: item.discountedPrice || item.price,
            quantity: quantity,
            image: item.image
          }],
          specialInstructions: '',
          promoCode: '',
          discount: 0
        };
      }

      const existingIndex = prev.items.findIndex(i => i.menuItemId === item.id);
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
            name: item.name,
            price: item.discountedPrice || item.price,
            quantity: quantity,
            image: item.image
          }
        ];
      }

      triggerToast('Added to Cart', `${item.name} added (₨ ${item.discountedPrice || item.price})`, 'success');

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

  const addAddress = (newAddr: Omit<Address, 'id'>) => {
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
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    triggerToast('Address Saved', `Added ${newAddr.label} in ${newAddr.area}`, 'success');
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    const updatedUser = { ...currentUser, addresses: updated };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const setDefaultAddress = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    const updatedUser = { ...currentUser, addresses: updated };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // Place Order
  const placeOrder = (deliveryAddress: Address, paymentMethod: 'cod' | 'jazzcash' | 'easypaisa'): Order => {
    const restaurant = restaurants.find(r => r.id === cart.restaurantId) || restaurants[0];
    const orderNum = 'DST-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ord-' + Date.now();

    const newOrder: Order = {
      id: orderId,
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

    setOrders(prev => [newOrder, ...prev]);

    // Update restaurant order count & revenue
    setRestaurants(prev => prev.map(r => r.id === restaurant.id ? {
      ...r,
      totalOrdersCount: r.totalOrdersCount + 1,
      totalRevenue: r.totalRevenue + cartTotal
    } : r));

    // Clear cart
    clearCart();
    setTrackingOrderId(orderId);

    // Audio & Confetti
    sounds.playOrderSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe
    }

    triggerToast('Order Placed Successfully!', `Order #${orderNum} sent to ${restaurant.name}`, 'success');
    return newOrder;
  };

  // Order Status Updates
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, riderId?: string, cancelReason?: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      let assignedRiderName = ord.riderName;
      let assignedRiderPhone = ord.riderPhone;

      if (riderId) {
        const foundRider = riders.find(r => r.id === riderId);
        if (foundRider) {
          assignedRiderName = foundRider.name;
          assignedRiderPhone = foundRider.phone;
        }
      }

      return {
        ...ord,
        status: newStatus,
        riderId: riderId || ord.riderId,
        riderName: assignedRiderName,
        riderPhone: assignedRiderPhone,
        cancelReason: cancelReason || ord.cancelReason,
        updatedAt: new Date().toISOString(),
        paymentStatus: (newStatus === 'delivered' && ord.paymentMethod === 'cod') ? 'paid' : ord.paymentStatus
      };
    }));

    // Alert sound
    if (newStatus === 'confirmed' || newStatus === 'out_for_delivery') {
      sounds.playIncomingAlert();
    }

    triggerToast('Order Status Updated', `Order status changed to ${newStatus.toUpperCase()}`, 'info');
  };

  const assignRiderToOrder = (orderId: string, riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setOrders(prev => prev.map(ord => ord.id === orderId ? {
      ...ord,
      riderId: rider.id,
      riderName: rider.name,
      riderPhone: rider.phone,
      status: ord.status === 'placed' ? 'confirmed' : ord.status,
      updatedAt: new Date().toISOString()
    } : ord));

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

  const simulateAdvanceOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const sequence: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = sequence.indexOf(order.status);
    
    if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
      triggerToast('Order Complete', 'This order is already delivered.', 'info');
      return;
    }

    const nextStatus = sequence[currentIndex + 1];
    const availableRider = riders.find(r => r.isOnline) || riders[0];

    updateOrderStatus(orderId, nextStatus, (nextStatus === 'out_for_delivery' || nextStatus === 'preparing') ? availableRider.id : undefined);

    if (nextStatus === 'delivered') {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // Safe
      }
      sounds.playOrderSuccess();
    }
  };

  // Vendor Menu Management
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: 'item-' + Date.now()
    };
    setMenuItems(prev => [newItem, ...prev]);
    triggerToast('Menu Item Added', `${newItem.name} added to menu`, 'success');
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerToast('Menu Updated', 'Item details saved successfully', 'success');
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    triggerToast('Item Removed', 'Menu item deleted', 'info');
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isAvailable;
        triggerToast('Item Updated', `${item.name} is now ${nextState ? 'Available' : 'Sold Out'}`, 'info');
        return { ...item, isAvailable: nextState };
      }
      return item;
    }));
  };

  const updateRestaurantDetails = (id: string, updates: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(rest => rest.id === id ? { ...rest, ...updates } : rest));
  };

  const toggleRestaurantStatus = (id: string) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id === id) {
        const nextState = !rest.isOpen;
        triggerToast(rest.name, `Store is now ${nextState ? 'OPEN for Orders' : 'CLOSED'}`, nextState ? 'success' : 'warning');
        return { ...rest, isOpen: nextState };
      }
      return rest;
    }));
  };

  // Rider Actions
  const toggleRiderOnline = (riderId: string) => {
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        const nextStatus = !r.isOnline;
        triggerToast(r.name, `You are now ${nextStatus ? 'ONLINE (Ready for deliveries)' : 'OFFLINE'}`, nextStatus ? 'success' : 'info');
        return { ...r, isOnline: nextStatus };
      }
      return r;
    }));
  };

  const riderClaimDelivery = (orderId: string, riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setOrders(prev => prev.map(ord => ord.id === orderId ? {
      ...ord,
      riderId: rider.id,
      riderName: rider.name,
      riderPhone: rider.phone,
      status: 'out_for_delivery',
      updatedAt: new Date().toISOString()
    } : ord));

    sounds.playIncomingAlert();
    triggerToast('Delivery Accepted', `You accepted delivery for Order #${orderId.slice(-4)}`, 'success');
  };

  const riderCompleteDelivery = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const deliveryEarnings = order.deliveryFee || 60;

    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'delivered',
      paymentStatus: 'paid',
      updatedAt: new Date().toISOString()
    } : o));

    if (order.riderId) {
      setRiders(prev => prev.map(r => r.id === order.riderId ? {
        ...r,
        totalDeliveries: r.totalDeliveries + 1,
        earningsToday: r.earningsToday + deliveryEarnings,
        earningsWeekly: r.earningsWeekly + deliveryEarnings,
        totalEarnings: r.totalEarnings + deliveryEarnings,
        walletBalance: r.walletBalance + deliveryEarnings
      } : r));
    }

    sounds.playOrderSuccess();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Safe
    }
    triggerToast('Delivery Completed! 🛵', `Earned ₨ ${deliveryEarnings} for this delivery!`, 'success');
  };

  // Admin Actions
  const approveVendor = (restaurantId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isApproved: true } : r));
    triggerToast('Vendor Approved', 'Vendor account activated successfully', 'success');
  };

  const toggleVendorStatus = (restaurantId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isApproved: !r.isApproved } : r));
  };

  const onboardRider = (riderData: Omit<Rider, 'id' | 'totalDeliveries' | 'rating' | 'earningsToday' | 'earningsWeekly' | 'totalEarnings' | 'walletBalance'>) => {
    const newRider: Rider = {
      ...riderData,
      id: 'rider-' + Date.now(),
      totalDeliveries: 0,
      rating: 5.0,
      earningsToday: 0,
      earningsWeekly: 0,
      totalEarnings: 0,
      walletBalance: 0
    };
    setRiders(prev => [newRider, ...prev]);
    triggerToast('Rider Onboarded', `${newRider.name} is now registered`, 'success');
  };

  const toggleUserBlock = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isBlocked;
        triggerToast('User Status Updated', `${u.name} is now ${nextState ? 'BLOCKED' : 'ACTIVE'}`, nextState ? 'error' : 'success');
        return { ...u, isBlocked: nextState };
      }
      return u;
    }));
  };

  const updatePlatformSettings = (settingsUpdate: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => ({ ...prev, ...settingsUpdate }));
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now()
    };
    setCategories(prev => [...prev, newCat]);
    triggerToast('Category Created', `${newCat.name} added`, 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addBannerPromo = (promoData: Omit<BannerPromo, 'id'>) => {
    const newPromo: BannerPromo = {
      ...promoData,
      id: 'promo-' + Date.now()
    };
    setBannerPromos(prev => [newPromo, ...prev]);
    triggerToast('Banner Added', 'New promotion published', 'success');
  };

  const deleteBannerPromo = (id: string) => {
    setBannerPromos(prev => prev.filter(p => p.id !== id));
  };

  // Auth Functions
  const openLoginModal = (role: UserRole = 'customer') => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const loginUser = (emailOrPhone: string, role: UserRole, extra?: { name?: string; restaurantId?: string; riderId?: string }) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_auth', 'true');
      localStorage.setItem(LOCAL_STORAGE_KEY + '_role', role);
    } catch {}

    if (role === 'customer') {
      const existingUser = allUsers.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
        const newUser: User = {
          id: 'user-' + Date.now(),
          name: extra?.name || (emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Matli Customer'),
          phone: emailOrPhone.includes('@') ? '0300-1234567' : emailOrPhone,
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/[^0-9]/g, '')}@dastak.pk`,
          role: 'customer',
          addresses: [],
          isBlocked: false,
          createdAt: new Date().toISOString()
        };
        setAllUsers(prev => [newUser, ...prev]);
        setCurrentUser(newUser);
      }
      triggerToast('Logged In', `Welcome ${extra?.name || emailOrPhone}!`, 'success');
    } else if (role === 'vendor') {
      if (extra?.restaurantId) {
        setActiveVendorRestaurantId(extra.restaurantId);
      }
      const vendorRest = restaurants.find(r => r.id === (extra?.restaurantId || activeVendorRestaurantId));
      triggerToast('Vendor Portal', `Logged in as ${vendorRest?.name || 'Restaurant Partner'}`, 'success');
    } else if (role === 'rider') {
      if (extra?.riderId) {
        setActiveRiderId(extra.riderId);
      }
      const activeRd = riders.find(r => r.id === (extra?.riderId || activeRiderId));
      triggerToast('Rider Fleet', `Welcome rider ${activeRd?.name || 'Partner'}!`, 'success');
    } else if (role === 'admin') {
      triggerToast('Admin Console', 'Super Admin access granted with full restaurant controls', 'success');
    }
    setIsAuthModalOpen(false);
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentRole('customer');
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_auth');
    } catch {}
    triggerToast('Logged Out', 'Signed out successfully. Guest mode active.', 'info');
  };

  const handleSetAllowRiderViewCustomerInfo = (val: boolean) => {
    setAllowRiderViewCustomerInfo(val);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_rider_privacy', val ? 'true' : 'false');
    } catch {}
    triggerToast('Privacy Setting Updated', val ? 'Riders can view customer contact details' : 'Customer numbers are masked and hidden from riders', 'info');
  };

  // Admin Universal Product Controls
  const adminAddNewProduct = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: 'item-' + Date.now()
    };
    setMenuItems(prev => [newItem, ...prev]);
    const targetRest = restaurants.find(r => r.id === newItem.restaurantId);
    triggerToast('Product Created by Admin', `${newItem.name} added to ${targetRest?.name || 'Restaurant'}`, 'success');
  };

  const adminUpdateProduct = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerToast('Product Updated by Admin', 'Product rates and details saved across platform', 'success');
  };

  const adminDeleteProduct = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    triggerToast('Product Deleted', 'Item removed from restaurant catalog', 'info');
  };

  // Alo Chat Support
  const sendAloChatMessage = (orderId: string, sender: 'customer' | 'rider' | 'admin', senderName: string, text: string) => {
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
    setAloChatMessages(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_alochat', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
    localStorage.clear();
    triggerToast('Reset Complete', 'App restored to initial Matli sample data', 'info');
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
        loginUser,
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
        simulateAdvanceOrderStatus,
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
        resetToDefaultData
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
