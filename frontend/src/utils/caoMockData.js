/* =========================================================
   CAO Intelligence Dashboard — Mock Data
   Mandal: Haveli, Pune District, Maharashtra
   ========================================================= */

export const CAO_PROFILE = {
  name: 'Prakash Shinde',
  designation: 'Mandal Krushi Adhikari (CAO)',
  mandal: 'Wagholi Mandal',
  district: 'Pune',
  jurisdiction: '6 Villages',
  employee_id: 'MKA-PNE-0082',
  circle: 'Circle 2 — Wagholi',
};

/* ---------- 6 Villages in Wagholi Mandal ---------- */
export const VILLAGES = [
  { id: 'V01', name: 'Wagholi',       lat: 18.5807, lng: 73.9859, pending: 12, sahayak: 'Suresh Mane',     overdue: 2 },
  { id: 'V02', name: 'Lohegaon',      lat: 18.5935, lng: 73.9229, pending: 5,  sahayak: 'Suresh Mane',     overdue: 0 },
  { id: 'V03', name: 'Dhanori',       lat: 18.5948, lng: 73.8886, pending: 8,  sahayak: 'Anil Shinde',     overdue: 1 },
  { id: 'V04', name: 'Kharadi',       lat: 18.5538, lng: 73.9436, pending: 22, sahayak: 'Anil Shinde',     overdue: 4 },
  { id: 'V05', name: 'Vadgaon Sheri', lat: 18.5522, lng: 73.9272, pending: 6,  sahayak: 'Priya Desai',     overdue: 0 },
  { id: 'V06', name: 'Kesnand',       lat: 18.5210, lng: 74.0410, pending: 18, sahayak: 'Priya Desai',     overdue: 3 },
];

/* ---------- AI Triage Queue ---------- */
export const TRIAGE_QUEUE = [
  // GREEN — Ready for Bulk Approve
  {
    id: 'APP-2026-001', status: 'green',
    farmer: 'Suhas Kamble', village: 'Uruli Devachi', scheme: 'PM-KUSUM Solar Pump',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 3.2, land_required: 2.0, survey_no: 'GN-145-A',
    applied_date: '2026-04-18', amount: '₹1,10,000',
    ai_note: 'Aadhar verified. Geo-tagged photo matches coordinates. Land size 3.2 Ha > 2 Ha required.',
    component: 'Solar Irrigation Pump',
  },
  {
    id: 'APP-2026-002', status: 'green',
    farmer: 'Meena Gaikwad', village: 'Kesnand', scheme: 'Drip Irrigation (NHM)',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 1.8, land_required: 0.5, survey_no: 'GN-332-B',
    applied_date: '2026-04-20', amount: '₹65,000',
    ai_note: 'All checks passed. Sahayak Ramesh geo-tagged on 18-Apr-2026.',
    component: 'Drip Irrigation System',
  },
  {
    id: 'APP-2026-003', status: 'green',
    farmer: 'Ganesh Thorat', village: 'Pashan', scheme: 'Drip Irrigation (NHM)',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 2.1, land_required: 0.5, survey_no: 'GN-889-C',
    applied_date: '2026-04-22', amount: '₹62,000',
    ai_note: 'Clean file. No duplicates detected in system.',
    component: 'Micro-Sprinkler System',
  },
  {
    id: 'APP-2026-004', status: 'green',
    farmer: 'Vandana Pawar', village: 'Sangvi', scheme: 'Seed Subsidy (Rabi 2026)',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 1.2, land_required: 0.5, survey_no: 'GN-201-F',
    applied_date: '2026-04-25', amount: '₹8,500',
    ai_note: 'All biometrics and 7/12 records match. Low risk.',
    component: 'Certified Seeds',
  },
  {
    id: 'APP-2026-005', status: 'green',
    farmer: 'Raju Bhosale', village: 'Bhosari', scheme: 'Drip Irrigation (NHM)',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 0.8, land_required: 0.5, survey_no: 'GN-555-G',
    applied_date: '2026-04-26', amount: '₹58,000',
    ai_note: 'Verified. Survey number GN-555-G is unique in the system.',
    component: 'Drip Irrigation System',
  },

  // YELLOW — Manual Review
  {
    id: 'APP-2026-006', status: 'yellow',
    farmer: 'Ramesh Kolhe', village: 'Wagholi', scheme: 'Drip Irrigation (NHM)',
    aadhar_match: false, geo_match: true, land_match: true,
    land_owned: 1.5, land_required: 0.5, survey_no: 'GN-677-H',
    applied_date: '2026-04-15', amount: '₹66,000',
    ai_note: '⚠️ Name Mismatch: Aadhar shows "Ramesh Kolhe" but 7/12 shows "Rames Kolhe". Possible typo — manual verification needed.',
    component: 'Drip Irrigation System',
  },
  {
    id: 'APP-2026-007', status: 'yellow',
    farmer: 'Sita Devi Shinde', village: 'Dhanori', scheme: 'PMKSY Sprinkler',
    aadhar_match: true, geo_match: false, land_match: true,
    land_owned: 2.3, land_required: 1.0, survey_no: 'GN-741-J',
    applied_date: '2026-04-17', amount: '₹82,000',
    ai_note: '⚠️ Geo-tag Anomaly: Sahayak photo location is 2.3 km from registered farm coordinates. Please re-visit to confirm.',
    component: 'Sprinkler Set',
  },
  {
    id: 'APP-2026-008', status: 'yellow',
    farmer: 'Balasaheb Nimse', village: 'Pimple Saudagar', scheme: 'Seed Subsidy',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 0.9, land_required: 0.5, survey_no: 'GN-902-K',
    applied_date: '2026-04-10', amount: '₹9,200',
    ai_note: '⚠️ Document Quality: Uploaded 7/12 PDF appears to be a low-resolution scan (48 DPI). OCR confidence: 61%. Manual read advised.',
    component: 'Hybrid Seeds',
  },

  // RED — Fraud / Mahabhulekh Violation
  {
    id: 'APP-2026-009', status: 'red',
    farmer: 'Vitthal Deore', village: 'Lohegaon', scheme: 'Heavy Tractor Subsidy',
    aadhar_match: true, geo_match: true, land_match: false,
    land_owned: 0.5, land_required: 2.0, survey_no: 'GN-113-L',
    applied_date: '2026-04-14', amount: '₹1,50,000',
    ai_note: '🔴 LAND SIZE VIOLATION: Farmer applied for Heavy Tractor Subsidy requiring 2.0 Ha minimum. Mahabhulekh shows only 0.5 Ha owned. REJECT.',
    fraud_type: 'land_mismatch',
    component: 'Tractor (35+ HP)',
  },
  {
    id: 'APP-2026-010', status: 'red',
    farmer: 'Prakash Nale', village: 'Charholi', scheme: 'Drip Irrigation (NHM)',
    aadhar_match: true, geo_match: true, land_match: true,
    land_owned: 1.8, land_required: 0.5, survey_no: 'GN-332-B',
    applied_date: '2026-04-21', amount: '₹65,000',
    ai_note: '🔴 GHOST SUBSIDY DETECTED: Survey No. GN-332-B is already registered in Application APP-2026-002 (Meena Gaikwad, Kesnand). Same Gat Kramank cannot claim two subsidies.',
    fraud_type: 'duplicate_survey',
    component: 'Drip Irrigation System',
  },
  {
    id: 'APP-2026-011', status: 'red',
    farmer: 'Mohan Wagh', village: 'Kothrud', scheme: 'Power Tiller Subsidy',
    aadhar_match: false, geo_match: false, land_match: false,
    land_owned: 0.3, land_required: 1.0, survey_no: 'GN-445-M',
    applied_date: '2026-04-08', amount: '₹90,000',
    ai_note: '🔴 MULTIPLE VIOLATIONS: (1) Aadhar name mismatch, (2) Geo-tag 5.1 km off, (3) Land 0.3 Ha < 1.0 Ha required. Refer to Anti-Corruption Cell.',
    fraud_type: 'multiple_violations',
    component: 'Power Tiller',
  },
];

/* ---------- Fertilizer Shops in Wagholi Mandal ---------- */
export const FERTILIZER_SHOPS = [
  { id: 'KSK-001', name: 'Jai Kisan Agro Centre',    village: 'Wagholi',     owner: 'Dinesh Patil',   lat: 18.5607, lng: 73.9859, last_inspected: '2025-12-10', license: 'LIC-PNE-1201', stock_complaints: 2 },
  { id: 'KSK-002', name: 'Mauli Krushi Seva',         village: 'Lohegaon',    owner: 'Ramkrishna More',lat: 18.5935, lng: 73.9229, last_inspected: '2026-04-01', license: 'LIC-PNE-1342', stock_complaints: 0 },
  { id: 'KSK-003', name: 'Kharadi Agro Traders',      village: 'Kharadi',     owner: 'Vikas Dhole',    lat: 18.5538, lng: 73.9436, last_inspected: '2025-10-30', license: 'LIC-PNE-0445', stock_complaints: 7 },
  { id: 'KSK-004', name: 'Nutan Seeds & Fertilizers', village: 'Kesnand',      owner: 'Nalini Pawar',   lat: 18.5210, lng: 74.0410, last_inspected: '2026-04-10', license: 'LIC-PNE-1801', stock_complaints: 0 },
];

/* ---------- Krishi Sahayak Accountability Matrix (3 Sahayaks in Wagholi Mandal) ---------- */
export const SAHAYAKS = [
  {
    id: 'KS-002', name: 'Suresh Mane', circle: 2,
    villages: ['Wagholi', 'Lohegaon'],
    verifications_week: 12, avg_days: 8.4,
    total_pending: 17, overdue_15d: 2,
    status: 'warning',
    last_field_visit: '2026-04-29',
    whatsapp: '+91-9876543211',
    trend: [20, 18, 15, 14, 13, 12, 12],
  },
  {
    id: 'KS-003', name: 'Anil Shinde', circle: 2,
    villages: ['Dhanori', 'Kharadi'],
    verifications_week: 28, avg_days: 3.5,
    total_pending: 30, overdue_15d: 5,
    status: 'good',
    last_field_visit: '2026-05-02',
    whatsapp: '+91-9876543212',
    trend: [25, 26, 28, 27, 29, 28, 28],
  },
  {
    id: 'KS-005', name: 'Priya Desai', circle: 2,
    villages: ['Vadgaon Sheri', 'Kesnand'],
    verifications_week: 35, avg_days: 1.8,
    total_pending: 24, overdue_15d: 3,
    status: 'excellent',
    last_field_visit: '2026-05-03',
    whatsapp: '+91-9876543214',
    trend: [28, 30, 32, 33, 34, 35, 35],
  },
];

/* ---------- PMFBY Disaster Claims ---------- */
export const PMFBY_EVENTS = [
  {
    id: 'PMFBY-E01',
    event: 'Unseasonal Hailstorm',
    date: '2026-04-12',
    affected_villages: ['Wagholi', 'Lohegaon', 'Dhanori'],
    total_claims: 318,
    crop: 'Wheat (Rabi)',
    ndvi_before: 0.72,
    ndvi_after: 0.14,
    vegetation_drop: 80.5,
    satellite_verified: true,
    auto_approvable: true,
    status: 'pending_cao_approval',
    estimated_disbursement: '₹2.84 Crore',
    claims_breakdown: [
      { village: 'Charholi',  claims: 89, ndvi_drop: 82 },
      { village: 'Moshi',     claims: 67, ndvi_drop: 79 },
      { village: 'Chikhali',  claims: 72, ndvi_drop: 84 },
      { village: 'Wagholi',   claims: 55, ndvi_drop: 76 },
      { village: 'Lohegaon',  claims: 35, ndvi_drop: 81 },
    ],
  },
  {
    id: 'PMFBY-E02',
    event: 'Drought (Water Deficit)',
    date: '2026-03-20',
    affected_villages: ['Kharadi', 'Vadgaon Sheri', 'Kesnand'],
    total_claims: 94,
    crop: 'Sugarcane (Kharif)',
    ndvi_before: 0.61,
    ndvi_after: 0.31,
    vegetation_drop: 49.2,
    satellite_verified: true,
    auto_approvable: false,
    status: 'manual_review',
    estimated_disbursement: '₹78 Lakh',
    claims_breakdown: [
      { village: 'Nanded',        claims: 28, ndvi_drop: 52 },
      { village: 'Sinhagad Road', claims: 41, ndvi_drop: 47 },
      { village: 'Ambegaon',      claims: 25, ndvi_drop: 49 },
    ],
  },
];

/* ---------- Dashboard KPIs ---------- */
export const DASHBOARD_KPIS = {
  total_pending:       71,
  red_queue:           3,
  yellow_queue:        3,
  green_queue:         5,
  fraud_prevented:     '₹1,05,000',
  avg_approval_days:   4.2,
  shops_overdue:       2,
  sahayaks_critical:   1,
  pmfby_pending:       318,
  total_disbursed:     '₹4.4 Cr',
};
