import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Trash2,
  X
} from 'lucide-react';
import { StudySubject, StudySession, StudyTopic } from '../types';
import { api } from '../lib/api';

interface Props {
  subjects: StudySubject[];
  sessions: StudySession[];
  onRefreshData: () => void;
}

export const StudiesView: React.FC<Props> = ({ subjects, sessions, onRefreshData }) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  
  // Log Modal Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState(3);
  const [confidence, setConfidence] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [problemsSolved, setProblemsSolved] = useState(4);
  const [accuracy, setAccuracy] = useState(80);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // New Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubExamDate, setNewSubExamDate] = useState('');
  const [newSubImportance, setNewSubImportance] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newSubColor, setNewSubColor] = useState('#38BDF8');
  const [newSubTopicsText, setNewSubTopicsText] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);

  // Quick edit topic state
  const [editingTopic, setEditingTopic] = useState<StudyTopic | null>(null);
  const [newMastery, setNewMastery] = useState(70);

  const handleOpenLogModal = (subId?: string, topName?: string) => {
    if (subId) setSelectedSubjectId(subId);
    if (topName) setSelectedTopicName(topName);
    setShowLogModal(true);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    setCreatingSubject(true);
    try {
      const topicNames = newSubTopicsText
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const parsedTopics: StudyTopic[] = topicNames.map((name, idx) => ({
        id: `top-${Date.now()}-${idx}`,
        subjectId: '',
        name,
        subtopics: [],
        difficulty: 'Medium',
        currentMastery: 50,
        targetMastery: 85,
        confidence: 'Medium',
        lastStudiedDate: new Date().toISOString().split('T')[0],
        totalSessions: 0,
        totalMinutes: 0
      }));

      await api.createSubject({
        name: newSubName.trim(),
        code: newSubCode.trim() || newSubName.trim().substring(0, 5).toUpperCase(),
        targetExamDate: newSubExamDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        importance: newSubImportance,
        color: newSubColor,
        topics: parsedTopics.length > 0 ? parsedTopics : [
          {
            id: `top-${Date.now()}-1`,
            subjectId: '',
            name: 'General Concepts',
            subtopics: ['Core Fundamentals'],
            difficulty: 'Medium',
            currentMastery: 50,
            targetMastery: 80,
            confidence: 'Medium',
            lastStudiedDate: new Date().toISOString().split('T')[0],
            totalSessions: 0,
            totalMinutes: 0
          }
        ]
      });

      setNewSubName('');
      setNewSubCode('');
      setNewSubExamDate('');
      setNewSubTopicsText('');
      setShowAddSubjectModal(false);
      onRefreshData();
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleDeleteSubject = async (subId: string, subName: string) => {
    if (window.confirm(`Delete "${subName}" and its topics?`)) {
      await api.deleteSubject(subId);
      onRefreshData();
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sub = subjects.find((s) => s.id === selectedSubjectId);
      await api.logStudySession({
        subjectId: selectedSubjectId,
        subjectName: sub ? sub.name : 'General Subject',
        topicId: 'top-custom',
        topicName: selectedTopicName || 'General Topic',
        durationMinutes: Number(duration),
        selfRatedDifficulty: Number(difficulty),
        confidence,
        problemsSolved: Number(problemsSolved),
        accuracy: Number(accuracy),
        notes
      });
      setShowLogModal(false);
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTopicMastery = async () => {
    if (!editingTopic) return;
    await api.updateTopicProgress(editingTopic.id, newMastery);
    setEditingTopic(null);
    onRefreshData();
  };

  const getDaysSince = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Studies & Mastery</h2>
          <p className="text-xs text-slate-400">Track subject topics, memory decay, and log sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={() => handleOpenLogModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Session</span>
          </button>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="space-y-3">
        {subjects.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Study Subjects Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your courses (e.g. Mathematics, AI & ML, Web Dev) to break them down into topics, track decay, and get spaced repetition prompts.
            </p>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 shadow-md shadow-sky-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Subject</span>
            </button>
          </div>
        ) : (
          subjects.map((sub) => {
            const isExpanded = expandedSubjectId === sub.id;
            const avgMastery = Math.round(
              sub.topics.reduce((acc, t) => acc + t.currentMastery, 0) / (sub.topics.length || 1)
            );

            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm"
              >
                {/* Subject Header */}
                <div
                  onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                      style={{ backgroundColor: `${sub.color}20`, color: sub.color, border: `1px solid ${sub.color}40` }}
                    >
                      {sub.code.substring(0, 4)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{sub.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{sub.topics.length} Topics</span>
                        <span>&bull;</span>
                        <span className="font-mono text-emerald-400 font-medium">{avgMastery}% Est. Mastery</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        sub.importance === 'critical'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sub.importance}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(sub.id, sub.name);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

              {/* Expanded Topics Breakdown */}
              {isExpanded && (
                <div className="border-t border-slate-800 p-3 space-y-2.5 bg-slate-950/40">
                  {sub.topics.map((topic) => {
                    const daysAgo = topic.lastStudiedDate
                      ? Math.floor((Date.now() - new Date(topic.lastStudiedDate).getTime()) / 86400000)
                      : 99;
                    const isCold = daysAgo >= 5;

                    return (
                      <div
                        key={topic.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-slate-100">{topic.name}</h4>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  topic.difficulty === 'Hard'
                                    ? 'bg-rose-500/10 text-rose-400'
                                    : topic.difficulty === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                                }`}
                              >
                                {topic.difficulty}
                              </span>
                            </div>

                            {/* Subtopics */}
                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {topic.subtopics.join(' • ')}
                            </p>
                          </div>

                          {/* Action to log or edit */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingTopic(topic);
                                setNewMastery(topic.currentMastery);
                              }}
                              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors font-mono"
                              title="Update mastery estimate"
                            >
                              {topic.currentMastery}%
                            </button>
                            <button
                              onClick={() => handleOpenLogModal(sub.id, topic.name)}
                              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
                            >
                              Study
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar & Decay Alert */}
                        <div className="mt-2.5">
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${topic.currentMastery}%`,
                                backgroundColor: sub.color
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                            <span className="flex items-center gap-1">
                              Last: {getDaysSince(topic.lastStudiedDate)}
                              {isCold && (
                                <span className="text-amber-400 font-bold flex items-center gap-0.5 ml-1">
                                  <AlertTriangle className="w-3 h-3" /> Decay alert
                                </span>
                              )}
                            </span>
                            <span>{topic.totalSessions} sessions ({topic.totalMinutes}m)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Recent Study Sessions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent Session Log</h3>
          <span className="text-[11px] text-slate-500">{sessions.length} logged</span>
        </div>

        <div className="space-y-2">
          {sessions.slice(0, 4).map((sess) => (
            <div
              key={sess.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-200">{sess.subjectName}</div>
                <div className="text-[11px] text-slate-400">
                  {sess.topicName} &bull; {sess.durationMinutes} mins &bull; Diff {sess.selfRatedDifficulty}/5
                </div>
                {sess.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5 truncate max-w-[280px]">
                    "{sess.notes}"
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-500 block">{sess.date}</span>
                {sess.accuracy !== undefined && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {sess.accuracy}% acc
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Study Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Log Completed Study Session</h3>
            <form onSubmit={handleSaveSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Topic Name</label>
                <input
                  type="text"
                  value={selectedTopicName}
                  onChange={(e) => setSelectedTopicName(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Virtual Memory"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={5}
                    max={360}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Self-Rated Difficulty (1-5)</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  >
                    <option value={1}>1 - Very Easy</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Hard</option>
                    <option value={5}>5 - Very Difficult</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Problems Solved</label>
                  <input
                    type="number"
                    value={problemsSolved}
                    onChange={(e) => setProblemsSolved(Number(e.target.value))}
                    min={0}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estimated Accuracy (%)</label>
                  <input
                    type="number"
                    value={accuracy}
                    onChange={(e) => setAccuracy(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Session Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key insights, areas where you got stuck..."
                  rows={2}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold hover:bg-sky-400"
                >
                  {saving ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Add New Subject</h3>
              </div>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject / Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Machine Learning, Calculus III, Physics"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS229"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Exam Date</label>
                  <input
                    type="date"
                    value={newSubExamDate}
                    onChange={(e) => setNewSubExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority / Importance</label>
                  <select
                    value={newSubImportance}
                    onChange={(e) => setNewSubImportance(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Accent Color</label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F43F5E', '#C084FC'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewSubColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newSubColor === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Topics Breakdown (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Linear Regression&#10;Neural Networks&#10;Decision Trees"
                  value={newSubTopicsText}
                  onChange={(e) => setNewSubTopicsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">You can log mastery and study sessions for each topic.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSubject}
                  className="flex-1 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold hover:bg-sky-400"
                >
                  {creatingSubject ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mastery Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Update Estimated Mastery</h3>
            <p className="text-xs text-slate-400 mb-3">{editingTopic.name}</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-400">
                <span>0% (Beginner)</span>
                <span className="text-base">{newMastery}%</span>
                <span>100% (Mastered)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={newMastery}
                onChange={(e) => setNewMastery(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingTopic(null)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTopicMastery}
                  className="flex-1 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400"
                >
                  Save Mastery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
