# Athena - AI Second Brain

Personal AI assistant and second brain that remembers your context, studies, tasks, and priorities with proactive recommendations.

---

## 🚀 Quickstart: Running in Visual Studio Code

### Prerequisites
- **Node.js**: v18 or v20+ installed ([Download Node.js](https://nodejs.org/))
- **Git**: installed
- **VS Code**: ([Download VS Code](https://code.visualstudio.com/))

---

### Step 1: Open Project in VS Code
1. Export or clone the repository to your computer.
2. Open VS Code, select **File &rarr; Open Folder...**, and select the project folder.

---

### Step 2: Install Dependencies
Open the VS Code integrated terminal (`Ctrl + ~` or `` Ctrl + ` `` / `Cmd + ~` on Mac) and run:

```bash
npm install
```

---

### Step 3: Set Up Your Environment Variables
1. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your **Gemini API Key**:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
   *(Get your free key at [Google AI Studio](https://aistudio.google.com/app/apikey))*.

---

### Step 4: Start the Development Server
In your terminal, run:

```bash
npm run dev
```

*(Or simply press **F5** in VS Code using the pre-configured debug runner).*

---

### Step 5: Open in Your Browser
Visit:
```
http://localhost:3000
```

---

## 🔑 Firebase & Google Login on Localhost

When running locally at `http://localhost:3000`:
- You can immediately click **"Continue in Local Development Mode"** to use all Athena features without logging in.
- To enable **"Sign in with Google"** on localhost:
  1. Go to [Firebase Console](https://console.firebase.google.com/) &rarr; Your Project (`involuted-guild-5q6d2`).
  2. Navigate to **Authentication &rarr; Settings &rarr; Authorized domains**.
  3. Click **Add domain** and enter `localhost`.

---

## 🛠 Available Scripts

- `npm run dev` — Starts the Express backend + Vite dev server on port 3000.
- `npm run build` — Compiles the Vite React client into `dist/` and bundles `server.ts` into `dist/server.cjs`.
- `npm start` — Starts the compiled production server (`node dist/server.cjs`).
- `npm run lint` — Runs TypeScript type-checking without emitting files.
