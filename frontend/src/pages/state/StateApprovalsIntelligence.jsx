import React, { useState, useCallback, useMemo } from 'react';
import './state-approvals.css';

/* ─────────────────────────────────────────────────────────────────────────────
   Static intelligence data - Maharashtra Approval Governance
   ───────────────────────────────────────────────────────────────────────────── */

const DISTRICTS = [
  { id: 'solapur',    name: 'Solapur',     abbr: 'SOL', division: 'Pune',        pending: 18420, avgDays: 8.4, escalations: 184, risk: 'high',   riskScore: 92, rejected: 4210, approved: 22100, applied: 44730, ai: true,  fraudFlags: 12, grievances: 842 },
  { id: 'beed',       name: 'Beed',        abbr: 'BED', division: 'Aurangabad',  pending: 11042, avgDays: 5.2, escalations: 72,  risk: 'high',   riskScore: 84, rejected: 2840, approved: 18600, applied: 32482, ai: true,  fraudFlags: 8,  grievances: 512 },
  { id: 'latur',      name: 'Latur',       abbr: 'LAT', division: 'Aurangabad',  pending: 9840,  avgDays: 6.1, escalations: 58,  risk: 'high',   riskScore: 78, rejected: 2100, approved: 14200, applied: 26140, ai: false, fraudFlags: 5,  grievances: 388 },
  { id: 'osmanabad',  name: 'Dharashiv',   abbr: 'DHR', division: 'Aurangabad',  pending: 8630,  avgDays: 7.2, escalations: 47,  risk: 'high',   riskScore: 74, rejected: 1980, approved: 11200, applied: 21810, ai: false, fraudFlags: 4,  grievances: 310 },
  { id: 'jalna',      name: 'Jalna',       abbr: 'JLN', division: 'Aurangabad',  pending: 7210,  avgDays: 4.8, escalations: 34,  risk: 'medium', riskScore: 58, rejected: 1420, approved: 13800, applied: 22430, ai: false, fraudFlags: 2,  grievances: 228 },
  { id: 'nanded',     name: 'Nanded',      abbr: 'NND', division: 'Aurangabad',  pending: 6840,  avgDays: 5.0, escalations: 28,  risk: 'medium', riskScore: 54, rejected: 1620, approved: 12400, applied: 20860, ai: false, fraudFlags: 3,  grievances: 198 },
  { id: 'nashik',     name: 'Nashik',      abbr: 'NSK', division: 'Nashik',      pending: 5620,  avgDays: 3.6, escalations: 22,  risk: 'medium', riskScore: 46, rejected: 980,  approved: 18200, applied: 24800, ai: false, fraudFlags: 1,  grievances: 144 },
  { id: 'ahmednagar', name: 'Ahmednagar',  abbr: 'AHM', division: 'Nashik',      pending: 4980,  avgDays: 3.2, escalations: 18,  risk: 'medium', riskScore: 42, rejected: 840,  approved: 16400, applied: 22220, ai: false, fraudFlags: 2,  grievances: 122 },
  { id: 'aurangabad', name: 'Aurangabad',  abbr: 'AUR', division: 'Aurangabad',  pending: 4420,  avgDays: 3.0, escalations: 14,  risk: 'medium', riskScore: 38, rejected: 720,  approved: 15800, applied: 20940, ai: false, fraudFlags: 1,  grievances: 98  },
  { id: 'jalgaon',    name: 'Jalgaon',     abbr: 'JLG', division: 'Nashik',      pending: 3840,  avgDays: 2.8, escalations: 12,  risk: 'medium', riskScore: 34, rejected: 640,  approved: 14200, applied: 18680, ai: false, fraudFlags: 0,  grievances: 84  },
  { id: 'yavatmal',   name: 'Yavatmal',    abbr: 'YVT', division: 'Amravati',    pending: 6210,  avgDays: 5.8, escalations: 41,  risk: 'high',   riskScore: 71, rejected: 1840, approved: 10400, applied: 18450, ai: true,  fraudFlags: 6,  grievances: 294 },
  { id: 'amravati',   name: 'Amravati',    abbr: 'AMR', division: 'Amravati',    pending: 3210,  avgDays: 2.6, escalations: 10,  risk: 'low',    riskScore: 28, rejected: 420,  approved: 12800, applied: 16430, ai: false, fraudFlags: 0,  grievances: 62  },
  { id: 'nagpur',     name: 'Nagpur',      abbr: 'NGP', division: 'Nagpur',      pending: 2840,  avgDays: 2.2, escalations: 8,   risk: 'low',    riskScore: 24, rejected: 380,  approved: 18400, applied: 21620, ai: false, fraudFlags: 0,  grievances: 48  },
  { id: 'wardha',     name: 'Wardha',      abbr: 'WRD', division: 'Nagpur',      pending: 2610,  avgDays: 2.1, escalations: 6,   risk: 'low',    riskScore: 22, rejected: 340,  approved: 9400,  applied: 12350, ai: false, fraudFlags: 0,  grievances: 42  },
  { id: 'akola',      name: 'Akola',       abbr: 'AKL', division: 'Amravati',    pending: 3140,  avgDays: 2.8, escalations: 9,   risk: 'low',    riskScore: 26, rejected: 480,  approved: 11200, applied: 14820, ai: false, fraudFlags: 0,  grievances: 54  },
  { id: 'buldhana',   name: 'Buldhana',    abbr: 'BLD', division: 'Amravati',    pending: 2980,  avgDays: 2.5, escalations: 7,   risk: 'low',    riskScore: 24, rejected: 420,  approved: 10800, applied: 14200, ai: false, fraudFlags: 0,  grievances: 50  },
  { id: 'pune',       name: 'Pune',        abbr: 'PUN', division: 'Pune',        pending: 3140,  avgDays: 2.1, escalations: 14,  risk: 'low',    riskScore: 20, rejected: 310,  approved: 22800, applied: 26250, ai: false, fraudFlags: 1,  grievances: 66  },
  { id: 'satara',     name: 'Satara',      abbr: 'SAT', division: 'Pune',        pending: 2420,  avgDays: 2.4, escalations: 8,   risk: 'low',    riskScore: 18, rejected: 280,  approved: 11400, applied: 14100, ai: false, fraudFlags: 0,  grievances: 44  },
  { id: 'sangli',     name: 'Sangli',      abbr: 'SNG', division: 'Pune',        pending: 2180,  avgDays: 2.2, escalations: 7,   risk: 'low',    riskScore: 16, rejected: 240,  approved: 10200, applied: 12620, ai: false, fraudFlags: 0,  grievances: 38  },
  { id: 'kolhapur',   name: 'Kolhapur',    abbr: 'KLH', division: 'Pune',        pending: 1840,  avgDays: 1.9, escalations: 5,   risk: 'low',    riskScore: 14, rejected: 200,  approved: 12400, applied: 14440, ai: false, fraudFlags: 0,  grievances: 30  },
  { id: 'raigad',     name: 'Raigad',      abbr: 'RGD', division: 'Konkan',      pending: 1620,  avgDays: 2.0, escalations: 4,   risk: 'low',    riskScore: 12, rejected: 180,  approved: 8200,  applied: 10000, ai: false, fraudFlags: 0,  grievances: 26  },
  { id: 'thane',      name: 'Thane',       abbr: 'THN', division: 'Konkan',      pending: 1480,  avgDays: 1.8, escalations: 4,   risk: 'low',    riskScore: 10, rejected: 160,  approved: 10400, applied: 12040, ai: false, fraudFlags: 0,  grievances: 22  },
  { id: 'palghar',    name: 'Palghar',     abbr: 'PLG', division: 'Konkan',      pending: 1340,  avgDays: 1.9, escalations: 3,   risk: 'low',    riskScore: 10, rejected: 140,  approved: 7400,  applied: 8880,  ai: false, fraudFlags: 0,  grievances: 20  },
  { id: 'ratnagiri',  name: 'Ratnagiri',   abbr: 'RTN', division: 'Konkan',      pending: 980,   avgDays: 1.6, escalations: 2,   risk: 'low',    riskScore: 8,  rejected: 110,  approved: 5800,  applied: 6890,  ai: false, fraudFlags: 0,  grievances: 14  },
  { id: 'sindhudurg', name: 'Sindhudurg',  abbr: 'SND', division: 'Konkan',      pending: 720,   avgDays: 1.5, escalations: 1,   risk: 'low',    riskScore: 6,  rejected: 80,   approved: 4200,  applied: 5000,  ai: false, fraudFlags: 0,  grievances: 10  },
  { id: 'dhule',      name: 'Dhule',       abbr: 'DHL', division: 'Nashik',      pending: 2840,  avgDays: 3.1, escalations: 10,  risk: 'medium', riskScore: 36, rejected: 520,  approved: 9200,  applied: 12560, ai: false, fraudFlags: 0,  grievances: 72  },
  { id: 'nandurbar',  name: 'Nandurbar',   abbr: 'NBR', division: 'Nashik',      pending: 2180,  avgDays: 3.4, escalations: 8,   risk: 'medium', riskScore: 32, rejected: 440,  approved: 7800,  applied: 10420, ai: false, fraudFlags: 0,  grievances: 58  },
  { id: 'hingoli',    name: 'Hingoli',     abbr: 'HNG', division: 'Aurangabad',  pending: 3480,  avgDays: 4.2, escalations: 18,  risk: 'medium', riskScore: 44, rejected: 680,  approved: 8400,  applied: 12560, ai: false, fraudFlags: 1,  grievances: 88  },
  { id: 'parbhani',   name: 'Parbhani',    abbr: 'PRB', division: 'Aurangabad',  pending: 4120,  avgDays: 4.9, escalations: 24,  risk: 'medium', riskScore: 50, rejected: 820,  approved: 9800,  applied: 14740, ai: false, fraudFlags: 2,  grievances: 112 },
  { id: 'chandrapur', name: 'Chandrapur',  abbr: 'CHP', division: 'Nagpur',      pending: 2240,  avgDays: 2.3, escalations: 7,   risk: 'low',    riskScore: 20, rejected: 320,  approved: 9600,  applied: 12160, ai: false, fraudFlags: 0,  grievances: 44  },
  { id: 'gadchiroli', name: 'Gadchiroli',  abbr: 'GDC', division: 'Nagpur',      pending: 1840,  avgDays: 2.6, escalations: 6,   risk: 'low',    riskScore: 18, rejected: 280,  approved: 6200,  applied: 8320,  ai: false, fraudFlags: 0,  grievances: 36  },
  { id: 'gondia',     name: 'Gondia',      abbr: 'GND', division: 'Nagpur',      pending: 1620,  avgDays: 2.1, escalations: 4,   risk: 'low',    riskScore: 14, rejected: 220,  approved: 7000,  applied: 8840,  ai: false, fraudFlags: 0,  grievances: 28  },
  { id: 'bhandara',   name: 'Bhandara',    abbr: 'BHN', division: 'Nagpur',      pending: 1480,  avgDays: 1.9, escalations: 3,   risk: 'low',    riskScore: 12, rejected: 180,  approved: 6800,  applied: 8460,  ai: false, fraudFlags: 0,  grievances: 22  },
  { id: 'washim',     name: 'Washim',      abbr: 'WSH', division: 'Amravati',    pending: 2980,  avgDays: 3.6, escalations: 12,  risk: 'medium', riskScore: 40, rejected: 580,  approved: 8200,  applied: 11760, ai: false, fraudFlags: 1,  grievances: 78  },
  { id: 'mumbai',     name: 'Mumbai',      abbr: 'MUM', division: 'Konkan',      pending: 420,   avgDays: 1.1, escalations: 1,   risk: 'low',    riskScore: 4,  rejected: 40,   approved: 1200,  applied: 1660,  ai: false, fraudFlags: 0,  grievances: 8   },
  { id: 'mumbaisub',  name: 'Mumbai Sub.', abbr: 'MSB', division: 'Konkan',      pending: 380,   avgDays: 1.0, escalations: 1,   risk: 'low',    riskScore: 4,  rejected: 32,   approved: 1100,  applied: 1512,  ai: false, fraudFlags: 0,  grievances: 6   },
];

const ALL_SCHEMES = [
  { name: 'PM-KISAN',              applied: 142000, approved: 118400, rejected: 8200,  pending: 15400, escalated: 284 },
  { name: 'PMFBY (Crop Ins.)',     applied: 98400,  approved: 72100,  rejected: 12800, pending: 13500, escalated: 412 },
  { name: 'Crop Loss Relief',      applied: 84200,  approved: 58400,  rejected: 14800, pending: 11000, escalated: 328 },
  { name: 'Drip Irrigation',       applied: 42800,  approved: 32100,  rejected: 4200,  pending: 6500,  escalated: 84  },
  { name: 'Solar Pump Scheme',     applied: 28400,  approved: 19800,  rejected: 3400,  pending: 5200,  escalated: 62  },
  { name: 'Farm Mechanization',    applied: 21600,  approved: 16400,  rejected: 2800,  pending: 2400,  escalated: 38  },
  { name: 'Soyabean Compensation', applied: 38200,  approved: 24800,  rejected: 6200,  pending: 7200,  escalated: 148 },
];

const REJECTION_REASONS = [
  { reason: 'Aadhaar–Bank Mismatch',       count: 8420, pct: 38 },
  { reason: 'Duplicate Beneficiary',        count: 4840, pct: 22 },
  { reason: 'Land Record Mismatch',         count: 3620, pct: 16 },
  { reason: 'Survey / Inspection Pending',  count: 2180, pct: 10 },
  { reason: 'Geo-Verification Failed',      count: 1540, pct: 7  },
  { reason: 'Document Incomplete',          count: 760,  pct: 4  },
  { reason: 'Other',                        count: 640,  pct: 3  },
];

const SUSPICION_SIGNALS = [
  { title: '842 applications approved within 3 hrs by single officer in Barshi', chips: ['Bulk Approvals', 'Same Officer'],      level: 'critical' },
  { title: 'Mass PMFBY clearances before rainfall verification in Latur',         chips: ['Premature Approval', 'PMFBY'],         level: 'critical' },
  { title: 'Repeated bank account across 214 PM-KISAN applications in Beed',     chips: ['Linked Beneficiaries', 'Shared Bank'], level: 'high'     },
  { title: 'Duplicate Aadhaar in 128 Soyabean Compensation claims',              chips: ['Duplicate Aadhaar', 'Invoice Reused'], level: 'high'     },
  { title: 'Same GPS coordinates across 84 land applications in Yavatmal',       chips: ['Same GPS', 'Land Fraud'],              level: 'high'     },
];

const ESCALATION_LEVELS = [
  { level: 'District Level',    count: 684, priority: 'medium',   color: '#396940' },
  { level: 'Divisional Level',  count: 241, priority: 'high',     color: '#b45309' },
  { level: 'State Level (L3)',  count: 42,  priority: 'critical', color: '#ba1a1a' },
  { level: 'Grievance-Linked',  count: 128, priority: 'high',     color: '#b45309' },
];

const OFFICERS = [
  { name: 'Shri P. Kulkarni',  district: 'Solapur', efficiency: 62, rejRate: 18, sla: 42, color: '#ba1a1a' },
  { name: 'Smt. A. Deshmukh', district: 'Beed',    efficiency: 71, rejRate: 12, sla: 58, color: '#b45309' },
  { name: 'Shri R. Patil',    district: 'Nashik',  efficiency: 88, rejRate: 6,  sla: 86, color: '#396940' },
  { name: 'Smt. M. Jadhav',   district: 'Pune',    efficiency: 94, rejRate: 4,  sla: 92, color: '#396940' },
];

const ALL_ALERTS = [
  { title: 'Crop compensation approvals delayed beyond SLA in 8 districts', meta: 'Solapur, Beed, Latur, Osmanabad · 18,432 farmers affected', priority: 'critical' },
  { title: 'PM-KISAN rejection spike in drought-stress regions',             meta: 'Aadhaar–bank mapping failures up 34% · Action required',    priority: 'critical' },
  { title: 'Unusual approval velocity in Barshi cluster - AI flagged',       meta: 'Officer override suspected · Compliance review triggered',  priority: 'high'     },
  { title: 'PMFBY verification bottleneck: field inspection shortage',       meta: '12 talukas · 4,200 pending · SLA breach in 72 hrs',         priority: 'high'     },
  { title: 'Soyabean compensation within SLA in Amravati division',          meta: 'Clearance velocity improving · Monitor for sustained trend', priority: 'medium'   },
];

const ROOT_CAUSES = [
  { label: 'Aadhaar–Bank Mapping Failure',                   pct: 38, icon: 'account_balance' },
  { label: 'Field Verification Shortage in Drought Talukas', pct: 26, icon: 'person_search'   },
  { label: 'Survey Backlog Impacting Compensation',          pct: 18, icon: 'pending_actions' },
  { label: 'PMFBY Rainfall Verification Dependency',         pct: 12, icon: 'water_drop'      },
  { label: 'Duplicate Beneficiary Checks Pending',           pct: 6,  icon: 'people'          },
];

const VELOCITY_DATA = [48, 62, 55, 71, 68, 84, 76, 90, 88, 72, 65, 78];

/* ─────────────────────────────────────────────────────────────────────────────
   Utility helpers
   ───────────────────────────────────────────────────────────────────────────── */

function riskColor(risk) {
  if (risk === 'high')   return '#ba1a1a';
  if (risk === 'medium') return '#b45309';
  return '#396940';
}

function heatColor(score) {
  if (score >= 75) return '#ba1a1a';
  if (score >= 55) return '#c05b1a';
  if (score >= 40) return '#b45309';
  if (score >= 25) return '#4f7c56';
  return '#396940';
}

function fmt(n) {
  if (n >= 100000) return (n / 100000).toFixed(2) + 'L';
  if (n >= 1000)   return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared sub-components
   ───────────────────────────────────────────────────────────────────────────── */

const AiSummary = ({ text }) => (
  <div className="sai__ai-summary">
    <span className="sai__ai-summary-icon material-symbols-outlined">smart_toy</span>
    <p className="sai__ai-summary-text">{text}</p>
  </div>
);

const Panel = ({ title, icon, badge, badgeVariant = 'green', children, noPad }) => (
  <div className="sai__panel">
    <div className="sai__panel-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#396940' }}>{icon}</span>}
        <h3 className="sai__panel-title">{title}</h3>
      </div>
      {badge && <span className={`sai__panel-badge sai__panel-badge--${badgeVariant}`}>{badge}</span>}
    </div>
    {noPad ? children : <div className="sai__panel-body">{children}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   District Intelligence Drawer
   ───────────────────────────────────────────────────────────────────────────── */

const DistrictDrawer = ({ district, onClose }) => {
  const funnel = useMemo(() => [
    { label: 'Applied',   val: fmt(district.applied),                              pct: 100, color: '#033621' },
    { label: 'Verified',  val: fmt(Math.round(district.applied * 0.82)),           pct: 82,  color: '#1f4d36' },
    { label: 'Inspected', val: fmt(Math.round(district.applied * 0.68)),           pct: 68,  color: '#396940' },
    { label: 'Approved',  val: fmt(district.approved),                             pct: Math.round(district.approved / district.applied * 100), color: '#2563eb' },
    { label: 'DBT Sent',  val: fmt(Math.round(district.approved * 0.93)),          pct: Math.round(district.approved * 0.93 / district.applied * 100), color: '#7c3aed' },
    { label: 'Confirmed', val: fmt(Math.round(district.approved * 0.81)),          pct: Math.round(district.approved * 0.81 / district.applied * 100), color: '#b45309' },
  ], [district]);

  return (
    <>
      <div className="sai__drawer-overlay" onClick={onClose} />
      <div className="sai__drawer" role="dialog" aria-modal="true">

        {/* Head */}
        <div className="sai__drawer-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: riskColor(district.risk), flexShrink: 0 }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0d2118', margin: 0, fontFamily: 'Public Sans, sans-serif', letterSpacing: '-0.02em' }}>
                {district.name} District
              </h2>
              <span className={`sai__risk-tag sai__risk-tag--${district.risk}`}>{district.risk.toUpperCase()} RISK</span>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {[
                { label: 'AI Risk Score', val: `${district.riskScore}/100`, color: riskColor(district.risk) },
                { label: 'Escalations',   val: district.escalations,         color: '#b45309' },
                { label: 'Grievances',    val: district.grievances,           color: '#414943' },
                { label: 'Avg Time',      val: `${district.avgDays}d`,        color: district.avgDays > 6 ? '#ba1a1a' : '#b45309' },
              ].map(s => (
                <div key={s.label}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca8a2', display: 'block' }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'IBM Plex Sans, monospace' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="sai__drawer-close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="sai__drawer-body">

          {/* 1. Scheme-Wise Analytics */}
          <div className="sai__drawer-section">
            <div className="sai__drawer-section-head">
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#396940' }}>account_tree</span>
              <h4 className="sai__drawer-section-title">Scheme-Wise Approval Analytics</h4>
            </div>
            <div className="sai__drawer-section-body">
              <table className="sai__scheme-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Scheme</th>
                    <th>Applied</th>
                    <th>Approved</th>
                    <th>Rejected</th>
                    <th>Pending</th>
                    <th>Esc.</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_SCHEMES.map(s => {
                    const scale = district.applied / 284000;
                    return (
                      <tr key={s.name}>
                        <td style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>{s.name}</td>
                        <td>{fmt(Math.round(s.applied   * scale))}</td>
                        <td style={{ color: '#396940' }}>{fmt(Math.round(s.approved  * scale))}</td>
                        <td style={{ color: '#ba1a1a' }}>{fmt(Math.round(s.rejected  * scale))}</td>
                        <td style={{ color: '#b45309' }}>{fmt(Math.round(s.pending   * scale))}</td>
                        <td><span className="sai__scheme-esc">{Math.max(1, Math.round(s.escalated * scale))}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Approval Processing Funnel */}
          <div className="sai__drawer-section">
            <div className="sai__drawer-section-head">
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#2563eb' }}>filter_alt</span>
              <h4 className="sai__drawer-section-title">Approval Processing Funnel</h4>
            </div>
            <div className="sai__drawer-section-body">
              {/* Funnel bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {funnel.map(step => (
                  <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: '#414943', flexShrink: 0 }}>{step.label}</div>
                    <div style={{ flex: 1, height: 22, background: '#eef0ec', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', width: `${step.pct}%`, background: step.color, borderRadius: 6, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{step.pct}%</span>
                      </div>
                    </div>
                    <div style={{ width: 48, fontSize: 12, fontWeight: 700, color: '#0d2118', textAlign: 'right', fontFamily: 'IBM Plex Sans, monospace', flexShrink: 0 }}>{step.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <AiSummary text={`Drop-off highest at Field Inspection stage - ${Math.round(14 + district.riskScore * 0.1)}% of verified applications stalled. DBT linkage rate healthy at ${Math.round(89 + district.riskScore * 0.03)}%. Beneficiary confirmation gap indicates post-approval follow-up deficit.`} />
              </div>
            </div>
          </div>

          {/* 3. Rejection Root-Cause */}
          <div className="sai__drawer-section">
            <div className="sai__drawer-section-head">
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ba1a1a' }}>cancel</span>
              <h4 className="sai__drawer-section-title">Rejection Root-Cause Intelligence</h4>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#ba1a1a', fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace' }}>
                {fmt(district.rejected)} Total Rejections
              </span>
            </div>
            <div className="sai__drawer-section-body">
              {REJECTION_REASONS.map(r => (
                <div key={r.reason} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d2118' }}>{r.reason}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#ba1a1a', fontFamily: 'IBM Plex Sans, monospace' }}>
                      {fmt(Math.round(district.rejected * r.pct / 100))} &nbsp;({r.pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#eef0ec', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: '#ba1a1a', borderRadius: 99, opacity: 0.7 + r.pct / 100 * 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. AI Suspicion Signals (high-risk districts only) */}
          {district.fraudFlags > 0 && (
            <div className="sai__drawer-section">
              <div className="sai__drawer-section-head">
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ba1a1a' }}>gpp_bad</span>
                <h4 className="sai__drawer-section-title">AI Suspicion Signals</h4>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#ba1a1a', fontWeight: 700, background: 'rgba(186,26,26,0.08)', padding: '3px 8px', borderRadius: 5 }}>
                  {district.fraudFlags} AI FLAGS
                </span>
              </div>
              <div className="sai__drawer-section-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SUSPICION_SIGNALS.slice(0, Math.min(district.fraudFlags, 3)).map((sig, i) => (
                  <div key={i} className="sai__signal-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: sig.level === 'critical' ? '#ba1a1a' : '#b45309', flexShrink: 0, marginTop: 1 }}>warning</span>
                      <div className="sai__signal-title">{sig.title}</div>
                    </div>
                    <div className="sai__suspicion-chips">
                      {sig.chips.map(c => (
                        <span key={c} className={`sai__chip sai__chip--${sig.level === 'critical' ? 'red' : 'amber'}`}>{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Escalation Hierarchy */}
          <div className="sai__drawer-section">
            <div className="sai__drawer-section-head">
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#b45309' }}>move_up</span>
              <h4 className="sai__drawer-section-title">Escalation Hierarchy</h4>
            </div>
            <div className="sai__drawer-section-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ESCALATION_LEVELS.map(e => {
                  const cnt = Math.max(1, Math.round(e.count * (district.escalations / 684)));
                  return (
                    <div key={e.level} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f3f4f0', borderRadius: 10, borderLeft: `4px solid ${e.color}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0d2118', marginBottom: 2 }}>{e.level}</div>
                        <div style={{ fontSize: 10, color: '#717972', fontWeight: 500 }}>
                          {e.level === 'Grievance-Linked' ? 'Linked to unresolved farmer complaints' : `${e.priority.charAt(0).toUpperCase() + e.priority.slice(1)} priority · Needs intervention`}
                        </div>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: e.color, fontFamily: 'IBM Plex Sans, monospace' }}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14 }}>
                <AiSummary text={district.risk === 'high'
                  ? `Approval delays concentrated in drought-affected talukas. ${district.grievances} grievance-linked pending cases require immediate divisional intervention. State-level escalation review recommended within 48 hours.`
                  : `Escalation volume within manageable range. Continued SLA monitoring recommended for PMFBY and crop-loss schemes. District performance trending towards compliance.`
                } />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────────────────────────────────────── */

export default function StateApprovalsIntelligence() {
  const [activeDistrict, setActiveDistrict]   = useState(null);
  const [drawerDistrict, setDrawerDistrict]   = useState(null);
  const [fy,             setFy]               = useState('2025-26');
  const [season,         setSeason]           = useState('Kharif');
  const [districtFilter, setDistrictFilter]   = useState('All Districts');
  const [schemeFilter,   setSchemeFilter]     = useState('All Schemes');
  const [priority,       setPriority]         = useState('All');
  const [exportToast,    setExportToast]      = useState(false);

  /* ── Derived / filtered data ── */
  const filteredDistricts = useMemo(() => {
    let list = DISTRICTS;
    if (districtFilter !== 'All Districts') list = list.filter(d => d.name === districtFilter);
    if (priority === 'Critical') list = list.filter(d => d.riskScore >= 75);
    else if (priority === 'High')   list = list.filter(d => d.riskScore >= 50);
    else if (priority === 'Medium') list = list.filter(d => d.riskScore >= 25 && d.riskScore < 50);
    else if (priority === 'Low')    list = list.filter(d => d.riskScore < 25);
    return list;
  }, [districtFilter, priority]);

  const filteredAlerts = useMemo(() => {
    if (priority === 'All') return ALL_ALERTS;
    return ALL_ALERTS.filter(a => a.priority === priority.toLowerCase());
  }, [priority]);

  const filteredSchemes = useMemo(() => {
    if (schemeFilter === 'All Schemes') return ALL_SCHEMES;
    return ALL_SCHEMES.filter(s => s.name === schemeFilter);
  }, [schemeFilter]);

  const mapDistricts = useMemo(() => {
    if (districtFilter !== 'All Districts') return DISTRICTS; // show full map always
    return DISTRICTS;
  }, [districtFilter]);

  /* ── Aggregated KPIs (react to district/scheme filters) ── */
  const kpiDistricts = filteredDistricts.length > 0 ? filteredDistricts : DISTRICTS;
  const totalPending     = kpiDistricts.reduce((a, d) => a + d.pending, 0);
  const totalEscalations = kpiDistricts.reduce((a, d) => a + d.escalations, 0);
  const highRisk         = kpiDistricts.filter(d => d.risk === 'high');
  const avgDays          = (kpiDistricts.reduce((a, d) => a + d.avgDays, 0) / kpiDistricts.length).toFixed(1);

  const handleDistrictClick = useCallback((d) => {
    setActiveDistrict(d.id);
    setDrawerDistrict(d);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerDistrict(null);
    setActiveDistrict(null);
  }, []);

  /* ── Export function ── */
  const handleExport = useCallback(() => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let csv = `Maharashtra Agriculture Department - Approval Intelligence Centre\n`;
    csv += `Generated: ${now}  |  FY: ${fy}  |  Season: ${season}  |  Filter: ${districtFilter}  |  Scheme: ${schemeFilter}\n\n`;

    /* District data */
    csv += `DISTRICT CLEARANCE INTELLIGENCE\n`;
    csv += `District,Division,Applied,Approved,Rejected,Pending,Avg Days,Escalations,Grievances,Risk Score,Risk Level,AI Flag\n`;
    [...filteredDistricts]
      .sort((a, b) => b.riskScore - a.riskScore)
      .forEach(d => {
        csv += `"${d.name}","${d.division}",${d.applied},${d.approved},${d.rejected},${d.pending},${d.avgDays},${d.escalations},${d.grievances},${d.riskScore},${d.risk.toUpperCase()},${d.ai ? 'YES' : 'NO'}\n`;
      });

    csv += `\nSCHEME-WISE PERFORMANCE\n`;
    csv += `Scheme,Applied,Approved,Rejected,Pending,Escalated,Approval Rate (%)\n`;
    filteredSchemes.forEach(s => {
      const rate = Math.round(s.approved / s.applied * 100);
      csv += `"${s.name}",${s.applied},${s.approved},${s.rejected},${s.pending},${s.escalated},${rate}%\n`;
    });

    csv += `\nREJECTION ROOT CAUSES\n`;
    csv += `Reason,Statewide Count,Share (%)\n`;
    REJECTION_REASONS.forEach(r => {
      csv += `"${r.reason}",${r.count},${r.pct}%\n`;
    });

    csv += `\nAI ESCALATION ALERTS (Priority: ${priority})\n`;
    csv += `Priority,Alert,Details\n`;
    filteredAlerts.forEach(a => {
      csv += `${a.priority.toUpperCase()},"${a.title}","${a.meta}"\n`;
    });

    csv += `\nOFFICER PERFORMANCE\n`;
    csv += `Officer,District,Efficiency (%),Rejection Rate (%),SLA Compliance (%)\n`;
    OFFICERS.forEach(o => {
      csv += `"${o.name}","${o.district}",${o.efficiency}%,${o.rejRate}%,${o.sla}%\n`;
    });

    downloadCSV(csv, `ApprovalIntelligence_${fy}_${season}_${new Date().toISOString().slice(0,10)}.csv`);
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  }, [fy, season, districtFilter, schemeFilter, priority, filteredDistricts, filteredSchemes, filteredAlerts]);

  const isFiltered = districtFilter !== 'All Districts' || schemeFilter !== 'All Schemes' || priority !== 'All';

  return (
    <div className="sai-bleed">
      <div className="sai">

        {/* ── Export toast ── */}
        {exportToast && (
          <div style={{
            position: 'fixed', top: 20, right: 24, zIndex: 9999,
            background: '#033621', color: '#fff', padding: '12px 20px',
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'sai-drawer-in 0.2s ease',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            Intelligence report exported successfully
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="sai__header">
          {/* ── Command Header card ── */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(20,40,25,0.08)',
            borderRadius: 16,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            boxShadow: '0 1px 2px rgba(20,40,25,0.04), 0 4px 16px rgba(20,40,25,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#033621', flexShrink: 0 }}>hub</span>
              <div>
                <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1f1a', lineHeight: 1.1 }}>
                  Approval Intelligence Centre
                </h1>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#7a8a7a', letterSpacing: '0.01em' }}>
                  AI-driven monitoring of agricultural approvals, escalations and clearance efficiency · Maharashtra
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {[
                { icon: 'location_on', label: 'Maharashtra' },
                { icon: 'calendar_month', label: `FY ${fy}` },
                { icon: 'grass', label: `${season} + Rabi` },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600, color: '#3a4a3a',
                  background: '#f0f2ee', border: '1px solid rgba(20,40,25,0.1)',
                  borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap', letterSpacing: '0.01em',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#396940' }}>{icon}</span>
                  {label}
                </div>
              ))}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: '#2d6e3e',
                background: 'rgba(45,110,62,0.08)', border: '1px solid rgba(45,110,62,0.18)',
                borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2d6e3e', display: 'inline-block', animation: 'sai-pulse 2s ease-in-out infinite' }} />
                Live Sync · 2 min ago
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700, color: '#b45309',
                background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.2)',
                borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                {highRisk.length} Alerts
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: '#fff',
                background: '#033621', border: 'none',
                borderRadius: 8, padding: '7px 13px', cursor: 'pointer', whiteSpace: 'nowrap',
              }} onClick={handleExport}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                Export
              </button>
            </div>
          </div>

          {/* ── Filter Strip ── */}
          <div className="sai__filter-strip">
            <span className="sai__filter-label">Filters</span>
            <div className="sai__filter-divider" />

            <div className="sai__filter-group">
              <label className="sai__filter-group-label">Financial Year</label>
              <select className="sai__filter-select" value={fy} onChange={e => setFy(e.target.value)}>
                <option>2025-26</option>
                <option>2024-25</option>
                <option>2023-24</option>
              </select>
            </div>

            <div className="sai__filter-group">
              <label className="sai__filter-group-label">Season</label>
              <select className="sai__filter-select" value={season} onChange={e => setSeason(e.target.value)}>
                <option>Kharif</option>
                <option>Rabi</option>
                <option>Summer</option>
                <option>Annual</option>
              </select>
            </div>

            <div className="sai__filter-group">
              <label className="sai__filter-group-label">District</label>
              <select className="sai__filter-select" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
                <option>All Districts</option>
                {DISTRICTS.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="sai__filter-group">
              <label className="sai__filter-group-label">Scheme</label>
              <select className="sai__filter-select" value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)}>
                <option>All Schemes</option>
                {ALL_SCHEMES.map(s => <option key={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="sai__filter-group">
              <label className="sai__filter-group-label">Priority</label>
              <select className="sai__filter-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {isFiltered && (
              <button
                style={{ marginLeft: 4, fontSize: 11, fontWeight: 700, color: '#b45309', background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.18)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setDistrictFilter('All Districts'); setSchemeFilter('All Schemes'); setPriority('All'); }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                Clear Filters
              </button>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca8a2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Hierarchy: Talathi → TAO/DAO → Divisional → <strong style={{ color: '#033621' }}>State (You)</strong>
              </span>
            </div>
          </div>

          {/* Active filter context bar */}
          {isFiltered && (
            <div style={{
              padding: '10px 16px', background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.15)',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#b45309' }}>filter_alt</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#b45309' }}>Active filters:</span>
              {districtFilter !== 'All Districts' && <span style={{ fontSize: 11, fontWeight: 700, color: '#0d2118', background: '#fff', padding: '2px 10px', borderRadius: 5, border: '1px solid rgba(20,40,30,0.1)' }}>District: {districtFilter}</span>}
              {schemeFilter !== 'All Schemes' && <span style={{ fontSize: 11, fontWeight: 700, color: '#0d2118', background: '#fff', padding: '2px 10px', borderRadius: 5, border: '1px solid rgba(20,40,30,0.1)' }}>Scheme: {schemeFilter}</span>}
              {priority !== 'All' && <span style={{ fontSize: 11, fontWeight: 700, color: '#0d2118', background: '#fff', padding: '2px 10px', borderRadius: 5, border: '1px solid rgba(20,40,30,0.1)' }}>Priority: {priority}</span>}
              <span style={{ fontSize: 11, color: '#717972', marginLeft: 4 }}>
                Showing {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''} · {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} · {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── HERO KPI GRID ── */}
        <div className="sai__kpi-grid">

          {/* Card 1 - Backlog */}
          <div className="sai__kpi sai__kpi--critical">
            <div className="sai__kpi-accent" style={{ background: '#ba1a1a' }} />
            <div className="sai__kpi-head">
              <div className="sai__kpi-icon sai__kpi-icon--red">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>hourglass_top</span>
              </div>
              <span className="sai__kpi-label">Statewide Approval Backlog</span>
            </div>
            <div className="sai__kpi-value">{fmt(totalPending)} Pending</div>
            <div className="sai__kpi-bars">
              {[55,70,62,80,75,90,85,88,78,92,84,95].map((h,i) => (
                <div key={i} className="sai__kpi-bar" style={{ height: `${h}%`, background: h > 70 ? '#ba1a1a' : h > 45 ? '#c05b1a' : '#396940' }} />
              ))}
            </div>
            <div className="sai__kpi-meta">
              <div className="sai__kpi-sub sai__kpi-sub--red"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>{highRisk.length} high-backlog districts active</div>
              <div className="sai__kpi-sub sai__kpi-sub--amber">+12% vs last {season} · {(totalEscalations * 0.18).toFixed(0)}% escalation rate</div>
              <div className="sai__kpi-sub sai__kpi-sub--green"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>trending_up</span>Clearance velocity: 4,200/day avg</div>
            </div>
          </div>

          {/* Card 2 - Processing Time */}
          <div className="sai__kpi sai__kpi--amber">
            <div className="sai__kpi-accent" style={{ background: '#b45309' }} />
            <div className="sai__kpi-head">
              <div className="sai__kpi-icon sai__kpi-icon--amber">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>schedule</span>
              </div>
              <span className="sai__kpi-label">Average Clearance Time</span>
            </div>
            <div className="sai__kpi-value">{avgDays} Days Avg</div>
            <div className="sai__mini-progress" style={{ margin: '8px 0' }}>
              <div className="sai__mini-progress-fill" style={{ width: `${Math.min(100, parseFloat(avgDays) / 10 * 100)}%`, background: '#b45309' }} />
            </div>
            <div className="sai__kpi-meta">
              <div className="sai__kpi-sub sai__kpi-sub--amber">Fastest: Mumbai (1.0d) · Slowest: Solapur (8.4d)</div>
              <div className="sai__kpi-sub sai__kpi-sub--red"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>error_outline</span>{totalEscalations} SLA breaches this month - {fy}</div>
              <div className="sai__kpi-sub sai__kpi-sub--red"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>trending_down</span>Week-on-week: +0.4d avg delay</div>
            </div>
          </div>

          {/* Card 3 - AI Risk */}
          <div className="sai__kpi sai__kpi--critical">
            <div className="sai__kpi-accent" style={{ background: '#ba1a1a' }} />
            <div className="sai__kpi-head">
              <div className="sai__kpi-icon sai__kpi-icon--red">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>gpp_bad</span>
              </div>
              <span className="sai__kpi-label">AI Approval Risk Intelligence</span>
            </div>
            <div className="sai__kpi-value">342 Patterns Flagged</div>
            <div className="sai__kpi-meta" style={{ marginTop: 8 }}>
              <div className="sai__kpi-sub sai__kpi-sub--red"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>warning</span>84 bulk approvals · 128 duplicate IDs</div>
              <div className="sai__kpi-sub sai__kpi-sub--red">72 PMFBY pre-verification approvals detected</div>
              <div className="sai__kpi-sub sai__kpi-sub--green"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>smart_toy</span>AI monitoring approval integrity statewide</div>
            </div>
          </div>

          {/* Card 4 - Farmer Impact */}
          <div className="sai__kpi sai__kpi--amber">
            <div className="sai__kpi-accent" style={{ background: '#b45309' }} />
            <div className="sai__kpi-head">
              <div className="sai__kpi-icon sai__kpi-icon--amber">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person_alert</span>
              </div>
              <span className="sai__kpi-label">Farmer Escalation Impact</span>
            </div>
            <div className="sai__kpi-value">18,432 Past SLA</div>
            <div className="sai__mini-progress" style={{ margin: '8px 0' }}>
              <div className="sai__mini-progress-fill" style={{ width: '78%', background: '#ba1a1a' }} />
            </div>
            <div className="sai__kpi-meta">
              <div className="sai__kpi-sub sai__kpi-sub--red"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>grass</span>8,200 pending crop-loss compensation</div>
              <div className="sai__kpi-sub sai__kpi-sub--amber">4,128 grievance-linked pending cases</div>
              <div className="sai__kpi-sub sai__kpi-sub--green"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>smart_toy</span>"Delays concentrated in drought districts"</div>
            </div>
          </div>

        </div>

        {/* ── MAIN GRID ── */}
        <div className="sai__main-grid">

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Maharashtra Heatmap */}
            <Panel title="Maharashtra Approval Heatmap" icon="map" badge="AI Risk Weighted" badgeVariant="red" noPad>
              <div className="sai__map-wrap">
                {/* Legend */}
                <div className="sai__map-legend">
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#414943' }}>Approval Risk Index:</span>
                  {[
                    { color: '#396940', label: 'Low (0–24)' },
                    { color: '#4f7c56', label: 'Moderate (25–39)' },
                    { color: '#b45309', label: 'Medium (40–54)' },
                    { color: '#c05b1a', label: 'High (55–74)' },
                    { color: '#ba1a1a', label: 'Critical (75+)' },
                  ].map(l => (
                    <div key={l.label} className="sai__map-legend-item">
                      <div className="sai__map-legend-dot" style={{ background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: '#9ca8a2' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>touch_app</span>
                    Click any district to open Intelligence Drawer
                  </div>
                </div>

                {/* District cells */}
                <div className="sai__district-grid">
                  {mapDistricts.map(d => {
                    const bg = heatColor(d.riskScore);
                    const isSelected = districtFilter === d.name;
                    const isActive   = activeDistrict === d.id;
                    return (
                      <div
                        key={d.id}
                        className="sai__district-cell"
                        style={{
                          background: bg,
                          outline: isActive || isSelected ? `3px solid #fff` : undefined,
                          outlineOffset: isActive || isSelected ? '-3px' : undefined,
                          boxShadow: isActive || isSelected ? `0 0 0 3px ${bg}` : undefined,
                          opacity: districtFilter !== 'All Districts' && !isSelected ? 0.35 : 1,
                        }}
                        onClick={() => handleDistrictClick(d)}
                        title={`${d.name} - ${fmt(d.pending)} pending · ${d.avgDays}d avg · AI Risk: ${d.riskScore}/100`}
                      >
                        <div className="sai__district-cell-glow" />
                        <span className="sai__district-cell-abbr">{d.abbr}</span>
                        <span className="sai__district-cell-val">{fmt(d.pending)}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 16 }}>
                  <AiSummary text={`Solapur, Beed, and Yavatmal show critical backlog concentration correlated with severe rainfall deficit in ${season} ${fy}. AI detects approval velocity anomalies in Marathwada region. Latur and Osmanabad show escalating grievance-linked pending cases. Konkan division maintaining healthy clearance rates.`} />
                </div>
              </div>
            </Panel>

            {/* District Clearance Monitor */}
            <Panel title="District Clearance Monitor" icon="table_rows" badge={`${filteredDistricts.length} of ${DISTRICTS.length} Districts`} noPad>
              {/* Summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid rgba(20,40,30,0.07)', background: '#fafbf8' }}>
                {[
                  { label: 'Total Backlog',       val: fmt(totalPending),     color: '#ba1a1a' },
                  { label: 'Total Escalations',   val: fmt(totalEscalations), color: '#b45309' },
                  { label: 'High-Risk Districts', val: highRisk.length,       color: '#ba1a1a' },
                  { label: 'Avg Processing Time', val: `${avgDays}d`,         color: '#b45309' },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: '14px 20px', borderRight: i < 3 ? '1px solid rgba(20,40,30,0.07)' : undefined }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca8a2', marginBottom: 5 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'IBM Plex Sans, monospace', letterSpacing: '-0.02em' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '16px 120px 1fr 60px 64px 72px 72px 80px 80px 24px', gap: 0, padding: '8px 20px', background: '#f3f4f0', borderBottom: '1px solid rgba(20,40,30,0.07)', alignItems: 'center' }}>
                {['', 'District', '', 'Pending', 'Avg Time', 'Escalations', 'Grievances', 'Risk Score', 'Risk Level', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca8a2' }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              <div className="sai__district-list">
                {filteredDistricts
                  .filter(d => d.applied > 1000)
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map(d => (
                    <button
                      key={d.id}
                      className={`sai__district-row${activeDistrict === d.id ? ' sai__district-row--active' : ''}`}
                      onClick={() => handleDistrictClick(d)}
                    >
                      <div className="sai__district-risk" style={{ background: riskColor(d.risk) }} />
                      <span className="sai__district-name">{d.name}</span>
                      <div style={{ flex: 1 }}>
                        {d.ai && (
                          <span style={{ fontSize: 8, fontWeight: 700, color: '#ba1a1a', background: 'rgba(186,26,26,0.08)', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(186,26,26,0.14)' }}>
                            AI FLAG
                          </span>
                        )}
                      </div>
                      <div className="sai__district-stat" style={{ width: 60 }}>
                        <span className="sai__district-stat-val">{fmt(d.pending)}</span>
                      </div>
                      <div className="sai__district-stat" style={{ width: 64 }}>
                        <span className="sai__district-stat-val" style={{ color: d.avgDays > 6 ? '#ba1a1a' : d.avgDays > 3.5 ? '#b45309' : '#396940' }}>
                          {d.avgDays}d
                        </span>
                      </div>
                      <div className="sai__district-stat" style={{ width: 72 }}>
                        <span className="sai__district-stat-val">{d.escalations}</span>
                      </div>
                      <div className="sai__district-stat" style={{ width: 72 }}>
                        <span className="sai__district-stat-val">{d.grievances}</span>
                      </div>
                      <div className="sai__district-stat" style={{ width: 80 }}>
                        <span className="sai__district-stat-val" style={{ color: heatColor(d.riskScore) }}>{d.riskScore}</span>
                      </div>
                      <span className={`sai__risk-tag sai__risk-tag--${d.risk}`} style={{ width: 80, textAlign: 'center' }}>{d.risk.toUpperCase()}</span>
                      <span className="sai__district-chevron material-symbols-outlined">chevron_right</span>
                    </button>
                  ))}

                {filteredDistricts.length === 0 && (
                  <div style={{ padding: '32px 24px', textAlign: 'center', color: '#9ca8a2', fontSize: 13, fontWeight: 600 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>search_off</span>
                    No districts match the selected filters
                  </div>
                )}
              </div>
            </Panel>

            {/* Approval Delay Root-Cause */}
            <Panel title="Approval Delay Root-Cause Analysis" icon="manage_search" badge="AI Generated" badgeVariant="green">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 18 }}>
                {ROOT_CAUSES.map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(3,54,33,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#396940' }}>{r.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0d2118' }}>{r.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309', fontFamily: 'IBM Plex Sans, monospace', flexShrink: 0, marginLeft: 8 }}>{r.pct}% of delays</span>
                      </div>
                      <div style={{ height: 6, background: '#eef0ec', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${r.pct}%`, background: r.pct > 30 ? '#ba1a1a' : r.pct > 15 ? '#b45309' : '#396940', borderRadius: 99, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <AiSummary text={`Aadhaar–bank mapping is causing 38% of approval delays statewide in ${fy}. Field verification resource shortage in drought talukas is accelerating SLA breaches. PMFBY high verification dependency in rainfall-deficit zones requires policy intervention. Immediate deployment of mobile field verification teams to Marathwada division is recommended.`} />
            </Panel>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="sai__right-col">

            {/* AI Escalation Alerts */}
            <Panel
              title="AI Escalation Alerts"
              icon="notifications_active"
              badge={`${filteredAlerts.filter(a => a.priority === 'critical').length} Critical`}
              badgeVariant="red"
            >
              {filteredAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca8a2', fontSize: 12, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>check_circle</span>
                  No alerts match selected priority filter
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredAlerts.map((a, i) => (
                    <div key={i} className={`sai__alert sai__alert--${a.priority}`}>
                      <div className={`sai__alert-dot sai__alert-dot--${a.priority}`} />
                      <div className="sai__alert-body">
                        <div className="sai__alert-title">{a.title}</div>
                        <div className="sai__alert-meta">{a.meta}</div>
                      </div>
                      <span className={`sai__alert-tag sai__alert-tag--${a.priority}`}>{a.priority.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Policy Impact */}
            <Panel title="Policy Impact Insights" icon="policy" badge="Live" badgeVariant="green">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { val: '18,432', lbl: 'Farmers Past SLA' },
                  { val: avgDays + 'd', lbl: 'Avg Clearance Time' },
                  { val: '84%',    lbl: 'DBT Linkage Rate' },
                  { val: '₹1,420Cr', lbl: 'Pending Disbursement' },
                ].map(p => (
                  <div key={p.lbl} style={{ background: '#f3f4f0', borderRadius: 10, padding: '14px 14px', border: '1px solid rgba(20,40,30,0.07)' }}>
                    <div style={{ fontFamily: 'IBM Plex Sans, monospace', fontSize: 20, fontWeight: 800, color: '#0d2118', lineHeight: 1, marginBottom: 5 }}>{p.val}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#717972', lineHeight: 1.4 }}>{p.lbl}</div>
                  </div>
                ))}
              </div>
              <AiSummary text={`Farmer dissatisfaction highest in districts with rainfall deficit above 40% (${season} ${fy}). Compensation urgency is correlated with escalation volume in Marathwada. DBT linkage gap of 16% indicates beneficiary confirmation process failure.`} />
            </Panel>

            {/* Approval Velocity Trend */}
            <Panel title="Approval Velocity Trend" icon="show_chart" badge={`${season} ${fy}`}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca8a2', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Weekly clearances (×1,000) - Maharashtra
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
                {VELOCITY_DATA.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: `${v}%`,
                      background: v > 80 ? '#396940' : v > 60 ? '#4f7c56' : '#b45309',
                      borderRadius: '3px 3px 0 0',
                      opacity: 0.75,
                      transition: 'opacity 0.15s',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    title={`Week ${i + 1}: ${v}K approvals`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 9, color: '#9ca8a2', fontWeight: 600 }}>Week 1</span>
                <span style={{ fontSize: 9, color: '#9ca8a2', fontWeight: 600 }}>Week 12</span>
              </div>
            </Panel>

            {/* Officer Performance */}
            <Panel title="Officer Performance Analytics" icon="badge" badge="Compliance Audit">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 44px', gap: 0, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(20,40,30,0.07)' }}>
                {['Officer', 'Eff %', 'Rej %', 'SLA %'].map((h, i) => (
                  <div key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca8a2', textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {OFFICERS.map((o, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 44px', alignItems: 'center', padding: '10px 0', borderBottom: i < OFFICERS.length - 1 ? '1px solid rgba(20,40,30,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: o.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {o.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0d2118', lineHeight: 1.2 }}>{o.name}</div>
                        <div style={{ fontSize: 10, color: '#717972', fontWeight: 500 }}>{o.district}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: o.efficiency > 80 ? '#396940' : o.efficiency > 65 ? '#b45309' : '#ba1a1a', fontFamily: 'IBM Plex Sans, monospace' }}>{o.efficiency}</div>
                    <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: o.rejRate > 12 ? '#ba1a1a' : '#b45309', fontFamily: 'IBM Plex Sans, monospace' }}>{o.rejRate}</div>
                    <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: o.sla > 80 ? '#396940' : o.sla > 60 ? '#b45309' : '#ba1a1a', fontFamily: 'IBM Plex Sans, monospace' }}>{o.sla}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(186,26,26,0.04)', borderRadius: 8, border: '1px solid rgba(186,26,26,0.1)', display: 'flex', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a', flexShrink: 0, marginTop: 1 }}>gpp_bad</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#ba1a1a', marginBottom: 2 }}>Suspicion Index: Barshi TAO</div>
                  <div style={{ fontSize: 10, color: '#717972', fontWeight: 500 }}>842 approvals in 3-hr window · Audit triggered</div>
                </div>
              </div>
            </Panel>

            {/* Scheme SLA Status */}
            <Panel title="Scheme SLA Status" icon="account_tree" badge={`${filteredSchemes.length} Scheme${filteredSchemes.length !== 1 ? 's' : ''}`}>
              {filteredSchemes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca8a2', fontSize: 12, fontWeight: 600 }}>No schemes match filter</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {filteredSchemes.map(s => {
                    const rate  = Math.round(s.approved / s.applied * 100);
                    const color = rate > 80 ? '#396940' : rate > 60 ? '#b45309' : '#ba1a1a';
                    return (
                      <div key={s.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0d2118' }}>{s.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'IBM Plex Sans, monospace' }}>{rate}%</span>
                        </div>
                        <div style={{ height: 5, background: '#eef0ec', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
                          <div style={{ height: '100%', width: `${rate}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 9, color: '#9ca8a2', fontWeight: 600 }}>{fmt(s.pending)} pending</span>
                          <span style={{ fontSize: 9, color: '#ba1a1a', fontWeight: 600 }}>{s.escalated} escalated</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

          </div>
        </div>

      </div>

      {/* ── DISTRICT INTELLIGENCE DRAWER ── */}
      {drawerDistrict && (
        <DistrictDrawer district={drawerDistrict} onClose={closeDrawer} />
      )}
    </div>
  );
}
