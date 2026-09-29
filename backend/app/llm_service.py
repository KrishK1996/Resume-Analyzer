import json
import logging
import os
import re
from typing import Optional
from groq import Groq, APIError, AuthenticationError, RateLimitError
from .models import ResumeData
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


def extract_resume_info(resume_text: str, custom_api_key: Optional[str] = None) -> ResumeData:
    """
    Calls the Groq AI API to extract structured resume features from the raw text.
    Enforces strict zero hallucination and null output for missing data.
    """
    client = get_groq_client(custom_api_key)
    
    # Truncate text if absurdly large to avoid breaking context limits (approx 35k chars ~ 8k tokens)
    processed_text = resume_text[:35000]

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": EXTRACTION_USER_PROMPT.format(resume_text=processed_text)},
    ]

    # Attempt primary model first, fallback if unavailable
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
                # Try regex to locate first JSON object
                match = re.search(r"\{.*\}", cleaned_response, re.DOTALL)
                if match:
                    parsed_dict = json.loads(match.group(0))
                else:
                    raise LLMServiceException(f"AI response could not be parsed as valid JSON: {str(json_err)}")

            # Normalize values to ensure empty lists or empty strings become None or []
            return ResumeData.model_validate(parsed_dict)

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
