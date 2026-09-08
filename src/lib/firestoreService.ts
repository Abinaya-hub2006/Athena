import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  UserProfile,
  Task,
  MemoryItem,
  StudySubject,
  StudySession,
  CalendarEvent,
  ChatMessage,
  AthenaNotification
} from '../types';

export const firestoreService = {
  // --- USER PROFILE ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) return null;
      return snap.data() as UserProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async setUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, 'users', userId), {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // --- SEED DEFAULT USER DATA (Starts completely clean for new accounts) ---
  async seedNewUserData(userId: string, displayName: string, email: string): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: userId,
      name: displayName || email.split('@')[0] || 'Student',
      email: email,
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
    };

    await this.setUserProfile(userId, profile);
    return profile;
  },

  // --- TASKS ---
  subscribeTasks(userId: string, onUpdate: (tasks: Task[]) => void, onError?: (error: Error) => void) {
    const path = `users/${userId}/tasks`;
    const colRef = collection(db, 'users', userId, 'tasks');
    return onSnapshot(colRef, (snapshot) => {
      const tasks = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Task));
      onUpdate(tasks);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      if (onError) onError(err);
    });
  },

  async createTask(userId: string, task: Omit<Task, 'id'>): Promise<string> {
    const path = `users/${userId}/tasks`;
    try {
      const colRef = collection(db, 'users', userId, 'tasks');
      const docRef = doc(colRef);
      await setDoc(docRef, {
        ...task,
        id: docRef.id,
        userId,
        createdAt: task.createdAt || new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'tasks', taskId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // --- MEMORIES ---
  subscribeMemories(userId: string, onUpdate: (memories: MemoryItem[]) => void) {
    const path = `users/${userId}/memories`;
    const colRef = collection(db, 'users', userId, 'memories');
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MemoryItem));
      onUpdate(items);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  async createMemory(userId: string, memory: Omit<MemoryItem, 'id'>): Promise<string> {
    const path = `users/${userId}/memories`;
    try {
      const colRef = collection(db, 'users', userId, 'memories');
      const docRef = doc(colRef);
      await setDoc(docRef, {
        ...memory,
        id: docRef.id,
        userId,
        createdDate: memory.createdDate || new Date().toISOString(),
        updatedDate: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateMemory(userId: string, memoryId: string, updates: Partial<MemoryItem>): Promise<void> {
    const path = `users/${userId}/memories/${memoryId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'memories', memoryId), {
        ...updates,
        updatedDate: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    const path = `users/${userId}/memories/${memoryId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'memories', memoryId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // --- SUBJECTS ---
  subscribeSubjects(userId: string, onUpdate: (subjects: StudySubject[]) => void) {
    const path = `users/${userId}/subjects`;
    const colRef = collection(db, 'users', userId, 'subjects');
    return onSnapshot(colRef, (snapshot) => {
      const subjects = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StudySubject));
      onUpdate(subjects);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  async saveSubject(userId: string, subject: StudySubject): Promise<void> {
    const path = `users/${userId}/subjects/${subject.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'subjects', subject.id), {
        ...subject,
        userId
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async deleteSubject(userId: string, subjectId: string): Promise<void> {
    const path = `users/${userId}/subjects/${subjectId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'subjects', subjectId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // --- STUDY SESSIONS ---
  subscribeSessions(userId: string, onUpdate: (sessions: StudySession[]) => void) {
    const path = `users/${userId}/sessions`;
    const colRef = collection(db, 'users', userId, 'sessions');
    return onSnapshot(colRef, (snapshot) => {
      const sessions = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StudySession));
      onUpdate(sessions);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  async logSession(userId: string, session: Omit<StudySession, 'id'>): Promise<string> {
    const path = `users/${userId}/sessions`;
    try {
      const colRef = collection(db, 'users', userId, 'sessions');
      const docRef = doc(colRef);
      await setDoc(docRef, {
        ...session,
        id: docRef.id,
        userId
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  // --- EVENTS ---
  subscribeEvents(userId: string, onUpdate: (events: CalendarEvent[]) => void) {
    const path = `users/${userId}/events`;
    const colRef = collection(db, 'users', userId, 'events');
    return onSnapshot(colRef, (snapshot) => {
      const events = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CalendarEvent));
      onUpdate(events);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  async createEvent(userId: string, event: Omit<CalendarEvent, 'id'>): Promise<string> {
    const path = `users/${userId}/events`;
    try {
      const colRef = collection(db, 'users', userId, 'events');
      const docRef = doc(colRef);
      await setDoc(docRef, {
        ...event,
        id: docRef.id,
        userId
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const path = `users/${userId}/events/${eventId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'events', eventId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // --- NOTIFICATIONS ---
  subscribeNotifications(userId: string, onUpdate: (notifs: AthenaNotification[]) => void) {
    const path = `users/${userId}/notifications`;
    const colRef = collection(db, 'users', userId, 'notifications');
    return onSnapshot(colRef, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AthenaNotification));
      onUpdate(notifs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  async markNotificationRead(userId: string, notifId: string): Promise<void> {
    const path = `users/${userId}/notifications/${notifId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', notifId), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // --- CHAT MESSAGES ---
  subscribeChat(userId: string, onUpdate: (messages: ChatMessage[]) => void) {
    const path = `users/${userId}/chatMessages`;
    const colRef = collection(db, 'users', userId, 'chatMessages');
    return onSnapshot(colRef, (snapshot) => {
      const messages = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as ChatMessage))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      onUpdate(messages);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  async saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
    const path = `users/${userId}/chatMessages/${message.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'chatMessages', message.id), {
        ...message,
        userId
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async clearChat(userId: string): Promise<void> {
    const path = `users/${userId}/chatMessages`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'chatMessages'));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async clearAllUserData(userId: string): Promise<void> {
    const collections = ['tasks', 'subjects', 'memories', 'sessions', 'events', 'notifications', 'chatMessages'];
    for (const col of collections) {
      try {
        const snap = await getDocs(collection(db, 'users', userId, col));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (err) {
        console.error(`Error clearing collection ${col}:`, err);
      }
    }
  }
};
