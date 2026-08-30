import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
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
    full: 'max-w-5xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full glass-modal rounded-2xl shadow-modal z-10 overflow-hidden flex flex-col',
          'transform transition-all duration-200 animate-in fade-in zoom-in-95',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 pb-3 border-b border-slate-100/80">
            <div className="space-y-1 pr-4">
              {title && (
                <h3 className="text-base font-semibold text-slate-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};
