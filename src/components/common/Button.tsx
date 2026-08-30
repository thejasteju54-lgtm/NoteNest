import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variantStyles = {
      primary:
        'bg-accent-sage hover:bg-accent-sage-hover text-white shadow-sm focus-visible:ring-accent-sage border border-transparent',
      secondary:
        'bg-white hover:bg-canvas-subtle text-slate-800 border border-slate-200 shadow-subtle focus-visible:ring-slate-400',
      outline:
        'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-200 focus-visible:ring-slate-400',
      ghost:
        'bg-transparent hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-400',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus-visible:ring-rose-400',
    };

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
      icon: 'p-2 w-9 h-9',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
