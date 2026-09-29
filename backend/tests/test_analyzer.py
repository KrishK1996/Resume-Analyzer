"""
Automated unit tests for Resume Analyzer backend components.
"""
import io
import pytest
from pypdf import PdfWriter
from app.pdf_parser import extract_text_from_pdf_bytes, PDFParsingException
from app.models import ResumeData, EducationItem, WorkExperienceItem


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
