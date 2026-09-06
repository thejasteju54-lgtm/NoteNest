import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

interface PDFPageCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  scale: number;
  rotation: number;
  themeFilter: string;
  onPageIntersect: (pageNum: number) => void;
}

export const PDFPageCanvas: React.FC<PDFPageCanvasProps> = ({
  pdfDoc,
  pageNum,
  scale,
  rotation,
  themeFilter,
  onPageIntersect,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState<boolean>(pageNum === 1);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);

  // 1. Calculate dimensions for instant layout placeholder
  useEffect(() => {
    let active = true;
    pdfDoc.getPage(pageNum).then((page) => {
      if (!active) return;
      const vp = page.getViewport({ scale, rotation });
      setPageSize({ width: vp.width, height: vp.height });
    });
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  // 2. IntersectionObserver for lazy on-demand rendering and active page tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Trigger rendering when page comes within 600px of the viewport
    const renderObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsNearViewport(true);
        }
      },
      { rootMargin: '600px 0px 600px 0px', threshold: 0 }
    );

    // Track active page indicator when page is comfortably in view
    const visibleObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onPageIntersect(pageNum);
        }
      },
      { threshold: 0.35 }
    );

    renderObserver.observe(el);
    visibleObserver.observe(el);

    return () => {
      renderObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [pageNum, onPageIntersect]);

  // 3. Render page on canvas
  useEffect(() => {
    if (!isNearViewport || !pdfDoc) return;

    let cancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    async function draw() {
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pixelRatio = window.devicePixelRatio || 1;

        // Set display CSS dimensions
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Set backing buffer dimensions for Retina / High DPI clarity
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        await renderTask.promise;
        if (!cancelled) {
          setIsRendering(false);
        }
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'name' in err &&
          err.name === 'RenderingCancelledException'
        ) {
          return;
        }
        console.error(`Page ${pageNum} render error:`, err);
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }

    draw();

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
  }, [isNearViewport, pdfDoc, pageNum, scale, rotation]);

  return (
    <div
      id={`pdf-page-${pageNum}`}
      ref={containerRef}
      className="relative mb-6 shadow-md rounded bg-white transition-all duration-150 ease-out"
      style={{
        width: pageSize ? `${pageSize.width}px` : '100%',
        minHeight: pageSize ? `${pageSize.height}px` : '400px',
        filter: themeFilter,
      }}
    >
      {/* Subtle page number badge */}
      <div className="absolute top-2 right-2 bg-slate-800/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md pointer-events-none z-10 opacity-60">
        Page {pageNum}
      </div>

      {isRendering && (
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-xs px-2 py-1 rounded-md flex items-center gap-1.5 shadow-2xs z-10">
          <Loader2 className="w-3 h-3 animate-spin text-accent-sage" />
          <span className="text-[10px] text-slate-500 font-medium">Loading...</span>
        </div>
      )}

      <canvas ref={canvasRef} className="block rounded max-w-none" />
    </div>
  );
};
