import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md transition-all flex items-center gap-2 border">
      {!isOnline ? (
        <div className="flex items-center gap-2 text-amber-300 bg-amber-950/80 border-amber-500/40">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Offline mode — viewing cached data</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/80 border-emerald-500/40">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Back online — synced with Athena</span>
        </div>
      )}
    </div>
  );
};
