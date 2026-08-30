import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNoteNest } from '@/context/NoteNestContext';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { navigateTo } = useNoteNest();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 py-1">
      <button
        type="button"
        onClick={() => navigateTo({ type: 'dashboard' })}
        className="flex items-center gap-1 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 rounded px-1 py-0.5"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Home</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          {item.isActive ? (
            <span className="font-semibold text-slate-800 px-1 py-0.5 truncate max-w-xs sm:max-w-md">
              {item.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 rounded px-1 py-0.5 truncate max-w-xs"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
