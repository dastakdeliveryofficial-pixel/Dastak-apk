import React from 'react';

interface DastakLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const DastakLogo: React.FC<DastakLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Pink Brand Badge matching WhatsApp DP */}
      <div 
        className={`${sizeClasses[size]} shrink-0 rounded-2xl bg-gradient-to-br from-[#E11D74] via-[#D81B60] to-[#AD1457] p-1.5 shadow-md shadow-pink-500/20 flex flex-col items-center justify-between relative overflow-hidden border border-pink-400/30`}
      >
        {/* Crown Icon */}
        <svg viewBox="0 0 24 24" className="w-2/5 h-auto text-amber-300 drop-shadow-xs fill-current" stroke="none">
          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM5 19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V18H5V19Z" />
        </svg>

        {/* 3D "Dastak" Lettering in miniature */}
        <span className="text-white font-black tracking-tight leading-none text-[8px] sm:text-[9px] drop-shadow-sm uppercase">
          DASTAK
        </span>

        {/* Speeding Bike Scooter */}
        <svg viewBox="0 0 24 24" className="w-1/2 h-auto text-amber-300 fill-current drop-shadow-xs" stroke="none">
          <path d="M19 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-1.8 11a3 3 0 1 1-5.7-1.5l1.4-2.5H10l-1.3 2.5a3 3 0 1 1-5.7-1.5l2-3.8c.2-.4.6-.7 1.1-.7h3.8l1.4-2.5H8.5a1 1 0 0 1 0-2h4.2c.7 0 1.3.4 1.6 1l1.7 3.1h2.2c.6 0 1 .4 1 1s-.4 1-1 1h-1.6l-1 1.8A3 3 0 0 1 17.2 18z"/>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900 flex items-center gap-1">
              <span className="text-[#E11D74]">Dastak</span>
              <span className="text-gray-800">Delivery</span>
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-[#E11D74] uppercase flex items-center gap-1">
            <span className="h-0.5 w-2 bg-[#E11D74] rounded-full inline-block"></span>
            Matli, Sindh
            <span className="h-0.5 w-2 bg-[#E11D74] rounded-full inline-block"></span>
          </span>
        </div>
      )}
    </div>
  );
};
