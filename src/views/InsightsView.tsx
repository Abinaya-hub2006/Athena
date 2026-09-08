import React from 'react';
import {
  BarChart3,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  Zap,
  BookOpen
} from 'lucide-react';
import { InsightItem, StudySubject, StudySession } from '../types';

interface Props {
  insights: InsightItem[];
  subjects: StudySubject[];
  sessions: StudySession[];
}

export const InsightsView: React.FC<Props> = ({ insights, subjects, sessions }) => {
  // Aggregate study minutes by subject
  const subjectMinutes: Record<string, number> = {};
  subjects.forEach((s) => {
    subjectMinutes[s.name] = 0;
  });
  sessions.forEach((sess) => {
    subjectMinutes[sess.subjectName] = (subjectMinutes[sess.subjectName] || 0) + sess.durationMinutes;
  });

  const totalMinutes = Object.values(subjectMinutes).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Behavioral Insights & Trends</h2>
        <p className="text-xs text-slate-400">Continuous pattern recognition over your study habits and pacing</p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Consistency</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">4 Days</div>
          <span className="text-[10px] text-emerald-400 font-medium">+100% vs last week</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Weekly Focus</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">6.0h</div>
          <span className="text-[10px] text-slate-500 font-mono">Target: 18h pace</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Peak Window</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">6 - 9 PM</div>
          <span className="text-[10px] text-sky-400 font-medium">85% problem accuracy</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg Mastery</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">74%</div>
          <span className="text-[10px] text-slate-500">Across 4 subjects</span>
        </div>
      </div>

      {/* Subject Distribution Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Subject Time Distribution (Recent Sessions)</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">{(totalMinutes / 60).toFixed(1)} hrs total</span>
        </div>

        {/* Stacked bar */}
        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex">
          {subjects.map((s) => {
            const mins = subjectMinutes[s.name] || 0;
            const pct = Math.round((mins / totalMinutes) * 100);
            if (pct <= 0) return null;
            return (
              <div
                key={s.id}
                style={{ width: `${pct}%`, backgroundColor: s.color }}
                className="h-full transition-all"
                title={`${s.name}: ${mins}m (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {subjects.map((s) => {
            const mins = subjectMinutes[s.name] || 0;
            const pct = Math.round((mins / totalMinutes) * 100);
            return (
              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-200 truncate">{s.name}</span>
                </div>
                <span className="font-mono text-slate-400 shrink-0 ml-2">{mins}m ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Behavioral Insights Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Athena Observation Log
          </h3>
          <span className="text-[11px] text-slate-500">Data-backed patterns</span>
        </div>

        <div className="space-y-2.5">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.severity === 'action_needed'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : item.severity === 'positive'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {item.severity === 'action_needed' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : item.severity === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>

                  <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 font-mono">
                    📊 {item.supportingData}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
