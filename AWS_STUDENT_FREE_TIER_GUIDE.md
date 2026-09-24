# Complete Guide: Host Athena 100% Free on AWS Student / Free Tier

This step-by-step guide explains how to host your **Athena AI Second Brain** app for **$0 (completely free)** using the **AWS 12-Month Free Tier** or **AWS Educate / Academy**.

---

## 💰 Why This Is 100% Free
AWS gives every new account & student account:
- **750 hours/month of EC2 Linux (`t2.micro` or `t3.micro`)**: A month only has 720–744 hours, which means your server can run **24/7 all month long for $0**.
- **30 GB of SSD Storage (EBS)**: Plenty of space (Athena takes ~3 GB).
- **No domain required**: You can access your app directly on the free AWS Public IP address.

---

## 📋 Prerequisites
1. An AWS Account ([Create free AWS account](https://aws.amazon.com/free/) or use your AWS Educate / Academy login).
2. Your repository pushed to GitHub.
3. Your free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🛠️ Step 1: Launch Your Free EC2 Instance

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. In the top search bar, type **EC2** and select it.
3. In the top-right corner of the AWS console, choose a region close to you (e.g., **US East (N. Virginia) `us-east-1`** or **Asia Pacific (Mumbai) `ap-south-1`**).
4. Click the orange **"Launch Instance"** button.

### Configure the Instance Settings:
1. **Name and tags**:
   * Name: `athena-free-tier`
2. **Application and OS Images (AMI)**:
   * Select **Ubuntu** (Ubuntu Server 24.04 LTS or 22.04 LTS, look for the **"Free tier eligible"** green badge).
   * Architecture: **64-bit (x86)**.
3. **Instance type**:
   * Select **`t2.micro`** (or **`t3.micro`** depending on region — verify it says **"Free tier eligible"**).
4. **Key pair (login)**:
   * Select **"Proceed without a key pair (Not recommended)"** OR create a key pair if you know how to use `.pem` files.
   * *Tip*: If you proceed without a key pair, you can still easily connect with 1-click in your browser using **EC2 Instance Connect**!
5. **Network settings**:
   * Keep default VPC and Subnet.
   * Make sure **Auto-assign public IP** is set to **Enable**.
   * Check these three boxes:
     - ✅ **Allow SSH traffic from** -> **Anywhere (0.0.0.0/0)**
     - ✅ **Allow HTTP traffic from the internet** (Port 80)
     - ✅ **Allow HTTPS traffic from the internet** (Port 443)
6. **Configure storage**:
   * Change from `8 GiB` to **`20 GiB`** gp3 (Free tier allows up to 30 GiB).
7. Click **"Launch Instance"** on the right side.
8. Wait ~30 seconds for the instance state to change to **Running**.

---

## 💻 Step 2: Connect to Your Server (In Your Browser)

You do **NOT** need to install Putty or SSH tools. You can connect right in your browser:

1. In the EC2 console, click on **Instances** on the left menu.
2. Select your `athena-free-tier` instance.
3. Click the **"Connect"** button at the top.
4. Choose **"EC2 Instance Connect"**.
5. Click the orange **"Connect"** button.
6. A black terminal window will open in your browser connected to your free Ubuntu server!

---

## ⚡ Step 3: Run the 1-Click Deployment Script

In the black browser terminal, copy and paste this command:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git athena
cd athena
chmod +x deploy-aws-ec2-free-tier.sh
./deploy-aws-ec2-free-tier.sh
```

*(Replace with your actual GitHub repository URL).*

### What happens automatically:
1. Updates Linux system packages.
2. Adds **2GB Swap Memory** (this prevents the 1GB RAM `t2.micro` instance from freezing or crashing during builds).
3. Installs Docker.
4. Prompts you to enter your **Gemini API Key**.
5. Builds the production Docker container.
6. Starts Athena on **Port 80 (standard HTTP)** with `--restart always` so it automatically restarts if the server reboots!

---

## 🌐 Step 4: Open Your App

Once the script finishes, it will print your Public IP:
```text
====================================================================
🎉 ATHENA AI IS NOW LIVE ON AWS FREE TIER!
====================================================================
👉 Open in your browser: http://54.210.12.34
====================================================================
```

Open that URL in your browser — your Athena AI Second Brain is live!

---

## 🔑 Step 5: Whitelist the IP in Firebase (Important!)

To allow Google Sign-In and Firestore cloud synchronization to work on your new AWS IP:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`involuted-guild-5q6d2`**.
3. In the left sidebar, click **Build &rarr; Authentication**.
4. Click the **Settings** tab at the top.
5. Click **Authorized domains** in the submenu.
6. Click **Add domain**.
7. Paste your AWS EC2 Public IP address (e.g., `54.210.12.34`) without `http://`.
8. Click **Save**.

Now Google Sign-In works on your live AWS Free Tier deployment!

---

## 💡 Student Tips & Best Practices

1. **How to keep it 100% Free**:
   - Only run **one** `t2.micro` or `t3.micro` instance at a time (750 hours/month covers 1 active instance 24/7).
   - Keep storage under 30 GB (we configured 20 GB).
2. **If your IP changes on reboot**:
   - In AWS EC2, you can allocate an **Elastic IP** (under Network & Security &rarr; Elastic IPs) and associate it with your instance. Elastic IPs are 100% free as long as they are attached to a running instance!
3. **Checking Server Logs**:
   - To see app logs:
     ```bash
     sudo docker logs -f athena-app
     ```
   - To restart the app:
     ```bash
     sudo docker restart athena-app
     ```
