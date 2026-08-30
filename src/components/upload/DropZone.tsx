import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { APP_CONFIG } from '@/config/constants';
import { formatFileSize } from '@/utils/formatters';

export interface DropZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  error?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  selectedFile,
  onFileSelect,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center',
          isDragOver
            ? 'border-accent-sage bg-accent-sage/10 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-300 bg-emerald-50/40'
            : error
            ? 'border-rose-300 bg-rose-50/40'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
        )}
      >
        {selectedFile ? (
          <div className="flex items-center gap-3.5 w-full text-left p-2">
            <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {formatFileSize(selectedFile.size)} • PDF Ready
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="text-xs font-semibold text-accent-sage hover:text-accent-sage-hover px-2.5 py-1 rounded-lg hover:bg-white/80 transition-colors shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div
              className={clsx(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform',
                isDragOver
                  ? 'bg-accent-sage text-white scale-110'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Drop your PDF here
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                or <span className="text-accent-sage font-medium hover:underline">browse files</span> from your device
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Supports .pdf documents up to {APP_CONFIG.MAX_FILE_SIZE_LABEL}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
