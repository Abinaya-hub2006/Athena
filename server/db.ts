import fs from 'fs';
import path from 'path';
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
} from '../src/types';

interface AthenaDatabaseState {
  profile: UserProfile;
  memories: MemoryItem[];
  tasks: Task[];
  subjects: StudySubject[];
  sessions: StudySession[];
  events: CalendarEvent[];
  chatHistory: ChatMessage[];
  notifications: AthenaNotification[];
  insights: InsightItem[];
  mlStatus: MLModelStatus;
  feedbackLogs: RecommendationFeedback[];
  modelWeights: Record<string, number>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'athena_store.json');

// Default Realistic Seed Data
const getInitialState = (): AthenaDatabaseState => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const inThreeDays = new Date(now);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const inThreeDaysStr = inThreeDays.toISOString().split('T')[0];

  const nextTuesday = new Date(now);
  nextTuesday.setDate(nextTuesday.getDate() + 5);
  const nextTuesdayStr = nextTuesday.toISOString().split('T')[0];

  const subjects: StudySubject[] = [
    {
      id: 'sub-dsa',
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      targetExamDate: nextTuesdayStr,
      importance: 'high',
      color: '#38BDF8',
      topics: [
        {
          id: 'top-dp',
          subjectId: 'sub-dsa',
          name: 'Dynamic Programming',
          subtopics: ['1D DP', 'Knapsack Pattern', 'Longest Common Subsequence', 'State Optimization'],
          difficulty: 'Hard',
          currentMastery: 62,
          targetMastery: 85,
          confidence: 'Medium',
          lastStudiedDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          totalSessions: 6,
          totalMinutes: 320
        },
        {
          id: 'top-graphs',
          subjectId: 'sub-dsa',
          name: 'Graphs & Shortest Paths',
          subtopics: ['BFS/DFS', 'Dijkstra', 'Topological Sort', 'Disjoint Set Union'],
          difficulty: 'Hard',
          currentMastery: 45,
          targetMastery: 80,
          confidence: 'Low',
          lastStudiedDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
          totalSessions: 4,
          totalMinutes: 190
        },
        {
          id: 'top-trees',
          subjectId: 'sub-dsa',
          name: 'Trees & Binary Search Trees',
          subtopics: ['Tree Traversals', 'LCA', 'Segment Trees'],
          difficulty: 'Medium',
          currentMastery: 80,
          targetMastery: 85,
          confidence: 'High',
          lastStudiedDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          totalSessions: 5,
          totalMinutes: 240
        }
      ]
    },
    {
      id: 'sub-dbms',
      name: 'Database Management Systems',
      code: 'CS304',
      targetExamDate: inThreeDaysStr,
      importance: 'critical',
      color: '#F59E0B',
      topics: [
        {
          id: 'top-indexing',
          subjectId: 'sub-dbms',
          name: 'Indexing & B+ Trees',
          subtopics: ['B+ Tree Insertion', 'Clustered vs Non-Clustered', 'Hash Indexing'],
          difficulty: 'Medium',
          currentMastery: 70,
          targetMastery: 90,
          confidence: 'Medium',
          lastStudiedDate: todayStr,
          totalSessions: 4,
          totalMinutes: 210
        },
        {
          id: 'top-transactions',
          subjectId: 'sub-dbms',
          name: 'Transactions & Concurrency Control',
          subtopics: ['ACID Properties', 'Two-Phase Locking (2PL)', 'Deadlock Prevention'],
          difficulty: 'Hard',
          currentMastery: 55,
          targetMastery: 80,
          confidence: 'Low',
          lastStudiedDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
          totalSessions: 3,
          totalMinutes: 140
        },
        {
          id: 'top-sql',
          subjectId: 'sub-dbms',
          name: 'Relational Algebra & Advanced SQL',
          subtopics: ['Joins', 'Window Functions', 'Subqueries'],
          difficulty: 'Easy',
          currentMastery: 88,
          targetMastery: 90,
          confidence: 'High',
          lastStudiedDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
          totalSessions: 5,
          totalMinutes: 200
        }
      ]
    },
    {
      id: 'sub-os',
      name: 'Operating Systems',
      code: 'CS301',
      targetExamDate: nextTuesdayStr,
      importance: 'high',
      color: '#10B981',
      topics: [
        {
          id: 'top-cpu-scheduling',
          subjectId: 'sub-os',
          name: 'Process & CPU Scheduling',
          subtopics: ['Round Robin', 'Multi-level Queue', 'Preemption'],
          difficulty: 'Medium',
          currentMastery: 78,
          targetMastery: 85,
          confidence: 'High',
          lastStudiedDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          totalSessions: 4,
          totalMinutes: 180
        },
        {
          id: 'top-virtual-mem',
          subjectId: 'sub-os',
          name: 'Virtual Memory & Paging',
          subtopics: ['Page Replacement Algorithms', 'TLB', 'Thrashing'],
          difficulty: 'Hard',
          currentMastery: 65,
          targetMastery: 85,
          confidence: 'Medium',
          lastStudiedDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
          totalSessions: 3,
          totalMinutes: 150
        }
      ]
    },
    {
      id: 'sub-ml',
      name: 'Machine Learning',
      code: 'CS410',
      importance: 'medium',
      color: '#8B5CF6',
      topics: [
        {
          id: 'top-supervised',
          subjectId: 'sub-ml',
          name: 'Supervised Learning & Regression',
          subtopics: ['Cost Functions', 'Regularization (L1/L2)', 'Logistic Regression'],
          difficulty: 'Easy',
          currentMastery: 92,
          targetMastery: 95,
          confidence: 'High',
          lastStudiedDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
          totalSessions: 6,
          totalMinutes: 300
        },
        {
          id: 'top-ensembles',
          subjectId: 'sub-ml',
          name: 'Ensemble Learning & XGBoost',
          subtopics: ['Random Forest', 'Gradient Boosting', 'Feature Importance'],
          difficulty: 'Medium',
          currentMastery: 75,
          targetMastery: 85,
          confidence: 'Medium',
          lastStudiedDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          totalSessions: 4,
          totalMinutes: 220
        }
      ]
    }
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Complete DBMS assignment on B+ Tree queries',
      description: 'Implement B+ Tree insertion and range queries, write brief performance analysis',
      category: 'Academic',
      priority: 'Critical',
      calculatedScore: 94,
      recommendedRank: 1,
      recommendationReason: 'Recommended first because the deadline is tomorrow and it directly affects course grade.',
      deadline: tomorrowStr + 'T23:59:00',
      estimatedEffortMinutes: 60,
      status: 'Todo',
      subject: 'Database Management Systems',
      tags: ['assignment', 'dbms', 'urgent'],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'task-2',
      title: 'Revise Dynamic Programming memoization patterns',
      description: 'Solve 3 classic problems: Coin Change, Edit Distance, and 0/1 Knapsack',
      category: 'Academic',
      priority: 'High',
      calculatedScore: 88,
      recommendedRank: 2,
      recommendationReason: 'Targeted revision: You noted DP as a weakness, and interview prep requires it.',
      estimatedEffortMinutes: 75,
      status: 'Todo',
      subject: 'Data Structures & Algorithms',
      tags: ['revision', 'dsa', 'weak-area'],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'task-3',
      title: 'Prepare OS & System fundamentals for Tuesday interview',
      description: 'Review virtual memory, threads vs processes, and synchronization primitives',
      category: 'Career',
      priority: 'High',
      calculatedScore: 82,
      recommendedRank: 3,
      recommendationReason: 'Technical interview coming up next Tuesday; consistent spaced review recommended.',
      deadline: nextTuesdayStr + 'T10:00:00',
      estimatedEffortMinutes: 90,
      status: 'Todo',
      project: 'Tech Interview Prep',
      tags: ['interview', 'os', 'career'],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'task-4',
      title: 'Implement Athena drift detection metrics & pipeline',
      description: 'Log prediction acceptance, track feature shift scores, and display drift alerts',
      category: 'Project',
      priority: 'Medium',
      calculatedScore: 71,
      recommendedRank: 4,
      recommendationReason: 'Active project deliverable; schedule for after academic commitments.',
      estimatedEffortMinutes: 60,
      status: 'In Progress',
      project: 'Athena AI',
      tags: ['project', 'mlops', 'code'],
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'task-5',
      title: 'Submit software engineering internship application to Cloudflare',
      description: 'Tailor resume for systems engineering role and upload portfolio link',
      category: 'Career',
      priority: 'High',
      calculatedScore: 68,
      recommendedRank: 5,
      recommendationReason: 'Application portal closes in 3 days; low effort (30m) with high career impact.',
      deadline: inThreeDaysStr + 'T23:59:00',
      estimatedEffortMinutes: 30,
      status: 'Todo',
      project: 'Summer Internships',
      tags: ['career', 'application'],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const memories: MemoryItem[] = [
    {
      id: 'mem-1',
      content: 'I find dynamic programming state transitions challenging and learn better when drawing decision trees.',
      category: 'Academic',
      importance: 'high',
      confidence: 0.95,
      source: 'user_explicit',
      createdDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      tags: ['weakness', 'dsa', 'dp', 'study-style'],
      isStarred: true
    },
    {
      id: 'mem-2',
      content: 'I prefer doing cognitively demanding study sessions in the evening (between 6:00 PM and 10:00 PM).',
      category: 'Preferences',
      importance: 'high',
      confidence: 0.9,
      source: 'onboarding',
      createdDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      tags: ['routine', 'focus-hours', 'energy'],
      isStarred: true
    },
    {
      id: 'mem-3',
      content: 'Technical mock interview scheduled for next Tuesday at 10:00 AM focusing on operating systems and DSA.',
      category: 'Career',
      importance: 'high',
      confidence: 1.0,
      source: 'user_explicit',
      createdDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      tags: ['interview', 'career', 'deadlines']
    },
    {
      id: 'mem-4',
      content: 'Building Athena as an Android-first personal AI operating system with clean MLOps and memory architecture.',
      category: 'Projects',
      importance: 'medium',
      confidence: 0.95,
      source: 'chat_inferred',
      createdDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      tags: ['project', 'athena', 'architecture']
    },
    {
      id: 'mem-5',
      content: 'Aim to maintain 18-20 hours of focused study per week without burning out on weekends.',
      category: 'Goals',
      importance: 'high',
      confidence: 0.85,
      source: 'user_explicit',
      createdDate: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedDate: new Date(Date.now() - 12 * 86400000).toISOString(),
      tags: ['goal', 'weekly-target', 'balance']
    },
    {
      id: 'mem-6',
      content: 'Tend to feel fatigued and postpone tasks after 3 consecutive high-difficulty coding problems without a break.',
      category: 'Personal',
      importance: 'medium',
      confidence: 0.8,
      source: 'session_log',
      createdDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      tags: ['energy', 'pacing', 'habits']
    }
  ];

  const sessions: StudySession[] = [
    {
      id: 'sess-1',
      subjectId: 'sub-dbms',
      subjectName: 'Database Management Systems',
      topicId: 'top-indexing',
      topicName: 'Indexing & B+ Trees',
      startTime: new Date(Date.now() - 3600000 * 3).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      durationMinutes: 60,
      selfRatedDifficulty: 3,
      confidence: 'Medium',
      problemsSolved: 4,
      accuracy: 80,
      notes: 'Reviewed B+ tree leaf node splitting and range scans for the assignment',
      date: todayStr
    },
    {
      id: 'sess-2',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      topicId: 'top-trees',
      topicName: 'Trees & Binary Search Trees',
      startTime: new Date(Date.now() - 86400000 - 3600000 * 4).toISOString(),
      endTime: new Date(Date.now() - 86400000 - 3600000 * 2.5).toISOString(),
      durationMinutes: 90,
      selfRatedDifficulty: 2,
      confidence: 'High',
      problemsSolved: 5,
      accuracy: 100,
      notes: 'Solved Lowest Common Ancestor and Tree diameter variations',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    },
    {
      id: 'sess-3',
      subjectId: 'sub-os',
      subjectName: 'Operating Systems',
      topicId: 'top-cpu-scheduling',
      topicName: 'Process & CPU Scheduling',
      startTime: new Date(Date.now() - 2 * 86400000 - 3600000 * 5).toISOString(),
      endTime: new Date(Date.now() - 2 * 86400000 - 3600000 * 3.5).toISOString(),
      durationMinutes: 90,
      selfRatedDifficulty: 3,
      confidence: 'Medium',
      problemsSolved: 6,
      accuracy: 85,
      notes: 'Gantt chart calculations for Round Robin quantum tuning',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 'sess-4',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      topicId: 'top-dp',
      topicName: 'Dynamic Programming',
      startTime: new Date(Date.now() - 3 * 86400000 - 3600000 * 4).toISOString(),
      endTime: new Date(Date.now() - 3 * 86400000 - 3600000 * 2).toISOString(),
      durationMinutes: 120,
      selfRatedDifficulty: 4,
      confidence: 'Medium',
      problemsSolved: 3,
      accuracy: 66,
      notes: '0/1 Knapsack memoization table. Visualized bottom-up state progression',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
    }
  ];

  const events: CalendarEvent[] = [
    {
      id: 'evt-1',
      title: 'DBMS Assignment 3 Submission Deadline',
      type: 'Assignment',
      date: tomorrowStr,
      time: '23:59',
      reminderSchedule: ['1 day before', '3 hours before'],
      isCompleted: false
    },
    {
      id: 'evt-2',
      title: 'Technical Mock Interview with Senior Engineer',
      type: 'Interview',
      date: nextTuesdayStr,
      time: '10:00',
      locationOrUrl: 'Google Meet',
      reminderSchedule: ['1 day before', '1 hour before'],
      isCompleted: false
    },
    {
      id: 'evt-3',
      title: 'Operating Systems Midterm Exam',
      type: 'Exam',
      date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      time: '09:30',
      locationOrUrl: 'Hall B - Room 204',
      reminderSchedule: ['1 week before', '3 days before', '1 day before'],
      isCompleted: false
    },
    {
      id: 'evt-4',
      title: 'Cloudflare Internship Application Deadline',
      type: 'Project Deadline',
      date: inThreeDaysStr,
      time: '23:59',
      reminderSchedule: ['1 day before'],
      isCompleted: false
    }
  ];

  const notifications: AthenaNotification[] = [
    {
      id: 'notif-1',
      title: 'DBMS Assignment Due Tomorrow',
      message: 'Your B+ Tree assignment is due tomorrow at 23:59. Finish the last 60 minutes tonight to stay stress-free.',
      type: 'urgent_deadline',
      scheduledTime: 'Today at 6:00 PM',
      isRead: false,
      actionableTaskId: 'task-1'
    },
    {
      id: 'notif-2',
      title: 'Spaced Repetition: Graphs Topic Inactive',
      message: 'You have not reviewed Graphs & Shortest Paths in 6 days. Want to do a gentle 25-minute BFS/DFS refresher?',
      type: 'study_suggestion',
      scheduledTime: 'Yesterday',
      isRead: false
    },
    {
      id: 'notif-3',
      title: 'Interview Preparation Cadence',
      message: 'Mock interview is scheduled for Tuesday. Your OS concurrency is estimated at 50% mastery — recommended 45m review.',
      type: 'interview_prep',
      scheduledTime: '2 days ago',
      isRead: true,
      actionableTaskId: 'task-3'
    }
  ];

  const insights: InsightItem[] = [
    {
      id: 'ins-1',
      title: 'Strong Study Consistency This Week',
      description: 'You logged 4 study sessions across 4 consecutive days, averaging 90 minutes per session.',
      category: 'consistency',
      supportingData: '6.0 hours logged over last 4 days (75% of your weekly target pace).',
      severity: 'positive',
      date: todayStr
    },
    {
      id: 'ins-2',
      title: 'Graphs Topic Cold Spot (6 Days Inactive)',
      description: 'Retention decay is beginning to accelerate for Graph algorithms since your last session on Monday.',
      category: 'retention',
      supportingData: 'Mastery is estimated at 45% (target 80%). A 30-minute review prevents further decay.',
      severity: 'action_needed',
      date: todayStr
    },
    {
      id: 'ins-3',
      title: 'Evening Peak Problem-Solving Performance',
      description: 'Sessions started between 6:00 PM and 9:00 PM show 85% problem accuracy compared to 65% in afternoons.',
      category: 'pattern',
      supportingData: 'Based on 14 recorded problem attempts across 4 recent sessions.',
      severity: 'positive',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    },
    {
      id: 'ins-4',
      title: 'Tendency to Postpone High-Effort Tasks (>90m)',
      description: 'Tasks estimated over 90 minutes have a 2.4x higher postponement rate than bite-sized 45m tasks.',
      category: 'workload',
      supportingData: 'Recommendation: Let Athena split large milestones like the OS review into two 45m chunks.',
      severity: 'neutral',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
    }
  ];

  const mlStatus: MLModelStatus = {
    currentModelVersion: 'v1.2-gradient-ranker',
    baselineVersion: 'v1.0-heuristic-scorer',
    deployedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    totalPredictions: 48,
    acceptanceRate: 83.3,
    averageLatencyMs: 14.2,
    trainingSamplesCount: 142,
    driftStatus: 'No Drift',
    driftMetrics: {
      acceptanceDriftPercent: 2.1,
      featureShiftScore: 0.04,
      lastDriftCheck: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    recentExperiments: [
      {
        id: 'exp-103',
        name: 'Gradient-Boosted Priority Ranker',
        modelType: 'LightGBM / ScoreRank',
        accuracy: 0.88,
        ndcg: 0.92,
        status: 'Deployed',
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
      },
      {
        id: 'exp-102',
        name: 'Elastic-Net Linear Scoring Baseline',
        modelType: 'Ridge Logistic',
        accuracy: 0.79,
        ndcg: 0.84,
        status: 'Archived',
        date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0]
      },
      {
        id: 'exp-101',
        name: 'Heuristic Rule-Weighted Baseline',
        modelType: 'Linear Fallback',
        accuracy: 0.71,
        ndcg: 0.76,
        status: 'Archived',
        date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]
      }
    ]
  };

  const chatHistory: ChatMessage[] = [
    {
      id: 'chat-init-1',
      sender: 'athena',
      text: "Good evening. I'm Athena, your personal second brain. I'm keeping track of your DBMS assignment due tomorrow, your dynamic programming revision, and your upcoming tech interview. What would you like to work on tonight?",
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Plan my evening',
        'What are my priorities today?',
        'I only have 2 hours today',
        'Log a 45-min study session'
      ]
    }
  ];

  const modelWeights: Record<string, number> = {
    deadlineWeight: 0.35,
    importanceWeight: 0.25,
    masteryGapWeight: 0.18,
    effortEfficiencyWeight: 0.12,
    goalAlignmentWeight: 0.10
  };

  return {
    profile: {
      name: 'Abinayak',
      email: 'abinayak829@gmail.com',
      preferredStudyHours: 'Evening (6:00 PM - 10:00 PM)',
      dailyFocusTargetMinutes: 180,
      quietHours: {
        enabled: true,
        start: '23:00',
        end: '07:00'
      },
      notifications: {
        upcomingDeadlines: true,
        studyReminders: true,
        dailyBriefing: true,
        quietHoursMute: true,
        maxPerDay: 4
      },
      onboardingCompleted: true,
      theme: 'dark'
    },
    memories,
    tasks,
    subjects,
    sessions,
    events,
    chatHistory,
    notifications,
    insights,
    mlStatus,
    feedbackLogs: [
      {
        id: 'fb-1',
        taskId: 'task-1',
        feedback: 'Helpful',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'fb-2',
        taskId: 'task-2',
        feedback: 'Helpful',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    modelWeights
  };
};

class AthenaStore {
  private state: AthenaDatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): AthenaDatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...getInitialState(), ...parsed };
      }
    } catch (err) {
      console.error('Error loading DB, using fresh initial state:', err);
    }
    const fresh = getInitialState();
    this.saveDirect(fresh);
    return fresh;
  }

  private saveDirect(state: AthenaDatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  private save() {
    this.saveDirect(this.state);
  }

  // --- Profile ---
  getProfile(): UserProfile {
    return this.state.profile;
  }

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.state.profile = { ...this.state.profile, ...updates };
    this.save();
    return this.state.profile;
  }

  // --- Memories ---
  getMemories(searchQuery?: string, category?: string): MemoryItem[] {
    let list = [...this.state.memories];
    if (category && category !== 'All') {
      list = list.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q)
      );
    }
    // Starred first, then latest
    return list.sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  }

  addMemory(memory: Omit<MemoryItem, 'id' | 'createdDate' | 'updatedDate'>): MemoryItem {
    const item: MemoryItem = {
      ...memory,
      id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
    this.state.memories.unshift(item);
    this.save();
    return item;
  }

  updateMemory(id: string, updates: Partial<MemoryItem>): MemoryItem | null {
    const idx = this.state.memories.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.state.memories[idx] = {
      ...this.state.memories[idx],
      ...updates,
      updatedDate: new Date().toISOString()
    };
    this.save();
    return this.state.memories[idx];
  }

  deleteMemory(id: string): boolean {
    const initialLen = this.state.memories.length;
    this.state.memories = this.state.memories.filter((m) => m.id !== id);
    this.save();
    return this.state.memories.length < initialLen;
  }

  forgetMemoryByQuery(query: string): number {
    const q = query.toLowerCase();
    const initialLen = this.state.memories.length;
    this.state.memories = this.state.memories.filter((m) => !m.content.toLowerCase().includes(q));
    const deletedCount = initialLen - this.state.memories.length;
    this.save();
    return deletedCount;
  }

  clearAllMemories(): void {
    this.state.memories = [];
    this.save();
  }

  // --- Tasks ---
  getTasks(): Task[] {
    return this.state.tasks;
  }

  getTask(id: string): Task | undefined {
    return this.state.tasks.find((t) => t.id === id);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      status: task.status || 'Todo',
      tags: task.tags || [],
      postponedCount: 0
    };
    this.state.tasks.push(newTask);
    this.save();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.state.tasks[idx] = { ...this.state.tasks[idx], ...updates };
    this.save();
    return this.state.tasks[idx];
  }

  completeTask(idOrTitle: string): Task | null {
    const target = this.state.tasks.find(
      (t) => t.id === idOrTitle || t.title.toLowerCase().includes(idOrTitle.toLowerCase())
    );
    if (!target) return null;
    target.status = 'Completed';
    target.completedAt = new Date().toISOString();
    this.save();
    return target;
  }

  deleteTask(id: string): boolean {
    const initLen = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    this.save();
    return this.state.tasks.length < initLen;
  }

  // --- Subjects & Topics ---
  getSubjects(): StudySubject[] {
    return this.state.subjects;
  }

  addSubject(subject: Omit<StudySubject, 'id'>): StudySubject {
    const item: StudySubject = {
      ...subject,
      id: 'sub-' + Date.now()
    };
    this.state.subjects.push(item);
    this.save();
    return item;
  }

  deleteSubject(id: string): boolean {
    const initLen = this.state.subjects.length;
    this.state.subjects = this.state.subjects.filter((s) => s.id !== id);
    this.save();
    return this.state.subjects.length < initLen;
  }

  updateTopicProgress(topicNameOrId: string, masteryScore: number, confidence?: 'Low' | 'Medium' | 'High'): boolean {
    for (const sub of this.state.subjects) {
      for (const topic of sub.topics) {
        if (topic.id === topicNameOrId || topic.name.toLowerCase().includes(topicNameOrId.toLowerCase())) {
          topic.currentMastery = Math.min(100, Math.max(0, masteryScore));
          if (confidence) topic.confidence = confidence;
          topic.lastStudiedDate = new Date().toISOString().split('T')[0];
          this.save();
          return true;
        }
      }
    }
    return false;
  }

  // --- Sessions ---
  getSessions(): StudySession[] {
    return this.state.sessions;
  }

  logStudySession(session: Omit<StudySession, 'id'>): StudySession {
    const item: StudySession = {
      ...session,
      id: 'sess-' + Date.now()
    };
    this.state.sessions.unshift(item);
    
    // Auto update topic session count and minutes
    for (const sub of this.state.subjects) {
      if (sub.id === session.subjectId || sub.name.toLowerCase() === session.subjectName.toLowerCase()) {
        for (const topic of sub.topics) {
          if (topic.id === session.topicId || topic.name.toLowerCase() === session.topicName.toLowerCase()) {
            topic.totalSessions += 1;
            topic.totalMinutes += session.durationMinutes;
            topic.lastStudiedDate = session.date;
            // Incremental mastery bump estimate based on accuracy and difficulty
            const difficultyFactor = session.selfRatedDifficulty >= 4 ? 3 : 2;
            const accuracyFactor = (session.accuracy || 70) / 100;
            const gain = Math.round(difficultyFactor * accuracyFactor);
            topic.currentMastery = Math.min(100, topic.currentMastery + gain);
            if (session.confidence) topic.confidence = session.confidence;
            break;
          }
        }
      }
    }
    this.save();
    return item;
  }

  // --- Calendar Events ---
  getEvents(): CalendarEvent[] {
    return this.state.events;
  }

  addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const item: CalendarEvent = {
      ...event,
      id: 'evt-' + Date.now()
    };
    this.state.events.push(item);
    this.save();
    return item;
  }

  deleteEvent(id: string): boolean {
    const initLen = this.state.events.length;
    this.state.events = this.state.events.filter((e) => e.id !== id);
    this.save();
    return this.state.events.length < initLen;
  }

  // --- Chat ---
  getChatHistory(): ChatMessage[] {
    return this.state.chatHistory;
  }

  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const item: ChatMessage = {
      ...msg,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.state.chatHistory.push(item);
    // Keep last 100 messages
    if (this.state.chatHistory.length > 100) {
      this.state.chatHistory = this.state.chatHistory.slice(-100);
    }
    this.save();
    return item;
  }

  clearChatHistory(): void {
    this.state.chatHistory = [];
    this.save();
  }

  // --- Notifications ---
  getNotifications(): AthenaNotification[] {
    return this.state.notifications;
  }

  markNotificationRead(id: string): void {
    const n = this.state.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.save();
    }
  }

  markAllNotificationsRead(): void {
    this.state.notifications.forEach((n) => (n.isRead = true));
    this.save();
  }

  // --- Insights ---
  getInsights(): InsightItem[] {
    return this.state.insights;
  }

  // --- ML & Feedback ---
  getMLStatus(): MLModelStatus {
    return this.state.mlStatus;
  }

  updateMLStatus(updates: Partial<MLModelStatus>): MLModelStatus {
    this.state.mlStatus = { ...this.state.mlStatus, ...updates };
    this.save();
    return this.state.mlStatus;
  }

  getModelWeights(): Record<string, number> {
    return this.state.modelWeights;
  }

  updateModelWeights(weights: Record<string, number>): void {
    this.state.modelWeights = { ...this.state.modelWeights, ...weights };
    this.save();
  }

  recordFeedback(feedback: Omit<RecommendationFeedback, 'id' | 'timestamp'>): RecommendationFeedback {
    const item: RecommendationFeedback = {
      ...feedback,
      id: 'fb-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.state.feedbackLogs.push(item);
    this.state.mlStatus.totalPredictions += 1;
    this.state.mlStatus.trainingSamplesCount += 1;
    
    // Adapt online weights slightly based on feedback
    if (feedback.feedback === 'Helpful') {
      const positiveCount = this.state.feedbackLogs.filter((f) => f.feedback === 'Helpful').length;
      this.state.mlStatus.acceptanceRate = Math.round((positiveCount / this.state.feedbackLogs.length) * 100);
    } else if (feedback.feedback === 'Too difficult') {
      // increase effort weight to favor manageable tasks
      this.state.modelWeights.effortEfficiencyWeight = Math.min(0.3, this.state.modelWeights.effortEfficiencyWeight + 0.02);
    } else if (feedback.feedback === 'Not important') {
      this.state.modelWeights.importanceWeight = Math.min(0.4, this.state.modelWeights.importanceWeight + 0.02);
    }
    
    this.save();
    return item;
  }

  // --- Full Reset / Export ---
  getFullExport() {
    return {
      exportedAt: new Date().toISOString(),
      user: this.state.profile,
      memories: this.state.memories,
      tasks: this.state.tasks,
      subjects: this.state.subjects,
      studySessions: this.state.sessions,
      calendarEvents: this.state.events,
      insights: this.state.insights,
      mlModelStatus: this.state.mlStatus,
      chatHistoryCount: this.state.chatHistory.length
    };
  }

  resetToDemo(): void {
    this.state = getInitialState();
    this.save();
  }

  clearAll(userName?: string, userEmail?: string): void {
    this.state = {
      profile: {
        name: userName || 'Student',
        email: userEmail || '',
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
      },
      memories: [],
      tasks: [],
      subjects: [],
      sessions: [],
      events: [],
      chatHistory: [],
      notifications: [],
      insights: [],
      mlStatus: getInitialState().mlStatus,
      feedbackLogs: [],
      modelWeights: getInitialState().modelWeights
    };
    this.save();
  }
}

export const db = new AthenaStore();
