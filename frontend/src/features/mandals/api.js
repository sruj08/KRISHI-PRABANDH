import { apiFetch } from '../../shared/api/client';

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
