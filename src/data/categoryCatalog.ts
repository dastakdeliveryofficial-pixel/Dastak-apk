export interface DisplayCategory {
  id: string;
  name: string;
  nameUrdu: string;
  nameSindhi: string;
  bgClass: string;
  hoverClass: string;
  borderClass: string;
  textColor: string;
  iconEmoji: string;
  subtext: string;
  isService?: boolean;
  basePrice?: number;
}

export const TWELVE_DISPLAY_CATEGORIES: DisplayCategory[] = [
  {
    id: 'food',
    name: 'Food & Fast Food',
    nameUrdu: 'کھانا اور فاسٹ فوڈ',
    nameSindhi: 'کاڌو ۽ فاسٽ فوڊ',
    bgClass: 'bg-[#FDF2F4]',
    hoverClass: 'hover:bg-[#FDE2E8]',
    borderClass: 'border-rose-100',
    textColor: 'text-rose-900',
    iconEmoji: '🍔',
    subtext: 'Burgers, Biryani, Pizza & Karahi'
  },
  {
    id: 'grocery',
    name: 'Grocery',
    nameUrdu: 'گروسری اور راشن',
    nameSindhi: 'گروسري ۽ راشن',
    bgClass: 'bg-[#FEF9E7]',
    hoverClass: 'hover:bg-[#FDF2CC]',
    borderClass: 'border-amber-100',
    textColor: 'text-amber-900',
    iconEmoji: '🧺',
    subtext: 'Daily staples, flour, oil & spices'
  },
  {
    id: 'fruits_veg',
    name: 'Fruits & Vegetables',
    nameUrdu: 'تازہ پھل اور سبزیاں',
    nameSindhi: 'تاز ميوو ۽ ڀاڄيون',
    bgClass: 'bg-[#EBF7EE]',
    hoverClass: 'hover:bg-[#DBF2DF]',
    borderClass: 'border-emerald-100',
    textColor: 'text-emerald-900',
    iconEmoji: '🥦',
    subtext: 'Fresh market produce daily'
  },
  {
    id: 'meat',
    name: 'Meat',
    nameUrdu: 'گوشت (چکن، مٹن، بیف)',
    nameSindhi: 'تازو گوشت (ڪڪڙ، مٽن، ٻاڪرو)',
    bgClass: 'bg-[#FDECEF]',
    hoverClass: 'hover:bg-[#FCDCE2]',
    borderClass: 'border-pink-100',
    textColor: 'text-pink-900',
    iconEmoji: '🥩',
    subtext: 'Hygienic fresh halal cuts'
  },
  {
    id: 'dairy',
    name: 'Dairy',
    nameUrdu: 'دودھ، دہی اور مکھن',
    nameSindhi: 'کير، ڏهي ۽ مکڻ',
    bgClass: 'bg-[#E9F5FD]',
    hoverClass: 'hover:bg-[#D5EEFC]',
    borderClass: 'border-sky-100',
    textColor: 'text-sky-900',
    iconEmoji: '🥛',
    subtext: 'Fresh buffalo milk, dahi & eggs'
  },
  {
    id: 'medicines',
    name: 'Medicines',
    nameUrdu: 'ادویات اور فارمیسی',
    nameSindhi: 'دوائون ۽ فارميسي',
    bgClass: 'bg-[#EFF2FC]',
    hoverClass: 'hover:bg-[#DFE5FA]',
    borderClass: 'border-indigo-100',
    textColor: 'text-indigo-900',
    iconEmoji: '💊',
    subtext: 'Panadol, syrups, prescriptions'
  },
  {
    id: 'parcels',
    name: 'Parcels',
    nameUrdu: 'پارسل اور کوریئر',
    nameSindhi: 'پارسل ۽ ڪوريئر سروس',
    bgClass: 'bg-[#FCF0E8]',
    hoverClass: 'hover:bg-[#FADFCF]',
    borderClass: 'border-orange-100',
    textColor: 'text-orange-900',
    iconEmoji: '📦',
    subtext: 'Send or receive packages across Matli',
    isService: true,
    basePrice: 60
  },
  {
    id: 'hp_jp',
    name: 'HP / JP Products',
    nameUrdu: 'موبائل و کمپیوٹر اسیسریز',
    nameSindhi: 'موبائل ۽ اليڪٽرانڪس',
    bgClass: 'bg-[#E8F6FD]',
    hoverClass: 'hover:bg-[#D1EFFC]',
    borderClass: 'border-cyan-100',
    textColor: 'text-cyan-900',
    iconEmoji: '💻',
    subtext: 'Chargers, earbuds, tech accessories'
  },
  {
    id: 'pick_drop',
    name: 'Pick & Drop',
    nameUrdu: 'پک اینڈ ڈراپ سروس',
    nameSindhi: 'پڪ اينڊ ڊراپ سروس',
    bgClass: 'bg-[#FDEEF4]',
    hoverClass: 'hover:bg-[#FCDCE8]',
    borderClass: 'border-pink-100',
    textColor: 'text-pink-900',
    iconEmoji: '🛵',
    subtext: 'Errands, documents & personal transport',
    isService: true,
    basePrice: 60
  },
  {
    id: 'printing',
    name: 'Printed & Copy Documents',
    nameUrdu: 'فوٹو کاپی اور پرنٹنگ',
    nameSindhi: 'فوٽو ڪاپي ۽ پرنٽنگ',
    bgClass: 'bg-[#F0EEFB]',
    hoverClass: 'hover:bg-[#E2DEFA]',
    borderClass: 'border-purple-100',
    textColor: 'text-purple-900',
    iconEmoji: '🖨️',
    subtext: 'Send PDF on WhatsApp, delivered in 20 min',
    isService: true,
    basePrice: 50
  },
  {
    id: 'petrol',
    name: 'Petrol',
    nameUrdu: 'ایمرجنسی پیٹرول سروس',
    nameSindhi: 'ايمرجنسي پيٽرول سروس',
    bgClass: 'bg-[#FEF9E7]',
    hoverClass: 'hover:bg-[#FDF2CC]',
    borderClass: 'border-amber-100',
    textColor: 'text-amber-900',
    iconEmoji: '⛽',
    subtext: 'Emergency fuel delivered to your bike/car',
    isService: true,
    basePrice: 60
  },
  {
    id: 'medical_services',
    name: 'Medical Services',
    nameUrdu: 'ڈاکٹر ٹوکن اور ہوم کیئر',
    nameSindhi: 'ڊاڪٽر ٽوڪن ۽ طبي سهولتون',
    bgClass: 'bg-[#EAF7F7]',
    hoverClass: 'hover:bg-[#D2EFEF]',
    borderClass: 'border-teal-100',
    textColor: 'text-teal-900',
    iconEmoji: '🩺',
    subtext: 'Clinic token reservation & urgent home help',
    isService: true,
    basePrice: 100
  }
];

export interface ItemCategoryOption {
  id: string;
  label: string;
  group: string;
  emoji: string;
  urdu: string;
}

export const ITEM_CATEGORY_OPTIONS: ItemCategoryOption[] = [
  // Food & Dining
  { id: 'biryani', label: 'Biryani & Pulao', group: 'Food & Dining', emoji: '🍲', urdu: 'بریانی اور پلاؤ' },
  { id: 'fastfood', label: 'Fast Food & Burgers', group: 'Food & Dining', emoji: '🍔', urdu: 'فاسٹ فوڈ اور برگر' },
  { id: 'pizza', label: 'Pizza & Fast Food', group: 'Food & Dining', emoji: '🍕', urdu: 'پیزا اور فاسٹ فوڈ' },
  { id: 'bbq', label: 'BBQ & Karahi', group: 'Food & Dining', emoji: '🍢', urdu: 'باربی کیو اور کڑاہی' },
  { id: 'drinks', label: 'Chai, Shakes & Drinks', group: 'Food & Dining', emoji: '☕', urdu: 'چائے، لسی اور مشروبات' },
  { id: 'desserts', label: 'Sweets & Desserts', group: 'Food & Dining', emoji: '🍰', urdu: 'مٹھائی اور حلوہ جات' },
  { id: 'deals', label: 'Super Combo Deals', group: 'Food & Dining', emoji: '🏷️', urdu: 'سپیشل کمبو ڈیلز' },

  // Daily Essentials & Retail
  { id: 'grocery', label: 'Grocery & Ration', group: 'Daily Essentials & Retail', emoji: '🧺', urdu: 'گروسری اور راشن' },
  { id: 'pharmacy', label: 'Medicines & Health', group: 'Daily Essentials & Retail', emoji: '💊', urdu: 'ادویات اور فارمیسی' },
  { id: 'fruits_veg', label: 'Fruits & Vegetables', group: 'Daily Essentials & Retail', emoji: '🥦', urdu: 'تازہ پھل اور سبزیاں' },
  { id: 'meat', label: 'Fresh Halal Meat', group: 'Daily Essentials & Retail', emoji: '🥩', urdu: 'تازہ گوشت (چکن، مٹن، بیف)' },
  { id: 'dairy', label: 'Milk, Dahi & Dairy', group: 'Daily Essentials & Retail', emoji: '🥛', urdu: 'دودھ، دہی اور مکھن' },
  { id: 'hp_jp', label: 'HP / JP Mobile & Tech', group: 'Daily Essentials & Retail', emoji: '💻', urdu: 'موبائل و کمپیوٹر اسیسریز' },

  // Express Delivery Services
  { id: 'parcels', label: 'Parcels & Courier', group: 'Delivery Services', emoji: '📦', urdu: 'پارسل اور کوریئر' },
  { id: 'pick_drop', label: 'Pick & Drop Service', group: 'Delivery Services', emoji: '🛵', urdu: 'پک اینڈ ڈراپ' },
  { id: 'printing', label: 'Printing & Copies', group: 'Delivery Services', emoji: '🖨️', urdu: 'فوٹو کاپی اور پرنٹنگ' },
  { id: 'petrol', label: 'Emergency Petrol', group: 'Delivery Services', emoji: '⛽', urdu: 'ایمرجنسی پیٹرول' },
  { id: 'medical_services', label: 'Medical & Clinic Tokens', group: 'Delivery Services', emoji: '🩺', urdu: 'طبی سہولیات' }
];

export function getCategoryLabel(categoryId: string): string {
  const found = ITEM_CATEGORY_OPTIONS.find(c => c.id.toLowerCase() === categoryId?.toLowerCase());
  if (found) return `${found.emoji} ${found.label}`;
  const displayCat = TWELVE_DISPLAY_CATEGORIES.find(c => c.id.toLowerCase() === categoryId?.toLowerCase());
  if (displayCat) return `${displayCat.iconEmoji} ${displayCat.name}`;
  return categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : 'General';
}
