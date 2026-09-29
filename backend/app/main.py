import os
import sys
import logging
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv

# Load .env from backend directory or project root
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
root_dir = backend_dir.parent

load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

from fastapi import FastAPI, UploadFile, File, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .models import (
    MultiAnalysisResponse,
    FileAnalysisResult,
    ResumeData,
    ConfigStatus,
)
from .pdf_parser import extract_text_from_pdf_bytes, PDFParsingException
from .llm_service import (
    extract_resume_info,
    LLMServiceException,
    get_groq_client,
    resolve_models_for_client,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("resume_analyzer")

app = FastAPI(
    title="AI-Powered Resume Analyzer API",
    description="Multi-file PDF resume text extraction and structured parsing using Groq AI.",
    version="1.0.0",
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
        except Exception:
            detected_model = os.getenv("GROQ_MODEL", "Unknown")

    return ConfigStatus(
        groq_api_key_configured=bool(api_key),
        groq_model=detected_model
    )


@app.post("/api/config/api-key")
def update_api_key(payload: ApiKeyUpdateRequest):
    """
    Validates and updates the Groq API key, discovering the best available model.
    """
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. The provided Groq API key is invalid or revoked."
        )
    except Exception as e:
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
        logger.info(f"Successfully updated backend/.env with verified key and model: {selected_model}")
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
    x_groq_api_key: Optional[str] = Header(None, description="Optional per-request Groq API Key")
):
    """
    Upload one or multiple PDF resume files for text extraction and AI analysis.
    Returns structured JSON with candidate features, strictly adhering to nulls for missing data.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files were uploaded. Please upload at least one PDF resume."
        )

    results: List[FileAnalysisResult] = []

    for file in files:
        filename = file.filename or "unknown.pdf"
        logger.info(f"Processing uploaded file: '{filename}'")

        # 1. Validate file extension
        if not filename.lower().endswith(".pdf"):
            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=0,
                    status="error",
                    error_message=f"'{filename}' is not a valid PDF file. Please upload PDF files only.",
                    data=None
                )
            )
            continue

        try:
            # 2. Read bytes
            pdf_bytes = await file.read()
            file_size = len(pdf_bytes)

            if file_size > MAX_FILE_SIZE:
                results.append(
                    FileAnalysisResult(
                        filename=filename,
                        file_size_bytes=file_size,
                        status="error",
                        error_message=f"File exceeds maximum allowed size of 15MB (Current: {file_size / (1024*1024):.1f}MB).",
                        data=None
                    )
                )
                continue

            # 3. Extract text using PDF library
            text, page_count = extract_text_from_pdf_bytes(pdf_bytes, filename=filename)
            char_count = len(text)
            logger.info(f"Extracted {char_count} characters across {page_count} page(s) from '{filename}'")

            # 4. Extract structured features via Groq AI
            resume_data = extract_resume_info(text, custom_api_key=x_groq_api_key)

            results.append(
                FileAnalysisResult(
                    filename=filename,
                    file_size_bytes=file_size,
                    status="success",
                    error_message=None,
                    character_count=char_count,
                    data=resume_data
                )
            )

        except PDFParsingException as pdf_err:
            logger.warning(f"PDF parsing error on '{filename}': {pdf_err}")
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
            logger.error(f"AI API error on '{filename}': {llm_err}")
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
            logger.exception(f"Unexpected internal error while processing '{filename}': {e}")
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

    return MultiAnalysisResponse(
        total_files=len(results),
        successful_count=successful,
        failed_count=failed,
        results=results
    )


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
