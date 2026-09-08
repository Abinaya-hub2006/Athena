import React, { useState } from 'react';
import {
  Settings,
  User,
  Clock,
  Bell,
  Cpu,
  RefreshCw,
  Download,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Activity,
  LogOut,
  Database
} from 'lucide-react';
import { UserProfile, MLModelStatus } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  profile: UserProfile;
  mlStatus: MLModelStatus;
  onRefreshData: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<Props> = ({
  profile,
  mlStatus,
  onRefreshData,
  onUpdateProfile
}) => {
  const { user, signOutUser, updateProfileState, isGuestMode } = useAuth();

  const [name, setName] = useState(profile.name);
  const [studyHours, setStudyHours] = useState(profile.preferredStudyHours);
  const [dailyFocus, setDailyFocus] = useState(profile.dailyFocusTargetMinutes);
  const [quietHoursStart, setQuietHoursStart] = useState(profile.quietHours.start);
  const [quietHoursEnd, setQuietHoursEnd] = useState(profile.quietHours.end);
  const [isRetraining, setIsRetraining] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<UserProfile> = {
      name,
      preferredStudyHours: studyHours,
      dailyFocusTargetMinutes: dailyFocus,
      quietHours: {
        ...profile.quietHours,
        start: quietHoursStart,
        end: quietHoursEnd
      }
    };
    onUpdateProfile(updates);
    if (user) {
      await updateProfileState(updates);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTriggerRetrain = async () => {
    setIsRetraining(true);
    try {
      await api.triggerRetrain();
      onRefreshData();
    } finally {
      setIsRetraining(false);
    }
  };

  const handleStartFresh = async () => {
    if (window.confirm('Delete all existing tasks, subjects, memories, and study sessions to start with a 100% clean and fresh account?')) {
      await api.clearAllUserData();
      onRefreshData();
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset your personalized Athena workspace to default clean state? Your personal collections will be re-seeded.')) {
      await api.resetToDemo();
      onRefreshData();
    }
  };

  const handleClearMemories = async () => {
    if (window.confirm('Delete all your long-term second brain memories? This cannot be undone.')) {
      await api.clearAllMemories();
      onRefreshData();
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Sign out of your Athena Second Brain account?')) {
      await signOutUser();
    }
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in text-slate-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Settings & Account Operations</h2>
        <p className="text-xs text-slate-400">Personalized profile, cloud sync, and AI model telemetry</p>
      </div>

      {/* 0. Authenticated Account & Data Isolation Card */}
      {user && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Shield className={`w-4 h-4 ${isGuestMode ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>{isGuestMode ? 'Local Development Session' : 'Personal Second Brain Account'}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isGuestMode
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isGuestMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{isGuestMode ? 'Local Dev Mode' : 'Isolated Cloud Vault'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-base">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white leading-none">
                  {isGuestMode ? 'Local Student (Offline Mode)' : (user.displayName || 'Athena Student')}
                </p>
                <p className="text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-none">
                  {isGuestMode ? 'Browser Local Storage' : user.email}
                </p>
              </div>
            </div>

            <button
              id="btn-signout"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors active:scale-95 shrink-0"
              title={isGuestMode ? 'Exit Local Mode and return to Google Login' : 'Sign out of account'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isGuestMode ? 'Exit to Login' : 'Sign Out'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Database className={`w-3.5 h-3.5 shrink-0 ${isGuestMode ? 'text-amber-400' : 'text-sky-400'}`} />
            <span>
              {isGuestMode
                ? 'Running in local dev mode. To sync notes and spaced repetition to your Google account in Firestore, click "Exit to Login" and sign in with Google.'
                : 'All tasks, memories, and study sessions are synchronized in real-time to your private cloud Firestore database.'}
            </span>
          </div>
        </div>
      )}

      {/* 1. Profile & Preferences */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <User className="w-4 h-4 text-sky-400" />
          <span>User Profile & Energy Hours</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Preferred Deep Work Hours</label>
            <input
              type="text"
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Quiet Hours Start</label>
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Quiet Hours End</label>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
              </span>
            ) : <span />}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-all active:scale-95"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. MLOps Model Registry & Drift Monitor */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>MLOps Model Registry & Pipeline</span>
          </div>
          <button
            onClick={handleTriggerRetrain}
            disabled={isRetraining}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining...' : 'Trigger Retrain'}</span>
          </button>
        </div>

        {/* Model KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Deployed Model</span>
            <span className="font-mono font-bold text-sky-400 text-xs truncate block mt-0.5">
              {mlStatus.currentModelVersion}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Acceptance Rate</span>
            <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
              {mlStatus.acceptanceRate}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Avg Latency</span>
            <span className="font-mono font-bold text-slate-300 text-sm mt-0.5 block">
              {mlStatus.averageLatencyMs} ms
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Drift Status</span>
            <span className="font-semibold text-emerald-400 text-xs mt-0.5 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {mlStatus.driftStatus}
            </span>
          </div>
        </div>

        {/* Experiments Table */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Recent Model Candidate Runs</span>
          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
            {mlStatus.recentExperiments.map((exp) => (
              <div key={exp.id} className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{exp.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {exp.modelType} &bull; {exp.date}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="font-mono font-bold text-sky-400 block text-xs">NDCG: {exp.ndcg}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Acc: {(exp.accuracy * 100).toFixed(0)}%</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exp.status === 'Deployed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Data Privacy & Governance */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Data Privacy & Second Brain Governance</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Your personal second brain data remains completely private. Each student account operates in its own isolated Firestore security partition.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs font-semibold">
          <a
            href="/api/export"
            download="athena_second_brain.json"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center gap-2 transition-colors text-center"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </a>

          <button
            onClick={handleClearMemories}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Memories</span>
          </button>

          <button
            onClick={handleStartFresh}
            className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-2 transition-colors"
            title="Wipe everything to have a completely clean new account"
          >
            <Trash2 className="w-4 h-4" />
            <span>Start Fresh (Clean)</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Load Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
