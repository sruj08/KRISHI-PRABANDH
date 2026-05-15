import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { getGrievancesByTaluka } from '../../utils/aiGrievanceEngine';
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

const TALUKA = 'Purandar';

// ── Helpers ───────────────────────────────────────────────────────────────────
function sCol(s) { return s === 'Critical' ? C.red : s === 'High' ? C.amber : s === 'Medium' ? C.blue : C.green; }
function sBg(s)  { return s === 'Critical' ? C.redBg : s === 'High' ? C.amberBg : s === 'Medium' ? C.blueBg : 'rgba(57,105,64,0.08)'; }

const Pill = ({ label, severity }) => (
  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: sBg(severity), color: sCol(severity), whiteSpace: 'nowrap' }}>
    {label || severity}
  </span>
);

const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: 'right' }}>
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text, letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
  </div>
);

const selStyle = {
  fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
  border: `1px solid rgba(20,40,30,0.12)`, background: C.chip,
  color: C.text, outline: 'none', cursor: 'pointer',
};

// ── Case Detail Drawer ────────────────────────────────────────────────────────
function CaseDrawer({ grievance: g, onClose }) {
  const [tab, setTab]           = useState('overview');
  const [actionDone, setAction] = useState({});
  const ai       = g.aiInsights || {};
  const severity = ai.severity || 'Medium';

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const TABS = [
    { id: 'overview',  label: 'Overview',     icon: 'info'      },
    { id: 'ai',        label: 'AI Analysis',  icon: 'smart_toy' },
    { id: 'timeline',  label: 'Timeline',     icon: 'timeline'  },
    { id: 'action',    label: 'Action',       icon: 'task_alt'  },
  ];

  const STEPS = [
    { label: 'Grievance Submitted',  done: true,                date: g.submittedAt ? new Date(g.submittedAt).toLocaleDateString('en-IN') : '—' },
    { label: 'Assigned to TAO',      done: g.daysPending >= 1,  date: '1 day after' },
    { label: 'L1 Escalation (DAO)',  done: g.escalationLevel >= 1, date: g.escalationLevel >= 1 ? 'Escalated' : 'Pending' },
    { label: 'L3 State Escalation',  done: g.escalationLevel >= 2, date: g.escalationLevel >= 2 ? 'Reached State' : 'Pending' },
    { label: 'Resolution / Closure', done: g.derivedStatus === 'Resolved' || g.derivedStatus === 'Closed', date: g.derivedStatus === 'Resolved' ? 'Resolved' : 'Awaited' },
  ];

  const ACTIONS = [
    { id: 'investigate',  icon: 'search',               label: 'Investigate Case',          color: C.darkGreen },
    { id: 'field',        icon: 'agriculture',           label: 'Request Field Survey',      color: C.green     },
    { id: 'escalate',     icon: 'move_up',               label: 'Escalate to DAO',           color: C.amber     },
    { id: 'resolve',      icon: 'check_circle',          label: 'Mark Resolved',             color: C.green     },
    { id: 'flag',         icon: 'flag',                  label: 'Flag for Vigilance',        color: C.red       },
    { id: 'note',         icon: 'edit_note',             label: 'Add Intervention Note',     color: C.blue      },
  ];

  const handle = useCallback(id => setAction(p => ({ ...p, [id]: true })), []);

  return (
    <>
      <div role="presentation" onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
      <div role="dialog" aria-modal="true"
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, zIndex: 401, background: C.surface, boxShadow: '-4px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Drawer header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.divider}`, flexShrink: 0, background: '#f9faf6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 4 }}>
                Case Review · {TALUKA} Taluka
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{g.id}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{g.village} · {g.farmerName}</div>
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

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Scheme',       value: ai.detectedScheme || g.scheme || '—',   icon: 'account_tree'   },
                  { label: 'Category',     value: ai.category || 'General',               icon: 'category'       },
                  { label: 'Village',      value: g.village || '—',                       icon: 'location_on'    },
                  { label: 'Khata No.',    value: g.khataNumber || '—',                   icon: 'article'        },
                  { label: 'Mobile',       value: g.mobile || '—',                        icon: 'phone'          },
                  { label: 'Days Pending', value: `${g.daysPending}d`,                    icon: 'hourglass_empty'},
                  { label: 'SLA Target',   value: `${ai.slaDays || 30}d`,                 icon: 'schedule'       },
                  { label: 'Status',       value: g.derivedStatus || g.status || '—',     icon: 'info'           },
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
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#f9faf6', fontStyle: 'italic' }}>
                  "{g.description || 'No description provided.'}"
                </div>
              </div>

              {g.isSlaBreached && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: C.amberBg, border: `1px solid rgba(180,83,9,0.2)` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.amber, flexShrink: 0 }}>schedule</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.amber, lineHeight: 1.4 }}>
                    SLA breached by {Math.max(0, g.daysPending - (ai.slaDays || 30))} days — escalation to DAO recommended
                  </span>
                </div>
              )}

              {g.linkedTickets?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>AI Clustering Detected</div>
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: C.amberBg, border: `1px solid rgba(180,83,9,0.2)`, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, lineHeight: 1.5, marginBottom: 6 }}>
                      Linked to {g.linkedTickets.length} other ticket{g.linkedTickets.length > 1 ? 's' : ''} — possible organised fraud pattern.
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {g.linkedTickets.map(t => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace', padding: '3px 8px', borderRadius: 5, background: C.chip, color: C.muted }}>{t}</span>
                      ))}
                    </div>
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
                      {g.fraudScore > 0.7 ? 'Refer to District Vigilance Officer. Do not process further without field verification.' : g.fraudScore > 0.4 ? 'Monitor and verify claim documents before processing.' : 'No significant fraud signals. Standard processing applicable.'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Detected Scheme', value: ai.detectedScheme || '—',  icon: 'account_tree'  },
                  { label: 'Severity Level',  value: ai.severity || '—',        icon: 'warning'       },
                  { label: 'Category',        value: ai.category || '—',        icon: 'category'      },
                  { label: 'Route To',        value: ai.routeTo || '—',         icon: 'person'        },
                  { label: 'SLA Target',      value: `${ai.slaDays || 30} days`,icon: 'schedule'      },
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
                      {ai.fraudFlag
                        ? `Immediate field verification required. Cross-check beneficiary Aadhaar and bank account against known fraud clusters in ${TALUKA} taluka.`
                        : severity === 'Critical' || severity === 'High'
                        ? `Priority resolution needed. Process via ${ai.routeTo || 'Circle Officer'} within ${ai.slaDays || 5} days. Coordinate with ${ai.detectedScheme || 'relevant scheme'} officer.`
                        : `Standard process applies. Assign to ${ai.routeTo || 'Circle Officer'} for on-ground verification within ${ai.slaDays || 15} days.`}
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TaoGrievanceQueue() {
  const allGrievances = useMemo(() => getGrievancesByTaluka(TALUKA), []);

  const [activeCase,     setActiveCase]     = useState(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [schemeFilter,   setSchemeFilter]   = useState('All');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [search,         setSearch]         = useState('');

  const openCase  = useCallback(g  => setActiveCase(g), []);
  const closeCase = useCallback(() => setActiveCase(null), []);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const slaBreach  = useMemo(() => allGrievances.filter(g => g.isSlaBreached), [allGrievances]);
  const fraudLinked = useMemo(() => allGrievances.filter(g => g.fraudScore > 0.7), [allGrievances]);
  const newToday   = useMemo(() => allGrievances.filter(g => g.daysPending === 0), [allGrievances]);
  const resolved   = useMemo(() => allGrievances.filter(g => g.derivedStatus === 'Resolved' || g.derivedStatus === 'Closed'), [allGrievances]);

  const schemes = useMemo(() => ['All', ...new Set(allGrievances.map(g => g.aiInsights?.detectedScheme).filter(Boolean))], [allGrievances]);

  const filtered = useMemo(() => allGrievances.filter(g => {
    if (schemeFilter !== 'All' && g.aiInsights?.detectedScheme !== schemeFilter) return false;
    if (severityFilter !== 'All' && g.aiInsights?.severity !== severityFilter) return false;
    if (statusFilter === 'SLA Breached' && !g.isSlaBreached) return false;
    if (statusFilter === 'Fraud Linked' && g.fraudScore <= 0.7) return false;
    if (statusFilter === 'Escalated' && g.escalationLevel === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      return (g.id || '').toLowerCase().includes(q)
        || (g.farmerName || '').toLowerCase().includes(q)
        || (g.village || '').toLowerCase().includes(q)
        || (g.description || '').toLowerCase().includes(q);
    }
    return true;
  }), [allGrievances, schemeFilter, severityFilter, statusFilter, search]);

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">

        {/* ── HEADER STRIP ── */}
        <div className="state-dashboard__strip">
          <span className="material-symbols-outlined state-dashboard__strip-icon">gavel</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="state-dashboard__strip-title">Actionable Grievance Queue · {TALUKA} Taluka</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              AI-classified complaints assigned to your jurisdiction — action required within SLA
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, flexShrink: 0, flexWrap: 'wrap' }}>
            <Stat label="Total Cases"    value={allGrievances.length}  />
            <Stat label="SLA Breached"   value={slaBreach.length}      color={C.red}   />
            <Stat label="Fraud Linked"   value={fraudLinked.length}    color={C.amber} />
            <Stat label="Resolved"       value={resolved.length}       color={C.green} />
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(10px, 1.4vw, 16px)' }}>
          {[
            { icon: 'crisis_alert',    label: 'SLA Breached\nCases',       value: slaBreach.length,    color: C.red   },
            { icon: 'gpp_bad',         label: 'Fraud Linked\n(AI Flagged)', value: fraudLinked.length,  color: C.amber },
            { icon: 'fiber_new',       label: "New Today",                  value: newToday.length,     color: C.blue  },
            { icon: 'check_circle',    label: 'Resolved\n(all time)',       value: resolved.length,     color: C.green },
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

        {/* ── FILTERS BAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, flexWrap: 'wrap', boxShadow: `0 1px 2px rgba(20,40,30,0.04)` }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17, color: C.subtle, flexShrink: 0 }}>filter_list</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginRight: 4 }}>Filter:</span>
          <input type="text" placeholder="Search name / village / ticket…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...selStyle, flex: '1 1 200px', fontWeight: 500 }} />
          <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)} style={selStyle}>
            {schemes.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={selStyle}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selStyle}>
            {['All', 'SLA Breached', 'Fraud Linked', 'Escalated'].map(s => <option key={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginLeft: 'auto', flexShrink: 0 }}>
            {filtered.length} of {allGrievances.length} cases
          </span>
        </div>

        {/* ── GRIEVANCE CARDS ── */}
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 13, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
            No grievances match the current filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(g => {
              const ai       = g.aiInsights || {};
              const severity = ai.severity || 'Medium';
              const overdue  = Math.max(0, g.daysPending - (ai.slaDays || 30));

              return (
                <div key={g.id} style={{
                  background: C.surface, borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${sCol(severity)}`,
                  boxShadow: '0 1px 2px rgba(20,40,30,0.04), 0 4px 12px rgba(20,40,30,0.05)',
                  overflow: 'hidden',
                }}>
                  {/* Card body */}
                  <div style={{ padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                    {/* Left: details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Tag row */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace', padding: '2px 8px', borderRadius: 5, background: C.chip, color: C.muted }}>{g.id}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: C.blueBg, color: C.blue }}>{ai.detectedScheme || g.scheme}</span>
                        <Pill severity={severity} />
                        {g.isSlaBreached && (
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: C.redBg, color: C.red }}>
                            SLA +{overdue}d
                          </span>
                        )}
                        {g.fraudScore > 0.7 && (
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: C.amberBg, color: C.amber, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                            Fraud Linked
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 6 }}>{g.grievanceType}</div>

                      {/* Farmer info */}
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, color: C.text }}>{g.farmerName}</span>
                        {g.village && <> · {g.village}</>}
                        {g.khataNumber && <> · Khata: <span style={{ fontWeight: 600, color: C.text }}>{g.khataNumber}</span></>}
                        {g.mobile && <> · {g.mobile}</>}
                      </div>

                      {/* Description */}
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, padding: '9px 12px', borderRadius: 9, background: '#f9faf6', border: `1px solid ${C.divider}`, fontStyle: 'italic', marginBottom: g.linkedTickets?.length > 0 ? 10 : 0 }}>
                        "{(g.description || '').substring(0, 140)}{g.description?.length > 140 ? '…' : ''}"
                      </div>

                      {/* Fraud clustering alert */}
                      {g.linkedTickets?.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 9, background: C.amberBg, border: `1px solid rgba(180,83,9,0.18)`, marginTop: 8 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.amber, flexShrink: 0, marginTop: 1 }}>device_hub</span>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.amber, marginBottom: 2 }}>AI Clustering Detected</div>
                            <div style={{ fontSize: 11, color: C.amber, lineHeight: 1.5 }}>
                              Linked to {g.linkedTickets.length} other ticket{g.linkedTickets.length > 1 ? 's' : ''}. Possible organised fraud — do not process without field verification.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: quick actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 160, flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 2 }}>Take Action</div>

                      {[
                        { label: 'Investigate Case',   primary: true  },
                        { label: 'Request Field Survey', primary: false },
                        { label: 'Escalate to DAO',    primary: false  },
                      ].map(btn => (
                        <button key={btn.label} type="button" onClick={() => openCase(g)}
                          style={{
                            width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            border: `1px solid ${btn.primary ? C.darkGreen : C.border}`,
                            background: btn.primary ? C.darkGreen : C.surface,
                            color: btn.primary ? '#fff' : C.text,
                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = btn.primary ? C.green : '#f9faf6'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = btn.primary ? C.darkGreen : C.surface; }}>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div style={{ padding: '8px 18px', borderTop: `1px solid ${C.divider}`, background: '#f9faf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: C.muted }}>
                      Submitted: <span style={{ fontWeight: 600, color: C.text }}>{new Date(g.submittedAt).toLocaleDateString('en-IN')}</span>
                      {' '}({g.daysPending} day{g.daysPending !== 1 ? 's' : ''} ago)
                    </span>
                    <span style={{ fontSize: 10, color: C.muted }}>
                      AI SLA Target: <span style={{ fontWeight: 700, color: g.isSlaBreached ? C.red : C.text }}>{ai.slaDays || 30} days</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── CASE DETAIL DRAWER ── */}
      {activeCase && <CaseDrawer grievance={activeCase} onClose={closeCase} />}
    </div>
  );
}
