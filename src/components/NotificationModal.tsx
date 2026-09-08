import React from 'react';
import { Bell, Check, X, AlertTriangle, BookOpen, Clock, Calendar } from 'lucide-react';
import { AthenaNotification } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AthenaNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export const NotificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateToTask
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AthenaNotification['type']) => {
    switch (type) {
      case 'urgent_deadline':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'study_suggestion':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'interview_prep':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="notification-modal-card"
        className="w-full max-w-md mt-14 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Proactive Reminders</h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-medium text-sky-400 hover:text-sky-300 px-2 py-1 rounded-md hover:bg-sky-500/10 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/40">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No notifications yet. Athena will alert you when deadlines approach or when topics need revision.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`pt-3 first:pt-0 rounded-xl p-3 transition-colors ${
                  !notif.isRead ? 'bg-slate-800/50 border border-sky-500/20' : 'bg-transparent border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/50 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-200">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0">{notif.scheduledTime}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      {notif.actionableTaskId && onNavigateToTask ? (
                        <button
                          onClick={() => {
                            onNavigateToTask(notif.actionableTaskId!);
                            onClose();
                          }}
                          className="text-[11px] font-medium text-sky-400 hover:underline flex items-center gap-1"
                        >
                          View Task &rarr;
                        </button>
                      ) : <span />}
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkRead(notif.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
