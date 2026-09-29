# AI-Powered Resume Analyzer — Architecture

## 1. Overview

The Resume Analyzer is a web application that allows a user to upload a PDF resume, extract its text, send the extracted text to an external AI API, receive structured resume information as JSON, validate the response, and display the results through a React user interface.

The original assignment specifies Python + Streamlit for the application UI. For this implementation, **React replaces Streamlit as the user interface**, while Python remains responsible for the backend/application logic. A lightweight Python API framework such as FastAPI is therefore used as the integration layer between React and the Python services.

The assignment requires PDF processing, external AI integration, Docker containerization, AWS EC2 deployment, Git version control, security controls, and graceful error handling.

## 2. High-Level Architecture

```text
                         USER
                           |
                           | HTTP
                           v
                 +-------------------+
                 |   React Frontend  |
                 |                   |
                 | - Resume Upload   |
                 | - Analyze Button  |
                 | - Results UI      |
                 | - Error Messages  |
                 +---------+---------+
                           |
                           | REST API
                           v
                 +-------------------+
                 | Python Backend    |
                 |    (FastAPI)      |
                 +---------+---------+
                           |
             +-------------+-------------+
             |                           |
             v                           v
     +---------------+           +----------------+
     | PDF Processor |           | AI Service     |
     | PyMuPDF       |           | Gemini API     |
     +-------+-------+           +--------+-------+
             |                            |
             | Extracted text             | Structured JSON
             +-------------+--------------+
                           |
                           v
                 +-------------------+
                 | Response Validator|
                 | JSON / Schema     |
                 +---------+---------+
                           |
                           v
                    React Frontend
                           |
                           v
                    Structured Results
```

## 3. Main Components

### 3.1 React Frontend

Responsibilities:

- Provide the resume upload interface.
- Restrict the upload flow to PDF files.
- Display the uploaded filename.
- Provide an Analyze Resume action.
- Display loading/progress state.
- Display extracted candidate information.
- Display education, experience, skills, certifications, and summary in separate sections.
- Display user-friendly errors.
- Allow another resume to be uploaded and analyzed.

The frontend does not directly communicate with the AI provider and does not contain the AI API key.

### 3.2 Python Backend

Responsibilities:

- Expose API endpoints to the React frontend.
- Validate uploaded files.
- Receive PDF files.
- Pass PDFs to the PDF extraction service.
- Send extracted text to the AI service.
- Validate and parse the AI response.
- Return a consistent JSON response to React.
- Handle application and external API errors.

A lightweight FastAPI layer is used because a React application needs an HTTP API to communicate with Python.

### 3.3 PDF Processing Service

Recommended library: **PyMuPDF**.

Responsibilities:

- Open uploaded PDF files.
- Extract text page by page.
- Combine extracted text.
- Detect corrupted PDFs.
- Detect PDFs containing no extractable text.
- Return extracted text to the backend.

OCR is optional and is outside the initial scope.

### 3.4 AI Service

The backend sends extracted resume text to an external AI API such as Google Gemini.

Responsibilities:

- Analyze unstructured resume text.
- Extract the required fields.
- Return structured JSON.
- Avoid inventing information that is not present.
- Represent missing information as `null` or empty arrays.
- Handle API failures, rate limits, and malformed responses.

The AI model is not hosted on EC2.

### 3.5 Response Validation

The backend validates the AI response before returning it to React.

Expected top-level structure:

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

Validation prevents malformed AI output from reaching the UI.

## 4. Request Flow

### Resume Analysis Flow

```text
1. User selects resume.pdf
          |
2. React sends multipart/form-data request
          |
3. Python API validates file
          |
4. PyMuPDF extracts text
          |
5. Backend checks that text exists
          |
6. Backend builds extraction prompt
          |
7. Extracted text is sent to AI API
          |
8. AI returns structured JSON
          |
9. Backend validates/parses JSON
          |
10. Backend returns JSON response
          |
11. React renders results
```

## 5. API Design

### POST `/api/analyze`

Purpose:

Analyze an uploaded resume.

Request:

```text
Content-Type: multipart/form-data

file: resume.pdf
```

Successful response:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 555 123 4567",
  "location": "Toronto, Canada",
  "skills": ["Python", "Docker", "AWS", "SQL"],
  "education": [
    {
      "degree": "BSc Computer Science",
      "institution": "University of Toronto",
      "graduation_year": 2020
    }
  ],
  "experience": [
    {
      "company": "ABC Technologies",
      "job_title": "Software Engineer",
      "start_date": "2021",
      "end_date": "2025",
      "responsibilities": [
        "Developed Python applications",
        "Worked with cloud infrastructure"
      ]
    }
  ],
  "certifications": [],
  "summary": "Software engineer with experience in Python, cloud infrastructure, and application development."
}
```

The exact structure may be extended as long as all required information remains available.

## 6. Error Flow

```text
Invalid file
    -> 400 response
    -> React displays validation error

Corrupted PDF
    -> PDF extraction error
    -> React displays processing error

No extractable text
    -> validation error
    -> React displays readable-text error

AI API failure
    -> backend catches exception
    -> React displays retry message

AI rate limit
    -> backend returns controlled error
    -> React displays temporary-unavailability message

Invalid AI JSON
    -> backend rejects response
    -> React displays analysis error
```

Sensitive technical details and API credentials must never be returned to the client.

## 7. Deployment Architecture

```text
                    Internet
                       |
                       v
              EC2 Public IP
                       |
                    Port 8501
                       |
             +-------------------+
             | Docker Container  |
             |                   |
             | React Frontend    |
             | Python API        |
             | PDF Processing    |
             +---------+---------+
                       |
                       | HTTPS/API request
                       v
                 External AI API
```

For a simple assignment deployment, the React production build can be served from the same Dockerized application/container environment as the Python API. A reverse proxy can be introduced if needed, but it is not required for the initial implementation.

The assignment expects the deployed application to be accessible using the EC2 public IP and port 8501.

## 8. Docker Architecture

```text
Docker Image
    |
    +-- Python runtime
    +-- Python dependencies
    +-- React production build
    +-- Backend source
    +-- Application configuration
```

The API key is **not** baked into the image. It is provided at runtime through an environment variable.

Example runtime configuration:

```text
GEMINI_API_KEY=<secret>
```

## 9. Security Architecture

- Store AI credentials in environment variables.
- Provide `.env.example` with placeholders only.
- Add `.env` to `.gitignore`.
- Never commit real API keys.
- Do not log API keys.
- Avoid unnecessary retention of uploaded resumes.
- Do not expose sensitive resume content in application logs.
- Restrict EC2 security-group ports to those required.
- Where practical, restrict SSH access to the developer's IP address.
- Do not send the entire PDF to the AI API when extracted text is sufficient.

## 10. Data Retention

The application is designed as a stateless analyzer.

The uploaded resume should be held temporarily in memory or temporary processing storage only as required for analysis. No database is required by the assignment.

After analysis, the application should not retain the uploaded resume unnecessarily.

## 11. Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | React | User-requested UI technology and suitable for a dedicated web interface |
| Backend | Python + FastAPI | Provides a clean API boundary between React and Python |
| PDF extraction | PyMuPDF | Lightweight Python PDF text extraction |
| AI | External free-tier AI API | Required by assignment; no local AI model needed |
| Containerization | Docker | Required by assignment |
| Hosting | AWS EC2 | Required by assignment |
| Version control | Git | Required by assignment |
| Database | None | Not required |
| Authentication | None | Not required |
| OCR | Optional | Not required for the core implementation |

## 12. Important Assignment Deviation

The supplied assignment specifies **Streamlit** as the user interface technology. This implementation intentionally uses **React** instead, based on the requested project tech stack.

Everything else remains aligned with the assignment: Python development, PDF extraction, external AI API, structured JSON, Docker, AWS EC2, Git, security, error handling, and the required resume fields.

If strict compliance with the original assignment is required, Streamlit should be used instead of React.
