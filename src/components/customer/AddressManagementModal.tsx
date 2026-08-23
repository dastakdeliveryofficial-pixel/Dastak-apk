import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, MapPin, Plus, Trash2, Check, Home, Briefcase, Building 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MATLI_AREAS } from '../../data/mockData';

interface AddressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressManagementModal: React.FC<AddressManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addresses, addAddress, deleteAddress, setDefaultAddress, currentUser, t } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Shop' | 'Work' | 'Other'>('Home');
  const [area, setArea] = useState<string>(MATLI_AREAS[0]);
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState(currentUser.phone || '0300-9876543');
  const [isDefault, setIsDefault] = useState(true);

  if (!isOpen) return null;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim()) return;

    addAddress({
      label,
      area,
      streetAddress: streetAddress.trim(),
      landmark: landmark.trim() || undefined,
      phone: phone.trim(),
      isDefault
    });

    setIsAdding(false);
    setStreetAddress('');
    setLandmark('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-pink-100 overflow-hidden max-h-[85vh] flex flex-col text-[#1F2937]"
      >
        {/* Header */}
        <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-[#FFF5F8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#E11D74] border border-pink-200 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">{t.savedAddresses}</h3>
              <p className="text-xs text-gray-400">Matli delivery locations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isAdding ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-pink-900/60 uppercase tracking-wider">
                  Your Addresses ({addresses.length})
                </span>
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <MapPin className="w-12 h-12 text-pink-200 mx-auto mb-2" />
                  <p className="font-bold text-gray-700 text-sm">No addresses saved</p>
                  <p className="text-xs text-gray-400 mt-1">Add your home or shop in Matli for quick ordering.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        addr.isDefault
                          ? 'bg-pink-50/40 border-[#E11D74]'
                          : 'bg-white border-pink-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-7 h-7 rounded-lg bg-pink-100 text-[#E11D74] flex items-center justify-center">
                            {addr.label === 'Home' ? <Home className="w-3.5 h-3.5" /> :
                             addr.label === 'Shop' ? <Building className="w-3.5 h-3.5" /> :
                             addr.label === 'Work' ? <Briefcase className="w-3.5 h-3.5" /> :
                             <MapPin className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{addr.label}</span>
                              <span className="text-[10px] bg-pink-100 text-[#E11D74] font-semibold px-2 py-0.2 rounded-full">
                                {addr.area}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{addr.streetAddress}</p>
                            {addr.landmark && (
                              <p className="text-[11px] text-gray-400">Landmark: {addr.landmark}</p>
                            )}
                            <p className="text-[11px] text-gray-500 mt-0.5">Phone: {addr.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!addr.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[11px] font-semibold text-[#E11D74] hover:underline px-2 py-1"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmitNew} className="space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-pink-100">
                <span className="font-bold text-xs text-gray-800">Add New Address in Matli</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              {/* Label tags */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Address Label</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Home', 'Shop', 'Work', 'Other'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`text-xs py-1.5 rounded-xl font-bold border transition-colors ${
                        label === l
                          ? 'bg-[#E11D74] text-white border-[#E11D74]'
                          : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Matli Area / Sector</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                >
                  {MATLI_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. House #14, Street 3, Near Ghalla Mandi"
                  className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Masjid, Behind PSO Pump"
                  className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                />
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-[#E11D74] focus:ring-[#E11D74]"
                />
                <span>Set as default delivery address</span>
              </label>

              <button
                type="submit"
                className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors"
              >
                Save Address
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
