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
} from 'lucide-react';
import { Button } from '@/components/common/Button';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFCanvasViewerProps {
  blobUrl: string;
  title?: string;
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({ blobUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>('1');

  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setPageInput('1');

    const loadingTask = pdfjsLib.getDocument({
      url: blobUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise
      .then((doc) => {
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('PDF.js document load error:', err);
          setError('Failed to parse PDF document.');
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [blobUrl]);

  // Render Page onto Canvas
  const renderPage = useCallback(
    async (pageNum: number, currentScale: number, currentRotation: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        setIsRendering(true);
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale: currentScale, rotation: currentRotation });
        const pixelRatio = window.devicePixelRatio || 1;

        // Set display dimensions
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Set backing buffer dimensions for Retina / High DPI
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
        setIsRendering(false);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
          // Expected when rapidly switching pages/zoom
          return;
        }
        console.error('Error rendering PDF page:', err);
        setIsRendering(false);
      }
    },
    [pdfDoc]
  );

  // Auto-render when page, scale, rotation or pdfDoc updates
  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= numPages) {
      renderPage(currentPage, scale, rotation);
    }
  }, [pdfDoc, currentPage, scale, rotation, numPages, renderPage]);

  // Auto-fit to width on initial load
  useEffect(() => {
    if (containerRef.current && pdfDoc && numPages > 0) {
      pdfDoc.getPage(1).then((firstPage) => {
        const viewport = firstPage.getViewport({ scale: 1 });
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        // Leave comfortable padding
        const availableWidth = Math.max(300, containerWidth - 48);
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
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
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
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1, rotation });
      const containerWidth = containerRef.current.clientWidth;
      const fitScale = Math.max(0.4, Math.min(2.5, (containerWidth - 32) / viewport.width));
      setScale(Number(fitScale.toFixed(2)));
    } catch {
      // Ignore
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-accent-sage mb-2" />
        <p className="text-xs font-medium">Parsing PDF pages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <p className="font-semibold text-slate-800 text-sm">{error}</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          The document could not be rendered inside the canvas viewer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl overflow-hidden select-none">
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
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1">
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

          <span className="text-xs font-medium text-slate-600 w-12 text-center hidden xs:inline-block">
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
        </div>
      </div>

      {/* Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-start justify-center relative touch-pan-x touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isRendering && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur shadow-md px-3 py-1.5 rounded-full flex items-center gap-2 z-10 border border-slate-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-sage" />
            <span className="text-[11px] font-medium text-slate-600">Rendering...</span>
          </div>
        )}

        <div className="shadow-lg rounded bg-white transition-transform duration-100 ease-out">
          <canvas ref={canvasRef} className="block rounded max-w-none" />
        </div>
      </div>
    </div>
  );
};
