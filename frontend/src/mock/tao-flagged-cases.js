/**
 * Mock flagged applications for TAO "Application Verification Layer".
 * Invisible pipeline only — no user-facing labels for capture or parsing tech.
 */

export const mockFlaggedCases = [
  {
    id: 'APL-0101',
    farmer_name: 'Ram Patil',
    scheme: 'Drip Irrigation Subsidy',
    village: 'Wadgaon',
    survey_number: '123/A',
    submitted: '12 May 2026',
    risk_score: 82,
    risk_level: 'high_risk',
    fraud_type: 'duplicate_invoice',
    verification_chips: [
      { label: 'Aadhaar Mismatch', status: 'failed', critical: true },
      { label: 'Duplicate Invoice', status: 'failed', critical: true },
      { label: 'Survey Verified', status: 'passed', critical: false },
      { label: 'Bank Inactive', status: 'failed', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Ram Patil',
      survey_number: '123/A',
      village: 'Wadgaon',
      bank_account: '0011223344',
      ifsc: 'SBIN0001234',
      invoice_amount: '₹48,000',
      gst_number: '27AABCS1234A1Z5',
    },
    risk_factors: [
      'Duplicate invoice — used in APL-0092',
      'Aadhaar name does not match land records',
      'Bank account inactive',
    ],
    documents: ['Aadhaar', 'Satbara', 'Invoice', 'Bank Passbook'],
    duplicate_reference: 'APL-0092',
    invoice_number: 'A102',
    dealer_name: 'Agro Suppliers Pune',
    gst_number: '27AABCS1234A1Z5',
    invoice_amount_value: '₹48,000',
    duplicate_alert_text: 'This invoice was used in application #APL-0092',
  },
  {
    id: 'APL-0092',
    farmer_name: 'Suresh Kolekar',
    scheme: 'Drip Irrigation Subsidy',
    village: 'Koregaon',
    survey_number: '88/B',
    submitted: '03 May 2026',
    risk_score: 76,
    risk_level: 'high_risk',
    fraud_type: 'duplicate_invoice',
    verification_chips: [
      { label: 'Invoice Reuse', status: 'failed', critical: true },
      { label: 'GST Verified', status: 'passed', critical: false },
      { label: 'Survey Verified', status: 'passed', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Suresh Kolekar',
      survey_number: '88/B',
      village: 'Koregaon',
      bank_account: '9988776655',
      ifsc: 'HDFC0002144',
      invoice_amount: '₹48,000',
      gst_number: '27AABCS1234A1Z5',
    },
    risk_factors: ['Same invoice number as APL-0101', 'Dealer concentration in Koregaon'],
    documents: ['Aadhaar', 'Invoice', 'Satbara'],
    duplicate_reference: 'APL-0101',
    invoice_number: 'A102',
    dealer_name: 'Agro Suppliers Pune',
    gst_number: '27AABCS1234A1Z5',
    invoice_amount_value: '₹48,000',
    duplicate_alert_text: 'Linked counterpart application APL-0101',
  },
  {
    id: 'APL-0144',
    farmer_name: 'Sunita Mane',
    scheme: 'Bhade Khat Scheme',
    village: 'Loni Kalbhor',
    survey_number: '456/B',
    submitted: '28 Apr 2026',
    risk_score: 91,
    risk_level: 'high_risk',
    fraud_type: 'bhade_khat',
    verification_chips: [
      { label: 'Stamp Serial Reuse', status: 'failed', critical: true },
      { label: 'Signature Missing', status: 'failed', critical: true },
      { label: 'Owner Match', status: 'failed', critical: true },
    ],
    extracted_fields: {
      farmer_name: 'Sunita Mane',
      survey_number: '456/B',
      village: 'Loni Kalbhor',
      bank_account: '3322114455',
      ifsc: 'MAHB0000987',
      invoice_amount: '—',
      gst_number: '—',
    },
    risk_factors: ['Stamp serial appears on multiple applications', 'Owner / tenant name divergence'],
    documents: ['Bhade Khat', 'Aadhaar', 'Satbara'],
    bhade_khat: {
      tenant: 'Ram Patil',
      owner: 'Shivaji Mane',
      survey: '456/B',
      stamp_serial: 'MH-2024-00123',
      duplicate_stamp_note: 'Serial MH-2024-00123 used in 3 applications',
    },
  },
  {
    id: 'APL-0160',
    farmer_name: 'Vijay Jadhav',
    scheme: 'Bhade Khat Scheme',
    village: 'Madha',
    survey_number: '201/C',
    submitted: '01 May 2026',
    risk_score: 68,
    risk_level: 'high_risk',
    fraud_type: 'bhade_khat',
    verification_chips: [
      { label: 'Stamp Serial Reuse', status: 'failed', critical: true },
      { label: 'Notarization', status: 'passed', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Vijay Jadhav',
      survey_number: '201/C',
      village: 'Madha',
      bank_account: '5544332211',
      ifsc: 'SBIN0004455',
      invoice_amount: '—',
      gst_number: '—',
    },
    risk_factors: ['Same stamp serial cluster as Loni Kalbhor batch'],
    documents: ['Bhade Khat', 'Satbara'],
    bhade_khat: {
      tenant: 'Vijay Jadhav',
      owner: 'Prakash Jadhav',
      survey: '201/C',
      stamp_serial: 'MH-2024-00123',
      duplicate_stamp_note: 'Serial MH-2024-00123 used in 3 applications',
    },
  },
  {
    id: 'APL-0145',
    farmer_name: 'Kiran Bhosale',
    scheme: 'Soybean Seed Subsidy',
    village: 'Pandharpur',
    survey_number: '12/3',
    submitted: '08 May 2026',
    risk_score: 73,
    risk_level: 'high_risk',
    fraud_type: 'geo_duplicate',
    verification_chips: [
      { label: 'Duplicate Geo-tag', status: 'failed', critical: true },
      { label: 'Timestamp Duplicate', status: 'failed', critical: true },
      { label: 'Crop Area', status: 'unknown', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Kiran Bhosale',
      survey_number: '12/3',
      village: 'Pandharpur',
      bank_account: '6677889900',
      ifsc: 'BARB0PANDHR',
      invoice_amount: '—',
      gst_number: '—',
    },
    risk_factors: ['Identical coordinates across two field photos', 'Same capture timestamp'],
    documents: ['Field Photo A', 'Field Photo B', 'Aadhaar'],
    geo_duplicate: {
      image1_gps: '17.6834°N, 75.9064°E',
      image2_gps: '17.6834°N, 75.9064°E',
      ts1: '2026-03-12 10:22 AM',
      ts2: '2026-03-12 10:22 AM',
      duplicate_photo_ref: 'APL-0199',
      same_as_app: 'Identical geo-tag: same photo used in APL-0199',
    },
  },
  {
    id: 'APL-0188',
    farmer_name: 'Meena Shinde',
    scheme: 'PM Kisan Equipment Grant',
    village: 'Sangola',
    survey_number: '44/D',
    submitted: '10 May 2026',
    risk_score: 64,
    risk_level: 'high_risk',
    fraud_type: 'bank_inactive',
    verification_chips: [
      { label: 'Account Inactive', status: 'failed', critical: true },
      { label: 'IFSC Valid', status: 'passed', critical: false },
      { label: 'Name Match', status: 'unknown', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Meena Shinde',
      survey_number: '44/D',
      village: 'Sangola',
      bank_account: '0011223344',
      ifsc: 'SBIN0001234',
      invoice_amount: '₹32,000',
      gst_number: '—',
    },
    risk_factors: ['Beneficiary account marked inactive', 'No recent transactions on record'],
    documents: ['Bank Passbook', 'Aadhaar', 'Invoice'],
    bank_inactive: {
      account: '0011223344',
      ifsc: 'SBIN0001234',
      bank: 'State Bank of India',
      status_label: 'INACTIVE',
      last_transaction: 'None on record',
    },
  },
  {
    id: 'APL-0202',
    farmer_name: 'Anil Raut',
    scheme: 'Drip Irrigation Subsidy',
    village: 'Barshi',
    survey_number: '501/E',
    submitted: '11 May 2026',
    risk_score: 79,
    risk_level: 'high_risk',
    fraud_type: 'suspicious_pricing',
    verification_chips: [
      { label: 'Abnormal Amount', status: 'failed', critical: true },
      { label: 'GST Valid', status: 'passed', critical: false },
      { label: 'Dealer Verified', status: 'unknown', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Anil Raut',
      survey_number: '501/E',
      village: 'Barshi',
      bank_account: '8877665544',
      ifsc: 'ICIC0002211',
      invoice_amount: '₹1,20,000',
      gst_number: '27AABCU8899A1Z1',
    },
    risk_factors: ['Quotation far above district average for drip kit', 'Dealer not in verified vendor list'],
    documents: ['Invoice', 'Aadhaar', 'Satbara'],
    suspicious_pricing: {
      invoice_amount: '₹1,20,000',
      scheme_average: '₹35,000',
      deviation_pct: '+243%',
      dealer: 'XYZ Agro Pvt Ltd',
      abnormal_note: '3.4x above district average',
    },
  },
  {
    id: 'APL-0211',
    farmer_name: 'Pandurang Wagh',
    scheme: 'Solar Pump Subsidy',
    village: 'Mohol',
    survey_number: '90/F',
    submitted: '09 May 2026',
    risk_score: 71,
    risk_level: 'high_risk',
    fraud_type: 'satbara_mismatch',
    verification_chips: [
      { label: 'Satbara Stale', status: 'failed', critical: true },
      { label: 'Owner Mismatch', status: 'failed', critical: true },
      { label: 'Mutation', status: 'unknown', critical: false },
    ],
    extracted_fields: {
      farmer_name: 'Pandurang Wagh',
      survey_number: '90/F',
      village: 'Mohol',
      bank_account: '2233445566',
      ifsc: 'CBIN0284444',
      invoice_amount: '₹62,000',
      gst_number: '27AABCP4455B1Z2',
    },
    risk_factors: ['Land record owner differs from submitted Satbara', 'Satbara older than policy window'],
    documents: ['Satbara', 'Mutation note', 'Aadhaar'],
    satbara_mismatch: {
      satbara_issue_date: '2018-06-15',
      current_owner: 'Suresh Patil',
      document_owner: 'Ram Patil',
      mutation_note: 'Land may have changed ownership since document issue',
    },
  },
];

export function countCasesByFilter(cases, filterId) {
  if (filterId === 'all') return cases.length;
  if (filterId === 'high_risk') {
    return cases.filter((c) => c.risk_score >= 51 || c.risk_level === 'high_risk').length;
  }
  if (filterId === 'invoice_fraud') {
    return cases.filter((c) => c.fraud_type === 'duplicate_invoice' || c.fraud_type === 'suspicious_pricing').length;
  }
  if (filterId === 'bhade_khat') return cases.filter((c) => c.fraud_type === 'bhade_khat').length;
  if (filterId === 'geo_tag') return cases.filter((c) => c.fraud_type === 'geo_duplicate').length;
  if (filterId === 'bank_issues') return cases.filter((c) => c.fraud_type === 'bank_inactive').length;
  return cases.length;
}

export function filterCases(cases, filterId) {
  if (filterId === 'all') return cases;
  if (filterId === 'high_risk') {
    return cases.filter((c) => c.risk_score >= 51 || c.risk_level === 'high_risk');
  }
  if (filterId === 'invoice_fraud') {
    return cases.filter((c) => c.fraud_type === 'duplicate_invoice' || c.fraud_type === 'suspicious_pricing');
  }
  if (filterId === 'bhade_khat') return cases.filter((c) => c.fraud_type === 'bhade_khat');
  if (filterId === 'geo_tag') return cases.filter((c) => c.fraud_type === 'geo_duplicate');
  if (filterId === 'bank_issues') return cases.filter((c) => c.fraud_type === 'bank_inactive');
  return cases;
}
