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
