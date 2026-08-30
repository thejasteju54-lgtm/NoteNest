import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={clsx('relative inline-block text-left', className)} ref={dropdownRef}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={clsx(
            'absolute z-30 mt-1.5 w-44 rounded-xl glass-modal p-1 shadow-card-hover border border-slate-200/90',
            'animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors',
                item.variant === 'danger'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {item.icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
