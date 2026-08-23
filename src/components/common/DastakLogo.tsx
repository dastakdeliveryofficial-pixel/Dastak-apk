import React from 'react';

interface DastakLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'full';
}

export const DastakLogo: React.FC<DastakLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'badge'
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official 3D Badge with Pink, Gold Crown, 3D Dastak Text & Scooter Rider */}
      <div 
        className={`${sizeClasses[size]} shrink-0 rounded-2xl bg-[#E11D74] shadow-md shadow-pink-500/25 flex items-center justify-center relative overflow-hidden border border-pink-300/40 p-0.5`}
      >
        <img 
          src="dastak-logo.png" 
          alt="Dastak Delivery Logo" 
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            // If image fails to load, fallback to SVG
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.nextElementSibling) {
              (target.nextElementSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
        {/* Fallback Vector Badge */}
        <div className="hidden w-full h-full flex-col items-center justify-between p-1 bg-linear-to-br from-[#E11D74] via-[#D81B60] to-[#AD1457]">
          {/* Crown */}
          <svg viewBox="0 0 24 24" className="w-5 h-auto text-amber-300 fill-current drop-shadow-xs" stroke="none">
            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM5 19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V18H5V19Z" />
          </svg>
          <span className="text-white font-black text-[9px] tracking-tight uppercase leading-none">
            DASTAK
          </span>
          {/* Scooter Rider */}
          <svg viewBox="0 0 24 24" className="w-5 h-auto text-amber-300 fill-current drop-shadow-xs" stroke="none">
            <path d="M19 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-1.8 11a3 3 0 1 1-5.7-1.5l1.4-2.5H10l-1.3 2.5a3 3 0 1 1-5.7-1.5l2-3.8c.2-.4.6-.7 1.1-.7h3.8l1.4-2.5H8.5a1 1 0 0 1 0-2h4.2c.7 0 1.3.4 1.6 1l1.7 3.1h2.2c.6 0 1 .4 1 1s-.4 1-1 1h-1.6l-1 1.8A3 3 0 0 1 17.2 18z"/>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base sm:text-xl tracking-tight text-gray-900 leading-none">
              <span className="text-[#E11D74]">Dastak</span>{' '}
              <span className="text-gray-900 font-extrabold">Delivery</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-bold tracking-widest text-[#E11D74] uppercase">
              Matli • دستک ڈیلیوری
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
