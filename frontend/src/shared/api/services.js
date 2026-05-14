import axios from 'axios';

/** Same-origin in dev (Vite proxy → backend); override with VITE_API_ORIGIN in prod. */
function getAxiosBaseURL() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN) {
    return String(import.meta.env.VITE_API_ORIGIN).replace(/\/$/, '');
  }
  return '';
}

const api = axios.create({
  baseURL: getAxiosBaseURL(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** FastAPI `success()` envelope: `{ success, message, data }`. */
function unwrapApiPayload(body) {
  if (body && typeof body === 'object' && body.success === true && 'data' in body) {
    return body.data;
  }
  return body;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.response?.data?.detail ||
      err.message ||
      'Unknown API error';
    return Promise.reject(new Error(msg));
  },
);

export async function fetchHealth() {
  const { data } = await api.get('/api/health');
  return data;
}

export async function fetchFarmers() {
  const { data } = await api.get('/api/farmers');
  return data;
}

export async function fetchFarmerClaims(farmerId) {
  const { data } = await api.get(`/api/farmers/${farmerId}/claims`);
  return data;
}

export async function fetchClaims() {
  const { data } = await api.get('/api/claims');
  return data;
}

export async function fetchClaimsSummary() {
  const { data } = await api.get('/api/claims/summary');
  return data;
}

export async function updateClaim(id, payload) {
  const { data } = await api.patch(`/api/claims/${id}`, payload);
  return data;
}

export async function fetchWeather() {
  const { data } = await api.get('/api/weather');
  return data;
}

export async function fetchKyc() {
  const { data } = await api.get('/api/kyc');
  return data;
}

export async function fetchPayments() {
  const { data } = await api.get('/api/payments');
  return data;
}

function riskLevelToSeverity(level, score) {
  const n = typeof score === 'number' ? score : Number(score);
  const scoreNum = Number.isFinite(n) ? n : NaN;
  const s = String(level || '').toLowerCase();
  if (s.includes('critical') || (Number.isFinite(scoreNum) && scoreNum >= 80)) return 'CRITICAL';
  if (s.includes('high') || (Number.isFinite(scoreNum) && scoreNum >= 50)) return 'HIGH';
  if (s.includes('moderate') || s.includes('medium') || (Number.isFinite(scoreNum) && scoreNum >= 30)) {
    return 'MODERATE';
  }
  return 'LOW';
}

/** Officer triage queue — flagged survey evidence (`GET /surveys/evidence/flagged`). */
export async function fetchSurveyQueue() {
  const { data } = await api.get('/surveys/evidence/flagged');
  const payload = unwrapApiPayload(data) || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.map((row) => ({
    ...row,
    reportId: row.survey_id,
    surveyId: row.survey_id,
    farmerName: row.farmer_name,
    cropType: row.scheme,
    severityLevel: riskLevelToSeverity(row.risk_level, row.risk_score),
    workflowStage:
      row.risk_score != null && Number(row.risk_score) >= 20
        ? 'Review Required'
        : 'Pending Sahayak Verification',
    confidenceScore:
      row.risk_score != null
        ? Math.max(0, Math.min(1, 1 - Number(row.risk_score) / 100))
        : null,
    timestamp: '—',
  }));
}

/** Dashboard counts for survey operations header stats. */
export async function fetchSurveySummary() {
  const { data } = await api.get('/analytics/dashboard');
  const d = unwrapApiPayload(data) || {};
  let critical = null;
  try {
    const { data: riskRaw } = await api.get('/analytics/risk-summary');
    const r = unwrapApiPayload(riskRaw) || {};
    critical = r.high_risk ?? null;
  } catch {
    /* risk-summary is role-gated; ignore */
  }
  return {
    total: d.surveys_total,
    all: d.surveys_total,
    pending: d.surveys_pending_approval,
    submitted: d.surveys_pending_approval,
    critical,
    grievance: 0,
    grievances: 0,
    completed: d.surveys_compensated,
    verified: d.surveys_compensated,
  };
}

/** Single survey row for evidence review (`GET /surveys/{id}`). */
export async function fetchSurveyReport(surveyId) {
  const { data } = await api.get(`/surveys/${surveyId}`);
  const row = unwrapApiPayload(data);
  if (!row || typeof row !== 'object') {
    throw new Error('Survey not found');
  }
  const attrs = row.attrs && typeof row.attrs === 'object' ? row.attrs : {};
  return {
    ...row,
    ...attrs,
    reportId: row.id,
    surveyId: row.id,
    workflowStage: row.status || attrs.workflowStage,
    farmerName: attrs.farmerName || attrs.farmer_name,
    cropType: attrs.cropType || attrs.crop_type,
    village: attrs.village,
    severityLevel: attrs.severityLevel || attrs.severity_level,
    confidenceScore: attrs.confidenceScore ?? attrs.confidence_score,
    timestamp: row.created_at || row.updated_at || attrs.submittedAt,
  };
}

/** Grievances API not wired yet — return empty list so the panel still renders. */
export async function fetchSurveyGrievances(_surveyId) {
  return [];
}

/** Map UI actions to `POST /surveys/{id}/approve` decisions. */
export async function updateSurveyAction(surveyId, { action } = {}) {
  const key = String(action || '').toLowerCase();
  const body =
    key === 'verify'
      ? { decision: 'APPROVED', notes: 'Verified by survey operations' }
      : key === 'resurvey'
        ? { decision: 'REJECTED', notes: 'Re-survey requested' }
        : key === 'request_info'
          ? { decision: 'ESCALATED', notes: 'Additional information requested from field' }
          : key === 'escalate'
            ? { decision: 'ESCALATED', notes: 'Escalated for officer review' }
            : { decision: 'ESCALATED', notes: key || 'Survey action' };
  const { data } = await api.post(`/surveys/${surveyId}/approve`, body);
  return unwrapApiPayload(data);
}

/**
 * Fetch all operational reports from krishi-core (GET /api/reports).
 * Returns array of report objects with fields:
 *   reportId, farmerId, farmerName, village, taluka, district,
 *   cropType, damageType, workflowStage, severityLevel,
 *   confidenceScore, geoVerified, uploadedEvidence[],
 *   aiRemarks, officerRemarks, grievance linkage,
 *   assignedOfficer, createdAt, updatedAt
 */
export async function fetchReports() {
  const { data } = await api.get('/api/reports');
  const payload = unwrapApiPayload(data);
  return Array.isArray(payload) ? payload : payload?.reports ?? payload?.results ?? payload?.data ?? [];
}

/** Fetch a single report by ID (GET /api/reports/:id). */
export async function fetchReportById(id) {
  const { data } = await api.get(`/api/reports/${id}`);
  const payload = unwrapApiPayload(data);
  if (!payload || typeof payload !== 'object') throw new Error('Report not found');
  return payload;
}

/** Workflow actions on a report (PATCH /api/reports/:id).
 *  Actions: verify | escalate | resurvey | request_info | approve
 */
const REPORT_ACTION_STAGES = {
  verify:       'Verified',
  escalate:     'Escalated',
  resurvey:     'Re-Survey Requested',
  request_info: 'Additional Info Requested',
  approve:      'Approved',
};
export async function updateReportAction(reportId, { action, notes } = {}) {
  const workflowStage = REPORT_ACTION_STAGES[action] || action;
  const { data } = await api.patch(`/api/reports/${reportId}`, {
    workflowStage,
    officerRemarks: notes || `Action: ${workflowStage}`,
  });
  return unwrapApiPayload(data);
}

/** Base for browser calls (empty = same origin → Vite dev proxy → backend). */
export function getApiOrigin() {
  return getAxiosBaseURL();
}

/**
 * Farmer vault: multipart upload → main API → OCR engine + optional schema extract.
 * @param {File} file
 * @param {string} documentTitle - Card title (e.g. "Aadhaar") for schema routing
 * @param {string | null} accessToken - Optional Bearer
 * @returns {Promise<Record<string, unknown>>} `data` payload from API
 */
export async function postDocumentOcr(file, documentTitle, accessToken) {
  const form = new FormData();
  form.append('file', file);
  form.append('document_title', documentTitle || '');
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const url = `${getApiOrigin()}/api/documents/ocr`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: form,
  });
  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (!res.ok) {
    const msg = body.error || body.details || body.detail || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  if (body.success === false) {
    const msg = body.error || body.details || 'Request failed';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return body.data ?? body;
}

export default api;
