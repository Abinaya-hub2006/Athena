# Project Write-Up: Athena — AI Second Brain & Intelligent Academic Planner

**Author / Maintainer:** abinayak829@gmail.com  
**Project Name:** Athena AI  
**Repository Architecture:** Full-Stack TypeScript (React 19 + Express + Vite + Firebase Firestore + Google Gemini 2.5)  
**Deployment Target:** Google Cloud Run (Containerized via Docker & GitHub Actions CI/CD)  
**Status:** Core Platform Operational • Active Development Phase  

---

## 1. Executive Summary

Students, researchers, and knowledge workers face severe cognitive overload balancing fluctuating exam deadlines, topic mastery decay, daily routines, and task prioritization. Traditional task managers are static lists: they do not understand *when* the user works best, *what* topics they are struggling with, or *why* one task should take precedence over another.

**Athena** is an intelligent, context-aware "Second Brain" and proactive academic copilot. Built as an Android-first Progressive Web Application (PWA), Athena continuously models the user's cognitive state, academic commitments, memory bank, and energy patterns. Using a customized **Learning-to-Rank (L2R) recommendation engine** combined with **Google Gemini 2.5 Flash**, Athena automatically structures the user's day, provides reasoned task priorities, detects knowledge decay, and acts as an empathetic personal advisor.

---

## 2. Core Vision & Objectives

1. **Active Context Retention (The Second Brain Vault):** Automatically extract, categorize, and recall user habits, academic weaknesses, preferences, and personal goals.
2. **Explainable Task Prioritization:** Eliminate decision fatigue by dynamically scoring tasks across 6 dimensions with human-readable rationales (e.g., *"Prioritized: High deadline urgency (due in 36h) aligned with your peak morning energy window"*).
3. **Adaptive Spaced Repetition & Topic Mastery:** Track mastery decay curves across courses and exam dates, proactively queuing refresher sessions before knowledge is lost.
4. **Context-Grounded Conversational Intelligence:** A companion chatbot powered by Gemini that answers queries using the user's real-time academic records, upcoming deadlines, and personal memories without hallucinations.
5. **Zero-Friction Privacy & Resilience:** Dual-mode persistence combining secure Cloud Firestore (with Google OAuth) and local offline-first fallback.

---

## 3. System Architecture & Technical Stack

| Layer | Technology | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19, TypeScript, Vite 6** | Modern reactive component architecture, sub-millisecond route transitions, strict type safety. |
| **Styling & Design** | **Tailwind CSS v4, Lucide Icons, Motion** | Android/desktop-adaptive dark aesthetic, glassmorphic accents, high-contrast WCAG-compliant readability. |
| **Backend API** | **Express 4.21, Node.js 20, tsx/esbuild** | RESTful endpoints (`/api/tasks`, `/api/memories`, `/api/profile`, `/api/chat`, `/api/insights`), bundled as CommonJS for serverless execution. |
| **AI / LLM Engine** | **Google Gemini 2.5 Flash (`@google/genai`)** | Server-side prompt engineering, context assembly, second brain memory injection, streaming chat responses. |
| **Database & Auth** | **Firebase Firestore & Firebase Auth** | Multi-tenant user isolation, Google OAuth 2.0 popup flows, real-time synchronization, and local JSON storage fallback. |
| **CI / CD & Infra** | **Docker, GitHub Actions, Google Cloud Run** | Multi-stage Docker build (`node:20-slim`), automated linting and typecheck on pull requests, zero-downtime deployment. |

---

## 4. Work Completed So Far (Delivered Modules)

### 4.1. Intelligent Machine Learning Task Ranking Engine (`server/ml_engine.ts`)
- **Multi-Factor Scoring Matrix:** Evaluates every candidate task across 6 real-time mathematical dimensions:
  1. **Deadline Proximity (0–100):** Exponential curve prioritizing tasks within 24h, 48h, and 5-day horizons; overdues receive maximum priority.
  2. **Base Priority (0–100):** User-designated criticality weighting (Critical, High, Medium, Low).
  3. **Topic Mastery Gap (0–100):** Cross-references task subject tags with the user's current mastery percentage, elevating topics tagged as weak areas or experiencing decay.
  4. **Energy & Circadian Alignment (0–100):** Detects the user's preferred study hours from their profile and matches demanding tasks to peak alertness periods.
  5. **Effort Efficiency (0–100):** Balances quick wins (short estimated durations) against deep focus sessions.
  6. **Context Momentum (0–100):** Elevates tasks matching current active projects or courses to minimize mental context switching.
- **Explainable AI (XAI):** Generates natural-language reasoning cards explaining exactly why Athena ranked each task in its position.
- **Online Weight Adaptation:** Feedback loop capturing user accepts, skips, reorders, and completions to dynamically adjust algorithmic weights over time.

### 4.2. Second Brain Knowledge Vault (`src/views/MemoryView.tsx`)
- Structured memory categorization: **Academic, Personal, Habit, Goal, Weakness**.
- Confidence scoring, star pinning, tag filtering, and real-time full-text search.
- Explicit and implicit memory ingestion pipeline feeding directly into the LLM context pipeline.

### 4.3. Academic Course & Mastery Hub (`src/views/StudiesView.tsx`)
- Full course lifecycle management (Add, edit, track, delete subjects).
- Syllabus topic mastery breakdown with visual percentage meters.
- Exam countdown timers with urgency color coding.
- Spaced repetition flashcard and quiz readiness integration.

### 4.4. Proactive AI Companion Chat (`src/views/ChatView.tsx` & `server/gemini.ts`)
- Server-side proxy shielding `GEMINI_API_KEY` from client exposure.
- Dynamic system prompt synthesis injecting the user's real profile, study hours, weak topics, imminent deadlines, and memories.
- Suggested conversation prompt pills (e.g., *"Plan my evening based on deadlines"*, *"Identify my biggest exam risks"*, *"Review weak topics"*).

### 4.5. Daily Planner & Day Cockpit (`src/views/HomeView.tsx` & `src/views/MyDayView.tsx`)
- Today's prioritized sprint view with task completion checklists.
- Quick task creation modal with deadline picker, subject tagging, and priority tiering.
- Real-time productivity analytics, streak calculation, and daily focus completion meters.

### 4.6. Authentication, Security & Dual Persistence (`src/contexts/AuthContext.tsx`)
- Google OAuth with Firebase Authentication integration.
- Domain guardrails with helpful configuration guidance for `localhost` and production domains.
- Local Development Mode bypass for instant testing without cloud dependencies.
- Cloud Firestore vault isolation enforcing document paths scoped to verified user credentials.

### 4.7. DevOps, CI/CD & Local Tooling
- Multi-stage `Dockerfile` creating a lightweight, production-ready runner image on port 3000.
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) for automated linting and build validation.
- GitHub Actions CD workflow (`.github/workflows/deploy.yml`) for continuous deployment to Google Cloud Run.
- Visual Studio Code integration (`.vscode/tasks.json`, `.vscode/launch.json`, and `README.md`) enabling single-click `F5` debugging.

---

## 5. Balance Planned to Be Done (Roadmap)

### Phase 1: High-Priority Next Deliverables (Immediate Focus)
- [ ] **Automated Memory Extraction from Chat:** Equip the Gemini chat agent with function calling (`tool_call`) to automatically detect and persist user preferences, habits, and exam dates without requiring manual memory creation.
- [ ] **Calendar & Schedule Synchronization (Google Calendar / iCal):** Ingest external calendar commitments to automatically schedule study blocks during actual free gaps.
- [ ] **Flashcard Spaced Repetition Review Engine (FSRS Algorithm):** Implement an active recall flashcard session interface with Again / Hard / Good / Easy grading to dynamically calculate stability and retrievability curves.

### Phase 2: Medium-Term Enhancements
- [ ] **Push Notifications & Reminder Triggers:** Native Web Push Notifications alerting the user before upcoming focus blocks and spaced repetition decay thresholds.
- [ ] **Document & Lecture Notes Ingestion (RAG):** Allow students to upload PDF lecture notes or syllabi, using Gemini file processing to auto-generate subject topics, quizzes, and revision schedules.
- [ ] **Audio Voice Companion (Gemini Live / Web Speech API):** Hands-free voice interface for walking commute reviews and quick task capture.

### Phase 3: Long-Term Innovations
- [ ] **Collaborative Study Groups & Peer Benchmarking:** Opt-in anonymous peer comparisons for course mastery and shared question banks.
- [ ] **Wearable & Biometric Energy Integration:** Sync with sleep and activity trackers (e.g., Google Fit / Health Connect) to dynamically adjust daily study load based on physiological recovery scores.
- [ ] **Native Mobile App Builds (Capacitor / Android TWA):** Package the PWA as an official Android Play Store release with background sync workers.

---

## 6. Conclusion

Athena bridges the gap between static task trackers and modern generative artificial intelligence. By pairing deterministic, explainable mathematical ranking algorithms with the contextual synthesis of Gemini 2.5 and the real-time reliability of Firebase Firestore, Athena provides students with an adaptive second brain that actively reduces cognitive friction and empowers academic mastery.
