/**
 * Agricultural Fund Intelligence Centre
 * State Officer - premium AI-driven fund governance command centre
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:    '#033621',
  secondary:  '#396940',
  surface:    '#f9faf6',
  surfaceLow: '#f3f4f0',
  card:       '#ffffff',
  border:     '#E8EAE6',
  green:      '#396940',
  greenLight: '#e8f5e8',
  amber:      '#B45309',
  amberLight: '#FEF3C7',
  red:        '#ba1a1a',
  redLight:   '#fef2f2',
  gold:       '#92641a',
  goldLight:  '#fdf0d5',
  textDark:   '#1a1c1a',
  textGray:   '#414943',
  textMuted:  '#717972',
};

const STATUS = {
  healthy: { color: '#396940', bg: '#e8f5e8', label: 'Healthy' },
  delayed: { color: '#B45309', bg: '#FEF3C7', label: 'Delayed' },
  critical:{ color: '#ba1a1a', bg: '#fef2f2', label: 'Critical' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SCHEMES = [
  { id: 'pmkisan',       name: 'PM-KISAN',               icon: 'agriculture',  color: '#033621', sanctioned: 1840, released: 1680, utilized: 1520, pending: 160, beneficiaries: 112400, fraudAlerts: 3,  utilPct: 90.5, status: 'healthy', dbtSuccess: 94.2, dbtFailed: 1840,  aadhaarIssues: 612,  trend: [72,76,80,84,88,90,91], districtTop: 'Nashik',     districtLow: 'Gadchiroli', description: 'Direct income support ₹6,000/year' },
  { id: 'pmfby',         name: 'PMFBY',                  icon: 'shield',       color: '#1a365d', sanctioned:  980, released:  740, utilized:  580, pending: 160, beneficiaries:  64200, fraudAlerts: 8,  utilPct: 78.4, status: 'delayed', dbtSuccess: 81.6, dbtFailed: 3480,  aadhaarIssues: 1204, trend: [60,63,65,70,74,76,78], districtTop: 'Pune',       districtLow: 'Latur',      description: 'Crop insurance scheme' },
  { id: 'crop-loss',     name: 'Crop Loss Relief',       icon: 'crisis_alert', color: '#7c2d12', sanctioned:  620, released:  490, utilized:  320, pending: 170, beneficiaries:  48800, fraudAlerts: 12, utilPct: 65.3, status: 'critical',dbtSuccess: 71.4, dbtFailed: 5200,  aadhaarIssues: 2103, trend: [45,50,54,58,62,64,65], districtTop: 'Osmanabad',  districtLow: 'Amravati',   description: 'State disaster relief for farmers' },
  { id: 'drip',          name: 'Drip Irrigation Subsidy',icon: 'water_drop',   color: '#0369a1', sanctioned:  340, released:  290, utilized:  270, pending:  20, beneficiaries:  28400, fraudAlerts: 2,  utilPct: 93.1, status: 'healthy', dbtSuccess: 96.8, dbtFailed:  320,  aadhaarIssues:  180, trend: [80,83,86,89,91,92,93], districtTop: 'Satara',     districtLow: 'Nagpur',     description: 'Micro-irrigation subsidy' },
  { id: 'mechanization', name: 'Farm Mechanization',     icon: 'agriculture',  color: '#713f12', sanctioned:  280, released:  210, utilized:  180, pending:  30, beneficiaries:  18600, fraudAlerts: 6,  utilPct: 85.7, status: 'healthy', dbtSuccess: 88.3, dbtFailed: 1120,  aadhaarIssues:  430, trend: [70,74,78,81,83,85,86], districtTop: 'Kolhapur',   districtLow: 'Chandrapur', description: 'Tractors, combines and farm equipment' },
  { id: 'solar-pump',    name: 'Solar Pump Scheme',      icon: 'solar_power',  color: '#ca8a04', sanctioned:  420, released:  310, utilized:  240, pending:  70, beneficiaries:  22800, fraudAlerts: 4,  utilPct: 77.4, status: 'delayed', dbtSuccess: 84.0, dbtFailed: 2100,  aadhaarIssues:  890, trend: [58,62,65,69,73,75,77], districtTop: 'Ahmednagar', districtLow: 'Nandurbar',  description: 'PM-KUSUM solar pump installation' },
  { id: 'soybean',       name: 'Soyabean Compensation',  icon: 'grass',        color: '#166534', sanctioned:  560, released:  320, utilized:  210, pending: 110, beneficiaries:  56200, fraudAlerts: 14, utilPct: 65.6, status: 'critical',dbtSuccess: 68.2, dbtFailed: 6800,  aadhaarIssues: 2840, trend: [40,44,48,52,58,62,66], districtTop: 'Nanded',    districtLow: 'Washim',     description: 'MSP-linked soyabean yield loss compensation' },
  { id: 'soil-health',   name: 'Soil Health Card',       icon: 'compost',      color: '#7c3aed', sanctioned:  180, released:  162, utilized:  148, pending:  14, beneficiaries:  82600, fraudAlerts: 1,  utilPct: 91.4, status: 'healthy', dbtSuccess: 97.2, dbtFailed:  180,  aadhaarIssues:   84, trend: [82,84,86,88,89,90,91], districtTop: 'Wardha',    districtLow: 'Raigad',     description: 'Soil testing and health card issuance' },
];

const TOTAL_SANCTIONED = SCHEMES.reduce((a, s) => a + s.sanctioned, 0);
const TOTAL_RELEASED   = SCHEMES.reduce((a, s) => a + s.released, 0);
const TOTAL_UTILIZED   = SCHEMES.reduce((a, s) => a + s.utilized, 0);
const OVERALL_UTIL     = Math.round((TOTAL_UTILIZED / TOTAL_RELEASED) * 1000) / 10;

// Map alert scheme names → scheme IDs
const ALERT_SCHEME_IDS = {
  'PM-KISAN':           'pmkisan',
  'PMFBY':              'pmfby',
  'Crop Loss Relief':   'crop-loss',
  'Farm Mechanization': 'mechanization',
  'Soyabean':           'soybean',
};

const TREASURY_ALERTS = [
  { id: 1, level: 'critical', icon: 'warning',      msg: '₹48 Cr unutilized in Marathwada - Q4 deadline in 12 days',                      scheme: 'Crop Loss Relief',   time: '2 hrs ago',  dismissed: false },
  { id: 2, level: 'critical', icon: 'block',        msg: '3,200 DBT payments stalled 18+ days in Solapur',                                 scheme: 'PM-KISAN',           time: '4 hrs ago',  dismissed: false },
  { id: 3, level: 'amber',    icon: 'trending_up',  msg: 'Unexpected 42% spike in farm mechanization claims from Barshi cluster',          scheme: 'Farm Mechanization', time: '6 hrs ago',  dismissed: false },
  { id: 4, level: 'amber',    icon: 'person_off',   msg: '1,104 inactive beneficiaries flagged in PM-KISAN Jalgaon rolls',                 scheme: 'PM-KISAN',           time: '8 hrs ago',  dismissed: false },
  { id: 5, level: 'info',     icon: 'receipt_long', msg: 'Same invoice pattern detected across 28 applications in Nanded taluka',          scheme: 'Soyabean',           time: '1 day ago',  dismissed: false },
  { id: 6, level: 'info',     icon: 'analytics',    msg: 'PMFBY utilization below 55% in drought-prone Osmanabad despite high deficit',    scheme: 'PMFBY',              time: '1 day ago',  dismissed: false },
];

const DISTRICT_WATCHLIST = [
  { name: 'Solapur', division: 'Pune',       risk: 'High',   utilPct: 51, pending: 3200, issue: 'DBT backlog',        pendingCr: 48, schemeId: 'pmkisan' },
  { name: 'Beed',    division: 'Marathwada', risk: 'High',   utilPct: 48, pending: 2860, issue: 'Ghost beneficiaries', pendingCr: 32, schemeId: 'pmfby' },
  { name: 'Nanded',  division: 'Marathwada', risk: 'High',   utilPct: 53, pending: 2140, issue: 'Invoice reuse',       pendingCr: 26, schemeId: 'soybean' },
  { name: 'Satara',  division: 'Pune',       risk: 'Medium', utilPct: 64, pending: 1480, issue: 'Fraud cluster',       pendingCr: 18, schemeId: 'crop-loss' },
  { name: 'Latur',   division: 'Marathwada', risk: 'Medium', utilPct: 58, pending: 1920, issue: 'PMFBY underuse',      pendingCr: 22, schemeId: 'pmfby' },
  { name: 'Washim',  division: 'Amravati',   risk: 'Medium', utilPct: 61, pending: 1340, issue: 'Aadhaar failures',    pendingCr: 15, schemeId: 'soybean' },
];

const FUND_FLOW_STEPS = [
  { label: 'Central Sanction',    icon: 'account_balance', status: 'done',    date: 'Apr 1',       amount: '₹2,840 Cr' },
  { label: 'State Approval',      icon: 'gavel',           status: 'done',    date: 'Apr 8',       amount: '₹1,444 Cr' },
  { label: 'District Release',    icon: 'location_city',   status: 'done',    date: 'Apr 18',      amount: '₹3,620 Cr' },
  { label: 'DBT Transfer',        icon: 'send_money',      status: 'active',  date: 'Ongoing',     amount: '₹3,180 Cr sent' },
  { label: 'Beneficiary Confirm', icon: 'how_to_reg',      status: 'pending', date: 'In progress', amount: '18,432 pending' },
];

const SCHEME_TABS = [
  { id: 'financial', label: 'Financial Overview', icon: 'account_balance_wallet' },
  { id: 'district',  label: 'District Analytics', icon: 'bar_chart' },
  { id: 'dbt',       label: 'DBT Intelligence',   icon: 'send_money' },
  { id: 'farmer',    label: 'Farmer Impact',       icon: 'group' },
  { id: 'ai',        label: 'AI Policy Intel',     icon: 'smart_toy' },
];

const DISTRICT_PERF = [
  { name: 'Nashik',     util: 94, pending:  420, status: 'healthy'  },
  { name: 'Pune',       util: 88, pending:  680, status: 'healthy'  },
  { name: 'Nagpur',     util: 85, pending:  840, status: 'healthy'  },
  { name: 'Aurangabad', util: 76, pending: 1240, status: 'delayed'  },
  { name: 'Amravati',   util: 72, pending: 1480, status: 'delayed'  },
  { name: 'Solapur',    util: 51, pending: 3200, status: 'critical' },
  { name: 'Latur',      util: 58, pending: 1920, status: 'critical' },
  { name: 'Beed',       util: 48, pending: 2860, status: 'critical' },
];

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(schemesToExport, fy, season) {
  const headers = ['Scheme', 'Description', 'Sanctioned (Cr)', 'Released (Cr)', 'Utilized (Cr)', 'Pending (Cr)', 'Utilization %', 'Beneficiaries', 'DBT Success %', 'DBT Failed', 'Aadhaar Issues', 'Fraud Alerts', 'Status'];
  const rows = schemesToExport.map(s => [
    s.name, s.description, s.sanctioned, s.released, s.utilized, s.pending,
    s.utilPct, s.beneficiaries, s.dbtSuccess, s.dbtFailed, s.aadhaarIssues, s.fraudAlerts, s.status,
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `AFIC_FundReport_${fy}_${season.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Atom Components ──────────────────────────────────────────────────────────
function Icon({ name, size = 16, color, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, color: color || 'inherit', flexShrink: 0, userSelect: 'none', lineHeight: 1, ...style }}
    >
      {name}
    </span>
  );
}

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.healthy;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function RiskDot({ risk }) {
  const c = risk === 'High' ? C.red : risk === 'Medium' ? C.amber : C.green;
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />;
}

function UtilBar({ pct, height = 4 }) {
  const c = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.red;
  return (
    <div style={{ width: '100%', height, borderRadius: 99, background: C.border, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: c, borderRadius: 99 }} />
    </div>
  );
}

function SparkBar({ values = [], color = C.green, height = 32 }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 2, background: i === values.length - 1 ? color : `${color}50`, height: `${Math.round((v / max) * 100)}%`, minHeight: 2 }} />
      ))}
    </div>
  );
}

function RingChart({ pct = 75, size = 48, color = C.green, track = C.border, stroke = 4.5 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Command Bar ─────────────────────────────────────────────────────────────
function CommandBar({ filters, onFilter, onExport }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 28px', background: C.card, borderBottom: `1px solid ${C.border}` }}>
      {[
        { key: 'fy',       opts: ['2024-25', '2023-24', '2022-23'],                                         icon: 'calendar_month' },
        { key: 'season',   opts: ['Kharif 2024', 'Rabi 2024', 'Kharif 2023'],                               icon: 'sunny' },
        { key: 'scheme',   opts: ['All Schemes', ...SCHEMES.map(s => s.name)],                              icon: 'account_tree' },
        { key: 'status',   opts: ['All Status', 'Healthy', 'Delayed', 'Critical'],                          icon: 'filter_list' },
        { key: 'district', opts: ['All Districts', 'Solapur', 'Nashik', 'Pune', 'Nagpur', 'Beed', 'Latur'], icon: 'location_on' },
      ].map(f => (
        <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: C.surfaceLow, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
          <Icon name={f.icon} size={14} color={C.textMuted} />
          <select
            value={filters[f.key]}
            onChange={e => onFilter(f.key, e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, color: C.textDark, cursor: 'pointer', outline: 'none' }}
          >
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, background: C.greenLight, border: `1px solid #a7d7a8` }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'kp-pulse 1.6s infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>Live Sync</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 8, background: C.surfaceLow, border: `1px solid ${C.border}` }}>
        <Icon name="account_balance" size={13} color={C.primary} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>Treasury · Active</span>
      </div>

      <button
        type="button"
        onClick={onExport}
        title="Download fund data as CSV"
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: C.primary, border: 'none', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, transition: 'opacity 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        <Icon name="download" size={14} color="#fff" />
        Export Report
      </button>
    </div>
  );
}

// ─── KPI Strip ────────────────────────────────────────────────────────────────
function KpiStrip({ onOpenScheme }) {
  const kpis = [
    {
      label: 'Total Funds Released', sub: 'FY 2024-25 · All schemes',
      value: `₹${Math.round(TOTAL_RELEASED / 100)} Cr`,
      tag: 'On Track', tagColor: C.green, tagBg: C.greenLight,
      icon: 'account_balance_wallet', iconBg: C.greenLight, iconColor: C.green,
      action: null,
      detail: (
        <>
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginBottom: 5 }}>
              <span>Central <strong style={{ color: C.textDark }}>₹{Math.round(TOTAL_RELEASED * 0.66 / 100)}Cr</strong></span>
              <span>State <strong style={{ color: C.textDark }}>₹{Math.round(TOTAL_RELEASED * 0.34 / 100)}Cr</strong></span>
            </div>
            <div style={{ height: 5, borderRadius: 99, overflow: 'hidden', display: 'flex', gap: 1 }}>
              <div style={{ width: '66%', background: C.primary, borderRadius: '99px 0 0 99px' }} />
              <div style={{ width: '34%', background: C.secondary, borderRadius: '0 99px 99px 0' }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Across <strong style={{ color: C.textDark }}>36 districts</strong> · 8 active schemes</div>
        </>
      ),
    },
    {
      label: 'Utilization Efficiency', sub: 'Utilized vs Sanctioned',
      value: `${OVERALL_UTIL}%`,
      tag: 'Delayed', tagColor: C.amber, tagBg: C.amberLight,
      icon: 'donut_large', iconBg: C.amberLight, iconColor: C.amber,
      action: null,
      detail: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <RingChart pct={OVERALL_UTIL} size={52} color={C.amber} track={C.amberLight} stroke={5} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { l: 'Healthy (≥80%)', n: 4, c: C.green },
              { l: 'Delayed (60–79%)', n: 2, c: C.amber },
              { l: 'Critical (<60%)', n: 2, c: C.red },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.c, flexShrink: 0 }} />
                <span style={{ color: C.textMuted }}>{r.l}</span>
                <strong style={{ color: C.textDark, marginLeft: 'auto', paddingLeft: 8 }}>{r.n}</strong>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Pending Disbursement', sub: 'DBT · Beneficiary payments',
      value: '18,432',
      tag: 'High Risk', tagColor: C.red, tagBg: C.redLight,
      icon: 'pending_actions', iconBg: C.redLight, iconColor: C.red,
      accentBorder: C.red,
      action: { label: 'Review DBT failures', schemeId: 'crop-loss', tab: 'dbt' },
      detail: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {[
            { icon: 'fingerprint',     label: 'Aadhaar-bank failures', val: '2,103', color: C.red },
            { icon: 'block',           label: 'Verification delays',   val: '4,820', color: C.amber },
            { icon: 'account_balance', label: 'Inactive accounts',     val: '1,340', color: C.amber },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={r.icon} size={12} color={r.color} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{r.label}</span>
              </div>
              <strong style={{ fontSize: 12, color: r.color, fontFamily: 'IBM Plex Sans, monospace' }}>{r.val}</strong>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'AI Anomaly Flags', sub: 'Financial leakage intelligence',
      value: '23 Flags',
      tag: 'AI Active', tagColor: C.gold, tagBg: C.goldLight,
      icon: 'smart_toy', iconBg: C.goldLight, iconColor: C.gold,
      accentBorder: C.gold,
      action: { label: 'Investigate anomalies', schemeId: 'soybean', tab: 'ai' },
      detail: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
          {[
            { label: 'Duplicate Aadhaar',   n: 284 },
            { label: 'Invoice Reused',      n: 118 },
            { label: 'Same Bank Account',   n: 392 },
            { label: 'Ghost Beneficiary',   n:  67 },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>{r.label}</span>
              <strong style={{ fontSize: 12, color: C.gold, fontFamily: 'IBM Plex Sans, monospace' }}>{r.n}</strong>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {kpis.map((k, i) => (
        <div key={i} style={{
          background: C.card, borderRadius: 14, padding: '20px 22px',
          border: `1px solid ${C.border}`,
          borderLeft: k.accentBorder ? `3px solid ${k.accentBorder}` : undefined,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={k.icon} size={17} color={k.iconColor} />
            </div>
            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: k.tagBg, color: k.tagColor }}>
              {k.tag}
            </span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 2 }}>{k.label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.textDark, fontFamily: 'IBM Plex Sans, monospace', lineHeight: 1.1 }}>{k.value}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>{k.sub}</div>
          <div style={{ flex: 1 }}>{k.detail}</div>
          {k.action && (
            <button
              type="button"
              onClick={() => onOpenScheme(k.action.schemeId, k.action.tab)}
              style={{
                marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 8, border: `1px solid ${k.accentBorder || C.primary}`,
                background: 'transparent', cursor: 'pointer',
                color: k.accentBorder || C.primary, fontSize: 11, fontWeight: 700, transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${k.accentBorder || C.primary}10`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon name="arrow_forward" size={13} color={k.accentBorder || C.primary} />
              {k.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Scheme Intelligence Modal ────────────────────────────────────────────────
function SchemePanel({ scheme, activeTab, onTabChange, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!scheme) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${scheme.name} intelligence panel`}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,28,26,0.48)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', background: C.card, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${scheme.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={scheme.icon} size={20} color={scheme.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.textDark }}>{scheme.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{scheme.description}</div>
          </div>
          <StatusPill status={scheme.status} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            title="Close (Esc)"
            style={{ border: 'none', background: C.surfaceLow, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', marginLeft: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = C.border; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surfaceLow; }}
          >
            <Icon name="close" size={18} color={C.textMuted} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '10px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {SCHEME_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                border: `1px solid ${activeTab === t.id ? C.primary : 'transparent'}`,
                background: activeTab === t.id ? C.primary : 'transparent',
                color: activeTab === t.id ? '#fff' : C.textMuted,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.background = C.surfaceLow; }}
              onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon name={t.icon} size={13} color={activeTab === t.id ? '#fff' : C.textMuted} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {activeTab === 'financial' && <FinancialTab scheme={scheme} />}
          {activeTab === 'district'  && <DistrictTab  />}
          {activeTab === 'dbt'       && <DBTTab        scheme={scheme} />}
          {activeTab === 'farmer'    && <FarmerTab     scheme={scheme} />}
          {activeTab === 'ai'        && <AITab         scheme={scheme} />}
        </div>
      </div>
    </div>
  );
}

function TabSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.primary, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function FinancialTab({ scheme }) {
  const bars = [
    { label: 'Sanctioned', val: scheme.sanctioned, color: '#c0c9c1' },
    { label: 'Released',   val: scheme.released,   color: C.primary },
    { label: 'Utilized',   val: scheme.utilized,   color: C.green },
    { label: 'Pending',    val: scheme.pending,     color: C.amber },
  ];
  return (
    <>
      <TabSection title="Budget & Expenditure">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bars.map(b => (
            <div key={b.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                <span style={{ color: C.textGray, fontWeight: 600 }}>{b.label}</span>
                <strong style={{ color: C.textDark, fontFamily: 'IBM Plex Sans, monospace' }}>₹{b.val} Cr</strong>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: C.border, overflow: 'hidden' }}>
                <div style={{ width: `${(b.val / scheme.sanctioned) * 100}%`, height: '100%', background: b.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </TabSection>
      <TabSection title="Key Metrics">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Utilization',   val: `${scheme.utilPct}%`,                        color: STATUS[scheme.status].color },
            { label: 'Beneficiaries', val: scheme.beneficiaries.toLocaleString('en-IN'), color: C.primary },
            { label: 'Fraud Alerts',  val: scheme.fraudAlerts,                           color: scheme.fraudAlerts > 5 ? C.red : C.amber },
          ].map(m => (
            <div key={m.label} style={{ padding: '14px 16px', borderRadius: 10, background: C.surfaceLow, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'IBM Plex Sans, monospace' }}>{m.val}</div>
            </div>
          ))}
        </div>
      </TabSection>
      <TabSection title="Expenditure Trend (Kharif 2024)">
        <div style={{ height: 64 }}><SparkBar values={scheme.trend} color={STATUS[scheme.status].color} height={64} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginTop: 6 }}>
          {['Apr','May','Jun','Jul','Aug','Sep','Oct'].map(m => <span key={m}>{m}</span>)}
        </div>
      </TabSection>
    </>
  );
}

function DistrictTab() {
  return (
    <TabSection title="District Utilization Performance">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DISTRICT_PERF.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: C.surfaceLow, border: `1px solid ${C.border}` }}>
            <RiskDot risk={d.status === 'healthy' ? 'Low' : d.status === 'delayed' ? 'Medium' : 'High'} />
            <span style={{ width: 90, fontSize: 13, fontWeight: 700, color: C.textDark }}>{d.name}</span>
            <div style={{ flex: 1 }}><UtilBar pct={d.util} height={5} /></div>
            <span style={{ width: 40, textAlign: 'right', fontSize: 13, fontWeight: 800, color: STATUS[d.status].color, fontFamily: 'IBM Plex Sans, monospace' }}>{d.util}%</span>
            <span style={{ width: 70, textAlign: 'right', fontSize: 11, color: C.textMuted }}>{d.pending.toLocaleString('en-IN')} pend.</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: C.amberLight, border: `1px solid #fde68a`, fontSize: 12, color: C.amber, fontWeight: 600 }}>
        <Icon name="warning" size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Solapur, Beed, Nanded combined have ₹28 Cr pending - immediate action required
      </div>
    </TabSection>
  );
}

function DBTTab({ scheme }) {
  const successPct = scheme.dbtSuccess;
  return (
    <>
      <TabSection title="Transfer Summary">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { label: 'DBT Success Rate', val: `${successPct}%`,                                              color: successPct >= 90 ? C.green : successPct >= 80 ? C.amber : C.red },
            { label: 'Failed Transfers', val: scheme.dbtFailed.toLocaleString('en-IN'),                      color: C.red },
            { label: 'Aadhaar Issues',   val: scheme.aadhaarIssues.toLocaleString('en-IN'),                  color: C.amber },
            { label: 'Retries Pending',  val: Math.round(scheme.dbtFailed * 0.38).toLocaleString('en-IN'),   color: C.amber },
          ].map(m => (
            <div key={m.label} style={{ padding: '14px 16px', borderRadius: 10, background: C.surfaceLow, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'IBM Plex Sans, monospace' }}>{m.val}</div>
            </div>
          ))}
        </div>
      </TabSection>
      <TabSection title="AI Insight">
        <div style={{ padding: '14px 16px', borderRadius: 10, background: C.redLight, border: `1px solid #fecaca` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon name="smart_toy" size={14} color={C.red} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>DBT Failure Pattern Detected</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.textGray, lineHeight: 1.65 }}>
            Failures concentrated in Aadhaar mapping mismatch clusters - Solapur (38%), Beed (29%).
            Manual seeding update required for {scheme.aadhaarIssues.toLocaleString('en-IN')} beneficiaries.
          </p>
        </div>
      </TabSection>
    </>
  );
}

function FarmerTab({ scheme }) {
  return (
    <>
      <TabSection title="Beneficiary Coverage">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { label: 'Total Beneficiaries', val: scheme.beneficiaries.toLocaleString('en-IN'),                    color: C.primary },
            { label: 'Small & Marginal',    val: Math.round(scheme.beneficiaries * 0.72).toLocaleString('en-IN'), color: C.secondary },
            { label: 'Women Farmers',       val: Math.round(scheme.beneficiaries * 0.34).toLocaleString('en-IN'), color: C.gold },
            { label: 'SC/ST Coverage',      val: Math.round(scheme.beneficiaries * 0.26).toLocaleString('en-IN'), color: '#7c3aed' },
          ].map(m => (
            <div key={m.label} style={{ padding: '14px 16px', borderRadius: 10, background: C.surfaceLow, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: 'IBM Plex Sans, monospace' }}>{m.val}</div>
            </div>
          ))}
        </div>
      </TabSection>
      <TabSection title="Landholding Distribution">
        {[
          { label: 'Marginal (< 1 ha)', pct: 38, color: C.primary },
          { label: 'Small (1–2 ha)',     pct: 34, color: C.secondary },
          { label: 'Medium (2–5 ha)',    pct: 20, color: C.amber },
          { label: 'Large (> 5 ha)',     pct:  8, color: C.red },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ width: 120, fontSize: 12, color: C.textGray, flexShrink: 0 }}>{r.label}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 99, background: C.border, overflow: 'hidden' }}>
              <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 99 }} />
            </div>
            <span style={{ width: 34, fontSize: 13, fontWeight: 700, color: C.textDark, textAlign: 'right', fontFamily: 'IBM Plex Sans, monospace' }}>{r.pct}%</span>
          </div>
        ))}
      </TabSection>
    </>
  );
}

function AITab({ scheme }) {
  const insights = [
    { level: 'critical', icon: 'crisis_alert', text: `Low ${scheme.name} utilization in drought-prone talukas despite high rainfall deficit - fund allocation mismatched with ground conditions.` },
    { level: 'amber',    icon: 'smart_toy',    text: 'DBT failure clusters align with districts reporting highest Aadhaar-bank seeding backlog. Coordinated resolution required.' },
    { level: 'info',     icon: 'lightbulb',    text: `${scheme.districtTop} leads with 94% utilization - dispatch model identified for replication to lagging districts.` },
    { level: 'info',     icon: 'analytics',    text: `Spending velocity in ${scheme.districtLow} is 48% below state average. Field verification recommended.` },
  ];
  const cm = { critical: C.red, amber: C.amber, info: C.primary };
  const bm = { critical: C.redLight, amber: C.amberLight, info: '#f0f6ff' };
  return (
    <TabSection title="AI Policy Intelligence">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: bm[ins.level], borderLeft: `3px solid ${cm[ins.level]}` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Icon name={ins.icon} size={15} color={cm[ins.level]} style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, color: C.textDark, lineHeight: 1.65 }}>{ins.text}</p>
            </div>
          </div>
        ))}
        <div style={{ padding: '14px 16px', borderRadius: 10, background: C.goldLight, border: `1px solid ${C.gold}40`, marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.gold, marginBottom: 10 }}>
            <Icon name="task_alt" size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Recommended Actions
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              `Initiate Aadhaar re-seeding drive in ${scheme.districtLow}`,
              'Schedule district collector review for critical utilization clusters',
              'Release ₹22 Cr held in state treasury for fast-disbursement circuits',
            ].map((a, i) => (
              <li key={i} style={{ fontSize: 13, color: C.textGray, lineHeight: 1.6 }}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </TabSection>
  );
}

// ─── Scheme Tracker ───────────────────────────────────────────────────────────
function SchemeTracker({ filteredSchemes, onSelect, selectedId }) {
  const totalReleased      = filteredSchemes.reduce((a, s) => a + s.released, 0);
  const totalBeneficiaries = filteredSchemes.reduce((a, s) => a + s.beneficiaries, 0);
  const avgUtil = filteredSchemes.length
    ? Math.round(filteredSchemes.reduce((a, s) => a + s.utilPct, 0) / filteredSchemes.length * 10) / 10
    : 0;

  return (
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.primary, marginBottom: 2 }}>
            Fund Allocation Intelligence
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} · Click any row to open detailed intelligence
          </div>
        </div>
        {filteredSchemes.length < SCHEMES.length && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: `${C.primary}12`, color: C.primary, fontWeight: 700 }}>
            Filtered: {filteredSchemes.length} of {SCHEMES.length}
          </span>
        )}
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px 70px', padding: '8px 20px', borderBottom: `1px solid ${C.border}`, background: C.surfaceLow }}>
        {['Scheme', 'Released', 'Beneficiaries', 'Utilized', 'Status'].map(h => (
          <div key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted }}>{h}</div>
        ))}
      </div>

      {filteredSchemes.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
          <Icon name="search_off" size={28} color={C.textMuted} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
          No schemes match the current filters
        </div>
      ) : (
        filteredSchemes.map((s, idx) => (
          <SchemeRow key={s.id} scheme={s} onSelect={onSelect} selected={selectedId === s.id} last={idx === filteredSchemes.length - 1} />
        ))
      )}

      {/* Footer totals */}
      {filteredSchemes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px 70px', padding: '12px 20px', borderTop: `1px solid ${C.border}`, background: C.surfaceLow }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textDark }}>Total · {filteredSchemes.length} schemes</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, fontFamily: 'IBM Plex Sans, monospace' }}>₹{Math.round(totalReleased / 100)}Cr</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, fontFamily: 'IBM Plex Sans, monospace' }}>{(totalBeneficiaries / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.amber, fontFamily: 'IBM Plex Sans, monospace' }}>{avgUtil}%</div>
          <div />
        </div>
      )}
    </div>
  );
}

function SchemeRow({ scheme, onSelect, selected, last }) {
  const [hov, setHov] = useState(false);
  const s = STATUS[scheme.status] || STATUS.healthy;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${scheme.name} intelligence panel`}
      onClick={() => onSelect(scheme.id, 'financial')}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(scheme.id, 'financial'); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px 70px',
        padding: '12px 20px', cursor: 'pointer', transition: 'background 0.12s',
        background: selected ? '#e8f2ec' : hov ? C.surfaceLow : 'transparent',
        borderBottom: last ? 'none' : `1px solid ${C.border}`,
        borderLeft: selected ? `3px solid ${C.primary}` : '3px solid transparent',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: `${scheme.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <Icon name={scheme.icon} size={14} color={scheme.color} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scheme.name}</div>
          <div style={{ marginTop: 4 }}><UtilBar pct={scheme.utilPct} height={3} /></div>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.textDark, fontFamily: 'IBM Plex Sans, monospace', paddingTop: 4 }}>₹{scheme.released}Cr</div>
      <div style={{ fontSize: 12, color: C.textGray, fontFamily: 'IBM Plex Sans, monospace', paddingTop: 4 }}>
        {(scheme.beneficiaries / 1000).toFixed(0)}K
        {scheme.fraudAlerts > 0 && (
          <span title={`${scheme.fraudAlerts} fraud alerts`} style={{ marginLeft: 6, color: C.red, fontSize: 10, fontWeight: 700 }}>⚠ {scheme.fraudAlerts}</span>
        )}
      </div>
      <div style={{ paddingTop: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: s.color, fontFamily: 'IBM Plex Sans, monospace' }}>{scheme.utilPct}%</span>
      </div>
      <div style={{ paddingTop: 5 }}>
        <StatusPill status={scheme.status} />
      </div>
    </div>
  );
}

// ─── Right Column ─────────────────────────────────────────────────────────────
function IntelColumn({ onOpenScheme, alerts, onDismissAlert }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AlertsCard alerts={alerts} onDismissAlert={onDismissAlert} onOpenScheme={onOpenScheme} />
      <WatchlistCard onOpenScheme={onOpenScheme} />
      <TimelineCard />
    </div>
  );
}

function SectionHeader({ title, icon, count, countColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <Icon name={icon} size={16} color={C.primary} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.primary, flex: 1 }}>{title}</span>
      {count != null && (
        <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${countColor || C.primary}14`, color: countColor || C.primary }}>{count}</span>
      )}
    </div>
  );
}

function AlertsCard({ alerts, onDismissAlert, onOpenScheme }) {
  const cm = { critical: C.red, amber: C.amber, info: C.primary };
  const bm = { critical: C.redLight, amber: C.amberLight, info: '#f0f6ff' };
  const activeAlerts = alerts.filter(a => !a.dismissed);
  return (
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <SectionHeader title="Financial Risk Signals" icon="notifications_active" count={activeAlerts.length} countColor={C.red} />
      {activeAlerts.length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: C.textMuted, fontSize: 12 }}>
          <Icon name="check_circle" size={22} color={C.green} style={{ display: 'block', margin: '0 auto 6px' }} />
          All alerts resolved
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeAlerts.map(a => {
            const schemeId = ALERT_SCHEME_IDS[a.scheme];
            return (
              <div key={a.id} style={{ padding: '10px 12px', borderRadius: 10, background: bm[a.level], borderLeft: `3px solid ${cm[a.level]}` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name={a.icon} size={13} color={cm[a.level]} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: C.textDark, lineHeight: 1.55 }}>{a.msg}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {schemeId && (
                        <button
                          type="button"
                          onClick={() => onOpenScheme(schemeId, 'financial')}
                          title={`Open ${a.scheme} details`}
                          style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: `${cm[a.level]}18`, color: cm[a.level], fontWeight: 700, border: `1px solid ${cm[a.level]}30`, cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${cm[a.level]}30`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${cm[a.level]}18`; }}
                        >
                          {a.scheme} ↗
                        </button>
                      )}
                      <span style={{ fontSize: 10, color: C.textMuted }}>{a.time}</span>
                      <button
                        type="button"
                        onClick={() => onDismissAlert(a.id)}
                        title="Dismiss alert"
                        style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'transparent', border: `1px solid ${C.border}`, cursor: 'pointer', color: C.textMuted, transition: 'background 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.surfaceLow; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WatchlistCard({ onOpenScheme }) {
  const [expandedRow, setExpandedRow] = useState(null);
  return (
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <SectionHeader title="District Watchlist" icon="visibility" count={DISTRICT_WATCHLIST.length} />
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 8 }}>
        Click a district to see details
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 52px 1fr', padding: '4px 0 8px', borderBottom: `1px solid ${C.border}` }}>
          {['District', 'Risk', 'Util %', 'Issue'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted }}>{h}</div>
          ))}
        </div>

        {DISTRICT_WATCHLIST.map((d, idx) => {
          const isExpanded = expandedRow === d.name;
          return (
            <div key={d.name}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => setExpandedRow(isExpanded ? null : d.name)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpandedRow(isExpanded ? null : d.name); }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 50px 52px 1fr',
                  padding: '9px 0', cursor: 'pointer',
                  borderBottom: `1px solid ${C.border}`,
                  background: isExpanded ? C.surfaceLow : 'transparent',
                  borderRadius: isExpanded ? '6px 6px 0 0' : 0,
                  transition: 'background 0.12s', alignItems: 'center',
                  outline: 'none',
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = C.surfaceLow; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textDark, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {d.name}
                  <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={13} color={C.textMuted} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RiskDot risk={d.risk} />
                  <span style={{ fontSize: 11, color: d.risk === 'High' ? C.red : C.amber, fontWeight: 600 }}>{d.risk}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: d.utilPct < 60 ? C.red : C.amber, fontFamily: 'IBM Plex Sans, monospace' }}>{d.utilPct}%</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{d.issue}</div>
              </div>

              {/* Expanded detail row */}
              {isExpanded && (
                <div style={{ padding: '10px 12px 12px', background: C.surfaceLow, borderBottom: idx < DISTRICT_WATCHLIST.length - 1 ? `1px solid ${C.border}` : 'none', borderRadius: '0 0 6px 6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Division',       val: d.division },
                      { label: 'Pending Payments', val: d.pending.toLocaleString('en-IN') },
                      { label: 'Pending Amount',   val: `₹${d.pendingCr} Cr` },
                      { label: 'Utilization',      val: `${d.utilPct}%` },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.textDark }}>{m.val}</div>
                      </div>
                    ))}
                  </div>
                  <UtilBar pct={d.utilPct} height={5} />
                  {d.schemeId && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onOpenScheme(d.schemeId, 'dbt'); }}
                      style={{
                        marginTop: 10, width: '100%', padding: '7px 12px', borderRadius: 8,
                        border: `1px solid ${C.primary}`, background: 'transparent',
                        color: C.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${C.primary}10`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon name="open_in_new" size={13} color={C.primary} />
                      View linked scheme details
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineCard() {
  const sc = { done: C.green, active: C.amber, pending: C.textMuted };
  const sb = { done: C.greenLight, active: C.amberLight, pending: C.surfaceLow };
  return (
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <SectionHeader title="Fund Flow Timeline" icon="timeline" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {FUND_FLOW_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: sb[step.status], border: `1.5px solid ${sc[step.status]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={step.icon} size={13} color={sc[step.status]} />
              </div>
              {i < FUND_FLOW_STEPS.length - 1 && (
                <div style={{ width: 1.5, height: 18, background: i < 3 ? C.green : C.border, margin: '3px 0' }} />
              )}
            </div>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: step.status === 'active' ? C.amber : C.textDark }}>{step.label}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: C.textMuted }}>{step.date}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: sc[step.status] }}>{step.amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FundMonitoring() {
  const [filters, setFilters] = useState({
    fy: '2024-25', season: 'Kharif 2024',
    scheme: 'All Schemes', status: 'All Status', district: 'All Districts',
  });
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [schemeTab, setSchemeTab]               = useState('financial');
  const [alerts, setAlerts]                     = useState(TREASURY_ALERTS);

  // Filter schemes based on command bar
  const filteredSchemes = useMemo(() => {
    return SCHEMES.filter(s => {
      if (filters.scheme !== 'All Schemes' && s.name !== filters.scheme) return false;
      if (filters.status !== 'All Status' && s.status !== filters.status.toLowerCase()) return false;
      return true;
    });
  }, [filters.scheme, filters.status]);

  const selectedScheme = useMemo(
    () => SCHEMES.find(s => s.id === selectedSchemeId) || null,
    [selectedSchemeId],
  );

  const handleFilter     = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), []);
  const handleOpenScheme = useCallback((id, tab = 'financial') => { setSelectedSchemeId(id); setSchemeTab(tab); }, []);
  const handleRowSelect  = useCallback((id, tab = 'financial') => {
    setSelectedSchemeId(prev => (prev === id ? null : id));
    setSchemeTab(tab);
  }, []);
  const handleClose      = useCallback(() => setSelectedSchemeId(null), []);
  const handleDismissAlert = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  }, []);
  const handleExport     = useCallback(() => {
    exportCSV(filteredSchemes, filters.fy, filters.season);
  }, [filteredSchemes, filters.fy, filters.season]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.surface, fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      <style>{`
        @keyframes kp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.35)} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#c0c9c1;border-radius:99px}
      `}</style>

      {/* ── Command Header ─────────────────────────────────────────── */}
      <div style={{ padding: '16px 28px 12px', background: C.surface, flexShrink: 0 }}>
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
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: C.primary, flexShrink: 0 }}>account_balance_wallet</span>
            <div>
              <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1f1a', lineHeight: 1.1 }}>
                Agricultural Fund Intelligence Centre
              </h1>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#7a8a7a', letterSpacing: '0.01em' }}>
                AI-driven monitoring of scheme allocation, utilization and delivery efficiency · Maharashtra
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[
              { icon: 'location_on', label: 'Maharashtra' },
              { icon: 'calendar_month', label: `FY ${filters.fy}` },
              { icon: 'grass', label: filters.season },
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
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2d6e3e', display: 'inline-block', animation: 'kp-pulse 2s ease-in-out infinite' }} />
              Synced · 3 min ago
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, color: '#b45309',
              background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.2)',
              borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              {SCHEMES.filter(s => s.status !== 'healthy').length} Alerts
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700, color: '#fff',
              background: C.primary, border: 'none',
              borderRadius: 8, padding: '7px 13px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Command bar ── */}
      <CommandBar filters={filters} onFilter={handleFilter} onExport={handleExport} />

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
        <div style={{ marginBottom: 24 }}>
          <KpiStrip onOpenScheme={handleOpenScheme} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>
          <SchemeTracker
            filteredSchemes={filteredSchemes}
            onSelect={handleRowSelect}
            selectedId={selectedSchemeId}
          />
          <IntelColumn
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
            onOpenScheme={handleOpenScheme}
          />
        </div>
      </div>

      {/* ── Scheme detail modal ── */}
      {selectedScheme && (
        <SchemePanel
          scheme={selectedScheme}
          activeTab={schemeTab}
          onTabChange={setSchemeTab}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
