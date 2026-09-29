# Product Requirements Document (PRD)

# AI-Powered Resume Analyzer

## 1. Product Summary

The AI-Powered Resume Analyzer is a web application that allows users to upload a PDF resume and automatically extract structured candidate information using an external AI API.

The product converts unstructured resume content into a consistent JSON structure and presents the extracted information through a clean React interface.

The application is designed as a lightweight technical assignment and prioritizes a working end-to-end solution over production-grade complexity.

## 2. Problem Statement

Resume information is commonly presented in unstructured PDF documents. Manually extracting candidate information such as skills, education, experience, certifications, and contact details can be repetitive and time-consuming.

The Resume Analyzer automates the initial extraction process by:

```text
PDF Resume
    ↓
Text Extraction
    ↓
AI Analysis
    ↓
Structured JSON
    ↓
Readable Web Interface
```

## 3. Product Goal

Build a simple, reliable web application that can accept a PDF resume and return structured candidate information using an external AI API.

## 4. Objectives

The product must demonstrate the ability to:

- Build a web application using Python and React.
- Process PDF documents.
- Extract text from PDF resumes.
- Integrate an external AI API.
- Design prompts for structured information extraction.
- Validate AI-generated JSON.
- Handle missing information.
- Handle PDF and API errors gracefully.
- Containerize the application with Docker.
- Deploy the application to AWS EC2.
- Manage the source code with Git.
- Follow basic security practices.

## 5. Target User

### Primary User

A person who needs to quickly inspect and structure information from a candidate resume.

The user should not need technical knowledge to operate the application.

## 6. User Journey

```text
1. User opens Resume Analyzer.
          ↓
2. User selects a PDF resume.
          ↓
3. Application validates the file.
          ↓
4. User clicks "Analyze Resume".
          ↓
5. Application extracts PDF text.
          ↓
6. Extracted text is sent to the AI API.
          ↓
7. AI returns structured JSON.
          ↓
8. Backend validates the JSON.
          ↓
9. Results are displayed in React.
          ↓
10. User can upload another resume.
```

## 7. Functional Requirements

### FR-01 — Resume Upload

The system shall allow the user to upload a resume in PDF format.

Acceptance criteria:

- PDF files can be selected.
- The uploaded filename is displayed.
- Non-PDF files are rejected.
- Empty/invalid uploads produce a meaningful error.

### FR-02 — PDF Text Extraction

The system shall extract text from the uploaded PDF.

Acceptance criteria:

- Text is extracted from all readable pages.
- Corrupted PDFs are handled gracefully.
- PDFs containing no extractable text are rejected with a clear message.
- The application does not send the complete PDF to the AI API when extracted text is sufficient.

### FR-03 — AI Analysis

The system shall send extracted resume text to an external AI API.

Acceptance criteria:

- API credentials are loaded from an environment variable.
- Credentials are not hardcoded.
- The prompt requests structured output.
- API errors are handled.
- Rate limits are handled.
- Invalid AI responses do not crash the application.

### FR-04 — Candidate Information Extraction

The system shall extract the following information where available:

| Field | Requirement |
|---|---|
| Name | Candidate's full name |
| Email | Candidate's email |
| Phone | Candidate's contact number |
| Location | City, state, or country |
| Skills | Technical and relevant professional skills |
| Education | Degree, institution, graduation year |
| Experience | Company, job title, dates, responsibilities |
| Certifications | Professional certifications |
| Summary | Concise professional summary |

The AI must not invent information that is absent from the resume.

### FR-05 — Structured JSON

The AI response shall be parsed and validated before being returned to the frontend.

Expected structure:

```json
{
  "name": null,
  "email": null,
  "phone": null,
  "location": null,
  "skills": [],
  "education": [],
  "experience": [],
  "certifications": [],
  "summary": null
}
```

### FR-06 — Results Display

The React application shall display the extracted information clearly.

Required sections:

- Candidate information
- Skills
- Education
- Work experience
- Certifications
- Professional summary

### FR-07 — Loading State

The application shall show a loading/progress indicator while resume analysis is being performed.

### FR-08 — Error Handling

The application shall handle:

- Invalid file type.
- Corrupted PDF.
- Empty/unreadable PDF.
- AI API failure.
- API rate limiting.
- Invalid AI response.
- Missing resume information.

The application shall display user-friendly errors without exposing API credentials or unnecessary technical details.

### FR-09 — Analyze Another Resume

The user shall be able to upload and analyze another resume without restarting the application.

## 8. Non-Functional Requirements

### NFR-01 — Security

- AI API keys must be stored in environment variables.
- `.env` must be excluded from Git.
- `.env.example` must contain placeholders only.
- Real credentials must never be committed.
- API keys must not be logged.
- Sensitive resume content should not be unnecessarily logged.

### NFR-02 — Data Retention

The application should not unnecessarily retain uploaded resumes.

No database is required.

### NFR-03 — Usability

The UI should be:

- Clear
- Simple
- Intuitive
- Responsive enough for normal desktop use
- Easy to understand without technical knowledge

### NFR-04 — Maintainability

The application should separate responsibilities between:

```text
Frontend
Backend/API
PDF processing
AI service
Prompt definitions
Configuration
```

### NFR-05 — Containerization

The application shall run inside Docker.

The Docker configuration shall:

- Install dependencies.
- Build/run the application.
- Expose port `8501`.
- Accept secrets at runtime.

### NFR-06 — Deployment

The application shall be deployed to AWS EC2.

The deployed application shall be accessible through the EC2 public IP and port `8501`.

## 9. Technical Architecture

```text
+------------------+
|   React Client   |
+--------+---------+
         |
         | POST /api/analyze
         v
+------------------+
| Python / FastAPI |
+--------+---------+
         |
         v
+------------------+
|    PyMuPDF      |
+--------+---------+
         |
         | Extracted text
         v
+------------------+
| External AI API |
+--------+---------+
         |
         | JSON
         v
+------------------+
| JSON Validation |
+--------+---------+
         |
         v
+------------------+
| React Results   |
+------------------+
```

## 10. Core Data Model

### Education

```json
{
  "degree": "",
  "institution": "",
  "graduation_year": null
}
```

### Experience

```json
{
  "company": "",
  "job_title": "",
  "start_date": "",
  "end_date": "",
  "responsibilities": []
}
```

### Complete Resume Result

```json
{
  "name": null,
  "email": null,
  "phone": null,
  "location": null,
  "skills": [],
  "education": [],
  "experience": [],
  "certifications": [],
  "summary": null
}
```

## 11. API Requirements

### `POST /api/analyze`

Request:

```text
multipart/form-data
file=<resume.pdf>
```

Success:

```text
HTTP 200
```

Response:

```json
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "location": "...",
  "skills": [],
  "education": [],
  "experience": [],
  "certifications": [],
  "summary": "..."
}
```

Possible error categories:

```text
400 — Invalid file/request
422 — Validation failure
429 — AI API rate limit
500 — Internal/AI processing failure
```

Exact status handling may be adjusted during implementation.

## 12. UI Requirements

### Landing/Upload Screen

The page should contain:

```text
AI Resume Analyzer

Upload your resume
[ Browse / Select PDF ]

Selected file:
resume.pdf

[ Analyze Resume ]
```

### Analysis State

```text
Analyzing resume...
Please wait.
```

### Results Screen

```text
Candidate Information

Name
Email
Phone
Location

Skills

Education

Work Experience

Certifications

Professional Summary
```

The UI should provide a clear way to analyze another resume.

## 13. Error Messages

Examples:

### Invalid file

```text
Please upload a valid PDF resume.
```

### Corrupted PDF

```text
We could not process this PDF. Please try another file.
```

### No text

```text
No readable text was found in this PDF.
```

### AI failure

```text
We could not analyze the resume right now. Please try again.
```

### Rate limit

```text
The AI service is temporarily unavailable. Please try again later.
```

The application must not reveal API keys, stack traces, or sensitive internal details to users.

## 14. Technology Requirements

| Technology | Role |
|---|---|
| Python | Backend/application development |
| React | User interface |
| FastAPI | Python HTTP/API layer |
| PyMuPDF | PDF text extraction |
| External AI API | Resume analysis |
| JSON | Structured output |
| Docker | Containerization |
| AWS EC2 | Hosting |
| Git | Version control |
| GitHub | Remote repository |

## 15. Deployment Requirements

The deployment shall follow:

```text
Developer
   ↓
GitHub
   ↓
AWS EC2
   ↓
Docker
   ↓
Resume Analyzer
```

The EC2 security group must permit the application port required for access.

SSH access should be restricted to the developer's IP address where practical.

## 16. Out of Scope

The following are not required for the core product:

- Database
- User authentication
- Local AI model hosting
- OCR
- Custom domain
- DNS
- HTTPS
- Kubernetes
- ECS
- Lambda
- Production-grade multi-user architecture

## 17. Optional Features

After the core system works, the following may be considered:

### Download JSON

Allow users to download the extracted result as a JSON file.

### Multiple Resume Uploads

Allow users to process multiple resumes.

### Resume/Job Description Matching

Allow a user to provide a job description and compare it with the extracted resume information.

### Enhanced Logging

Add useful application logging while avoiding sensitive resume data and credentials.

## 18. Definition of Done

The project is complete when:

- A user can access the deployed application using the EC2 public IP.
- The user can upload a PDF resume.
- The PDF is validated.
- Resume text is extracted.
- Extracted text is sent to an external AI API.
- Structured resume information is returned.
- The response is validated before display.
- Results are displayed in the React interface.
- Missing information is handled without hallucination.
- Errors are handled gracefully.
- The application runs inside Docker.
- The API key is supplied securely through an environment variable.
- The project is stored in Git/GitHub.
- README documentation explains setup, Docker, AWS deployment, environment variables, architecture, and limitations.

## 19. Important Implementation Note

The supplied assignment explicitly names **Streamlit** as the required UI technology. This PRD instead specifies **React** because React was explicitly selected as the desired UI technology for this implementation.

If the evaluator enforces the assignment's original technical requirement literally, the frontend should be changed from React to Streamlit. If React is accepted, the Python backend/API layer is required to connect the React frontend to the Python processing and AI services.
