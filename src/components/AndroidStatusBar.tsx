import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-medium tracking-tight text-slate-400 select-none bg-transparent">
      {/* Left: Current Time */}
      <span className="font-semibold text-slate-300 font-mono">{timeStr || '09:41'}</span>

      {/* Center: Camera hole notch on phone frame */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
      </div>

      {/* Right: Network & Battery Icons */}
      <div className="flex items-center gap-2 text-slate-300">
        <Signal className="w-3.5 h-3.5 text-slate-300" />
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-slate-400">92%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
