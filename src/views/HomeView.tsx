import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Plus,
  Flame,
  Brain
} from 'lucide-react';
import { Task, CalendarEvent, UserProfile, StudySubject, StudySession } from '../types';
import { api } from '../lib/api';

interface Props {
  profile: UserProfile;
  tasks: Task[];
  events: CalendarEvent[];
  subjects: StudySubject[];
  sessions: StudySession[];
  onNavigateTab: (tab: 'home' | 'myday' | 'chat' | 'studies' | 'tasks' | 'memory' | 'insights' | 'settings') => void;
  onRefreshData: () => void;
}

export const HomeView: React.FC<Props> = ({
  profile,
  tasks,
  events,
  subjects,
  sessions,
  onNavigateTab,
  onRefreshData
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activeTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
  const topFocusTasks = activeTasks.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  // Find a topic needing review across subjects
  const allTopics = subjects.flatMap((s) =>
    s.topics.map((t) => ({ ...t, subjectName: s.name, subjectId: s.id }))
  );
  const reviewTopic =
    allTopics.find((t) => {
      const days = t.lastStudiedDate
        ? Math.floor((Date.now() - new Date(t.lastStudiedDate).getTime()) / 86400000)
        : 99;
      return days >= 4 || t.currentMastery < 50;
    }) || allTopics[0];

  // Total study minutes this week
  const totalWeeklyMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const weeklyHours = (totalWeeklyMinutes / 60).toFixed(1);
  const targetWeeklyHours = (profile.dailyFocusTargetMinutes * 7 / 60).toFixed(0);

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      await api.completeTask(taskId);
      onRefreshData();
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleFeedback = async (taskId: string, fb: 'Helpful' | 'Too difficult') => {
    setFeedbackGiven((prev) => ({ ...prev, [taskId]: fb }));
    await api.submitFeedback(taskId, fb);
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* 1. Header Greeting & Second Brain Pulse */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Athena Intelligence
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online & Synced
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 tracking-tight">
            {getGreeting()}, {profile.name || 'Student'}.
          </h2>
          {activeTasks.length > 0 ? (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              You have <span className="text-sky-300 font-medium">{activeTasks.length} active task{activeTasks.length > 1 ? 's' : ''}</span> in your queue. Top priority: <span className="text-indigo-300 font-medium">{activeTasks[0].title}</span>.
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your workspace is clear and ready. Add your courses or tasks to let Athena plan your personalized study schedule.
            </p>
          )}

          {/* Quick Action Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateTab('chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold hover:bg-sky-500/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Talk to Athena</span>
            </button>
            <button
              onClick={() => onNavigateTab('myday')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Plan Evening</span>
            </button>
            <button
              onClick={() => onNavigateTab('studies')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Study</span>
            </button>
            <button
              onClick={() => onNavigateTab('memory')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all active:scale-95"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Memory Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Athena Proactive Suggestion Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/30 shadow-lg relative">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {reviewTopic ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Athena Proactive Suggestion</span>
                  <span className="text-[10px] text-slate-500">Spaced Repetition</span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-white mt-1">
                  Refresher recommended: {reviewTopic.name} ({reviewTopic.subjectName})
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your estimated mastery is {reviewTopic.currentMastery}%. A light 25-minute problem session reinforces memory retention before decay sets in.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab('studies')}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Start Topic Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateTab('chat')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition-all"
                  >
                    Ask Athena
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Athena Proactive Suggestion</span>
                  <span className="text-[10px] text-slate-500">Getting Started</span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-white mt-1">
                  Build your study second brain
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Add your subjects and study topics under the Studies tab to get automated spaced repetition schedules and topic decay alerts.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab('studies')}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Add Subjects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Today's Focus (Smart Priority Ranking) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">Today's Smart Focus</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Ranked by AI
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>All Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {topFocusTasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No active tasks in your queue</p>
              <p className="text-[11px] text-slate-500">Create your assignments, exam prep, or projects to see smart AI ranking.</p>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 mt-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Task</span>
              </button>
            </div>
          ) : (
            topFocusTasks.map((task, idx) => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* Checkbox button */}
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={completingTaskId === task.id}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    completingTaskId === task.id
                      ? 'bg-sky-500/20 border-sky-400 animate-spin'
                      : 'border-slate-700 hover:border-sky-400 hover:bg-sky-500/10'
                  }`}
                  aria-label="Complete task"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 hover:text-sky-400" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white truncate">{task.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        task.priority === 'Critical'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : task.priority === 'High'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Explainable Recommendation Reason */}
                  {task.recommendationReason && (
                    <p className="text-[11px] text-sky-300/90 mt-1 leading-relaxed italic bg-sky-950/20 px-2 py-1 rounded-md border border-sky-500/15">
                      💡 {task.recommendationReason}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {task.estimatedEffortMinutes}m
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-amber-400 font-mono">
                          <Calendar className="w-3 h-3" />
                          {task.deadline.split('T')[0]}
                        </span>
                      )}
                    </div>

                    {/* Recommendation Feedback buttons */}
                    <div className="flex items-center gap-1.5">
                      {feedbackGiven[task.id] ? (
                        <span className="text-[10px] text-emerald-400 font-medium">Feedback recorded</span>
                      ) : (
                        <>
                          <span className="text-[10px] text-slate-500 mr-0.5">Helpful?</span>
                          <button
                            onClick={() => handleFeedback(task.id, 'Helpful')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
                            title="Helpful recommendation"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(task.id, 'Too difficult')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Too difficult right now"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* 4. Upcoming Deadlines & Commitments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white tracking-tight">Approaching Deadlines</h3>
          <span className="text-xs text-slate-500">{upcomingEvents.length} scheduled</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-sky-400">{evt.type}</span>
                  <span className="font-mono text-slate-500">{evt.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 line-clamp-2">{evt.title}</h4>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{evt.time || 'All day'}</span>
                <span className="text-sky-400 font-medium">Athena Alert On</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Progress & Consistency Summary */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Consistency</h3>
          </div>
          <button
            onClick={() => onNavigateTab('insights')}
            className="text-[11px] font-semibold text-sky-400 hover:underline"
          >
            Detailed Analytics &rarr;
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium">Study Logged</span>
            <div className="text-sm font-bold font-mono text-sky-400 mt-0.5">{weeklyHours}h</div>
            <span className="text-[10px] text-slate-500">Target: {targetWeeklyHours}h</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium">Topic Mastery</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">74%</div>
            <span className="text-[10px] text-slate-500">4 Subjects</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium">Streak</span>
            <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">4 Days</div>
            <span className="text-[10px] text-slate-500">Consistent</span>
          </div>
        </div>
      </div>
    </div>
  );
};
