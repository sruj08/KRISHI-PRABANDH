/** Mock intelligence for Pune Division Executive Command Center (demo). */

export const DIVISION_PROFILE = {
  division: 'Pune',
  state: 'Maharashtra',
  officerTitle: 'Divisional Joint Director of Agriculture',
  name: 'Vikram Kumar',
  role: 'DJDA - Pune Division',
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
    'Cross-district fraud ring suspected between Solapur (Madha) and Sangli (Tasgaon) - 7/12 duplication pattern. Trigger joint audit.',
    'Pendency in Satara (Phaltan, Khatav) >40 days - redistribute 6 CAOs from Pune (low load) to clear backlog.',
    'Drought relief disbursement in Solapur lagging vs allocation - 32% vs target 50%. Escalate PFMS bottleneck.',
  ],
};

export const PFMS_BATCHES = [
  { id: 'PFMS-DIV-PNE-2026-1208', beneficiaries: 8420, amountCr: 38.6, avgConfidence: 0.93, scheme: 'Mechanization - Tractor / Power tiller' },
  { id: 'PFMS-DIV-PNE-2026-1209', beneficiaries: 5240, amountCr: 21.4, avgConfidence: 0.90, scheme: 'Micro irrigation' },
  { id: 'PFMS-DIV-PNE-2026-1210', beneficiaries: 12305, amountCr: 9.6, avgConfidence: 0.88, scheme: 'PMFBY - Kharif claim release' },
];

export const DISTRICT_MATRIX = [
  { code: 'PNE', district: 'Pune',     officer: 'Dr. Meera Kulkarni', talukas: 14, fundsCr: 18.6, disbursedPct: 39.9, pending: 412, fraudAlerts: 12, status: 'On track' },
  { code: 'STR', district: 'Satara',   officer: 'Shri. Anil Bhosale',  talukas: 11, fundsCr: 9.8,  disbursedPct: 47.2, pending: 268, fraudAlerts: 4,  status: 'On track' },
  { code: 'SLR', district: 'Solapur',  officer: 'Shri. Pramod Jadhav', talukas: 11, fundsCr: 11.4, disbursedPct: 31.8, pending: 596, fraudAlerts: 9,  status: 'Lagging' },
  { code: 'SGL', district: 'Sangli',   officer: 'Smt. Rohini Kulkarni', talukas: 10, fundsCr: 8.6,  disbursedPct: 52.1, pending: 184, fraudAlerts: 3,  status: 'On track' },
  { code: 'KLP', district: 'Kolhapur', officer: 'Shri. Sandeep Yadav', talukas: 12, fundsCr: 10.2, disbursedPct: 58.4, pending: 142, fraudAlerts: 2,  status: 'Leading' },
];

export const PMFBY_TRIAGE = {
  event: 'Drought stress - Solapur belt (28 Apr 2026 window)',
  automatedHeatZones: 11,
  priorityDistricts: ['Solapur', 'Satara'],
  ndviDeltaSummary: 'Moisture / drought stress up vs 30-day baseline across 11,800 geo-fenced plots in Solapur Madha + Mangalwedha (desk narrative; not satellite NDVI).',
};

/** District desk metrics - aligned to DISTRICT_MATRIX order (Pune division). */
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
  { id: 'b1', text: 'Pune district - survey pendency up 34% vs 7-day baseline (Phaltan corridor spillover into western talukas).' },
  { id: 'b2', text: 'Satara - claims processing throughput 18% below divisional median; PFMS batch hold at DAO desk.' },
  { id: 'b3', text: 'Solapur - field staff utilization 74%; Madha/Mangalwedha cluster absorbing unseasonal rain survey load.' },
  { id: 'b4', text: 'Kolhapur - escalation volume elevated (+22% WoW); Aaple Sarkar land-record disputes concentrated in Shirol.' },
];

export const DISTRICT_EXEC_INSIGHTS = [
  'Three districts (Satara, Sangli, Kolhapur) are operating above the divisional efficiency threshold on combined scheme + survey SLAs.',
  'Solapur is likely to miss the Kharif crop survey closure window unless 12 additional survey officers are deployed within 10 days.',
  'Western cluster (Pune + Satara) shows field verification overload vs eastern cluster - consider temporary desk consolidation.',
];

/** Resource reallocation desk - live load view. */
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
  { id: 'ev1', title: 'Unseasonal rain - western belt', impact: 'Survey demand +18%; Solapur + Pune taluka camps extended 4 days.', demandShift: '+420 survey slots' },
  { id: 'ev2', title: 'Pink bollworm advisory - cotton blocks', impact: 'Field verification queue priority reset; 2 DAO desks on split shift.', demandShift: '+160 verifications' },
  { id: 'ev3', title: 'Flood damage documentation surge', impact: 'Insurance first-notice intake up; cross-district officer pooling authorised.', demandShift: '+95 claims / day' },
  { id: 'ev4', title: 'PMFBY early claim window', impact: 'Satara + Sangli claim prep spike; maintain PFMS pre-audit staffing.', demandShift: '+12 PFMS reviewers' },
];

/** AI-detectable signal mix (division desk - demo counts). */
export const AI_FRAUD_SIGNALS = [
  { id: 'dup_docs', label: 'Duplicate documents', count: 38 },
  { id: 'aadhaar', label: 'Aadhaar clusters', count: 24 },
  { id: 'gps', label: 'GPS fraud', count: 17 },
  { id: 'invoice', label: 'Invoice reuse', count: 31 },
  { id: 'land', label: 'Land / survey overlap', count: 12 },
];

/** Fraud case lifecycle (DAO + vigilance) - compact status counts. */
export const FRAUD_CASE_STATUS_STAGES = [
  { stage: 'Newly Flagged', count: 14 },
  { stage: 'Under Verification', count: 22 },
  { stage: 'Escalated', count: 7 },
  { stage: 'Confirmed Fraud', count: 3 },
  { stage: 'Closed', count: 41 },
];

/**
 * Cross-district fraud alerts - hyper-local, agriculture-admin narrative.
 * Each row: chips + linked subsidy records for investigation drill-down.
 */
export const CROSS_DISTRICT_FRAUD_ALERTS = [
  {
    id: 'F-9081',
    severity: 'P1',
    title: 'Same tractor subsidy invoice - chassis MH-19-TR-8841 - lodged in Pune Haveli and Satara Phaltan.',
    districts: ['Pune', 'Satara', 'Solapur'],
    scheme: 'Farm mechanization - Tractor subsidy',
    exposureCr: 2.4,
    confidencePct: 96,
    status: 'Under verification',
    whyFlagged: ['Same chassis', 'Invoice reuse', 'Cross-district'],
    aiReasonLine: 'Dealer Mahalakshmi Agro, Barshi - same invoice PDF hash; 94% match on chassis string and GST line items.',
    relationshipSnippets: [
      'Tractor invoice uploaded in Satara (Phaltan) and Pune (Haveli) - same chassis number detected.',
      'Dealer: Mahalakshmi Agro, Barshi (Solapur) - authorised for PM mechanization.',
      'Sequential invoice TR-BSH-2026-4418 / 4419 within 18 minutes from same IP range.',
    ],
    linkedApplications: [
      { farmerName: 'राजेंद्र पाटील', applicationId: 'PNE-MCH-118204', scheme: 'Farm mechanization - Tractor subsidy', district: 'Pune', taluka: 'Haveli', invoiceOrChassis: 'MH-19-TR-8841', dealer: 'Mahalakshmi Agro, Barshi', bankOrAadhaarHint: 'Aadhaar …8071', uploadedAt: '2026-05-02' },
      { farmerName: 'सुनील जाधव', applicationId: 'STR-MCH-88291', scheme: 'Farm mechanization - Tractor subsidy', district: 'Satara', taluka: 'Phaltan', invoiceOrChassis: 'MH-19-TR-8841', dealer: 'Mahalakshmi Agro, Barshi', bankOrAadhaarHint: 'Mobile 98******21', uploadedAt: '2026-05-03' },
      { farmerName: 'अनिल कुंभार', applicationId: 'SLR-MCH-77012', scheme: 'Farm mechanization - Tractor subsidy', district: 'Solapur', taluka: 'Barshi', invoiceOrChassis: 'TR-BSH-2026-4418', dealer: 'Mahalakshmi Agro, Barshi', bankOrAadhaarHint: 'Shared IFSC branch', uploadedAt: '2026-05-03' },
    ],
  },
  {
    id: 'F-9084',
    severity: 'P1',
    title: 'PM-KISAN beneficiary cluster - one mobile + masked Aadhaar tail reused across Solapur, Sangli, Kolhapur.',
    districts: ['Solapur', 'Sangli', 'Kolhapur'],
    scheme: 'PM-KISAN',
    exposureCr: 0.86,
    confidencePct: 91,
    status: 'Newly flagged',
    whyFlagged: ['Shared mobile', 'Aadhaar cluster', 'Cross-district'],
    aiReasonLine: 'Same handset IMEI registered on three DAO portals within 48h; PM-KISAN e-KYC batch overlap.',
    relationshipSnippets: [
      'Mobile 98******21 linked to 4 PM-KISAN registrations in three districts.',
      'Aadhaar last-four …4412 appears on dormant land record in Sangli and active khata in Solapur.',
    ],
    linkedApplications: [
      { farmerName: 'निशांत महारुद्र गडसिंग', applicationId: 'SLR-PMK-90211', scheme: 'PM-KISAN', district: 'Solapur', taluka: 'Madha', invoiceOrChassis: '-', dealer: '-', bankOrAadhaarHint: 'Mobile 98******21 / Aadhaar …4412', uploadedAt: '2026-04-28' },
      { farmerName: 'वंदना गडसिंग', applicationId: 'SGL-PMK-44108', scheme: 'PM-KISAN', district: 'Sangli', taluka: 'Tasgaon', invoiceOrChassis: '-', dealer: '-', bankOrAadhaarHint: 'Same mobile', uploadedAt: '2026-04-29' },
      { farmerName: 'प्रशांत माने', applicationId: 'KLP-PMK-22017', scheme: 'PM-KISAN', district: 'Kolhapur', taluka: 'Hatkanangale', invoiceOrChassis: '-', dealer: '-', bankOrAadhaarHint: 'Aadhaar …4412', uploadedAt: '2026-04-30' },
    ],
  },
  {
    id: 'F-9087',
    severity: 'P2',
    title: 'Drip irrigation subsidy - dealer uploaded 84 invoices in 4 hours; sequential numbers; Pune + Solapur.',
    districts: ['Pune', 'Solapur'],
    scheme: 'Micro irrigation (drip)',
    exposureCr: 1.1,
    confidencePct: 73,
    status: 'Escalated',
    whyFlagged: ['Invoice burst', 'Dealer network', 'Sequential IDs'],
    aiReasonLine: 'AgroCare Jalna portal session - burst upload window 02:10–06:40; same PDF template metadata.',
    relationshipSnippets: [
      'Single dealer GST 27AABCU9603R1ZX filed 84 drip claims in one night.',
      'Invoice series DRIP-MH-2026-88901 … 88984 - all same crop season block.',
    ],
    linkedApplications: [
      { farmerName: 'सविता शिंदे', applicationId: 'PNE-DP-55102', scheme: 'Micro irrigation (drip)', district: 'Pune', taluka: 'Indapur', invoiceOrChassis: 'DRIP-MH-2026-88912', dealer: 'AgroCare Jalna', bankOrAadhaarHint: '-', uploadedAt: '2026-05-06' },
      { farmerName: 'भगवान कदम', applicationId: 'SLR-DP-33091', scheme: 'Micro irrigation (drip)', district: 'Solapur', taluka: 'Mangalwedha', invoiceOrChassis: 'DRIP-MH-2026-88913', dealer: 'AgroCare Jalna', bankOrAadhaarHint: '-', uploadedAt: '2026-05-06' },
    ],
  },
  {
    id: 'F-9090',
    severity: 'P2',
    title: 'PMFBY crop-loss panchanama - identical GPS corner reused for different farmers and villages.',
    districts: ['Solapur', 'Satara'],
    scheme: 'PMFBY - Soyabean crop loss',
    exposureCr: 0.42,
    confidencePct: 84,
    status: 'Under verification',
    whyFlagged: ['GPS reused', 'Photo match', 'Cross-taluka'],
    aiReasonLine: 'Same EXIF GPS (17.8921, 75.0234) on three damage photos; villages Madha / Khatav / Phaltan.',
    relationshipSnippets: [
      'Field photo GPS matches within 4 m for three non-adjacent survey circles.',
      'DAO Madha and DAO Phaltan both cleared first notice on same handset.',
    ],
    linkedApplications: [
      { farmerName: 'कैलास मोरे', applicationId: 'SLR-PMFBY-66102', scheme: 'PMFBY - Soyabean crop loss', district: 'Solapur', taluka: 'Madha', invoiceOrChassis: 'GPS 17.8921, 75.0234', dealer: '-', bankOrAadhaarHint: '-', uploadedAt: '2026-05-08' },
      { farmerName: 'दत्तात्रय सूर्यवंशी', applicationId: 'STR-PMFBY-55891', scheme: 'PMFBY - Soyabean crop loss', district: 'Satara', taluka: 'Phaltan', invoiceOrChassis: 'GPS 17.8921, 75.0234', dealer: '-', bankOrAadhaarHint: '-', uploadedAt: '2026-05-08' },
    ],
  },
  {
    id: 'F-9093',
    severity: 'P2',
    title: 'Soyabean compensation - survey 448/2 / 448/3 / 448/4 pattern (Malegaon-style overlap) matched in Solapur desk import.',
    districts: ['Solapur'],
    scheme: 'Crop loss relief - Unseasonal rain',
    exposureCr: 0.31,
    confidencePct: 79,
    status: 'Under verification',
    whyFlagged: ['Survey overlap', 'Area mismatch', 'Pattern match'],
    aiReasonLine: 'Cultivable area claimed exceeds 7/12 extract for same khata reference; repeated survey block from payment-failure import.',
    relationshipSnippets: [
      'Survey numbers 448/2, 448/3, 448/4 appear on three relief applications with overlapping khata.',
      'Inactive Aadhaar seeding flag on two beneficiaries - same bank branch queue.',
    ],
    linkedApplications: [
      { farmerName: 'निशांत महारुद्र गडसिंग', applicationId: 'SLR-CLR-77120', scheme: 'Crop loss relief - Unseasonal rain', district: 'Solapur', taluka: 'Barshi', invoiceOrChassis: 'Survey 448/2', dealer: '-', bankOrAadhaarHint: 'Khata 112/1', uploadedAt: '2026-05-09' },
      { farmerName: 'राहुल गडसिंग', applicationId: 'SLR-CLR-77121', scheme: 'Crop loss relief - Unseasonal rain', district: 'Solapur', taluka: 'Barshi', invoiceOrChassis: 'Survey 448/3', dealer: '-', bankOrAadhaarHint: 'Same household', uploadedAt: '2026-05-09' },
    ],
  },
];

/** Top strip for cross-district fraud command (demo) - derived from alert list. */
export const DIVISION_FRAUD_KPIS = {
  openP1: CROSS_DISTRICT_FRAUD_ALERTS.filter((a) => a.severity === 'P1').length,
  openP2: CROSS_DISTRICT_FRAUD_ALERTS.filter((a) => a.severity === 'P2').length,
  crossDistrictRings: CROSS_DISTRICT_FRAUD_ALERTS.length,
  estimatedExposureCr: Math.round(
    CROSS_DISTRICT_FRAUD_ALERTS.reduce((s, a) => s + (a.exposureCr || 0), 0) * 100
  ) / 100,
  daoVigilanceDesks: 6,
};

/** @deprecated Use CROSS_DISTRICT_FRAUD_ALERTS[].relationshipSnippets - kept for any stray imports */
export const FRAUD_NETWORK_LINKS = [];

/** @deprecated Use FRAUD_CASE_STATUS_STAGES */
export const FRAUD_INVESTIGATION_PIPELINE = FRAUD_CASE_STATUS_STAGES;

/** Per-district fraud desk metrics + severity score for map + table. */
export const FRAUD_DENSITY_BY_DISTRICT = DISTRICT_MATRIX.map((d) => {
  const suspiciousApplicationsEst = Math.round(d.pending * 0.07 + d.fraudAlerts * 38);
  const fraudSeverityScore = Math.round(d.fraudAlerts * 11 + d.pending / 42);
  return {
    code: d.code,
    district: d.district,
    fraudAlerts: d.fraudAlerts,
    suspiciousApplicationsEst,
    fraudSeverityScore,
  };
});

export const DIVISION_ESCALATIONS = [
  { id: 'ESC-2401', raised: '2026-05-02', district: 'Solapur', topic: 'PFMS settlement delay - drought relief', owner: 'DAO Solapur', sla: 'Overdue 3d', status: 'Open' },
  { id: 'ESC-2404', raised: '2026-05-04', district: 'Pune', topic: 'Land record mismatch - PMFBY plot boundary', owner: 'Division desk', sla: '48h', status: 'In progress' },
  { id: 'ESC-2408', raised: '2026-05-06', district: 'Satara', topic: 'Inter-district officer transfer dispute', owner: 'HR - Division', sla: '72h', status: 'In progress' },
  { id: 'ESC-2410', raised: '2026-05-08', district: 'Kolhapur', topic: 'Grievance escalation - dealer subsidy', owner: 'Vigilance cell', sla: '5d', status: 'Awaiting field report' },
];
