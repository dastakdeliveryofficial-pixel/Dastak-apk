import React, { useState, useEffect } from 'react';
import { Store, Home, Bike, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  restaurantName?: string;
  restaurantArea?: string;
  customerAddress?: string;
  riderName?: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  compact?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  restaurantName = 'Al-Madina Biryani',
  restaurantArea = 'Shahi Bazaar',
  customerAddress = 'Memon Muhalla, Matli',
  riderName = 'Tariq Mehmood',
  status,
  compact = false
}) => {
  // Calculate rider animated position along route based on status
  const [riderProgress, setRiderProgress] = useState<number>(() => {
    if (status === 'placed' || status === 'confirmed') return 0.05;
    if (status === 'preparing') return 0.2;
    if (status === 'out_for_delivery') return 0.65;
    if (status === 'delivered') return 0.98;
    return 0.1;
  });

  useEffect(() => {
    if (status === 'placed' || status === 'confirmed') setRiderProgress(0.05);
    else if (status === 'preparing') setRiderProgress(0.25);
    else if (status === 'out_for_delivery') {
      setRiderProgress(0.65);
      const interval = setInterval(() => {
        setRiderProgress(prev => {
          if (prev >= 0.85) return 0.55;
          return prev + 0.06;
        });
      }, 3500);
      return () => clearInterval(interval);
    } else if (status === 'delivered') {
      setRiderProgress(0.98);
    }
  }, [status]);

  const startX = 60;
  const startY = 140;
  const endX = 340;
  const endY = 50;

  const currentX = startX + (endX - startX) * riderProgress;
  const currentY = startY + (endY - startY) * riderProgress - Math.sin(riderProgress * Math.PI) * 35;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-pink-100 bg-pink-50/20 shadow-inner ${
      compact ? 'h-48' : 'h-64 sm:h-72'
    }`}>
      {/* Map Graphic Background Simulation */}
      <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="roadGradPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D74" />
            <stop offset="100%" stopColor="#D81B60" />
          </linearGradient>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fce7f3" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Grid and Canal Water Simulation */}
        <rect width="400" height="200" fill="#fff5f8" />
        <rect width="400" height="200" fill="url(#gridPattern)" />

        {/* Phuleli Canal water line representation */}
        <path
          d="M 0,180 Q 150,150 220,190 T 400,160"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="16"
          opacity="0.3"
        />
        <text x="230" y="195" fill="#0284c7" fontSize="8" fontWeight="600" opacity="0.6">
          Phuleli Canal (پھلیلی کینال)
        </text>

        {/* Town Streets Grid */}
        <path d="M 20,40 L 380,40" stroke="#fbcfe8" strokeWidth="6" strokeLinecap="round" />
        <path d="M 40,110 L 370,110" stroke="#fbcfe8" strokeWidth="8" strokeLinecap="round" />
        <path d="M 120,10 L 120,190" stroke="#fbcfe8" strokeWidth="6" strokeLinecap="round" />
        <path d="M 260,10 L 260,190" stroke="#fbcfe8" strokeWidth="6" strokeLinecap="round" />

        {/* Street Name Labels */}
        <text x="130" y="105" fill="#be185d" fontSize="7" fontWeight="500" opacity="0.7">
          Shahi Bazaar Rd
        </text>
        <text x="270" y="35" fill="#be185d" fontSize="7" fontWeight="500" opacity="0.7">
          Hyderabad-Badin Hwy
        </text>
        <text x="15" y="130" fill="#be185d" fontSize="7" fontWeight="500" opacity="0.7">
          Station Chowk
        </text>

        {/* Active Route Path */}
        <path
          d={`M ${startX},${startY} Q 180,130 ${endX},${endY}`}
          fill="none"
          stroke="#fbcfe8"
          strokeWidth="6"
          strokeDasharray="6 4"
        />
        <path
          d={`M ${startX},${startY} Q 180,130 ${endX},${endY}`}
          fill="none"
          stroke="url(#roadGradPink)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Restaurant Marker (Point A) */}
        <circle cx={startX} cy={startY} r="16" fill="#E11D74" fillOpacity="0.2" />
        <circle cx={startX} cy={startY} r="9" fill="#E11D74" />
        <circle cx={startX} cy={startY} r="4" fill="#ffffff" />

        {/* Customer Marker (Point B) */}
        <circle cx={endX} cy={endY} r="16" fill="#10b981" fillOpacity="0.2" />
        <circle cx={endX} cy={endY} r="9" fill="#059669" />
        <circle cx={endX} cy={endY} r="4" fill="#ffffff" />

        {/* Animated Rider Marker */}
        {(status === 'out_for_delivery' || status === 'preparing') && (
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle cx="0" cy="0" r="14" fill="#E11D74" className="animate-ping" opacity="0.3" />
            <circle cx="0" cy="0" r="10" fill="#831843" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-pink-100 shadow-xs flex items-center gap-1.5 text-xs font-medium text-gray-800">
        <Store className="w-3.5 h-3.5 text-[#E11D74] shrink-0" />
        <div className="truncate max-w-[130px] sm:max-w-[180px]">
          <span className="font-semibold">{restaurantName}</span>
          <span className="block text-[10px] text-gray-400">{restaurantArea}</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-pink-100 shadow-xs flex items-center gap-1.5 text-xs font-medium text-gray-800">
        <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <div className="truncate max-w-[130px] sm:max-w-[180px]">
          <span className="font-semibold text-emerald-700">Delivery Address</span>
          <span className="block text-[10px] text-gray-400 truncate">{customerAddress}</span>
        </div>
      </div>

      {/* Rider Status Overlay Footer */}
      <div className="absolute bottom-2 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-pink-100 shadow-sm flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-[#E11D74] font-bold">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900">{riderName}</span>
              <span className="text-[10px] bg-pink-100 text-[#E11D74] font-bold px-1.5 py-0.2 rounded border border-pink-200">Rider</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {status === 'placed' && 'Order waiting for restaurant confirmation'}
              {status === 'confirmed' && 'Restaurant accepted your order'}
              {status === 'preparing' && 'Fresh food is being prepared at kitchen'}
              {status === 'out_for_delivery' && 'Rider is on the way with your order!'}
              {status === 'delivered' && 'Order delivered successfully. Enjoy your meal!'}
              {status === 'cancelled' && 'Order was cancelled'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#E11D74] bg-pink-50 border border-pink-200 px-2 py-1 rounded-lg">
          <Navigation className="w-3 h-3 animate-spin" />
          <span>Matli Route</span>
        </div>
      </div>
    </div>
  );
};
