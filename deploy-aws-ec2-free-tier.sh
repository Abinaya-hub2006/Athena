#!/bin/bash
# ==============================================================================
# Athena AI — 1-Click AWS Free Tier (EC2 t2.micro / t3.micro) Deployment Script
# Designed for AWS Educate & AWS 12-Month Free Tier Students ($0 Cost)
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo "💾 [2/6] Configuring 2GB Swap Memory (Prevents memory exhaustion on 1GB RAM t2.micro)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap memory enabled."
else
    echo "✅ Swap memory already present."
fi

echo "🐳 [3/6] Installing Docker & Git..."
sudo apt-get install -y docker.io git curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

echo "📦 [4/6] Building Athena Docker Container..."
# If GEMINI_API_KEY is not set in environment, ask for it
if [ -z "$GEMINI_API_KEY" ]; then
    read -p "🔑 Enter your GEMINI_API_KEY (from https://aistudio.google.com/app/apikey): " GEMINI_API_KEY
fi

# Stop and remove existing container if running
sudo docker stop athena-app 2>/dev/null || true
sudo docker rm athena-app 2>/dev/null || true

# Build Docker image
sudo docker build -t athena:latest .

echo "🌐 [5/6] Starting Athena on Port 80 (Standard Web HTTP)..."
sudo docker run -d \
  --name athena-app \
  --restart always \
  -p 80:3000 \
  -e GEMINI_API_KEY="$GEMINI_API_KEY" \
  -e NODE_ENV="production" \
  athena:latest

echo "✅ [6/6] Getting Public IP Address..."
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://ifconfig.me)

echo ""
echo "===================================================================="
echo "🎉 ATHENA AI IS NOW LIVE ON AWS FREE TIER!"
echo "===================================================================="
echo "👉 Open in your browser: http://$PUBLIC_IP"
echo ""
echo "⚠️  CRITICAL FIREBASE STEP:"
echo "1. Go to Firebase Console (https://console.firebase.google.com)"
echo "2. Select project 'involuted-guild-5q6d2'"
echo "3. Go to Authentication -> Settings -> Authorized domains"
echo "4. Add this IP address to the list: $PUBLIC_IP"
echo "===================================================================="
