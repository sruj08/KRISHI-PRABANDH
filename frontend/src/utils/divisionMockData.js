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

/** District desk metrics — aligned to DISTRICT_MATRIX order (Pune division). */
export const DISTRICT_OPERATIONAL_HEALTH = [
  { code: 'PNE', pendingFiles: 1842, avgApprovalDays: 4.1, surveyCompletionPct: 72, escalation30d: 14, schemeEfficiencyPct: 81, staffUtilizationPct: 88, beneficiaryThroughputPerDay: 420 },
  { code: 'STR', pendingFiles: 1124, avgApprovalDays: 3.6, surveyCompletionPct: 78, escalation30d: 9, schemeEfficiencyPct: 84, staffUtilizationPct: 91, beneficiaryThroughputPerDay: 510 },
  { code: 'SLR', pendingFiles: 3210, avgApprovalDays: 6.8, surveyCompletionPct: 58, escalation30d: 31, schemeEfficiencyPct: 62, staffUtilizationPct: 74, beneficiaryThroughputPerDay: 290 },
  { code: 'SGL', pendingFiles: 980, avgApprovalDays: 3.2, surveyCompletionPct: 81, escalation30d: 7, schemeEfficiencyPct: 87, staffUtilizationPct: 89, beneficiaryThroughputPerDay: 540 },
  { code: 'KLP', pendingFiles: 756, avgApprovalDays: 2.9, surveyCompletionPct: 86, escalation30d: 5, schemeEfficiencyPct: 90, staffUtilizationPct: 93, beneficiaryThroughputPerDay: 610 },
];

/** Composite ranks (1 = best where lower rank = better for risk/backlog). */
export const DISTRICT_COMPARATIVE_RANKS = [
  { code: 'PNE', district: 'Pune', efficiencyRank: 3, fraudRiskRank: 4, claimSpeedRank: 3, surveyBacklogRank: 3, responseRank: 3 },
  { code: 'STR', district: 'Satara', efficiencyRank: 2, fraudRiskRank: 2, claimSpeedRank: 2, surveyBacklogRank: 2, responseRank: 2 },
  { code: 'SLR', district: 'Solapur', efficiencyRank: 5, fraudRiskRank: 5, claimSpeedRank: 5, surveyBacklogRank: 5, responseRank: 5 },
  { code: 'SGL', district: 'Sangli', efficiencyRank: 4, fraudRiskRank: 1, claimSpeedRank: 4, surveyBacklogRank: 1, responseRank: 4 },
  { code: 'KLP', district: 'Kolhapur', efficiencyRank: 1, fraudRiskRank: 3, claimSpeedRank: 1, surveyBacklogRank: 4, responseRank: 1 },
];

export const DISTRICT_BOTTLENECKS = [
  { id: 'b1', text: 'Pune district — survey pendency up 34% vs 7-day baseline (Phaltan corridor spillover into western talukas).' },
  { id: 'b2', text: 'Satara — claims processing throughput 18% below divisional median; PFMS batch hold at DAO desk.' },
  { id: 'b3', text: 'Solapur — field staff utilization 74%; Madha/Mangalwedha cluster absorbing unseasonal rain survey load.' },
  { id: 'b4', text: 'Kolhapur — escalation volume elevated (+22% WoW); Aaple Sarkar land-record disputes concentrated in Shirol.' },
];

export const DISTRICT_EXEC_INSIGHTS = [
  'Three districts (Satara, Sangli, Kolhapur) are operating above the divisional efficiency threshold on combined scheme + survey SLAs.',
  'Solapur is likely to miss the Kharif crop survey closure window unless 12 additional survey officers are deployed within 10 days.',
  'Western cluster (Pune + Satara) shows field verification overload vs eastern cluster — consider temporary desk consolidation.',
];

/** Resource reallocation desk — live load view. */
export const RESOURCE_LOAD_ROWS = [
  { code: 'PNE', district: 'Pune', pendingSurveys: 842, pendingClaims: 612, activeFieldStaff: 186, avgResolutionHrs: 38, stress: 'Moderate', utilizationPct: 88, action: 'Monitor Pune–Satara verification handoffs; no redeploy yet.', pendingGrievances: 124, soilHealthTestBacklog: 2100, agriInputCouponQueue: 1840, droughtReliefPending: 420, fieldDemoFortnight: 96, mandalReviewBacklog: 34 },
  { code: 'STR', district: 'Satara', pendingSurveys: 520, pendingClaims: 410, activeFieldStaff: 142, avgResolutionHrs: 34, stress: 'Stable', utilizationPct: 91, action: 'No action needed.', pendingGrievances: 62, soilHealthTestBacklog: 1180, agriInputCouponQueue: 920, droughtReliefPending: 280, fieldDemoFortnight: 72, mandalReviewBacklog: 18 },
  { code: 'SLR', district: 'Solapur', pendingSurveys: 1680, pendingClaims: 1240, activeFieldStaff: 118, avgResolutionHrs: 62, stress: 'Overloaded', utilizationPct: 74, action: 'Deploy 12 survey officers; activate rapid survey unit for Madha belt.', pendingGrievances: 218, soilHealthTestBacklog: 3420, agriInputCouponQueue: 2640, droughtReliefPending: 890, fieldDemoFortnight: 48, mandalReviewBacklog: 62 },
  { code: 'SGL', district: 'Sangli', pendingSurveys: 310, pendingClaims: 268, activeFieldStaff: 96, avgResolutionHrs: 30, stress: 'Stable', utilizationPct: 89, action: 'No action needed.', pendingGrievances: 48, soilHealthTestBacklog: 890, agriInputCouponQueue: 710, droughtReliefPending: 160, fieldDemoFortnight: 64, mandalReviewBacklog: 12 },
  { code: 'KLP', district: 'Kolhapur', pendingSurveys: 268, pendingClaims: 198, activeFieldStaff: 108, avgResolutionHrs: 28, stress: 'Stable', utilizationPct: 93, action: 'Hold surplus Krishi Sahayaks on standby for western redeploy.', pendingGrievances: 36, soilHealthTestBacklog: 760, agriInputCouponQueue: 540, droughtReliefPending: 95, fieldDemoFortnight: 58, mandalReviewBacklog: 9 },
];

export const RESOURCE_REALLOCATION_SUGGESTION = {
  fromDistrict: 'Kolhapur',
  toDistrict: 'Solapur',
  transferRole: 'Krishi Sahayaks',
  transferCount: 14,
  expectedRecovery: 'Survey clearance velocity estimated +31% vs current Solapur run-rate (desk model, 14-day horizon).',
};

export const RESOURCE_EVENT_SCENARIOS = [
  { id: 'ev1', title: 'Unseasonal rain — western belt', impact: 'Survey demand +18%; Solapur + Pune taluka camps extended 4 days.', demandShift: '+420 survey slots' },
  { id: 'ev2', title: 'Pink bollworm advisory — cotton blocks', impact: 'Field verification queue priority reset; 2 DAO desks on split shift.', demandShift: '+160 verifications' },
  { id: 'ev3', title: 'Flood damage documentation surge', impact: 'Insurance first-notice intake up; cross-district officer pooling authorised.', demandShift: '+95 claims / day' },
  { id: 'ev4', title: 'PMFBY early claim window', impact: 'Satara + Sangli claim prep spike; maintain PFMS pre-audit staffing.', demandShift: '+12 PFMS reviewers' },
];

/** Cross-district fraud intelligence (demo). */
export const CROSS_DISTRICT_FRAUD_ALERTS = [
  { id: 'F-9081', severity: 'P1', title: 'Duplicate tractor invoice — same chassis ID lodged in Pune (Haveli) and Satara (Phaltan).', districts: ['Pune', 'Satara'], scheme: 'Mechanization — Tractor', exposureCr: 2.4, confidencePct: 94, status: 'Under Verification' },
  { id: 'F-9084', severity: 'P1', title: 'Beneficiary overlap cluster — shared mobile + Aadhaar last-four across three districts.', districts: ['Solapur', 'Sangli', 'Kolhapur'], scheme: 'PM-KISAN', exposureCr: 0.86, confidencePct: 88, status: 'Newly Flagged' },
  { id: 'F-9087', severity: 'P2', title: 'Dealer-linked subsidy spike — coordinated invoice batch from two authorized dealers.', districts: ['Pune', 'Solapur'], scheme: 'Micro irrigation', exposureCr: 1.1, confidencePct: 81, status: 'Escalated' },
  { id: 'F-9090', severity: 'P2', title: 'Repeated survey GPS capture — identical coordinates filed for non-contiguous parcels.', districts: ['Solapur', 'Satara'], scheme: 'PMFBY — Kharif', exposureCr: 0.42, confidencePct: 76, status: 'Under Verification' },
];

export const FRAUD_NETWORK_LINKS = [
  { from: 'Dealer MH-14-TR-221', to: 'Invoice TR-MDL-4421', type: 'issued' },
  { from: 'Invoice TR-MDL-4421', to: 'Pune application PNE-118204', type: 'claimed' },
  { from: 'Invoice TR-MDL-4421', to: 'Satara application STR-88291', type: 'claimed' },
  { from: 'Aadhaar cluster X7', to: 'PM-KISAN batch 12-Mar', type: 'linked' },
];

export const FRAUD_INVESTIGATION_PIPELINE = [
  { stage: 'Newly Flagged', count: 14 },
  { stage: 'Under Verification', count: 22 },
  { stage: 'Escalated', count: 7 },
  { stage: 'Confirmed Fraud', count: 3 },
  { stage: 'Closed', count: 41 },
];

/** Desk index for fraud density table (replaces map-only view). */
export const FRAUD_DENSITY_BY_DISTRICT = DISTRICT_MATRIX.map((d) => ({
  code: d.code,
  district: d.district,
  fraudAlerts: d.fraudAlerts,
  suspiciousApplicationsEst: Math.round(d.pending * 0.07 + d.fraudAlerts * 38),
  exposureDeskIndex: Math.round(d.fraudAlerts * 11 + d.pending / 42),
}));

export const DIVISION_ESCALATIONS = [
  { id: 'ESC-2401', raised: '2026-05-02', district: 'Solapur', topic: 'PFMS settlement delay — drought relief', owner: 'DAO Solapur', sla: 'Overdue 3d', status: 'Open' },
  { id: 'ESC-2404', raised: '2026-05-04', district: 'Pune', topic: 'Land record mismatch — PMFBY plot boundary', owner: 'Division desk', sla: '48h', status: 'In progress' },
  { id: 'ESC-2408', raised: '2026-05-06', district: 'Satara', topic: 'Inter-district officer transfer dispute', owner: 'HR — Division', sla: '72h', status: 'In progress' },
  { id: 'ESC-2410', raised: '2026-05-08', district: 'Kolhapur', topic: 'Grievance escalation — dealer subsidy', owner: 'Vigilance cell', sla: '5d', status: 'Awaiting field report' },
];
