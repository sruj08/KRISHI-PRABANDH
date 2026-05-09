import { apiFetch } from '../../shared/api/client';

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
