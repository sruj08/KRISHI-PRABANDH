import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
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

/** Base for browser calls (empty = same origin → Vite dev proxy `/api` → backend). */
export function getApiOrigin() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN) {
    return String(import.meta.env.VITE_API_ORIGIN).replace(/\/$/, '');
  }
  return '';
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
