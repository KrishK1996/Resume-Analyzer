import os
import sys
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv

# Load .env from backend directory or project root
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
root_dir = backend_dir.parent

load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .models import (
    MultiAnalysisResponse,
    FileAnalysisResult,
    ResumeData,
    JobMatchResult,
    CompareJDRequest,
    ConfigStatus,
)
from .pdf_parser import extract_text_from_pdf_bytes, PDFParsingException
from .llm_service import (
    extract_resume_info,
    match_resume_with_jd,
    LLMServiceException,
    get_groq_client,
    resolve_models_for_client,
)

# Set up centralized log directory & rotating file handler
log_dir = backend_dir / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
log_file_path = log_dir / "resume_analyzer.log"

log_formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# File Handler (5 MB max per file, up to 5 backups)
file_handler = RotatingFileHandler(
    log_file_path, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
)
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.INFO)

# Console Handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(log_formatter)
console_handler.setLevel(logging.INFO)

logger = logging.getLogger("resume_analyzer")
logger.setLevel(logging.INFO)
# Clear any default duplicate handlers
logger.handlers.clear()
logger.addHandler(file_handler)
logger.addHandler(console_handler)

logger.info("=" * 60)
logger.info("Resume Analyzer application initialized. Centralized logging active.")
logger.info(f"Log file location: {log_file_path}")
logger.info("=" * 60)

app = FastAPI(
    title="AI-Powered Resume Analyzer API",
    description="Multi-file PDF resume text extraction, structured parsing, and Job Description matching.",
    version="1.1.0",
)

# Enable CORS for local dev servers and cloud hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB limit per resume file


class ApiKeyUpdateRequest(BaseModel):
    api_key: str


@app.get("/api/health", response_model=ConfigStatus)
def health_check():
    """Health check endpoint providing status of server and Groq configuration."""
    load_dotenv(backend_dir / ".env", override=True)
    load_dotenv(root_dir / ".env", override=True)
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    detected_model = "None"
    
    if api_key:
        try:
            client = get_groq_client(api_key)
            models = resolve_models_for_client(client)
            detected_model = models[0] if models else "Unknown"
        except Exception as e:
            detected_model = os.getenv("GROQ_MODEL", "Unknown")

    return ConfigStatus(
        groq_api_key_configured=bool(api_key),
        groq_model=detected_model
    )


@app.get("/api/logs")
def get_recent_logs(
    lines: int = 100,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    admin_key: Optional[str] = None
):
    """Restricted endpoint for backend operation logs (protected by server key)."""
    configured_key = os.getenv("ADMIN_KEY") or os.getenv("GROQ_API_KEY")
    provided_key = x_admin_key or admin_key
    
    # If the server is configured with a key, restrict public access to authorized requests
    if configured_key and provided_key != configured_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System logs are restricted to backend administrator access."
        )

    if not log_file_path.exists():
        return {"logs": [], "total_lines": 0}
    try:
        content = log_file_path.read_text(encoding="utf-8").splitlines()
        slice_lines = content[-lines:] if lines > 0 else content
        return {"logs": slice_lines, "total_lines": len(content)}
    except Exception as e:
        logger.error(f"Failed to read centralized log file: {e}")
        return {"logs": [], "error": str(e)}


@app.post("/api/config/api-key")
def update_api_key(payload: ApiKeyUpdateRequest):
    """Validates and updates the Groq API key, discovering the best available model."""
    key = payload.api_key.strip()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API key cannot be empty."
        )

    # 1. Validate key with Groq
    try:
        from groq import Groq, AuthenticationError
        test_client = Groq(api_key=key)
        available_models = resolve_models_for_client(test_client)
        selected_model = available_models[0] if available_models else "Unknown"
    except AuthenticationError:
        logger.warning("API key validation failed: Authentication error.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. The provided Groq API key is invalid or revoked."
        )
    except Exception as e:
        logger.error(f"API key connection check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect to Groq with this key: {str(e)}"
        )

    # 2. Store in memory environment
    os.environ["GROQ_API_KEY"] = key
    os.environ["GROQ_MODEL"] = selected_model

    # 3. Persist to backend/.env
    try:
        env_path = backend_dir / ".env"
        existing_lines = []
        if env_path.exists():
            existing_lines = env_path.read_text(encoding="utf-8").splitlines()

        has_key = False
        has_model = False
        new_lines = []
        for line in existing_lines:
            if line.startswith("GROQ_API_KEY="):
                new_lines.append(f"GROQ_API_KEY={key}")
                has_key = True
            elif line.startswith("GROQ_MODEL="):
                new_lines.append(f"GROQ_MODEL={selected_model}")
                has_model = True
            else:
                new_lines.append(line)
        if not has_key:
            new_lines.append(f"GROQ_API_KEY={key}")
        if not has_model:
            new_lines.append(f"GROQ_MODEL={selected_model}")

        env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
        logger.info(f"API key updated and verified. Model assigned: {selected_model}")
    except Exception as e:
        logger.warning(f"Could not persist key to backend/.env: {e}")

    return {
        "status": "success",
        "message": f"API key verified! Active model: {selected_model}",
        "detected_model": selected_model
    }


@app.post("/api/analyze", response_model=MultiAnalysisResponse)
async def analyze_resumes(
    files: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None),
    x_groq_api_key: Optional[str] = Header(None, description="Optional per-request Groq API Key")
):
    """
    Upload one or multiple PDF resume files for text extraction and AI analysis.
    If job_description is provided, also performs JD alignment and skill gap comparison.
    """
    if not files:
        logger.warning("[ANALYZE] Request rejected: No files uploaded.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files were uploaded. Please upload at least one PDF resume."
        )

    has_jd = bool(job_description and job_description.strip())
    logger.info(f"[ANALYZE_BATCH_START] Processing {len(files)} file(s). Job Description Provided: {has_jd}")

    results: List[FileAnalysisResult] = []

    for file in files:
        filename = file.filename or "unknown.pdf"
        logger.info(f"[FILE_RECEIVED] '{filename}'")

        # 1. Validate file extension
        if not filename.lower().endswith(".pdf"):
            msg = f"'{filename}' is not a valid PDF file. Please upload PDF files only."
            logger.warning(f"[FILE_VALIDATION_ERROR] '{filename}': {msg}")
            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=0,
                    status="error",
                    error_message=msg,
                    data=None
                )
            )
            continue

        try:
            # 2. Read bytes
            pdf_bytes = await file.read()
            file_size = len(pdf_bytes)

            if file_size > MAX_FILE_SIZE:
                msg = f"File exceeds maximum allowed size of 15MB ({file_size / (1024*1024):.1f}MB)."
                logger.warning(f"[FILE_SIZE_EXCEEDED] '{filename}': {msg}")
                results.append(
                    FileAnalysisResult(
                        filename=filename,
                        file_size_bytes=file_size,
                        status="error",
                        error_message=msg,
                        data=None
                    )
                )
                continue

            # 3. Extract text using PDF library
            text, page_count = extract_text_from_pdf_bytes(pdf_bytes, filename=filename)
            char_count = len(text)
            logger.info(f"[PDF_TEXT_EXTRACTED] '{filename}': {char_count} chars across {page_count} page(s).")

            # 4. Extract structured features via Groq AI
            resume_data = extract_resume_info(text, custom_api_key=x_groq_api_key)
            logger.info(f"[AI_EXTRACTION_SUCCESS] '{filename}': Candidate '{resume_data.full_name}' parsed.")

            # 5. Optional Job Description Comparison
            job_match = None
            if has_jd:
                try:
                    logger.info(f"[JD_MATCH_START] Comparing '{filename}' with provided Job Description...")
                    job_match = match_resume_with_jd(text, job_description.strip(), custom_api_key=x_groq_api_key)
                    logger.info(f"[JD_MATCH_SUCCESS] '{filename}': Score {job_match.match_score}%, {len(job_match.matching_skills)} matches, {len(job_match.missing_skills)} gaps.")
                except Exception as jd_err:
                    logger.warning(f"[JD_MATCH_FAILED] '{filename}': {jd_err}")

            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=file_size,
                    status="success",
                    error_message=None,
                    character_count=char_count,
                    data=resume_data,
                    job_match=job_match
                )
            )

        except PDFParsingException as pdf_err:
            logger.warning(f"[PDF_PARSING_ERROR] '{filename}': {pdf_err}")
            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=len(pdf_bytes) if 'pdf_bytes' in locals() else 0,
                    status="error",
                    error_message=str(pdf_err),
                    data=None
                )
            )
        except LLMServiceException as llm_err:
            logger.error(f"[AI_SERVICE_ERROR] '{filename}': {llm_err}")
            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=len(pdf_bytes) if 'pdf_bytes' in locals() else 0,
                    status="error",
                    error_message=str(llm_err),
                    data=None
                )
            )
        except Exception as e:
            logger.exception(f"[INTERNAL_ERROR] Unexpected error on '{filename}': {e}")
            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=len(pdf_bytes) if 'pdf_bytes' in locals() else 0,
                    status="error",
                    error_message=f"An unexpected error occurred while analyzing '{filename}': {str(e)}",
                    data=None
                )
            )

    successful = sum(1 for r in results if r.status == "success")
    failed = len(results) - successful
    logger.info(f"[ANALYZE_BATCH_COMPLETE] Total: {len(results)}, Successful: {successful}, Failed: {failed}")

    return MultiAnalysisResponse(
        total_files=len(results),
        successful_count=successful,
        failed_count=failed,
        results=results
    )


@app.post("/api/compare-jd", response_model=JobMatchResult)
async def compare_single_jd(
    payload: CompareJDRequest,
    x_groq_api_key: Optional[str] = Header(None)
):
    """
    On-demand endpoint to compare resume content (raw text or structured data)
    against a newly pasted Job Description.
    """
    if not payload.job_description or not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    # Prepare resume text
    resume_context = ""
    if payload.resume_text and payload.resume_text.strip():
        resume_context = payload.resume_text.strip()
    elif payload.resume_data:
        d = payload.resume_data
        parts = []
        if d.full_name: parts.append(f"Name: {d.full_name}")
        if d.professional_summary: parts.append(f"Summary: {d.professional_summary}")
        if d.skills: parts.append(f"Skills: {', '.join(d.skills)}")
        if d.work_experience:
            parts.append("Work Experience:")
            for w in d.work_experience:
                parts.append(f"- {w.job_title or ''} at {w.company or ''} ({w.start_date or ''} - {w.end_date or ''})")
                if w.responsibilities:
                    for r in w.responsibilities:
                        parts.append(f"  * {r}")
        if d.education:
            parts.append("Education:")
            for e in d.education:
                parts.append(f"- {e.degree or ''} from {e.institution or ''} ({e.graduation_year or ''})")
        if d.certifications:
            parts.append(f"Certifications: {', '.join(d.certifications)}")
        resume_context = "\n".join(parts)
    else:
        raise HTTPException(status_code=400, detail="Either resume_text or resume_data must be provided.")

    logger.info("[COMPARE_JD_REQUEST] Comparing resume text with Job Description on demand.")
    match_result = match_resume_with_jd(resume_context, payload.job_description.strip(), custom_api_key=x_groq_api_key)
    logger.info(f"[COMPARE_JD_COMPLETE] Score: {match_result.match_score}%")
    return match_result


# Serve frontend static files if built (e.g. for Docker / EC2 production deployment)
frontend_dist_dir = root_dir / "frontend" / "dist"
if frontend_dist_dir.exists() and (frontend_dist_dir / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist_dir / "index.html")
