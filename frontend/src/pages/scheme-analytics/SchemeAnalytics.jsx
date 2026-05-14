import React, { useState, useMemo } from 'react';
import {
  SEASON, DISTRICT, TALUKA,
  CIRCLE_DATA, PAYMENT_DATA, MONTHLY_TREND,
  AI_ALERTS, RAINFALL_INSIGHTS, SCHEMES, CROPS,
} from '../../mock/scheme-analytics';

// ─── Design tokens ────────────────────────────────────────────────────────────
const PANEL  = '#e2e3df';
const TEXT   = '#1a1c1a';
const MUTED  = '#717972';
const GREEN  = '#396940';
const AMBER  = '#b45309';
const RED    = '#ba1a1a';
const BLUE   = '#1d4ed8';
const BG     = '#f3f4f0';
const WHITE  = '#ffffff';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const rainfallLabel = (pct) => {
  if (pct < 50) return { label: 'Low',          color: RED   };
  if (pct < 65) return { label: 'Below Normal', color: AMBER };
  if (pct < 80) return { label: 'Normal',       color: GREEN };
  return               { label: 'High',          color: BLUE  };
};

const fraudColor = (n) => n >= 20 ? RED : n >= 10 ? AMBER : GREEN;

// ─── Primitive UI pieces ──────────────────────────────────────────────────────
const MiniBar = ({ pct, color, h = 6 }) => (
  <div style={{ height: h, background: '#eceeeb', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{
    display: 'inline-block', fontSize: 9, fontWeight: 800,
    letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 5,
    background: `${color}1a`, color, border: `1px solid ${color}30`,
  }}>
    {label}
  </span>
);

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12,
      padding: '14px 16px', flex: '1 1 150px', minWidth: 150,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}1a`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17, color }}>{icon}</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.05em', lineHeight: 1.3 }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>{sub}</div>}
    </div>
  );
}

// ─── Horizontal bar chart (div-based) ────────────────────────────────────────
function HBarChart({ data, valueKey, labelKey, color, suffix = '' }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {data.map((d) => (
        <div key={d[labelKey]} style={{ display: 'grid', gridTemplateColumns: 'minmax(108px, 1.1fr) 1fr 52px', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: TEXT, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d[labelKey]}
          </div>
          <MiniBar pct={(d[valueKey] / max) * 100} color={color} h={10} />
          <div style={{ fontSize: 10, fontWeight: 800, color, textAlign: 'right' }}>
            {suffix}{typeof d[valueKey] === 'number' && d[valueKey] < 100 ? d[valueKey] : d[valueKey].toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SVG line chart ───────────────────────────────────────────────────────────
function LineChart({ data, valueKey, labelKey, color = GREEN, h = 110 }) {
  const vals  = data.map(d => d[valueKey]);
  const max   = Math.max(...vals);
  const min   = Math.min(...vals);
  const W = 400; const pad = { t: 8, b: 22, l: 6, r: 6 };
  const iW = W - pad.l - pad.r;
  const iH = h - pad.t - pad.b;
  const xStep = iW / (data.length - 1);
  const y = (v) => h - pad.b - ((v - min) / (max - min || 1)) * iH;
  const pts = data.map((d, i) => `${pad.l + i * xStep},${y(d[valueKey])}`).join(' ');
  const area = [`${pad.l},${h - pad.b}`, ...data.map((d, i) => `${pad.l + i * xStep},${y(d[valueKey])}`), `${pad.l + (data.length - 1) * xStep},${h - pad.b}`].join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${h}`} style={{ width: '100%', height: h }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="saGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity=".15" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#saGrad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={pad.l + i * xStep} cy={y(d[valueKey])} r="3" fill={WHITE} stroke={color} strokeWidth="1.8" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pad.l + i * xStep} y={h - 4} textAnchor="middle" fontSize="8" fill={MUTED} fontFamily="system-ui">
          {d[labelKey]}
        </text>
      ))}
    </svg>
  );
}

// ─── Circle detail drawer ─────────────────────────────────────────────────────
function CircleDrawer({ row, onClose }) {
  if (!row) return null;
  const rf = rainfallLabel(row.rainfall);
  const approvalPct = ((row.approved / row.applications) * 100).toFixed(0);
  const coverageLine = row.coverage ? row.coverage : null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.22)' }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 901,
        width: 360, background: WHITE,
        borderLeft: `1px solid ${PANEL}`,
        boxShadow: '-6px 0 28px rgba(0,0,0,0.09)',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        {/* header */}
        <div style={{
          padding: '15px 20px', borderBottom: `1px solid ${PANEL}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          position: 'sticky', top: 0, background: WHITE, zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{row.circle}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 3, fontWeight: 600 }}>
              {DISTRICT} District · {TALUKA} Taluka · Revenue circle · {SEASON}
            </div>
            {coverageLine && (
              <div style={{ fontSize: 10, color: MUTED, marginTop: 6, fontWeight: 600, lineHeight: 1.45 }}>
                {coverageLine}
              </div>
            )}
          </div>
          <button onClick={onClose} className="btn btn-icon" aria-label="Close drawer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KV grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Total Villages',    value: row.villages,                         icon: 'location_city' },
              { label: 'Farmers Benefited', value: row.farmers.toLocaleString(),          icon: 'person'        },
              { label: 'Main Crop',         value: row.mainCrop,                          icon: 'grass'         },
              { label: 'Rainfall',          value: `${row.rainfall}%`,                   icon: 'water_drop', badge: rf },
              { label: 'Pending Apps',      value: row.pending.toLocaleString(),          icon: 'pending_actions', warn: true },
              { label: 'Payment Failures',  value: row.paymentFailures,                  icon: 'cancel',       warn: true },
              { label: 'AI Flagged',        value: row.fraudFlags,                       icon: 'flag', warn: row.fraudFlags >= 10 },
              { label: 'Rejected',          value: row.rejected,                         icon: 'block'         },
            ].map(item => (
              <div key={item.label} style={{
                background: BG, borderRadius: 8, padding: '10px 12px', border: `1px solid ${PANEL}`,
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: item.warn ? AMBER : TEXT }}>{item.value}</div>
                {item.badge && (
                  <div style={{ marginTop: 5 }}><Badge label={item.badge.label} color={item.badge.color} /></div>
                )}
              </div>
            ))}
          </div>

          {/* Compensation progress */}
          <div style={{ background: BG, borderRadius: 10, padding: '12px 14px', border: `1px solid ${PANEL}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.1em', marginBottom: 6 }}>
              COMPENSATION RELEASED
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: GREEN, marginBottom: 8 }}>₹{row.compensation} Cr</div>
            <MiniBar pct={Number(approvalPct)} color={GREEN} h={8} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: MUTED, fontWeight: 600 }}>
              <span>{approvalPct}% approved</span>
              <span>{row.applications.toLocaleString()} total</span>
            </div>
          </div>

          {/* Top villages */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.1em', marginBottom: 10 }}>
              TOP AFFECTED VILLAGES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {row.topVillages.map((v, i) => (
                <div key={v} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: BG, borderRadius: 7,
                  border: `1px solid ${PANEL}`, fontSize: 12, fontWeight: 600, color: TEXT,
                }}>
                  <span>{i + 1}. {v}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: MUTED }}>chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SchemeAnalytics() {
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [sortKey, setSortKey]   = useState('applications');
  const [sortDir, setSortDir]   = useState('desc');
  const urlCircle = new URLSearchParams(window.location.search).get('circle') || '';
  const [filterCircle, setFilterCircle] = useState(urlCircle);
  const [filterScheme, setFilterScheme] = useState('All Schemes');
  const [filterCrop,   setFilterCrop]   = useState('All Crops');

  // aggregate totals
  const totals = useMemo(() => CIRCLE_DATA.reduce((acc, r) => ({
    applications: acc.applications + r.applications,
    approved:     acc.approved     + r.approved,
    pending:      acc.pending      + r.pending,
    rejected:     acc.rejected     + r.rejected,
    compensation: +(acc.compensation + r.compensation).toFixed(1),
    fraudFlags:   acc.fraudFlags   + r.fraudFlags,
  }), { applications: 0, approved: 0, pending: 0, rejected: 0, compensation: 0, fraudFlags: 0 }), []);

  // sort + filter table
  const tableData = useMemo(() => {
    let d = [...CIRCLE_DATA];
    const q = filterCircle.trim().toLowerCase();
    if (q) {
      d = d.filter((r) => {
        if (r.circle.toLowerCase().includes(q)) return true;
        if (r.coverage?.toLowerCase().includes(q)) return true;
        return false;
      });
    }
    d.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const x = a[sortKey];
      const y = b[sortKey];
      if (typeof x === 'string' && typeof y === 'string') {
        const c = x.localeCompare(y);
        if (c === 0) return 0;
        return c > 0 ? dir : -dir;
      }
      const nx = Number(x);
      const ny = Number(y);
      if (nx === ny) return 0;
      return nx > ny ? dir : -dir;
    });
    return d;
  }, [filterCircle, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => (
    <span style={{ fontSize: 9, marginLeft: 2, color: sortKey === col ? GREEN : MUTED }}>
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const METRIC_COLS = [
    { key: 'applications', label: 'Applications' },
    { key: 'approved',     label: 'Approved'     },
    { key: 'pending',      label: 'Pending'      },
    { key: 'compensation', label: 'Compensation' },
    { key: 'rainfall',     label: 'Rainfall %'   },
    { key: 'fraudFlags',   label: 'AI flags'     },
  ];

  const circleContext = useMemo(() => {
    const totalV = CIRCLE_DATA.reduce((a, r) => a + r.villages, 0);
    const totalFarmers = CIRCLE_DATA.reduce((a, r) => a + r.farmers, 0);
    const wRain = CIRCLE_DATA.reduce((a, r) => a + r.rainfall * r.applications, 0) / Math.max(totals.applications, 1);
    const dbFails = CIRCLE_DATA.reduce((a, r) => a + r.paymentFailures, 0);
    return { totalV, totalFarmers, wRain, dbFails };
  }, [totals.applications]);

  const payTotal = PAYMENT_DATA.reduce((s, r) => s + r.count, 0);

  return (
    <div style={{ background: BG, padding: '24px 32px 48px', boxSizing: 'border-box' }}>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>
            Circle-wise scheme analysis
          </h1>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginTop: 6, maxWidth: 640, lineHeight: 1.45 }}>
            Compare revenue circles within {TALUKA} taluka ({DISTRICT}) — applications, clearances, rainfall context, and DBT outcomes for {SEASON}.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 7, fontSize: 12, color: MUTED, fontWeight: 600 }}>
            <span style={{ color: GREEN, fontWeight: 800 }}>{SEASON}</span>
            <span>·</span>
            <span>{totals.applications.toLocaleString()} Applications</span>
            <span>·</span>
            <span style={{ color: GREEN }}>{totals.approved.toLocaleString()} Approved</span>
            <span>·</span>
            <span style={{ color: TEXT, fontWeight: 800 }}>₹{totals.compensation} Cr Released</span>
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, padding: '5px 12px', borderRadius: 6,
          background: 'rgba(57,105,64,0.1)', color: GREEN, border: `1px solid rgba(57,105,64,0.25)`,
          alignSelf: 'flex-start',
        }}>
          {TALUKA.toUpperCase()} TALUKA · {DISTRICT.toUpperCase()}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div style={{
        background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 10,
        padding: '10px 14px', marginBottom: 18,
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: MUTED }}>filter_list</span>
        {[
          { label: 'Scheme', value: filterScheme, set: setFilterScheme, opts: SCHEMES },
          { label: 'Crop',   value: filterCrop,   set: setFilterCrop,   opts: CROPS   },
        ].map(({ label, value, set, opts }) => (
          <select key={label} value={value} onChange={e => set(e.target.value)} style={{
            fontSize: 11, padding: '5px 8px', borderRadius: 6,
            border: `1px solid ${PANEL}`, background: BG, color: TEXT,
            fontWeight: 600, outline: 'none', cursor: 'pointer',
          }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <input
          placeholder="Search circle or coverage…"
          value={filterCircle}
          onChange={e => setFilterCircle(e.target.value)}
          style={{
            flex: 1, minWidth: 200, fontSize: 11, padding: '5px 10px',
            borderRadius: 6, border: `1px solid ${PANEL}`, background: BG,
            color: TEXT, outline: 'none',
          }}
        />
        <button
          onClick={() => { setFilterCircle(''); setFilterScheme('All Schemes'); setFilterCrop('All Crops'); }}
          style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 6,
            border: `1px solid ${PANEL}`, background: WHITE, color: MUTED,
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          Clear
        </button>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <SummaryCard icon="receipt_long"    label="Total Applications" value={totals.applications.toLocaleString()} sub={`${SEASON} · ${TALUKA} · ${DISTRICT}`} color={GREEN} />
        <SummaryCard icon="check_circle"    label="Approved Cases"     value={totals.approved.toLocaleString()}     sub={`${((totals.approved/totals.applications)*100).toFixed(1)}% approval rate`} color={GREEN} />
        <SummaryCard icon="pending_actions" label="Pending Cases"      value={totals.pending.toLocaleString()}      sub="Awaiting circle-level clearance"        color={AMBER} />
        <SummaryCard icon="cancel"          label="Rejected Cases"     value={totals.rejected.toLocaleString()}     sub="Ineligible / incomplete"                color={RED}   />
        <SummaryCard icon="payments"        label="Compensation"       value={`₹${totals.compensation} Cr`}        sub="DBT released this season"               color={BLUE}  />
        <SummaryCard icon="flag"            label="AI Flagged Cases"   value={totals.fraudFlags}                    sub="Needs officer review"                   color={RED}   />
      </div>

      {/* ── Main content: circle table + right sidebar ───────────────────
          Stretch the left card to match the taller sidebar so the grid row
          does not leave a dead band of background above the charts row. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 292px', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>

        {/* Circle table — report-style comparison (no trading-style spark/pulse UI) */}
        <div style={{
          background: WHITE,
          border: `1px solid ${PANEL}`,
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxShadow: '0 1px 4px rgba(26,28,26,0.06)',
        }}>
          <div style={{ height: 2, flexShrink: 0, background: GREEN, opacity: 0.55 }} />
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: `1px solid ${PANEL}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
            background: WHITE,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
                Revenue circles — comparison
              </div>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginTop: 8, lineHeight: 1.5 }}>
                {CIRCLE_DATA.length} circles in {TALUKA} taluka · {circleContext.totalV} villages ·{' '}
                {circleContext.totalFarmers.toLocaleString()} farmers covered · application-weighted mean rainfall{' '}
                <span style={{ color: TEXT, fontWeight: 700 }}>{circleContext.wRain.toFixed(1)}%</span> ·{' '}
                {circleContext.dbFails} payment issues logged (all circles)
              </div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, whiteSpace: 'nowrap' }}>
              Open a row for village list and notes
            </div>
          </div>

          <div style={{
            flex: 1,
            minHeight: 'clamp(220px, 36vh, 520px)',
            overflow: 'auto',
          }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{
                  background: BG,
                  boxShadow: `0 1px 0 ${PANEL}`,
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
                >
                  <th style={{ width: 32, padding: '9px 6px', textAlign: 'center', fontWeight: 700, color: MUTED, letterSpacing: '0.04em', borderBottom: `1px solid ${PANEL}` }}>#</th>
                  <th
                    onClick={() => handleSort('circle')}
                    style={{
                      padding: '9px 10px', textAlign: 'left', fontWeight: 700, color: MUTED,
                      letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none',
                      borderBottom: `1px solid ${PANEL}`, minWidth: 168,
                    }}
                  >
                    Revenue circle<SortIcon col="circle" />
                  </th>
                  <th
                    onClick={() => handleSort('mainCrop')}
                    style={{
                      padding: '9px 8px', textAlign: 'left', fontWeight: 700, color: MUTED,
                      letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none',
                      borderBottom: `1px solid ${PANEL}`, minWidth: 112,
                    }}
                  >
                    Primary crop<SortIcon col="mainCrop" />
                  </th>
                  {METRIC_COLS.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{
                      padding: '9px 10px', textAlign: 'left', fontWeight: 700, color: MUTED,
                      letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none',
                      borderBottom: `1px solid ${PANEL}`, whiteSpace: 'nowrap',
                    }}>
                      {col.label}<SortIcon col={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => {
                  const rf = rainfallLabel(row.rainfall);
                  const fc = fraudColor(row.fraudFlags);
                  const approvePct = (row.approved / row.applications) * 100;
                  const stripe = i % 2 === 0 ? WHITE : BG;
                  const pendHigh = row.pending > 350;
                  return (
                    <tr
                      key={row.circle}
                      onClick={() => setSelectedCircle(row)}
                      style={{
                        borderBottom: `1px solid ${PANEL}`,
                        background: stripe,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(57,105,64,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = stripe; }}
                    >
                      <td style={{ padding: '9px 6px', textAlign: 'center', fontWeight: 600, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '9px 10px', fontWeight: 600, color: TEXT, verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: MUTED, flexShrink: 0, marginTop: 1 }}>trip_origin</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700 }}>{row.circle}</div>
                            <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, marginTop: 4, lineHeight: 1.35 }}>
                              {row.villages} villages · {row.farmers.toLocaleString()} farmers
                            </div>
                            {row.coverage ? (
                              <div
                                title={row.coverage}
                                style={{
                                  fontSize: 10, color: MUTED, fontWeight: 600, marginTop: 5,
                                  lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {row.coverage}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '9px 8px', verticalAlign: 'top', maxWidth: 140, fontSize: 10, fontWeight: 600, color: TEXT, lineHeight: 1.35 }}>
                        {row.mainCrop}
                      </td>
                      <td style={{ padding: '9px 10px', fontWeight: 600, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>
                        {row.applications.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', minWidth: 86, verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: GREEN, marginBottom: 4 }}>{row.approved.toLocaleString()}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MiniBar pct={approvePct} color={GREEN} h={4} />
                          <span style={{ fontSize: 9, color: MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>{approvePct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{
                        padding: '9px 10px',
                        fontWeight: 700,
                        color: pendHigh ? AMBER : TEXT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                      >
                        {row.pending.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', fontWeight: 600, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>
                        ₹{row.compensation} Cr
                      </td>
                      <td style={{ padding: '9px 10px', minWidth: 108, verticalAlign: 'top' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: rf.color, marginBottom: 4 }}>
                          {row.rainfall}% · {rf.label}
                        </div>
                        <MiniBar pct={row.rainfall} color={rf.color} h={4} />
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        {row.fraudFlags >= 10 ? (
                          <Badge label={`Review · ${row.fraudFlags}`} color={fc} />
                        ) : (
                          <span style={{ fontWeight: 600, color: MUTED }}>{row.fraudFlags}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{
            padding: '9px 16px',
            borderTop: `1px solid ${PANEL}`,
            background: BG,
            fontSize: 10,
            color: MUTED,
            fontWeight: 600,
            flexShrink: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          >
            <span>
              Showing <span style={{ color: TEXT, fontWeight: 700 }}>{tableData.length}</span> of {CIRCLE_DATA.length} circles
            </span>
            <span style={{ textAlign: 'right' }}>
              Figures are illustrative for this screen; replace with live API when available.
            </span>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

          {/* AI Alerts */}
          <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', borderBottom: `1px solid ${PANEL}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: RED }}>warning</span>
              <div style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>AI Alerts</div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge label={`${AI_ALERTS.filter(a => a.severity === 'high').length} HIGH`} color={RED} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {AI_ALERTS.map(a => (
                <div key={a.id} style={{
                  padding: '10px 14px', borderBottom: `1px solid ${PANEL}`, display: 'flex', gap: 9,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                    background: a.severity === 'high' ? RED : a.severity === 'medium' ? AMBER : GREEN,
                  }} />
                  <div>
                    <div style={{ fontSize: 11, color: TEXT, fontWeight: 600, lineHeight: 1.45 }}>{a.text}</div>
                    <div style={{ fontSize: 9, color: MUTED, marginTop: 3, fontWeight: 600 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rainfall insights */}
          <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', borderBottom: `1px solid ${PANEL}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: BLUE }}>water_drop</span>
              <div style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>Rainfall & Crop Insights</div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RAINFALL_INSIGHTS.map(ins => {
                const rf = rainfallLabel(ins.rainfall);
                return (
                  <div key={ins.circle} style={{
                    padding: '9px 11px', borderRadius: 8,
                    background: ins.tone === 'warn' ? `${AMBER}0d` : BG,
                    border: `1px solid ${ins.tone === 'warn' ? AMBER + '44' : PANEL}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: TEXT }}>{ins.circle}</span>
                      <Badge label={`${ins.rainfall}%`} color={rf.color} />
                    </div>
                    <div style={{ fontSize: 10, color: TEXT, fontWeight: 600 }}>{ins.note}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{ins.crop} · {ins.claims} claims</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>

        {/* Applications by circle */}
        <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, marginBottom: 14 }}>Applications by Circle</div>
          <HBarChart
            data={[...CIRCLE_DATA].sort((a, b) => b.applications - a.applications)}
            valueKey="applications" labelKey="circle" color={GREEN}
          />
        </div>

        {/* Compensation distribution */}
        <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, marginBottom: 14 }}>Compensation Released (₹ Cr)</div>
          <HBarChart
            data={[...CIRCLE_DATA].sort((a, b) => b.compensation - a.compensation)}
            valueKey="compensation" labelKey="circle" color={BLUE} suffix="₹"
          />
        </div>

        {/* Monthly claim trend */}
        <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, marginBottom: 2 }}>Monthly Claim Trend</div>
          <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, marginBottom: 10 }}>Nov 2024 – May 2025</div>
          <LineChart data={MONTHLY_TREND} valueKey="claims" labelKey="month" color={GREEN} h={118} />
        </div>
      </div>

      {/* ── Bottom: payment status + rainfall vs claims ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Payment Status */}
        <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: `1px solid ${PANEL}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>Payment Status</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 2, fontWeight: 600 }}>Direct benefit transfer breakdown</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: BG }}>
                {['Status', 'Count', 'Share'].map(h => (
                  <th key={h} style={{
                    padding: '8px 14px', textAlign: h === 'Count' || h === 'Share' ? 'right' : 'left',
                    fontWeight: 800, color: MUTED, letterSpacing: '0.06em',
                    borderBottom: `1px solid ${PANEL}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENT_DATA.map((row, i) => (
                <tr key={row.status} style={{ background: i % 2 === 0 ? WHITE : BG, borderBottom: `1px solid ${PANEL}` }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: TEXT }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                      {row.status}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: row.color }}>
                    {row.count.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', minWidth: 80 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>
                        {((row.count / payTotal) * 100).toFixed(1)}%
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: 60 }}>
                          <MiniBar pct={(row.count / payTotal) * 100} color={row.color} h={5} />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '9px 14px', borderTop: `1px solid ${PANEL}`, background: BG, fontSize: 10, color: MUTED, fontWeight: 600 }}>
            Total DBT transactions: {payTotal.toLocaleString()}
          </div>
        </div>

        {/* Rainfall vs Crop Loss Claims */}
        <div style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: `1px solid ${PANEL}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>Rainfall vs Crop Loss Claims</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 2, fontWeight: 600 }}>Sorted by rainfall (lowest first) · {SEASON}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: BG }}>
                  {['Circle', 'Rainfall', 'Main Crop', 'Pending Claims', 'Compensation'].map(h => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left', fontWeight: 800, color: MUTED,
                      borderBottom: `1px solid ${PANEL}`, whiteSpace: 'nowrap', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...CIRCLE_DATA].sort((a, b) => a.rainfall - b.rainfall).map((row, i) => {
                  const rf = rainfallLabel(row.rainfall);
                  return (
                    <tr key={row.circle} style={{ background: i % 2 === 0 ? WHITE : BG, borderBottom: `1px solid ${PANEL}` }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: TEXT }}>{row.circle}</td>
                      <td style={{ padding: '8px 12px', minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 48 }}>
                            <MiniBar pct={row.rainfall} color={rf.color} h={6} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: rf.color, whiteSpace: 'nowrap' }}>
                            {row.rainfall}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: 10, color: MUTED, fontWeight: 600 }}>{row.mainCrop}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: TEXT }}>{row.pending.toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: GREEN }}>₹{row.compensation} Cr</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Circle drawer */}
      <CircleDrawer row={selectedCircle} onClose={() => setSelectedCircle(null)} />
    </div>
  );
}
