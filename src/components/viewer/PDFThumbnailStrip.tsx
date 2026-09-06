import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { X, LayoutGrid } from 'lucide-react';

interface PDFThumbnailStripProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ThumbnailCard: React.FC<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ pdfDoc, pageNum, isSelected, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    async function drawThumbnail() {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 0.22 });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        await renderTask.promise;
      } catch {
        // Silently handle cancelled renders
      }
    }

    drawThumbnail();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNum]);

  return (
    <button
      onClick={onClick}
      className={`w-full p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
        isSelected
          ? 'bg-accent-sage/15 ring-2 ring-accent-sage text-accent-sage font-bold shadow-xs'
          : 'hover:bg-slate-200/60 text-slate-600'
      }`}
      title={`Jump to Page ${pageNum}`}
    >
      <div className="rounded shadow-xs overflow-hidden bg-white border border-slate-200/80">
        <canvas ref={canvasRef} className="block" />
      </div>
      <span className="text-[10px] font-mono tracking-tight font-medium">
        Page {pageNum}
      </span>
    </button>
  );
};

export const PDFThumbnailStrip: React.FC<PDFThumbnailStripProps> = ({
  pdfDoc,
  numPages,
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll selected thumbnail into view
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const activeBtn = scrollContainerRef.current.querySelector(
        `[title="Jump to Page ${currentPage}"]`
      ) as HTMLElement | null;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentPage, isOpen]);

  if (!isOpen || numPages <= 0) return null;

  return (
    <aside
      aria-label="PDF Page Thumbnails"
      className="w-36 sm:w-40 bg-slate-50 border-r border-slate-200/80 flex flex-col h-full z-10 shrink-0 select-none animate-in slide-in-from-left duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
          <LayoutGrid className="w-3.5 h-3.5 text-accent-sage" />
          <span>Pages ({numPages})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Close Thumbnails"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnails list */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <ThumbnailCard
            key={pageNum}
            pdfDoc={pdfDoc}
            pageNum={pageNum}
            isSelected={pageNum === currentPage}
            onClick={() => onSelectPage(pageNum)}
          />
        ))}
      </div>
    </aside>
  );
};
