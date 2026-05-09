/** Mock intelligence for Pune District Executive Command Center (demo). */

export const DISTRICT_PROFILE = {
  district: 'Pune',
  state: 'Maharashtra',
  officerTitle: 'District Superintending Agriculture Officer',
  name: 'Dr. Meera Kulkarni',
  dao: 'Shri. Vijay Patil — District Agriculture Officer',
  collector: 'District Collector — Pune',
};

export const EXEC_KPIS = {
  totalBudgetCr: 500,
  disbursedCr: 320,
  pendingPfmCr: 45,
  projectedUnutilizedPct: 8,
  sentinel2Pass: 'Last pass: 36h ago (Sentinel-2 L2A)',
};

export const FRICTION_MONTH = {
  labels: [
    'Lack of margin money',
    'Missing / unclear 7-12',
    'Bank account not linked (Aadhaar)',
    'Land parcel verification pending',
    'Other / documentation',
  ],
  counts: [1842, 1204, 956, 612, 318],
  topThreeRecommendations: [
    'Coordinate with Lead Bank for margin-linked bridge camps in Shirur and Haveli — 65% of stalled tractor subsidies cite margin shortfall.',
    'Deploy e-7/12 helpdesk + mobile scanning vans in Ambegaon and Velhe clusters where dropout spikes after digitization step.',
    'Fast-track Aadhaar–bank seeding with UIDAI camps in Daund circle; friction tag volume up 3× week-on-week.',
  ],
};

export const PFMS_BATCHES = [
  { id: 'PFMS-PNE-2026-0412', beneficiaries: 2840, amountCr: 12.4, avgConfidence: 0.94, scheme: 'Mechanization — Tractor / Power tiller' },
  { id: 'PFMS-PNE-2026-0413', beneficiaries: 1620, amountCr: 6.8, avgConfidence: 0.91, scheme: 'Micro irrigation' },
  { id: 'PFMS-PNE-2026-0414', beneficiaries: 4105, amountCr: 3.2, avgConfidence: 0.89, scheme: 'PM-KISAN top-up (state)' },
];

export const GRIEVANCE_SPIKES = [
  { taluka: 'Shirur', category: 'Verification delays', wowPct: 312, open: 89, flag: 'audit' },
  { taluka: 'Haveli', category: 'MahaDBT portal errors', wowPct: 118, open: 54, flag: 'watch' },
  { taluka: 'Velhe', category: 'PMFBY survey scheduling', wowPct: 96, open: 31, flag: 'watch' },
];

export const PMFBY_TRIAGE = {
  event: 'Unseasonal rain — 28 Apr 2026 window',
  automatedHeatZones: 6,
  priorityTalukas: ['Mulshi', 'Velhe', 'Ambegaon'],
  ndviDeltaSummary: 'Mean NDVI drop >18% vs 15-day baseline across 4,200 geo-fenced plots (district mask).',
};

export const SCHEME_PENETRATION_RANK = [
  { taluka: 'Haveli', pct: 88 },
  { taluka: 'Khed', pct: 83 },
  { taluka: 'Maval', pct: 81 },
  { taluka: 'Baramati', pct: 79 },
  { taluka: 'Shirur', pct: 77 },
];
