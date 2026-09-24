# AWS Hosting Guide: Athena — AI Second Brain

This guide explains how to host your **Athena** full-stack application on Amazon Web Services (AWS).

Because Athena is packaged with a production **Dockerfile** (running the Vite React frontend and Express server together on port `3000`), it can be hosted on multiple AWS services.

---

## 🎯 Best AWS Options Overview

| AWS Service | Difficulty | Pricing | Best For |
| :--- | :--- | :--- | :--- |
| **AWS App Runner** *(Recommended)* | ⭐ **Easiest** | Pay-as-you-go (starts ~$5-15/mo) | Direct GitHub or Docker container deploy. Auto-scales, provides free HTTPS domain, zero server management. |
| **AWS Lightsail Containers** | ⭐⭐ **Easy** | Flat rate ($7 - $10/mo) | Predictable student / fixed budget, simple container hosting. |
| **AWS ECS Fargate** | ⭐⭐⭐ **Intermediate** | Pay-as-you-go | Enterprise scale, custom VPCs, multi-container architecture. |
| **AWS EC2 (Virtual Machine)** | ⭐⭐⭐ **Intermediate** | Fixed / Reserved (~$5-10/mo) | Full control over an Ubuntu Linux server with Docker and Nginx. |

---

## 🚀 Option 1: AWS App Runner (Recommended — Takes ~5 Minutes)

**AWS App Runner** is AWS's modern managed container service (similar to Google Cloud Run or Render). It automatically provisions containers, handles load balancing, issues a free HTTPS certificate, and sets up continuous deployment.

### Step 1: Push Your Code to GitHub
1. In AI Studio, open **Settings &rarr; Export to GitHub** (or push your repository from your local computer).

### Step 2: Open AWS App Runner Console
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. In the top search bar, type **App Runner** and click the service.
3. Click **Create service**.

### Step 3: Configure Source & Deployment
1. Under **Source**:
   * Choose **Source code repository**.
   * Click **Add new** under GitHub connection to authorize your GitHub account.
   * Select your repository and branch (`main`).
2. Under **Deployment trigger**:
   * Select **Automatic** (App Runner will auto-deploy every time you push code).
3. Click **Next**.

### Step 4: Configure Build & Runtime
1. **Configuration file**: Choose **Use a configuration file** (App Runner will automatically detect your `apprunner.yaml` file in the repo).
   * *Alternative (using Docker)*: Choose **Configure all settings here**:
     * **Runtime**: Select `Nodejs 20`
     * **Build command**: `npm ci && npm run build`
     * **Start command**: `npm start`
     * **Port**: `3000`

### Step 5: Configure Service & Environment Variables
1. **Service name**: Enter `athena-second-brain`
2. **Virtual CPU & Memory**:
   * `1 vCPU, 2 GB` (plenty for React + Express)
3. **Environment variables**:
   Click **Add environment variable**:
   * **Name**: `GEMINI_API_KEY`
   * **Value**: *Your Gemini API Key from Google AI Studio*
   * *(Optional)* **Name**: `NODE_ENV`, **Value**: `production`
4. **Health check**:
   * **Protocol**: `HTTP`
   * **Path**: `/api/health`
5. Click **Next** &rarr; review your configuration &rarr; click **Create & deploy**.

App Runner will deploy your app in 2–3 minutes and provide a public URL like:
`https://abcdef1234.us-east-1.awsapprunner.com`

---

## 💡 Option 2: AWS Lightsail Containers (Predictable $7/Month)

If you prefer a fixed monthly fee with no surprise billing:

1. Open the [AWS Lightsail Console](https://lightsail.aws.amazon.com/).
2. Click **Containers** &rarr; **Create container service**.
3. Choose your capacity (Nano: $7/mo is sufficient for testing, Micro: $10/mo for regular use).
4. Under **Set up your first deployment**:
   * Choose **Specify a custom deployment**.
   * Container name: `athena-app`
   * Build and push your local Docker image using the AWS Lightsail CLI:
     ```bash
     # Build local image
     docker build -t athena .

     # Push to Lightsail
     aws lightsail push-container-image --service-name athena-service --label athena-app --image athena
     ```
   * Set open port to `3000`.
   * Add environment variable: `GEMINI_API_KEY`.
5. Save and deploy. Lightsail provides an instant HTTPS domain.

---

## 🖥️ Option 3: AWS EC2 (Ubuntu Linux VM)

If you prefer direct server access:

### Step 1: Launch an EC2 Instance
1. In the AWS Console, open **EC2** &rarr; **Launch Instance**.
2. Name: `athena-server`.
3. OS: **Ubuntu 24.04 LTS**.
4. Instance type: `t3.small` or `t4g.small` (2 vCPU, 2 GB RAM).
5. Key pair: Create or select your `.pem` key.
6. Network settings: Check:
   * **Allow SSH traffic**
   * **Allow HTTP traffic from the internet**
   * **Allow HTTPS traffic from the internet**
7. Click **Launch Instance**.

### Step 2: Connect and Install Docker
SSH into your instance:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Install Docker:
```bash
sudo apt update && sudo apt install -y docker.io git
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 3: Clone Repo and Run with Docker
```bash
git clone https://github.com/YOUR_USERNAME/athena.git
cd athena

# Build the container
docker build -t athena .

# Run the container on port 80 (HTTP)
docker run -d \
  --name athena-app \
  --restart unless-stopped \
  -p 80:3000 \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  athena
```
Visit `http://YOUR_EC2_PUBLIC_IP` in your browser.

*(Optional: Use `certbot` and Nginx to add a free SSL HTTPS certificate to your custom domain).*

---

## 🔒 CRITICAL STEP: Authorize Your AWS Domain in Firebase

Whether using AWS App Runner, Lightsail, or EC2, Firebase will block Google Sign-In until your new AWS domain is whitelisted:

1. Copy your deployed AWS domain (e.g. `abcdef1234.us-east-1.awsapprunner.com` or your custom domain).
2. Open the [Firebase Console](https://console.firebase.google.com/).
3. Select your project: **`involuted-guild-5q6d2`**.
4. Go to **Authentication** &rarr; **Settings** &rarr; **Authorized domains**.
5. Click **Add domain**.
6. Paste your AWS domain (do not include `https://`, just the domain name, e.g. `abcdef1234.us-east-1.awsapprunner.com`).
7. Click **Save**.

Google OAuth sign-in and cloud sync will now work on your live AWS URL!
