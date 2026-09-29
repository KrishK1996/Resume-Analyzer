# Interview Assignment: AI-Powered Resume Analyzer

**Technical assignment**

# Resume Analyzer

**Python · Streamlit · AI API · Docker · AWS EC2**

| **Assignment detail** | **Description** |
|---|---|
| Suggested duration | 4–6 hours |
| Application type | Web application |
| Deployment | AWS EC2 |
| AI integration | Free-tier AI API |

## 1. Project Overview

The objective of this assignment is to develop a simple AI-powered Resume Analyzer that allows users to upload PDF resumes and automatically extract relevant candidate information using an AI API.

The application should provide a user-friendly interface where users can upload a resume, analyze its contents, and view the extracted information in a structured format.

The application must be developed using Python and Streamlit, containerized using Docker, and deployed on an AWS EC2 instance.

The candidate can choose any suitable AI API that offers free-tier access, such as Google Gemini, Groq, or another compatible provider.

The application does not need to host an AI model locally.

## 2. Project Objectives

The primary objectives of this assignment are to evaluate the candidate's ability to:

- Develop a simple web application using Python and Streamlit.
- Process and extract text from PDF documents.
- Integrate a third-party AI API into an application.
- Design effective prompts to extract structured information from unstructured text.
- Handle missing information and AI API errors.
- Containerize an application using Docker.
- Deploy a Dockerized application on AWS EC2.
- Follow basic coding, security, and documentation practices.

## 3. Functional Requirements

### 3.1. Resume Upload

The application must provide a simple interface that allows users to upload a resume in PDF format.

**Requirements:**

- Allow users to upload a PDF file.
- Display the uploaded file's name.
- Provide an option to analyze the uploaded resume.
- Validate the uploaded file type.
- Display an appropriate error message if the uploaded file is invalid or empty.

**Example UI**

*Illustrative layout*

> **Upload your resume**
>
> Select a PDF file to get started
>
> **Browse files**
>
> PDF files only
>
> **john_doe_resume.pdf**
>
> Uploaded successfully  
> Ready
>
> **Analyze Resume**

### 3.2. PDF Text Extraction

Once a resume is uploaded, the application must extract its textual content.

**Requirements:**

- Use a Python PDF processing library such as PyMuPDF or pdfplumber.
- Extract text from the uploaded PDF.
- Handle PDFs that are empty, corrupted, or contain no extractable text.
- Do not send the entire PDF to the AI API unless the chosen API specifically requires it. The expected approach is to extract the text first and then send it to the API.

OCR support for scanned PDFs is optional.

### 3.3. AI Integration

The application must integrate with an external AI API to analyze the extracted resume text.

**Requirements:**

- Use an AI API with free-tier access.
- The candidate can choose the AI provider and model.
- Store the API key in an environment variable.
- Do not hardcode API credentials in the source code.
- Create a suitable prompt to extract the required information from the resume.
- Handle API failures, rate limits, and invalid responses gracefully.

The AI should return structured information rather than just a paragraph of text.

### 3.4. Information to Extract

The application should extract the following information from the uploaded resume.

| Field | Description |
|---|---|
| Full name | Candidate's full name |
| Email | Candidate's email address |
| Phone | Candidate's contact number |
| Location | Candidate's city, state, or country, if available |
| Skills | Technical and relevant professional skills |
| Education | Degrees, institutions, and graduation years, if available |
| Work experience | Previous companies, job titles, employment dates, and responsibilities |
| Certifications | Professional certifications listed in the resume |
| Professional summary | A concise summary of the candidate's experience and qualifications |

The application should not invent information that is absent from the resume. Missing values should be represented as `null`, empty lists, or another clearly documented representation.

### 3.5. Structured Output

The AI API should return the extracted information in JSON format.

The candidate should validate and parse the AI response before displaying it in the application.

An example of the expected output is:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 555 123 4567",
  "location": "Toronto, Canada",
  "skills": [
    "Python",
    "Docker",
    "AWS",
    "SQL"
  ],
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

This is an example of the expected structure. The actual implementation may use a different structure, provided all required information is included and documented.

### 3.6. Display Analysis Results

After the AI has analyzed the resume, the application should display the extracted information in a clear and organized layout.

**Requirements:**

- Display candidate details in a readable format.
- Separate education, work experience, skills, and certifications into distinct sections.
- Display a loading indicator while the resume is being analyzed.
- Show meaningful error messages if analysis fails.
- Allow the user to upload and analyze another resume.

The candidate is free to design the UI, but it should be clean, intuitive, and easy to navigate.

## 4. Technical Requirements

The application must use the following technologies:

| Technology | Requirement |
|---|---|
| Python | Application development |
| Streamlit | User interface |
| PDF library | Extract text from PDF |
| AI API | Resume analysis and information extraction |
| Docker | Containerize the application |
| AWS EC2 | Host the application |
| Git | Source code version control |

The candidate may choose the specific PDF library and AI provider.

## 5. Dockerization

The application must be packaged and run using Docker.

**Requirements:**

- Provide a `Dockerfile` to build the application image.
- Install the required Python dependencies.
- Configure the application to run inside a Docker container.
- Expose the appropriate Streamlit port (8501).
- Pass the AI API key through an environment variable.
- Ensure the application can be started using a Docker command.

Docker Compose is optional.

The application should be runnable locally using Docker without requiring a separate Python installation or manual dependency setup on the host machine.

## 6. AWS EC2 Deployment

The candidate must deploy the Dockerized application to an AWS EC2 instance.

**Requirements:**

1. Create or use an AWS EC2 instance.
2. Install and configure Docker on the instance.
3. Transfer or pull the application source code.
4. Build or pull the Docker image.
5. Run the application inside a Docker container.
6. Configure the EC2 security group to allow access to the application.
7. Make the application accessible through the EC2 instance's public IP address.

### Expected deployment architecture

```text
User's browser
     |
     | HTTP request
     v
AWS EC2
Public IP : 8501
     |
     v
Docker container
     |
     v
Streamlit application
     |
     | Resume text sent for analysis
     v
External AI API
```

*Simplified architecture. The application makes outbound API requests to the AI provider.*

The application should be accessible at:

`http://<EC2-PUBLIC-IP>:8501`

A DNS name, custom domain, and HTTPS configuration are not required for this assignment.

The candidate may use an AWS Free Tier eligible instance, subject to current account eligibility and available resources. The candidate is responsible for ensuring that any AWS usage stays within the available budget.

## 7. Security Requirements

The candidate should follow basic security practices:

- Store AI API keys in environment variables.
- Include a `.env.example` file containing placeholder values.
- Add `.env` to `.gitignore`.
- Never commit actual API keys or other secrets to Git.
- Restrict the EC2 security group to the necessary ports. Where practical, restrict SSH access to the candidate's IP address.
- Avoid logging API keys or sensitive resume content.

Since resumes contain personal information, the application should not retain uploaded resumes unnecessarily. The candidate should document whether any data is stored and what happens to the uploaded file after analysis.

## 8. Error Handling

The application should handle common errors gracefully.

| Scenario | Expected behavior |
|---|---|
| Invalid file type | Display an appropriate error |
| Corrupted PDF | Inform the user that the PDF cannot be processed |
| Empty or unreadable PDF | Inform the user that no text could be extracted |
| AI API failure | Display an appropriate error and allow retrying |
| API rate limit | Display a meaningful message |
| Invalid AI response | Handle parsing errors without crashing |
| Missing resume information | Display missing values appropriately |

The application should not expose sensitive technical details or API credentials in error messages.

## 9. Optional Bonus Features

The following features are optional and are not required for completing the assignment.

### 9.1. Download results as JSON

Allow users to download the extracted resume information as a JSON file.

**Optional**

### 9.2. Multiple resume uploads

Allow users to upload and analyze multiple resumes, either individually or in a batch.

**Optional**

### 9.3. Resume and job description matching

Allow users to enter a job description and compare it with the extracted resume information. Display matching skills and potential skill gaps.

**Optional**

### 9.4. Enhanced logging and error handling

Implement useful application logs and more comprehensive error handling.

**Optional**

## 10. Expected Project Structure

The candidate can organize the project as they see fit. The following is a suggested structure:

```text
resume-analyzer/
│
├── app/
│   ├── main.py
│   ├── pdf_parser.py
│   ├── llm_service.py
│   └── prompts.py
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

The candidate is not required to follow this exact structure. However, the code should be organized logically, with a reasonable separation of responsibilities.

## 11. Deliverables

The candidate must provide the following:

1. **Source code:** A Git repository containing the complete application.
2. **Dockerfile:** Instructions to build and run the application using Docker.
3. **README.md:** Documentation explaining the application and how to run it.
4. **Environment configuration:** An `.env.example` file showing the required environment variables, without actual secrets.
5. **AWS deployment:** A working application deployed on an EC2 instance.
6. **Deployment URL:** The public IP address and port through which the application can be accessed.

The README should include:

- Project overview and architecture.
- Technologies and AI model/provider used.
- Local setup instructions.
- Docker build and run instructions.
- Required environment variables.
- AWS deployment steps.
- Any known limitations or assumptions.

## 12. Evaluation Criteria

The assignment will be evaluated based on the following criteria.

| Category | What will be evaluated |
|---|---|
| Python development | Code quality, readability, and organization |
| Streamlit UI | Usability and presentation of extracted information |
| PDF processing | Correct text extraction and validation |
| AI integration | API integration and prompt design |
| Data extraction | Accuracy and structured output |
| Error handling | Handling of invalid inputs and API failures |
| Docker | Correct container configuration and execution |
| AWS deployment | Successful deployment and accessibility |
| Security | Proper handling of credentials and uploaded data |
| Documentation | Clear setup and deployment instructions |

The emphasis is on a working end-to-end application, not on building a production-grade system.

## 13. Submission Instructions

Please submit the following:

- Git repository link.
- Public IP address and port of the deployed application.
- A short explanation of the AI provider and model selected.
- Any additional notes or limitations.

Please ensure that the deployed application is accessible and that the README contains sufficient instructions for another developer to run it locally.

## 14. Important Notes

- Use of a free-tier AI API is expected. The candidate should select a provider with available free access and document any limitations.
- Do not run the AI model directly on the EC2 instance.
- No database is required.
- No authentication system is required.
- No DNS or custom domain is required.
- The application does not need to be production-ready.
- The candidate should prioritize a working application with clear code and documentation over additional features.

## Definition of Done

The assignment is considered complete when a user can open the application using the EC2 public IP, upload a PDF resume, receive structured information extracted using an AI API, and view the results in the Streamlit interface.

