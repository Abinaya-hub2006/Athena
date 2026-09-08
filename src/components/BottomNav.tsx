import React, { useState } from 'react';
import {
  Home,
  Sun,
  Sparkles,
  GraduationCap,
  CheckSquare,
  Brain,
  BarChart3,
  Settings,
  MoreHorizontal,
  X
} from 'lucide-react';

export type TabType = 'home' | 'myday' | 'chat' | 'studies' | 'tasks' | 'memory' | 'insights' | 'settings';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const mainTabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'myday' as TabType, label: 'My Day', icon: Sun },
    { id: 'chat' as TabType, label: 'Athena', icon: Sparkles, highlight: true },
    { id: 'studies' as TabType, label: 'Studies', icon: GraduationCap },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare }
  ];

  const secondaryTabs = [
    { id: 'memory' as TabType, label: 'Memory Bank', desc: 'Manage your second brain facts & habits', icon: Brain, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'insights' as TabType, label: 'Insights & Trends', desc: 'Behavioral analytics & consistency', icon: BarChart3, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'settings' as TabType, label: 'Settings & MLOps', desc: 'Model registry, drift status & preferences', icon: Settings, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
  ];

  const isSecondaryActive = ['memory', 'insights', 'settings'].includes(currentTab);

  return (
    <>
      {/* Secondary Drawer Modal */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm animate-in fade-in" onClick={() => setShowMoreDrawer(false)}>
          <div 
            className="absolute bottom-16 inset-x-0 mx-auto max-w-md p-4 bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Athena System Views</span>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 space-y-2">
              {secondaryTabs.map((t) => {
                const Icon = t.icon;
                const active = currentTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTab(t.id);
                      setShowMoreDrawer(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      active
                        ? 'bg-slate-800 border-sky-500/50 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${t.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">{t.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{t.desc}</div>
                    </div>
                    {active && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Primary Android Bottom Bar */}
      <nav className="sticky bottom-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 pb-safe flex items-center justify-around select-none">
        {mainTabs.map((t) => {
          const Icon = t.icon;
          const active = currentTab === t.id;

          if (t.highlight) {
            return (
              <button
                key={t.id}
                id="tab-btn-athena"
                onClick={() => {
                  setShowMoreDrawer(false);
                  onSelectTab(t.id);
                }}
                className="relative -top-3 flex flex-col items-center group active:scale-95 transition-transform"
                aria-label="Athena AI Chat"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    active
                      ? 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-sky-500/30 ring-2 ring-sky-400/40'
                      : 'bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 text-sky-400 shadow-slate-950'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-colors ${active ? 'text-sky-400' : 'text-slate-400'}`}>
                  {t.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={t.id}
              id={`tab-btn-${t.id}`}
              onClick={() => {
                setShowMoreDrawer(false);
                onSelectTab(t.id);
              }}
              className="flex-1 flex flex-col items-center py-1 group active:scale-95 transition-all"
            >
              <div
                className={`px-3.5 py-1 rounded-full transition-all ${
                  active ? 'bg-sky-500/15 text-sky-400 font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${active ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                {t.label}
              </span>
            </button>
          );
        })}

        {/* More button */}
        <button
          id="tab-btn-more"
          onClick={() => setShowMoreDrawer(!showMoreDrawer)}
          className={`flex-1 flex flex-col items-center py-1 group active:scale-95 transition-all ${
            isSecondaryActive ? 'text-amber-400' : 'text-slate-400'
          }`}
          title="More views (Memory, Insights, Settings)"
        >
          <div className={`px-3 py-1 rounded-full ${isSecondaryActive ? 'bg-amber-500/15 text-amber-400' : 'group-hover:text-slate-200'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isSecondaryActive ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            More
          </span>
        </button>
      </nav>
    </>
  );
};
