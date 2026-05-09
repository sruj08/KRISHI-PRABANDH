import { apiFetch, BASE_URL } from '../../shared/api/client';

export async function fetchApplications({ status, component, scheme_category, farmer_id, sahayak_id, mandal_id, limit = 100, offset = 0 } = {}) {
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
