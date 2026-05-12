/** Mock intelligence for Pune Division Executive Command Center (demo). */

export const DIVISION_PROFILE = {
  division: 'Pune',
  state: 'Maharashtra',
  officerTitle: 'Divisional Joint Director of Agriculture',
  name: 'Vikram Kumar',
  role: 'DJDA — Pune Division',
  hq: 'Pune (covers 5 districts)',
};

export const EXEC_KPIS = {
  totalBudgetCr: '58.6',
  disbursedCr: '26.84',
  disbursedPct: '45.8',
  disbursedTarget: '58.6',
  pendingPfmCr: '7.92',
  projectedUnutilizedPct: '9.6',
  sentinel2Pass: 'Last pass: 18h ago (Sentinel-2 L2A)',
};

export const FRICTION_MONTH = {
  labels: [
    'Aadhaar mismatch (PM-KISAN)',
    '7/12 integration failure',
    'Lack of margin money',
    'Bank account not linked',
    'Land parcel verification pending',
  ],
  counts: [3120, 2104, 1856, 1212, 718],
  topThreeRecommendations: [
    'Cross-district fraud ring suspected between Solapur (Madha) and Sangli (Tasgaon) — 7/12 duplication pattern. Trigger joint audit.',
    'Pendency in Satara (Phaltan, Khatav) >40 days — redistribute 6 CAOs from Pune (low load) to clear backlog.',
    'Drought relief disbursement in Solapur lagging vs allocation — 32% vs target 50%. Escalate PFMS bottleneck.',
  ],
};

export const PFMS_BATCHES = [
  { id: 'PFMS-DIV-PNE-2026-1208', beneficiaries: 8420, amountCr: 38.6, avgConfidence: 0.93, scheme: 'Mechanization — Tractor / Power tiller' },
  { id: 'PFMS-DIV-PNE-2026-1209', beneficiaries: 5240, amountCr: 21.4, avgConfidence: 0.90, scheme: 'Micro irrigation' },
  { id: 'PFMS-DIV-PNE-2026-1210', beneficiaries: 12305, amountCr: 9.6, avgConfidence: 0.88, scheme: 'PMFBY — Kharif claim release' },
];

export const DISTRICT_MATRIX = [
  { code: 'PNE', district: 'Pune',     officer: 'Dr. Meera Kulkarni', talukas: 14, fundsCr: 18.6, disbursedPct: 39.9, pending: 412, fraudAlerts: 12, status: 'On track' },
  { code: 'STR', district: 'Satara',   officer: 'Shri. Anil Bhosale',  talukas: 11, fundsCr: 9.8,  disbursedPct: 47.2, pending: 268, fraudAlerts: 4,  status: 'On track' },
  { code: 'SLR', district: 'Solapur',  officer: 'Shri. Pramod Jadhav', talukas: 11, fundsCr: 11.4, disbursedPct: 31.8, pending: 596, fraudAlerts: 9,  status: 'Lagging' },
  { code: 'SGL', district: 'Sangli',   officer: 'Smt. Rohini Kulkarni', talukas: 10, fundsCr: 8.6,  disbursedPct: 52.1, pending: 184, fraudAlerts: 3,  status: 'On track' },
  { code: 'KLP', district: 'Kolhapur', officer: 'Shri. Sandeep Yadav', talukas: 12, fundsCr: 10.2, disbursedPct: 58.4, pending: 142, fraudAlerts: 2,  status: 'Leading' },
];

export const PMFBY_TRIAGE = {
  event: 'Drought stress — Solapur belt (28 Apr 2026 window)',
  automatedHeatZones: 11,
  priorityDistricts: ['Solapur', 'Satara'],
  ndviDeltaSummary: 'Mean NDVI drop >24% vs 30-day baseline across 11,800 geo-fenced plots in Solapur Madha + Mangalwedha.',
};
