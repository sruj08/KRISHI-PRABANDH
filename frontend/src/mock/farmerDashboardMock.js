/**
 * Realistic mock data for Farmer Portal (MahaDBT-style).
 * Malegaon / Barshi taluka context.
 */

export const FARMER_PROFILE = {
  fullName: 'Avinash Patil',
  farmerId: 'MH-FAR-2024-089234',
  maskedAadhaar: 'XXXX XXXX 4521',
  mobile: '+91 98765 43210',
  address: 'House 12, Ward 4, Malegaon, Taluka Barshi, Solapur',
  village: 'Malegaon',
  taluka: 'Barshi',
  district: 'Solapur',
  category: 'General',
  landholdingType: 'Small Farmer (< 2 ha)',
  photoUrl: null,
  profileCompletionPct: 82,
  lastLogin: '14 May 2026, 09:42 IST',
};

export const PROFILE_STATUS_CHIPS = [
  { id: 'aadhaar', label: 'Aadhaar Verified', state: 'ok', icon: 'verified_user' },
  { id: 'bank', label: 'Bank Linked', state: 'ok', icon: 'account_balance' },
  { id: '712', label: '7/12 Linked', state: 'ok', icon: 'description' },
  { id: 'crop', label: 'Crop Declared', state: 'warn', icon: 'agriculture' },
  { id: 'ekyc', label: 'eKYC Complete', state: 'ok', icon: 'badge' },
];

export const LAND_PARCELS = [
  {
    id: 'L1',
    surveyNo: '42/1A',
    village: 'Malegaon',
    areaHa: 1.24,
    irrigation: 'Irrigated',
    irrigationTag: 'irrigated',
    ownership: 'Individual',
    ownershipTags: ['verified'],
    cropDeclared: 'Soybean (Kharif 2025)',
    season: 'Kharif 2025',
  },
  {
    id: 'L2',
    surveyNo: '38/2',
    village: 'Malegaon',
    areaHa: 0.86,
    irrigation: 'Rainfed',
    irrigationTag: 'rainfed',
    ownership: 'Joint',
    ownershipTags: ['joint', 'verified'],
    cropDeclared: '— Pending update',
    season: '—',
  },
  {
    id: 'L3',
    surveyNo: '15/3B',
    village: 'Rui',
    areaHa: 0.50,
    irrigation: 'Rainfed',
    irrigationTag: 'rainfed',
    ownership: 'Individual',
    ownershipTags: ['verified'],
    cropDeclared: 'Soybean (crop loss reported)',
    season: 'Kharif 2025',
  },
];

export const SCHEME_TABS = ['eligible', 'applied', 'approved', 'rejected', 'recommended'];

export const SCHEMES = {
  eligible: [
    {
      id: 'S1',
      name: 'Micro Irrigation (Drip)',
      dept: 'Agriculture Dept.',
      subsidy: 'Up to ₹1,25,000 / ha',
      eligibility: 'Eligible',
      deadline: '30 Jun 2026',
      stage: 'Not applied',
      icon: 'water_drop',
    },
    {
      id: 'S2',
      name: 'Farm Mechanization',
      dept: 'Agriculture Dept.',
      subsidy: '40% on equipment',
      eligibility: 'Eligible',
      deadline: '15 Jul 2026',
      stage: 'Document check pending',
      icon: 'precision_manufacturing',
    },
    {
      id: 'S3',
      name: 'Solar Agricultural Pump',
      dept: 'Energy Dept.',
      subsidy: 'Up to 90% (capped)',
      eligibility: 'Eligible',
      deadline: '20 Aug 2026',
      stage: 'Not applied',
      icon: 'solar_power',
    },
  ],
  applied: [
    {
      id: 'S4',
      name: 'Pradhan Mantri Fasal Bima Yojana',
      dept: 'Cooperation Dept.',
      subsidy: 'Premium subsidized',
      eligibility: 'Applied',
      deadline: '—',
      stage: 'Under scrutiny',
      icon: 'shield',
    },
  ],
  approved: [
    {
      id: 'S5',
      name: 'Seed Subsidy (Soybean)',
      dept: 'Agriculture Dept.',
      subsidy: '₹4,500 credited',
      eligibility: 'Approved',
      deadline: '—',
      stage: 'Payment completed',
      icon: 'grass',
    },
  ],
  rejected: [
    {
      id: 'S6',
      name: 'Farm Pond (NABARD)',
      dept: 'Rural Development',
      subsidy: '—',
      eligibility: 'Rejected',
      deadline: '—',
      stage: 'Land record mismatch',
      icon: 'waves',
    },
  ],
  recommended: [
    {
      id: 'S7',
      name: 'National Bamboo Mission',
      dept: 'Forestry',
      subsidy: 'As per GR',
      eligibility: 'Recommended',
      deadline: '10 Sep 2026',
      stage: 'Based on your land profile',
      icon: 'park',
    },
  ],
};

export const APPLICATION_WORKFLOWS = [
  {
    id: 'APP-2026-004521',
    schemeName: 'Micro Irrigation (Drip)',
    submittedAt: '02 May 2026',
    officerStage: 'Taluka Verification',
    status: 'pending',
    statusLabel: 'Pending',
    timeline: [
      { key: 'submitted', label: 'Submitted', done: true },
      { key: 'scrutiny', label: 'Scrutiny', done: true },
      { key: 'taluka', label: 'Taluka Verification', done: false, current: true },
      { key: 'dao', label: 'DAO Approval', done: false },
      { key: 'payment', label: 'Payment Processing', done: false },
      { key: 'completed', label: 'Completed', done: false },
    ],
  },
  {
    id: 'APP-2026-001102',
    schemeName: 'Pradhan Mantri Fasal Bima Yojana',
    submittedAt: '18 Jul 2025',
    officerStage: 'Scrutiny',
    status: 'review',
    statusLabel: 'Under Review',
    timeline: [
      { key: 'submitted', label: 'Submitted', done: true },
      { key: 'scrutiny', label: 'Scrutiny', done: false, current: true },
      { key: 'taluka', label: 'Taluka Verification', done: false },
      { key: 'dao', label: 'DAO Approval', done: false },
      { key: 'payment', label: 'Payment Processing', done: false },
      { key: 'completed', label: 'Completed', done: false },
    ],
  },
];

export const DOCUMENTS = [
  { id: 'D1', title: 'Aadhaar', type: 'Identity', status: 'verified', uploadedAt: '12 Jan 2025', icon: 'badge' },
  { id: 'D2', title: 'PAN', type: 'Identity', status: 'pending', uploadedAt: '03 May 2026', icon: 'credit_card' },
  { id: 'D3', title: '7/12 Extract', type: 'Land', status: 'verified', uploadedAt: '14 Feb 2025', icon: 'description' },
  { id: 'D4', title: 'Bank Passbook', type: 'Bank', status: 'verified', uploadedAt: '14 Feb 2025', icon: 'account_balance_wallet' },
  { id: 'D5', title: 'Income Certificate', type: 'Income', status: 'rejected', uploadedAt: '20 Apr 2026', icon: 'request_quote' },
  { id: 'D6', title: 'Caste Certificate', type: 'Category', status: 'verified', uploadedAt: '10 Mar 2025', icon: 'groups' },
  { id: 'D7', title: 'Crop Declaration', type: 'Crop', status: 'pending', uploadedAt: '—', icon: 'agriculture' },
  { id: 'D8', title: 'Insurance Receipt', type: 'Insurance', status: 'verified', uploadedAt: '22 Jul 2025', icon: 'shield' },
  { id: 'D9', title: 'Equipment Invoice', type: 'Subsidy', status: 'expired', uploadedAt: '01 Nov 2024', icon: 'receipt_long' },
];

export const PAYMENTS = [
  {
    id: 'P1',
    scheme: 'Seed Subsidy (Soybean)',
    amount: '₹4,500.00',
    txnId: 'DBT-MH-2026-882341',
    status: 'credited',
    date: '08 May 2026',
  },
  {
    id: 'P2',
    scheme: 'Micro Irrigation (Drip)',
    amount: '₹62,000.00',
    txnId: '—',
    status: 'processing',
    date: '—',
  },
  {
    id: 'P3',
    scheme: 'Farm Mechanization',
    amount: '₹38,200.00',
    txnId: 'DBT-MH-2026-771902',
    status: 'awaiting',
    date: '—',
  },
];

export const PAYMENT_FAILURES = [
  {
    id: 'F1',
    title: 'Aadhaar inactive at UIDAI',
    detail: 'DBT credit blocked until Aadhaar is active and seeded.',
    code: 'UID-AADHAAR-INACTIVE',
  },
  {
    id: 'F2',
    title: 'Bank account not mapped to Aadhaar',
    detail: 'NPCI mapping failed — visit bank branch with Aadhaar seeding form.',
    code: 'NPCI-NOT-MAPPED',
  },
  {
    id: 'F3',
    title: 'eKYC pending for nominee update',
    detail: 'Complete video eKYC to release hold on secondary beneficiary.',
    code: 'EKYC-PENDING',
  },
  {
    id: 'F4',
    title: 'Name mismatch with bank records',
    detail: 'Bank passbook name differs from Aadhaar — upload corrected passbook.',
    code: 'BANK-MISMATCH',
  },
];

export const NOTIFICATIONS = [
  {
    id: 'N1',
    type: 'application',
    title: 'Application APP-2026-004521',
    body: 'Forwarded to Taluka Agriculture Officer for field verification.',
    time: '2h ago',
    unread: true,
    priority: 'normal',
  },
  {
    id: 'N2',
    type: 'document',
    title: 'Income Certificate rejected',
    body: 'Reason: Income slab not legible. Please re-upload clear scan.',
    time: '1d ago',
    unread: true,
    priority: 'high',
  },
  {
    id: 'N3',
    type: 'payment',
    title: 'Payment credited',
    body: 'Seed Subsidy ₹4,500 credited to ****3210.',
    time: '3d ago',
    unread: false,
    priority: 'normal',
  },
  {
    id: 'N4',
    type: 'scheme',
    title: 'Scheme deadline',
    body: 'Micro Irrigation — last date 30 Jun 2026.',
    time: '5d ago',
    unread: false,
    priority: 'low',
  },
];

export const GRIEVANCES = [
  {
    id: 'G-9081',
    subject: 'Correction in 7/12 survey area',
    status: 'Under review',
    raisedOn: '28 Apr 2026',
    escalation: 'Taluka level',
  },
];
