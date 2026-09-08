import React, { useState } from 'react';
import { Sparkles, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updates: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<Props> = ({ isOpen, onClose, profile, onSaveProfile }) => {
  const [name, setName] = useState(profile.name || 'Abinayak');
  const [preferredHours, setPreferredHours] = useState(profile.preferredStudyHours || 'Evening (6:00 PM - 10:00 PM)');
  const [dailyFocusTarget, setDailyFocusTarget] = useState(profile.dailyFocusTargetMinutes || 180);

  if (!isOpen) return null;

  const handleFinish = () => {
    onSaveProfile({
      name,
      preferredStudyHours: preferredHours,
      dailyFocusTargetMinutes: dailyFocusTarget,
      onboardingCompleted: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Configure Your Second Brain</h3>
            <p className="text-xs text-slate-400">Athena learns and adapts to your rhythm over time</p>
          </div>
        </div>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">What should Athena call you?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Preferred Study Hours */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Peak Energy & Focus Hours
            </label>
            <select
              value={preferredHours}
              onChange={(e) => setPreferredHours(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="Morning (7:00 AM - 11:00 AM)">Morning (7:00 AM - 11:00 AM)</option>
              <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
              <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM) (Default)</option>
              <option value="Night Owl (9:00 PM - 1:00 AM)">Night Owl (9:00 PM - 1:00 AM)</option>
            </select>
          </div>

          {/* Target Focus Minutes */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Daily Focus Target
              </span>
              <span className="font-mono text-sky-400 font-bold">{Math.floor(dailyFocusTarget / 60)}h {dailyFocusTarget % 60}m</span>
            </div>
            <input
              type="range"
              min={60}
              max={360}
              step={30}
              value={dailyFocusTarget}
              onChange={(e) => setDailyFocusTarget(Number(e.target.value))}
              className="w-full accent-sky-500 bg-slate-800 rounded-lg h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1 hr</span>
              <span>3 hrs (Recommended)</span>
              <span>6 hrs</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleFinish}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Enter Athena</span>
          </button>
        </div>
      </div>
    </div>
  );
};
