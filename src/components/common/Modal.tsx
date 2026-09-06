import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full';
  showCloseButton?: boolean;
  fullScreen?: boolean;
  noPadding?: boolean;
  className?: string;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  fullScreen = false,
  noPadding = false,
  className,
  bodyClassName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl w-full',
    full: 'w-[96vw] max-w-[1550px] h-[94vh]',
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        fullScreen ? 'p-0 overflow-hidden' : noPadding ? 'p-2 sm:p-4 overflow-hidden' : 'p-3 sm:p-6 overflow-y-auto'
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200',
          fullScreen && 'bg-slate-950'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full z-10 overflow-hidden flex flex-col',
          'transform transition-all duration-200 animate-in fade-in zoom-in-95',
          fullScreen
            ? 'w-screen h-screen max-w-none max-h-none rounded-none shadow-none my-0 border-0 bg-slate-900'
            : clsx('glass-modal rounded-2xl shadow-modal my-auto', maxWidthStyles[maxWidth]),
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && !fullScreen && (
          <div className="flex items-start justify-between p-4 sm:p-5 pb-3 border-b border-slate-100/80 shrink-0">
            <div className="space-y-0.5 sm:space-y-1 pr-4 min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 line-clamp-2 sm:line-clamp-none">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={clsx(
            fullScreen || noPadding
              ? 'p-0 overflow-hidden flex-1 h-full flex flex-col'
              : 'p-4 sm:p-5 overflow-y-auto max-h-[85vh]',
            bodyClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
