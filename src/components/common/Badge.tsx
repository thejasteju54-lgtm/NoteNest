import React from 'react';
import { clsx } from 'clsx';
import { SUBJECT_COLORS, ColorOption } from '@/config/constants';

export interface BadgeProps {
  colorId?: string;
  label: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  colorId = 'sage',
  label,
  size = 'md',
  className,
  icon,
}) => {
  const colorDef =
    SUBJECT_COLORS.find((c) => c.id === colorId) || (SUBJECT_COLORS[0] as ColorOption);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg border transition-colors',
        colorDef.badgeBg,
        colorDef.badgeText,
        colorDef.borderSubtle,
        sizeClasses[size],
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
