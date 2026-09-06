import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const NetworkStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowRestored(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <div className="bg-emerald-600 text-white text-xs px-3 py-1.5 flex items-center justify-center gap-2 transition-all duration-300 shadow-sm z-50 sticky top-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="font-medium">Connection restored — You are back online.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs px-3 py-1.5 flex items-center justify-center gap-2 transition-all duration-300 shadow-sm z-50 sticky top-0">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span className="font-medium">
        Working offline. You can still view and organize your saved PDF notes from local cache.
      </span>
    </div>
  );
};
