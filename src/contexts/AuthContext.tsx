import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { firestoreService } from '../lib/firestoreService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuestMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInGuestMode: () => void;
  signOutUser: () => Promise<void>;
  updateProfileState: (updates: Partial<UserProfile>) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('athena_guest_mode') === 'true';
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // If user previously chose guest mode
    if (localStorage.getItem('athena_guest_mode') === 'true') {
      const mockGuest = {
        uid: 'local-guest-student',
        displayName: 'Local Student',
        email: 'student@local.dev',
        photoURL: null
      } as unknown as User;
      setUser(mockGuest);
      setIsGuestMode(true);
      setProfile({
        name: 'Student',
        email: 'student@local.dev',
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
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false);
        try {
          // Fetch user profile or seed initial profile if first login
          let userProfile = await firestoreService.getUserProfile(currentUser.uid);
          if (!userProfile) {
            userProfile = await firestoreService.seedNewUserData(
              currentUser.uid,
              currentUser.displayName || '',
              currentUser.email || ''
            );
          }
          setProfile(userProfile);
        } catch (err) {
          console.error('Error loading user profile from Firestore:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInGuestMode = () => {
    localStorage.setItem('athena_guest_mode', 'true');
    setIsGuestMode(true);
    const mockGuest = {
      uid: 'local-guest-student',
      displayName: 'Local Student',
      email: 'student@local.dev',
      photoURL: null
    } as unknown as User;
    setUser(mockGuest);
    setProfile({
      name: 'Student',
      email: 'student@local.dev',
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
    setAuthError(null);
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      localStorage.removeItem('athena_guest_mode');
      setIsGuestMode(false);
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        let userProfile = await firestoreService.getUserProfile(cred.user.uid);
        if (!userProfile) {
          userProfile = await firestoreService.seedNewUserData(
            cred.user.uid,
            cred.user.displayName || '',
            cred.user.email || ''
          );
        }
        setProfile(userProfile);
      }
    } catch (err: unknown) {
      console.error('Sign-in failed:', err);
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      localStorage.removeItem('athena_guest_mode');
      setIsGuestMode(false);
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const updateProfileState = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = { ...profile, ...updates };
    setProfile(updated);
    if (user && !isGuestMode) {
      await firestoreService.setUserProfile(user.uid, updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuestMode,
        signInWithGoogle,
        signInGuestMode,
        signOutUser,
        updateProfileState,
        authError,
        clearAuthError: () => setAuthError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
