export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin';
export type Language = 'en' | 'ur' | 'sd';

export interface Address {
  id: string;
  label: string; // 'Home', 'Shop', 'Work', 'Other'
  area: string; // e.g., 'Shahi Bazaar', 'Station Road', 'Memon Colony'
  streetAddress: string;
  landmark?: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  addresses: Address[];
  isBlocked: boolean;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  vendorId: string;
  name: string;
  nameUrdu?: string;
  nameSindhi?: string;
  image: string;
  logo?: string;
  categories: string[];
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  deliveryTime: string; // e.g. "20-30 min"
  minOrder: number; // in PKR
  deliveryFee: number; // in PKR
  address: string;
  area: string;
  phone: string;
  whatsappNumber: string;
  description: string;
  descriptionUrdu?: string;
  descriptionSindhi?: string;
  commissionRate: number; // e.g. 10%
  openingHours: string; // e.g. "11:00 AM - 12:00 AM"
  totalOrdersCount: number;
  totalRevenue: number;
  isApproved: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  nameUrdu?: string;
  nameSindhi?: string;
  description: string;
  descriptionUrdu?: string;
  descriptionSindhi?: string;
  price: number; // in PKR
  discountedPrice?: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  isCombo?: boolean;
  comboItems?: string[];
  preparationTime?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'preparing' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  riderLocation?: {
    lat: number;
    lng: number;
    area: string;
  };
  cancelReason?: string;
}

export interface Rider {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'loader' | 'bicycle';
  vehiclePlateNumber: string;
  cnicNumber: string;
  isOnline: boolean;
  isVerified: boolean;
  currentArea: string;
  totalDeliveries: number;
  rating: number;
  earningsToday: number;
  earningsWeekly: number;
  totalEarnings: number;
  walletBalance: number;
  activeOrderId?: string;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu?: string;
  nameSindhi?: string;
  iconName: string;
  image: string;
  itemCount?: number;
}

export interface BannerPromo {
  id: string;
  title: string;
  titleUrdu?: string;
  titleSindhi?: string;
  subtitle: string;
  subtitleUrdu?: string;
  subtitleSindhi?: string;
  code: string;
  discountPercent: number;
  image: string;
  bgGradient: string;
  active: boolean;
}

export interface PlatformSettings {
  appName: string;
  city: string;
  province: string;
  currency: string;
  currencySymbol: string;
  commissionPercentage: number;
  baseDeliveryFee: number;
  supportPhone: string;
  supportWhatsApp: string;
  jazzCashAccount: string;
  easyPaisaAccount: string;
  freeDeliveryThreshold?: number;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
}

export interface AloChatMessage {
  id: string;
  orderId: string;
  sender: 'customer' | 'rider' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface AIAgentMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionType?: 'restaurant' | 'track' | 'whatsapp' | 'deal';
  actionTarget?: string;
}

