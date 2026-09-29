import json
import logging
import os
import re
from typing import Optional, Any, Dict, List
from groq import Groq, APIError, AuthenticationError, RateLimitError
from .models import ResumeData, EducationItem, WorkExperienceItem, JobMatchResult
from .prompts import SYSTEM_PROMPT, EXTRACTION_USER_PROMPT, JD_MATCH_SYSTEM_PROMPT, JD_MATCH_USER_PROMPT

logger = logging.getLogger(__name__)

# Prioritized list of known high-quality models across Groq tiers
PREFERRED_MODELS = [
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "mixtral-8x7b-32768",
    "allam-2-7b",
]


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


def resolve_models_for_client(client: Groq) -> List[str]:
    """
    Dynamically queries Groq to inspect available models on the given API key.
    Prioritizes the best accessible chat/JSON model to prevent 'model_not_found' 404 errors.
    """
    try:
        available_data = client.models.list().data
        available_ids = {m.id for m in available_data}
    except Exception as e:
        logger.warning(f"Could not fetch models.list: {e}")
        available_ids = set()

    models_to_try = []

    # 1. Respect explicit env model if it exists on account
    configured = os.getenv("GROQ_MODEL", "").strip()
    if configured:
        if not available_ids or configured in available_ids:
            models_to_try.append(configured)

    # 2. Add matching models from prioritized list
    for pm in PREFERRED_MODELS:
        if (not available_ids or pm in available_ids) and pm not in models_to_try:
            models_to_try.append(pm)

    # 3. Add any other accessible text models (excluding whisper/guard/audio)
    for aid in available_ids:
        if aid not in models_to_try and not any(x in aid.lower() for x in ["whisper", "guard", "audio", "vision"]):
            models_to_try.append(aid)

    # 4. Fallback defaults
    if not models_to_try:
        models_to_try = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

    return models_to_try


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
    Gracefully handles key aliases, string-to-list conversions, and removes dummy values.
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
    Dynamically discovers and uses the best model available on the current API key.
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

    # Dynamically find accessible models for this specific API key
    models_to_try = resolve_models_for_client(client)
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


def match_resume_with_jd(
    resume_text: str,
    jd_text: str,
    custom_api_key: Optional[str] = None
) -> JobMatchResult:
    """
    Compares the candidate's resume with a Job Description using Groq AI.
    Returns match score (0-100), matching skills, missing skills, summary, and recommendations.
    """
    client = get_groq_client(custom_api_key)
    
    clean_resume = resume_text[:30000]
    clean_jd = jd_text[:15000]
    
    formatted_prompt = (
        JD_MATCH_USER_PROMPT
        .replace("__RESUME_TEXT__", clean_resume)
        .replace("__JOB_DESCRIPTION__", clean_jd)
    )
    
    messages = [
        {"role": "system", "content": JD_MATCH_SYSTEM_PROMPT},
        {"role": "user", "content": formatted_prompt},
    ]
    
    models_to_try = resolve_models_for_client(client)
    last_error = None
    
    for model_name in models_to_try:
        try:
            logger.info(f"Invoking Groq model for JD match: {model_name}")
            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            raw_response = completion.choices[0].message.content
            cleaned_response = clean_json_string(raw_response)
            
            parsed = json.loads(cleaned_response)
            
            # Safe score parsing
            score = parsed.get("match_score")
            try:
                score_int = int(score) if score is not None else None
                if score_int is not None:
                    score_int = max(0, min(100, score_int))
            except Exception:
                score_int = 70
                
            matching = parsed.get("matching_skills") or []
            if isinstance(matching, str):
                matching = [s.strip() for s in re.split(r"[,;•|\n]", matching) if s.strip()]
            elif isinstance(matching, list):
                matching = [str(s).strip() for s in matching if s]
                
            missing = parsed.get("missing_skills") or []
            if isinstance(missing, str):
                missing = [s.strip() for s in re.split(r"[,;•|\n]", missing) if s.strip()]
            elif isinstance(missing, list):
                missing = [str(s).strip() for s in missing if s]
                
            recs = parsed.get("recommendations") or []
            if isinstance(recs, str):
                recs = [r.strip("-• ") for r in recs.split("\n") if r.strip()]
            elif isinstance(recs, list):
                recs = [str(r).strip() for r in recs if r]
                
            return JobMatchResult(
                match_score=score_int,
                matching_skills=matching,
                missing_skills=missing,
                summary=sanitize_null_str(parsed.get("summary")),
                recommendations=recs
            )
        except Exception as e:
            logger.warning(f"JD match error with {model_name}: {e}")
            last_error = e
            continue
            
    raise LLMServiceException(f"Failed to match with Job Description: {str(last_error)}")
