# AI-Powered Resume Analyzer — Tech Stack

## 1. Technology Overview

The project uses a Python-based backend, React frontend, PDF text extraction, an external AI API, Docker for containerization, AWS EC2 for hosting, and Git for source control.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Resume upload and results interface |
| Backend | Python | Application/business logic |
| API layer | FastAPI | Communication between React and Python |
| PDF processing | PyMuPDF | Extract text from PDF resumes |
| AI | Google Gemini or another free-tier AI API | Resume information extraction |
| Data format | JSON | Structured AI response |
| Containerization | Docker | Package and run the application consistently |
| Hosting | AWS EC2 | Host the Dockerized application |
| Version control | Git | Source code management |
| Repository | GitHub | Remote source-code repository |
| Configuration | Environment variables | Secure API-key configuration |

## 2. Frontend — React

React is responsible for the user interface.

### Responsibilities

- Resume PDF upload.
- File validation.
- Display uploaded filename.
- Analyze Resume button.
- Loading state.
- Candidate information display.
- Skills display.
- Education display.
- Experience display.
- Certifications display.
- Professional summary display.
- Error messages.
- Upload/analyze another resume.

React does not contain the AI API credential.

## 3. Backend — Python

Python handles the core application logic.

### Responsibilities

- Receive HTTP requests from React.
- Validate uploaded files.
- Extract PDF text.
- Build the AI prompt.
- Call the external AI API.
- Parse and validate JSON.
- Handle errors.
- Return structured responses to React.

## 4. API Layer — FastAPI

FastAPI is the supporting Python web framework required to expose the Python application to the React frontend.

Primary endpoint:

```text
POST /api/analyze
```

The endpoint accepts a PDF file and returns structured resume data.

FastAPI is an implementation detail supporting the requested Python + React architecture; it is not a replacement for Python.

## 5. PDF Library — PyMuPDF

PyMuPDF is responsible for extracting text from uploaded PDF resumes.

### Core responsibilities

- Open PDF.
- Iterate through pages.
- Extract text.
- Combine page text.
- Detect unreadable/empty PDFs.
- Report extraction errors.

The assignment explicitly permits PyMuPDF or pdfplumber.

## 6. AI API

The project uses an external AI API rather than hosting an AI model locally.

### AI responsibilities

The AI analyzes extracted resume text and returns:

- Full name
- Email
- Phone
- Location
- Skills
- Education
- Work experience
- Certifications
- Professional summary

### AI output

The expected response is structured JSON.

The AI must not invent information that is absent from the resume.

Missing information should use `null`, an empty list, or another documented representation.

### Credential management

The API key is supplied through an environment variable:

```env
GEMINI_API_KEY=your_api_key_here
```

The actual `.env` file must never be committed to Git.

## 7. JSON

JSON is the communication format for structured resume-analysis results.

Example:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": null,
  "location": "Toronto, Canada",
  "skills": ["Python", "SQL"],
  "education": [],
  "experience": [],
  "certifications": [],
  "summary": "Software engineer with experience in Python and SQL."
}
```

The backend validates the AI response before sending it to React.

## 8. Docker

Docker packages the application and its dependencies into a reproducible container.

### Docker responsibilities

- Provide a consistent Python runtime.
- Install Python dependencies.
- Build the React production application.
- Package backend/frontend components.
- Expose the application on port `8501`.
- Allow secrets to be passed at runtime.

The application should be runnable without requiring a separate Python installation on the host.

## 9. AWS EC2

AWS EC2 hosts the Dockerized application.

Deployment flow:

```text
GitHub
   |
   v
EC2
   |
   v
Docker Image
   |
   v
Docker Container
   |
   v
Resume Analyzer
```

The assignment expects the application to be accessible through:

```text
http://<EC2-PUBLIC-IP>:8501
```

## 10. Git

Git is used for:

- Version control.
- Tracking development changes.
- Creating commits.
- Managing branches if required.
- Publishing the project to GitHub.

The repository must not contain:

```text
.env
API keys
other secrets
```

## 11. Environment Configuration

Expected environment variable:

```env
GEMINI_API_KEY=your_api_key_here
```

Required configuration files:

```text
.env
.env.example
.gitignore
```

`.env.example` contains placeholders.

`.env` contains local/deployment secrets and is excluded from Git.

## 12. Why This Stack?

The stack keeps the application relatively simple:

```text
React
  ↓
FastAPI / Python
  ↓
PyMuPDF
  ↓
External AI API
  ↓
JSON
  ↓
React
```

Docker packages the application, EC2 hosts it, and Git manages the source code.

The stack is intentionally kept small because the assignment emphasizes a working end-to-end application rather than a production-grade system.

## 13. Scope Exclusions

The core implementation does not require:

- Database
- Authentication
- Local AI model
- Kubernetes
- AWS ECS
- AWS Lambda
- Custom DNS
- Custom domain
- HTTPS configuration
- OCR
- Docker Compose

Optional features can be added after the mandatory end-to-end flow is working.
