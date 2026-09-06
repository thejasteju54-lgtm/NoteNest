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
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { userPreferences, ReadingTheme } from '@/services/userPreferences';
import { PDFThumbnailStrip } from './PDFThumbnailStrip';
import { PDFPageCanvas } from './PDFPageCanvas';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFCanvasViewerProps {
  blobUrl: string;
  arrayBuffer?: ArrayBuffer | null;
  noteId?: string;
  title?: string;
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
  onFallback,
  externalPage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<ReadingTheme>(() => userPreferences.getPreferredTheme());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>('1');

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
          // Fetch on the main window thread where blob URLs are accessible
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

          // Clamp saved page to doc bounds
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

  // Auto-fit to width on initial load
  useEffect(() => {
    if (containerRef.current && pdfDoc && numPages > 0) {
      pdfDoc.getPage(1).then((firstPage) => {
        const viewport = firstPage.getViewport({ scale: 1 });
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const availableWidth = Math.max(300, containerWidth - 64);
        const autoScale = Math.min(2.0, Math.max(0.6, availableWidth / viewport.width));
        setScale(Number(autoScale.toFixed(2)));
      });
    }
  }, [pdfDoc, numPages]);

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
    setScale((prev) => Math.min(3.0, Number((prev + 0.2).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.4, Number((prev - 0.2).toFixed(2))));
  };

  const handleFitWidth = async () => {
    if (!containerRef.current || !pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(currentPage || 1);
      const viewport = page.getViewport({ scale: 1, rotation });
      const containerWidth = containerRef.current.clientWidth;
      const fitScale = Math.max(0.4, Math.min(2.5, (containerWidth - 64) / viewport.width));
      setScale(Number(fitScale.toFixed(2)));
    } catch {
      // Ignore
    }
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

  // Global hotkey Ctrl+F / Cmd+F to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      ? 'bg-slate-900'
      : theme === 'sepia'
      ? 'bg-[#FBF0D9]'
      : 'bg-slate-100';

  const themeCanvasFilter =
    theme === 'dark'
      ? 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.05)'
      : theme === 'sepia'
      ? 'sepia(0.35) brightness(0.96) contrast(0.98)'
      : 'none';

  return (
    <div className={`flex flex-col h-full rounded-xl overflow-hidden select-none ${themeContainerBg} transition-colors duration-200`}>
      {/* Sticky Top Viewer Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/95 backdrop-blur border-b border-slate-200/80 gap-2 shrink-0 flex-wrap">
        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0"
            aria-label="Previous Page"
            title="Jump to Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5 px-1">
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              className="w-10 h-7 text-center text-xs font-medium border border-slate-200 rounded focus:border-accent-sage focus:outline-none bg-slate-50"
              aria-label="Current page number"
            />
            <span className="text-xs text-slate-500 font-medium">/ {numPages}</span>
          </form>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="h-8 w-8 p-0"
            aria-label="Next Page"
            title="Jump to Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Controls (Search, Thumbnails, Quote, Zoom, Theme, Rotate, Fallback) */}
        <div className="flex items-center gap-1">
          {/* Thumbnails Drawer Toggle */}
          <Button
            variant={isThumbnailsOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsThumbnailsOpen((o) => !o)}
            className="h-8 w-8 p-0"
            aria-label="Toggle Page Thumbnails"
            title="Toggle Page Thumbnails (Visual Navigation)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>

          {/* Quote / Excerpt to Study Notes */}
          {noteId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuotePage}
              className="h-8 w-8 p-0"
              aria-label="Quote Page to Study Notes"
              title="Add Page Citation to Study Notes"
            >
              <Quote className="w-3.5 h-3.5 text-slate-600" />
            </Button>
          )}

          {/* Search Toggle */}
          <Button
            variant={isSearchOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsSearchOpen((o) => !o)}
            className="h-8 w-8 p-0"
            aria-label="Find in PDF"
            title="Find in PDF (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </Button>

          {/* Reading Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCycleTheme}
            className="h-8 w-8 p-0"
            aria-label="Toggle Reading Mode"
            title={`Reading Mode: ${theme.toUpperCase()} (Click to change)`}
          >
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            ) : theme === 'sepia' ? (
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </Button>

          {/* Zoom Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.4}
            className="h-8 w-8 p-0"
            aria-label="Zoom Out"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-xs font-medium text-slate-600 w-11 text-center hidden xs:inline-block">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8 p-0"
            aria-label="Zoom In"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFitWidth}
            className="h-8 px-2 text-xs hidden sm:inline-flex"
            aria-label="Fit to Width"
            title="Fit to Width"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" />
            Fit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            className="h-8 w-8 p-0"
            aria-label="Rotate Page"
            title="Rotate Clockwise"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>

          {onFallback && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFallback}
              className="h-8 px-2 text-[11px] text-slate-500 hover:text-slate-800 hidden xs:inline-flex"
              title="Switch to Browser Built-in PDF Engine"
            >
              Native
            </Button>
          )}
        </div>
      </div>

      {/* Expandable In-Document Search Bar */}
      {isSearchOpen && (
        <div className="bg-white/95 border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shadow-sm animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handlePerformSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find text in document..."
                autoFocus
                className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-accent-sage bg-slate-50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="h-8 px-3 text-xs"
              isLoading={isSearchingText}
            >
              Search
            </Button>
          </form>

          {/* Matches & Navigation */}
          <div className="flex items-center gap-2">
            {searchMatches.length > 0 ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Match {currentMatchIndex + 1} of {searchMatches.length} (p. {searchMatches[currentMatchIndex]?.pageNum})
              </span>
            ) : searchError ? (
              <span className="text-xs text-rose-500">{searchError}</span>
            ) : null}

            {searchMatches.length > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMatch}
                  className="h-7 w-7 p-0"
                  title="Previous Match"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMatch}
                  className="h-7 w-7 p-0"
                  title="Next Match"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
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
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
              aria-label="Close Search"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Canvas & Thumbnails Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
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

        {/* Continuous Vertical Scroll Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col items-center relative touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
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
