import { apiFetch } from '../../shared/api/client';

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
