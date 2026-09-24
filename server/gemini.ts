import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from './db';
import { mlEngine } from './ml_engine';
import { Task, MemoryItem, StudySession } from '../src/types';

// Tool Declarations for Gemini
const createTaskDeclaration: FunctionDeclaration = {
  name: 'create_task',
  description: 'Create a new task, assignment, or study action in Athena second brain.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the task or assignment' },
      category: {
        type: Type.STRING,
        description: 'Category: Academic, Career, Project, or Personal'
      },
      priority: {
        type: Type.STRING,
        description: 'Priority: Critical, High, Medium, or Low'
      },
      deadline: {
        type: Type.STRING,
        description: 'Deadline ISO date or human string (e.g., 2026-09-10 or Friday)'
      },
      estimatedEffortMinutes: {
        type: Type.NUMBER,
        description: 'Estimated effort duration in minutes, e.g. 60'
      },
      subject: { type: Type.STRING, description: 'Academic subject name if applicable' },
      project: { type: Type.STRING, description: 'Project name if applicable' }
    },
    required: ['title']
  }
};

const completeTaskDeclaration: FunctionDeclaration = {
  name: 'complete_task',
  description: 'Mark an existing task as completed in Athena.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskTitleOrId: {
        type: Type.STRING,
        description: 'The title or ID of the task to mark as completed'
      }
    },
    required: ['taskTitleOrId']
  }
};

const saveMemoryDeclaration: FunctionDeclaration = {
  name: 'save_memory',
  description: 'Store an intentional long-term memory, preference, habit, or life context about the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: 'The fact or context to remember' },
      category: {
        type: Type.STRING,
        description: 'Category: Personal, Academic, Career, Projects, Tasks, Goals, or Preferences'
      },
      importance: {
        type: Type.STRING,
        description: 'Importance: high, medium, or low'
      }
    },
    required: ['content']
  }
};

const forgetMemoryDeclaration: FunctionDeclaration = {
  name: 'forget_memory',
  description: 'Delete or remove memories matching a specific topic or query from Athena memory.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Topic or keyword to forget from memory' }
    },
    required: ['query']
  }
};

const logStudySessionDeclaration: FunctionDeclaration = {
  name: 'log_study_session',
  description: 'Log a completed study session with subject, topic, and duration.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING, description: 'Subject studied, e.g., Operating Systems' },
      topic: { type: Type.STRING, description: 'Topic studied, e.g., Dynamic Programming' },
      durationMinutes: { type: Type.NUMBER, description: 'Duration in minutes' },
      confidence: { type: Type.STRING, description: 'Confidence: Low, Medium, High' },
      notes: { type: Type.STRING, description: 'Optional session notes or problems solved' }
    },
    required: ['subject', 'durationMinutes']
  }
};

const getTodayPlanDeclaration: FunctionDeclaration = {
  name: 'get_today_plan',
  description: 'Generate or retrieve an adaptive daily focus plan tailored to available hours and energy.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      availableHours: { type: Type.NUMBER, description: 'Available hours today (e.g. 2, 3, 4)' },
      energyLevel: {
        type: Type.STRING,
        description: 'User energy level: High, Normal, Low, or Tired'
      }
    }
  }
};

const getRecommendationsDeclaration: FunctionDeclaration = {
  name: 'get_recommendations',
  description: 'Get Athena smart ranked recommendations for what the user should work on next.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      limit: { type: Type.NUMBER, description: 'Number of recommendations to return' }
    }
  }
};

const systemInstruction = `You are Athena, a thoughtful, intelligent, and calm personal AI second brain and trusted assistant.
Your goal is to help the user manage their studies, tasks, deadlines, projects, priorities, and long-term memory.
Guidelines:
1. Tone: Calm, practical, concise, supportive, and honest. Avoid sounding robotic, judgmental, or overly enthusiastic/motivational (never say "Great job!" or lecture the user).
2. Actionable Intent: When the user mentions deadlines or tasks (e.g., "I have an assignment due Friday"), invoke the 'create_task' tool.
3. Memory: When the user asks to remember something or reveals key personal/academic context (e.g., "Remember that I am weak in dynamic programming"), invoke 'save_memory'.
4. Forgetting: When the user asks to forget something, invoke 'forget_memory'.
5. Study Sessions: When the user says they studied something, invoke 'log_study_session'.
6. Recommendations: Always provide clear, objective reasoning when suggesting what to do next.
7. Balance: Respect realistic human limits; never force rigid timetables.
`;

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Executes a tool call directly on the Athena data store
export function executeAthenaTool(name: string, args: Record<string, unknown>): { result: string; payload?: unknown } {
  if (name === 'create_task') {
    const title = (args.title as string) || 'New Task';
    const category = (args.category as Task['category']) || 'Academic';
    const priority = (args.priority as Task['priority']) || 'High';
    const effort = Number(args.estimatedEffortMinutes) || 60;
    
    let deadline: string | undefined = undefined;
    if (args.deadline) {
      const dStr = String(args.deadline).toLowerCase();
      const now = new Date();
      if (dStr.includes('friday')) {
        const d = new Date(now);
        const day = d.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        deadline = d.toISOString().split('T')[0] + 'T23:59:00';
      } else if (dStr.includes('monday')) {
        const d = new Date(now);
        const day = d.getDay();
        const diff = (1 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        deadline = d.toISOString().split('T')[0] + 'T23:59:00';
      } else if (dStr.includes('tomorrow')) {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        deadline = d.toISOString().split('T')[0] + 'T23:59:00';
      } else {
        deadline = String(args.deadline);
      }
    }

    const newTask = db.addTask({
      title,
      category,
      priority,
      deadline,
      estimatedEffortMinutes: effort,
      status: 'Todo',
      subject: (args.subject as string) || undefined,
      project: (args.project as string) || undefined,
      tags: [category.toLowerCase()]
    });

    return {
      result: `Created task: "${newTask.title}" (${newTask.priority} priority, estimated ${newTask.estimatedEffortMinutes}m).`,
      payload: newTask
    };
  }

  if (name === 'complete_task') {
    const target = String(args.taskTitleOrId || '');
    const completed = db.completeTask(target);
    if (completed) {
      return {
        result: `Marked task as completed: "${completed.title}".`,
        payload: completed
      };
    }
    return { result: `Could not find an active task matching "${target}".` };
  }

  if (name === 'save_memory') {
    const content = String(args.content || '');
    const category = (args.category as MemoryItem['category']) || 'Academic';
    const importance = (args.importance as MemoryItem['importance']) || 'high';
    const memory = db.addMemory({
      content,
      category,
      importance,
      confidence: 0.95,
      source: 'user_explicit',
      tags: [category.toLowerCase()],
      isStarred: importance === 'high'
    });
    return {
      result: `Saved to Athena long-term memory under ${category}.`,
      payload: memory
    };
  }

  if (name === 'forget_memory') {
    const query = String(args.query || '');
    const count = db.forgetMemoryByQuery(query);
    return {
      result: `Removed ${count} memory record(s) matching "${query}".`
    };
  }

  if (name === 'log_study_session') {
    const subjectName = String(args.subject || 'General Study');
    const topicName = String(args.topic || 'Revision');
    const duration = Number(args.durationMinutes) || 60;
    const session = db.logStudySession({
      subjectId: 'sub-custom',
      subjectName,
      topicId: 'top-custom',
      topicName,
      startTime: new Date(Date.now() - duration * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: duration,
      selfRatedDifficulty: 3,
      confidence: (args.confidence as 'Low' | 'Medium' | 'High') || 'Medium',
      notes: (args.notes as string) || '',
      date: new Date().toISOString().split('T')[0]
    });
    return {
      result: `Logged ${duration}-minute study session for ${subjectName}: ${topicName}.`,
      payload: session
    };
  }

  if (name === 'get_today_plan') {
    const hours = Number(args.availableHours) || 3;
    const energy = (args.energyLevel as 'High' | 'Normal' | 'Low' | 'Tired') || 'Normal';
    const plan = mlEngine.generateDailyPlan(hours, energy);
    return {
      result: `Generated plan with ${plan.mustDo.length} Must-Do and ${plan.shouldDo.length} Should-Do items. Note: ${plan.athenaNote}`,
      payload: plan
    };
  }

  if (name === 'get_recommendations') {
    const ranked = mlEngine.rankTasks(db.getTasks(), db.getSubjects()).slice(0, 3);
    return {
      result: `Top 3 recommended focuses: ${ranked.map((t, i) => `${i + 1}. ${t.title} (${t.recommendationReason})`).join(' ')}`,
      payload: ranked
    };
  }

  return { result: `Executed tool: ${name}` };
}

// Fallback intelligent intent parser for zero-configuration / offline situations
function fallbackProcessMessage(userText: string): { responseText: string; toolInvocations: Array<{ name: string; args: Record<string, unknown>; result?: string }> } {
  const lower = userText.toLowerCase();
  const toolInvocations: Array<{ name: string; args: Record<string, unknown>; result?: string }> = [];
  let responseText = '';

  // 1. "Remember that ..." / "Remember this"
  if (lower.startsWith('remember that') || lower.startsWith('remember this:') || lower.startsWith('remember:')) {
    const fact = userText.replace(/^(remember that|remember this:|remember:)\s*/i, '').trim();
    let category: MemoryItem['category'] = 'Academic';
    if (lower.includes('interview') || lower.includes('job') || lower.includes('career')) category = 'Career';
    if (lower.includes('prefer') || lower.includes('routine') || lower.includes('hours')) category = 'Preferences';
    if (lower.includes('project') || lower.includes('athena')) category = 'Projects';

    const action = executeAthenaTool('save_memory', { content: fact, category, importance: 'high' });
    toolInvocations.push({ name: 'save_memory', args: { content: fact, category }, result: action.result });
    responseText = `I've committed that to your long-term memory: "${fact}". I'll factor this in whenever recommending study topics or scheduling tasks.`;
    return { responseText, toolInvocations };
  }

  // 2. "Forget what I told you about ..."
  if (lower.includes('forget what i told you about') || lower.startsWith('forget ')) {
    const query = userText.replace(/.*forget (what i told you about )?/i, '').replace(/[.?]/g, '').trim();
    const action = executeAthenaTool('forget_memory', { query });
    toolInvocations.push({ name: 'forget_memory', args: { query }, result: action.result });
    responseText = `Understood. I have removed the memories related to "${query}" from your second brain.`;
    return { responseText, toolInvocations };
  }

  // 3. Assignment / Task creation
  if (lower.includes('assignment due') || lower.includes('task due') || lower.includes('i have an assignment') || lower.includes('i need to prepare for')) {
    let title = 'New Assignment';
    let category: Task['category'] = 'Academic';
    let priority: Task['priority'] = 'High';
    let effort = 60;
    let deadline = 'Friday';

    if (lower.includes('os assignment') || lower.includes('operating systems')) {
      title = 'Complete Operating Systems Assignment';
      category = 'Academic';
    } else if (lower.includes('dbms assignment')) {
      title = 'Complete DBMS Assignment';
      category = 'Academic';
    } else if (lower.includes('interview')) {
      title = 'Prepare for Technical Interview';
      category = 'Career';
      effort = 90;
      deadline = 'next Tuesday';
    } else {
      title = userText.replace(/^(i have an?|i need to)\s*/i, '').replace(/[.?]/g, '').trim();
    }

    if (lower.includes('due friday')) deadline = 'Friday';
    if (lower.includes('due monday')) deadline = 'Monday';
    if (lower.includes('due tomorrow')) deadline = 'Tomorrow';

    const action = executeAthenaTool('create_task', {
      title,
      category,
      priority,
      deadline,
      estimatedEffortMinutes: effort
    });

    toolInvocations.push({
      name: 'create_task',
      args: { title, category, priority, deadline, estimatedEffortMinutes: effort },
      result: action.result
    });

    responseText = `Got it. I've logged "${title}" due ${deadline} in your tasks and calendar. I'll remind you proactively before the deadline.`;
    return { responseText, toolInvocations };
  }

  // 4. "I studied X for Y hours today"
  if (lower.includes('i studied') || lower.includes('studied')) {
    let subject = 'Operating Systems';
    let duration = 120;
    if (lower.includes('dbms')) subject = 'Database Management Systems';
    if (lower.includes('dynamic programming') || lower.includes('dp') || lower.includes('dsa')) subject = 'Data Structures & Algorithms';
    
    const hourMatch = lower.match(/(\d+)\s*hour/);
    if (hourMatch) duration = parseInt(hourMatch[1]) * 60;
    const minMatch = lower.match(/(\d+)\s*min/);
    if (minMatch) duration = parseInt(minMatch[1]);

    const action = executeAthenaTool('log_study_session', {
      subject,
      topic: 'General Revision',
      durationMinutes: duration,
      confidence: 'High'
    });

    toolInvocations.push({
      name: 'log_study_session',
      args: { subject, durationMinutes: duration },
      result: action.result
    });

    responseText = `Great session logged: ${duration} minutes on ${subject}. Your study consistency and weekly focus hours have been updated accordingly.`;
    return { responseText, toolInvocations };
  }

  // 5. "Plan my evening" / "What should I do today?" / "I only have X hours"
  if (lower.includes('plan my evening') || lower.includes('what should i do') || lower.includes('only have') || lower.includes('plan my day')) {
    let hours = 3;
    const hourMatch = lower.match(/(\d+)\s*hour/);
    if (hourMatch) hours = parseInt(hourMatch[1]);
    const isTired = lower.includes('tired') || lower.includes('exhausted') || lower.includes('low energy');

    const action = executeAthenaTool('get_today_plan', {
      availableHours: hours,
      energyLevel: isTired ? 'Tired' : 'Normal'
    });

    const plan = action.payload as ReturnType<typeof mlEngine.generateDailyPlan>;
    toolInvocations.push({
      name: 'get_today_plan',
      args: { availableHours: hours, energyLevel: isTired ? 'Tired' : 'Normal' },
      result: action.result
    });

    if (isTired) {
      responseText = `Since you're feeling tired, let's keep tonight realistic: focus solely on "${plan.mustDo[0]?.title || 'your top assignment'}" for about 45 minutes, then recharge. We'll leave dynamic programming for when your energy is higher tomorrow.`;
    } else {
      const mustTitles = plan.mustDo.map((t) => t.title).join(', ');
      const shouldTitles = plan.shouldDo.map((t) => t.title).join(', ');
      responseText = `With ${hours} hours tonight, here is the recommended sequence:\n1. Must Do: ${mustTitles || 'Finish the closest deadline'}\n2. Then: ${shouldTitles || 'Revise key concepts'}\n\n${plan.athenaNote}`;
    }
    return { responseText, toolInvocations };
  }

  // 6. "Mark assignment as completed" / "Completed X"
  if (lower.includes('mark') && (lower.includes('completed') || lower.includes('done'))) {
    const action = executeAthenaTool('complete_task', { taskTitleOrId: 'assignment' });
    toolInvocations.push({ name: 'complete_task', args: { taskTitleOrId: 'assignment' }, result: action.result });
    responseText = `Done. I've updated your tasks and recalculated your upcoming priorities. Excellent progress!`;
    return { responseText, toolInvocations };
  }

  // 7. General Priorities inquiry
  if (lower.includes('priorities') || lower.includes('recommend') || lower.includes('what matters')) {
    const action = executeAthenaTool('get_recommendations', { limit: 3 });
    const recs = action.payload as Task[];
    toolInvocations.push({ name: 'get_recommendations', args: { limit: 3 }, result: action.result });

    responseText = `Here are your top priorities right now:\n` +
      recs.map((t, i) => `${i + 1}. **${t.title}**\n   *Reason*: ${t.recommendationReason}`).join('\n\n');
    return { responseText, toolInvocations };
  }

  // Default thoughtful assistant answer
  responseText = `I'm tracking your studies, tasks, and context. You can tell me to remember facts, log study time, schedule an assignment, or ask me to adapt your evening plan. How would you like to proceed?`;
  return { responseText, toolInvocations };
}

export interface UserChatContext {
  userId?: string;
  memories?: Array<{ content: string }>;
  tasks?: Array<{ id: string; title: string; priority: string; deadline?: string }>;
}

/**
 * Main chat handler: uses Gemini with function calling when API key is present;
 * gracefully falls back to local intent parser if key is missing or offline.
 */
export async function processAthenaChat(
  userMessage: string,
  userContext?: UserChatContext
): Promise<{
  responseText: string;
  toolInvocations: Array<{ name: string; args: Record<string, unknown>; result?: string; payload?: unknown }>;
}> {
  const ai = getAiClient();

  if (!ai) {
    // Run local intent executor
    return fallbackProcessMessage(userMessage);
  }

  try {
    // Build context snippet from active DB state or userContext for the LLM
    const activeTasks = userContext?.tasks && userContext.tasks.length > 0
      ? userContext.tasks
      : db.getTasks().filter((t) => t.status !== 'Completed').slice(0, 5);

    const recentMemories = userContext?.memories && userContext.memories.length > 0
      ? userContext.memories
      : db.getMemories().slice(0, 5);

    const upcomingEvents = db.getEvents().slice(0, 4);

    const contextPrompt = `Current Athena State for User:
Active Tasks: ${JSON.stringify(activeTasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, deadline: t.deadline })))}
Known Long-Term Memories: ${JSON.stringify(recentMemories.map((m) => m.content))}
Upcoming Events: ${JSON.stringify(upcomingEvents.map((e) => ({ title: e.title, date: e.date })))}

User says: "${userMessage}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [
          {
            functionDeclarations: [
              createTaskDeclaration,
              completeTaskDeclaration,
              saveMemoryDeclaration,
              forgetMemoryDeclaration,
              logStudySessionDeclaration,
              getTodayPlanDeclaration,
              getRecommendationsDeclaration
            ]
          }
        ]
      }
    });

    const toolInvocations: Array<{ name: string; args: Record<string, unknown>; result?: string; payload?: unknown }> = [];

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        const executed = executeAthenaTool(call.name, (call.args || {}) as Record<string, unknown>);
        toolInvocations.push({
          name: call.name,
          args: (call.args || {}) as Record<string, unknown>,
          result: executed.result,
          payload: executed.payload
        });
      }
    }

    let responseText = response.text?.trim() || '';
    if (!responseText) {
      if (toolInvocations.length > 0) {
        responseText = `I've handled that for you: ${toolInvocations.map((t) => t.result).join(' ')}`;
      } else {
        responseText = `Understood. I've updated your Athena second brain context.`;
      }
    }

    return { responseText, toolInvocations };
  } catch (err) {
    console.warn('Gemini API call encountered an issue, running local Athena intent engine:', err);
    return fallbackProcessMessage(userMessage);
  }
}
