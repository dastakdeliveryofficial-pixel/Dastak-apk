import { Language } from '../types';

export interface Translations {
  // Brand & General
  appName: string;
  tagline: string;
  locationMatli: string;
  selectLanguage: string;
  english: string;
  urdu: string;
  sindhi: string;

  // Roles
  customer: string;
  vendor: string;
  rider: string;
  admin: string;
  switchRole: string;

  // Navigation & Actions
  home: string;
  cart: string;
  orders: string;
  addresses: string;
  trackOrder: string;
  searchPlaceholder: string;
  viewMenu: string;
  orderNow: string;
  addToCart: string;
  add: string;
  viewCart: string;
  checkout: string;
  back: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  reorder: string;
  whatsappOrder: string;
  contactSupport: string;

  // Customer Sections
  categories: string;
  allCategories: string;
  popularDishes: string;
  featuredRestaurants: string;
  allRestaurants: string;
  openNow: string;
  closed: string;
  minOrder: string;
  deliveryTime: string;
  deliveryFee: string;
  freeDelivery: string;
  reviews: string;
  rating: string;
  deals: string;
  comboOffer: string;

  // Cart & Checkout
  yourCart: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  browseRestaurants: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  applyPromo: string;
  promoPlaceholder: string;
  applied: string;
  discount: string;
  subtotal: string;
  totalBill: string;
  selectDeliveryAddress: string;
  addNewAddress: string;
  paymentMethod: string;
  cod: string;
  jazzcash: string;
  easypaisa: string;
  confirmOrder: string;
  orderPlacedSuccess: string;

  // Order Tracking
  liveOrderTracker: string;
  orderNumber: string;
  estimatedDelivery: string;
  statusPlaced: string;
  statusPlacedDesc: string;
  statusConfirmed: string;
  statusConfirmedDesc: string;
  statusPreparing: string;
  statusPreparingDesc: string;
  statusOutForDelivery: string;
  statusOutForDeliveryDesc: string;
  statusDelivered: string;
  statusDeliveredDesc: string;
  statusCancelled: string;
  assignedRider: string;
  callRider: string;
  callRestaurant: string;
  deliveryAddress: string;
  orderSummary: string;
  liveMapRoute: string;

  // Address Modal
  savedAddresses: string;
  addressType: string;
  homeLabel: string;
  shopLabel: string;
  workLabel: string;
  otherLabel: string;
  selectArea: string;
  streetDetails: string;
  streetPlaceholder: string;
  landmark: string;
  landmarkPlaceholder: string;
  contactPhone: string;
  saveAddress: string;
  defaultBadge: string;
  setDefault: string;

  // Order History
  orderHistory: string;
  pastOrders: string;
  noPastOrders: string;
  noPastOrdersDesc: string;
  paid: string;
  cashOnDelivery: string;

  // Vendor Dashboard
  vendorDashboard: string;
  storeStatus: string;
  openForOrders: string;
  closedForOrders: string;
  todayRevenue: string;
  todayOrders: string;
  pendingOrders: string;
  menuManagement: string;
  addNewDish: string;
  dishName: string;
  dishPrice: string;
  dishCategory: string;
  dishDescription: string;
  available: string;
  soldOut: string;
  acceptOrder: string;
  markPreparing: string;
  readyForPickup: string;
  rejectOrder: string;

  // Rider Dashboard
  riderDashboard: string;
  riderOnline: string;
  riderOffline: string;
  availableDeliveries: string;
  activeDelivery: string;
  completedToday: string;
  earningsToday: string;
  walletBalance: string;
  claimDelivery: string;
  pickedUpOrder: string;
  deliveredSuccess: string;
  navigateCustomer: string;
  navigateRestaurant: string;

  // Admin Dashboard
  adminDashboard: string;
  totalPlatformRevenue: string;
  totalPlatformOrders: string;
  activeRestaurants: string;
  activeRidersCount: string;
  registeredUsers: string;
  commissionEarned: string;
  restaurantApprovals: string;
  riderManagement: string;
  settings: string;
  platformCommission: string;
  resetDemoData: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'Dastak Delivery',
    tagline: 'Fastest Food Delivery in Matli',
    locationMatli: 'Matli, Sindh',
    selectLanguage: 'Language',
    english: 'English',
    urdu: 'اردو (Urdu)',
    sindhi: 'سنڌي (Sindhi)',

    customer: 'Customer',
    vendor: 'Hotel / Vendor',
    rider: 'Rider',
    admin: 'Admin',
    switchRole: 'Switch Dashboard',

    home: 'Home',
    cart: 'Cart',
    orders: 'Orders',
    addresses: 'Addresses',
    trackOrder: 'Track Order',
    searchPlaceholder: 'Search biryani, pizza, karahi, chai in Matli...',
    viewMenu: 'View Menu',
    orderNow: 'Order Now',
    addToCart: 'Add to Cart',
    add: 'Add',
    viewCart: 'View Cart',
    checkout: 'Checkout & Place Order',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    reorder: 'Reorder',
    whatsappOrder: 'WhatsApp Hotel',
    contactSupport: 'Contact Dastak Support',

    categories: 'Food Categories',
    allCategories: 'All Categories',
    popularDishes: 'Popular Dishes in Matli',
    featuredRestaurants: 'Popular Restaurants in Matli',
    allRestaurants: 'All Restaurants & Dhabas',
    openNow: 'Open for Delivery',
    closed: 'Closed',
    minOrder: 'Min Order',
    deliveryTime: 'Delivery Time',
    deliveryFee: 'Delivery Fee',
    freeDelivery: 'Free Delivery',
    reviews: 'reviews',
    rating: 'Rating',
    deals: 'Deals',
    comboOffer: 'Combo Offer',

    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Add delicious food from Matli restaurants to proceed.',
    browseRestaurants: 'Explore Restaurants',
    specialInstructions: 'Special Kitchen Notes (Optional)',
    specialInstructionsPlaceholder: 'e.g. Less spicy, extra salad, send raita...',
    applyPromo: 'Apply Coupon',
    promoPlaceholder: 'Enter promo code (e.g. MATLI20)',
    applied: 'Applied',
    discount: 'Discount',
    subtotal: 'Subtotal',
    totalBill: 'Total Bill',
    selectDeliveryAddress: 'Select Delivery Address',
    addNewAddress: 'Add New Address',
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery (COD)',
    jazzcash: 'JazzCash Instant Transfer',
    easypaisa: 'EasyPaisa Instant Transfer',
    confirmOrder: 'Confirm & Place Order',
    orderPlacedSuccess: 'Order placed successfully!',

    liveOrderTracker: 'Live Order Tracker',
    orderNumber: 'Order #',
    estimatedDelivery: 'Estimated Delivery',
    statusPlaced: 'Order Placed',
    statusPlacedDesc: 'Waiting for restaurant confirmation',
    statusConfirmed: 'Order Confirmed',
    statusConfirmedDesc: 'Kitchen accepted your order',
    statusPreparing: 'Food Preparing',
    statusPreparingDesc: 'Chefs are cooking fresh food',
    statusOutForDelivery: 'Out for Delivery',
    statusOutForDeliveryDesc: 'Rider is on the way to your doorstep',
    statusDelivered: 'Order Delivered',
    statusDeliveredDesc: 'Enjoy your hot meal!',
    statusCancelled: 'Order Cancelled',
    assignedRider: 'Assigned Delivery Rider',
    callRider: 'Call Rider',
    callRestaurant: 'Call Restaurant',
    deliveryAddress: 'Delivery Address',
    orderSummary: 'Order Summary',
    liveMapRoute: 'Live Delivery Route (Matli Town)',

    savedAddresses: 'Saved Addresses',
    addressType: 'Address Type',
    homeLabel: 'Home',
    shopLabel: 'Shop',
    workLabel: 'Work',
    otherLabel: 'Other',
    selectArea: 'Select Area / Neighborhood',
    streetDetails: 'House / Street / Colony Details',
    streetPlaceholder: 'e.g. House #12, Street 3, Near Madina Masjid',
    landmark: 'Nearby Landmark (Optional)',
    landmarkPlaceholder: 'e.g. Near Water Tank, Bank Chowk',
    contactPhone: 'Contact Phone Number',
    saveAddress: 'Save Address',
    defaultBadge: 'Default',
    setDefault: 'Set Default',

    orderHistory: 'Order History',
    pastOrders: 'Past Orders',
    noPastOrders: 'No past orders yet',
    noPastOrdersDesc: 'Your previous meal orders will show up here.',
    paid: 'Paid',
    cashOnDelivery: 'Cash on Delivery',

    vendorDashboard: 'Restaurant Partner Panel',
    storeStatus: 'Restaurant Status',
    openForOrders: 'Accepting Orders',
    closedForOrders: 'Temporarily Closed',
    todayRevenue: "Today's Revenue",
    todayOrders: "Today's Orders",
    pendingOrders: 'Active Orders',
    menuManagement: 'Menu & Dishes',
    addNewDish: 'Add New Dish',
    dishName: 'Dish Name',
    dishPrice: 'Price (₨)',
    dishCategory: 'Category',
    dishDescription: 'Dish Details',
    available: 'In Stock',
    soldOut: 'Sold Out',
    acceptOrder: 'Accept Order',
    markPreparing: 'Mark Preparing',
    readyForPickup: 'Ready for Rider Pickup',
    rejectOrder: 'Decline Order',

    riderDashboard: 'Rider Delivery Panel',
    riderOnline: 'Online & Available',
    riderOffline: 'Offline',
    availableDeliveries: 'Available Orders for Pickup',
    activeDelivery: 'Active Assigned Delivery',
    completedToday: 'Deliveries Completed Today',
    earningsToday: "Today's Earnings",
    walletBalance: 'Wallet Balance',
    claimDelivery: 'Accept & Pick Up Order',
    pickedUpOrder: 'Picked Up (On the Way)',
    deliveredSuccess: 'Mark as Delivered',
    navigateCustomer: 'Navigate to Customer',
    navigateRestaurant: 'Navigate to Restaurant',

    adminDashboard: 'Admin Control Center',
    totalPlatformRevenue: 'Total Gross Volume',
    totalPlatformOrders: 'Total Orders',
    activeRestaurants: 'Active Restaurants',
    activeRidersCount: 'Active Riders',
    registeredUsers: 'Registered Customers',
    commissionEarned: 'Platform Commission',
    restaurantApprovals: 'Restaurant Approvals',
    riderManagement: 'Rider Fleet',
    settings: 'Platform Settings',
    platformCommission: 'Commission Rate (%)',
    resetDemoData: 'Reset Demo Data'
  },

  ur: {
    appName: 'دستک ڈیلیوری',
    tagline: 'ماتلی میں سب سے تیز فوڈ ڈیلیوری',
    locationMatli: 'ماتلی، سندھ',
    selectLanguage: 'زبان منتخب کریں',
    english: 'English',
    urdu: 'اردو',
    sindhi: 'سنڌي',

    customer: 'کسٹمر',
    vendor: 'ہوٹل / دکاندار',
    rider: 'رائڈر',
    admin: 'ایڈمن',
    switchRole: 'ڈیش بورڈ تبدیل کریں',

    home: 'ہوم',
    cart: 'کارٹ',
    orders: 'آرڈرز',
    addresses: 'پتے',
    trackOrder: 'آرڈر ٹریک کریں',
    searchPlaceholder: 'ماتلی میں بریانی، پیزا، کڑاہی، چائے تلاش کریں...',
    viewMenu: 'مینو دیکھیں',
    orderNow: 'ابھی آرڈر کریں',
    addToCart: 'کارٹ میں شامل کریں',
    add: 'شامل کریں',
    viewCart: 'کارٹ دیکھیں',
    checkout: 'بل اور آرڈر مکمل کریں',
    back: 'پیچھے جائیں',
    cancel: 'منسوخ',
    save: 'محفوظ کریں',
    delete: 'حذف کریں',
    edit: 'ترمیم کریں',
    reorder: 'دوبارہ آرڈر کریں',
    whatsappOrder: 'ہوٹل واٹس ایپ',
    contactSupport: 'دستک ہیلپ لائن',

    categories: 'کھانوں کی اقسام',
    allCategories: 'تمام اقسام',
    popularDishes: 'ماتلی کے مشہور کھانے',
    featuredRestaurants: 'ماتلی کے مشہور ہوٹل',
    allRestaurants: 'تمام ہوٹل اور ڈھابے',
    openNow: 'ڈیلیوری کے لیے کھلا ہے',
    closed: 'بند ہے',
    minOrder: 'کم از کم آرڈر',
    deliveryTime: 'ڈیلیوری کا وقت',
    deliveryFee: 'ڈیلیوری فیس',
    freeDelivery: 'مفت ڈیلیوری',
    reviews: 'رائے',
    rating: 'ریٹنگ',
    deals: 'اسپیشل ڈیلز',
    comboOffer: 'کومبو آفر',

    yourCart: 'آپ کی کارٹ',
    cartEmpty: 'آپ کی کارٹ خالی ہے',
    cartEmptyDesc: 'ماتلی کے ہوٹلوں سے لذیذ کھانے شامل کریں۔',
    browseRestaurants: 'ہوٹل دیکھیں',
    specialInstructions: 'باورچی خانے کے لیے خصوصی ہدایت (اختیاری)',
    specialInstructionsPlaceholder: 'مثلاً: مرچ کم رکھیں، سلاد زیادہ بھیجیں...',
    applyPromo: 'کوپن لگائیں',
    promoPlaceholder: 'کوپن کوڈ درج کریں (مثلاً MATLI20)',
    applied: 'لگ گیا',
    discount: 'رعایت',
    subtotal: 'سب ٹوٹل',
    totalBill: 'کل بل',
    selectDeliveryAddress: 'ڈیلیوری کا پتہ منتخب کریں',
    addNewAddress: 'نیا پتہ شامل کریں',
    paymentMethod: 'ادائیگی کا طریقہ',
    cod: 'کیش آن ڈیلیوری (COD)',
    jazzcash: 'جاز کیش آن لائن ٹرانسفر',
    easypaisa: 'ایزی پیسہ آن لائن ٹرانسفر',
    confirmOrder: 'آرڈر کنفرم کریں',
    orderPlacedSuccess: 'آرڈر کامیابی سے درج ہو گیا!',

    liveOrderTracker: 'لائیو آرڈر ٹریکر',
    orderNumber: 'آرڈر نمبر',
    estimatedDelivery: 'متوقع وقت',
    statusPlaced: 'آرڈر درج ہو گیا',
    statusPlacedDesc: 'ہوٹل کی تصدیق کا انتظار ہے',
    statusConfirmed: 'آرڈر منظور ہو گیا',
    statusConfirmedDesc: 'ہوٹل نے آپ کا آرڈر قبول کر لیا ہے',
    statusPreparing: 'کھانا تیار ہو رہا ہے',
    statusPreparingDesc: 'باورچی تازہ کھانا تیار کر رہے ہیں',
    statusOutForDelivery: 'رائڈر راستے میں ہے',
    statusOutForDeliveryDesc: 'رائڈر آپ کے پتے کی طرف روانہ ہے',
    statusDelivered: 'آرڈر پہنچ گیا',
    statusDeliveredDesc: 'اپنے لذیذ کھانے سے لطف اندوز ہوں!',
    statusCancelled: 'آرڈر منسوخ ہو گیا',
    assignedRider: 'مقرر کردہ ڈیلیوری رائڈر',
    callRider: 'رائڈر کو کال کریں',
    callRestaurant: 'ہوٹل کو کال کریں',
    deliveryAddress: 'ڈیلیوری کا پتہ',
    orderSummary: 'آرڈر کی تفصیل',
    liveMapRoute: 'لائیو ڈیلیوری روٹ (ماتلی شہر)',

    savedAddresses: 'محفوظ پتے',
    addressType: 'پتے کی قسم',
    homeLabel: 'گھر',
    shopLabel: 'دکان',
    workLabel: 'دفتر',
    otherLabel: 'دیگر',
    selectArea: 'علاقہ منتخب کریں',
    streetDetails: 'مکان / گلی / محلہ کی تفصیل',
    streetPlaceholder: 'مثلاً مکان نمبر 12، گلی 3، نزد مدینہ مسجد',
    landmark: 'مشہور قریبی جگہ (اختیاری)',
    landmarkPlaceholder: 'مثلاً نزد واٹر ٹینک، بینک چوک',
    contactPhone: 'رابطہ فون نمبر',
    saveAddress: 'پتہ محفوظ کریں',
    defaultBadge: 'ڈیفالٹ',
    setDefault: 'ڈیفالٹ بنائیں',

    orderHistory: 'آرڈرز کی ہسٹری',
    pastOrders: 'سابقہ آرڈرز',
    noPastOrders: 'ابھی تک کوئی آرڈر نہیں',
    noPastOrdersDesc: 'آپ کے سابقہ آرڈرز یہاں ظاہر ہوں گے۔',
    paid: 'ادا شدہ',
    cashOnDelivery: 'کیش آن ڈیلیوری',

    vendorDashboard: 'ہوٹل پارٹنر پینل',
    storeStatus: 'ہوٹل کی حالت',
    openForOrders: 'آرڈرز کے لیے کھلا ہے',
    closedForOrders: 'عارضی طور پر بند ہے',
    todayRevenue: 'آج کی کل آمدن',
    todayOrders: 'آج کے کل آرڈرز',
    pendingOrders: 'زیر التواء آرڈرز',
    menuManagement: 'مینو اور کھانے',
    addNewDish: 'نیا کھانا شامل کریں',
    dishName: 'کھانے کا نام',
    dishPrice: 'قیمت (روپے)',
    dishCategory: 'قسم',
    dishDescription: 'کھانے کی تفصیل',
    available: 'دستیاب ہے',
    soldOut: 'ختم ہو گیا',
    acceptOrder: 'آرڈر قبول کریں',
    markPreparing: 'تیاری شروع کریں',
    readyForPickup: 'رائڈر کے لیے تیار ہے',
    rejectOrder: 'آرڈر مسترد کریں',

    riderDashboard: 'رائڈر ڈیلیوری پینل',
    riderOnline: 'آن لائن اور دستیاب',
    riderOffline: 'آف لائن',
    availableDeliveries: 'دستیاب آرڈرز',
    activeDelivery: 'جاری ڈیلیوری',
    completedToday: 'آج کے مکمل شدہ آرڈرز',
    earningsToday: 'آج کی کمائی',
    walletBalance: 'والٹ بیلنس',
    claimDelivery: 'آرڈر اٹھائیں',
    pickedUpOrder: 'کھانا اٹھا لیا (راستے میں)',
    deliveredSuccess: 'ڈیلیور مکمل ہو گیا',
    navigateCustomer: 'کسٹمر کی لوکیشن',
    navigateRestaurant: 'ہوٹل کی لوکیشن',

    adminDashboard: 'ایڈمن کنٹرول سینٹر',
    totalPlatformRevenue: 'پلیٹ فارم کی کل فروخت',
    totalPlatformOrders: 'کل آرڈرز',
    activeRestaurants: 'فعال ہوٹل',
    activeRidersCount: 'فعال رائڈرز',
    registeredUsers: 'رجسٹرڈ کسٹمرز',
    commissionEarned: 'پلیٹ فارم کمیشن',
    restaurantApprovals: 'ہوٹل منظوری',
    riderManagement: 'رائڈرز مینیجمنٹ',
    settings: 'پلیٹ فارم سیٹنگز',
    platformCommission: 'کمیشن ریٹ (%)',
    resetDemoData: 'ڈیمو ڈیٹا ری سیٹ کریں'
  },

  sd: {
    appName: 'دستڪ ڊليوري',
    tagline: 'مٽلي ۾ تيز ترين کاڌي جي ڊليوري',
    locationMatli: 'مٽلي، سنڌ',
    selectLanguage: 'ٻولي چونڊيو',
    english: 'English',
    urdu: 'اردو',
    sindhi: 'سنڌي',

    customer: 'گراهڪ',
    vendor: 'هوٽل / دڪاندار',
    rider: 'رائڊر',
    admin: 'ايڊمن',
    switchRole: 'ڊيش بورڊ بدلايو',

    home: 'مک صفحو',
    cart: 'کارٽ',
    orders: 'آرڊر',
    addresses: 'پتا',
    trackOrder: 'آرڊر ٽريڪ ڪريو',
    searchPlaceholder: 'مٽلي ۾ برياني، پيزا، ڪڙاهي، چانهه ڳوليو...',
    viewMenu: 'مينيو ڏسو',
    orderNow: 'هاڻي آرڊر ڪريو',
    addToCart: 'کارٽ ۾ وجھو',
    add: 'وجھو',
    viewCart: 'کارٽ ڏسو',
    checkout: 'بل ۽ آرڊر پڪو ڪريو',
    back: 'واپس',
    cancel: 'رد ڪريو',
    save: 'محفوظ ڪريو',
    delete: 'ختم ڪريو',
    edit: 'تبديل ڪريو',
    reorder: 'وري آرڊر ڪريو',
    whatsappOrder: 'هوٽل واٽس ايپ',
    contactSupport: 'دستڪ هيلپ لائين',

    categories: 'کاڌي جا قسم',
    allCategories: 'سڀ قسم',
    popularDishes: 'مٽلي جا مشهور کاڌا',
    featuredRestaurants: 'مٽلي جون مشهور هوٽلون',
    allRestaurants: 'سڀ هوٽلون ۽ ڍٻا',
    openNow: 'ڊليوري لاءِ کليل آهي',
    closed: 'بند آهي',
    minOrder: 'گهٽ ۾ گهٽ آرڊر',
    deliveryTime: 'ڊليوري وقت',
    deliveryFee: 'ڊليوري خرچ',
    freeDelivery: 'مفت ڊليوري',
    reviews: 'رايا',
    rating: 'ريٽنگ',
    deals: 'خاص ڊيلز',
    comboOffer: 'ڪومبو آفر',

    yourCart: 'توهان جي کارٽ',
    cartEmpty: 'کارٽ خالي آهي',
    cartEmptyDesc: 'مٽلي جي سٺين هوٽلن مان کاڌو شامل ڪريو.',
    browseRestaurants: 'هوٽلون ڏسو',
    specialInstructions: 'بورچي خاني لاءِ هدايت (اختياري)',
    specialInstructionsPlaceholder: 'مثال: مرچ گهٽ، سلاد وڌيڪ وجھجو...',
    applyPromo: 'ڪوپن لڳايو',
    promoPlaceholder: 'ڪوپن ڪوڊ لکو (مثال MATLI20)',
    applied: 'لڳي ويو',
    discount: 'رعايت',
    subtotal: 'اصل رقم',
    totalBill: 'ڪل بل',
    selectDeliveryAddress: 'ڊليوري پتو چونڊيو',
    addNewAddress: 'نئون پتو وجھو',
    paymentMethod: 'پئسن جي ادائيگي',
    cod: 'پهچڻ تي روڪ پئسا (COD)',
    jazzcash: 'جاز ڪيش آن لائن ٽرانسفر',
    easypaisa: 'ايزي پئسا آن لائن ٽرانسفر',
    confirmOrder: 'آرڊر پڪو ڪريو',
    orderPlacedSuccess: 'آرڊر ڪاميابي سان ملي ويو!',

    liveOrderTracker: 'لائيو آرڊر ٽريڪر',
    orderNumber: 'آرڊر نمبر',
    estimatedDelivery: 'اندازن وقت',
    statusPlaced: 'آرڊر ملي ويو',
    statusPlacedDesc: 'هوٽل پاران تصديق جو انتظار آهي',
    statusConfirmed: 'آرڊر منظور ٿيو',
    statusConfirmedDesc: 'هوٽل آرڊر قبول ڪري ورتو آهي',
    statusPreparing: 'کاڌو تيار ٿي رهيو آهي',
    statusPreparingDesc: 'ڪاريگر تازو کاڌو پچائي رهيا آهن',
    statusOutForDelivery: 'رائڊر رستي تي آهي',
    statusOutForDeliveryDesc: 'رائڊر توهان جي پتي ڏانهن نڪري چڪو آهي',
    statusDelivered: 'کاڌو پهچي ويو',
    statusDeliveredDesc: 'پنهنجي لذيذ کاڌي مان لطف اندوز ٿيو!',
    statusCancelled: 'آرڊر رد ٿي ويو',
    assignedRider: 'ڊليوري رائڊر',
    callRider: 'رائڊر کي ڪال ڪريو',
    callRestaurant: 'هوٽل کي ڪال ڪريو',
    deliveryAddress: 'ڊليوري جو پتو',
    orderSummary: 'آرڊر جا تفصيل',
    liveMapRoute: 'لائيو ڊليوري رستو (مٽلي شهر)',

    savedAddresses: 'محفوظ ڪيل پتا',
    addressType: 'پتي جو قسم',
    homeLabel: 'گهر',
    shopLabel: 'دڪان',
    workLabel: 'آفيس',
    otherLabel: 'ٻيو',
    selectArea: 'علائقو چونڊيو',
    streetDetails: 'مڪان / گهٽي / پاڙو',
    streetPlaceholder: 'مثال: گهر نمبر 12، گهٽي 3، مديني مسجد ڀرسان',
    landmark: 'مشھور جاءِ / نشاني (اختياري)',
    landmarkPlaceholder: 'مثال: پاڻي جي ٽانڪي ڀرسان، بئنڪ چؤڪ',
    contactPhone: 'رابطي لاءِ فون نمبر',
    saveAddress: 'پتو محفوظ ڪريو',
    defaultBadge: 'مکيه پتو',
    setDefault: 'مکيه پتو بڻايو',

    orderHistory: 'سابقا آرڊر تاريخ',
    pastOrders: 'پراڻا آرڊر',
    noPastOrders: 'اڃا تائين ڪو به آرڊر ناهي',
    noPastOrdersDesc: 'توهان جا پراڻا آرڊر هتي نظر ايندا.',
    paid: 'ادا ٿيل',
    cashOnDelivery: 'روڪ رقم (COD)',

    vendorDashboard: 'هوٽل پارٽنر پينل',
    storeStatus: 'هوٽل جي حالت',
    openForOrders: 'آرڊر لاءِ کليل آهي',
    closedForOrders: 'عارضي طور بند آهي',
    todayRevenue: 'اڄ جي ڪل آمدني',
    todayOrders: 'اڄ جا ڪل آرڊر',
    pendingOrders: 'جاري آرڊر',
    menuManagement: 'مينيو ۽ کاڌا',
    addNewDish: 'نئون کاڌو شامل ڪريو',
    dishName: 'کاڌي جو نالو',
    dishPrice: 'قيمت (روپيا)',
    dishCategory: 'قسم',
    dishDescription: 'کاڌي جا تفصيل',
    available: 'موجود آهي',
    soldOut: 'ختم ٿي ويو',
    acceptOrder: 'آرڊر قبول ڪريو',
    markPreparing: 'تياري شروع ڪريو',
    readyForPickup: 'رائڊر لاءِ تيار آهي',
    rejectOrder: 'آرڊر رد ڪريو',

    riderDashboard: 'رائڊر ڊليوري پينل',
    riderOnline: 'آن لائن ۽ تيار',
    riderOffline: 'آف لائن',
    availableDeliveries: 'کڻڻ لاءِ موجود آرڊر',
    activeDelivery: 'هلندڙ ڊليوري',
    completedToday: 'اڄ مڪمل ڪيل آرڊر',
    earningsToday: 'اڄ جي ڪمائي',
    walletBalance: 'والٽ بيلنس',
    claimDelivery: 'آرڊر کڻو',
    pickedUpOrder: 'کاڌو کنيو (رستي تي آهي)',
    deliveredSuccess: 'کاڌو پهچايو ويو',
    navigateCustomer: 'گراهڪ جو پتو',
    navigateRestaurant: 'هوٽل جو پتو',

    adminDashboard: 'ايڊمن ڪنٽرول سينٽر',
    totalPlatformRevenue: 'پليٽ فارم جي ڪل وڪرو',
    totalPlatformOrders: 'ڪل آرڊر',
    activeRestaurants: 'هلندڙ هوٽلون',
    activeRidersCount: 'هلندڙ رائڊرز',
    registeredUsers: 'رجسٽرڊ گراهڪ',
    commissionEarned: 'پليٽ فارم ڪميشن',
    restaurantApprovals: 'هوٽل منظوري',
    riderManagement: 'رائڊرز جو انتظام',
    settings: 'پليٽ فارم سيٽنگز',
    platformCommission: 'ڪميشن جي شرح (%)',
    resetDemoData: 'ڊيمو ڊيٽا نئين سر ڪريو'
  }
};

/**
 * Returns localized name for an entity with fallback to English
 */
export function getLocalizedName(
  item: { name: string; nameUrdu?: string; nameSindhi?: string },
  lang: Language
): string {
  if (lang === 'sd' && item.nameSindhi) return item.nameSindhi;
  if (lang === 'ur' && item.nameUrdu) return item.nameUrdu;
  return item.name;
}

/**
 * Returns localized description with fallback to English
 */
export function getLocalizedDescription(
  item: { description?: string; descriptionUrdu?: string; descriptionSindhi?: string },
  lang: Language
): string {
  if (!item) return '';
  if (lang === 'sd' && item.descriptionSindhi) return item.descriptionSindhi;
  if (lang === 'ur' && item.descriptionUrdu) return item.descriptionUrdu;
  return item.description || '';
}

/**
 * Returns localized title for promos
 */
export function getLocalizedPromo(
  promo: { title: string; titleUrdu?: string; titleSindhi?: string; subtitle: string; subtitleUrdu?: string; subtitleSindhi?: string },
  lang: Language
): { title: string; subtitle: string } {
  const title = (lang === 'sd' && promo.titleSindhi) ? promo.titleSindhi : (lang === 'ur' && promo.titleUrdu) ? promo.titleUrdu : promo.title;
  const subtitle = (lang === 'sd' && promo.subtitleSindhi) ? promo.subtitleSindhi : (lang === 'ur' && promo.subtitleUrdu) ? promo.subtitleUrdu : promo.subtitle;
  return { title, subtitle };
}
