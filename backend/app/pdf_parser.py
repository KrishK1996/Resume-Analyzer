import io
import re
from typing import Tuple
import pdfplumber
import pypdf
from pypdf.errors import PdfReadError


class PDFParsingException(Exception):
    """Custom exception raised for PDF parsing errors with user-friendly messages."""
    pass


def extract_text_from_pdf_bytes(pdf_bytes: bytes, filename: str = "document.pdf") -> Tuple[str, int]:
    """
    Extracts text from PDF raw bytes.
    Uses pdfplumber with a pypdf fallback.
    
    Returns:
        Tuple[str, int]: (extracted_text, page_count)
        
    Raises:
        PDFParsingException: If file is invalid, encrypted, empty, or unreadable.
    """
    if not pdf_bytes or len(pdf_bytes) == 0:
        raise PDFParsingException(f"'{filename}' is completely empty (0 bytes).")

    # Validate PDF magic header
    if not pdf_bytes.startswith(b"%PDF"):
        raise PDFParsingException(
            f"'{filename}' is not a valid PDF file. Expected standard PDF header."
        )

    # First check encryption using pypdf
    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_stream)
        if reader.is_encrypted:
            raise PDFParsingException(
                f"'{filename}' is password-protected or encrypted. Please upload an unlocked PDF."
            )
        total_pages = len(reader.pages)
        if total_pages == 0:
            raise PDFParsingException(f"'{filename}' contains no pages.")
    except PDFParsingException:
        raise
    except PdfReadError as e:
        raise PDFParsingException(f"'{filename}' is corrupted or damaged: {str(e)}")
    except Exception as e:
        raise PDFParsingException(f"Unable to read structure of '{filename}': {str(e)}")

    extracted_pages = []
    
    # Try pdfplumber first (generally superior text layout and spacing)
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text(layout=True) or page.extract_text()
                if page_text:
                    extracted_pages.append(page_text.strip())
    except Exception as plumber_err:
        # Fallback to pypdf text extraction
        extracted_pages = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_pages.append(text.strip())
        except Exception as pypdf_err:
            raise PDFParsingException(
                f"Failed to extract text from '{filename}'. File may be corrupted or malformed."
            )

    full_text = "\n\n".join(extracted_pages).strip()

    # Clean up non-printable control characters, preserving newlines and tabs
    full_text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", full_text)

    # Check if any extractable text was found
    if not full_text or len(full_text.strip()) < 10:
        raise PDFParsingException(
            f"No readable text could be extracted from '{filename}'. "
            "It appears to be a scanned image-only PDF, blank, or contains no machine-readable text."
        )

    return full_text, total_pages
