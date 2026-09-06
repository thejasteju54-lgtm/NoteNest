import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  ExternalLink,
  Search,
  X,
  Sun,
  Moon,
  Coffee,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Quote,
  Sparkles,
  BookOpen,
  Download,
  Printer,
  Star,
  Clock,
  Play,
  Pause,
  RotateCcw,
  MoreVertical,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { userPreferences, ReadingTheme } from '@/services/userPreferences';
import { PDFThumbnailStrip } from './PDFThumbnailStrip';
import { PDFPageCanvas } from './PDFPageCanvas';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PDFCanvasViewerProps {
  blobUrl: string;
  arrayBuffer?: ArrayBuffer | null;
  noteId?: string;
  title?: string;
  subjectName?: string;
  subjectColorId?: string;
  isStarred?: boolean;
  onToggleStar?: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  isNotesDrawerOpen?: boolean;
  onToggleNotesDrawer?: () => void;
  onClose?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onOpenInTab?: () => void;
  // Pomodoro
  pomodoroSeconds?: number;
  isPomodoroActive?: boolean;
  isPomodoroBreak?: boolean;
  onTogglePomodoro?: () => void;
  onResetPomodoro?: () => void;
  onFallback?: () => void;
  externalPage?: number;
}

interface SearchMatch {
  pageNum: number;
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  blobUrl,
  arrayBuffer,
  noteId,
  title,
  subjectName,
  subjectColorId,
  isStarred,
  onToggleStar,
  isFullScreen = false,
  onToggleFullScreen,
  isZenMode = false,
  onToggleZenMode,
  isNotesDrawerOpen = false,
  onToggleNotesDrawer,
  onClose,
  onDownload,
  onPrint,
  onOpenInTab,
  pomodoroSeconds = 25 * 60,
  isPomodoroActive = false,
  isPomodoroBreak = false,
  onTogglePomodoro,
  onResetPomodoro,
  onFallback,
  externalPage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<ReadingTheme>(() => userPreferences.getPreferredTheme());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>('1');
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingText, setIsSearchingText] = useState<boolean>(false);
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Thumbnails & Excerpt State
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [excerptNotice, setExcerptNotice] = useState<string | null>(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  const scrollToPage = useCallback((pageNum: number, smooth = true) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start',
      });
    }
  }, []);

  // Sync external page jumps (e.g. from study notes citations)
  useEffect(() => {
    if (
      externalPage &&
      externalPage >= 1 &&
      numPages > 0 &&
      externalPage <= numPages &&
      externalPage !== currentPage
    ) {
      setCurrentPage(externalPage);
      setPageInput(String(externalPage));
      scrollToPage(externalPage);
    }
  }, [externalPage, numPages, currentPage, scrollToPage]);

  const handleQuotePage = () => {
    if (!noteId) return;
    const citation = `\n> [Page ${currentPage}]: Key concept from page ${currentPage}...\n`;
    const existing = userPreferences.getStudyNotes(noteId);
    userPreferences.saveStudyNotes(noteId, existing ? `${existing}\n${citation}` : citation);
    setExcerptNotice(`Page ${currentPage} citation added to Study Notes!`);
    setTimeout(() => setExcerptNotice(null), 2500);
  };

  // Load PDF Document & Auto-Resume Last Read Page
  useEffect(() => {
    let isCancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    setIsLoading(true);
    setError(null);

    const savedPage = noteId ? userPreferences.getLastReadPage(noteId) : 1;
    setCurrentPage(savedPage);
    setPageInput(String(savedPage));

    async function loadPdf() {
      try {
        let bytes: Uint8Array;

        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          bytes = new Uint8Array(arrayBuffer);
        } else {
          const res = await fetch(blobUrl);
          if (!res.ok) {
            throw new Error(`Failed to read PDF blob: HTTP ${res.status}`);
          }
          const buf = await res.arrayBuffer();
          bytes = new Uint8Array(buf);
        }

        if (isCancelled) return;

        loadingTask = pdfjsLib.getDocument({
          data: bytes,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);

          const safePage = Math.min(doc.numPages, Math.max(1, savedPage));
          setCurrentPage(safePage);
          setPageInput(String(safePage));
          setIsLoading(false);

          if (safePage > 1) {
            setTimeout(() => {
              scrollToPage(safePage, false);
            }, 250);
          }
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('PDF.js document load error:', err);
          const msg = err instanceof Error ? err.message : 'Failed to parse PDF document.';
          setError(msg);
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (loadingTask) {
        loadingTask.destroy();
      }
    };
  }, [blobUrl, arrayBuffer, noteId, scrollToPage]);

  // Save last read page progress
  useEffect(() => {
    if (noteId && currentPage >= 1) {
      userPreferences.saveLastReadPage(noteId, currentPage);
    }
  }, [noteId, currentPage]);

  // Dynamic Fit to Width Calculator
  const handleFitWidth = useCallback(() => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(currentPage || 1).then((page) => {
      const viewport = page.getViewport({ scale: 1, rotation });
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      // Allow comfortable padding (36px total)
      const availableWidth = Math.max(300, containerWidth - 36);
      const fitScale = Math.max(0.5, Math.min(2.8, availableWidth / viewport.width));
      setScale(Number(fitScale.toFixed(2)));
    });
  }, [pdfDoc, currentPage, rotation]);

  // Auto-fit on initial load
  useEffect(() => {
    if (pdfDoc && numPages > 0) {
      const timer = setTimeout(() => {
        handleFitWidth();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pdfDoc, numPages, handleFitWidth]);

  // Auto re-fit when fullscreen toggled
  useEffect(() => {
    if (pdfDoc) {
      const timer = setTimeout(() => {
        handleFitWidth();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, handleFitWidth, pdfDoc]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setPageInput(String(prev));
      scrollToPage(prev);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
      scrollToPage(next);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setCurrentPage(page);
      scrollToPage(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3.2, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.4, Number((prev - 0.15).toFixed(2))));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCycleTheme = () => {
    const themes: ReadingTheme[] = ['light', 'dark', 'sepia'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setTheme(nextTheme);
    userPreferences.setPreferredTheme(nextTheme);
  };

  // Full-Text In-Document Search
  const handlePerformSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = searchQuery.trim().toLowerCase();
    if (!term || !pdfDoc) {
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    setIsSearchingText(true);
    setSearchError(null);
    const matches: SearchMatch[] = [];

    try {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        // @ts-expect-error item string property in PDF.js
        const text = textContent.items.map((item) => item.str || '').join(' ').toLowerCase();
        if (text.includes(term)) {
          matches.push({ pageNum: i });
        }
      }

      setSearchMatches(matches);
      if (matches.length > 0) {
        setCurrentMatchIndex(0);
        setCurrentPage(matches[0].pageNum);
        setPageInput(String(matches[0].pageNum));
        scrollToPage(matches[0].pageNum);
      } else {
        setCurrentMatchIndex(-1);
        setSearchError('No matches found in document.');
      }
    } catch (err) {
      console.error('Search text extraction error:', err);
      setSearchError('Could not search document text.');
    } finally {
      setIsSearchingText(false);
    }
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIdx);
    const targetPage = searchMatches[nextIdx].pageNum;
    setCurrentPage(targetPage);
    scrollToPage(targetPage);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIdx);
    const targetPage = searchMatches[prevIdx].pageNum;
    setCurrentPage(targetPage);
    scrollToPage(targetPage);
  };

  // Keyboard Shortcuts (F for Fullscreen, Z for Zen, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((s) => !s);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onToggleFullScreen?.();
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onToggleZenMode?.();
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleFitWidth();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleFullScreen, onToggleZenMode, handleFitWidth]);

  const formatPomodoro = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white gap-3 p-6">
        <Loader2 className="w-8 h-8 animate-spin text-accent-sage" />
        <p className="text-xs font-semibold text-slate-600 tracking-wide">
          Rendering PDF Document...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center bg-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm sm:text-base font-semibold text-slate-800">Preview Engine Notice</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{error}</p>
        <div className="flex items-center gap-2">
          {onFallback && (
            <Button variant="primary" size="sm" onClick={onFallback}>
              Switch to Standard View
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(blobUrl, '_blank')}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Open in Tab
          </Button>
        </div>
      </div>
    );
  }

  // Theme container styling
  const themeContainerBg =
    theme === 'dark'
      ? 'bg-slate-950'
      : theme === 'sepia'
      ? 'bg-[#F4E8CE]'
      : 'bg-slate-100';

  const themeCanvasFilter =
    theme === 'dark'
      ? 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.05)'
      : theme === 'sepia'
      ? 'sepia(0.35) brightness(0.96) contrast(0.98)'
      : 'none';

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden select-none ${themeContainerBg} transition-colors duration-200 relative`}>
      {/* 1. Sleek Floating Zen Mode Badge (Only visible when Zen Mode is Active) */}
      {isZenMode && (
        <div className="fixed top-3 right-4 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs border border-white/15 animate-in fade-in slide-in-from-top-2">
          <span className="font-mono text-[11px] text-slate-300 font-semibold">
            {currentPage} / {numPages}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <button
            onClick={handleFitWidth}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
            title="Fit to Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleFullScreen}
            className="p-1 rounded hover:bg-white/10 text-accent-sage"
            title={isFullScreen ? 'Exit Full Size (F)' : 'Enter Full Size (F)'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleZenMode}
            className="bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded text-[11px] font-semibold text-white ml-0.5 transition-colors"
            title="Exit Zen Mode (Z)"
          >
            Exit Zen
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 text-slate-400 hover:text-white ml-0.5"
              title="Close Document (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. Unified Master Toolbar (Consolidates Document Meta, Page Nav, Zoom, and Actions into a single 46px bar) */}
      {!isZenMode && (
        <div className="h-11 sm:h-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-2 sm:px-3 flex items-center justify-between gap-1.5 sm:gap-2.5 shrink-0 z-20 shadow-xs">
          {/* Left Cluster: Document identity & Page Navigator */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Close Document (Esc)"
                aria-label="Close viewer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 hidden xs:flex">
              <FileText className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <h3
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-[260px]"
                title={title || 'Document'}
              >
                {title || 'Document'}
              </h3>

              {onToggleStar && (
                <button
                  onClick={onToggleStar}
                  className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                  title={isStarred ? 'Starred note' : 'Mark as starred'}
                  aria-label="Toggle star"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                    }`}
                  />
                </button>
              )}

              {subjectName && (
                <div className="hidden md:inline-block">
                  <Badge colorId={subjectColorId || 'slate'} label={subjectName} size="sm" />
                </div>
              )}
            </div>

            {/* Compact Vertical Divider */}
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 hidden xs:block" />

            {/* Page Jump Controls */}
            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-300"
                title="Previous Page (Left Arrow)"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 px-1">
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputSubmit}
                  className="w-8 h-5 text-center text-[11px] font-bold border border-slate-200 dark:border-slate-600 rounded focus:border-accent-sage focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  aria-label="Current page number"
                />
                <span className="text-[11px] text-slate-400 font-medium">/ {numPages}</span>
              </form>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-300"
                title="Next Page (Right Arrow)"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center Cluster: Reading & Zoom Tools */}
          <div className="flex items-center gap-1">
            {/* Fit to Width Button (Crucial for immediate readable content) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitWidth}
              className="h-7 px-2 text-xs font-medium border-slate-200 dark:border-slate-700 hidden sm:inline-flex"
              title="Fit to Width (Shortcut: 0)"
            >
              <Maximize2 className="w-3 h-3 mr-1 text-accent-sage" />
              Fit Width
            </Button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.4}
                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-300"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 w-10 text-center select-none">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 3.2}
                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-300"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reading Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCycleTheme}
              className="h-7 w-7 p-0 border-slate-200 dark:border-slate-700"
              title={`Reading Mode: ${theme.toUpperCase()} (Light / Sepia / Dark)`}
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              ) : theme === 'sepia' ? (
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </Button>

            {/* Rotate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="h-7 w-7 p-0 hidden md:inline-flex border-slate-200 dark:border-slate-700"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </div>

          {/* Right Cluster: Power Features & Full Size Trigger */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Thumbnails Toggle */}
            <Button
              variant={isThumbnailsOpen ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsThumbnailsOpen((o) => !o)}
              className="h-7 w-7 p-0 border-slate-200 dark:border-slate-700"
              title="Toggle Page Thumbnails"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>

            {/* Search Toggle */}
            <Button
              variant={isSearchOpen ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsSearchOpen((o) => !o)}
              className="h-7 w-7 p-0 border-slate-200 dark:border-slate-700"
              title="Search in PDF (Ctrl+F)"
            >
              <Search className="w-3.5 h-3.5" />
            </Button>

            {/* Quote to Notes */}
            {noteId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuotePage}
                className="h-7 w-7 p-0 hidden lg:inline-flex border-slate-200 dark:border-slate-700"
                title="Quote page into Study Notes"
              >
                <Quote className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              </Button>
            )}

            {/* Study Scratchpad Toggle */}
            {onToggleNotesDrawer && (
              <Button
                variant={isNotesDrawerOpen ? 'primary' : 'outline'}
                size="sm"
                onClick={onToggleNotesDrawer}
                className="h-7 px-2 text-xs font-semibold"
                title="Toggle Study Notes & Flashcards"
              >
                <BookOpen className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden md:inline">Notes</span>
              </Button>
            )}

            {/* FULL SIZE VIEWER BUTTON (High Prominence) */}
            {onToggleFullScreen && (
              <button
                onClick={onToggleFullScreen}
                className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  isFullScreen
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                    : 'bg-accent-sage text-white hover:bg-accent-sage/90 border border-accent-sage/80'
                }`}
                title={isFullScreen ? 'Exit Full Size (F / Esc)' : 'Full Size PDF Viewer (F)'}
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exit Full</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Full Size</span>
                  </>
                )}
              </button>
            )}

            {/* Zen Mode Button */}
            {onToggleZenMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleZenMode}
                className="h-7 px-2 text-xs font-semibold hidden sm:inline-flex border-slate-200 dark:border-slate-700"
                title="Zen Mode: Distraction-free Reading (Z)"
              >
                Zen
              </Button>
            )}

            {/* More Actions Dropdown Menu (Download, Print, Open Tab, Pomodoro, Native) */}
            <div className="relative" ref={moreMenuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMoreOpen((m) => !m)}
                className="h-7 w-7 p-0 border-slate-200 dark:border-slate-700"
                title="More Options"
                aria-label="More options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  {/* Pomodoro Focus Section inside Dropdown */}
                  {onTogglePomodoro && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg mb-1 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-accent-sage" />
                          {isPomodoroBreak ? 'Break' : 'Focus Timer'}
                        </span>
                        <span className="font-mono font-bold text-accent-sage">
                          {formatPomodoro(pomodoroSeconds)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button
                          onClick={onTogglePomodoro}
                          className="flex-1 py-1 px-2 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold text-[11px] flex items-center justify-center gap-1 hover:bg-slate-50"
                        >
                          {isPomodoroActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {isPomodoroActive ? 'Pause' : 'Start (25m)'}
                        </button>
                        {onResetPomodoro && (
                          <button
                            onClick={onResetPomodoro}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-700"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {onDownload && (
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        onDownload();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-accent-sage" />
                      Download PDF
                    </button>
                  )}

                  {onPrint && (
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        onPrint();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      Print Document
                    </button>
                  )}

                  {onOpenInTab && (
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        onOpenInTab();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      Open in New Tab
                    </button>
                  )}

                  {onFallback && (
                    <button
                      onClick={() => {
                        setIsMoreOpen(false);
                        onFallback();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left font-medium border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Native Browser View
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. In-Document Full-Text Search Drawer */}
      {isSearchOpen && (
        <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm shrink-0 z-20 animate-in slide-in-from-top-1 duration-150">
          <form onSubmit={handlePerformSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find text in PDF document..."
                autoFocus
                className="w-full h-7 pl-7 pr-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-accent-sage bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium"
              isLoading={isSearchingText}
            >
              Search
            </Button>
          </form>

          {/* Search match stats & jump buttons */}
          <div className="flex items-center gap-2">
            {searchMatches.length > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded">
                Match {currentMatchIndex + 1} of {searchMatches.length} (p. {searchMatches[currentMatchIndex]?.pageNum})
              </span>
            ) : searchError ? (
              <span className="text-[11px] text-rose-500 font-medium">{searchError}</span>
            ) : null}

            {searchMatches.length > 0 && (
              <div className="flex items-center gap-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMatch}
                  className="h-6 w-6 p-0"
                  title="Previous Match"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMatch}
                  className="h-6 w-6 p-0"
                  title="Next Match"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchMatches([]);
                setCurrentMatchIndex(-1);
              }}
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
              aria-label="Close Search"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 4. Main Reading & Scroll Canvas Area (100% isolated scroll - overscroll-contain) */}
      <div className="flex-1 flex flex-row overflow-hidden relative w-full h-full">
        {/* Thumbnails Sidebar */}
        {pdfDoc && (
          <PDFThumbnailStrip
            pdfDoc={pdfDoc}
            numPages={numPages}
            currentPage={currentPage}
            onSelectPage={(p) => {
              setCurrentPage(p);
              setPageInput(String(p));
              scrollToPage(p);
            }}
            isOpen={isThumbnailsOpen}
            onClose={() => setIsThumbnailsOpen(false)}
          />
        )}

        {/* Excerpt Quoted Toast */}
        {excerptNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg z-30 animate-in fade-in flex items-center gap-1.5 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{excerptNotice}</span>
          </div>
        )}

        {/* Continuous Vertical Scroll Container (Strictly isolated scrolling) */}
        <div
          ref={containerRef}
          tabIndex={0}
          className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col items-center relative touch-pan-y focus:outline-none overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {pdfDoc &&
            Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <PDFPageCanvas
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNum={pageNum}
                scale={scale}
                rotation={rotation}
                themeFilter={themeCanvasFilter}
                onPageIntersect={(p) => {
                  setCurrentPage(p);
                  setPageInput(String(p));
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
