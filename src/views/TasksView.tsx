import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Tag
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../types';
import { api } from '../lib/api';

interface Props {
  tasks: Task[];
  onRefreshData: () => void;
}

export const TasksView: React.FC<Props> = ({ tasks, onRefreshData }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'smart' | 'deadline' | 'priority'>('smart');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});

  // New task form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Academic');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [deadline, setDeadline] = useState('');
  const [effort, setEffort] = useState(60);
  const [saving, setSaving] = useState(false);

  const categories = ['All', 'Academic', 'Career', 'Project', 'Personal'];

  // Filtering
  let filtered = tasks.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    // Keep completed at bottom
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;

    if (sortBy === 'smart') {
      return (b.calculatedScore || 0) - (a.calculatedScore || 0);
    }
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'priority') {
      const pMap: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    return 0;
  });

  const handleToggleComplete = async (task: Task) => {
    if (task.status === 'Completed') {
      await api.updateTask(task.id, { status: 'Todo' });
    } else {
      await api.completeTask(task.id);
    }
    onRefreshData();
  };

  const handleDefer = async (task: Task) => {
    const currentPostponed = task.postponedCount || 0;
    let newDeadline: string | undefined = undefined;
    if (task.deadline) {
      const d = new Date(task.deadline);
      d.setDate(d.getDate() + 1);
      newDeadline = d.toISOString();
    }
    await api.updateTask(task.id, {
      postponedCount: currentPostponed + 1,
      deadline: newDeadline
    });
    onRefreshData();
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      await api.deleteTask(taskId);
      onRefreshData();
    }
  };

  const handleFeedback = async (taskId: string, fb: 'Helpful' | 'Too difficult') => {
    setFeedbackGiven((prev) => ({ ...prev, [taskId]: fb }));
    await api.submitFeedback(taskId, fb);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        deadline: deadline ? deadline + 'T23:59:00' : undefined,
        estimatedEffortMinutes: Number(effort)
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Tasks & Priorities</h2>
          <p className="text-xs text-slate-400">Dynamic priority ranking backed by deadline & mastery factors</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Category Pills & Sort Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
          <span className="text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'smart' | 'deadline' | 'priority')}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium focus:outline-none focus:border-sky-500"
          >
            <option value="smart">Smart Rank (Athena ML)</option>
            <option value="deadline">Closest Deadline</option>
            <option value="priority">Priority Level</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No tasks found in this category. Tap "New Task" or ask Athena to schedule one.
          </div>
        ) : (
          filtered.map((task, idx) => {
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete toggle */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 hover:border-sky-400'
                    }`}
                    aria-label="Toggle completed"
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-xs sm:text-sm font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </h4>
                        {task.description && !isCompleted && (
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>
                        )}
                      </div>

                      {/* Priority and Smart Rank Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.calculatedScore !== undefined && !isCompleted && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold" title="Athena Multi-Factor Priority Score">
                            Score {task.calculatedScore}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
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
                    </div>

                    {/* Recommendation Reason */}
                    {task.recommendationReason && !isCompleted && (
                      <div className="mt-2 text-[11px] text-sky-300/90 bg-sky-950/30 px-2.5 py-1.5 rounded-lg border border-sky-500/20 leading-relaxed italic">
                        💡 {task.recommendationReason}
                      </div>
                    )}

                    {/* Metadata & Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
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
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                          {task.category}
                        </span>
                        {task.postponedCount ? (
                          <span className="text-[10px] text-amber-500 font-mono">
                            Postponed {task.postponedCount}x
                          </span>
                        ) : null}
                      </div>

                      {/* Inline Actions */}
                      <div className="flex items-center gap-2">
                        {!isCompleted && (
                          <>
                            <button
                              onClick={() => handleDefer(task)}
                              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800"
                              title="Postpone by 1 day"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Defer +1d</span>
                            </button>
                            {feedbackGiven[task.id] ? (
                              <span className="text-[10px] text-emerald-400 font-medium">Feedback sent</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleFeedback(task.id, 'Helpful')}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400"
                                  title="Recommendation was helpful"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(task.id, 'Too difficult')}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                                  title="Too difficult right now"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete DBMS Assignment 3"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key milestones or details..."
                  rows={2}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Career">Career</option>
                    <option value="Project">Project</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Critical">Critical (Overdue/Grade impact)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estimated Effort (Mins)</label>
                  <input
                    type="number"
                    value={effort}
                    onChange={(e) => setEffort(Number(e.target.value))}
                    min={5}
                    max={480}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold hover:bg-sky-400"
                >
                  {saving ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
