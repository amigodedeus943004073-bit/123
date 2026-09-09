import React from 'react';

interface SMVMLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  onClick?: () => void;
}

export const SMVMLogo: React.FC<SMVMLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'text-slate-900',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'h-7 px-1 rounded-md',
    sm: 'h-9 px-1.5 rounded-lg',
    md: 'h-11 px-2 rounded-xl',
    lg: 'h-14 px-2.5 rounded-xl',
    xl: 'h-20 px-3 rounded-2xl',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      title="Logótipo Oficial SMVM - Salomão Muanjita Vinene Moises"
    >
      <div
        className={`${sizeClasses} relative bg-transparent flex items-center justify-center overflow-hidden shrink-0 transition-transform ${
          onClick ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        <img
          src="/smvm-logo.png"
          alt="Logótipo Oficial Salomão Muanjita Vinene Moises (SMVM)"
          className="h-full w-auto max-h-full object-contain select-none filter drop-shadow-xs"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.includes('smvm-logo.svg')) {
              img.src = '/smvm-logo.svg';
            } else if (!img.src.includes('smvm-logo.jpg')) {
              img.src = '/smvm-logo.jpg';
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-sm font-black tracking-tight leading-tight ${textColor}`}>
            SMVM
          </span>
          <span className="text-[10px] text-slate-500 font-medium leading-tight">
            Salomão Muanjita Vinene Moises
          </span>
        </div>
      )}
    </div>
  );
};
