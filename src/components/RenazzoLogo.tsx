import React from 'react';

interface RenazzoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  align?: 'left' | 'center';
}

export const RenazzoLogo: React.FC<RenazzoLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  subtitleText = 'ระบบบันทึกประวัติรถล้าง',
  align = 'left'
}) => {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11.5',
    xl: 'h-12 sm:h-15'
  }[size];

  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      <div className={`flex items-center select-none ${sizeClasses}`}>
        <img
          src="/renazzo-logo.svg"
          alt="Renazzo Auto Lab"
          className="h-full w-auto max-w-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {showSubtitle && (
        <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-normal tracking-wide whitespace-nowrap">
          {subtitleText}
        </p>
      )}
    </div>
  );
};

