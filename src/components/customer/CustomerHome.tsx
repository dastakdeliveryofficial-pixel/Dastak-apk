import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Star, Clock, ShoppingBag, Flame, Sparkles, 
  MapPin, Percent, ChevronRight, Check, Utensils, MessageCircle,
  Store, Bike, KeyRound, UserPlus, Download, Smartphone,
  Plus, Minus, X, Coffee, HeartPulse, Filter, ArrowRight, Tag, UtensilsCrossed,
  Menu, Bell, SlidersHorizontal, Heart, ClipboardList, User, Phone, CheckCircle2,
  Package, Truck, Fuel, Printer, Stethoscope, Laptop, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem } from '../../types';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { TWELVE_DISPLAY_CATEGORIES, DisplayCategory } from '../../data/categoryCatalog';
import { CustomerNavDrawer } from './CustomerNavDrawer';

interface CustomerHomeProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onOpenCart: () => void;
  onTrackOrder?: (orderId: string) => void;
  onOpenHistory?: () => void;
  onOpenAddresses?: () => void;
  onOpenApkModal?: () => void;
}

// Universal Search and Category Matching
export const matchItemToSearchOrCategory = (
  item: MenuItem,
  query: string,
  catId: string | null,
  restaurant?: Restaurant
): boolean => {
  const normName = (item.name || '').toLowerCase();
  const normUrdu = (item.nameUrdu || '').toLowerCase();
  const normSindhi = (item.nameSindhi || '').toLowerCase();
  const normCat = (item.category || '').toLowerCase();
  const normDesc = (item.description || '').toLowerCase();
  const restName = (restaurant?.name || '').toLowerCase();
  const restUrdu = (restaurant?.nameUrdu || '').toLowerCase();
  const restArea = (restaurant?.area || '').toLowerCase();
  const fullText = `${normName} ${normUrdu} ${normSindhi} ${normCat} ${normDesc} ${restName} ${restUrdu} ${restArea}`;

  // 1. Check Category Match
  if (catId) {
    let catMatched = false;
    switch (catId) {
      case 'food':
      case 'fastfood':
        catMatched = /burger|pizza|biryani|karahi|bbq|roll|shawarma|broast|deal|pasta|sandwich|fries|chai|tea|paratha|kabab|fish|tikka|handi|daal|roti|nihari|haleem|pulao|rice|chowmein|soup|fastfood|خوراڪ|کھانا|برگر|پیزا|بریانی|کڑاہی|شوربا/i.test(fullText);
        break;
      case 'biryani':
        catMatched = /biryani|baryani|pulao|chawal|rice|beef biryani|chicken biryani|matka biryani|بریانی|پلاؤ|چاول|برياني|پلاء/i.test(fullText) || item.restaurantId === 'almadina';
        break;
      case 'drinks':
      case 'chai':
        catMatched = /chai|tea|doodh patti|doodhpatti|shake|lassi|juice|coffee|cold drink|pepsi|coke|7up|marinda|dew|sting|water|شربت|چائے|دودھ پتی|لسی|کافی|چانهه|لسي/i.test(fullText);
        break;
      case 'grocery':
        catMatched = /grocery|ration|atta|flour|oil|ghee|sugar|daal|lentil|rice|grain|spices|masala|soap|shampoo|surf|detergent|biscuit|snack|tea|patti|nestle|staples|گروسری|راشن/i.test(fullText) || item.restaurantId === 'groceries' || item.restaurantId === 'mart' || item.restaurantId === 'generalstore';
        break;
      case 'fruits_veg':
        catMatched = /fruit|vegetable|sabzi|apple|banana|mango|potato|aloo|onion|pyaz|tomato|tamatar|lemon|ginger|adrak|garlic|lasan|cucumber|kheera|orange|kinoo|سبزی|پھل|ڀاڄي/i.test(fullText);
        break;
      case 'meat':
        catMatched = /meat|gosht|chicken|mutton|beef|qeema|mince|fish|machli|boti|chapli|tikka|گوشت|مرغی|مچھلی/i.test(fullText);
        break;
      case 'dairy':
        catMatched = /milk|doodh|yogurt|dahi|cheese|paneer|butter|makhan|cream|malai|egg|anda|lassi|khoya|دودھ|دہی|مکھن|انڈے|کير/i.test(fullText);
        break;
      case 'medicines':
      case 'pharmacy':
        catMatched = /medicine|tablet|syrup|capsule|panadol|arinac|brufen|disprin|flagyl|calpol|bandage|saniplast|dettol|pharmacy|first aid|medical|drops|inhaler|ادویات|دوا|دوائی|گولی|دوائون/i.test(fullText) || item.restaurantId === 'medical';
        break;
      case 'parcels':
        catMatched = /parcel|courier|delivery|package|box|tcs|leopard|envelope|dispatch|پارسل/i.test(fullText);
        break;
      case 'hp_jp':
        catMatched = /hp|jp|electronics|cable|charger|usb|handsfree|earbuds|mobile|phone|cover|protector|powerbank|mouse|keyboard|battery|موبائل|کمپیوٹر/i.test(fullText);
        break;
      case 'pick_drop':
        catMatched = /pick|drop|rider|bike|ride|transport|courier|errand|پک اینڈ ڈراپ/i.test(fullText);
        break;
      case 'printing':
        catMatched = /print|copy|photocopy|document|paper|xerox|scan|lamination|stamp|affidavit|پرنٹ|فوٹو کاپی/i.test(fullText);
        break;
      case 'petrol':
        catMatched = /petrol|fuel|diesel|oil|engine oil|emergency petrol|پیٹرول/i.test(fullText);
        break;
      case 'medical_services':
        catMatched = /doctor|clinic|token|hospital|nurse|test|blood|bp|injection|medical service|ہسپتال|کلینک/i.test(fullText);
        break;
      case 'pizza':
        catMatched = /pizza|calzone|crust|پیزا|پيزا/i.test(fullText);
        break;
      case 'bbq':
        catMatched = /bbq|karahi|tikka|kabab|kebab|boti|handi|salan|roti|naan|paratha|کڑاہی|باربی کیو|تکہ/i.test(fullText);
        break;
      case 'desserts':
        catMatched = /dessert|sweet|bakery|mithai|cake|halwa|ice cream|pastry|kheer|gulab jamun|مٹھائی|کیک|حلوہ/i.test(fullText);
        break;
      case 'deals':
        catMatched = item.isCombo === true || !!item.discountedPrice || /deal|combo|ڈیل/i.test(fullText);
        break;
      default:
        catMatched = normCat.includes(catId.toLowerCase()) || normName.includes(catId.toLowerCase());
    }
    if (!catMatched) return false;
  }

  // 2. Check Search Query Match
  if (query.trim()) {
    const qClean = query.toLowerCase().trim();
    const qWords = qClean.split(/\s+/).filter(Boolean);

    // Fast-path keywords for Urdu & English terms
    if ((qClean.includes('chai') || qClean.includes('tea') || qClean.includes('چائے')) && /chai|tea|doodh patti|چائے/i.test(fullText)) return true;
    if ((qClean.includes('biryani') || qClean.includes('pulao') || qClean.includes('بریانی')) && /biryani|pulao|chawal|بریانی/i.test(fullText)) return true;
    if ((qClean.includes('med') || qClean.includes('panadol') || qClean.includes('tablet') || qClean.includes('ادویات') || qClean.includes('دوا')) && /panadol|tablet|syrup|capsule|medicine|pharmacy|ادویات|دوا/i.test(fullText)) return true;
    if ((qClean.includes('burger') || qClean.includes('zinger') || qClean.includes('برگر')) && /burger|zinger|برگر/i.test(fullText)) return true;
    if ((qClean.includes('pizza') || qClean.includes('پیزا')) && /pizza|پیزا/i.test(fullText)) return true;

    // All terms must match
    return qWords.every(term => fullText.includes(term));
  }

  return true;
};

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectRestaurant,
  onOpenCart,
  onTrackOrder,
  onOpenHistory,
  onOpenAddresses,
  onOpenApkModal
}) => {
  const { 
    restaurants, 
    bannerPromos, 
    menuItems, 
    orders,
    currentUser,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    cart,
    addToCart,
    updateCartQuantity,
    applyPromoCode,
    openLoginModal,
    triggerToast,
    getRestaurantName,
    getRestaurantDesc,
    getItemName,
    getItemDesc,
    getCategoryName,
    getPromoContent,
    t,
    platformSettings,
    unreadNotificationCount,
    openNotificationCenter,
    openApkModal
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'top_rated' | 'low_fee' | 'deals'>('all');
  const [selectedVariations, setSelectedVariations] = useState<{ [itemId: string]: any }>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState<number>(18);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dastak_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (restId: string) => {
    const updated = favorites.includes(restId)
      ? favorites.filter(id => id !== restId)
      : [...favorites, restId];
    setFavorites(updated);
    try {
      localStorage.setItem('dastak_favorites', JSON.stringify(updated));
    } catch {}
    triggerToast(
      favorites.includes(restId) ? 'Removed' : 'Saved to Favorites',
      favorites.includes(restId) ? 'Removed from favorites' : 'Added to your favorites list',
      'info'
    );
  };

  // Filter only active promotional banners (respects deactivation status!)
  const activeBanners = useMemo(() => {
    return (bannerPromos || []).filter(p => p.active !== false);
  }, [bannerPromos]);

  // Check active order for current customer
  const activeOrder = orders.find(
    o => (o.customerId === currentUser?.id || (currentUser?.phone && o.customerPhone === currentUser?.phone)) &&
         o.status !== 'delivered' && o.status !== 'cancelled'
  );

  // Filter matching products across ALL restaurants in Matli
  const matchingProducts = useMemo(() => {
    return menuItems.filter(item => {
      const rest = restaurants.find(r => r.id === item.restaurantId);
      return matchItemToSearchOrCategory(item, searchQuery, selectedCategory, rest);
    });
  }, [menuItems, restaurants, searchQuery, selectedCategory]);

  // Filter restaurants: include any restaurant that matches search/category directly OR has matching items
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const restItems = menuItems.filter(i => i.restaurantId === restaurant.id);

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = restaurant.name.toLowerCase().includes(q) || 
          (restaurant.nameUrdu && restaurant.nameUrdu.includes(q)) ||
          (restaurant.nameSindhi && restaurant.nameSindhi.includes(q));
        const matchArea = restaurant.area.toLowerCase().includes(q);
        const matchCategory = restaurant.categories.some(c => c.toLowerCase().includes(q));
        const hasMatchingItem = restItems.some(item => matchItemToSearchOrCategory(item, searchQuery, null, restaurant));
        
        if (!matchName && !matchArea && !matchCategory && !hasMatchingItem) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory) {
        const hasMatchingItemInCategory = restItems.some(item => matchItemToSearchOrCategory(item, '', selectedCategory, restaurant));
        const hasCategoryInRestaurant = restaurant.categories.some(c => {
          if (selectedCategory === 'food') return true;
          if (selectedCategory === 'medicines') return c === 'pharmacy';
          if (selectedCategory === 'grocery') return c === 'grocery';
          return c === selectedCategory;
        });
        
        if (!hasCategoryInRestaurant && !hasMatchingItemInCategory) {
          return false;
        }
      }

      // Quick sub-filter
      if (activeFilter === 'top_rated' && restaurant.rating < 4.7) return false;
      if (activeFilter === 'low_fee' && restaurant.deliveryFee > 50) return false;
      if (activeFilter === 'deals' && !restaurant.categories.includes('deals') && !restItems.some(i => i.isCombo || i.discountedPrice)) return false;

      return true;
    });
  }, [restaurants, menuItems, searchQuery, selectedCategory, activeFilter]);

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    applyPromoCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleAddToCartItem = (item: MenuItem, restaurant?: Restaurant) => {
    const targetRest = restaurant || restaurants.find(r => r.id === item.restaurantId);
    if (!targetRest) return;
    
    const activeVar = selectedVariations[item.id] || (item.variationTypes && item.variationTypes[0]?.options[0]);
    addToCart(targetRest, item, 1, activeVar);
    triggerToast(
      'Added to Order',
      `${getItemName(item)} from ${getRestaurantName(targetRest)} added to cart!`,
      'success'
    );
  };

  // Find active category label
  const activeCategoryMeta = TWELVE_DISPLAY_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FFF5F8] pb-28 text-[#1F2937]">
      {/* Slide-out Customer Navigation Drawer */}
      <CustomerNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenOrders={() => onOpenHistory && onOpenHistory()}
        onOpenAddresses={() => onOpenAddresses && onOpenAddresses()}
        onOpenApkModal={() => onOpenApkModal ? onOpenApkModal() : openApkModal()}
        onOpenFavorites={() => {
          setSelectedCategory(null);
          setSearchQuery('');
          setActiveFilter('top_rated');
        }}
      />

      {/* TOP RADIANT MAGENTA BRAND HEADER - MATCHING UPLOADED REFERENCE DESIGN */}
      <div className="bg-gradient-to-b from-[#B01454] via-[#D81B60] to-[#E91E63] text-white pt-3 sm:pt-4 pb-6 px-4 sm:px-6 shadow-md relative overflow-hidden">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          {/* Top Bar: Hamburger Menu + Crown Brand + Notification Bell */}
          <div className="flex items-center justify-between gap-2">
            {/* Hamburger Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 shadow-xs"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Center Brand Identity: Golden Crown + Dastak + Delivery Service + Cursive Tagline */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-1.5 leading-none">
                <span className="text-xl sm:text-2xl drop-shadow-sm select-none">👑</span>
                <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-white drop-shadow-sm">
                  Dastak
                </h1>
              </div>

              {/* Delivery Service subtitle in golden yellow */}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#FACC15] uppercase drop-shadow-xs">
                  -- DELIVERY SERVICE --
                </span>
              </div>

              {/* Tagline in flowing cursive script */}
              <p 
                className="text-[11px] sm:text-xs text-pink-100/95 font-medium tracking-wide mt-0.5 italic drop-shadow-xs select-none"
                style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif" }}
              >
                Darwaze par hi nahi, dil par bhi hogi dastak ♡
              </p>
            </div>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              onClick={openNotificationCenter}
              className="relative p-2 -mr-2 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 shadow-xs"
              title="Notification Center"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#D81B60] shadow-sm animate-pulse">
                  {unreadNotificationCount}
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#D81B60]">
                  3
                </span>
              )}
            </button>
          </div>

          {/* Floating Pill Search Bar */}
          <div className="relative pt-1">
            <div className="bg-white rounded-2xl sm:rounded-full shadow-lg p-1.5 sm:p-2 border border-pink-100 flex items-center gap-2">
              <div className="pl-3 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, restaurants..."
                className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm font-medium focus:outline-none py-1.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
                className={`p-2 rounded-xl sm:rounded-full transition-colors shrink-0 ${
                  isFilterTrayOpen || selectedCategory ? 'bg-[#E11D74] text-white' : 'text-[#E11D74] hover:bg-pink-50'
                }`}
                title="Filter categories"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Popular Keywords Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-bold text-pink-100 shrink-0">Popular:</span>
              {[
                { label: '☕ Chai (چائے)', id: 'chai' },
                { label: '🍲 Biryani (بریانی)', id: 'biryani' },
                { label: '💊 Medicine (ادویات)', id: 'medicines' },
                { label: '🍔 Burgers', id: 'fastfood' },
                { label: '🍕 Pizza', id: 'pizza' },
                { label: '🍢 Karahi & BBQ', id: 'bbq' },
                { label: '🛒 Grocery (راشن)', id: 'grocery' },
                { label: '🍰 Sweets', id: 'desserts' }
              ].map((chip) => {
                const isSelected = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(isSelected ? null : chip.id);
                      setSearchQuery('');
                      // Auto-scroll down to matching results
                      setTimeout(() => {
                        const el = document.getElementById('matching-products-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                      isSelected
                        ? 'bg-white text-[#E11D74] font-black ring-2 ring-white/50'
                        : 'bg-white/20 hover:bg-white/30 text-white border border-white/25'
                    }`}
                  >
                    <span>{chip.label}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6 space-y-6">
        {/* Active Order Live Tracking Banner (if any) */}
        {activeOrder && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => onTrackOrder && onTrackOrder(activeOrder.id)}
            className="bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#AD1457] text-white p-3.5 sm:p-4 rounded-3xl shadow-lg border border-pink-300 flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold shrink-0 border border-white/30">
                <Bike className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white text-[#E11D74] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    Live Order #{activeOrder.orderNumber}
                  </span>
                  <span className="text-[11px] font-bold text-pink-100 uppercase tracking-wider">
                    Status: <strong className="text-white capitalize">{activeOrder.status.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-white truncate mt-0.5">
                  {activeOrder.restaurantName} • ₨ {activeOrder.total}
                </h4>
                <span className="text-[10px] sm:text-[11px] text-pink-100 block truncate">
                  Est. Time: {activeOrder.estimatedDeliveryTime || '20-30 min'} • Tap to view live rider tracking
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="bg-white text-[#E11D74] font-black text-xs px-3.5 py-2 rounded-xl shadow-xs hover:bg-pink-50 transition-colors flex items-center gap-1"
              >
                <span>Track</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 12 PASTEL CATEGORY CARDS GRID (EXACTLY 4 COLUMNS × 3 ROWS) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E11D74]"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
                Explore Categories & Services / کیٹیگریز
              </h3>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-[#E11D74] hover:underline flex items-center gap-1"
              >
                <span>Reset Filter</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {TWELVE_DISPLAY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : cat.id);
                    setSearchQuery('');
                    setTimeout(() => {
                      const el = document.getElementById('matching-products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className={`${cat.bgClass} ${cat.hoverClass} border ${cat.borderClass} rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between transition-all duration-200 group active:scale-95 shadow-2xs relative ${
                    isSelected ? 'ring-2 ring-[#E11D74] border-transparent shadow-md scale-[1.02]' : ''
                  }`}
                  style={{ minHeight: '100px' }}
                >
                  {/* Category Selection Check */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 bg-[#E11D74] text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Icon Emoji Graphic */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/70 shadow-xs flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    {cat.iconEmoji}
                  </div>

                  {/* Category Label */}
                  <div className="mt-1.5">
                    <span className={`text-[11px] sm:text-xs font-black block leading-tight ${cat.textColor}`}>
                      {cat.name}
                    </span>
                    {cat.isService && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full mt-0.5 inline-block">
                        ₨ {cat.basePrice}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DELIVERY HOURS & LOCATION PILL - MATCHING UPLOADED REFERENCE DESIGN */}
        <div className="bg-[#FDF2F5] border border-pink-200/80 rounded-2xl py-3 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          {/* Left: Clock Icon + Delivery Hours */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-[#E11D74] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 block leading-tight">
                Delivery Hours
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">
                9:00 AM - 1:15 AM
              </span>
            </div>
          </div>

          {/* Center Divider */}
          <div className="h-8 w-px bg-pink-200/80 mx-2" />

          {/* Right: MapPin Icon + Available in Matli */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-[#E11D74] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 block leading-tight">
                Available in
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">
                Matli Town (ماتلی)
              </span>
            </div>
          </div>
        </div>

        {/* PROMOTIONAL HOME BANNERS (ONLY ACTIVE ONES DISPLAYED!) */}
        {activeBanners.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeBanners.map((promo) => {
                const localized = getPromoContent(promo);
                return (
                  <div
                    key={promo.id}
                    className={`relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r ${promo.bgGradient || 'from-pink-600 to-rose-700'} text-white shadow-sm flex items-center justify-between gap-3 border border-white/20`}
                  >
                    <div className="relative z-10 max-w-[70%]">
                      <div className="inline-flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1">
                        <Percent className="w-3 h-3 text-pink-200" /> {promo.discountPercent}% OFF
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                        {localized.title}
                      </h4>
                      <p className="text-[11px] text-white/90 mt-0.5 line-clamp-1">
                        {localized.subtitle}
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => handleCopyPromo(promo.code)}
                        className="mt-2.5 inline-flex items-center gap-1.5 bg-white text-[#E11D74] hover:bg-pink-50 font-black text-[11px] px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
                      >
                        {copiedCode === promo.code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            <span>Applied to Cart!</span>
                          </>
                        ) : (
                          <>
                            <Tag className="w-3 h-3" />
                            <span>Use Voucher: {promo.code}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <img
                      src={promo.image}
                      alt={localized.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 object-cover rounded-2xl shadow-sm shrink-0 border-2 border-white/40"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MATCHING PRODUCTS & DISHES SECTION (ALWAYS FUNCTIONAL ON SEARCH OR CATEGORY CLICK) */}
        {(selectedCategory || searchQuery.trim()) && (
          <div id="matching-products-section" className="bg-white rounded-3xl border border-pink-100 p-5 sm:p-6 shadow-sm scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-pink-50 text-[#E11D74] px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-pink-200">
                  <Sparkles className="w-3 h-3 text-[#E11D74]" />
                  <span>{selectedCategory ? (activeCategoryMeta?.name || 'Category Results') : 'Search Results'}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1 flex items-center gap-2 flex-wrap">
                  <span>
                    {searchQuery.trim() 
                      ? `Items matching "${searchQuery}"`
                      : (activeCategoryMeta ? `${activeCategoryMeta.iconEmoji} ${activeCategoryMeta.name}` : 'Dishes & Products')}
                  </span>
                  <span className="text-xs font-bold text-gray-500 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                    {matchingProducts.length} items in Matli
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Order directly below with fast delivery anywhere across Matli town.
                </p>
              </div>

              {/* Clear Filter Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-bold text-[#E11D74] hover:bg-pink-100 bg-pink-50 px-3.5 py-2 rounded-xl transition-colors border border-pink-200"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filter / Reset</span>
              </button>
            </div>

            {/* If Selected Category is a Direct Booking Service (Parcels, Pick & Drop, Petrol, Printing, Medical Services) */}
            {activeCategoryMeta?.isService && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100/60 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-xs shrink-0 border border-pink-200">
                    {activeCategoryMeta.iconEmoji}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">
                      Matli Direct {activeCategoryMeta.name} Express
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activeCategoryMeta.subtext} • Fixed base fee: <strong>₨ {activeCategoryMeta.basePrice}</strong>
                    </p>
                    <span className="text-[10px] text-[#E11D74] font-bold">
                      ⚡ Immediate rider dispatch in 15-20 min
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Salam Dastak Delivery! I need to book *${activeCategoryMeta.name}* in Matli. Please assign a rider.`;
                      openWhatsAppChat(platformSettings.supportWhatsApp, msg);
                    }}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Book via WhatsApp (₨ {activeCategoryMeta.basePrice})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {matchingProducts.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 text-pink-300 mx-auto mb-2" />
                <h4 className="text-base font-bold text-gray-800">No items found matching this filter</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Try searching for popular Matli favorites below:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <button onClick={() => { setSelectedCategory('chai'); setSearchQuery(''); }} className="text-xs bg-pink-50 text-[#E11D74] px-3.5 py-1.5 rounded-full font-bold border border-pink-200 hover:bg-pink-100">☕ Chai (چائے)</button>
                  <button onClick={() => { setSelectedCategory('biryani'); setSearchQuery(''); }} className="text-xs bg-pink-50 text-[#E11D74] px-3.5 py-1.5 rounded-full font-bold border border-pink-200 hover:bg-pink-100">🍲 Biryani (بریانی)</button>
                  <button onClick={() => { setSelectedCategory('medicines'); setSearchQuery(''); }} className="text-xs bg-pink-50 text-[#E11D74] px-3.5 py-1.5 rounded-full font-bold border border-pink-200 hover:bg-pink-100">💊 Medicines (ادویات)</button>
                  <button onClick={() => { setSelectedCategory('fastfood'); setSearchQuery(''); }} className="text-xs bg-pink-50 text-[#E11D74] px-3.5 py-1.5 rounded-full font-bold border border-pink-200 hover:bg-pink-100">🍔 Burgers</button>
                  <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="text-xs bg-gray-100 text-gray-700 px-3.5 py-1.5 rounded-full font-bold hover:bg-gray-200">Show All</button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                  {matchingProducts.slice(0, visibleProductCount).map((item) => {
                    const rest = restaurants.find(r => r.id === item.restaurantId);
                    const itemName = getItemName(item);
                    const itemDesc = getItemDesc(item);
                    const restName = rest ? getRestaurantName(rest) : t.locationMatli;
                    const cartItem = cart.items.find(ci => ci.menuItemId === item.id);
                    const quantityInCart = cartItem ? cartItem.quantity : 0;
                    const activeVariation = selectedVariations[item.id] || (item.variationTypes && item.variationTypes[0]?.options[0]);
                    const currentPrice = activeVariation ? activeVariation.price : (item.discountedPrice || item.price);

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-pink-100 shadow-2xs hover:shadow-md transition-all p-3.5 flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex gap-3">
                          {/* Item Image */}
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'}
                              alt={itemName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.emoji && (
                              <span className="absolute bottom-1 left-1 text-xs bg-black/60 px-1 py-0.5 rounded-md">
                                {item.emoji}
                              </span>
                            )}
                          </div>

                          {/* Item Meta */}
                          <div className="min-w-0 flex-1">
                            {rest && (
                              <button
                                type="button"
                                onClick={() => onSelectRestaurant(rest)}
                                className="text-[10px] font-black text-[#E11D74] hover:underline uppercase tracking-wide truncate block text-left"
                              >
                                {restName}
                              </button>
                            )}
                            <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-tight line-clamp-1 mt-0.5">
                              {itemName}
                            </h4>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              {itemDesc || 'Freshly made with authentic taste in Matli.'}
                            </p>

                            {/* Price */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="font-black text-sm text-[#E11D74]">
                                ₨ {currentPrice}
                              </span>
                              {item.discountedPrice && item.price > item.discountedPrice && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  ₨ {item.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Variation Options (if any) */}
                        {item.variationTypes && item.variationTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-pink-50">
                            {item.variationTypes[0].options.map(opt => {
                              const isSelected = activeVariation?.id === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedVariations({ ...selectedVariations, [item.id]: opt })}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                    isSelected
                                      ? 'bg-[#E11D74] text-white border-[#E11D74]'
                                      : 'bg-pink-50/50 text-gray-700 border-pink-100 hover:bg-pink-100'
                                  }`}
                                >
                                  {opt.name}: ₨ {opt.price}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-pink-100 flex items-center justify-between gap-2">
                          {rest && (
                            <button
                              type="button"
                              onClick={() => onSelectRestaurant(rest)}
                              className="text-[11px] text-gray-500 hover:text-[#E11D74] font-bold truncate flex items-center gap-1"
                            >
                              <span>View Menu</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {quantityInCart > 0 ? (
                            <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-xl px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(cartItem!.id, quantityInCart - 1)}
                                className="w-5 h-5 rounded-lg bg-white text-[#E11D74] font-black flex items-center justify-center text-xs shadow-2xs"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs text-gray-900 min-w-4 text-center">
                                {quantityInCart}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(cartItem!.id, quantityInCart + 1)}
                                className="w-5 h-5 rounded-lg bg-[#E11D74] text-white font-black flex items-center justify-center text-xs shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddToCartItem(item, rest)}
                              className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button if many products */}
                {matchingProducts.length > visibleProductCount && (
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={() => setVisibleProductCount(prev => prev + 18)}
                      className="bg-pink-50 hover:bg-pink-100 text-[#E11D74] border border-pink-200 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                    >
                      <span>Show More ({matchingProducts.length - visibleProductCount} remaining)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FEATURED RESTAURANTS & SHOPS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight flex items-center gap-2">
                <Store className="w-4 h-4 text-[#E11D74]" />
                <span>Restaurants & Stores in Matli ({filteredRestaurants.length})</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Top food hotels, fast food grills, biryani specialists and local marts.
              </p>
            </div>

            {/* Filter Toggle Pills */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-pink-200 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === 'all' ? 'bg-[#E11D74] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('top_rated')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === 'top_rated' ? 'bg-[#E11D74] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ★ Top Rated
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('deals')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === 'deals' ? 'bg-[#E11D74] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Super Deals
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRestaurants.map((rest) => {
              const isFav = favorites.includes(rest.id);
              const restName = getRestaurantName(rest);
              const restDesc = getRestaurantDesc(rest);

              return (
                <div
                  key={rest.id}
                  onClick={() => onSelectRestaurant(rest)}
                  className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative h-36 bg-pink-100 overflow-hidden">
                    <img
                      src={rest.image}
                      alt={restName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-gray-900 px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{rest.rating}</span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(rest.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-600 hover:text-rose-600 transition-colors shadow-xs"
                      title="Save to favorites"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'text-rose-600 fill-rose-600' : ''}`} />
                    </button>

                    {/* Delivery Time & Status */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[10px]">
                        <Clock className="w-3 h-3 text-pink-300" />
                        <span>{rest.deliveryTime}</span>
                      </span>

                      <span className="font-bold bg-[#E11D74] px-2 py-0.5 rounded-lg text-[10px]">
                        Fee: ₨ {rest.deliveryFee}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-[#E11D74] transition-colors leading-tight">
                        {restName}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {restDesc}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E11D74] shrink-0" />
                        <span className="truncate">{rest.area}</span>
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-pink-50 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-gray-400">
                        Min. ₨ {rest.minOrder}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = `Salam ${restName}! I am viewing your menu on Dastak Delivery Matli.`;
                            openWhatsAppChat(rest.whatsappNumber, msg);
                          }}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="WhatsApp restaurant"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-[#E11D74] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>Menu</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ANDROID APK DOWNLOAD CARD */}
        <div className="bg-gradient-to-r from-pink-900 via-rose-900 to-pink-950 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-pink-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/30 border border-pink-400/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#E11D74] px-2 py-0.5 rounded-md text-white">
                  Android App
                </span>
                <span className="text-xs sm:text-sm font-bold text-pink-100">
                  Install Dastak Delivery APK
                </span>
              </div>
              <p className="text-[11px] text-pink-200 mt-0.5">
                موبائل پر تیز آرڈرنگ، لائیو رائیڈر ٹریکنگ اور فوری نوٹیفیکیشنز حاصل کریں۔
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openApkModal}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download APK / انسٹال کریں</span>
          </button>
        </div>
      </div>

      {/* FLOATING CART BAR (WHEN CART HAS ITEMS) */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-18 left-4 right-4 max-w-md mx-auto z-40">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            type="button"
            onClick={onOpenCart}
            className="w-full bg-gradient-to-r from-[#E11D74] to-[#C2185B] text-white p-3.5 rounded-2xl shadow-xl shadow-pink-500/30 flex items-center justify-between border border-pink-300 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                {cart.items.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-medium text-pink-100 block leading-tight">
                  Your Matli Order
                </span>
                <span className="text-xs font-black block leading-tight">
                  ₨ {cart.items.reduce((s, i) => s + (i.price * i.quantity), 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black bg-white text-[#E11D74] px-3.5 py-1.5 rounded-xl shadow-xs">
              <span>View Cart</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR - MATCHING NATIVE MOBILE LAYOUT */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-lg py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 text-[#E11D74]"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Orders Tab */}
          <button
            type="button"
            onClick={() => onOpenHistory && onOpenHistory()}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-[#E11D74] relative"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-medium">Orders</span>
            {activeOrder && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-[#E11D74] animate-ping" />
            )}
          </button>

          {/* Favorites Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setActiveFilter('top_rated');
              triggerToast('Favorites', `Viewing ${favorites.length} saved restaurants`, 'info');
            }}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-[#E11D74]"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Favorites</span>
          </button>

          {/* Profile / Menu Tab */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-[#E11D74]"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
