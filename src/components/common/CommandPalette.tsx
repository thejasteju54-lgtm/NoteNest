import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNoteNest } from '@/context/NoteNestContext';
import {
  Search,
  FileText,
  Folder,
  Upload,
  Plus,
  Moon,
  LayoutDashboard,
  CornerDownLeft,
  X,
  Star,
} from 'lucide-react';
import { userPreferences } from '@/services/userPreferences';

interface CommandItem {
  id: string;
  category: 'Actions' | 'Subjects' | 'Notes';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const {
    subjects,
    recentNotes,
    openUploadModal,
    openSubjectModal,
    openPreview,
    navigateTo,
  } = useNoteNest();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('notenest:open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('notenest:open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command items list
  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // 1. Quick Actions
    list.push({
      id: 'action-upload',
      category: 'Actions',
      title: 'Upload New PDF Note',
      subtitle: 'Upload lecture slides or textbook PDF',
      icon: <Upload className="w-4 h-4 text-accent-sage" />,
      onSelect: () => {
        openUploadModal();
        setIsOpen(false);
      },
    });

    list.push({
      id: 'action-subject',
      category: 'Actions',
      title: 'Create Subject Folder',
      subtitle: 'New academic course or topic category',
      icon: <Plus className="w-4 h-4 text-accent-terracotta" />,
      onSelect: () => {
        openSubjectModal();
        setIsOpen(false);
      },
    });

    list.push({
      id: 'action-dashboard',
      category: 'Actions',
      title: 'Go to Dashboard',
      subtitle: 'View all subjects and recent study files',
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" />,
      onSelect: () => {
        navigateTo({ type: 'dashboard' });
        setIsOpen(false);
      },
    });

    list.push({
      id: 'action-theme',
      category: 'Actions',
      title: 'Cycle PDF Reading Theme',
      subtitle: 'Switch between Light, Midnight Dark, and Sepia',
      icon: <Moon className="w-4 h-4 text-amber-500" />,
      onSelect: () => {
        const current = userPreferences.getPreferredTheme();
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'sepia' : 'light';
        userPreferences.setPreferredTheme(next);
        setIsOpen(false);
      },
    });

    // 2. Subjects
    subjects.forEach((subj) => {
      list.push({
        id: `subj-${subj.id}`,
        category: 'Subjects',
        title: subj.name,
        subtitle: `${subj.noteCount} notes`,
        icon: <Folder className="w-4 h-4 text-amber-600" />,
        onSelect: () => {
          navigateTo({ type: 'subject', subjectId: subj.id });
          setIsOpen(false);
        },
      });
    });

    // 3. Notes
    recentNotes.forEach((note) => {
      const isStarred = userPreferences.isNoteStarred(note.id);
      list.push({
        id: `note-${note.id}`,
        category: 'Notes',
        title: note.title,
        subtitle: note.subjectName || 'PDF Document',
        icon: isStarred ? (
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
        ) : (
          <FileText className="w-4 h-4 text-rose-500" />
        ),
        onSelect: () => {
          openPreview(note.id);
          setIsOpen(false);
        },
      });
    });

    // Filter by query
    if (!query.trim()) return list;

    const lower = query.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower))
    );
  }, [subjects, recentNotes, query, openUploadModal, openSubjectModal, openPreview, navigateTo]);

  // Adjust selected index if items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].onSelect();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, subject, or note title..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No matching commands, notes, or subjects found for "{query}".
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs sm:text-sm ${
                    isSelected
                      ? 'bg-accent-sage/15 text-slate-900 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span className="text-[10px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-accent-sage" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-2xs">↑</kbd>{' '}
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-2xs">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-2xs">↵</kbd> Select
            </span>
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-2xs">esc</kbd> Close
            </span>
          </div>
          <span className="text-slate-500 font-medium hidden xs:inline">NoteNest Spotlight</span>
        </div>
      </div>
    </div>
  );
};
