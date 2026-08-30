import React from 'react';
import { clsx } from 'clsx';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const LogoIcon: React.FC<{ sizeClass?: string; className?: string }> = ({
  sizeClass = 'w-8 h-8',
  className,
}) => {
  return (
    <div
      className={clsx(
        'relative rounded-xl bg-gradient-to-br from-accent-sage via-[#6E8F7F] to-[#5C7D6E]',
        'flex items-center justify-center text-white shadow-subtle shadow-accent-sage/25 shrink-0 overflow-hidden',
        'border border-white/20 select-none group-hover:scale-105 transition-transform duration-200',
        sizeClass,
        className
      )}
    >
      {/* Minimalist Geometric Nest + Document Icon SVG */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[62%] h-[62%] text-white"
      >
        {/* Outer Nest Cradle */}
        <path
          d="M6 18.5C6 23.1944 9.80558 27 14.5 27H20C23.866 27 27 23.866 27 20C27 16.134 23.866 13 20 13H18.5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
        {/* Layered Document / Note Sheets inside Nest */}
        <path
          d="M10 7C10 5.89543 10.8954 5 12 5H18.5L23 9.5V17C23 18.1046 22.1046 19 21 19H12C10.8954 19 10 18.1046 10 17V7Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Folded Top Corner on Note */}
        <path
          d="M18.5 5V9.5H23"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Minimalist Content Bar */}
        <path
          d="M14 13.5H19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'Your notes. Organized.',
  className,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7 rounded-lg', title: 'text-sm font-bold', sub: 'text-[9px]' },
    md: { icon: 'w-8 h-8 rounded-xl', title: 'text-base font-bold', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11 rounded-2xl', title: 'text-xl font-bold', sub: 'text-xs' },
    xl: { icon: 'w-14 h-14 rounded-2xl', title: 'text-2xl font-bold', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={clsx('flex items-center gap-2.5 select-none group', className)}>
      <LogoIcon sizeClass={currentSize.icon} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={clsx('tracking-tight text-slate-900', currentSize.title)}>
              NoteNest
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-sage" />
          </div>
          {subtitle && (
            <span className={clsx('text-slate-500 font-medium tracking-wide mt-0.5', currentSize.sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
