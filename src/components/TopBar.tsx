import React from 'react';
import { Bell, Smartphone, Monitor, User as UserIcon, LogOut } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  currentTabTitle: string;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenOnboarding: () => void;
  onNavigateSettings: () => void;
}

export const TopBar: React.FC<Props> = ({
  currentTabTitle,
  isPhoneFrame,
  onToggleFrame,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenOnboarding,
  onNavigateSettings
}) => {
  const { user, profile, signOutUser, isGuestMode } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Section */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
          <img src="/icon.svg" alt="Athena Logo" className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-tight">Athena</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Second Brain
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-none">
            {currentTabTitle}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* PWA Install */}
        <PWAInstallButton compact />

        {/* Frame Toggle (Desktop / Wide screen helper) */}
        <button
          id="btn-toggle-frame"
          onClick={onToggleFrame}
          title={isPhoneFrame ? 'Switch to Full Width View' : 'Switch to Android Phone Frame'}
          className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-1.5 rounded-lg transition-colors"
        >
          {isPhoneFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium">Fluid</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">Phone</span>
            </>
          )}
        </button>

        {/* Proactive Notifications Bell */}
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition-all"
          aria-label="Proactive Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Account Avatar Button */}
        {user ? (
          <div className="flex items-center gap-1.5">
            {isGuestMode && (
              <button
                onClick={onNavigateSettings}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg hover:bg-amber-500/20 transition-colors"
                title="Running in Local Development Mode. Click to view Settings."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Local Mode</span>
              </button>
            )}
            <button
              id="btn-user-profile"
              onClick={onNavigateSettings}
              title={`Signed in as ${user.displayName || user.email}. Click for Settings.`}
              className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-colors"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-lg object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
