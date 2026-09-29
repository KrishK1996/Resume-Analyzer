import io
import re
import logging
from typing import Tuple
import pdfplumber
import pypdf
from pypdf.errors import PdfReadError

logger = logging.getLogger(__name__)


class PDFParsingException(Exception):
    """Custom exception raised for PDF parsing errors with user-friendly messages."""
    pass


def sanitize_text(text: str) -> str:
    """Removes null bytes, non-printable control chars, and unencoded surrogates."""
    if not text:
        return ""
    # Strip null bytes and control chars (preserve \t, \n, \r)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Strip surrogate pairs which cause JSON serialization errors
    text = re.sub(r"[\ud800-\udfff]", "", text)
    # Normalize excessive consecutive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text_from_pdf_bytes(pdf_bytes: bytes, filename: str = "document.pdf") -> Tuple[str, int]:
    """
    Extracts text from PDF raw bytes with comprehensive edge-case handling.
    Uses pdfplumber with a pypdf fallback and multi-strategy extraction.
    
    Returns:
        Tuple[str, int]: (extracted_text, page_count)
        
    Raises:
        PDFParsingException: If file is invalid, encrypted, empty, or unreadable.
    """
    if not pdf_bytes or len(pdf_bytes) == 0:
        raise PDFParsingException(f"'{filename}' is completely empty (0 bytes).")

    # Some PDFs have minor leading whitespace or comments before %PDF
    pdf_header_index = pdf_bytes[:1024].find(b"%PDF")
    if pdf_header_index == -1:
        raise PDFParsingException(
            f"'{filename}' is not a valid PDF file. Expected standard PDF header."
        )

    # First check encryption and page count using pypdf
    total_pages = 1
    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_stream)
        if reader.is_encrypted:
            # Try decrypting with empty password if it's default encrypted
            try:
                reader.decrypt("")
            except Exception:
                raise PDFParsingException(
                    f"'{filename}' is password-protected. Please upload an unlocked PDF."
                )
        total_pages = len(reader.pages)
        if total_pages == 0:
            raise PDFParsingException(f"'{filename}' contains no pages.")
    except PDFParsingException:
        raise
    except PdfReadError as e:
        raise PDFParsingException(f"'{filename}' is corrupted or damaged: {str(e)}")
    except Exception as e:
        logger.warning(f"pypdf pre-check warning for '{filename}': {e}")

    extracted_pages = []
    plumber_text = ""

    # Strategy 1: pdfplumber extraction with per-page error recovery
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = max(total_pages, len(pdf.pages))
            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    page_text = page.extract_text(layout=True) or page.extract_text()
                    if page_text:
                        extracted_pages.append(page_text.strip())
                except Exception as page_err:
                    logger.warning(f"pdfplumber page {page_num} error in '{filename}': {page_err}")
                    continue
        if extracted_pages:
            plumber_text = "\n\n".join(extracted_pages).strip()
    except Exception as plumber_err:
        logger.warning(f"pdfplumber extraction failed for '{filename}': {plumber_err}")

    # Strategy 2: pypdf extraction fallback / cross-check
    pypdf_text = ""
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pypdf_pages = []
        for page in reader.pages:
            try:
                txt = page.extract_text()
                if txt:
                    pypdf_pages.append(txt.strip())
            except Exception:
                continue
        if pypdf_pages:
            pypdf_text = "\n\n".join(pypdf_pages).strip()
    except Exception as pypdf_err:
        logger.warning(f"pypdf extraction failed for '{filename}': {pypdf_err}")

    # Use whichever strategy extracted more text
    full_text = plumber_text if len(plumber_text) >= len(pypdf_text) else pypdf_text
    full_text = sanitize_text(full_text)

    # Check if any extractable text was found
    if not full_text or len(full_text.strip()) < 5:
        raise PDFParsingException(
            f"No readable text could be extracted from '{filename}'. "
            "It appears to be a scanned image-only PDF, blank, or contains no machine-readable text."
        )

    return full_text, total_pages
