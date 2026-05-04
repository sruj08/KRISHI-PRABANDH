const BASE_URL = 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ── Applications ────────────────────────────────────────────────────────────

export async function fetchApplications({
  status, component, scheme_category, farmer_id,
  sahayak_id, mandal_id,
  limit = 100, offset = 0,
} = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (component) params.set('component', component);
  if (scheme_category) params.set('scheme_category', scheme_category);
  if (farmer_id) params.set('farmer_id', farmer_id);
  if (sahayak_id) params.set('sahayak_id', sahayak_id);
  if (mandal_id) params.set('mandal_id', mandal_id);
  params.set('limit', limit);
  params.set('offset', offset);
  const { data } = await apiFetch(`/applications?${params}`);
  return data;
}

export async function fetchApplication(id) {
  const { data } = await apiFetch(`/applications/${id}`);
  return data;
}

export async function updateApplicationStatus(id, newStatus, remarks = '') {
  const { data } = await apiFetch(`/applications/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ new_status: newStatus, remarks }),
  });
  return data;
}

export async function uploadPhoto(applicationId, file, remarks = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (remarks) formData.append('remarks', remarks);
  const res = await fetch(`${BASE_URL}/applications/${applicationId}/upload-photo`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Upload failed ${res.status}`);
  }
  return res.json();
}

// ── Mandals ──────────────────────────────────────────────────────────────────

export async function fetchMandals() {
  const { data } = await apiFetch('/mandals');
  return data;
}

export async function fetchMandalSahayaks(mandalId) {
  const { data } = await apiFetch(`/mandals/${mandalId}/sahayaks`);
  return data;
}

export async function fetchMandalSummary(mandalId) {
  const { data } = await apiFetch(`/mandals/${mandalId}/summary`);
  return data;
}

// ── Sahayaks ─────────────────────────────────────────────────────────────────

export async function fetchSahayaks(mandalId) {
  const params = mandalId ? `?mandal_id=${mandalId}` : '';
  const { data } = await apiFetch(`/sahayaks${params}`);
  return data;
}

export async function fetchSahayakApplications(sahayakId, params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', params.limit);
  if (params.offset) qs.set('offset', params.offset);
  const { data } = await apiFetch(`/sahayaks/${sahayakId}/applications?${qs}`);
  return data;
}

export async function fetchSahayakSummary(sahayakId) {
  const { data } = await apiFetch(`/sahayaks/${sahayakId}/summary`);
  return data;
}

// ── Insights ─────────────────────────────────────────────────────────────────

export async function fetchSummary() {
  const { data } = await apiFetch('/insights/summary');
  return data;
}

export async function fetchPriorityList(limit = 50) {
  const { data } = await apiFetch(`/insights/priority?limit=${limit}`);
  return data;
}

export async function fetchHighPriority() {
  const { data } = await apiFetch('/insights/priority/high');
  return data;
}

export async function fetchEligibleFarmers(limit = 10) {
  const { data } = await apiFetch(`/insights/eligible-farmers?limit=${limit}`);
  return data;
}

export async function fetchFraudAlerts() {
  const { data } = await apiFetch('/insights/fraud-alerts');
  return data;
}

// ── Audit Logs ───────────────────────────────────────────────────────────────

export async function fetchLogs(limit = 50) {
  const res = await apiFetch(`/logs?limit=${limit}`);
  return res.data;
}

export async function postLog({ action, application_id, officer_id = 'system', details = '' }) {
  return apiFetch('/logs', {
    method: 'POST',
    body: JSON.stringify({ action, application_id, officer_id, details }),
  });
}

// ── MKA Supervisory ───────────────────────────────────────────────────────────

export async function fetchVistarSessions(mandalId) {
  const qs = mandalId ? `?mandal_id=${mandalId}` : '';
  const { data } = await apiFetch(`/mka/vistar-sessions${qs}`);
  return data;
}

export async function fetchVistarAnalytics(mandalId) {
  const qs = mandalId ? `?mandal_id=${mandalId}` : '';
  const { data } = await apiFetch(`/mka/vistar-analytics${qs}`);
  return data;
}

export async function fetchVistarFraudAlerts(mandalId) {
  const qs = mandalId ? `?mandal_id=${mandalId}` : '';
  const { data } = await apiFetch(`/mka/vistar-fraud-alerts${qs}`);
  return data;
}

export async function fetchMKAApplicationIntelligence(mandalId) {
  const qs = mandalId ? `?mandal_id=${mandalId}` : '';
  const { data } = await apiFetch(`/mka/application-intelligence${qs}`);
  return data;
}


export async function parseGR(file, { sahayak_id, mandal_id } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  const params = new URLSearchParams();
  if (sahayak_id) params.set('sahayak_id', sahayak_id);
  if (mandal_id) params.set('mandal_id', mandal_id);
  const qs = params.toString() ? `?${params}` : '';
  const res = await fetch(`${BASE_URL}/gr/parse${qs}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `GR parse failed ${res.status}`);
  }
  return res.json();
}
