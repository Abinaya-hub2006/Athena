import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { mlEngine } from './server/ml_engine';
import { processAthenaChat } from './server/gemini';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Athena AI Second Brain', timestamp: new Date().toISOString() });
  });

  // User Profile & Settings
  app.get('/api/profile', (req, res) => {
    res.json(db.getProfile());
  });

  app.put('/api/profile', (req, res) => {
    const updated = db.updateProfile(req.body);
    res.json(updated);
  });

  // Memories
  app.get('/api/memories', (req, res) => {
    const q = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    res.json(db.getMemories(q, category));
  });

  app.post('/api/memories', (req, res) => {
    const { content, category, importance, tags } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Memory content is required' });
    }
    const created = db.addMemory({
      content,
      category: category || 'Personal',
      importance: importance || 'medium',
      confidence: 1.0,
      source: 'user_explicit',
      tags: tags || [category ? category.toLowerCase() : 'personal'],
      isStarred: req.body.isStarred || false
    });
    res.status(201).json(created);
  });

  app.put('/api/memories/:id', (req, res) => {
    const updated = db.updateMemory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Memory not found' });
    res.json(updated);
  });

  app.delete('/api/memories/:id', (req, res) => {
    const ok = db.deleteMemory(req.params.id);
    res.json({ success: ok });
  });

  app.post('/api/memories/forget', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const count = db.forgetMemoryByQuery(query);
    res.json({ count, message: `Removed ${count} memory records matching "${query}"` });
  });

  app.delete('/api/memories-all', (req, res) => {
    db.clearAllMemories();
    res.json({ success: true, message: 'All memories cleared' });
  });

  // Tasks
  app.get('/api/tasks', (req, res) => {
    const subjects = db.getSubjects();
    const ranked = mlEngine.rankTasks(db.getTasks(), subjects);
    res.json(ranked);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, description, category, priority, deadline, estimatedEffortMinutes, subject, project, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });
    const created = db.addTask({
      title,
      description,
      category: category || 'Academic',
      priority: priority || 'Medium',
      deadline,
      estimatedEffortMinutes: Number(estimatedEffortMinutes) || 45,
      status: 'Todo',
      subject,
      project,
      tags: tags || []
    });
    res.status(201).json(created);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const updated = db.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  });

  app.post('/api/tasks/:id/complete', (req, res) => {
    const completed = db.completeTask(req.params.id);
    if (!completed) return res.status(404).json({ error: 'Task not found' });
    res.json(completed);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const ok = db.deleteTask(req.params.id);
    res.json({ success: ok });
  });

  // Studies & Topics
  app.get('/api/studies', (req, res) => {
    res.json({
      subjects: db.getSubjects(),
      sessions: db.getSessions()
    });
  });

  app.post('/api/studies/subject', (req, res) => {
    const { name, code, targetExamDate, importance, color, topics } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name is required' });
    const sub = db.addSubject({
      name,
      code,
      targetExamDate,
      importance: importance || 'medium',
      color: color || '#38BDF8',
      topics: topics || []
    });
    res.status(201).json(sub);
  });

  app.delete('/api/studies/subject/:id', (req, res) => {
    const ok = db.deleteSubject(req.params.id);
    res.json({ success: ok });
  });

  app.post('/api/studies/session', (req, res) => {
    const { subjectId, subjectName, topicId, topicName, durationMinutes, selfRatedDifficulty, confidence, accuracy, problemsSolved, notes } = req.body;
    const session = db.logStudySession({
      subjectId: subjectId || 'sub-custom',
      subjectName: subjectName || 'General Subject',
      topicId: topicId || 'top-custom',
      topicName: topicName || 'General Topic',
      startTime: new Date(Date.now() - (Number(durationMinutes) || 60) * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 60,
      selfRatedDifficulty: Number(selfRatedDifficulty) || 3,
      confidence: confidence || 'Medium',
      accuracy: accuracy !== undefined ? Number(accuracy) : undefined,
      problemsSolved: problemsSolved !== undefined ? Number(problemsSolved) : undefined,
      notes,
      date: new Date().toISOString().split('T')[0]
    });
    res.status(201).json(session);
  });

  app.post('/api/studies/topic-progress', (req, res) => {
    const { topicNameOrId, masteryScore, confidence } = req.body;
    const ok = db.updateTopicProgress(topicNameOrId, Number(masteryScore), confidence);
    res.json({ success: ok });
  });

  // Calendar & Events
  app.get('/api/events', (req, res) => {
    res.json(db.getEvents());
  });

  app.post('/api/events', (req, res) => {
    const { title, type, date, time, locationOrUrl, reminderSchedule } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and Date are required' });
    const created = db.addEvent({
      title,
      type: type || 'Assignment',
      date,
      time,
      locationOrUrl,
      reminderSchedule: reminderSchedule || ['1 day before'],
      isCompleted: false
    });
    res.status(201).json(created);
  });

  app.delete('/api/events/:id', (req, res) => {
    const ok = db.deleteEvent(req.params.id);
    res.json({ success: ok });
  });

  // Daily Plan (My Day)
  app.get('/api/day-plan', (req, res) => {
    const hours = Number(req.query.hours) || 3;
    const energy = (req.query.energy as 'High' | 'Normal' | 'Low' | 'Tired') || 'Normal';
    const plan = mlEngine.generateDailyPlan(hours, energy);
    res.json(plan);
  });

  // Recommendations & Feedback
  app.get('/api/recommendations', (req, res) => {
    const limit = Number(req.query.limit) || 3;
    const subjects = db.getSubjects();
    const ranked = mlEngine.rankTasks(db.getTasks(), subjects).slice(0, limit);
    res.json(ranked);
  });

  app.post('/api/recommendations/feedback', (req, res) => {
    const { taskId, feedback } = req.body;
    if (!taskId || !feedback) return res.status(400).json({ error: 'Missing parameters' });
    const logged = db.recordFeedback({ taskId, feedback });
    res.json(logged);
  });

  // MLOps & Monitoring
  app.get('/api/ml/status', (req, res) => {
    res.json(db.getMLStatus());
  });

  app.post('/api/ml/retrain', (req, res) => {
    const newStatus = mlEngine.triggerRetraining();
    res.json(newStatus);
  });

  // Insights
  app.get('/api/insights', (req, res) => {
    res.json(db.getInsights());
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    db.markAllNotificationsRead();
    res.json({ success: true });
  });

  // Chat
  app.get('/api/chat/history', (req, res) => {
    res.json(db.getChatHistory());
  });

  app.post('/api/chat', async (req, res) => {
    const { message, userContext } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Record user message
    db.addChatMessage({ sender: 'user', text: message.trim() });

    // Process with Gemini agent + tools with user-specific context
    const result = await processAthenaChat(message.trim(), userContext);

    // Record assistant message
    const botMsg = db.addChatMessage({
      sender: 'athena',
      text: result.responseText,
      toolInvocations: result.toolInvocations
    });

    res.json({
      message: botMsg,
      toolInvocations: result.toolInvocations
    });
  });

  app.post('/api/chat/clear', (req, res) => {
    db.clearChatHistory();
    res.json({ success: true });
  });

  // Privacy & Data Export
  app.get('/api/export', (req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename="athena_second_brain_export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json(db.getFullExport());
  });

  app.post('/api/reset-demo', (req, res) => {
    db.resetToDemo();
    res.json({ success: true, message: 'Reset to demo state successfully' });
  });

  app.post('/api/clear-all', (req, res) => {
    const { name, email } = req.body || {};
    db.clearAll(name, email);
    res.json({ success: true, message: 'Cleared all personal data' });
  });

  // Vite Middleware for Frontend Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Athena server running on http://localhost:${PORT}`);
  });
}

startServer();
