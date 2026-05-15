import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  getEscalatedGrievances,
  getFraudLinkedGrievances,
  getEnhancedGrievances,
} from '../../utils/aiGrievanceEngine';
import '../state/state-dashboard.css';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#eef0ec',
  surface:   '#ffffff',
  border:    'rgba(20,40,30,0.08)',
  text:      '#1a1c1a',
  muted:     '#717972',
  subtle:    '#5c6560',
  chip:      '#f3f4f0',
  green:     '#396940',
  darkGreen: '#033621',
  red:       '#ba1a1a',
  redBg:     'rgba(186,26,26,0.08)',
  amber:     '#b45309',
  amberBg:   'rgba(180,83,9,0.08)',
  blue:      '#1d4ed8',
  blueBg:    'rgba(29,78,216,0.08)',
  divider:   '#eceee9',
};

const DISTRICT = 'Pune'; // in a real app this would come from auth context

// ── Helpers ───────────────────────────────────────────────────────────────────
function sCol(s) { return s === 'Critical' ? C.red : s === 'High' ? C.amber : s === 'Medium' ? C.blue : C.green; }
function sBg(s)  { return s === 'Critical' ? C.redBg : s === 'High' ? C.amberBg : s === 'Medium' ? C.blueBg : 'rgba(57,105,64,0.08)'; }

const MiniBar = ({ pct, color }) => (
  <div style={{ flex: 1, height: 5, background: C.divider, borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color || C.green, borderRadius: 99, transition: 'width 0.3s' }} />
  </div>
);

const Pill = ({ severity }) => (
  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: sBg(severity), color: sCol(severity) }}>
    {severity}
  </span>
);

const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: 'right' }}>
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text, letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
  </div>
);

// ── Reusable select style ─────────────────────────────────────────────────────
const selStyle = {
  fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
  border: `1px solid rgba(20,40,30,0.12)`, background: C.chip,
  color: C.text, outline: 'none', cursor: 'pointer',
};

// ── Case Detail Drawer ────────────────────────────────────────────────────────
function CaseDrawer({ grievance: g, onClose }) {
  const [tab, setTab] = useState('overview');
  const [actionDone, setActionDone] = useState({});
  const ai = g.aiInsights || {};
  const severity = ai.severity || 'Medium';

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const TABS = [
    { id: 'overview', label: 'Overview',     icon: 'info' },
    { id: 'ai',       label: 'AI Analysis',  icon: 'smart_toy' },
    { id: 'timeline', label: 'Timeline',     icon: 'timeline' },
    { id: 'action',   label: 'Action',       icon: 'task_alt' },
  ];

  const STEPS = [
    { label: 'Grievance Submitted',   done: true,               date: g.submittedAt ? new Date(g.submittedAt).toLocaleDateString('en-IN') : '—' },
    { label: 'Assigned to TAO',       done: g.daysPending >= 1, date: '1 day after' },
    { label: 'L1 Escalation (DAO)',   done: g.escalationLevel >= 1, date: g.escalationLevel >= 1 ? 'Escalated' : 'Pending' },
    { label: 'L3 State Escalation',   done: g.escalationLevel >= 2, date: g.escalationLevel >= 2 ? 'Reached State' : 'Pending' },
    { label: 'Resolution / Closure',  done: g.derivedStatus === 'Resolved' || g.derivedStatus === 'Closed', date: g.derivedStatus === 'Resolved' ? 'Resolved' : 'Awaited' },
  ];

  const ACTIONS = [
    { id: 'takeover', icon: 'admin_panel_settings', label: 'Takeover Case (DAO)',      color: C.darkGreen },
    { id: 'assign',   icon: 'person_add',           label: 'Assign to TAO Officer',    color: C.green },
    { id: 'escalate', icon: 'move_up',              label: 'Escalate to State (L3)',   color: C.amber },
    { id: 'resolve',  icon: 'check_circle',         label: 'Mark Resolved',            color: C.green },
    { id: 'flag',     icon: 'flag',                 label: 'Flag for Vigilance',       color: C.red },
    { id: 'note',     icon: 'edit_note',            label: 'Add Intervention Note',    color: C.blue },
  ];

  const handle = useCallback(id => setActionDone(p => ({ ...p, [id]: true })), []);

  return (
    <>
      <div role="presentation" onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
      <div role="dialog" aria-modal="true"
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, zIndex: 401, background: C.surface, boxShadow: '-4px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.divider}`, flexShrink: 0, background: '#f9faf6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 4 }}>Case Review · {DISTRICT} District</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{g.id}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{g.taluka} · {g.farmerName}</div>
            </div>
            <Pill severity={severity} />
            <button type="button" onClick={onClose} aria-label="Close"
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.chip, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.subtle }}>close</span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 14 }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.12s', background: tab === t.id ? C.darkGreen : 'transparent', color: tab === t.id ? '#fff' : C.muted }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Scheme',        value: ai.detectedScheme || g.scheme || '—',  icon: 'account_tree' },
                  { label: 'Category',      value: ai.category || 'General',              icon: 'category' },
                  { label: 'Assigned To',   value: ai.routeTo || 'Unassigned',            icon: 'person' },
                  { label: 'SLA (days)',    value: `${ai.slaDays || 30}d`,                icon: 'schedule' },
                  { label: 'Days Pending',  value: `${g.daysPending}d`,                  icon: 'hourglass_empty' },
                  { label: 'Status',        value: g.derivedStatus || g.status || '—',   icon: 'info' },
                ].map(f => (
                  <div key={f.label} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#f9faf6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: C.subtle }}>{f.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{f.label}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>Grievance Description</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.65, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#f9faf6' }}>
                  {g.description || 'No description provided.'}
                </div>
              </div>
              {g.isSlaBreached && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: C.amberBg, border: `1px solid rgba(180,83,9,0.2)` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.amber, flexShrink: 0 }}>schedule</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.amber, lineHeight: 1.4 }}>
                    SLA breached by {Math.max(0, g.daysPending - (ai.slaDays || 30))} days — escalation protocol triggered
                  </span>
                </div>
              )}
              {g.linkedTickets?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>Linked Fraud Tickets</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {g.linkedTickets.map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace', padding: '4px 10px', borderRadius: 6, background: C.redBg, color: C.red, border: `1px solid rgba(186,26,26,0.15)` }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 10 }}>Fraud Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#f9faf6' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', border: `4px solid ${g.fraudScore > 0.7 ? C.red : g.fraudScore > 0.4 ? C.amber : C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: g.fraudScore > 0.7 ? C.red : g.fraudScore > 0.4 ? C.amber : C.green, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(g.fraudScore * 100)}%
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                      {g.fraudScore > 0.7 ? 'High Fraud Risk' : g.fraudScore > 0.4 ? 'Moderate Risk' : 'Low Risk'}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                      {g.fraudScore > 0.7 ? 'Refer to District Vigilance Officer immediately.' : g.fraudScore > 0.4 ? 'Monitor and verify claim documents.' : 'No significant fraud signals. Standard processing applicable.'}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Detected Scheme', value: ai.detectedScheme || '—',           icon: 'account_tree' },
                  { label: 'Severity Level',  value: ai.severity || '—',                 icon: 'warning' },
                  { label: 'Category',        value: ai.category || '—',                 icon: 'category' },
                  { label: 'Route To',        value: ai.routeTo || '—',                  icon: 'person' },
                  { label: 'SLA Target',      value: `${ai.slaDays || 30} days`,         icon: 'schedule' },
                  { label: 'Fraud Flag',      value: ai.fraudFlag ? 'Yes — vigilance review required' : 'No', icon: 'shield_locked' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#f9faf6' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: C.subtle, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{r.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: r.label === 'Fraud Flag' && ai.fraudFlag ? C.red : C.text, marginTop: 2 }}>{r.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid rgba(57,105,64,0.2)`, background: 'rgba(57,105,64,0.05)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.green, flexShrink: 0, marginTop: 1 }}>smart_toy</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.green, marginBottom: 4 }}>AI Recommendation</div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                      {ai.fraudFlag ? `Immediate vigilance review required. Cross-check beneficiary Aadhaar and bank account in ${g.district} against known clusters.`
                        : severity === 'Critical' || severity === 'High'
                        ? `Priority resolution needed. Route to ${ai.routeTo || 'TAO'} within ${ai.slaDays || 5} days. Coordinate with scheme officer for ${ai.detectedScheme || 'relevant scheme'} verification.`
                        : `Standard process applies. Assign to ${ai.routeTo || 'TAO'} for verification within ${ai.slaDays || 15} days.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 12 }}>Grievance Lifecycle</div>
              {STEPS.map((step, idx) => (
                <div key={step.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${step.done ? C.green : C.divider}`, background: step.done ? C.green : C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: step.done ? '#fff' : C.muted }}>{step.done ? 'check' : 'radio_button_unchecked'}</span>
                    </div>
                    {idx < STEPS.length - 1 && <div style={{ width: 2, height: 32, background: step.done ? C.green : C.divider, borderRadius: 1 }} />}
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: step.done ? C.text : C.muted, lineHeight: 1.4 }}>{step.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{step.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'action' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 4 }}>Available Actions</div>
              {ACTIONS.map(a => (
                <button key={a.id} type="button" disabled={!!actionDone[a.id]} onClick={() => handle(a.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12, border: actionDone[a.id] ? `1px solid ${C.divider}` : `1px solid ${C.border}`, background: actionDone[a.id] ? C.chip : C.surface, cursor: actionDone[a.id] ? 'default' : 'pointer', width: '100%', textAlign: 'left', opacity: actionDone[a.id] ? 0.6 : 1, transition: 'all 0.12s' }}
                  onMouseEnter={e => { if (!actionDone[a.id]) { e.currentTarget.style.background = '#f9faf6'; e.currentTarget.style.borderColor = 'rgba(20,40,30,0.18)'; } }}
                  onMouseLeave={e => { if (!actionDone[a.id]) { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; } }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: actionDone[a.id] ? C.chip : sBg('Medium'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 17, color: actionDone[a.id] ? C.muted : a.color }}>{actionDone[a.id] ? 'check' : a.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: actionDone[a.id] ? C.muted : C.text }}>{a.label}</div>
                    {actionDone[a.id] && <div style={{ fontSize: 10, color: C.green, marginTop: 2 }}>Action recorded</div>}
                  </div>
                </button>
              ))}
              {actionDone['note'] && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 6 }}>Intervention Note</div>
                  <textarea placeholder="Enter intervention details, officer name, expected resolution date…" rows={4}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, fontFamily: 'inherit', resize: 'vertical', outline: 'none', background: '#f9faf6', boxSizing: 'border-box' }} />
                  <button type="button" style={{ marginTop: 8, padding: '8px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: C.darkGreen, color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Save Note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Taluka rows mock data ──────────────────────────────────────────────────────
const TALUKAS = [
  { name: 'Purandar', pending: 12, breached: 4,  efficiency: 88 },
  { name: 'Baramati', pending: 8,  breached: 1,  efficiency: 95 },
  { name: 'Shirur',   pending: 24, breached: 9,  efficiency: 72 },
  { name: 'Haveli',   pending: 15, breached: 3,  efficiency: 85 },
  { name: 'Bhor',     pending: 6,  breached: 0,  efficiency: 98 },
  { name: 'Indapur',  pending: 19, breached: 6,  efficiency: 76 },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function DistrictGrievanceCommand() {
  const allDistrict    = useMemo(() => getEnhancedGrievances().filter(g => g.district === DISTRICT), []);
  const escalated      = useMemo(() => getEscalatedGrievances().filter(g => g.district === DISTRICT && g.escalationLevel === 1), []);
  const fraudLinked    = useMemo(() => getFraudLinkedGrievances().filter(g => g.district === DISTRICT), []);
  const slaBreached    = useMemo(() => allDistrict.filter(g => g.isSlaBreached && g.derivedStatus !== 'Resolved'), [allDistrict]);
  const critical       = useMemo(() => allDistrict.filter(g => g.aiInsights?.severity === 'Critical'), [allDistrict]);

  const [activeCase,     setActiveCase]     = useState(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [schemeFilter,   setSchemeFilter]   = useState('All');
  const [search,         setSearch]         = useState('');

  const openCase  = useCallback(g  => setActiveCase(g), []);
  const closeCase = useCallback(() => setActiveCase(null), []);

  const schemes = useMemo(() => ['All', ...new Set(allDistrict.map(g => g.aiInsights?.detectedScheme).filter(Boolean))], [allDistrict]);

  const tableRows = useMemo(() => escalated.filter(g => {
    if (schemeFilter !== 'All' && g.aiInsights?.detectedScheme !== schemeFilter) return false;
    if (severityFilter !== 'All' && g.aiInsights?.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (g.id || '').toLowerCase().includes(q) || (g.taluka || '').toLowerCase().includes(q) || (g.farmerName || '').toLowerCase().includes(q);
    }
    return true;
  }), [escalated, schemeFilter, severityFilter, search]);

  // Scheme distribution for the district
  const schemeStats = useMemo(() => {
    const map = {};
    allDistrict.forEach(g => { const s = g.aiInsights?.detectedScheme || 'General'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [allDistrict]);
  const maxScheme = Math.max(...schemeStats.map(s => s.count), 1);

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">

        {/* ── HEADER STRIP ── */}
        <div className="state-dashboard__strip">
          <span className="material-symbols-outlined state-dashboard__strip-icon">admin_panel_settings</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="state-dashboard__strip-title">District Grievance Command · {DISTRICT}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              Escalation management, SLA monitoring and taluka performance for {DISTRICT} District
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, flexShrink: 0, flexWrap: 'wrap' }}>
            <Stat label="Total Grievances"  value={allDistrict.length}  />
            <Stat label="DAO Escalations"   value={escalated.length}    color={C.amber} />
            <Stat label="SLA Breached"      value={slaBreached.length}  color={C.amber} />
            <Stat label="Critical Cases"    value={critical.length}     color={C.red} />
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(10px, 1.4vw, 16px)' }}>
          {[
            { icon: 'pending_actions',     label: 'Pending\nResolution',      value: allDistrict.filter(g => g.derivedStatus !== 'Resolved' && g.derivedStatus !== 'Closed').length, color: C.amber },
            { icon: 'move_up',             label: 'DAO Escalations\n(L1)',     value: escalated.length,     color: C.amber },
            { icon: 'gpp_bad',             label: 'Fraud-Linked\nGrievances',  value: fraudLinked.length,   color: C.red   },
            { icon: 'schedule',            label: 'SLA\nBreaches',             value: slaBreached.length,   color: C.red   },
          ].map(k => (
            <div key={k.label} className="state-dashboard__kpi">
              <div className="state-dashboard__kpi-head">
                <div className="state-dashboard__kpi-icon-wrap">
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#5c6560' }}>{k.icon}</span>
                </div>
                <span className="state-dashboard__kpi-label">{k.label}</span>
              </div>
              <div className="state-dashboard__kpi-value-row">
                <span style={{ fontSize: 28, fontWeight: 700, color: k.color, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {k.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── TALUKA PERFORMANCE + SCHEME DISTRIBUTION ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'clamp(10px, 1.4vw, 16px)', alignItems: 'start' }}>

          {/* Taluka matrix */}
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">Taluka Performance Matrix</h3>
                <p className="state-dashboard__panel-sub">SLA compliance · escalations · pending cases</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 70px 70px 70px', gap: 8, padding: '6px 0 10px', borderBottom: `1px solid ${C.divider}`, marginBottom: 4 }}>
                {['Taluka', 'SLA Compliance', '%', 'Pending', 'Breached'].map(h => (
                  <div key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{h}</div>
                ))}
              </div>
              {TALUKAS.map((t, idx) => {
                const barColor = t.efficiency >= 90 ? C.green : t.efficiency >= 80 ? C.amber : C.red;
                return (
                  <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 70px 70px 70px', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: idx < TALUKAS.length - 1 ? `1px solid ${C.divider}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MiniBar pct={t.efficiency} color={barColor} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: barColor, fontVariantNumeric: 'tabular-nums' }}>{t.efficiency}%</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{t.pending}</div>
                    <div>
                      {t.breached > 0
                        ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: C.redBg, color: C.red }}>{t.breached} esc</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(57,105,64,0.08)', color: C.green }}>Clean</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheme distribution */}
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">Scheme-wise Complaints</h3>
                <p className="state-dashboard__panel-sub">{DISTRICT} District · AI classified</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {schemeStats.map(s => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{s.count}</span>
                  </div>
                  <MiniBar pct={Math.round(s.count / maxScheme * 100)} color={C.green} />
                </div>
              ))}
            </div>

            {fraudLinked.length > 0 && (
              <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 10, background: C.redBg, border: `1px solid rgba(186,26,26,0.15)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.red, flexShrink: 0 }}>gpp_bad</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{fraudLinked.length} Fraud Clusters</div>
                    <div style={{ fontSize: 10, color: C.red, marginTop: 2, lineHeight: 1.5, opacity: 0.85 }}>
                      AI detected multiple grievances linked to identical bank / Aadhaar nodes. Vigilance action required.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FRAUD SIGNALS ── */}
        {fraudLinked.length > 0 && (
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">Fraud-Linked Grievance Signals</h3>
                <p className="state-dashboard__panel-sub">AI fraud score &gt; 0.70 · {DISTRICT} District — click any card to review</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.red, background: 'rgba(255,218,214,0.45)', padding: '5px 10px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {fraudLinked.length} Flagged
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {fraudLinked.slice(0, 6).map(g => (
                <button key={g.id} type="button" onClick={() => openCase(g)}
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(186,26,26,0.12)', background: 'rgba(186,26,26,0.03)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.redBg; e.currentTarget.style.borderColor = 'rgba(186,26,26,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(186,26,26,0.03)'; e.currentTarget.style.borderColor = 'rgba(186,26,26,0.12)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.red, fontFamily: 'IBM Plex Sans, monospace' }}>{g.id}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.red, background: C.redBg, padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>{(g.fraudScore * 100).toFixed(0)}% risk</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3, lineHeight: 1.4 }}>{g.taluka} · {g.farmerName || 'Farmer'}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginBottom: 8 }}>{(g.description || '').substring(0, 72)}…</div>
                  {g.linkedTickets?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {g.linkedTickets.map(t => (
                        <span key={t} style={{ fontSize: 9, fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace', padding: '2px 6px', borderRadius: 4, background: C.chip, color: C.muted }}>{t}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DAO ESCALATIONS TABLE ── */}
        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.amber, flexShrink: 0 }}>notifications_active</span>
              <h3 className="state-dashboard__data-title" style={{ margin: 0 }}>Active DAO Escalations (L1)</h3>
              <span className="state-dashboard__data-meta">{tableRows.length} cases</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              <input type="text" placeholder="Search ticket / taluka / farmer…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...selStyle, width: 200, fontWeight: 500 }} />
              <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)} style={selStyle}>
                {schemes.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={selStyle}>
                {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {tableRows.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
              {escalated.length === 0 ? 'No active DAO escalations for this district.' : 'No cases match the current filters.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.divider}`, background: '#f9faf6' }}>
                    {['Ticket', 'Taluka', 'Farmer / Scheme', 'Severity', 'Days Overdue', 'Status', 'Action'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: i >= 4 ? 'center' : 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, width: i === 0 ? '120px' : i === 6 ? '110px' : 'auto' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((g, idx) => {
                    const overdue = Math.max(0, g.daysPending - (g.aiInsights?.slaDays || 15));
                    return (
                      <tr key={g.id}
                        style={{ borderBottom: idx < tableRows.length - 1 ? `1px solid ${C.divider}` : 'none', transition: 'background 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9faf6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Sans, monospace', fontSize: 11, fontWeight: 600, color: C.muted }}>{g.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: C.text }}>{g.taluka}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{g.farmerName}</div>
                          <div style={{ fontSize: 10, color: C.green, marginTop: 1, fontWeight: 600 }}>{g.aiInsights?.detectedScheme || g.scheme}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Pill severity={g.aiInsights?.severity || 'Medium'} />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: C.redBg, color: C.red, fontVariantNumeric: 'tabular-nums' }}>
                            +{overdue}d
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: C.amberBg, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                            {g.derivedStatus}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button type="button" onClick={() => openCase(g)}
                            style={{ fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: `1px solid rgba(20,40,30,0.12)`, background: C.chip, color: C.text, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.12s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.darkGreen; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.darkGreen; }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.chip; e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(20,40,30,0.12)'; }}>
                            Takeover
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── SLA BREACH PANEL ── */}
        {slaBreached.length > 0 && (
          <div className="state-dashboard__data-panel">
            <div className="state-dashboard__data-head">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.amber, flexShrink: 0 }}>schedule</span>
              <h3 className="state-dashboard__data-title" style={{ margin: 0 }}>SLA Breach Monitor</h3>
              <span className="state-dashboard__data-meta">{slaBreached.length} overdue</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.amber, background: C.amberBg, padding: '5px 10px', borderRadius: 8, flexShrink: 0, marginLeft: 'auto' }}>
                Needs Attention
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.divider}`, background: '#f9faf6' }}>
                    {['Ticket', 'Taluka', 'Scheme', 'Days Overdue', 'Severity', 'Routed To', 'Review'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: i >= 3 ? 'center' : 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slaBreached.slice(0, 8).map((g, idx) => (
                    <tr key={g.id}
                      style={{ borderBottom: idx < Math.min(slaBreached.length, 8) - 1 ? `1px solid ${C.divider}` : 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f9faf6'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '11px 16px', fontFamily: 'IBM Plex Sans, monospace', fontSize: 11, fontWeight: 600, color: C.muted }}>{g.id}</td>
                      <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 600, color: C.text }}>{g.taluka}</td>
                      <td style={{ padding: '11px 16px', fontSize: 11, color: C.green, fontWeight: 600 }}>{g.aiInsights?.detectedScheme || '—'}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontVariantNumeric: 'tabular-nums' }}>+{Math.max(0, g.daysPending - (g.aiInsights?.slaDays || 15))}d</span>
                      </td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <Pill severity={g.aiInsights?.severity || 'Medium'} />
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 11, color: C.muted, textAlign: 'center' }}>{g.aiInsights?.routeTo || '—'}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <button type="button" onClick={() => openCase(g)}
                          style={{ fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: `1px solid rgba(20,40,30,0.12)`, background: C.chip, color: C.text, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.darkGreen; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.darkGreen; }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.chip; e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(20,40,30,0.12)'; }}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── CASE DETAIL DRAWER ── */}
      {activeCase && <CaseDrawer grievance={activeCase} onClose={closeCase} />}
    </div>
  );
}
