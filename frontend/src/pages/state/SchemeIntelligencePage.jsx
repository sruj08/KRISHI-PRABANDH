import React, { useState, useEffect, useRef, useCallback } from 'react';
import './scheme-intelligence.css';

/* ─── STATIC DATA ──────────────────────────────────────────────────────────── */

const SCHEMES_BASE = [
  {
    id: 'pmkisan', name: 'PM-KISAN', category: 'Income Support',
    budget: '₹1,840 Cr', beneficiaries: 1840000, benLabel: '18.4 L',
    approval: { '2025-26': { both: 74, kharif: 76, rabi: 71 }, '2024-25': { both: 69, kharif: 71, rabi: 67 }, '2023-24': { both: 63, kharif: 65, rabi: 61 } },
    exclusion: 18, utilisation: 67,
    topDistricts: ['Solapur', 'Beed', 'Nashik'],
    trend: [62, 65, 68, 70, 67, 74],
    exclusionCauses: [
      { cause: 'Aadhaar–bank mapping failure', count: 2843, pct: 38 },
      { cause: 'Inactive Aadhaar records', count: 1204, pct: 16 },
      { cause: 'Land record mismatch', count: 1891, pct: 25 },
      { cause: 'Duplicate applications', count: 744, pct: 10 },
      { cause: 'Bank account inactive', count: 812, pct: 11 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 41 }, { cat: 'SC', pct: 18 }, { cat: 'ST', pct: 12 }, { cat: 'General', pct: 22 }, { cat: 'NT', pct: 7 }],
    fieldFeedback: [
      'Aadhaar linking camps unavailable in interior talukas of Marathwada',
      'Internet connectivity issues in Osmanabad delaying e-KYC',
      'Land mutation delays in Beed causing eligibility rejections',
      'Farmers unaware of revised income ceiling of ₹1.5L',
    ],
    aiRec: 'Conduct targeted Aadhaar-bank seeding camps in Solapur and Osmanabad. 2,843 exclusions are recoverable with one concentrated drive.',
  },
  {
    id: 'pmfby', name: 'PMFBY', category: 'Crop Insurance',
    budget: '₹2,210 Cr', beneficiaries: 2340000, benLabel: '23.4 L',
    approval: { '2025-26': { both: 68, kharif: 72, rabi: 63 }, '2024-25': { both: 62, kharif: 66, rabi: 58 }, '2023-24': { both: 57, kharif: 60, rabi: 54 } },
    exclusion: 22, utilisation: 58,
    topDistricts: ['Vidarbha belt', 'Barshi', 'Yavatmal'],
    trend: [55, 58, 61, 64, 59, 68],
    exclusionCauses: [
      { cause: 'Survey not conducted in time', count: 3210, pct: 34 },
      { cause: 'Geo-verification failure', count: 1842, pct: 20 },
      { cause: 'Late premium payment', count: 2100, pct: 22 },
      { cause: 'Crop mismatch with e-Crop', count: 1240, pct: 13 },
      { cause: 'Bank remittance failure', count: 1044, pct: 11 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 38 }, { cat: 'SC', pct: 14 }, { cat: 'ST', pct: 16 }, { cat: 'General', pct: 24 }, { cat: 'NT', pct: 8 }],
    fieldFeedback: [
      'Survey teams delayed post-rainfall in Yavatmal',
      'Crop loss assessment not aligned with satellite data in Barshi circle',
      'Rejection rate unusually high in Barshi - officer escalation needed',
    ],
    aiRec: 'Cross-district PMFBY anomalies elevated in western cluster. Schedule Aadhaar and land-record reconciliation before next claim window.',
  },
  {
    id: 'soyabean', name: 'Soyabean Compensation', category: 'Crop Loss Relief',
    budget: '₹412 Cr', beneficiaries: 640000, benLabel: '6.4 L',
    approval: { '2025-26': { both: 59, kharif: 59, rabi: 58 }, '2024-25': { both: 52, kharif: 52, rabi: 51 }, '2023-24': { both: 44, kharif: 44, rabi: 43 } },
    exclusion: 31, utilisation: 43,
    topDistricts: ['Marathwada', 'Osmanabad', 'Latur'],
    trend: [40, 42, 48, 52, 46, 59],
    exclusionCauses: [
      { cause: 'Land ownership mismatch', count: 4120, pct: 41 },
      { cause: 'Khata number not linked', count: 2408, pct: 24 },
      { cause: 'Duplicate khata detected', count: 1640, pct: 16 },
      { cause: 'Payment remittance failure', count: 1180, pct: 12 },
      { cause: 'Geo-tag out of boundary', count: 712, pct: 7 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 44 }, { cat: 'SC', pct: 12 }, { cat: 'ST', pct: 10 }, { cat: 'General', pct: 26 }, { cat: 'NT', pct: 8 }],
    fieldFeedback: [
      'Ownership records not updated after land partition in Osmanabad',
      'Many farmers on leased land cannot enroll',
      'Inadequate awareness of application deadline',
    ],
    aiRec: '67% of Soyabean rejections in Solapur are due to Aadhaar-bank mapping issues. Targeted correction camps can recover ~4,120 eligible farmers.',
  },
  {
    id: 'drip', name: 'Drip Irrigation Subsidy', category: 'Farm Infrastructure',
    budget: '₹318 Cr', beneficiaries: 284000, benLabel: '2.84 L',
    approval: { '2025-26': { both: 82, kharif: 83, rabi: 80 }, '2024-25': { both: 76, kharif: 77, rabi: 75 }, '2023-24': { both: 70, kharif: 71, rabi: 69 } },
    exclusion: 11, utilisation: 79,
    topDistricts: ['Nashik', 'Pune', 'Sangli'],
    trend: [68, 71, 75, 79, 80, 82],
    exclusionCauses: [
      { cause: 'Land holding below threshold', count: 980, pct: 42 },
      { cause: 'Vendor not empanelled', count: 640, pct: 28 },
      { cause: 'Application incomplete', count: 480, pct: 21 },
      { cause: 'Duplicate claim detected', count: 210, pct: 9 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 36 }, { cat: 'SC', pct: 10 }, { cat: 'ST', pct: 6 }, { cat: 'General', pct: 38 }, { cat: 'NT', pct: 10 }],
    fieldFeedback: [
      'Subsidy approval turnaround improved in Nashik division',
      'Small & marginal farmers (<1 ha) excluded by eligibility criteria',
    ],
    aiRec: 'High approval rate - consider scaling to drought belts in Marathwada where marginal farmers remain excluded.',
  },
  {
    id: 'solar', name: 'Solar Pump Scheme', category: 'Renewable Energy',
    budget: '₹524 Cr', beneficiaries: 380000, benLabel: '3.8 L',
    approval: { '2025-26': { both: 71, kharif: 72, rabi: 70 }, '2024-25': { both: 65, kharif: 66, rabi: 64 }, '2023-24': { both: 58, kharif: 59, rabi: 57 } },
    exclusion: 16, utilisation: 62,
    topDistricts: ['Amravati', 'Akola', 'Buldana'],
    trend: [50, 55, 60, 63, 67, 71],
    exclusionCauses: [
      { cause: 'Grid power already available', count: 2140, pct: 44 },
      { cause: 'Land not irrigable', count: 1240, pct: 26 },
      { cause: 'Aadhaar link missing', count: 980, pct: 20 },
      { cause: 'Waiting list backlog', count: 480, pct: 10 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 40 }, { cat: 'SC', pct: 16 }, { cat: 'ST', pct: 18 }, { cat: 'General', pct: 18 }, { cat: 'NT', pct: 8 }],
    fieldFeedback: [
      'Strong demand in Vidarbha - waiting list exceeds supply by 40%',
      'ST farmers disproportionately benefitting - positive for tribal belts',
    ],
    aiRec: 'Increase solar pump allocations for Vidarbha. Demand exceeds supply by 40%; prioritise ST/SC farmers in tribal talukas.',
  },
  {
    id: 'seed', name: 'Seed Subsidy', category: 'Input Support',
    budget: '₹186 Cr', beneficiaries: 890000, benLabel: '8.9 L',
    approval: { '2025-26': { both: 88, kharif: 89, rabi: 87 }, '2024-25': { both: 84, kharif: 85, rabi: 83 }, '2023-24': { both: 79, kharif: 80, rabi: 78 } },
    exclusion: 8, utilisation: 84,
    topDistricts: ['Vidarbha', 'Marathwada', 'North MH'],
    trend: [78, 80, 83, 85, 87, 88],
    exclusionCauses: [
      { cause: 'Crop season mismatch', count: 640, pct: 51 },
      { cause: 'Variety not approved', count: 380, pct: 30 },
      { cause: 'Retailer not registered', count: 240, pct: 19 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 42 }, { cat: 'SC', pct: 16 }, { cat: 'ST', pct: 14 }, { cat: 'General', pct: 20 }, { cat: 'NT', pct: 8 }],
    fieldFeedback: [
      'High uptake - Sahayaks report strong on-ground awareness',
      'Minor supply-chain delays in tribal talukas',
    ],
    aiRec: 'Best-performing scheme. Replicate its awareness and logistics approach to underperforming Solar and Soyabean schemes.',
  },
  {
    id: 'farmMech', name: 'Farm Mechanization', category: 'Equipment Subsidy',
    budget: '₹298 Cr', beneficiaries: 420000, benLabel: '4.2 L',
    approval: { '2025-26': { both: 65, kharif: 67, rabi: 63 }, '2024-25': { both: 59, kharif: 61, rabi: 57 }, '2023-24': { both: 53, kharif: 55, rabi: 51 } },
    exclusion: 24, utilisation: 54,
    topDistricts: ['Pune', 'Ahmednagar', 'Kolhapur'],
    trend: [48, 52, 57, 60, 62, 65],
    exclusionCauses: [
      { cause: 'CHC registration missing', count: 1840, pct: 38 },
      { cause: 'Duplicate CHC application', count: 1240, pct: 26 },
      { cause: 'Equipment vendor blacklisted', count: 840, pct: 17 },
      { cause: 'Land holding mismatch', count: 920, pct: 19 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 38 }, { cat: 'SC', pct: 12 }, { cat: 'ST', pct: 8 }, { cat: 'General', pct: 32 }, { cat: 'NT', pct: 10 }],
    fieldFeedback: [
      'CHC receipt irregularities flagged in Pune division - cross-reference with TAO records',
      'Multiple equipment grants to same entities detected',
    ],
    aiRec: 'CHC irregularities in Pune division require TAO escalation. Cross-reference machinery grant records with Aadhaar and Khata data.',
  },
  {
    id: 'soilhealth', name: 'Soil Health Card', category: 'Soil Management',
    budget: '₹94 Cr', beneficiaries: 1120000, benLabel: '11.2 L',
    approval: { '2025-26': { both: 91, kharif: 91, rabi: 90 }, '2024-25': { both: 87, kharif: 88, rabi: 87 }, '2023-24': { both: 83, kharif: 84, rabi: 82 } },
    exclusion: 5, utilisation: 88,
    topDistricts: ['All 36 Districts'],
    trend: [80, 84, 86, 88, 90, 91],
    exclusionCauses: [
      { cause: 'Lab capacity exceeded', count: 1240, pct: 62 },
      { cause: 'Sample not collected', count: 480, pct: 24 },
      { cause: 'Land not registered', count: 280, pct: 14 },
    ],
    casteSplit: [{ cat: 'OBC', pct: 40 }, { cat: 'SC', pct: 16 }, { cat: 'ST', pct: 14 }, { cat: 'General', pct: 22 }, { cat: 'NT', pct: 8 }],
    fieldFeedback: [
      'Testing lab capacity is the primary bottleneck',
      'Mobile soil testing vans have improved rural coverage significantly',
    ],
    aiRec: 'Excellent penetration. Scale mobile testing van model - proven effective in bridging lab capacity gaps across tribal regions.',
  },
];

const ALL_DISTRICTS = [
  { name: 'Solapur',         div: 'Pune',     pen: 38, excl: 31, griev: 143, rain: 61.9, risk: 'high',   cause: 'Payment failures + Aadhaar mapping' },
  { name: 'Osmanabad',       div: 'CSN',      pen: 34, excl: 28, griev: 98,  rain: 64.2, risk: 'high',   cause: 'Verification backlog + rain deficit' },
  { name: 'Beed',            div: 'CSN',      pen: 41, excl: 25, griev: 87,  rain: 67.8, risk: 'medium', cause: 'Rainfall deficit + land records' },
  { name: 'Latur',           div: 'CSN',      pen: 44, excl: 22, griev: 74,  rain: 70.1, risk: 'medium', cause: 'Compensation delays' },
  { name: 'Nanded',          div: 'CSN',      pen: 47, excl: 19, griev: 62,  rain: 72.4, risk: 'medium', cause: 'Survey backlogs' },
  { name: 'Yavatmal',        div: 'Amravati', pen: 43, excl: 24, griev: 91,  rain: 68.5, risk: 'high',   cause: 'Cotton crop stress + PMFBY gaps' },
  { name: 'Amravati',        div: 'Amravati', pen: 52, excl: 18, griev: 58,  rain: 74.2, risk: 'medium', cause: 'Aadhaar seeding pending' },
  { name: 'Akola',           div: 'Amravati', pen: 55, excl: 16, griev: 44,  rain: 76.8, risk: 'low',    cause: 'Minor backlog' },
  { name: 'Washim',          div: 'Amravati', pen: 49, excl: 20, griev: 52,  rain: 71.3, risk: 'medium', cause: 'Solar demand excess' },
  { name: 'Buldana',         div: 'Amravati', pen: 58, excl: 14, griev: 38,  rain: 78.4, risk: 'low',    cause: 'Minor processing delay' },
  { name: 'Nashik',          div: 'Nashik',   pen: 67, excl: 11, griev: 31,  rain: 84.6, risk: 'low',    cause: 'Minor exclusions' },
  { name: 'Dhule',           div: 'Nashik',   pen: 48, excl: 21, griev: 67,  rain: 69.3, risk: 'medium', cause: 'Land record disputes' },
  { name: 'Nandurbar',       div: 'Nashik',   pen: 44, excl: 23, griev: 72,  rain: 67.1, risk: 'high',   cause: 'Tribal exclusion + ST gaps' },
  { name: 'Jalgaon',         div: 'Nashik',   pen: 61, excl: 13, griev: 28,  rain: 81.2, risk: 'low',    cause: 'Minor delays' },
  { name: 'Ahmednagar',      div: 'Pune',     pen: 59, excl: 15, griev: 35,  rain: 79.4, risk: 'low',    cause: 'Pending survey completion' },
  { name: 'Pune',            div: 'Pune',     pen: 72, excl: 9,  griev: 22,  rain: 88.7, risk: 'low',    cause: 'Urban edge cases' },
  { name: 'Satara',          div: 'Pune',     pen: 64, excl: 12, griev: 29,  rain: 82.1, risk: 'low',    cause: 'Minor exclusions' },
  { name: 'Sangli',          div: 'Pune',     pen: 68, excl: 10, griev: 24,  rain: 85.3, risk: 'low',    cause: 'Mostly compliant' },
  { name: 'Kolhapur',        div: 'Pune',     pen: 71, excl: 9,  griev: 19,  rain: 87.2, risk: 'low',    cause: 'Good coverage' },
  { name: 'Nagpur',          div: 'Nagpur',   pen: 66, excl: 12, griev: 27,  rain: 83.4, risk: 'low',    cause: 'Minor backlogs' },
  { name: 'Wardha',          div: 'Nagpur',   pen: 60, excl: 15, griev: 36,  rain: 79.8, risk: 'low',    cause: 'Cotton survey delay' },
  { name: 'Chandrapur',      div: 'Nagpur',   pen: 57, excl: 16, griev: 42,  rain: 77.2, risk: 'medium', cause: 'Forest land ambiguity' },
  { name: 'Gadchiroli',      div: 'Nagpur',   pen: 39, excl: 29, griev: 88,  rain: 65.4, risk: 'high',   cause: 'Tribal exclusion + remote gaps' },
  { name: 'Gondia',          div: 'Nagpur',   pen: 54, excl: 17, griev: 41,  rain: 75.6, risk: 'medium', cause: 'Minor land issues' },
  { name: 'Bhandara',        div: 'Nagpur',   pen: 62, excl: 13, griev: 30,  rain: 81.6, risk: 'low',    cause: 'Mostly compliant' },
  { name: 'Aurangabad',      div: 'CSN',      pen: 56, excl: 17, griev: 46,  rain: 76.4, risk: 'medium', cause: 'Urban-rural disparity' },
  { name: 'Jalna',           div: 'CSN',      pen: 45, excl: 22, griev: 71,  rain: 68.9, risk: 'medium', cause: 'Survey backlog' },
  { name: 'Parbhani',        div: 'CSN',      pen: 42, excl: 26, griev: 82,  rain: 66.2, risk: 'high',   cause: 'Cotton + soyabean dual stress' },
  { name: 'Hingoli',         div: 'CSN',      pen: 46, excl: 21, griev: 63,  rain: 69.8, risk: 'medium', cause: 'Payment delays' },
  { name: 'Raigad',          div: 'Konkan',   pen: 63, excl: 12, griev: 26,  rain: 82.8, risk: 'low',    cause: 'Minor issues' },
  { name: 'Ratnagiri',       div: 'Konkan',   pen: 68, excl: 10, griev: 18,  rain: 87.4, risk: 'low',    cause: 'Good coverage' },
  { name: 'Sindhudurg',      div: 'Konkan',   pen: 66, excl: 11, griev: 21,  rain: 85.6, risk: 'low',    cause: 'Good coverage' },
  { name: 'Thane',           div: 'Konkan',   pen: 58, excl: 14, griev: 33,  rain: 78.9, risk: 'low',    cause: 'Urban-rural boundary' },
  { name: 'Palghar',         div: 'Konkan',   pen: 47, excl: 20, griev: 58,  rain: 70.4, risk: 'medium', cause: 'Tribal ST access gaps' },
  { name: 'Malegaon cluster',div: 'Nashik',   pen: 36, excl: 32, griev: 118, rain: 63.4, risk: 'high',   cause: 'Inactive Aadhaar concentration' },
];

const DIVISIONS = ['All Divisions', 'Pune', 'Nashik', 'CSN', 'Amravati', 'Nagpur', 'Konkan'];
const FY_OPTIONS = ['2025-26', '2024-25', '2023-24'];
const SEASON_OPTIONS = [
  { key: 'both', label: 'Kharif + Rabi' },
  { key: 'kharif', label: 'Kharif' },
  { key: 'rabi', label: 'Rabi' },
];

const AI_POLICY_RECS = [
  { icon: 'priority_high', severity: 'critical', title: 'Aadhaar correction drive - Solapur & Osmanabad', body: '2,843 PM-KISAN exclusions are recoverable. A single targeted Aadhaar-bank seeding camp can unblock ₹62 Cr in withheld benefits.', action: 'Issue District Directive' },
  { icon: 'warning', severity: 'high', title: 'PMFBY rejection spike in Barshi circle', body: 'Rejection rate is 31% above divisional average. Survey team deployment and crop-data reconciliation needed before next claim window.', action: 'Escalate to Division' },
  { icon: 'warning', severity: 'high', title: 'Inactive Aadhaar cluster - Malegaon', body: '1,204 inactive Aadhaar records concentrated in Malegaon block. Reactivation camp required before Rabi enrollment opens.', action: 'Schedule Camp' },
  { icon: 'info', severity: 'medium', title: 'Increase PMFBY awareness in drought zones', body: 'Only 34% penetration in Yavatmal and Osmanabad despite 100% eligibility. Krishi Sahayak awareness drives recommended.', action: 'Issue Advisory' },
  { icon: 'info', severity: 'low', title: 'Scale Seed Subsidy model to underperformers', body: 'Seed Subsidy shows 88% approval - highest in portfolio. Replicate its awareness and logistics approach for Solar Pump and Soyabean schemes.', action: 'Policy Review' },
];

const GRIEVANCE_FEED = [
  { id: 1, text: '143 farmers reported PM-KISAN payment delay in Solapur', time: '12 min ago', tag: 'Payment', sev: 'high' },
  { id: 2, text: 'Multiple land verification complaints in Barshi - PMFBY', time: '34 min ago', tag: 'Verification', sev: 'high' },
  { id: 3, text: 'PM-KISAN rejection spike detected in Malegaon drought circle', time: '1 hr ago', tag: 'Rejection', sev: 'critical' },
  { id: 4, text: 'Survey not conducted - 87 farmers, Osmanabad taluka', time: '2 hr ago', tag: 'Survey', sev: 'medium' },
  { id: 5, text: 'Compensation insufficient - Yavatmal cotton farmers (64 cases)', time: '3 hr ago', tag: 'Compensation', sev: 'medium' },
  { id: 6, text: 'Krishi Sahayak unavailable - 3 mandals, Nandurbar district', time: '4 hr ago', tag: 'Field Ops', sev: 'medium' },
  { id: 7, text: 'Bank account inactive - 212 PMFBY beneficiaries, Parbhani', time: '5 hr ago', tag: 'Banking', sev: 'medium' },
  { id: 8, text: 'Aadhaar linking camp cancelled - Latur block', time: '6 hr ago', tag: 'Aadhaar', sev: 'low' },
];

/* ─── EXPORT CSV ────────────────────────────────────────────────────────────── */
function exportReport(fy, season, division, schemes) {
  const rows = [
    ['Scheme Intelligence Command Centre - Maharashtra Government'],
    [`Report: FY ${fy} | Season: ${season} | Division: ${division}`],
    [`Generated: ${new Date().toLocaleString('en-IN')}`],
    [],
    ['SCHEME', 'CATEGORY', 'BUDGET', 'BENEFICIARIES', 'APPROVAL RATE (%)', 'EXCLUSION RATE (%)', 'BUDGET UTILISED (%)'],
    ...schemes.map(s => [s.name, s.category, s.budget, s.benLabel, s.approvalRate, s.exclusion, s.utilisation]),
    [],
    ['DISTRICT RISK WATCHLIST'],
    ['DISTRICT', 'DIVISION', 'PENETRATION (%)', 'EXCLUSION (%)', 'GRIEVANCES', 'RAINFALL (% NORMAL)', 'RISK LEVEL', 'PRIMARY CAUSE'],
    ...ALL_DISTRICTS.filter(d => division === 'All Divisions' || d.div === division)
      .map(d => [d.name, d.div, d.pen, d.excl, d.griev, d.rain, d.risk.toUpperCase(), d.cause]),
  ];

  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SchemeIntelligence_MH_FY${fy}_${season}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── UI PRIMITIVES ─────────────────────────────────────────────────────────── */

const SparkBar = ({ values = [], color = '#396940', height = 28 }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="si-spark" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="si-spark__bar"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.35 + (i / (values.length - 1)) * 0.65 }} />
      ))}
    </div>
  );
};

const MiniRing = ({ pct, color = '#396940', size = 44, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eaede6" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

const BudgetBar = ({ pct, color = '#396940' }) => (
  <div className="si-budget-bar">
    <div className="si-budget-bar__fill" style={{ width: `${pct}%`, background: color }} />
  </div>
);

/* ─── DROPDOWN ───────────────────────────────────────────────────────────────── */
const Dropdown = ({ icon, label, options, value, onChange, isOpen, onToggle, id }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  return (
    <div className="si-dropdown" ref={ref}>
      <button className={`si-ctrl-btn${isOpen ? ' si-ctrl-btn--open' : ''}`} onClick={() => onToggle(isOpen ? null : id)}>
        <span className="material-symbols-outlined si-ctrl-btn__icon">{icon}</span>
        <span className="si-ctrl-btn__label">{label}</span>
        <span className="material-symbols-outlined si-ctrl-btn__caret">expand_more</span>
      </button>
      {isOpen && (
        <div className="si-dropdown__menu">
          {options.map(opt => {
            const optVal = typeof opt === 'object' ? opt.key : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const isActive = value === optVal;
            return (
              <button key={optVal} className={`si-dropdown__item${isActive ? ' si-dropdown__item--active' : ''}`}
                onClick={() => { onChange(optVal); onToggle(null); }}>
                {isActive && <span className="material-symbols-outlined si-dropdown__check">check</span>}
                {!isActive && <span className="si-dropdown__check-spacer" />}
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── HEATMAP TOGGLE ─────────────────────────────────────────────────────────── */
const HeatToggle = ({ metric, setMetric }) => (
  <div className="si-heat-toggle">
    {[['pen', 'Penetration'], ['excl', 'Exclusion'], ['griev', 'Grievances'], ['rain', 'Rainfall %']].map(([k, lbl]) => (
      <button key={k} className={`si-heat-toggle__btn${metric === k ? ' si-heat-toggle__btn--active' : ''}`} onClick={() => setMetric(k)}>
        {lbl}
      </button>
    ))}
  </div>
);

/* ─── DISTRICT GRID ──────────────────────────────────────────────────────────── */
const DistrictGrid = ({ districts, metric, onHover, hovered, activeDiv }) => {
  const getVal = (d) => ({ pen: d.pen, excl: d.excl, griev: Math.min(d.griev, 150), rain: d.rain }[metric] ?? d.pen);
  const getColor = (d) => {
    if (metric === 'pen') { const v = d.pen; return v < 40 ? '#c72626' : v < 55 ? '#e8902a' : v < 68 ? '#7faa7f' : '#2d6e3e'; }
    if (metric === 'excl') { const v = d.excl; return v > 25 ? '#c72626' : v > 15 ? '#e8902a' : v > 8 ? '#a8b858' : '#2d6e3e'; }
    if (metric === 'griev') { const v = d.griev; return v > 100 ? '#c72626' : v > 60 ? '#e8902a' : v > 30 ? '#a8b858' : '#2d6e3e'; }
    if (metric === 'rain') { const v = d.rain; return v < 65 ? '#c72626' : v < 75 ? '#e8902a' : v < 83 ? '#7faa7f' : '#2d6e3e'; }
    return '#396940';
  };
  const vals = districts.map(getVal);
  const maxVal = Math.max(...vals, 1);

  return (
    <div className="si-district-grid">
      {districts.map(d => {
        const color = getColor(d);
        const intensity = getVal(d) / maxVal;
        const isHov = hovered?.name === d.name;
        const isDimmed = activeDiv !== 'All Divisions' && d.div !== activeDiv;
        return (
          <button key={d.name}
            className={`si-district-cell${isHov ? ' si-district-cell--active' : ''}${isDimmed ? ' si-district-cell--dim' : ''}`}
            style={{ background: color, opacity: isDimmed ? 0.18 : isHov ? 1 : 0.5 + intensity * 0.5, boxShadow: isHov ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined }}
            onMouseEnter={() => onHover(d)} onMouseLeave={() => onHover(null)} aria-label={d.name}>
            <span className="si-district-cell__name">{d.name.split(' ')[0]}</span>
            <span className="si-district-cell__val">{metric === 'griev' ? getVal(d) : `${getVal(d)}%`}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ─── SCHEME CARD ────────────────────────────────────────────────────────────── */
const SchemeCard = ({ s, isSelected, onSelect }) => {
  const rColor = s.approvalRate >= 80 ? '#2d6e3e' : s.approvalRate >= 65 ? '#b8972a' : '#c72626';
  return (
    <button className={`si-scheme-card${isSelected ? ' si-scheme-card--selected' : ''}`} onClick={() => onSelect(isSelected ? null : s.id)}>
      <div className="si-scheme-card__top">
        <div className="si-scheme-card__meta">
          <span className="si-scheme-card__cat">{s.category}</span>
          <h4 className="si-scheme-card__name">{s.name}</h4>
        </div>
        <div className="si-scheme-card__ring-wrap">
          <MiniRing pct={s.approvalRate} color={rColor} size={40} stroke={4} />
          <span className="si-scheme-card__ring-label" style={{ color: rColor }}>{s.approvalRate}%</span>
        </div>
      </div>
      <div className="si-scheme-card__stats">
        <div className="si-scheme-card__stat"><span className="si-scheme-card__sk">Budget</span><span className="si-scheme-card__sv">{s.budget}</span></div>
        <div className="si-scheme-card__stat"><span className="si-scheme-card__sk">Beneficiaries</span><span className="si-scheme-card__sv">{s.benLabel}</span></div>
      </div>
      <div className="si-scheme-card__bar-section">
        <BudgetBar pct={s.utilisation} color={s.utilisation > 70 ? '#2d6e3e' : s.utilisation > 50 ? '#b8972a' : '#c72626'} />
        <div className="si-scheme-card__bar-label">
          <span className="si-scheme-card__sk">Budget utilised</span>
          <span className="si-scheme-card__sv" style={{ color: s.utilisation > 70 ? '#2d6e3e' : s.utilisation > 50 ? '#b8972a' : '#c72626' }}>{s.utilisation}%</span>
        </div>
      </div>
      {isSelected && <div className="si-scheme-card__selected-indicator">▲ Viewing Intelligence Below</div>}
    </button>
  );
};

/* ─── SCHEME DRAWER ──────────────────────────────────────────────────────────── */
const SchemeDrawer = ({ s, onClose }) => {
  const totalExcl = s.exclusionCauses.reduce((a, b) => a + b.count, 0);
  return (
    <div className="si-drawer">
      <div className="si-drawer__header">
        <div>
          <span className="si-drawer__cat">{s.category}</span>
          <h2 className="si-drawer__title">{s.name} - Intelligence Briefing</h2>
        </div>
        <button className="si-drawer__close" onClick={onClose} aria-label="Close drawer">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="si-drawer__body">
        <div className="si-drawer__overview">
          {[
            { k: 'Budget Allocated', v: s.budget },
            { k: 'Beneficiaries', v: s.benLabel },
            { k: 'Approval Rate', v: `${s.approvalRate}%` },
            { k: 'Exclusion Rate', v: `${s.exclusion}%` },
            { k: 'Budget Utilised', v: `${s.utilisation}%` },
          ].map(({ k, v }) => (
            <div key={k} className="si-drawer__ov-item">
              <span className="si-drawer__ov-k">{k}</span>
              <span className="si-drawer__ov-v">{v}</span>
            </div>
          ))}
        </div>
        <div className="si-drawer__grid">
          <div className="si-drawer__section">
            <div className="si-drawer__sec-head">
              <span className="material-symbols-outlined si-drawer__sec-icon">block</span>
              <h3 className="si-drawer__sec-title">Exclusion Analysis</h3>
              <span className="si-drawer__sec-badge">{totalExcl.toLocaleString()} excluded</span>
            </div>
            <p className="si-drawer__sec-note">Eligible farmers excluded due to administrative friction - all recoverable.</p>
            {s.exclusionCauses.map(c => (
              <div key={c.cause} className="si-excl-row">
                <div className="si-excl-row__top">
                  <span className="si-excl-row__label">{c.cause}</span>
                  <span className="si-excl-row__count">{c.count.toLocaleString()}</span>
                </div>
                <div className="si-excl-row__bar"><div className="si-excl-row__fill" style={{ width: `${c.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="si-drawer__section">
            <div className="si-drawer__sec-head">
              <span className="material-symbols-outlined si-drawer__sec-icon">groups</span>
              <h3 className="si-drawer__sec-title">Beneficiary Profile</h3>
            </div>
            <div className="si-caste-grid">
              {s.casteSplit.map(c => (
                <div key={c.cat} className="si-caste-item">
                  <MiniRing pct={c.pct} size={44} stroke={5} color={
                    c.cat === 'SC' ? '#7b3fc4' : c.cat === 'ST' ? '#1a6b8a' : c.cat === 'OBC' ? '#2d6e3e' : c.cat === 'NT' ? '#b8602a' : '#6b7280'
                  } />
                  <span className="si-caste-item__cat">{c.cat}</span>
                  <span className="si-caste-item__pct">{c.pct}%</span>
                </div>
              ))}
            </div>
            <div className="si-drawer__trend-label">Approval trend - 6 seasons</div>
            <SparkBar values={s.trend} color="#396940" height={40} />
          </div>
          <div className="si-drawer__section si-drawer__section--full">
            <div className="si-drawer__sec-head">
              <span className="material-symbols-outlined si-drawer__sec-icon">agriculture</span>
              <h3 className="si-drawer__sec-title">Krishi Sahayak Field Intelligence</h3>
              <span className="si-drawer__sec-badge si-drawer__sec-badge--ai">AI Summarised</span>
            </div>
            <div className="si-field-grid">
              <div className="si-field-issues">
                <div className="si-field-issues__head">Top Field Issues</div>
                <ul className="si-field-issues__list">
                  {s.fieldFeedback.map((f, i) => (
                    <li key={i} className="si-field-issues__item"><span className="si-field-issues__dot" />{f}</li>
                  ))}
                </ul>
              </div>
              <div className="si-ai-rec">
                <div className="si-ai-rec__head">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                  AI Policy Recommendation
                </div>
                <p className="si-ai-rec__body">{s.aiRec}</p>
                <div className="si-ai-rec__districts">
                  <span className="si-ai-rec__label">Most affected:</span>
                  {s.topDistricts.map(d => <span key={d} className="si-ai-rec__tag">{d}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── DISTRICT INFO PANEL ────────────────────────────────────────────────────── */
const DistrictInfo = ({ d }) => {
  if (!d) return (
    <div className="si-map-idle">
      <span className="material-symbols-outlined">touch_app</span>
      Hover any district cell to view live scheme analytics
    </div>
  );
  const riskColor = d.risk === 'high' ? '#c72626' : d.risk === 'medium' ? '#e8902a' : '#2d6e3e';
  return (
    <div className="si-dtip">
      <div className="si-dtip__head">
        <div>
          <span className="si-dtip__name">{d.name}</span>
          <span className="si-dtip__div">{d.div} Division</span>
        </div>
        <span className="si-dtip__risk" style={{ background: `${riskColor}14`, color: riskColor, border: `1px solid ${riskColor}30` }}>
          {d.risk.charAt(0).toUpperCase() + d.risk.slice(1)} Risk
        </span>
      </div>
      <div className="si-dtip__grid">
        {[
          ['Scheme penetration', `${d.pen}%`],
          ['Exclusion rate', `${d.excl}%`],
          ['Active grievances', d.griev],
          ['Rainfall (% of normal)', `${d.rain}%`],
        ].map(([k, v]) => (
          <div key={k} className="si-dtip__row">
            <span className="si-dtip__k">{k}</span>
            <span className="si-dtip__v">{v}</span>
          </div>
        ))}
      </div>
      <div className="si-dtip__cause">{d.cause}</div>
    </div>
  );
};

/* ─── LEGEND ─────────────────────────────────────────────────────────────────── */
const LEGENDS = {
  pen:   [['#2d6e3e', '≥68% - Good'], ['#7faa7f', '55–68% - Fair'], ['#e8902a', '40–55% - Low'], ['#c72626', '<40% - Critical']],
  excl:  [['#2d6e3e', '<8% - Low'], ['#a8b858', '8–15% - Moderate'], ['#e8902a', '15–25% - High'], ['#c72626', '>25% - Critical']],
  griev: [['#2d6e3e', '<30 - Low'], ['#a8b858', '30–60 - Moderate'], ['#e8902a', '60–100 - High'], ['#c72626', '>100 - Critical']],
  rain:  [['#2d6e3e', '>83% - Normal'], ['#7faa7f', '75–83% - Near-normal'], ['#e8902a', '65–75% - Deficient'], ['#c72626', '<65% - Drought']],
};

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────────── */
export default function SchemeIntelligencePage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [hoveredDistrict, setHoveredDistrict]   = useState(null);
  const [heatMetric, setHeatMetric]             = useState('pen');
  const [syncPulse, setSyncPulse]               = useState(false);
  const [openDropdown, setOpenDropdown]         = useState(null);
  const [activeFY, setActiveFY]                 = useState('2025-26');
  const [activeSeason, setActiveSeason]         = useState('both');
  const [activeDivision, setActiveDivision]     = useState('All Divisions');
  const [exportDone, setExportDone]             = useState(false);

  const handleDropdown = useCallback((id) => setOpenDropdown(id), []);

  // Sync pulse
  useEffect(() => {
    const tick = () => { setSyncPulse(true); setTimeout(() => setSyncPulse(false), 1200); };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Derive filtered/computed data
  const schemes = SCHEMES_BASE.map(s => ({
    ...s,
    approvalRate: s.approval[activeFY]?.[activeSeason] ?? s.approval['2025-26'].both,
  }));

  const filteredDistricts = activeDivision === 'All Divisions'
    ? ALL_DISTRICTS
    : ALL_DISTRICTS.filter(d => d.div === activeDivision);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) ?? null;

  const totalBenL = (SCHEMES_BASE.reduce((a, s) => a + s.beneficiaries, 0) / 100000).toFixed(1);
  const highRiskCount = ALL_DISTRICTS.filter(d => d.risk === 'high').length;
  const medRiskCount  = ALL_DISTRICTS.filter(d => d.risk === 'medium').length;
  const totalExcl = 9971;

  const seasonLabel = SEASON_OPTIONS.find(s => s.key === activeSeason)?.label ?? 'Kharif + Rabi';

  const handleExport = () => {
    exportReport(activeFY, seasonLabel, activeDivision, schemes);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  };

  return (
    <div className="si-bleed" onClick={() => openDropdown && setOpenDropdown(null)}>
      <div className="si-root" onClick={e => e.stopPropagation()}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <header className="si-header">
          <div className="si-header__brand">
            <div className="si-header__emblem-wrap">
              <span className="material-symbols-outlined si-header__emblem">hub</span>
            </div>
            <div>
              <h1 className="si-header__title">Scheme Intelligence Command Centre</h1>
              <p className="si-header__sub">AI-driven agricultural welfare monitoring and policy analytics · Maharashtra Government</p>
            </div>
          </div>

          <div className="si-header__controls">
            <Dropdown id="fy" icon="calendar_month" label={`FY ${activeFY}`}
              options={FY_OPTIONS} value={activeFY} onChange={setActiveFY}
              isOpen={openDropdown === 'fy'} onToggle={handleDropdown} />

            <Dropdown id="season" icon="grass" label={seasonLabel}
              options={SEASON_OPTIONS} value={activeSeason} onChange={setActiveSeason}
              isOpen={openDropdown === 'season'} onToggle={handleDropdown} />

            <Dropdown id="division" icon="map" label={activeDivision}
              options={DIVISIONS} value={activeDivision} onChange={setActiveDivision}
              isOpen={openDropdown === 'division'} onToggle={handleDropdown} />

            <div className={`si-sync-badge${syncPulse ? ' si-sync-badge--pulse' : ''}`}>
              <span className="si-sync-badge__dot" />
              Synced · 3 min ago
            </div>

            <div className="si-alert-badge">
              <span className="material-symbols-outlined">warning</span>
              {highRiskCount} Alerts
            </div>

            <button className={`si-export-btn${exportDone ? ' si-export-btn--done' : ''}`} onClick={handleExport}>
              <span className="material-symbols-outlined">{exportDone ? 'check' : 'download'}</span>
              {exportDone ? 'Exported!' : 'Export CSV'}
            </button>
          </div>
        </header>

        {/* ── HERO CARDS ──────────────────────────────────────────────── */}
        <div className="si-hero">
          <div className="si-card si-card--green">
            <div className="si-card__label">
              <span className="material-symbols-outlined">people</span>
              Total Beneficiaries
            </div>
            <div className="si-card__value">{totalBenL} Lakh</div>
            <div className="si-card__delta">↑ 12.4% vs last season</div>
            <SparkBar values={[14.2, 15.1, 15.8, 16.4, 17.1, parseFloat(totalBenL)]} color="rgba(255,255,255,0.9)" height={32} />
            <div className="si-card__foot">36 districts · 8 active schemes</div>
          </div>

          <div className="si-card si-card--amber">
            <div className="si-card__label">
              <span className="material-symbols-outlined">radar</span>
              Scheme Penetration
            </div>
            <div className="si-card__value">42%</div>
            <div className="si-card__delta" style={{ opacity: 0.8 }}>In drought-prone belts · Target: 75%</div>
            <div className="si-card__pills">
              <span className="si-card__pill">8 talukas below threshold</span>
              <span className="si-card__pill">{medRiskCount} districts lagging</span>
            </div>
            <div className="si-card__foot">Marathwada avg 43% · Vidarbha avg 52%</div>
          </div>

          <div className="si-card si-card--red">
            <div className="si-card__label">
              <span className="material-symbols-outlined">person_off</span>
              Exclusion Intelligence
            </div>
            <div className="si-card__value">{totalExcl.toLocaleString()}</div>
            <div className="si-card__delta" style={{ opacity: 0.8 }}>Eligible farmers excluded</div>
            <div className="si-card__pills">
              <span className="si-card__pill">2,843 Aadhaar failures</span>
              <span className="si-card__pill">4,120 land mismatch</span>
              <span className="si-card__pill">1,204 inactive records</span>
            </div>
            <div className="si-card__foot">All recoverable with targeted intervention</div>
          </div>

          <div className="si-card si-card--teal">
            <div className="si-card__label">
              <span className="material-symbols-outlined">auto_awesome</span>
              Farmer Sentiment Pulse
            </div>
            <div className="si-card__sent-bars">
              <div className="si-card__sent-row">
                <span className="si-card__sent-label">Negative</span>
                <div className="si-card__sent-track"><div className="si-card__sent-fill si-card__sent-fill--neg" style={{ width: '34%' }} /></div>
                <span className="si-card__sent-pct">34%</span>
              </div>
              <div className="si-card__sent-row">
                <span className="si-card__sent-label">Positive</span>
                <div className="si-card__sent-track"><div className="si-card__sent-fill si-card__sent-fill--pos" style={{ width: '66%' }} /></div>
                <span className="si-card__sent-pct">66%</span>
              </div>
            </div>
            <div className="si-card__ai-quote">
              "Farmers in Marathwada report delayed verification and Aadhaar linking failures as the primary barriers to scheme access."
            </div>
          </div>
        </div>

        {/* ── MAIN 3-COLUMN ───────────────────────────────────────────── */}
        <div className="si-main">

          {/* LEFT - Schemes */}
          <aside className="si-left">
            <div className="si-section-head">
              <span className="material-symbols-outlined">account_tree</span>
              Active Schemes
              <span className="si-section-head__badge">{schemes.length}</span>
            </div>
            <div className="si-scheme-list">
              {schemes.map(s => (
                <SchemeCard key={s.id} s={s} isSelected={selectedSchemeId === s.id} onSelect={setSelectedSchemeId} />
              ))}
            </div>
          </aside>

          {/* CENTER - Map + Exclusion Engine */}
          <main className="si-center">
            <div className="si-map-shell">
              <div className="si-map-head">
                <div>
                  <div className="si-map-head__title">Maharashtra District Intelligence Map</div>
                  <div className="si-map-head__sub">
                    {activeDivision !== 'All Divisions' ? `Filtered: ${activeDivision} Division · ` : ''}
                    Hover any district for live data
                  </div>
                </div>
                <HeatToggle metric={heatMetric} setMetric={setHeatMetric} />
              </div>

              <DistrictGrid
                districts={ALL_DISTRICTS}
                metric={heatMetric}
                onHover={setHoveredDistrict}
                hovered={hoveredDistrict}
                activeDiv={activeDivision}
              />

              <div className="si-map-legend">
                {LEGENDS[heatMetric].map(([color, label]) => (
                  <div key={label} className="si-legend-item">
                    <span className="si-legend-dot" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>

              <DistrictInfo d={hoveredDistrict} />
            </div>

            {/* Exclusion Root-Cause Engine */}
            <div className="si-excl-engine">
              <div className="si-excl-engine__head">
                <span className="material-symbols-outlined si-excl-engine__icon">psychology</span>
                <div>
                  <div className="si-excl-engine__title">Why Are Farmers Excluded?</div>
                  <div className="si-excl-engine__sub">AI Exclusion Root-Cause Engine · Maharashtra · {seasonLabel} {activeFY}</div>
                </div>
                <span className="si-excl-engine__badge">AI Insight</span>
              </div>
              <div className="si-excl-causes">
                {[
                  { cause: 'Aadhaar–bank mapping failure', count: 2843, pct: 57, color: '#c72626', note: '67% of PM-KISAN rejections in Solapur - recoverable via seeding camp' },
                  { cause: 'Land record mismatch', count: 4120, pct: 82, color: '#e8902a', note: 'Post-partition records not updated in Osmanabad and Latur' },
                  { cause: 'Survey not conducted', count: 3210, pct: 64, color: '#e8902a', note: 'Survey teams delayed in Yavatmal and Barshi after rainfall' },
                  { cause: 'Inactive Aadhaar records', count: 1204, pct: 24, color: '#b8972a', note: 'Concentrated in Malegaon cluster - reactivation camp needed' },
                  { cause: 'Duplicate Khata / applications', count: 2384, pct: 48, color: '#7a6a40', note: 'Detected in Farm Mechanization - Pune division (TAO flagged)' },
                  { cause: 'Bank account inactive / unmapped', count: 812, pct: 16, color: '#6b7280', note: '212 PMFBY beneficiaries, Parbhani' },
                ].map(c => (
                  <div key={c.cause} className="si-excl-cause">
                    <div className="si-excl-cause__header">
                      <span className="si-excl-cause__name">{c.cause}</span>
                      <span className="si-excl-cause__count" style={{ color: c.color }}>{c.count.toLocaleString()} cases</span>
                    </div>
                    <div className="si-excl-cause__bar-track">
                      <div className="si-excl-cause__bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                    <div className="si-excl-cause__note">→ {c.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* RIGHT - Policy Intelligence */}
          <aside className="si-right">
            <div className="si-section-head">
              <span className="material-symbols-outlined">auto_awesome</span>
              AI Policy Recommendations
            </div>
            <div className="si-policy-list">
              {AI_POLICY_RECS.map((r, i) => (
                <div key={i} className={`si-policy-rec si-policy-rec--${r.severity}`}>
                  <div className="si-policy-rec__head">
                    <span className="material-symbols-outlined si-policy-rec__icon">{r.icon}</span>
                    <span className="si-policy-rec__title">{r.title}</span>
                  </div>
                  <p className="si-policy-rec__body">{r.body}</p>
                  <button className="si-policy-rec__action" onClick={() => alert(`Action: ${r.action}\n\nThis would open the relevant workflow in a production system.`)}>
                    {r.action} →
                  </button>
                </div>
              ))}
            </div>

            <div className="si-section-head si-section-head--mt">
              <span className="material-symbols-outlined">crisis_alert</span>
              District Risk Watchlist
            </div>
            <div className="si-risk-table">
              <div className="si-risk-table__head">
                <span>District</span><span>Risk</span><span>Primary Cause</span>
              </div>
              {(activeDivision === 'All Divisions' ? ALL_DISTRICTS : ALL_DISTRICTS.filter(d => d.div === activeDivision))
                .filter(d => d.risk !== 'low')
                .sort((a, b) => (a.risk === 'high' ? -1 : b.risk === 'high' ? 1 : 0))
                .slice(0, 8)
                .map(d => (
                  <div key={d.name} className="si-risk-table__row">
                    <span className="si-risk-table__district">{d.name}</span>
                    <span className={`si-risk-badge si-risk-badge--${d.risk}`}>{d.risk}</span>
                    <span className="si-risk-table__cause">{d.cause}</span>
                  </div>
                ))}
              {(activeDivision !== 'All Divisions' && ALL_DISTRICTS.filter(d => d.div === activeDivision && d.risk !== 'low').length === 0) && (
                <div className="si-risk-table__empty">No high/medium risk districts in this division.</div>
              )}
            </div>

            <div className="si-section-head si-section-head--mt">
              <span className="material-symbols-outlined">live_help</span>
              Grievance Feed
              <div className={`si-sync-badge${syncPulse ? ' si-sync-badge--pulse' : ''}`} style={{ marginLeft: 'auto', fontSize: 10 }}>
                <span className="si-sync-badge__dot" />live
              </div>
            </div>
            <div className="si-grievance-feed">
              {GRIEVANCE_FEED.map(g => (
                <div key={g.id} className={`si-grievance-item si-grievance-item--${g.sev}`}>
                  <div className="si-grievance-item__meta">
                    <span className={`si-gtag si-gtag--${g.sev}`}>{g.tag}</span>
                    <span className="si-grievance-item__time">{g.time}</span>
                  </div>
                  <p className="si-grievance-item__text">{g.text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ── SCHEME DETAIL DRAWER ─────────────────────────────────────── */}
        {selectedScheme && <SchemeDrawer s={selectedScheme} onClose={() => setSelectedSchemeId(null)} />}

      </div>
    </div>
  );
}
