import { apiFetch } from '../../shared/api/client';

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
