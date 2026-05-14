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

export default api;
