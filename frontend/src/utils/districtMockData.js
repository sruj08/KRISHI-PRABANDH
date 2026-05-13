/** Demo fixtures for District Collector executive dashboard (PFMS / friction widgets). */

export const EXEC_KPIS = {
  totalBudgetCr: '1,248',
  disbursedCr: '892',
  disbursedPct: '71.4',
  disbursedTarget: '950',
  pendingPfmCr: '156',
  projectedUnutilizedPct: '12',
};

export const PFMS_BATCHES = [
  {
    id: 'PFMS-MAY-B01',
    scheme: 'PM-KISAN (Rabi top-up)',
    beneficiaries: 12480,
    amountCr: '3.42',
    avgConfidence: 0.94,
  },
  {
    id: 'PFMS-MAY-B02',
    scheme: 'Soil Health Card — DBT',
    beneficiaries: 8320,
    amountCr: '1.08',
    avgConfidence: 0.89,
  },
  {
    id: 'PFMS-MAY-B03',
    scheme: 'Drip subsidy (cluster A)',
    beneficiaries: 2104,
    amountCr: '4.65',
    avgConfidence: 0.91,
  },
];

export const FRICTION_MONTH = {
  topThreeRecommendations: [
    'Increase PM-KISAN outreach in high-friction talukas where Aadhaar–land record mismatches exceed district median.',
    'Prioritize 7/12 API retries for Jejuri and Baramati AC offices (integration latency > 48h).',
    'Route drone survey capacity toward clusters with early PMFBY claim density.',
  ],
};
