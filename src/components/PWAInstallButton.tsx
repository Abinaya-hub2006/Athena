import React, { useState } from 'react';
import { Download, Check, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();
  const [showIosTip, setShowIosTip] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isIOS) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowIosTip(!showIosTip)}
          className={`flex items-center gap-1.5 rounded-full text-xs font-medium border border-sky-500/30 text-sky-400 bg-sky-950/40 hover:bg-sky-900/50 transition-colors ${
            compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
          }`}
          title="Install Athena on Home Screen"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Add to Home</span>
        </button>
        {showIosTip && (
          <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-700 z-50">
            <p className="font-semibold text-white mb-1">Install Athena App</p>
            <p className="text-slate-300">Tap Safari's <span className="text-sky-400 font-semibold">Share</span> button below and select <span className="text-sky-400 font-semibold">"Add to Home Screen"</span>.</p>
          </div>
        )}
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installPWA}
      className={`flex items-center gap-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm hover:opacity-95 active:scale-95 transition-all ${
        compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
      }`}
      aria-label="Install Athena App"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
};
