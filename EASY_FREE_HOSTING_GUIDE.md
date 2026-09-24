# Super Easy & Free Cloud Hosting Alternatives (No AWS Complexity!)

If AWS feels too complicated with security groups, SSH keys, VPCs, and credit card requirements, here are the **best, simplest, 100% free alternatives** that deploy in **less than 2 minutes directly from GitHub**.

---

## 🏆 Comparison of Free Cloud Platforms

| Platform | Setup Time | Free Tier | Credit Card Needed? | Difficulty |
| :--- | :--- | :--- | :--- | :--- |
| **Render** *(Recommended)* | **2 minutes** | **100% Free** (Free Web Service) | ❌ **No** | ⭐ **Easiest** |
| **Koyeb** | **3 minutes** | **100% Free** (Eco tier) | ❌ **No** | ⭐ **Very Easy** |
| **Railway** | **2 minutes** | $5 free trial credit | ❌ **No** | ⭐ **Easiest** |

---

## 🚀 Option 1: Render.com (Top Recommendation — 3 Clicks)

Render is like a modern, 100% free alternative to Heroku and AWS. It connects directly to your GitHub repo, automatically builds Athena, gives you a free `.onrender.com` HTTPS domain, and auto-redeploys every time you push code.

### Step 1: Sign Up on Render
1. Go to [render.com](https://render.com/).
2. Click **Sign Up** and choose **GitHub** (sign in with your GitHub account).

### Step 2: Create a New Web Service
1. On the Render Dashboard, click the blue **"New +"** button &rarr; select **"Web Service"**.
2. Select **"Build and deploy from a Git repository"** &rarr; click **Next**.
3. Choose your **Athena** repository.

### Step 3: Configure Settings (Takes 30 seconds!)
Render will show a configuration screen. Fill in these simple fields:
* **Name**: `athena-second-brain` (or any name you like)
* **Region**: Choose closest to you (e.g., Singapore, Frankfurt, Oregon, Ohio)
* **Branch**: `main`
* **Root Directory**: *(Leave blank)*
* **Runtime**: **Node**
* **Build Command**: `npm install && npm run build`
* **Start Command**: `npm start`
* **Instance Type**: Select **Free** ($0 / month)

### Step 4: Add Environment Variable
Scroll down to **Environment Variables**:
* Click **Add Environment Variable**:
  * **Key**: `GEMINI_API_KEY`
  * **Value**: *Your Gemini API key from Google AI Studio*

### Step 5: Click "Create Web Service"
Click the blue **"Deploy Web Service"** button.

That's it! Render will build your app and in 2–3 minutes give you a free live URL:
`https://athena-second-brain.onrender.com`

---

## ⚡ Option 2: Koyeb.com (Fast & 100% Free Eco Tier)

Koyeb is another zero-hassle cloud host:
1. Go to [koyeb.com](https://koyeb.com/) & sign up with GitHub.
2. Click **Create App** &rarr; select **GitHub**.
3. Select your repository.
4. Set:
   * **Build command**: `npm install && npm run build`
   * **Run command**: `npm start`
   * **Port**: `3000`
5. Add environment variable `GEMINI_API_KEY`.
6. Click **Deploy**. Your app is live with free HTTPS.

---

## 🔑 Crucial Step for All Cloud Platforms (Firebase Whitelist)

Once your app is deployed and you have your live URL (e.g. `athena-second-brain.onrender.com`):

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select project **`involuted-guild-5q6d2`**.
3. Go to **Build &rarr; Authentication &rarr; Settings &rarr; Authorized domains**.
4. Click **Add domain**.
5. Paste your domain (e.g. `athena-second-brain.onrender.com` without `https://`) and click **Save**.

Now Google Sign-In and Firestore synchronization work on your live URL!
