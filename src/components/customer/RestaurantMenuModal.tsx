import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Star, Clock, MapPin, Phone, MessageCircle, 
  ShoppingBag, Plus, Minus, Check, Flame, Sparkles, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem } from '../../types';
import { openWhatsAppChat } from '../../utils/whatsapp';

interface RestaurantMenuModalProps {
  restaurant: Restaurant | null;
  onBack?: () => void;
  onClose?: () => void;
  onOpenCart: () => void;
}

export const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({
  restaurant,
  onBack,
  onClose,
  onOpenCart
}) => {
  const handleBack = onBack || onClose || (() => {});

  if (!restaurant) {
    return null;
  }

  const { 
    menuItems, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    cartSubtotal, 
    cartItemCount, 
    cartTotal,
    triggerToast,
    t,
    getRestaurantName,
    getRestaurantDesc,
    getItemName,
    getItemDesc
  } = useApp();

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchItem, setSearchItem] = useState<string>('');
  const [selectedVariations, setSelectedVariations] = useState<Record<string, { name: string; price: number }>>({});

  const restName = getRestaurantName(restaurant);
  const restDesc = getRestaurantDesc(restaurant);

  const restaurantMenu = menuItems.filter(item => item.restaurantId === restaurant.id);

  // Extract unique categories available in this restaurant
  const availableCategories = Array.from(new Set(restaurantMenu.map(i => i.category)));

  const filteredItems = restaurantMenu.filter(item => {
    if (selectedCat !== 'all' && item.category !== selectedCat) return false;
    if (searchItem.trim()) {
      const q = searchItem.toLowerCase();
      const localizedName = getItemName(item).toLowerCase();
      const localizedDesc = getItemDesc(item).toLowerCase();
      return localizedName.includes(q) || 
             localizedDesc.includes(q) ||
             item.name.toLowerCase().includes(q);
    }
    return true;
  });

  const isCartFromThisRestaurant = cart.restaurantId === restaurant.id && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-[#FFF5F8] pb-28 text-[#1F2937]">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100 px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-[#E11D74] font-semibold text-xs bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* WhatsApp Direct Chat with Restaurant */}
          <button
            onClick={() => {
              const msg = `Salam ${restName}! I am viewing your menu on Dastak Delivery Matli.`;
              openWhatsAppChat(restaurant.whatsappNumber, msg);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Hotel</span>
          </button>

          {isCartFromThisRestaurant && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.cart} ({cartItemCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Restaurant Header Banner */}
      <div className="relative bg-gray-900 text-white">
        <div className="h-48 sm:h-64 w-full overflow-hidden relative">
          <img
            src={restaurant.image}
            alt={restName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 pb-6">
          <div className="bg-white text-gray-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-pink-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    restaurant.isOpen ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {restaurant.isOpen ? `● ${t.open}` : t.closed}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{restaurant.openingHours}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 tracking-tight">
                  {restName}
                </h1>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1 text-gray-900 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{restaurant.rating}</span>
                    <span className="text-gray-400 font-normal">({restaurant.reviewsCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E11D74]" />
                    <span className="text-gray-500">{restaurant.address}, {restaurant.area}, Matli</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{restaurant.phone}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 max-w-2xl leading-relaxed">
                  {restDesc}
                </p>
              </div>

              {/* Delivery Stats Badge */}
              <div className="bg-pink-50/50 p-3.5 rounded-xl border border-pink-100 flex sm:flex-col justify-between items-center sm:items-start gap-3 sm:min-w-[150px]">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">{t.deliveryTime}</span>
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#E11D74]" />
                    {restaurant.deliveryTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">{t.minOrder}</span>
                  <span className="text-xs font-bold text-gray-800">₨ {restaurant.minOrder}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">{t.deliveryFee}</span>
                  <span className="text-xs font-bold text-emerald-600">₨ {restaurant.deliveryFee}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Bar & Search */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat('all')}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
                selectedCat === 'all'
                  ? 'bg-[#E11D74] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50'
              }`}
            >
              {t.all} ({restaurantMenu.length})
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-colors capitalize whitespace-nowrap ${
                  selectedCat === cat
                    ? 'bg-[#E11D74] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-pink-100 hover:bg-pink-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search Item */}
          <input
            type="text"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="text-xs bg-white border border-pink-200 rounded-xl px-3.5 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E11D74] w-full sm:w-60 shadow-2xs"
          />
        </div>

        {/* Menu Items List */}
        <div className="space-y-4 pt-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-pink-100 p-6">
              <AlertCircle className="w-8 h-8 text-pink-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">No dishes found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const cartItem = cart.items.find(i => i.menuItemId === item.id);
                const quantityInCart = cartItem ? cartItem.quantity : 0;
                const itemName = getItemName(item);
                const itemDesc = getItemDesc(item);

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 border transition-all flex gap-4 ${
                      item.isAvailable
                        ? 'border-pink-100 shadow-sm hover:border-pink-200'
                        : 'border-pink-100 opacity-60 bg-pink-50/20'
                    }`}
                  >
                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isFeatured && (
                            <span className="text-[9px] font-bold bg-pink-50 text-[#E11D74] border border-pink-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Popular
                            </span>
                          )}
                          {item.isCombo && (
                            <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Deal
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-gray-900 mt-1 flex items-center gap-1.5 flex-wrap">
                          {item.emoji && <span className="text-base shrink-0">{item.emoji}</span>}
                          <span>{itemName}</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {itemDesc}
                        </p>

                        {item.comboItems && (
                          <div className="mt-2 text-[11px] text-gray-600 bg-pink-50/50 p-1.5 rounded-lg border border-pink-100">
                            {item.comboItems.join(' • ')}
                          </div>
                        )}

                        {/* Variations Selection if available */}
                        {item.variationTypes && item.variationTypes.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            {item.variationTypes.map((vt, vidx) => {
                              const activeOption = selectedVariations[item.id] || vt.options[0];
                              return (
                                <div key={vidx} className="space-y-1">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{vt.type}:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {vt.options.map((opt, oidx) => {
                                      const isSelected = activeOption?.name === opt.name;
                                      return (
                                        <button
                                          key={oidx}
                                          type="button"
                                          onClick={() => setSelectedVariations(prev => ({ ...prev, [item.id]: opt }))}
                                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold border transition-all ${
                                            isSelected
                                              ? 'bg-[#E11D74] text-white border-[#E11D74] shadow-xs'
                                              : 'bg-white text-gray-700 border-pink-200 hover:bg-pink-50'
                                          }`}
                                        >
                                          {opt.name} · ₨ {opt.price}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Add to Cart Controls */}
                      {(() => {
                        const activeVariation = selectedVariations[item.id] || (item.variationTypes?.[0]?.options?.[0]);
                        const currentPrice = activeVariation ? activeVariation.price : (item.discountedPrice || item.price);
                        return (
                          <div className="flex items-center justify-between pt-3 mt-2 border-t border-pink-100">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-black text-gray-900">
                                  ₨ {currentPrice}
                                </span>
                                {item.discountedPrice && !activeVariation && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₨ {item.price}
                                  </span>
                                )}
                              </div>
                              {activeVariation && (
                                <span className="text-[9px] text-[#E11D74] font-semibold block">
                                  {activeVariation.name}
                                </span>
                              )}
                            </div>

                            {/* Quantity / Add Button */}
                            <div>
                              {!item.isAvailable ? (
                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                  Sold Out
                                </span>
                              ) : quantityInCart > 0 ? (
                                <div className="flex items-center gap-2 bg-pink-950 text-white rounded-xl px-2 py-1 shadow-xs">
                                  <button
                                    onClick={() => updateCartQuantity(item.id, -1)}
                                    className="w-6 h-6 rounded-lg bg-pink-900 hover:bg-pink-800 flex items-center justify-center text-pink-300 font-bold transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center">{quantityInCart}</span>
                                  <button
                                    onClick={() => updateCartQuantity(item.id, 1)}
                                    className="w-6 h-6 rounded-lg bg-pink-900 hover:bg-pink-800 flex items-center justify-center text-pink-300 font-bold transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    addToCart(restaurant, item, 1, activeVariation);
                                  }}
                                  className="bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{t.add}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Item Image */}
                    <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-pink-50 border border-pink-100 relative">
                      <img
                        src={item.image}
                        alt={itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {isCartFromThisRestaurant && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40"
          >
            <div className="bg-gradient-to-r from-pink-950 to-pink-900 text-white rounded-2xl p-3.5 shadow-xl border border-pink-800/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E11D74] text-white flex items-center justify-center font-bold text-xs">
                  {cartItemCount}
                </div>
                <div>
                  <span className="text-[10px] text-pink-300 block font-medium">{t.totalBill}</span>
                  <span className="text-sm font-black text-white">₨ {cartTotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCart}
                  className="bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>{t.checkout}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
