# AI-Powered Resume Analyzer

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-orange.svg)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900.svg)](https://aws.amazon.com/ec2/)

An intelligent, multi-file PDF resume analyzer that extracts candidate profile information with strict factual accuracy using Groq AI (`llama-3.3-70b-versatile`). Missing information is faithfully represented as `null` with zero hallucinations. Built with Python (FastAPI), React, Docker, and deployed on AWS EC2.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Information Extracted](#-information-extracted)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development Setup](#-local-development-setup)
- [Running with Docker](#-running-with-docker)
- [AWS EC2 Deployment Guide](#-aws-ec2-deployment-guide)
- [Testing](#-testing)
- [Security & Privacy](#-security--privacy)
- [Assumptions & Limitations](#-assumptions--limitations)

---

## 🏛 Overview & Architecture

The application accepts PDF resumes from users, extracts raw document text using robust Python PDF parsing libraries (`pdfplumber` and `pypdf`), and passes the extracted text to Groq AI with a zero-hallucination structured prompt. The returned JSON is validated through Pydantic schemas and rendered through a modern, comfortable React dashboard.

```
                    +------------------------------------+
                    |        User Web Browser            |
                    | (React Frontend: Drag & Drop UI)   |
                    +-----------------+------------------+
                                      |
                     HTTP POST /api/analyze (Multi-PDF)
                                      v
                    +------------------------------------+
                    |      FastAPI Backend Server        |
                    |  (Uvicorn on Port 8501 / 8000)     |
                    +-----------------+------------------+
                                      |
                +---------------------+---------------------+
                |                                           |
                v                                           v
    +-----------------------+                   +-----------------------+
    | PDF Processing Engine |                   | Groq AI Service       |
    | (pdfplumber & pypdf)  |                   | (llama-3.3-70b)       |
    | - Header verification |                   | - Zero hallucination  |
    | - Encryption checks   |                   | - Strict JSON schema  |
    | - Scanned text checks |                   | - Missing data = null |
    +-----------+-----------+                   +-----------+-----------+
                |                                           |
                +---------------------+---------------------+
                                      |
                                      v
                    +------------------------------------+
                    |  Pydantic Validator & Serializer   |
                    | (Structured JSON, Null Preservation)|
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |  React Interactive Results Display |
                    | (Timeline, Badges, Tabs, Export)   |
                    +------------------------------------+
```

---

## ✨ Key Features

- **Modern & Comfortable UI:** Sleek dark-mode aesthetic with fluid drag-and-drop file upload, file queue status, and real-time processing indicators.
- **Multi-File Upload:** Select or drop multiple PDF resumes simultaneously and analyze them in a single batch.
- **Detailed File Meta:** Displays file names, file sizes (KB/MB), character counts, and extraction health.
- **Precise Error Handling:** Gracefully detects and displays exact messages for:
  - Non-PDF files
  - Empty or 0-byte files
  - Encrypted / password-protected PDFs
  - Scanned image-only PDFs with no extractable text
  - AI API rate limits or invalid keys
- **Zero Hallucination Guarantee:** Enforces deterministic extraction (`temperature: 0.0`) with prompt rules requiring missing fields to be set strictly to `null`.
- **Structured Categorized Output:** Separates full name, phone, email, location, skills, education, work experience, certifications, and professional summary clearly.
- **JSON View & Export:** View raw JSON and download extracted results as `.json` files.
- **In-App API Key Management:** Convenient settings modal to view Groq connection status or update `GROQ_API_KEY` on the fly.

---

## 📊 Information Extracted

| Field | Description | Missing Value Representation |
|---|---|---|
| **Full Name** | Candidate's complete name | `null` |
| **Phone** | Contact phone number | `null` |
| **Email** | Contact email address | `null` |
| **Location** | City, State, or Country | `null` |
| **Skills** | Technical and domain competencies | `null` or `[]` |
| **Education** | Degree, Institution, Graduation Year | `null` or `[]` |
| **Work Experience** | Company, Job Title, Dates, Responsibilities | `null` or `[]` |
| **Certifications** | Professional credentials | `null` or `[]` |
| **Professional Summary** | Concise career overview | `null` |

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Python 3.12** | Core backend language |
| **FastAPI** | High-performance asynchronous REST API framework |
| **Pydantic v2** | Strict schema validation and JSON serialization |
| **pdfplumber & pypdf** | PDF parsing, encryption checking, and text extraction |
| **Groq API** | Ultra-fast inference engine running `llama-3.3-70b-versatile` |
| **React 19 & Vite** | Fast, responsive modern frontend user interface |
| **Tailwind CSS & Lucide Icons** | Comfortable styling and intuitive iconography |
| **Docker & Docker Compose** | Multi-stage containerization |
| **AWS EC2** | Cloud hosting (accessible on port 8501) |
| **Git** | Source code management |

---

## 📁 Project Structure

```
Resume-Analyzer/
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Container orchestration
├── deploy_ec2.sh                # Automated AWS EC2 deployment script
├── .dockerignore                # Container build exclusions
├── .gitignore                   # Ignores .env, node_modules, __pycache__, dist
├── .env.example                 # Root environment template
├── Readme.md                    # Project documentation
│
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App package initialization
│   │   ├── main.py              # FastAPI server, endpoints, and static SPA serving
│   │   ├── pdf_parser.py        # PDF extraction, header checks, and validation
│   │   ├── llm_service.py       # Groq client, fallback models, JSON parsing
│   │   ├── models.py            # Pydantic data schemas
│   │   └── prompts.py           # Zero-hallucination extraction prompts
│   ├── tests/
│   │   └── test_analyzer.py     # Automated pytest test cases
│   ├── scripts/
│   │   └── generate_sample_resumes.py # Test resume generator
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Top navigation & Groq status indicator
│   │   │   ├── FileUpload.jsx   # Multi-file dropzone & queue
│   │   │   ├── ResumeViewer.jsx # Tabbed resume details & field cards
│   │   │   ├── ApiKeyModal.jsx  # Interactive API key config modal
│   │   │   └── JsonModal.jsx    # Raw JSON viewer & export
│   │   ├── services/
│   │   │   └── api.js           # Fetch client for backend endpoints
│   │   ├── App.jsx              # Main React layout orchestrator
│   │   ├── index.css            # Tailwind styles
│   │   └── main.jsx             # React entry point
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite dev config with API proxy
│
└── sample_resumes/              # Ready-to-use sample test PDFs
    ├── john_doe_full_resume.pdf
    ├── sarah_miller_missing_fields.pdf
    └── invalid_empty_sample.pdf
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Python**: 3.10+ (Recommended: 3.12)
- **Node.js**: 18+ (Recommended: 20+)
- **Groq API Key**: Free key from [Groq Console](https://console.groq.com/keys)

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env` and paste your Groq API Key:
```bash
cp backend/.env.example backend/.env
```
Inside `backend/.env`:
```ini
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will open at: `http://localhost:5173`.

---

## 🐳 Running with Docker

The multi-stage `Dockerfile` compiles the React frontend assets and uses FastAPI to serve both the REST API and the production SPA from a single lightweight container on **port 8501**.

### Option A: Using Docker Run
```bash
# 1. Build the Docker image
docker build -t resume-analyzer .

# 2. Run the container
docker run -d \
  --name resume_analyzer_app \
  -p 8501:8501 \
  -e GROQ_API_KEY=gsk_your_groq_api_key_here \
  resume-analyzer
```

### Option B: Using Docker Compose
```bash
docker compose up -d --build
```

Access the application in your browser at:
`http://localhost:8501`

---

## ☁️ AWS EC2 Deployment Guide

Follow these steps to deploy the application on an AWS EC2 instance:

### Step 1: Launch an AWS EC2 Instance
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2).
2. Click **Launch Instance**.
3. Choose **Ubuntu Server 22.04 LTS (HVM)** (Free Tier eligible `t2.micro` or `t3.micro`).
4. Select or create your Key Pair (`.pem`) for SSH access.
5. In **Network Settings**, configure the **Security Group**:
   - **SSH**: Port `22`, Source: `My IP` (for security).
   - **Custom TCP**: Port `8501`, Source: `Anywhere (0.0.0.0/0)` (or restrict to your IP).
6. Click **Launch Instance**.

### Step 2: Connect to the EC2 Instance
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### Step 3: Clone Repository & Run Automated Deploy Script
```bash
# 1. Clone repository
git clone https://github.com/KrishK1996/Resume-Analyzer.git
cd Resume-Analyzer

# 2. Create environment file with your Groq Key
cp .env.example backend/.env
nano backend/.env
# (Paste your GROQ_API_KEY, then press Ctrl+O, Enter, Ctrl+X to save)

# 3. Make deploy script executable and run
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

### Step 4: Verify Deployment
Open your browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>:8501
```

---

## 🧪 Testing

Automated unit tests are provided in `backend/tests/test_analyzer.py` covering:
- Empty 0-byte file rejection
- Invalid file header detection
- Scanned/blank PDF detection
- Schema null defaults
- Pydantic JSON serialization

Run tests with `pytest`:
```bash
cd backend
python -m pytest tests/ -v
```

Output:
```text
tests/test_analyzer.py::test_empty_bytes_raises_exception PASSED
tests/test_analyzer.py::test_invalid_header_raises_exception PASSED
tests/test_analyzer.py::test_blank_pdf_page_raises_no_text_exception PASSED
tests/test_analyzer.py::test_resume_data_schema_defaults_to_none PASSED
tests/test_analyzer.py::test_resume_data_serialization PASSED
============================== 5 passed in 0.37s ===============================
```

---

## 🔒 Security & Privacy

1. **No Sensitive Key Leaks:** `.env` files are tracked in `.gitignore` and omitted in Docker builds.
2. **In-Memory File Processing:** Uploaded resumes are parsed directly in memory buffers and are never persisted to disk or databases.
3. **No Training on Data:** Inquiries sent to the Groq API strictly use inference endpoints with zero data retention.

---

## ⚠️ Assumptions & Limitations

- **Scanned Image PDFs:** Standard PDF text streams are parsed using `pdfplumber` and `pypdf`. Image-only scans without an embedded OCR text layer will return a clear message prompting the user to upload a text-readable PDF.
- **Model Context Window:** Resumes exceeding 35,000 characters are safely truncated to prevent exceeding context window tokens.
- **Rate Limits:** Groq's free-tier rate limits are handled with automatic fallback to `llama-3.1-8b-instant`.

---

## 👤 Author
Developed for the Technical Interview Assignment.
Repository: [KrishK1996/Resume-Analyzer](https://github.com/KrishK1996/Resume-Analyzer)
