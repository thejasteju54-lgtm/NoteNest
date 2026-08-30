import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNoteNest } from '@/context/NoteNestContext';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import {
  FolderPlus,
  Upload,
  Search,
  X,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    navigateTo,
    openUploadModal,
    openSubjectModal,
    searchQuery,
    setSearchQuery,
    clearSearch,
  } = useNoteNest();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Logo & Brand */}
        <div
          onClick={() => {
            clearSearch();
            navigateTo({ type: 'dashboard' });
          }}
          className="cursor-pointer select-none shrink-0"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              clearSearch();
              navigateTo({ type: 'dashboard' });
            }
          }}
        >
          <Logo size="md" />
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg relative hidden sm:block">
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your subjects or note titles..."
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200/90 pl-10 pr-9 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:border-accent-sage transition-all shadow-subtle"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Add Subject */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSubjectModal()}
            leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
            className="hidden md:inline-flex"
          >
            New Subject
          </Button>

          {/* Quick Upload Note */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => openUploadModal()}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            <span className="hidden xs:inline">Upload Note</span>
            <span className="xs:hidden">Upload</span>
          </Button>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
              aria-label="User profile menu"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
            >
              <div className="w-7 h-7 rounded-lg bg-accent-sage/20 text-accent-sage-hover flex items-center justify-center text-xs font-bold border border-accent-sage/30">
                {user?.avatarInitials || 'ST'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-modal p-1.5 shadow-card-hover border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-2.5 h-2.5" /> Authenticated
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo({ type: 'settings' });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Settings & Storage</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your subjects or notes..."
            className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border border-slate-200 pl-9 pr-8 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 p-0.5 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
