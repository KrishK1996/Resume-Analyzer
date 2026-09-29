from typing import List, Optional, Union
from pydantic import BaseModel, Field


class EducationItem(BaseModel):
    degree: Optional[str] = Field(default=None, description="Degree, certificate, or program name, or null if missing")
    institution: Optional[str] = Field(default=None, description="College, university, or school name, or null if missing")
    graduation_year: Optional[Union[str, int]] = Field(default=None, description="Graduation year or date range, or null if missing")


class WorkExperienceItem(BaseModel):
    company: Optional[str] = Field(default=None, description="Company or organization name, or null if missing")
    job_title: Optional[str] = Field(default=None, description="Job title / role, or null if missing")
    start_date: Optional[str] = Field(default=None, description="Employment start date or null if missing")
    end_date: Optional[str] = Field(default=None, description="Employment end date (or 'Present') or null if missing")
    responsibilities: Optional[List[str]] = Field(default=None, description="List of key responsibilities, or null if missing")


class ResumeData(BaseModel):
    full_name: Optional[str] = Field(default=None, description="Candidate's full name, or null if missing")
    phone: Optional[str] = Field(default=None, description="Candidate's phone/contact number, or null if missing")
    email: Optional[str] = Field(default=None, description="Candidate's email address, or null if missing")
    location: Optional[str] = Field(default=None, description="Candidate's city, state, or country, or null if missing")
    skills: Optional[List[str]] = Field(default=None, description="List of technical and professional skills, or null if missing")
    education: Optional[List[EducationItem]] = Field(default=None, description="List of education records, or null if missing")
    work_experience: Optional[List[WorkExperienceItem]] = Field(default=None, description="List of work experience entries, or null if missing")
    certifications: Optional[List[str]] = Field(default=None, description="List of professional certifications, or null if missing")
    professional_summary: Optional[str] = Field(default=None, description="Concise professional summary, or null if missing")


class FileAnalysisResult(BaseModel):
    filename: str
    file_size_bytes: int
    status: str = Field(..., description="'success' or 'error'")
    error_message: Optional[str] = None
    character_count: Optional[int] = None
    data: Optional[ResumeData] = None


class MultiAnalysisResponse(BaseModel):
    total_files: int
    successful_count: int
    failed_count: int
    results: List[FileAnalysisResult]


class ConfigStatus(BaseModel):
    groq_api_key_configured: bool
    groq_model: str
