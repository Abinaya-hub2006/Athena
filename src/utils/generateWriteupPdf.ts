import { jsPDF } from 'jspdf';

export function generateProjectWriteupPdf(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(requiredSpace: number) {
    if (y + requiredSpace > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 8;
      drawHeader();
    }
  }

  function drawHeader() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('ATHENA AI — PROJECT WRITE-UP & TECHNICAL SPECIFICATION', margin, margin);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
  }

  // Cover / Header Banner on First Page
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 34, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Athena — AI Second Brain', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Intelligent Academic Planner & Context-Aware Copilot', margin + 6, y + 16);

  doc.setFontSize(8);
  doc.setTextColor(186, 230, 253); // sky-200
  doc.text('Author: abinayak829@gmail.com   |   Status: Core System Operational   |   Model: Gemini 2.5 Flash', margin + 6, y + 23);
  doc.text('Stack: React 19 + Express + Vite + Firebase Firestore + Google Cloud Run CI/CD', margin + 6, y + 28);

  y += 42;

  function addSectionTitle(title: string) {
    checkPageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title, margin, y);

    doc.setDrawColor(14, 165, 233); // sky-500
    doc.setLineWidth(0.8);
    doc.line(margin, y + 1.5, margin + 35, y + 1.5);
    y += 7;
  }

  function addParagraph(text: string, spaceAfter = 4) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.2;
    }
    y += spaceAfter;
  }

  function addBullet(title: string, desc: string) {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900

    doc.setFillColor(14, 165, 233);
    doc.circle(margin + 2, y - 1, 0.9, 'F');

    const prefix = `${title}: `;
    const prefixWidth = doc.getTextWidth(prefix);
    doc.text(prefix, margin + 5, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(desc, contentWidth - 5 - prefixWidth);

    if (descLines.length > 0) {
      doc.text(descLines[0], margin + 5 + prefixWidth, y);
      y += 4.2;
      for (let i = 1; i < descLines.length; i++) {
        checkPageBreak(5);
        doc.text(descLines[i], margin + 5, y);
        y += 4.2;
      }
    } else {
      y += 4.2;
    }
    y += 1.5;
  }

  // 1. Executive Summary
  addSectionTitle('1. Executive Summary');
  addParagraph(
    'Students, researchers, and knowledge workers face severe cognitive overload balancing fluctuating exam deadlines, topic mastery decay, daily routines, and task prioritization. Traditional task managers are static lists: they do not understand when the user works best, what topics they are struggling with, or why one task should take precedence over another.'
  );
  addParagraph(
    'Athena is an intelligent, context-aware "Second Brain" and proactive academic copilot. Built as an Android-first Progressive Web Application (PWA), Athena continuously models the user\'s cognitive state, academic commitments, memory bank, and energy patterns. Using a customized Learning-to-Rank (L2R) recommendation engine combined with Google Gemini 2.5 Flash, Athena automatically structures the user\'s day, provides reasoned task priorities, detects knowledge decay, and acts as an empathetic personal advisor.'
  );

  // 2. Core Vision & Objectives
  addSectionTitle('2. Core Vision & Objectives');
  addBullet('Active Context Retention', 'Automatically extract, categorize, and recall user habits, academic weaknesses, preferences, and personal goals in a centralized Second Brain vault.');
  addBullet('Explainable Task Prioritization', 'Eliminate decision fatigue by dynamically scoring tasks across 6 dimensions with human-readable rationales (e.g. deadline urgency, mastery gaps, energy alignment).');
  addBullet('Adaptive Spaced Repetition', 'Track mastery decay curves across courses and exam dates, proactively queuing refresher sessions before knowledge is lost.');
  addBullet('Context-Grounded AI Companion', 'A companion chatbot powered by Gemini that answers queries using real-time academic records, upcoming deadlines, and personal memories without hallucinations.');
  addBullet('Zero-Friction Privacy & Resilience', 'Dual-mode persistence combining secure Cloud Firestore (with Google OAuth) and local offline-first storage fallback.');

  // 3. Technical Architecture
  addSectionTitle('3. System Architecture & Technical Stack');
  addBullet('Frontend UI', 'React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, Motion animations.');
  addBullet('Backend API', 'Express 4.21, Node.js 20, tsx/esbuild server bundled to single CommonJS artifact (dist/server.cjs).');
  addBullet('AI / LLM Engine', 'Google Gemini 2.5 Flash via @google/genai SDK with server-side prompt synthesis and memory injection.');
  addBullet('Database & Auth', 'Firebase Firestore for cloud synchronization and Firebase Authentication (Google OAuth 2.0).');
  addBullet('DevOps & CI/CD', 'Multi-stage Dockerfile, GitHub Actions CI (lint/typecheck), GitHub Actions CD (Cloud Run auto-deploy).');

  // 4. Work Completed So Far
  addSectionTitle('4. Work Completed So Far (Delivered Modules)');
  addBullet('ML Task Ranking Engine (server/ml_engine.ts)', 'Evaluates tasks on a 0-100 scale across 6 mathematical dimensions: Deadline Proximity, Base Priority, Topic Mastery Gap, Energy Alignment, Effort Efficiency, and Context Momentum.');
  addBullet('Explainable AI (XAI)', 'Every prioritized task features a natural-language rationale card explaining the ranking logic.');
  addBullet('Second Brain Knowledge Vault (MemoryView.tsx)', 'Multi-category memory storage (Academic, Personal, Habit, Goal, Weakness) with confidence scoring, star pinning, and full-text search.');
  addBullet('Academic Course & Mastery Hub (StudiesView.tsx)', 'Full course lifecycle management, topic mastery tracking, and live exam countdown timers with color-coded urgency.');
  addBullet('Proactive AI Chat Companion (ChatView.tsx)', 'Server-side Gemini proxy shielding secrets while dynamically synthesizing user context, deadlines, and memories.');
  addBullet('Daily Planner & Day Cockpit (HomeView.tsx & MyDayView.tsx)', 'Focused sprint view with task checklists, quick-add modal, and daily focus completion meters.');
  addBullet('Dual Authentication System', 'Supports Cloud Google OAuth with Firestore isolation as well as an instant Local Development Mode.');
  addBullet('DevOps & Local Tooling', 'Multi-stage Dockerfile, GitHub CI/CD workflows, and VS Code F5 launch configurations.');

  // 5. Balance Planned to Be Done
  addSectionTitle('5. Balance Planned to Be Done (Roadmap)');
  addBullet('Phase 1 (Immediate)', 'Automated memory extraction from chat via Gemini function calling; Calendar synchronization (Google Calendar / iCal); Interactive spaced repetition flashcard review interface (FSRS algorithm).');
  addBullet('Phase 2 (Medium-Term)', 'Native Web Push Notifications for focus blocks and decay alerts; Document & Lecture Notes PDF ingestion (RAG); Hands-free voice companion (Gemini Live / Web Speech API).');
  addBullet('Phase 3 (Long-Term)', 'Peer benchmarking & collaborative study groups; Wearable & biometric energy sync (Google Health Connect); Native Android TWA / Play Store release.');

  // 6. Conclusion
  addSectionTitle('6. Conclusion');
  addParagraph(
    'Athena bridges the gap between static task trackers and modern generative artificial intelligence. By pairing deterministic, explainable mathematical ranking algorithms with the contextual synthesis of Gemini 2.5 and the real-time reliability of Firebase Firestore, Athena provides students with an adaptive second brain that actively reduces cognitive friction and empowers academic mastery.'
  );

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - margin + 2, pageWidth - margin, pageHeight - margin + 2);

    doc.text('Athena AI Second Brain — Confidential Academic Project', margin, pageHeight - margin + 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - margin + 6);
  }

  // Trigger browser download
  doc.save('Athena_AI_Project_Writeup.pdf');
}
