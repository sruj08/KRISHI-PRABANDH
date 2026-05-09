import { BASE_URL } from '../../shared/api/client';

export async function parseGR(file, { sahayak_id, mandal_id } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (sahayak_id) formData.append('sahayak_id', sahayak_id);
  if (mandal_id) formData.append('mandal_id', mandal_id);
  
  const res = await fetch(`${BASE_URL}/gr/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `GR parse failed ${res.status}`);
  }
  return res.json();
}
