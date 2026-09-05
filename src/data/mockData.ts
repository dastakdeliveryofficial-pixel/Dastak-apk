import { Category, Restaurant, MenuItem, User, Rider, Order, BannerPromo, PlatformSettings } from '../types';

export const INITIAL_SETTINGS: PlatformSettings = {
  appName: 'Dastak Delivery Matli',
  city: 'Matli',
  province: 'Sindh, Pakistan',
  currency: 'PKR',
  currencySymbol: '₨',
  commissionPercentage: 10,
  baseDeliveryFee: 60,
  supportPhone: '+92 301 2345678',
  supportWhatsApp: '923012345678',
  jazzCashAccount: '0301-2345678 (Dastak Official)',
  easyPaisaAccount: '0312-9876543 (Dastak Payments)',
};

export const MATLI_AREAS = [
  'Shahi Bazaar',
  'Station Road / Railway Chowk',
  'Phuleli Canal Bridge',
  'Hyderabad-Badin Highway',
  'Memon Muhalla',
  'Civil Hospital Road',
  'Tando Ghulam Ali Road',
  'Grain Market (Galla Mandi)',
  'Gulshan-e-Mustafa Colony',
  'Model Town Matli',
  'Police Station Road',
  'Sindh University Campus Road'
];

export const CATEGORIES: Category[] = [
  {
    id: 'biryani',
    name: 'Biryani & Pulao',
    nameUrdu: 'بریانی اور پلاؤ',
    nameSindhi: 'برياني ۽ پلاءُ',
    iconName: 'Flame',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'fastfood',
    name: 'Fast Food & Burgers',
    nameUrdu: 'فاسٹ فوڈ اور برگر',
    nameSindhi: 'فاسٽ فوڊ ۽ برگر',
    iconName: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'bbq',
    name: 'BBQ & Karahi',
    nameUrdu: 'باربی کیو اور کڑاہی',
    nameSindhi: 'باربي ڪيو ۽ ڪڙاهي',
    iconName: 'Utensils',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'desserts',
    name: 'Sweets & Desserts',
    nameUrdu: 'مٹھائی اور حلوہ جات',
    nameSindhi: 'مٺائي ۽ حلوا',
    iconName: 'Cake',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'drinks',
    name: 'Chai, Shakes & Drinks',
    nameUrdu: 'چائے، لسی اور شربت',
    nameSindhi: 'چانهه، لسي ۽ شربت',
    iconName: 'Coffee',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'pizza',
    name: 'Pizza & Fast Food',
    nameUrdu: 'پیزا اور فاسٹ فوڈ',
    nameSindhi: 'پيزا ۽ فاسٽ فوڊ',
    iconName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'deals',
    name: 'Super Combo Deals',
    nameUrdu: 'سپیشل ڈیلز',
    nameSindhi: 'خاص ڪومبو ڊيلز',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'grocery',
    name: 'Grocery & Mart',
    nameUrdu: 'گروسری اور راشن',
    nameSindhi: 'گروسري ۽ راشن',
    iconName: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'pharmacy',
    name: 'Medicines & Health',
    nameUrdu: 'ادویات اور فارمیسی',
    nameSindhi: 'دوائون ۽ صحت',
    iconName: 'HeartPulse',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    itemCount: 0
  }
];

export const BANNER_PROMOS: BannerPromo[] = [
  {
    id: 'promo-1',
    title: 'Matli Special Biryani Festival',
    titleUrdu: 'ماتلی اسپیشل بریانی فیسٹیول',
    titleSindhi: 'مٽلي اسپيشل برياني فيسٽيول',
    subtitle: 'Flat 20% OFF on all Biryani orders with code MATLI20',
    subtitleUrdu: 'کوڈ MATLI20 پر تمام بریانی آرڈرز پر 20 فیصد رعایت',
    subtitleSindhi: 'سڀني برياني آرڊرز تي ڪوڊ MATLI20 سان 20 سيڪڙو رعايت',
    code: 'MATLI20',
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    bgGradient: 'from-pink-600 to-rose-500',
    active: true
  },
  {
    id: 'promo-2',
    title: 'Late Night Karahi & BBQ',
    titleUrdu: 'لیٹ نائٹ کڑاہی اور باربی کیو',
    titleSindhi: 'رات جو دير تائين ڪڙاهي ۽ باربي ڪيو',
    subtitle: 'Free Delivery across Matli town',
    subtitleUrdu: 'ماتلی میں شنواری اور باربی کیو پر مفت ڈیلیوری',
    subtitleSindhi: 'مٽلي شهر ۾ شنواري ۽ بي بي ڪيو مان مفت ڊليوري',
    code: 'FREESHIP',
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
    bgGradient: 'from-pink-700 to-amber-600',
    active: true
  }
];

import { DASTAK_RESTAURANTS, DASTAK_MENU_ITEMS } from './dastakCatalog';

export const INITIAL_RESTAURANTS: Restaurant[] = DASTAK_RESTAURANTS;

export const INITIAL_MENU_ITEMS: MenuItem[] = DASTAK_MENU_ITEMS;

export const INITIAL_RIDERS: Rider[] = [];

export const INITIAL_CUSTOMERS: User[] = [];

export const INITIAL_ORDERS: Order[] = [];
