import json
import logging
import os
import re
from typing import Optional, Any, Dict, List
from groq import Groq, APIError, AuthenticationError, RateLimitError
from .models import ResumeData, EducationItem, WorkExperienceItem
from .prompts import SYSTEM_PROMPT, EXTRACTION_USER_PROMPT

logger = logging.getLogger(__name__)

DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = "llama-3.1-8b-instant"


class LLMServiceException(Exception):
    """Custom exception for LLM extraction errors with user-friendly messages."""
    pass


def get_groq_client(custom_api_key: Optional[str] = None) -> Groq:
    """Retrieve Groq client using env var or provided custom API key."""
    from dotenv import load_dotenv
    from pathlib import Path
    
    api_key = custom_api_key or os.getenv("GROQ_API_KEY")
    if not api_key:
        backend_env = Path(__file__).resolve().parent.parent / ".env"
        root_env = Path(__file__).resolve().parent.parent.parent / ".env"
        load_dotenv(backend_env, override=True)
        load_dotenv(root_env, override=True)
        api_key = os.getenv("GROQ_API_KEY")

    if not api_key or not api_key.strip():
        raise LLMServiceException(
            "Groq API key not found. Please set GROQ_API_KEY in backend/.env or configure it in the application settings."
        )
    return Groq(api_key=api_key.strip())


def clean_json_string(raw_content: str) -> str:
    """Strip markdown code fence blocks if returned by the LLM."""
    content = raw_content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    return content.strip()


def sanitize_null_str(val: Any) -> Optional[str]:
    """Helper to convert dummy strings to None."""
    if val is None:
        return None
    s = str(val).strip()
    if not s or s.lower() in ("null", "none", "n/a", "na", "not provided", "not available", "nil"):
        return None
    return s


def normalize_extracted_dict(raw: Dict[str, Any]) -> ResumeData:
    """
    Normalizes the raw JSON dictionary from the AI model into a clean ResumeData object.
    Gracefully handles key aliases, string-to-list coersions, and removes dummy values.
    """
    if not isinstance(raw, dict):
        return ResumeData()

    # 1. Full Name
    raw_name = raw.get("full_name") or raw.get("name") or raw.get("candidate_name") or raw.get("fullName")
    full_name = sanitize_null_str(raw_name)

    # 2. Contact details
    raw_phone = raw.get("phone") or raw.get("phone_number") or raw.get("contact") or raw.get("mobile")
    phone = sanitize_null_str(raw_phone)

    raw_email = raw.get("email") or raw.get("email_address")
    email = sanitize_null_str(raw_email)
    if email:
        email = email.lower()

    raw_location = raw.get("location") or raw.get("address") or raw.get("city")
    location = sanitize_null_str(raw_location)

    # 3. Professional Summary
    raw_summary = raw.get("professional_summary") or raw.get("summary") or raw.get("profile") or raw.get("overview")
    professional_summary = sanitize_null_str(raw_summary)

    # 4. Skills
    raw_skills = raw.get("skills") or raw.get("technical_skills") or raw.get("competencies")
    skills_list: Optional[List[str]] = None
    if isinstance(raw_skills, list):
        clean_skills = [str(s).strip() for s in raw_skills if sanitize_null_str(s)]
        skills_list = clean_skills if clean_skills else None
    elif isinstance(raw_skills, str) and sanitize_null_str(raw_skills):
        split_skills = [s.strip() for s in re.split(r"[,;•|\n]", raw_skills) if sanitize_null_str(s)]
        skills_list = split_skills if split_skills else None

    # 5. Education
    raw_edu = raw.get("education") or raw.get("academics") or raw.get("qualifications")
    education_list: Optional[List[EducationItem]] = None
    if isinstance(raw_edu, list):
        items = []
        for item in raw_edu:
            if isinstance(item, dict):
                items.append(
                    EducationItem(
                        degree=sanitize_null_str(item.get("degree")),
                        institution=sanitize_null_str(item.get("institution") or item.get("school") or item.get("university")),
                        graduation_year=sanitize_null_str(item.get("graduation_year") or item.get("year"))
                    )
                )
            elif isinstance(item, str) and sanitize_null_str(item):
                items.append(EducationItem(degree=item.strip(), institution=None, graduation_year=None))
        education_list = items if items else None

    # 6. Work Experience
    raw_exp = raw.get("work_experience") or raw.get("experience") or raw.get("employment_history") or raw.get("work_history")
    work_list: Optional[List[WorkExperienceItem]] = None
    if isinstance(raw_exp, list):
        items = []
        for item in raw_exp:
            if isinstance(item, dict):
                # Normalize responsibilities
                raw_resp = item.get("responsibilities") or item.get("duties") or item.get("description")
                resp_list: Optional[List[str]] = None
                if isinstance(raw_resp, list):
                    resp_list = [str(r).strip() for r in raw_resp if sanitize_null_str(r)]
                elif isinstance(raw_resp, str) and sanitize_null_str(raw_resp):
                    resp_list = [r.strip("-• ").strip() for r in raw_resp.split("\n") if sanitize_null_str(r)]

                items.append(
                    WorkExperienceItem(
                        company=sanitize_null_str(item.get("company") or item.get("organization") or item.get("employer")),
                        job_title=sanitize_null_str(item.get("job_title") or item.get("title") or item.get("role") or item.get("position")),
                        start_date=sanitize_null_str(item.get("start_date")),
                        end_date=sanitize_null_str(item.get("end_date")),
                        responsibilities=resp_list if resp_list else None
                    )
                )
            elif isinstance(item, str) and sanitize_null_str(item):
                items.append(WorkExperienceItem(company=item.strip(), job_title=None, start_date=None, end_date=None, responsibilities=None))
        work_list = items if items else None

    # 7. Certifications
    raw_certs = raw.get("certifications") or raw.get("certificates") or raw.get("licenses")
    certs_list: Optional[List[str]] = None
    if isinstance(raw_certs, list):
        certs = []
        for c in raw_certs:
            if isinstance(c, dict):
                val = c.get("name") or c.get("title") or c.get("certification")
                if sanitize_null_str(val):
                    certs.append(str(val).strip())
            elif isinstance(c, str) and sanitize_null_str(c):
                certs.append(c.strip())
        certs_list = certs if certs else None
    elif isinstance(raw_certs, str) and sanitize_null_str(raw_certs):
        certs_list = [c.strip() for c in re.split(r"[,;•|\n]", raw_certs) if sanitize_null_str(c)]

    return ResumeData(
        full_name=full_name,
        phone=phone,
        email=email,
        location=location,
        skills=skills_list,
        education=education_list,
        work_experience=work_list,
        certifications=certs_list,
        professional_summary=professional_summary
    )


def extract_resume_info(resume_text: str, custom_api_key: Optional[str] = None) -> ResumeData:
    """
    Calls the Groq AI API to extract structured resume features from the raw text.
    Enforces strict zero hallucination and null output for missing data.
    """
    client = get_groq_client(custom_api_key)
    
    # Truncate text if absurdly large to avoid breaking context limits (approx 35k chars ~ 8k tokens)
    processed_text = resume_text[:35000]

    # Safe placeholder replacement (immune to KeyError from JSON curly braces)
    formatted_prompt = EXTRACTION_USER_PROMPT.replace("__RESUME_TEXT__", processed_text).replace("{resume_text}", processed_text)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": formatted_prompt},
    ]

    models_to_try = [DEFAULT_MODEL, FALLBACK_MODEL] if DEFAULT_MODEL != FALLBACK_MODEL else [DEFAULT_MODEL]
    last_error = None

    for model_name in models_to_try:
        try:
            logger.info(f"Invoking Groq model: {model_name}")
            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.0,  # Zero temperature for deterministic, factual extraction
                response_format={"type": "json_object"},
            )
            raw_response = completion.choices[0].message.content
            cleaned_response = clean_json_string(raw_response)
            
            try:
                parsed_dict = json.loads(cleaned_response)
            except json.JSONDecodeError as json_err:
                logger.error(f"JSON decode failed for model {model_name}: {json_err}. Raw: {raw_response[:200]}")
                match = re.search(r"\{.*\}", cleaned_response, re.DOTALL)
                if match:
                    parsed_dict = json.loads(match.group(0))
                else:
                    raise LLMServiceException(f"AI response could not be parsed as valid JSON: {str(json_err)}")

            # Normalize values into clean ResumeData object
            return normalize_extracted_dict(parsed_dict)

        except AuthenticationError:
            raise LLMServiceException("Invalid Groq API Key. Please verify your GROQ_API_KEY credentials.")
        except RateLimitError as rle:
            logger.warning(f"Rate limit with {model_name}: {rle}")
            last_error = rle
            continue
        except APIError as api_err:
            logger.warning(f"Groq API error with {model_name}: {api_err}")
            last_error = api_err
            continue
        except LLMServiceException:
            raise
        except Exception as general_err:
            logger.error(f"Unexpected error with {model_name}: {general_err}")
            last_error = general_err
            continue

    raise LLMServiceException(f"Failed to analyze resume with AI API: {str(last_error)}")
