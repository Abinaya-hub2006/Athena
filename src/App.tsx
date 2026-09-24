import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { TopBar } from './components/TopBar';
import { BottomNav, TabType } from './components/BottomNav';
import { NotificationModal } from './components/NotificationModal';
import { OnboardingModal } from './components/OnboardingModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoginScreen } from './components/LoginScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { firestoreService } from './lib/firestoreService';

import { HomeView } from './views/HomeView';
import { ChatView } from './views/ChatView';
import { MyDayView } from './views/MyDayView';
import { StudiesView } from './views/StudiesView';
import { TasksView } from './views/TasksView';
import { MemoryView } from './views/MemoryView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';

import {
  UserProfile,
  Task,
  StudySubject,
  StudySession,
  CalendarEvent,
  MemoryItem,
  AthenaNotification,
  MLModelStatus,
  InsightItem
} from './types';
import { api } from './lib/api';

function AppInner() {
  const { user, profile: authProfile, loading: authLoading, isGuestMode, updateProfileState } = useAuth();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Core Personal State
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Student',
    email: '',
    preferredStudyHours: 'Evening (6:00 PM - 10:00 PM)',
    dailyFocusTargetMinutes: 180,
    quietHours: { enabled: true, start: '23:00', end: '07:00' },
    notifications: {
      upcomingDeadlines: true,
      studyReminders: true,
      dailyBriefing: true,
      quietHoursMute: true,
      maxPerDay: 4
    },
    onboardingCompleted: true,
    theme: 'dark'
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [notifications, setNotifications] = useState<AthenaNotification[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [mlStatus, setMlStatus] = useState<MLModelStatus>({
    currentModelVersion: 'v1.2-gradient-ranker',
    baselineVersion: 'v1.0-heuristic-scorer',
    deployedAt: new Date().toISOString(),
    totalPredictions: 48,
    acceptanceRate: 83.3,
    averageLatencyMs: 14.2,
    trainingSamplesCount: 142,
    driftStatus: 'No Drift',
    driftMetrics: {
      acceptanceDriftPercent: 2.1,
      featureShiftScore: 0.04,
      lastDriftCheck: new Date().toISOString()
    },
    recentExperiments: []
  });

  // Sync auth profile to state
  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    }
  }, [authProfile]);

  // Real-time Firestore subscriptions for the logged-in user or local fallback for guest mode
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    if (isGuestMode) {
      Promise.all([
        api.getTasks(),
        api.getMemories(),
        api.getStudies(),
        api.getEvents(),
        api.getNotifications(),
        api.getInsights().catch(() => []),
        api.getMLStatus().catch(() => null),
        api.getProfile().catch(() => null)
      ]).then(([t, m, studies, ev, n, ins, ml, prof]) => {
        setTasks(t);
        setMemories(m);
        if (studies) {
          setSubjects(studies.subjects || []);
          setSessions(studies.sessions || []);
        }
        setEvents(ev);
        setNotifications(n);
        if (ins) setInsights(ins);
        if (ml) setMlStatus(ml);
        if (prof) setProfile(prof);
        setDataLoading(false);
      }).catch((err) => {
        console.error('Error loading guest mode data:', err);
        setDataLoading(false);
      });
      return;
    }

    const unsubTasks = firestoreService.subscribeTasks(user.uid, (data) => {
      setTasks(data);
      setDataLoading(false);
    });

    const unsubMemories = firestoreService.subscribeMemories(user.uid, (data) => {
      setMemories(data);
    });

    const unsubSubjects = firestoreService.subscribeSubjects(user.uid, (data) => {
      setSubjects(data);
    });

    const unsubSessions = firestoreService.subscribeSessions(user.uid, (data) => {
      setSessions(data);
    });

    const unsubEvents = firestoreService.subscribeEvents(user.uid, (data) => {
      setEvents(data);
    });

    const unsubNotifs = firestoreService.subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
    });

    // Also fetch ML telemetry and insights
    Promise.all([
      api.getInsights().catch(() => []),
      api.getMLStatus().catch(() => null)
    ]).then(([ins, ml]) => {
      if (ins) setInsights(ins);
      if (ml) setMlStatus(ml);
    });

    return () => {
      unsubTasks();
      unsubMemories();
      unsubSubjects();
      unsubSessions();
      unsubEvents();
      unsubNotifs();
    };
  }, [user, isGuestMode]);

  const refreshAll = async () => {
    if (!user) return;
    try {
      if (isGuestMode) {
        const [t, m, studies, ev, n, p, ins, ml] = await Promise.all([
          api.getTasks(),
          api.getMemories(),
          api.getStudies(),
          api.getEvents(),
          api.getNotifications(),
          api.getProfile(),
          api.getInsights(),
          api.getMLStatus()
        ]);
        setTasks(t);
        setMemories(m);
        if (studies) {
          setSubjects(studies.subjects || []);
          setSessions(studies.sessions || []);
        }
        setEvents(ev);
        setNotifications(n);
        setProfile(p);
        setInsights(ins);
        setMlStatus(ml);
        return;
      }

      const [p, ins, ml] = await Promise.all([
        api.getProfile(),
        api.getInsights(),
        api.getMLStatus()
      ]);
      setProfile(p);
      setInsights(ins);
      setMlStatus(ml);
    } catch (err) {
      console.error('Error refreshing state:', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    await updateProfileState(updates);
  };

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'home':
        return 'Today & Priorities';
      case 'myday':
        return 'My Day Focus Budget';
      case 'chat':
        return 'Athena AI Reasoning';
      case 'studies':
        return 'University Studies';
      case 'tasks':
        return 'All Active Tasks';
      case 'memory':
        return 'Second Brain Memory';
      case 'insights':
        return 'Behavioral Trends';
      case 'settings':
        return 'Settings & MLOps';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 animate-pulse">
          <img src="/icon.svg" alt="Athena Logo" className="w-8 h-8" />
        </div>
        <p className="text-xs font-semibold text-slate-300 tracking-wide">Loading Athena Second Brain...</p>
      </div>
    );
  }

  // Not signed in: show modern Google Auth login screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-sky-500 selection:text-slate-950">
      <OfflineIndicator />

      {/* Main Container: Phone Frame Mode vs Full Fluid Mode */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[430px] my-0 sm:my-4 sm:rounded-[42px] sm:border sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-slate-950 overflow-hidden ring-1 ring-slate-800/60'
            : 'max-w-4xl bg-slate-950'
        }`}
        style={{ minHeight: isPhoneFrame ? 'min(890px, 100vh)' : '100vh' }}
      >
        {/* Android Status Bar */}
        <AndroidStatusBar />

        {/* Top App Bar */}
        <TopBar
          currentTabTitle={getTabTitle(currentTab)}
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenOnboarding={() => setShowOnboarding(true)}
          onNavigateSettings={() => setCurrentTab('settings')}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 px-4 py-3 overflow-y-auto">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-3" />
              <span>Synchronizing your personalized second brain...</span>
            </div>
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeView
                  profile={profile}
                  tasks={tasks}
                  events={events}
                  subjects={subjects}
                  sessions={sessions}
                  onNavigateTab={(tab) => setCurrentTab(tab as TabType)}
                  onRefreshData={refreshAll}
                />
              )}

              {currentTab === 'myday' && (
                <MyDayView onRefreshData={refreshAll} />
              )}

              {currentTab === 'chat' && (
                <ChatView onRefreshSecondBrain={refreshAll} />
              )}

              {currentTab === 'studies' && (
                <StudiesView
                  subjects={subjects}
                  sessions={sessions}
                  onRefreshData={refreshAll}
                />
              )}

              {currentTab === 'tasks' && (
                <TasksView tasks={tasks} onRefreshData={refreshAll} />
              )}

              {currentTab === 'memory' && (
                <MemoryView memories={memories} onRefreshData={refreshAll} />
              )}

              {currentTab === 'insights' && (
                <InsightsView
                  insights={insights}
                  subjects={subjects}
                  sessions={sessions}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  profile={profile}
                  mlStatus={mlStatus}
                  onRefreshData={refreshAll}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      </div>

      {/* Proactive Notification Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onNavigateToTask={() => {
          setCurrentTab('tasks');
        }}
      />

      {/* Onboarding / Profile Setup Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
