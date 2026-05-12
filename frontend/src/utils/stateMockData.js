/** Mock intelligence for Maharashtra State Command Center (demo). */

export const STATE_PROFILE = {
  state: 'Maharashtra',
  officerTitle: 'Commissioner of Agriculture',
  name: 'Dr. Suhas Diwase, IAS',
  hq: 'Pune (Krushi Bhavan)',
  divisions: 6,
  districts: 36,
};

export const EXEC_KPIS = {
  totalBudgetCr: '265.2',
  disbursedCr: '113.7',
  disbursedPct: '42.9',
  disbursedTarget: '265.2',
  pendingPfmCr: '34.6',
  projectedUnutilizedPct: '11.2',
  sentinel2Pass: 'Statewide pass: 12h ago (Sentinel-2 L2A composite)',
};

export const FRICTION_MONTH = {
  labels: [
    'Aadhaar mismatch (PM-KISAN)',
    '7/12 integration failure',
    'Margin money shortfall',
    'Bank account not linked',
    'Land verification pending',
  ],
  counts: [12480, 9620, 8104, 6312, 4108],
  topThreeRecommendations: [
    'Marathwada drought relief disbursement lagging at 33% (target 50%) — escalate PFMS clearance for Chh. Sambhajinagar division and divert ₹18 Cr from underutilized Konkan allocation.',
    'AI flags suspected cross-district fraud ring across Solapur–Sangli–Latur (PMFBY duplicate claims). Trigger statewide Aadhaar–7/12 reconciliation audit.',
    'Vidarbha NDVI stress 44% above 5-year baseline — preposition compensation for Amravati cotton belt before monsoon revision.',
  ],
};

export const PFMS_BATCHES = [
  { id: 'PFMS-MH-2026-CB-0421', beneficiaries: 38420, amountCr: 162.8, avgConfidence: 0.92, scheme: 'PMFBY — Kharif claim consolidated release' },
  { id: 'PFMS-MH-2026-CB-0422', beneficiaries: 21840, amountCr: 98.6, avgConfidence: 0.90, scheme: 'Mechanization — Tractor & Power tiller (statewide)' },
  { id: 'PFMS-MH-2026-CB-0423', beneficiaries: 56210, amountCr: 41.2, avgConfidence: 0.88, scheme: 'PM-KISAN top-up (state contribution)' },
];

export const DIVISION_MATRIX = [
  { code: 'KKN', division: 'Konkan',                   officer: 'Smt. Asha Joshi',     districts: 6, fundsCr: 32.4, disbursedPct: 48.2, pending: 1240, fraudAlerts: 11, status: 'On track' },
  { code: 'PNE', division: 'Pune',                     officer: 'Vikram Kumar',         districts: 5, fundsCr: 58.6, disbursedPct: 45.8, pending: 1602, fraudAlerts: 30, status: 'On track' },
  { code: 'NSK', division: 'Nashik',                   officer: 'Shri. Rajiv Sharma',   districts: 5, fundsCr: 41.2, disbursedPct: 39.6, pending: 2104, fraudAlerts: 18, status: 'Watch' },
  { code: 'CSN', division: 'Chh. Sambhajinagar',       officer: 'Dr. Sunil Deshmukh',   districts: 8, fundsCr: 49.8, disbursedPct: 33.4, pending: 3812, fraudAlerts: 36, status: 'Lagging' },
  { code: 'AMR', division: 'Amravati',                 officer: 'Smt. Priya Patil',     districts: 5, fundsCr: 38.7, disbursedPct: 41.2, pending: 1956, fraudAlerts: 21, status: 'Watch' },
  { code: 'NGP', division: 'Nagpur',                   officer: 'Shri. Manoj Kale',     districts: 6, fundsCr: 44.5, disbursedPct: 43.7, pending: 1684, fraudAlerts: 17, status: 'On track' },
];

export const DISASTER_TRIAGE = {
  event: 'Marathwada drought + Vidarbha cotton stress — May 2026',
  automatedHeatZones: 27,
  priorityDivisions: ['Chh. Sambhajinagar', 'Amravati'],
  ndviDeltaSummary: 'Mean NDVI drop >28% vs 5-year baseline across 84,200 geo-fenced plots — Marathwada belt + Yavatmal cotton stress zones.',
};
