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
        'relative rounded-xl bg-gradient-to-br from-[#14261F] via-[#1E3D31] to-[#2D5A4A]',
        'flex items-center justify-center text-white shadow-subtle shadow-emerald-950/30 shrink-0 select-none overflow-hidden',
        'border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200',
        sizeClass,
        className
      )}
    >
      {/* Minimalist Geometric 'N' & Folded Notes Emblem */}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        <defs>
          <linearGradient id="logoRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#E2EBE6"/>
          </linearGradient>
          <linearGradient id="logoFold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#73A992" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#4D806B" stop-opacity="0.8"/>
          </linearGradient>
        </defs>

        {/* Left Pillar */}
        <path
          d="M148 136 C148 127.163 155.163 120 164 120 H196 C204.837 120 212 127.163 212 136 V376 C212 384.837 204.837 392 196 392 H164 C155.163 392 148 384.837 148 376 Z"
          fill="url(#logoRibbon)"
        />

        {/* Diagonal Note Fold */}
        <path
          d="M196 128 L324 320 C329.5 328.5 332 338 332 348 V376 C332 384.837 324.837 392 316 392 H284 C275.163 392 267.5 385 262 376 L156 216 V144 C156 135.163 163.163 128 172 128 Z"
          fill="url(#logoFold)"
        />

        {/* Right Pillar */}
        <path
          d="M300 136 C300 127.163 307.163 120 316 120 H348 C356.837 120 364 127.163 364 136 V376 C364 384.837 356.837 392 348 392 H316 C307.163 392 300 384.837 300 376 Z"
          fill="url(#logoRibbon)"
        />

        {/* Luminous Active Accent Dot */}
        <circle cx="376" cy="116" r="26" fill="#52B788" />
        <circle cx="376" cy="116" r="16" fill="#74D3A5" />
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
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
