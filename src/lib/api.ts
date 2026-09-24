import { auth } from './firebase';
import { firestoreService } from './firestoreService';
import {
  UserProfile,
  MemoryItem,
  Task,
  StudySubject,
  StudySession,
  CalendarEvent,
  DailyPlan,
  ChatMessage,
  InsightItem,
  AthenaNotification,
  MLModelStatus,
  RecommendationFeedback
} from '../types';

const CACHE_KEYS = {
  PROFILE: 'athena_cache_profile',
  TASKS: 'athena_cache_tasks',
  MEMORIES: 'athena_cache_memories',
  SUBJECTS: 'athena_cache_subjects',
  EVENTS: 'athena_cache_events',
  NOTIFICATIONS: 'athena_cache_notifications'
};

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const api = {
  // --- Profile ---
  async getProfile(): Promise<UserProfile> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        const p = await firestoreService.getUserProfile(uid);
        if (p) {
          setLocalCache(CACHE_KEYS.PROFILE, p);
          return p;
        }
      } catch (err) {
        console.warn('Could not fetch user profile from Firestore, using cache/fallback', err);
      }
    }

    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setLocalCache(CACHE_KEYS.PROFILE, data);
      return data;
    } catch {
      return getLocalCache(CACHE_KEYS.PROFILE, {
        name: auth.currentUser?.displayName || 'Student',
        email: auth.currentUser?.email || 'student@university.edu',
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
        theme: 'dark' as const
      });
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const current = await this.getProfile();
      const updated = { ...current, ...updates };
      await firestoreService.setUserProfile(uid, updated);
      setLocalCache(CACHE_KEYS.PROFILE, updated);
      return updated;
    }

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    setLocalCache(CACHE_KEYS.PROFILE, data);
    return data;
  },

  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      return new Promise((resolve) => {
        const unsub = firestoreService.subscribeTasks(uid, (tasks) => {
          unsub();
          setLocalCache(CACHE_KEYS.TASKS, tasks);
          resolve(tasks);
        }, () => {
          resolve(getLocalCache(CACHE_KEYS.TASKS, []));
        });
      });
    }

    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setLocalCache(CACHE_KEYS.TASKS, data);
      return data;
    } catch {
      return getLocalCache(CACHE_KEYS.TASKS, []);
    }
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const newTask: Omit<Task, 'id'> = {
        title: task.title || 'Untitled Task',
        description: task.description,
        category: task.category || 'Academic',
        priority: task.priority || 'Medium',
        estimatedEffortMinutes: task.estimatedEffortMinutes || 45,
        status: task.status || 'Todo',
        deadline: task.deadline,
        subject: task.subject,
        project: task.project,
        tags: task.tags || [],
        createdAt: new Date().toISOString()
      };
      const id = await firestoreService.createTask(uid, newTask);
      return { ...newTask, id };
    }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.updateTask(uid, id, updates);
      return { id, ...updates } as Task;
    }

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async completeTask(id: string): Promise<Task> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const updates = {
        status: 'Completed' as const,
        completedAt: new Date().toISOString()
      };
      await firestoreService.updateTask(uid, id, updates);
      return { id, ...updates } as Task;
    }

    const res = await fetch(`/api/tasks/${id}/complete`, {
      method: 'POST'
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.deleteTask(uid, id);
      return { success: true };
    }

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // --- Memories ---
  async getMemories(searchQuery?: string, category?: string): Promise<MemoryItem[]> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      return new Promise((resolve) => {
        const unsub = firestoreService.subscribeMemories(uid, (items) => {
          unsub();
          let filtered = items;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m => m.content.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)));
          }
          if (category && category !== 'All') {
            filtered = filtered.filter(m => m.category.toLowerCase() === category.toLowerCase());
          }
          setLocalCache(CACHE_KEYS.MEMORIES, filtered);
          resolve(filtered);
        });
      });
    }

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (category && category !== 'All') params.set('category', category);
      const res = await fetch(`/api/memories?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch memories');
      const data = await res.json();
      setLocalCache(CACHE_KEYS.MEMORIES, data);
      return data;
    } catch {
      return getLocalCache(CACHE_KEYS.MEMORIES, []);
    }
  },

  async createMemory(memory: Partial<MemoryItem>): Promise<MemoryItem> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const newMem: Omit<MemoryItem, 'id'> = {
        content: memory.content || '',
        category: memory.category || 'Academic',
        importance: memory.importance || 'medium',
        confidence: memory.confidence || 0.9,
        source: memory.source || 'user_explicit',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        tags: memory.tags || [memory.category?.toLowerCase() || 'general'],
        isStarred: !!memory.isStarred
      };
      const id = await firestoreService.createMemory(uid, newMem);
      return { ...newMem, id };
    }

    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory)
    });
    return res.json();
  },

  async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.updateMemory(uid, id, updates);
      return { id, ...updates } as MemoryItem;
    }

    const res = await fetch(`/api/memories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteMemory(id: string): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.deleteMemory(uid, id);
      return { success: true };
    }

    const res = await fetch(`/api/memories/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async forgetMemory(query: string): Promise<{ count: number; message: string }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const all = await this.getMemories();
      const q = query.toLowerCase();
      const matching = all.filter(m => m.content.toLowerCase().includes(q));
      for (const m of matching) {
        await firestoreService.deleteMemory(uid, m.id);
      }
      return { count: matching.length, message: `Removed ${matching.length} memories matching "${query}"` };
    }

    const res = await fetch('/api/memories/forget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  async clearAllMemories(): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const all = await this.getMemories();
      for (const m of all) {
        await firestoreService.deleteMemory(uid, m.id);
      }
      return { success: true };
    }

    const res = await fetch('/api/memories-all', {
      method: 'DELETE'
    });
    return res.json();
  },

  // --- Studies ---
  async getStudies(): Promise<{ subjects: StudySubject[]; sessions: StudySession[] }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const [subjects, sessions] = await Promise.all([
        new Promise<StudySubject[]>((resolve) => {
          const unsub = firestoreService.subscribeSubjects(uid, (subs) => {
            unsub();
            resolve(subs);
          });
        }),
        new Promise<StudySession[]>((resolve) => {
          const unsub = firestoreService.subscribeSessions(uid, (sess) => {
            unsub();
            resolve(sess);
          });
        })
      ]);
      setLocalCache(CACHE_KEYS.SUBJECTS, subjects);
      return { subjects, sessions };
    }

    try {
      const res = await fetch('/api/studies');
      if (!res.ok) throw new Error('Failed to fetch studies');
      const data = await res.json();
      setLocalCache(CACHE_KEYS.SUBJECTS, data.subjects);
      return data;
    } catch {
      return {
        subjects: getLocalCache(CACHE_KEYS.SUBJECTS, []),
        sessions: []
      };
    }
  },

  async createSubject(subject: Omit<StudySubject, 'id'>): Promise<StudySubject> {
    const uid = auth.currentUser?.uid;
    const newSub: StudySubject = {
      ...subject,
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    if (uid) {
      await firestoreService.saveSubject(uid, newSub);
      return newSub;
    }
    const res = await fetch('/api/studies/subject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub)
    });
    return res.json();
  },

  async deleteSubject(subjectId: string): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.deleteSubject(uid, subjectId);
      return { success: true };
    }
    const res = await fetch(`/api/studies/subject/${subjectId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async logStudySession(sessionData: Partial<StudySession>): Promise<StudySession> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const newSession: Omit<StudySession, 'id'> = {
        subjectId: sessionData.subjectId || 'sub-custom',
        subjectName: sessionData.subjectName || 'General Subject',
        topicId: sessionData.topicId || 'top-custom',
        topicName: sessionData.topicName || 'General Topic',
        startTime: sessionData.startTime || new Date().toISOString(),
        endTime: sessionData.endTime || new Date().toISOString(),
        durationMinutes: Number(sessionData.durationMinutes) || 60,
        selfRatedDifficulty: Number(sessionData.selfRatedDifficulty) || 3,
        confidence: sessionData.confidence || 'Medium',
        accuracy: sessionData.accuracy,
        problemsSolved: sessionData.problemsSolved,
        notes: sessionData.notes,
        date: sessionData.date || new Date().toISOString().split('T')[0]
      };
      const id = await firestoreService.logSession(uid, newSession);
      return { ...newSession, id };
    }

    const res = await fetch('/api/studies/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    return res.json();
  },

  async updateTopicProgress(topicNameOrId: string, masteryScore: number, confidence?: string): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const { subjects } = await this.getStudies();
      let updated = false;
      for (const sub of subjects) {
        const topic = sub.topics.find(t => t.id === topicNameOrId || t.name.toLowerCase() === topicNameOrId.toLowerCase());
        if (topic) {
          topic.currentMastery = masteryScore;
          if (confidence) topic.confidence = confidence as 'Low' | 'Medium' | 'High';
          topic.lastStudiedDate = new Date().toISOString().split('T')[0];
          await firestoreService.saveSubject(uid, sub);
          updated = true;
          break;
        }
      }
      return { success: updated };
    }

    const res = await fetch('/api/studies/topic-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicNameOrId, masteryScore, confidence })
    });
    return res.json();
  },

  // --- Events & Calendar ---
  async getEvents(): Promise<CalendarEvent[]> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      return new Promise((resolve) => {
        const unsub = firestoreService.subscribeEvents(uid, (events) => {
          unsub();
          setLocalCache(CACHE_KEYS.EVENTS, events);
          resolve(events);
        });
      });
    }

    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setLocalCache(CACHE_KEYS.EVENTS, data);
      return data;
    } catch {
      return getLocalCache(CACHE_KEYS.EVENTS, []);
    }
  },

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const newEvt: Omit<CalendarEvent, 'id'> = {
        title: event.title || 'Untitled Event',
        type: event.type || 'Assignment',
        date: event.date || new Date().toISOString().split('T')[0],
        time: event.time,
        locationOrUrl: event.locationOrUrl,
        reminderSchedule: event.reminderSchedule || ['1 day before'],
        isCompleted: false
      };
      const id = await firestoreService.createEvent(uid, newEvt);
      return { ...newEvt, id };
    }

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return res.json();
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.deleteEvent(uid, id);
      return { success: true };
    }

    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // --- Daily Plan (My Day) ---
  async getDailyPlan(hours = 3, energy = 'Normal'): Promise<DailyPlan> {
    const res = await fetch(`/api/day-plan?hours=${hours}&energy=${energy}`);
    return res.json();
  },

  // --- Recommendations & Feedback ---
  async getRecommendations(limit = 3): Promise<Task[]> {
    const res = await fetch(`/api/recommendations?limit=${limit}`);
    return res.json();
  },

  async submitFeedback(taskId: string, feedback: RecommendationFeedback['feedback']): Promise<RecommendationFeedback> {
    const res = await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, feedback })
    });
    return res.json();
  },

  // --- Insights ---
  async getInsights(): Promise<InsightItem[]> {
    const res = await fetch('/api/insights');
    return res.json();
  },

  // --- Notifications ---
  async getNotifications(): Promise<AthenaNotification[]> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      return new Promise((resolve) => {
        const unsub = firestoreService.subscribeNotifications(uid, (notifs) => {
          unsub();
          setLocalCache(CACHE_KEYS.NOTIFICATIONS, notifs);
          resolve(notifs);
        });
      });
    }

    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setLocalCache(CACHE_KEYS.NOTIFICATIONS, data);
      return data;
    } catch {
      return getLocalCache(CACHE_KEYS.NOTIFICATIONS, []);
    }
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.markNotificationRead(uid, id);
      return { success: true };
    }

    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const notifs = await this.getNotifications();
      for (const n of notifs) {
        if (!n.isRead) {
          await firestoreService.markNotificationRead(uid, n.id);
        }
      }
      return { success: true };
    }

    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
    return res.json();
  },

  // --- Chat ---
  async getChatHistory(): Promise<ChatMessage[]> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      return new Promise((resolve) => {
        const unsub = firestoreService.subscribeChat(uid, (msgs) => {
          unsub();
          resolve(msgs);
        });
      });
    }

    const res = await fetch('/api/chat/history');
    return res.json();
  },

  async sendChatMessage(message: string): Promise<{
    message: ChatMessage;
    toolInvocations: Array<{ name: string; args: Record<string, unknown>; result?: string }>;
  }> {
    const uid = auth.currentUser?.uid;

    if (uid) {
      const userMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      await firestoreService.saveChatMessage(uid, userMsg);

      // Fetch user's active memories and tasks to give Gemini exact personal context
      const [userMemories, userTasks] = await Promise.all([
        this.getMemories().catch(() => []),
        this.getTasks().catch(() => [])
      ]);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userContext: {
            userId: uid,
            memories: userMemories.slice(0, 15),
            tasks: userTasks.filter(t => t.status !== 'Completed').slice(0, 10)
          }
        })
      });
      const data = await res.json();

      // If tools created tasks or memories, persist them to this user's Firestore!
      if (data.toolInvocations && Array.isArray(data.toolInvocations)) {
        for (const tool of data.toolInvocations) {
          if (tool.name === 'create_task' && tool.payload) {
            await this.createTask(tool.payload);
          } else if (tool.name === 'save_memory' && tool.payload) {
            await this.createMemory(tool.payload);
          } else if (tool.name === 'log_study_session' && tool.payload) {
            await this.logStudySession(tool.payload);
          }
        }
      }

      const botMsgId = `msg-${Date.now() + 1}-${Math.random().toString(36).substring(2, 7)}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'athena',
        text: data.message?.text || "I've noted that in your second brain.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolInvocations: data.toolInvocations
      };
      await firestoreService.saveChatMessage(uid, botMsg);

      return {
        message: botMsg,
        toolInvocations: data.toolInvocations || []
      };
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async clearChatHistory(): Promise<{ success: boolean }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.clearChat(uid);
      return { success: true };
    }

    const res = await fetch('/api/chat/clear', { method: 'POST' });
    return res.json();
  },

  // --- MLOps ---
  async getMLStatus(): Promise<MLModelStatus> {
    const res = await fetch('/api/ml/status');
    return res.json();
  },

  async triggerRetrain(): Promise<MLModelStatus> {
    const res = await fetch('/api/ml/retrain', { method: 'POST' });
    return res.json();
  },

  // --- Reset demo ---
  async resetToDemo(): Promise<{ success: boolean; message: string }> {
    const uid = auth.currentUser?.uid;
    if (uid && auth.currentUser?.email) {
      await firestoreService.seedNewUserData(uid, auth.currentUser.displayName || 'Student', auth.currentUser.email);
      return { success: true, message: 'Reset your personal account data to default template' };
    }

    const res = await fetch('/api/reset-demo', { method: 'POST' });
    return res.json();
  },

  // --- Clear all data (100% fresh start) ---
  async clearAllUserData(): Promise<{ success: boolean; message: string }> {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await firestoreService.clearAllUserData(uid);
      localStorage.removeItem(CACHE_KEYS.TASKS);
      localStorage.removeItem(CACHE_KEYS.MEMORIES);
      localStorage.removeItem(CACHE_KEYS.SUBJECTS);
      localStorage.removeItem(CACHE_KEYS.EVENTS);
      localStorage.removeItem(CACHE_KEYS.NOTIFICATIONS);
      return { success: true, message: 'All your personal data has been completely cleared' };
    }

    localStorage.removeItem(CACHE_KEYS.TASKS);
    localStorage.removeItem(CACHE_KEYS.MEMORIES);
    localStorage.removeItem(CACHE_KEYS.SUBJECTS);
    localStorage.removeItem(CACHE_KEYS.EVENTS);
    localStorage.removeItem(CACHE_KEYS.NOTIFICATIONS);

    const res = await fetch('/api/clear-all', { method: 'POST' });
    return res.json();
  }
};
