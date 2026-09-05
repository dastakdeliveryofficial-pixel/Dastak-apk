import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, ShoppingBag, Plus, Minus, MapPin, 
  Banknote, Smartphone, MessageCircle, 
  Tag, Check, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateWhatsAppOrderMessage, openWhatsAppChat } from '../../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
  onOpenAddresses: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  onOpenAddresses
}) => {
  const { 
    cart, 
    restaurants, 
    cartSubtotal, 
    cartDeliveryFee, 
    cartTotal, 
    cartItemCount,
    updateCartQuantity, 
    clearCart,
    applyPromoCode, 
    removePromoCode, 
    setSpecialInstructions,
    addresses,
    placeOrder,
    platformSettings,
    currentUser,
    triggerToast,
    t,
    getRestaurantName,
    getItemName,
    customerOrderCount,
    language
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = addresses.find(a => a.isDefault);
    return def ? def.id : (addresses[0]?.id || '');
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa'>('cod');

  // Direct guest ordering fields (no map pin or email needed)
  const [isGuestMode, setIsGuestMode] = useState(addresses.length === 0);
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '0300-1234567');
  const [guestArea, setGuestArea] = useState('Shahi Bazaar');
  const [guestStreetAddress, setGuestStreetAddress] = useState('');
  const [guestLandmark, setGuestLandmark] = useState('');

  if (!isOpen) return null;

  const currentRestaurant = restaurants.find(r => r.id === cart.restaurantId);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const restName = currentRestaurant ? getRestaurantName(currentRestaurant) : '';

  const getEffectiveAddress = () => {
    if (isGuestMode || addresses.length === 0) {
      if (!guestStreetAddress.trim()) {
        triggerToast('Address Required', 'Please enter your street address / house in Matli', 'error');
        return null;
      }
      if (!guestPhone.trim()) {
        triggerToast('Phone Required', 'Please provide your WhatsApp phone number for the rider', 'error');
        return null;
      }
      return {
        id: 'guest-addr-' + Date.now(),
        label: 'Home' as const,
        area: guestArea,
        streetAddress: guestStreetAddress.trim(),
        landmark: guestLandmark.trim() || undefined,
        phone: guestPhone.trim(),
        isDefault: true
      };
    }
    return selectedAddress;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (!res.success) {
      triggerToast('Invalid Code', res.message, 'error');
    }
  };

  const handleCheckoutStandard = async () => {
    const addr = getEffectiveAddress();
    if (!addr) return;

    if (currentRestaurant && cartSubtotal < currentRestaurant.minOrder) {
      triggerToast('Minimum Order', `Minimum order for ${restName} is ₨ ${currentRestaurant.minOrder}`, 'warning');
      return;
    }

    try {
      const order = await placeOrder(addr, paymentMethod);
      onClose();
      if (order && order.id) {
        onOrderPlaced(order.id);
      }
    } catch (e) {
      console.error('Error placing order:', e);
    }
  };

  const handleCheckoutWhatsApp = async () => {
    const addr = getEffectiveAddress();
    if (!addr) return;

    try {
      // First place order locally to register state
      const order = await placeOrder(addr, paymentMethod);
      
      // Generate WhatsApp bill message
      const message = generateWhatsAppOrderMessage(order, 'vendor');
      
      // Target restaurant phone or platform support phone
      const targetPhone = currentRestaurant?.whatsappNumber || platformSettings.supportWhatsApp;
      openWhatsAppChat(targetPhone, message);

      onClose();
      if (order && order.id) {
        onOrderPlaced(order.id);
      }
    } catch (e) {
      console.error('Error placing order via WhatsApp:', e);
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-[#FFF5F8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#E11D74] border border-pink-200 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">{t.yourCart}</h3>
                {currentRestaurant && (
                  <p className="text-xs text-[#E11D74] font-semibold">{restName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-rose-600 font-medium px-2 py-1 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-gray-500 hover:bg-pink-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-14 h-14 text-pink-200 mx-auto mb-3" />
                <h4 className="font-bold text-base text-gray-800">{t.cartEmpty}</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Browse delicious Biryani, Burgers, BBQ & Chai from Matli's best restaurants.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  {t.exploreRestaurants}
                </button>
              </div>
            ) : (
              <>
                {/* Customer Order History Count Banner */}
                <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#E11D74] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs text-xs">
                      🛍️
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">
                        {language === 'ur'
                          ? `آپ کے ${customerOrderCount} آرڈرز ہو چکے ہیں`
                          : language === 'sd'
                          ? `توهان جا ${customerOrderCount} آرڊر ٿي چڪا آهن`
                          : `Aapke ${customerOrderCount} orders ho chuke hain`}
                      </p>
                      <p className="text-[10px] text-pink-700 font-semibold truncate">
                        Orders Placed: <strong className="text-gray-900">{customerOrderCount}</strong> {customerOrderCount > 0 ? '• Matli Foodie' : '• First Order Special'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-white text-[#E11D74] border border-pink-200 text-xs font-black px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                    #{customerOrderCount}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-pink-900/60 uppercase tracking-wider">
                    {t.orderItems} ({cartItemCount})
                  </h4>

                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 bg-pink-50/30 rounded-2xl border border-pink-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-pink-100"
                          />
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                            {item.name}
                          </h5>
                          <span className="text-xs text-gray-500">
                            ₨ {item.price} x {item.quantity} = <strong className="text-gray-900">₨ {item.price * item.quantity}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white border border-pink-200 rounded-xl p-1 shrink-0 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.menuItemId, -1)}
                          className="w-6 h-6 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-gray-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.menuItemId, 1)}
                          className="w-6 h-6 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-gray-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t.specialInstructions} (Optional)
                  </label>
                  <input
                    type="text"
                    value={cart.specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra spicy, less oil, ring doorbell..."
                    className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                </div>

                {/* Promo Code Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#E11D74]" />
                    <span>{t.promoCode}</span>
                  </label>

                  {cart.promoCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Code <strong>{cart.promoCode}</strong> applied (-₨ {cart.discount})</span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-gray-400 hover:text-rose-600 text-xs font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Try MATLI20 or FREESHIP"
                        className="flex-1 text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74] uppercase"
                      />
                      <button
                        type="submit"
                        className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                      >
                        {t.apply}
                      </button>
                    </form>
                  )}
                </div>

                {/* Delivery Address Selector */}
                <div className="space-y-2.5 pt-2 border-t border-pink-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E11D74]" />
                      <span>{t.deliveryAddress}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsGuestMode(!isGuestMode)}
                        className="text-[11px] font-bold text-[#E11D74] hover:underline"
                      >
                        {isGuestMode ? 'Use Saved Address' : 'Enter Address / Phone'}
                      </button>
                    </div>
                  </div>

                  {isGuestMode || addresses.length === 0 ? (
                    <div className="bg-pink-50/50 p-3.5 rounded-2xl border border-pink-200 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-950">
                          Matli Delivery Info (No Map Location Required)
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-[#E11D74] font-bold border border-pink-200">
                          Direct Order
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Asad Khan"
                          className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">
                          WhatsApp / Contact Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="0300-1234567"
                          className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">
                            Matli Area
                          </label>
                          <select
                            value={guestArea}
                            onChange={(e) => setGuestArea(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                          >
                            <option value="Shahi Bazaar">Shahi Bazaar</option>
                            <option value="Station Road">Station Road</option>
                            <option value="Memon Colony">Memon Colony</option>
                            <option value="Tando Ghulam Ali Road">Tando Ghulam Ali Road</option>
                            <option value="Gulshan-e-Mustafa">Gulshan-e-Mustafa</option>
                            <option value="Civil Hospital Road">Civil Hospital Road</option>
                            <option value="Other Matli Area">Other Matli Area</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">
                            Nearby Landmark
                          </label>
                          <input
                            type="text"
                            value={guestLandmark}
                            onChange={(e) => setGuestLandmark(e.target.value)}
                            placeholder="e.g. Near PSO Pump"
                            className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">
                          Full Street Address / House No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestStreetAddress}
                          onChange={(e) => setGuestStreetAddress(e.target.value)}
                          placeholder="e.g. House #12, Street 4, Behind Madina Masjid"
                          className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            selectedAddressId === addr.id
                              ? 'bg-pink-50/60 border-[#E11D74]'
                              : 'bg-white border-pink-100 hover:bg-pink-50/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery_address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-0.5 text-[#E11D74] focus:ring-[#E11D74]"
                          />
                          <div className="text-xs min-w-0">
                            <span className="font-bold text-gray-900">{addr.label} ({addr.area})</span>
                            <p className="text-gray-400 text-[11px] truncate">{addr.streetAddress}</p>
                            <span className="text-[10px] text-gray-400">Phone: {addr.phone}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>


                {/* Payment Methods */}
                <div className="space-y-2 pt-2 border-t border-pink-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t.paymentMethod}
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'bg-pink-50 border-[#E11D74] text-gray-900 shadow-xs'
                          : 'bg-white border-pink-100 text-gray-600 hover:bg-pink-50/40'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold block">{t.cod}</span>
                      <span className="text-[10px] text-gray-400">Pay on arrival</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('jazzcash')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'jazzcash'
                          ? 'bg-rose-50 border-rose-500 text-gray-900 shadow-xs'
                          : 'bg-white border-pink-100 text-gray-600 hover:bg-pink-50/40'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-rose-600 mb-1" />
                      <span className="text-xs font-bold block">{t.jazzcash}</span>
                      <span className="text-[10px] text-gray-400">Direct wallet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'easypaisa'
                          ? 'bg-emerald-50 border-emerald-500 text-gray-900 shadow-xs'
                          : 'bg-white border-pink-100 text-gray-600 hover:bg-pink-50/40'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold block">{t.easypaisa}</span>
                      <span className="text-[10px] text-gray-400">Mobile account</span>
                    </button>
                  </div>

                  {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                    <div className="p-2.5 bg-pink-50/50 rounded-xl border border-pink-200 text-xs space-y-1">
                      <p className="font-semibold text-gray-800">
                        {paymentMethod === 'jazzcash' ? 'JazzCash Account:' : 'EasyPaisa Account:'}
                      </p>
                      <p className="font-mono text-gray-900 bg-white p-1.5 rounded-lg border border-pink-200 font-bold">
                        {paymentMethod === 'jazzcash' ? platformSettings.jazzCashAccount : platformSettings.easyPaisaAccount}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Send payment and keep screenshot / Trx ID ready for the rider.
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown Bill */}
                <div className="bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{t.subtotal}</span>
                    <span className="font-semibold text-gray-900">₨ {cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.deliveryFee} ({currentRestaurant?.area || 'Matli'})</span>
                    <span className="font-semibold text-gray-900">₨ {cartDeliveryFee}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{t.discount}</span>
                      <span>- ₨ {cart.discount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-pink-200 flex justify-between items-baseline font-bold text-sm text-gray-900">
                    <span>{t.grandTotal}</span>
                    <span className="text-base font-black text-[#E11D74]">₨ {cartTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Action Buttons */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-pink-100 bg-white space-y-2">
              {/* WhatsApp Checkout Button */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.orderViaWhatsApp}</span>
              </button>

              {/* Standard App Checkout */}
              <button
                onClick={handleCheckoutStandard}
                className="w-full bg-gradient-to-r from-[#E11D74] to-[#D81B60] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.placeOrder} • ₨ {cartTotal}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
