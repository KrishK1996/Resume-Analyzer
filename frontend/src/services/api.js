/**
 * API Service for interacting with the FastAPI backend
 */

const API_BASE = '/api';

export async function getHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    return { groq_api_key_configured: false, groq_model: 'unavailable', error: error.message };
  }
}

export async function setApiKey(apiKey) {
  const res = await fetch(`${API_BASE}/config/api-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ api_key: apiKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update API key' }));
    throw new Error(err.detail || 'Failed to update API key');
  }

  return await res.json();
}

export async function analyzeResumes(files, jobDescription = '', customApiKey = null) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  if (jobDescription && jobDescription.trim()) {
    formData.append('job_description', jobDescription.trim());
  }

  const headers = {};
  if (customApiKey && customApiKey.trim()) {
    headers['x-groq-api-key'] = customApiKey.trim();
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to analyze resume' }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }

  return await res.json();
}

export async function compareJobDescription(resumeData, resumeText, jobDescription, customApiKey = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (customApiKey && customApiKey.trim()) {
    headers['x-groq-api-key'] = customApiKey.trim();
  }

  const res = await fetch(`${API_BASE}/compare-jd`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resume_data: resumeData,
      resume_text: resumeText,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Job description comparison failed' }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }

  return await res.json();
}

export async function getSystemLogs(lines = 100) {
  try {
    const res = await fetch(`${API_BASE}/logs?lines=${lines}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return await res.json();
  } catch (err) {
    console.error('Failed to get system logs:', err);
    return { logs: [], error: err.message };
  }
}
