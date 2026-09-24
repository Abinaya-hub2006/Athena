export type MemoryCategory = 
  | 'Personal' 
  | 'Academic' 
  | 'Career' 
  | 'Projects' 
  | 'Tasks' 
  | 'Goals' 
  | 'Preferences';

export type ImportanceLevel = 'high' | 'medium' | 'low';

export interface MemoryItem {
  id: string;
  content: string;
  category: MemoryCategory;
  importance: ImportanceLevel;
  confidence: number; // 0.0 to 1.0
  source: 'user_explicit' | 'chat_inferred' | 'session_log' | 'onboarding';
  createdDate: string;
  updatedDate: string;
  expirationDate?: string;
  tags: string[];
  isStarred?: boolean;
}

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed' | 'Deferred' | 'Cancelled';
export type TaskCategory = 'Academic' | 'Career' | 'Project' | 'Personal';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  calculatedScore?: number;
  recommendedRank?: number;
  recommendationReason?: string;
  deadline?: string; // ISO date string or YYYY-MM-DD
  estimatedEffortMinutes: number;
  status: TaskStatus;
  project?: string;
  subject?: string;
  tags: string[];
  recurrence?: 'none' | 'daily' | 'weekly';
  completedAt?: string;
  postponedCount?: number;
  createdAt: string;
}

export interface StudyTopic {
  id: string;
  subjectId: string;
  name: string;
  subtopics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  currentMastery: number; // 0 - 100 estimated mastery
  targetMastery: number;
  confidence: 'Low' | 'Medium' | 'High';
  lastStudiedDate?: string;
  totalSessions: number;
  totalMinutes: number;
}

export interface StudySubject {
  id: string;
  name: string;
  code: string;
  targetExamDate?: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  color: string;
  topics: StudyTopic[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  selfRatedDifficulty: number; // 1 to 5
  confidence: 'Low' | 'Medium' | 'High';
  problemsSolved?: number;
  accuracy?: number; // 0 - 100
  notes?: string;
  date: string;
}

export type CalendarEventType = 
  | 'Exam' 
  | 'Assignment' 
  | 'Interview' 
  | 'Meeting' 
  | 'Hackathon' 
  | 'Project Deadline' 
  | 'Personal Reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  locationOrUrl?: string;
  reminderSchedule: string[]; // e.g. ["1 day before", "1 hour before"]
  isCompleted?: boolean;
}

export interface DailyPlan {
  date: string;
  availableHours: number;
  energyLevel: 'High' | 'Normal' | 'Low' | 'Tired';
  mustDo: Task[];
  shouldDo: Task[];
  ifYouHaveTime: Task[];
  suggestedBreakMinutes: number;
  athenaNote: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'athena';
  text: string;
  timestamp: string;
  toolInvocations?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: string;
  }>;
  suggestedActions?: string[];
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
  preferredStudyHours: string; // e.g. "Evening (6 PM - 10 PM)"
  dailyFocusTargetMinutes: number;
  quietHours: {
    enabled: boolean;
    start: string; // e.g. "23:00"
    end: string;   // e.g. "07:00"
  };
  notifications: {
    upcomingDeadlines: boolean;
    studyReminders: boolean;
    dailyBriefing: boolean;
    quietHoursMute: boolean;
    maxPerDay: number;
  };
  onboardingCompleted: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'workload' | 'pattern' | 'retention';
  supportingData: string;
  severity: 'positive' | 'neutral' | 'action_needed';
  date: string;
}

export interface AthenaNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgent_deadline' | 'study_suggestion' | 'interview_prep' | 'routine';
  scheduledTime: string;
  isRead: boolean;
  actionableTaskId?: string;
}

export interface MLModelStatus {
  currentModelVersion: string;
  baselineVersion: string;
  deployedAt: string;
  totalPredictions: number;
  acceptanceRate: number;
  averageLatencyMs: number;
  trainingSamplesCount: number;
  driftStatus: 'No Drift' | 'Mild Drift Detected' | 'Retraining Triggered';
  driftMetrics: {
    acceptanceDriftPercent: number;
    featureShiftScore: number;
    lastDriftCheck: string;
  };
  recentExperiments: Array<{
    id: string;
    name: string;
    modelType: string;
    accuracy: number;
    ndcg: number;
    status: 'Deployed' | 'Candidate' | 'Archived';
    date: string;
  }>;
}

export interface RecommendationFeedback {
  id: string;
  taskId: string;
  feedback: 'Helpful' | 'Not helpful' | 'Too difficult' | 'Too easy' | 'Not important' | 'Not now';
  timestamp: string;
}
