import React from 'react';
import { ToastMessage } from '@/types/common';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white/95 text-slate-800',
    error: 'border-rose-200 bg-white/95 text-slate-800',
    info: 'border-sky-200 bg-white/95 text-slate-800',
    warning: 'border-amber-200 bg-white/95 text-slate-800',
  };

  return (
    <div
      className={clsx(
        'pointer-events-auto rounded-xl shadow-card border p-3.5 flex items-start gap-3 backdrop-blur-md',
        'animate-in slide-in-from-bottom-2 fade-in duration-200 transition-all',
        borders[toast.type]
      )}
      role="status"
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0 pr-1">
        <h5 className="text-xs font-semibold leading-snug text-slate-900">{toast.title}</h5>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5 leading-normal">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
