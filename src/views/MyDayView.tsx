import React, { useState, useEffect } from 'react';
import {
  Sun,
  Battery,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DailyPlan, Task } from '../types';
import { api } from '../lib/api';

interface Props {
  onRefreshData: () => void;
}

export const MyDayView: React.FC<Props> = ({ onRefreshData }) => {
  const [availableHours, setAvailableHours] = useState(3);
  const [energyLevel, setEnergyLevel] = useState<'High' | 'Normal' | 'Low' | 'Tired'>('Normal');
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPlan(availableHours, energyLevel);
  }, [availableHours, energyLevel]);

  const fetchPlan = async (hours: number, energy: string) => {
    setLoading(true);
    try {
      const data = await api.getDailyPlan(hours, energy);
      setPlan(data);
    } catch (err) {
      console.error('Failed to fetch day plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    setCompletedIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    await api.completeTask(taskId);
    onRefreshData();
  };

  const renderTaskSection = (title: string, subtitle: string, tasks: Task[], badgeColor: string) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${badgeColor}`} />
              {title}
            </h4>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {tasks.reduce((sum, t) => sum + (t.estimatedEffortMinutes || 45), 0)} mins
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => {
            const isDone = completedIds[task.id] || task.status === 'Completed';
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 hover:border-sky-400'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {task.estimatedEffortMinutes}m
                      </span>
                    </div>

                    {task.recommendationReason && !isDone && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        {task.recommendationReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sun className="w-4 h-4" />
          <span>Adaptive Daily Architecture</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Today's Focus Budget</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Tell Athena your realistic available time and energy. The plan adapts dynamically to keep you progressing without burnout.
        </p>

        {/* Time Budget Slider */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Available Focus Time
              </span>
              <span className="font-mono text-sky-400 font-bold text-sm">{availableHours} Hours</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((hr) => (
                <button
                  key={hr}
                  onClick={() => setAvailableHours(hr)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    availableHours === hr
                      ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {hr}h
                </button>
              ))}
            </div>
          </div>

          {/* Energy Selector */}
          <div>
            <span className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              Current Energy Level
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['High', 'Normal', 'Low', 'Tired'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setEnergyLevel(lvl)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    energyLevel === lvl
                      ? lvl === 'Tired' || lvl === 'Low'
                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Athena's Plan Guidance Note */}
      {plan && plan.athenaNote && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">Athena Pacing Note</span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{plan.athenaNote}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
          <span>Balancing focus budget...</span>
        </div>
      )}

      {/* Structured Sections */}
      {plan && !loading && (
        <div className="space-y-6">
          {/* Must Do */}
          {renderTaskSection(
            'Must Do',
            'Essential commitments; immediate grade or deadline impact',
            plan.mustDo,
            'bg-rose-400'
          )}

          {/* Should Do */}
          {renderTaskSection(
            'Should Do',
            'High leverage focus; steady conceptual progression',
            plan.shouldDo,
            'bg-sky-400'
          )}

          {/* If You Have Time */}
          {renderTaskSection(
            'If You Have Time',
            'Low cognitive strain or bonus revision if you feel energized',
            plan.ifYouHaveTime,
            'bg-slate-400'
          )}

          {/* Break & Recovery Recommendation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Recommended Recharge Break</span>
            </div>
            <span className="font-mono font-bold text-amber-400">{plan.suggestedBreakMinutes} minutes</span>
          </div>
        </div>
      )}
    </div>
  );
};
