"""
Prompt templates for Resume Information Extraction
"""

SYSTEM_PROMPT = """You are an advanced, meticulous AI Resume Information Extraction engine.
Your task is to analyze the provided raw resume text and extract the candidate's details into a structured JSON object.

CRITICAL EXTRACTION RULES:
1. STRICT FACTUAL ACCURACY: Extract ONLY facts that are explicitly written in the resume text.
2. NO HALLUCINATIONS: Do NOT infer, fabricate, extrapolate, assume, or generate fictitious information.
3. HANDLING MISSING DATA: If any field (or sub-field) is not mentioned or cannot be found in the resume, you MUST set its value directly to null (or null for empty lists). Do NOT invent dummy placeholders like "N/A", "Not provided", or "None".
4. CLEAN FORMATTING:
   - Normalize email to lowercase if present.
   - Clean up phone numbers to standard readable format.
   - Clean up skills into individual skill strings. If skills are grouped, break them down into discrete items.
   - Clean up education with degree, institution, and graduation_year.
   - Clean up work_experience with company, job_title, start_date, end_date, and list of responsibilities.
   - If professional summary is not explicitly written in the resume, set professional_summary to null. Do NOT write a fictional summary.
5. STRICT JSON OUTPUT: Return ONLY a valid JSON object matching the exact schema specified. Do not include markdown code block formatting or backticks if possible, or keep it strictly parseable as JSON.
"""

EXTRACTION_USER_PROMPT = """Analyze the following resume text and extract the structured information in the exact JSON format below:

{
  "full_name": string or null,
  "phone": string or null,
  "email": string or null,
  "location": string or null,
  "skills": [string] or null,
  "education": [
    {
      "degree": string or null,
      "institution": string or null,
      "graduation_year": string or integer or null
    }
  ] or null,
  "work_experience": [
    {
      "company": string or null,
      "job_title": string or null,
      "start_date": string or null,
      "end_date": string or null,
      "responsibilities": [string] or null
    }
  ] or null,
  "certifications": [string] or null,
  "professional_summary": string or null
}

RESUME TEXT:
---------------------
{resume_text}
---------------------

Remember: Missing information MUST be null. No false data.
"""
