/**
 * Realistic operational mock data for Taluka Agriculture Officer flows.
 * Preloaded across officer command-center pages (no backend required for demo).
 */

export const OFFICER_PROFILE = {
  displayName: 'Sahayak Shri. Patil',
  shortName: 'Patil',
  taluka: 'Baramati',
  district: 'Pune',
  post: 'Krishi Sahayak',
  operationalStatus: 'Verification window open · Kharif 2026',
  weatherSnippet: 'Last 7d rain: 42 mm (near normal). IMD station: Baramati Agro.',
  pendingWorkload: 47,
};

export const OPERATIONAL_PULSE = [
  { key: 'verify', label: 'Pending verifications', value: 12, path: '/officer/application-review', tone: 'amber' },
  { key: 'risk', label: 'High-risk anomalies', value: 3, path: '/officer/alerts', tone: 'red' },
  { key: 'comp', label: 'Compensation backlog', value: 8, path: '/officer/compensation', tone: 'olive' },
  { key: 'field', label: 'Field visits today', value: 5, path: '/officer/field-verification', tone: 'green' },
];

export const PRIORITY_QUEUE = [
  {
    id: 'pq-1',
    urgency: 'critical',
    title: '12 applications awaiting verification',
    detail: 'PM-KISAN and tractor subsidy uploads concentrated in Madha cluster.',
    actionLabel: 'Open queue',
    path: '/officer/application-review',
    timeLabel: 'Updated 08:42',
  },
  {
    id: 'pq-2',
    urgency: 'high',
    title: '3 duplicate Aadhaar alerts detected',
    detail: 'Same masked UID tail across unrelated khata numbers — NPCI rejects elevated.',
    actionLabel: 'Review duplicates',
    path: '/officer/duplicate-detection',
    timeLabel: 'Updated 07:15',
  },
  {
    id: 'pq-3',
    urgency: 'medium',
    title: '5 geo-tagged surveys pending review',
    detail: 'GPS spread inconsistent with declared village boundaries.',
    actionLabel: 'Open surveys',
    path: '/officer/geo-surveys',
    timeLabel: 'Updated yesterday',
  },
  {
    id: 'pq-4',
    urgency: 'high',
    title: '2 compensation cases exceed taluka threshold',
    detail: 'Outlier loss % vs adjacent parcels on soybean PMFBY intimation.',
    actionLabel: 'View pipeline',
    path: '/officer/compensation',
    timeLabel: 'Updated 06:50',
  },
];

export const TALUKA_SNAPSHOT = {
  activeFarmers: 18420,
  applicationsThisWeek: 126,
  approvedToday: 14,
  pendingFieldVisits: 5,
  highRiskVillages: ['Khadki Mal', 'Malegaon', 'Nimbut'],
};

export const AI_INSIGHTS = [
  {
    id: 'ai-1',
    text: 'Multiple claims detected from survey block 47/2 across two different farmer IDs.',
    severity: 'high',
    path: '/officer/duplicate-detection',
  },
  {
    id: 'ai-2',
    text: 'Repeated inactive Aadhaar failures from Malegaon cluster — same IFSC branch mapping.',
    severity: 'medium',
    path: '/officer/alerts',
  },
  {
    id: 'ai-3',
    text: 'Unusual compensation spike in Nimbut and Rui — check rainfall layer vs self-reported loss.',
    severity: 'medium',
    path: '/officer/crop-damage',
  },
];

export const VILLAGE_HEAT = [
  { village: 'Baramati Rural', status: 'stable', cases: 2 },
  { village: 'Khadki Mal', status: 'watch', cases: 11 },
  { village: 'Malegaon', status: 'anomaly', cases: 19 },
  { village: 'Nimbut', status: 'watch', cases: 8 },
  { village: 'Rui', status: 'stable', cases: 3 },
  { village: 'Supa', status: 'anomaly', cases: 14 },
];

export const ACTIVITY_FEED = [
  { id: 'a1', type: 'approval', text: 'Approved PMFBY intimation — Kadam, Rui', time: '09:12' },
  { id: 'a2', type: 'flag', text: 'Flagged tractor subsidy — invoice hash match', time: '08:56' },
  { id: 'a3', type: 'ai', text: 'AI: duplicate chassis alert linked to Satara claim', time: '08:40' },
  { id: 'a4', type: 'field', text: 'Field photo upload — soybean plot, GPS verified', time: '08:22' },
  { id: 'a5', type: 'release', text: 'Compensation batch released — 6 farmers', time: 'Yesterday' },
];

export const ALERTS_FEED = [
  { id: 'al1', title: 'Duplicate Aadhaar spike', detail: '7 new NPCI rejects in 48h', path: '/officer/duplicate-detection', severity: 'high' },
  { id: 'al2', title: 'Rainfall anomaly', detail: 'Station vs TRMM variance > 35%', path: '/officer/crop-damage', severity: 'medium' },
  { id: 'al3', title: 'Survey mismatch cluster', detail: 'Block 12/1 not in cadastre FMB', path: '/officer/geo-surveys', severity: 'high' },
  { id: 'al4', title: 'Compensation outlier', detail: '2 claims > 2σ from village mean', path: '/officer/compensation', severity: 'medium' },
];

export const DAILY_TASKS = [
  { id: 'd1', title: 'Verify PM-KISAN batch — Madha circle', time: '10:30', priority: 'HIGH', route: '/officer/application-review' },
  { id: 'd2', title: 'Field visit — drip subsidy, Nimbut', time: '14:00', priority: 'MEDIUM', route: '/officer/field-verification' },
  { id: 'd3', title: 'Sign panchanama pack — hailstorm case', time: '16:00', priority: 'HIGH', route: '/officer/crop-damage' },
  { id: 'd4', title: 'DAO escalation response — duplicate land', time: 'EOD', priority: 'LOW', route: '/officer/alerts' },
];

export const FARMER_REGISTRY = [
  {
    id: 'F-102884',
    name: 'Sunita Jadhav',
    village: 'Madha',
    landHa: 1.62,
    schemes: 'PM-KISAN, PMFBY',
    verification: 'Pending',
    risk: 'high',
    lastActivity: '2026-05-13',
    aadhaarLast4: '****7821',
    mobile: '98******21',
    surveyNo: '47/2',
    appId: 'APP-2026-4412',
  },
  {
    id: 'F-102901',
    name: 'Popat Shinde',
    village: 'Khadki Mal',
    landHa: 2.05,
    schemes: 'Tractor subsidy',
    verification: 'Under review',
    risk: 'medium',
    lastActivity: '2026-05-12',
    aadhaarLast4: '****9012',
    mobile: '97******88',
    surveyNo: '12/1',
    appId: 'APP-2026-4390',
  },
  {
    id: 'F-102910',
    name: 'Anil Khot',
    village: 'Malegaon',
    landHa: 0.98,
    schemes: 'PM-KISAN',
    verification: 'Verified',
    risk: 'low',
    lastActivity: '2026-05-10',
    aadhaarLast4: '****3344',
    mobile: '91******44',
    surveyNo: '3/5',
    appId: 'APP-2026-4201',
  },
  {
    id: 'F-102933',
    name: 'Vaishali Powar',
    village: 'Nimbut',
    landHa: 1.20,
    schemes: 'Drip, PMFBY',
    verification: 'High risk hold',
    risk: 'high',
    lastActivity: '2026-05-14',
    aadhaarLast4: '****2211',
    mobile: '90******11',
    surveyNo: '8/4',
    appId: 'APP-2026-4488',
  },
];

export const APPLICATION_REVIEW = [
  {
    id: 'APP-2026-4412',
    farmer: 'Sunita Jadhav',
    scheme: 'PM-KISAN',
    village: 'Madha',
    stage: 'Document verification',
    daysOpen: 3,
    priority: 'HIGH',
    summary: 'Bank NPCI inactive · shared mobile cluster flagged by AI.',
  },
  {
    id: 'APP-2026-4390',
    farmer: 'Popat Shinde',
    scheme: 'Tractor subsidy',
    village: 'Khadki Mal',
    stage: 'Technical scrutiny',
    daysOpen: 5,
    priority: 'HIGH',
    summary: 'Invoice PDF cross-hash with Solapur upload.',
  },
  {
    id: 'APP-2026-4488',
    farmer: 'Vaishali Powar',
    scheme: 'PMFBY soybean',
    village: 'Nimbut',
    stage: 'Geo verification',
    daysOpen: 2,
    priority: 'MEDIUM',
    summary: 'GPS centroid 1.2 km outside declared village envelope.',
  },
  {
    id: 'APP-2026-4201',
    farmer: 'Anil Khot',
    scheme: 'PM-KISAN',
    village: 'Malegaon',
    stage: 'Eligibility cleared',
    daysOpen: 1,
    priority: 'LOW',
    summary: 'Auto rules passed; awaiting officer sign-off.',
  },
];

export const ELIGIBILITY_QUEUE = [
  {
    id: 'EL-01',
    farmer: 'Popat Shinde',
    scheme: 'Tractor subsidy',
    eligibilityPct: 34,
    riskScore: 88,
    passed: ['Land record linked', 'Crop declaration present'],
    failed: ['Invoice authenticity', 'Dealer distance rule'],
    aiNote: 'Recommend manual review — application similarity 92% with rejected claim APP-2025-991.',
  },
  {
    id: 'EL-02',
    farmer: 'Anil Khot',
    scheme: 'PM-KISAN',
    eligibilityPct: 100,
    riskScore: 22,
    passed: ['Aadhaar seeded', 'Land within limit', 'No duplicate bank'],
    failed: [],
    aiNote: 'Eligible for auto-approval path.',
  },
  {
    id: 'EL-03',
    farmer: 'Sunita Jadhav',
    scheme: 'PM-KISAN',
    eligibilityPct: 61,
    riskScore: 71,
    passed: ['Land size within limit', 'Crop eligible'],
    failed: ['Inactive Aadhaar at bank', 'Shared mobile pattern'],
    aiNote: 'Escalate to bank mapping verification.',
  },
];

export const FIELD_VISITS = [
  {
    id: 'V-01',
    farmer: 'Vaishali Powar',
    village: 'Nimbut',
    scheme: 'Drip irrigation',
    km: 8.4,
    risk: 'HIGH',
    lastVisit: '2025-11-02',
    photos: 3,
    gpsOk: false,
    remarks: 'Officer requested re-survey of lateral count.',
  },
  {
    id: 'V-02',
    farmer: 'Popat Shinde',
    village: 'Khadki Mal',
    scheme: 'Tractor subsidy',
    km: 12.1,
    risk: 'HIGH',
    lastVisit: '—',
    photos: 5,
    gpsOk: true,
    remarks: 'Chassis stamp matches RC; invoice pending DAO.',
  },
  {
    id: 'V-03',
    farmer: 'Rahul Kadam',
    village: 'Rui',
    scheme: 'PMFBY',
    km: 5.2,
    risk: 'MEDIUM',
    lastVisit: '2026-04-18',
    photos: 4,
    gpsOk: true,
    remarks: 'Loss photo hash duplicate — AI flagged.',
  },
];

export const DAMAGE_CLUSTERS = [
  { type: 'Drought', severity: 'Moderate', acres: 1240, exposureCr: 1.8, progress: 62 },
  { type: 'Hailstorm', severity: 'Severe', acres: 210, exposureCr: 0.42, progress: 28 },
  { type: 'Pest (pink bollworm)', severity: 'Localised', acres: 95, exposureCr: 0.11, progress: 74 },
  { type: 'Flood', severity: 'Low', acres: 48, exposureCr: 0.06, progress: 90 },
];

export const COMPENSATION_STAGES = [
  { stage: 'Submitted', count: 42 },
  { stage: 'Under verification', count: 18 },
  { stage: 'AI flagged', count: 6 },
  { stage: 'Approved', count: 24 },
  { stage: 'Released', count: 11 },
];

export const HIGH_RISK_CLAIMS = [
  { id: 'HC-1', issue: 'Duplicate geotagged image', farmer: 'Rahul Kadam', village: 'Rui' },
  { id: 'HC-2', issue: 'Reused survey number', farmer: 'Unknown cluster', village: 'Malegaon' },
  { id: 'HC-3', issue: 'Compensation pattern repeat', farmer: 'Powar household', village: 'Nimbut' },
];

export const GEO_SURVEYS = [
  { id: 'G-901', village: 'Nimbut', crop: 'Soybean', lossPct: 38, anomaly: 'GPS drift', status: 'Pending' },
  { id: 'G-902', village: 'Malegaon', crop: 'Cotton', lossPct: 22, anomaly: 'Image hash match', status: 'AI flagged' },
  { id: 'G-903', village: 'Rui', crop: 'Soybean', lossPct: 15, anomaly: 'None', status: 'Cleared' },
];

export const DUPLICATE_DETECTION = [
  { farmer: 'Popat Shinde', districts: 'Sangli, Solapur', match: 'Invoice PDF hash', similarity: 100, status: 'Open' },
  { farmer: 'Sunita Jadhav', districts: 'Solapur', match: 'Mobile + Aadhaar tail', similarity: 91, status: 'Under review' },
  { farmer: 'Cluster M-12', districts: 'Pune, Satara', match: 'Chassis number', similarity: 100, status: 'Escalated' },
];

export const OCR_EXTRACTION_DEMO = [
  { field: 'Invoice number', value: 'MH/AGR/2026/8841', confidence: 96 },
  { field: 'Chassis', value: 'MB1TCB1234567890', confidence: 99 },
  { field: 'Survey number', value: '47/2', confidence: 88 },
  { field: 'Payment ref', value: 'NEFT UTR HDFC009281', confidence: 91 },
];

export const FRAUD_SIGNALS_DEMO = [
  'Same invoice attached to two DAO uploads (byte match).',
  'Chassis reused across Pune and Satara RC extracts.',
  'EXIF timestamp predates invoice date by 11 days.',
];

export const AUDIT_LOGS = [
  { id: 1, actor: 'You', action: 'Approved PMFBY', target: 'APP-2026-4102', time: '2026-05-14 09:12' },
  { id: 2, actor: 'System', action: 'AI rule fired', target: 'Duplicate chassis', time: '2026-05-14 08:56' },
  { id: 3, actor: 'DAO office', action: 'Escalation assigned', target: 'APP-2026-4390', time: '2026-05-14 08:10' },
];

export const SOP_ITEMS = [
  { id: 's1', title: 'PM-KISAN NPCI reject playbook', summary: 'Bank seeding checklist and farmer communication template.', bookmarked: true },
  { id: 's2', title: 'Tractor subsidy field verification', summary: 'Chassis, invoice, and delivery note triangulation.', bookmarked: false },
  { id: 's3', title: 'PMFBY loss intimation photo rules', summary: 'GPS radius, timestamp, and EXIF integrity.', bookmarked: true },
];
