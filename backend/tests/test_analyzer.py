"""
Automated unit tests for Resume Analyzer backend components.
"""
import io
import pytest
from pypdf import PdfWriter
from fastapi.testclient import TestClient

from app.pdf_parser import extract_text_from_pdf_bytes, PDFParsingException
from app.models import ResumeData, EducationItem, WorkExperienceItem, JobMatchResult, FileAnalysisResult
from app.prompts import EXTRACTION_USER_PROMPT, JD_MATCH_USER_PROMPT
from app.llm_service import normalize_extracted_dict
from app.main import app


def test_empty_bytes_raises_exception():
    with pytest.raises(PDFParsingException) as exc_info:
        extract_text_from_pdf_bytes(b"", "empty.pdf")
    assert "empty" in str(exc_info.value).lower()


def test_invalid_header_raises_exception():
    with pytest.raises(PDFParsingException) as exc_info:
        extract_text_from_pdf_bytes(b"HELLO WORLD NOT A PDF", "invalid.txt")
    assert "not a valid pdf" in str(exc_info.value).lower()


def test_blank_pdf_page_raises_no_text_exception():
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    with pytest.raises(PDFParsingException) as exc_info:
        extract_text_from_pdf_bytes(pdf_bytes, "blank.pdf")
    assert "no readable text" in str(exc_info.value).lower()


def test_prompt_placeholder_replacement_no_keyerror():
    sample_text = "John Doe Software Engineer"
    prompt = EXTRACTION_USER_PROMPT.replace("__RESUME_TEXT__", sample_text)
    assert sample_text in prompt
    assert "full_name" in prompt


def test_jd_prompt_placeholder_replacement():
    sample_resume = "Skills: Python, FastAPI"
    sample_jd = "Looking for Senior Python Developer"
    prompt = JD_MATCH_USER_PROMPT.replace("__RESUME_TEXT__", sample_resume).replace("__JOB_DESCRIPTION__", sample_jd)
    assert sample_resume in prompt
    assert sample_jd in prompt
    assert "match_score" in prompt


def test_normalizer_handles_dummy_strings_and_aliases():
    raw_dict = {
        "name": "Krishna Kumar",
        "contact": "None",
        "phone_number": "+91 9999999999",
        "email_address": "krishna@example.com",
        "location": "N/A",
        "summary": "Experienced engineer",
        "skills": "Python, Docker, AWS EC2",
        "academics": [{"degree": "B.Tech", "university": "Anna University", "year": 2020}],
        "experience": [
            {
                "employer": "Tech Corp",
                "role": "Cloud Architect",
                "start_date": "2021",
                "end_date": "Present",
                "duties": ["Deployed microservices", "Configured EC2 instances"]
            }
        ],
        "certificates": ["AWS Solutions Architect"]
    }

    normalized = normalize_extracted_dict(raw_dict)
    assert normalized.full_name == "Krishna Kumar"
    assert normalized.location is None  # "N/A" converted to None
    assert normalized.professional_summary == "Experienced engineer"
    assert normalized.skills == ["Python", "Docker", "AWS EC2"]
    assert normalized.education[0].institution == "Anna University"
    assert normalized.work_experience[0].company == "Tech Corp"
    assert normalized.work_experience[0].job_title == "Cloud Architect"
    assert len(normalized.work_experience[0].responsibilities) == 2
    assert normalized.certifications == ["AWS Solutions Architect"]


def test_resume_data_schema_defaults_to_none():
    data = ResumeData()
    assert data.full_name is None
    assert data.email is None
    assert data.phone is None
    assert data.location is None
    assert data.skills is None
    assert data.education is None
    assert data.work_experience is None
    assert data.certifications is None
    assert data.professional_summary is None


def test_resume_data_serialization():
    edu = EducationItem(degree="B.S. in Computer Science", institution="MIT", graduation_year=2022)
    work = WorkExperienceItem(company="Tech Corp", job_title="Developer", start_date="2022", end_date="2024", responsibilities=["Built APIs"])
    
    resume = ResumeData(
        full_name="Alice Smith",
        email="alice@example.com",
        phone=None,
        location="Boston, MA",
        skills=["Python", "FastAPI"],
        education=[edu],
        work_experience=[work],
        certifications=None,
        professional_summary="Passionate software developer."
    )
    
    dumped = resume.model_dump()
    assert dumped["full_name"] == "Alice Smith"
    assert dumped["phone"] is None
    assert dumped["certifications"] is None
    assert len(dumped["skills"]) == 2
    assert dumped["education"][0]["institution"] == "MIT"


def test_job_match_result_schema():
    match = JobMatchResult(
        match_score=85,
        matching_skills=["Python", "FastAPI"],
        missing_skills=["Kubernetes"],
        summary="Strong candidate with good API background.",
        recommendations=["Gain Kubernetes certification"]
    )
    dumped = match.model_dump()
    assert dumped["match_score"] == 85
    assert dumped["matching_skills"] == ["Python", "FastAPI"]
    assert dumped["missing_skills"] == ["Kubernetes"]
    assert "Kubernetes certification" in dumped["recommendations"][0]


def test_file_analysis_result_with_job_match():
    match = JobMatchResult(match_score=90, matching_skills=["Docker"])
    res = FileAnalysisResult(
        filename="test.pdf",
        file_size_bytes=1024,
        status="success",
        job_match=match
    )
    assert res.job_match.match_score == 90
    assert res.job_match.matching_skills == ["Docker"]


def test_logs_endpoint():
    client = TestClient(app)
    # Without credentials, access should be forbidden if server has configured key
    import os
    configured_key = os.getenv("ADMIN_KEY") or os.getenv("GROQ_API_KEY")
    if configured_key:
        unauth_response = client.get("/api/logs?lines=20")
        assert unauth_response.status_code == 403

        auth_response = client.get("/api/logs?lines=20", headers={"X-Admin-Key": configured_key})
        assert auth_response.status_code == 200
        data = auth_response.json()
        assert "logs" in data
        assert isinstance(data["logs"], list)
    else:
        response = client.get("/api/logs?lines=20")
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        assert isinstance(data["logs"], list)
