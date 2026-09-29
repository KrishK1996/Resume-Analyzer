#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Automated Deployment Script for AI Resume Analyzer
# Target OS: Ubuntu 22.04 / 24.04 LTS
# ==============================================================================

set -e

echo "=========================================="
echo " Starting Resume Analyzer EC2 Deployment"
echo "=========================================="

# 1. Update packages and install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "[1/4] Installing Docker and prerequisites..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release git

    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    sudo usermod -aG docker "$USER"
    echo "Docker installed successfully."
else
    echo "[1/4] Docker is already installed."
fi

# 2. Check for .env file
if [ ! -f backend/.env ] && [ ! -f .env ]; then
    echo "[2/4] Warning: .env file not found."
    if [ -f .env.example ]; then
        cp .env.example backend/.env
        echo "Created backend/.env from .env.example. Please update your GROQ_API_KEY!"
    fi
else
    echo "[2/4] Environment configuration file detected."
fi

# 3. Stop existing container if running
echo "[3/4] Stopping any existing containers on port 8501..."
docker stop resume_analyzer_app 2>/dev/null || true
docker rm resume_analyzer_app 2>/dev/null || true

# 4. Build and run Docker image
echo "[4/4] Building and launching Resume Analyzer container..."
docker build -t resume-analyzer:latest .

docker run -d \
  --name resume_analyzer_app \
  --restart unless-stopped \
  -p 8501:8501 \
  --env-file backend/.env \
  resume-analyzer:latest

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "<YOUR-EC2-PUBLIC-IP>")

echo "=========================================================="
echo " Deployment Complete!"
echo " Access your application at:"
echo " http://${PUBLIC_IP}:8501"
echo "=========================================================="
