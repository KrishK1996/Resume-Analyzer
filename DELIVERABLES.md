# Technical Interview Assignment — Final Submission & Deliverables

## 📌 Project Information & Links

| Deliverable Item | Details / URL |
|---|---|
| **Project Title** | AI-Powered Multi-File Resume Analyzer |
| **Live AWS EC2 Deployment** | [http://34.230.75.69:8501](http://34.230.75.69:8501) |
| **GitHub Repository** | [https://github.com/KrishK1996/Resume-Analyzer](https://github.com/KrishK1996/Resume-Analyzer) |
| **Backend & Integration** | Python 3.12 · FastAPI · Uvicorn |
| **Frontend Framework** | React 19 · Vite · Tailwind CSS · Lucide Icons |
| **PDF Extraction Engine** | `pdfplumber` · `pypdf` |
| **AI Provider & Model** | **Groq API** (`llama-3.3-70b-versatile` & fallback discovery) |
| **Containerization** | Docker (Multi-stage build) · Docker Compose |
| **Cloud Hosting** | AWS EC2 (`t3.micro` / Ubuntu 24.04 LTS / Port 8501) |

---

## 🚀 1. Live Deployment & Access

* **Public Web URL:** `http://34.230.75.69:8501`
* **Port Exposed:** `8501` (serving both FastAPI REST backend and compiled production React SPA)
* **Status:** Operational, verified with live multi-file PDF extraction and zero-hallucination structured parsing.

---

## 🧠 2. AI Provider & Model Rationale

### Chosen Provider: **Groq API**
* **Ultra-Low Latency:** Groq's LPU (Language Processing Unit) architecture completes 3,000+ character resume extraction in under 2–3 seconds, offering a superior user experience compared to traditional cloud LLM endpoints.
* **Generous Free Tier:** Provides generous free token limits per minute and day without credit card lock-in.
* **Deterministic Structured JSON:** Supports JSON object mode and `temperature: 0.0` to eliminate creative hallucinations and enforce strict schema conformance.

### Models Used:
1. **Primary Model:** `llama-3.3-70b-versatile` (70 Billion parameter open-weights model capable of deep context comprehension, complex multi-page resume layouts, and nuanced skill extraction).
2. **Automated Fallback Discovery:** Dynamic discovery system fallback (`llama-3.1-8b-instant`, `llama-3.1-70b-versatile`) if rate limits or model tier quotas are reached.

---

## 🎯 3. Core Features Implemented

1. **Multi-File PDF Upload:** Upload single or multiple PDF resumes in a single batch with drag-and-drop support.
2. **Rigorous PDF Validation:** Pre-validates magic PDF header bytes (`%PDF-`), flags corrupted or 0-byte files, and detects scanned/image-only PDFs lacking an OCR text layer.
3. **Strict Zero-Hallucination Extraction:** Factual extraction enforced via strict system prompts. Any omitted field is explicitly returned as `null` (or empty array `[]`), never guessed or filled with placeholders.
4. **Structured JSON Output & Export:** Categorizes Name, Phone, Email, Location, Skills, Education, Work Experience (with company, role, dates, bullets), Certifications, and Summary. Includes one-click JSON modal and JSON file export.
5. **Bonus Feature — Job Description Skill Gap Analysis:** Compare any resume against a job description to calculate match percentage, matching skills, missing skills, and tailored recommendations.
6. **Backend-Only Centralized Logging:** Detailed operation logs are securely written to `backend/logs/resume_analyzer.log` with a 5MB rotating file handler, protected from public web users.

---

## 🔒 4. Security & Privacy Controls

* **Credential Safety:** `GROQ_API_KEY` is loaded from server environment variables; never hardcoded, never exposed in client bundles, and excluded from Git via `.gitignore`.
* **In-Memory File Processing:** Uploaded resumes are read as memory streams and immediately discarded after analysis. No candidate PII is persisted to disk or external databases.
* **Restricted Infrastructure:** EC2 security group allows only inbound traffic on HTTP `8501` and SSH `22`. Public access to the backend `/api/logs` endpoint is restricted with 403 Forbidden.

---

## 🛠 5. Local Setup & Docker Commands

### Running with Docker (Recommended):
```bash
# 1. Clone repository
git clone https://github.com/KrishK1996/Resume-Analyzer.git
cd Resume-Analyzer

# 2. Add your Groq API key
echo "GROQ_API_KEY=your_groq_api_key" > backend/.env

# 3. Build and launch container
docker compose up -d --build
```
Access at: `http://localhost:8501`

### Running Unit Tests:
```bash
cd backend
python -m pytest tests/ -v
```
All 11 unit tests pass covering validation, serialization, null defaults, and prompt safety.

---

## ⚠️ 6. Assumptions & Limitations

1. **Scanned Image PDFs:** Only text-layer PDFs are parsed directly. Image-only scans without OCR return a clear user prompt to upload a digital text PDF.
2. **Context Window Protection:** Resume text is safely capped at 35,000 characters to prevent token overflow.
3. **Single EC2 Host:** Runs on an AWS Free-Tier `t3.micro` instance with 2GB swap space enabled to ensure stable memory management during container operations.
