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
    echo "[1/5] Installing Docker and prerequisites..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release git

    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    sudo usermod -aG docker "$USER" || true
    echo "Docker installed successfully."
else
    echo "[1/5] Docker is already installed."
fi

# Detect docker execution method (with or without sudo)
if docker info &> /dev/null; then
    DOCKER="docker"
else
    DOCKER="sudo docker"
fi

# 2. Add 2GB Swap space to prevent out-of-memory errors on t2.micro/t3.micro (1GB RAM) during build
if [ ! -f /swapfile ]; then
    echo "[2/5] Creating 2GB swap space for low-memory EC2 instance..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space configured successfully."
else
    echo "[2/5] Swap file already present."
fi

# 3. Check for .env file
ENV_FILE=""
if [ -f backend/.env ]; then
    ENV_FILE="backend/.env"
elif [ -f .env ]; then
    ENV_FILE=".env"
else
    echo "[3/5] Warning: .env file not found."
    if [ -f .env.example ]; then
        cp .env.example backend/.env
        ENV_FILE="backend/.env"
        echo "Created backend/.env from .env.example. Please update your GROQ_API_KEY if needed."
    fi
fi
echo "[3/5] Using environment configuration: ${ENV_FILE:-None}"

# 4. Stop existing container if running
echo "[4/5] Stopping any existing containers on port 8501..."
$DOCKER stop resume_analyzer_app 2>/dev/null || true
$DOCKER rm resume_analyzer_app 2>/dev/null || true

# 5. Build and run Docker image
echo "[5/5] Building and launching Resume Analyzer container..."
$DOCKER build -t resume-analyzer:latest .

ENV_ARGS=()
if [ -n "$ENV_FILE" ]; then
    ENV_ARGS+=(--env-file "$ENV_FILE")
fi
if [ -n "$GROQ_API_KEY" ]; then
    ENV_ARGS+=(-e "GROQ_API_KEY=$GROQ_API_KEY")
fi

$DOCKER run -d \
  --name resume_analyzer_app \
  --restart unless-stopped \
  -p 8501:8501 \
  "${ENV_ARGS[@]}" \
  resume-analyzer:latest

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://ifconfig.me || echo "<YOUR-EC2-PUBLIC-IP>")

echo "=========================================================="
echo " Deployment Complete!"
echo " Access your application at:"
echo " http://${PUBLIC_IP}:8501"
echo "=========================================================="
