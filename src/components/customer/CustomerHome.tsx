import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Star, Clock, ShoppingBag, Flame, Sparkles, 
  MapPin, Percent, ChevronRight, Check, Utensils, MessageCircle,
  Store, Bike, KeyRound, UserPlus, Download, Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem } from '../../types';
import { openWhatsAppChat } from '../../utils/whatsapp';

interface CustomerHomeProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onOpenCart: () => void;
  onTrackOrder?: (orderId: string) => void;
  onOpenHistory?: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectRestaurant,
  onOpenCart,
  onTrackOrder,
  onOpenHistory
}) => {
  const { 
    restaurants, 
    categories, 
    bannerPromos, 
    menuItems, 
    orders,
    currentUser,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    addToCart,
    applyPromoCode,
    openLoginModal,
    triggerToast,
    language,
    t,
    getRestaurantName,
    getRestaurantDesc,
    getItemName,
    getItemDesc,
    getCategoryName,
    getPromoContent,
    openApkModal
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'top_rated' | 'low_fee' | 'deals'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Active customer order for live tracking
  const activeOrder = orders.find(
    o => (o.customerId === currentUser?.id || (currentUser?.phone && o.customerPhone === currentUser?.phone)) &&
         o.status !== 'delivered' && o.status !== 'cancelled'
  );

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = restaurant.name.toLowerCase().includes(q) || 
        (restaurant.nameUrdu && restaurant.nameUrdu.includes(q)) ||
        (restaurant.nameSindhi && restaurant.nameSindhi.includes(q));
      const matchArea = restaurant.area.toLowerCase().includes(q);
      const matchCategory = restaurant.categories.some(c => c.toLowerCase().includes(q));
      
      // Also match if restaurant sells item matching query
      const matchingItems = menuItems.filter(
        item => item.restaurantId === restaurant.id && (
          item.name.toLowerCase().includes(q) ||
          (item.nameUrdu && item.nameUrdu.includes(q)) ||
          (item.nameSindhi && item.nameSindhi.includes(q)) ||
          item.category.toLowerCase().includes(q)
        )
      );
      
      if (!matchName && !matchArea && !matchCategory && matchingItems.length === 0) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory) {
      if (selectedCategory === 'deals') {
        if (!restaurant.categories.includes('deals')) return false;
      } else if (!restaurant.categories.includes(selectedCategory)) {
        return false;
      }
    }

    // Quick sub-filter
    if (activeFilter === 'top_rated' && restaurant.rating < 4.7) return false;
    if (activeFilter === 'low_fee' && restaurant.deliveryFee > 50) return false;
    if (activeFilter === 'deals' && !restaurant.categories.includes('deals')) return false;

    return true;
  });

  // Featured Deals from across Matli restaurants
  const comboDeals = menuItems.filter(item => item.isCombo || item.discountedPrice);

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    applyPromoCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F8] pb-24 text-[#1F2937]">
      {/* Mobile-Friendly Search & Hero Section */}
      <div className="bg-white border-b border-pink-100 px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[#E11D74] text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> {t.heroTagline}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
                {t.heroTitle} <span className="text-[#E11D74]">{t.locationMatli}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-3 bg-pink-50/60 border border-pink-200 px-3.5 py-2 rounded-2xl">
              <Clock className="w-4 h-4 text-[#E11D74]" />
              <div className="text-xs">
                <span className="font-bold block text-gray-800">{t.avgDelivery}</span>
                <span className="text-gray-500 text-[11px]">{t.avgDeliveryTime}</span>
              </div>
            </div>
          </div>

          {/* Active Order Live Tracking Banner */}
          {activeOrder && (
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => onTrackOrder && onTrackOrder(activeOrder.id)}
              className="bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#AD1457] text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border border-pink-300 flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0 border border-white/30">
                  <Bike className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-white text-[#E11D74] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
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
                    Est. Time: {activeOrder.estimatedDeliveryTime || '20-30 min'} • Tap to view live rider map & tracking
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTrackOrder) onTrackOrder(activeOrder.id);
                  }}
                  className="bg-white text-[#E11D74] font-black text-xs px-3.5 py-2 rounded-xl shadow-xs hover:bg-pink-50 transition-colors flex items-center gap-1"
                >
                  <span>Track Live</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Search Input Bar */}
          <div className="relative pt-1">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-pink-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-10 py-3 bg-pink-50/40 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E11D74] focus:bg-white border border-pink-200 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 p-1 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Hero Promotional Banners */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            {bannerPromos.map((promo) => {
              const localized = getPromoContent(promo);
              return (
                <div
                  key={promo.id}
                  className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r ${promo.bgGradient} text-white shadow-sm flex items-center justify-between gap-3 border border-white/15`}
                >
                  <div className="relative z-10 max-w-[70%]">
                    <div className="inline-flex items-center gap-1 bg-black/25 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1">
                      <Percent className="w-3 h-3 text-pink-200" /> {promo.discountPercent}% {t.discount}
                    </div>
                    <h2 className="font-bold text-sm sm:text-base leading-tight">{localized.title}</h2>
                    <p className="text-[11px] text-white/90 mt-0.5 line-clamp-1">{localized.subtitle}</p>
                    
                    <button
                      onClick={() => handleCopyPromo(promo.code)}
                      className="mt-2.5 inline-flex items-center gap-1 bg-white text-[#E11D74] hover:bg-pink-50 font-bold text-[10px] px-3 py-1 rounded-full shadow-xs transition-colors"
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{t.applied}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.useCode}: {promo.code}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <img
                    src={promo.image}
                    alt={localized.title}
                    className="w-18 h-18 object-cover rounded-xl shadow-xs shrink-0 border border-white/30"
                  />
                </div>
              );
            })}
          </div>

          {/* Android APK Download Card Banner */}
          <div className="pt-2">
            <div className="bg-linear-to-r from-pink-900 via-rose-900 to-pink-950 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-pink-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-pink-500/30 border border-pink-400/40 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-pink-300" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#E11D74] px-2 py-0.5 rounded-md text-white">
                      Android .APK
                    </span>
                    <span className="text-xs font-bold text-pink-200">Dastak Delivery Mobile App</span>
                  </div>
                  <p className="text-[11px] text-pink-100/90 mt-0.5">
                    موبائل پر تیز آرڈرنگ، لائیو رائیڈر ٹریکنگ اور فوری نوٹیفیکیشنز حاصل کریں۔
                  </p>
                </div>
              </div>

              <button
                onClick={openApkModal}
                className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download APK / انسٹال کریں</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-xs text-[#E11D74] uppercase tracking-widest flex items-center gap-2">
                <span>{t.categories}</span>
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{t.categoriesSubtitle}</p>
            </div>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-[#E11D74] hover:underline"
              >
                {t.resetFilter}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catName = getCategoryName(cat);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`group relative rounded-2xl p-3 border transition-all text-left flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#E11D74] to-[#D81B60] text-white border-[#E11D74] shadow-md shadow-pink-500/20'
                      : 'bg-white text-gray-800 border-pink-100 hover:border-[#E11D74] hover:shadow-xs'
                  }`}
                >
                  <div className="relative z-10">
                    <span className="text-xs font-bold block tracking-tight line-clamp-1">{catName}</span>
                  </div>

                  <div className="mt-2.5 relative w-full h-16 rounded-xl overflow-hidden shadow-inner bg-pink-50">
                    <img
                      src={cat.image}
                      alt={catName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Super Combo Deals Section (Special for Matli users) */}
        {!searchQuery && !selectedCategory && comboDeals.length > 0 && (
          <div className="bg-white rounded-2xl border border-pink-100 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-pink-50 text-[#E11D74] px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" /> {t.dealsSection}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {t.dealsSubtitle}
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                Special savings on multi-item orders
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comboDeals.slice(0, 3).map((deal) => {
                const rest = restaurants.find(r => r.id === deal.restaurantId);
                const dealName = getItemName(deal);
                const dealDesc = getItemDesc(deal);
                const restName = rest ? getRestaurantName(rest) : t.locationMatli;

                return (
                  <div
                    key={deal.id}
                    className="bg-pink-50/30 rounded-xl p-3.5 border border-pink-100 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={deal.image}
                        alt={dealName}
                        className="w-18 h-18 rounded-lg object-cover shrink-0 border border-pink-100"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-[#E11D74] bg-pink-100/60 px-1.5 py-0.5 rounded">
                          {restName}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1">{dealName}</h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{dealDesc}</p>
                      </div>
                    </div>

                    {deal.comboItems && deal.comboItems.length > 0 && (
                      <div className="bg-white p-2 rounded-lg border border-pink-100 text-[10px] text-gray-600 space-y-0.5">
                        <span className="font-bold text-gray-700 block">Includes:</span>
                        <div className="flex flex-wrap gap-1">
                          {deal.comboItems.map((ci, idx) => (
                            <span key={idx} className="bg-pink-50/50 px-1.5 py-0.5 rounded border border-pink-100 text-gray-600">
                              • {ci}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-pink-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-gray-900">₨ {deal.discountedPrice || deal.price}</span>
                          {deal.discountedPrice && (
                            <span className="text-[10px] text-gray-400 line-through">₨ {deal.price}</span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400">Prep: {deal.preparationTime || '15 min'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {rest && (
                          <button
                            onClick={() => onSelectRestaurant(rest)}
                            className="text-xs font-semibold text-gray-600 hover:text-[#E11D74] px-2 py-1"
                          >
                            {t.viewMenu}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (rest) {
                              addToCart(rest, deal, 1);
                            }
                          }}
                          className="bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t.addToCart}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Restaurant Listings Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-bold text-xs text-[#E11D74] uppercase tracking-widest flex items-center gap-2">
                <span>{t.restaurants}</span>
                <span className="text-[10px] bg-pink-100 text-[#E11D74] font-bold px-2 py-0.5 rounded-full lowercase">
                  {filteredRestaurants.length} in matli
                </span>
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{t.restaurantsSubtitle}</p>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#E11D74] text-white'
                    : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setActiveFilter('top_rated')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 ${
                  activeFilter === 'top_rated'
                    ? 'bg-[#E11D74] text-white'
                    : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{t.topRated} (4.7+)</span>
              </button>
              <button
                onClick={() => setActiveFilter('low_fee')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${
                  activeFilter === 'low_fee'
                    ? 'bg-[#E11D74] text-white'
                    : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {t.lowDeliveryFee} (≤ ₨ 50)
              </button>
            </div>
          </div>

          {/* Restaurant Grid Cards */}
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-pink-100 shadow-sm p-8">
              <Utensils className="w-10 h-10 text-pink-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-800">{t.noRestaurants}</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                No food point matches your current search or category filter. Try clearing filters or searching for "Biryani".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setActiveFilter('all');
                }}
                className="mt-4 bg-[#E11D74] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                Show All Matli Restaurants
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRestaurants.map((restaurant) => {
                const restItems = menuItems.filter(i => i.restaurantId === restaurant.id);
                const restName = getRestaurantName(restaurant);
                const restDesc = getRestaurantDesc(restaurant);

                return (
                  <motion.div
                    key={restaurant.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white rounded-2xl border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 transition-all overflow-hidden flex flex-col justify-between group p-3.5"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-pink-50 cursor-pointer" onClick={() => onSelectRestaurant(restaurant)}>
                        <img
                          src={restaurant.image}
                          alt={restName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Open/Closed Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          {restaurant.isOpen ? (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              {t.open}
                            </span>
                          ) : (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                              {t.closed}
                            </span>
                          )}
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2.5 right-2.5 bg-white/95 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{restaurant.rating}</span>
                          <span className="text-gray-400 font-normal">({restaurant.reviewsCount})</span>
                        </div>

                        {/* Area Tag */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                          <div className="flex items-center gap-1 drop-shadow-md">
                            <MapPin className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                            <span className="font-semibold text-[11px] truncate">{restaurant.area}</span>
                          </div>
                          <span className="text-[10px] bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded font-medium">
                            {restaurant.deliveryTime}
                          </span>
                        </div>
                      </div>

                      {/* Info & Categories */}
                      <div className="pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="cursor-pointer" onClick={() => onSelectRestaurant(restaurant)}>
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#E11D74] transition-colors">
                              {restName}
                            </h3>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {restDesc}
                        </p>

                        {/* Highlights & Min Order */}
                        <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between text-[11px] text-gray-600">
                          <div>
                            <span className="text-gray-400 block text-[9px]">{t.minOrder}</span>
                            <span className="font-bold text-gray-900">₨ {restaurant.minOrder}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">{t.deliveryFee}</span>
                            <span className="font-bold text-emerald-600">₨ {restaurant.deliveryFee}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">Menu</span>
                            <span className="font-bold text-gray-900">{restItems.length} items</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 flex items-center gap-2">
                      <button
                        onClick={() => onSelectRestaurant(restaurant)}
                        className="flex-1 bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-bold text-xs py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <span>{t.viewMenu}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp Direct Chat */}
                      <button
                        onClick={() => {
                          const msg = `Salam ${restName}! I am looking at your menu on Dastak Delivery Matli.`;
                          openWhatsAppChat(restaurant.whatsappNumber, msg);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2 rounded-xl transition-colors shrink-0"
                        title="Chat with Restaurant on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Partner & Portal Onboarding Cards */}
          <div className="mt-12 pt-8 border-t border-pink-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Customer Portal
                </span>
                <h4 className="text-base font-bold">Sign In or Create Account</h4>
                <p className="text-xs text-pink-100 mt-1">
                  Save addresses in Matli, track orders live, and view order history.
                </p>
              </div>
              <button
                onClick={() => openLoginModal('customer')}
                className="mt-4 w-full py-2.5 bg-white text-[#E11D74] font-bold rounded-xl text-xs hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Customer Login / Register</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Hotel & Shop Owners
                </span>
                <h4 className="text-base font-bold">Register Your Shop in Matli</h4>
                <p className="text-xs text-amber-100 mt-1">
                  Get your own Shop ID, upload food items, set prices & receive instant orders.
                </p>
              </div>
              <button
                onClick={() => openLoginModal('vendor')}
                className="mt-4 w-full py-2.5 bg-white text-amber-800 font-bold rounded-xl text-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Vendor Login & + Add Shop ID</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Delivery Fleet
                </span>
                <h4 className="text-base font-bold">Join as a Matli Rider</h4>
                <p className="text-xs text-emerald-100 mt-1">
                  Deliver food with your motorcycle or loader in Matli and earn daily income.
                </p>
              </div>
              <button
                onClick={() => openLoginModal('rider')}
                className="mt-4 w-full py-2.5 bg-white text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <Bike className="w-4 h-4" />
                <span>Rider Sign In / Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
