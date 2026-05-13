/**
 * KRISHI-PRABANDH FastAPI (root paths: /surveys/...).
 * Base URL: VITE_API_URL, or same-origin in dev (Vite proxies /surveys → backend),
 * else http://localhost:8000.
 * Strips a trailing `/api/v1` so env values copied from the legacy client still work.
 */

function normalizeSurveyApiBase(raw) {
  let u = String(raw).trim().replace(/\/+$/, '');
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length).replace(/\/+$/, '');
  }
  return u;
}

/** @returns {string} Origin or '' for same-origin (dev proxy). */
export function getSurveyApiBase() {
  const env = import.meta.env.VITE_API_URL;
  if (env !== undefined && env !== null && String(env).trim() !== '') {
    return normalizeSurveyApiBase(String(env).trim());
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return 'http://localhost:8000';
}

function authHeaders() {
  try {
    const raw = localStorage.getItem('krishiUser');
    if (!raw) return {};
    const u = JSON.parse(raw);
    if (u?.access_token && typeof u.access_token === 'string') {
      return { Authorization: `Bearer ${u.access_token}` };
    }
  } catch {
    /* ignore */
  }
  return {};
}

async function parseSuccessResponse(res) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = j.error ?? j.detail;
    const msg =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d?.msg || d).join('; ')
          : res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (j.success === false) {
    throw new Error(j.error || 'Request failed');
  }
  return j.data;
}

export async function postGrAssistant(file) {
  const formData = new FormData();
  formData.append('file', file);
  const base = getSurveyApiBase();
  const res = await fetch(`${base}/surveys/gr-assistant`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  return parseSuccessResponse(res);
}

export async function postSurveyEvidence(surveyId, file, documentType) {
  const formData = new FormData();
  formData.append('file', file);
  if (documentType) {
    formData.append('document_type', documentType);
  }
  const base = getSurveyApiBase();
  const res = await fetch(`${base}/surveys/${encodeURIComponent(surveyId)}/evidence`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  return parseSuccessResponse(res);
}

export async function fetchFlaggedEvidence(assignedToMe = true) {
  const q = assignedToMe ? '?assigned_to_me=true' : '';
  const base = getSurveyApiBase();
  const res = await fetch(`${base}/surveys/evidence/flagged${q}`, {
    headers: { ...authHeaders() },
  });
  const data = await parseSuccessResponse(res);
  if (Array.isArray(data)) return data;
  return data?.items || [];
}
