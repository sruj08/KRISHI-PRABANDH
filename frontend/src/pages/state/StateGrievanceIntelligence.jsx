import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { getEnhancedGrievances, getFraudLinkedGrievances } from '../../utils/aiGrievanceEngine';
import './state-dashboard.css';

// ── Design tokens (identical to state-dashboard / FundMonitoring) ─────────────
const C = {
  bg:       '#eef0ec',
  surface:  '#ffffff',
  border:   'rgba(20,40,30,0.08)',
  text:     '#1a1c1a',
  muted:    '#717972',
  subtle:   '#5c6560',
  chip:     '#f3f4f0',
  green:    '#396940',
  darkGreen:'#033621',
  red:      '#ba1a1a',
  redBg:    'rgba(186,26,26,0.08)',
  amber:    '#b45309',
  amberBg:  'rgba(180,83,9,0.08)',
  blue:     '#1d4ed8',
  blueBg:   'rgba(29,78,216,0.08)',
  divider:  '#eceee9',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function sCol(s)  { return s === 'Critical' ? C.red : s === 'High' ? C.amber : s === 'Medium' ? C.blue : C.green; }
function sBg(s)   { return s === 'Critical' ? C.redBg : s === 'High' ? C.amberBg : s === 'Medium' ? C.blueBg : 'rgba(57,105,64,0.08)'; }

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

// ── Case Detail Drawer ────────────────────────────────────────────────────────
function CaseDrawer({ grievance, onClose }) {
  const [tab, setTab] = useState('overview');

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!grievance) return null;

  const g        = grievance;
  const ai       = g.aiInsights || {};
  const severity = ai.severity || 'Medium';
  const tabs     = [
    { id: 'overview',   label: 'Overview',        icon: 'info' },
    { id: 'ai',         label: 'AI Analysis',     icon: 'smart_toy' },
    { id: 'timeline',   label: 'Timeline',        icon: 'timeline' },
    { id: 'action',     label: 'Action Required', icon: 'task_alt' },
  ];

  const TIMELINE_STEPS = [
    { label: 'Grievance Submitted',    done: true,  date: g.submittedAt ? new Date(g.submittedAt).toLocaleDateString('en-IN') : '-' },
    { label: 'Assigned to TAO',        done: g.daysPending >= 1,  date: '1 day after' },
    { label: 'L1 Escalation (DAO)',    done: g.escalationLevel >= 1, date: g.escalationLevel >= 1 ? 'Auto-escalated' : 'Pending' },
    { label: 'L3 State Escalation',    done: g.escalationLevel >= 2, date: g.escalationLevel >= 2 ? 'Escalated to State' : 'Pending' },
    { label: 'Resolution / Closure',   done: g.derivedStatus === 'Resolved' || g.derivedStatus === 'Closed', date: g.derivedStatus === 'Resolved' ? 'Resolved' : 'Awaited' },
  ];

  const ACTIONS = [
    { id: 'assign',   icon: 'person_add',       label: 'Assign to Officer',       color: C.darkGreen },
    { id: 'escalate', icon: 'move_up',           label: 'Escalate Further',        color: C.amber },
    { id: 'close',    icon: 'check_circle',      label: 'Mark Resolved',           color: C.green },
    { id: 'flag',     icon: 'flag',              label: 'Flag for Vigilance',      color: C.red },
    { id: 'note',     icon: 'edit_note',         label: 'Add Intervention Note',   color: C.blue },
    { id: 'report',   icon: 'download',          label: 'Export Case Report',      color: C.muted },
  ];

  const [actionDone, setActionDone] = useState({});
  const handleAction = useCallback(id => {
    setActionDone(prev => ({ ...prev, [id]: true }));
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 400, backdropFilter: 'blur(2px)' }}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Case details: ${g.id}`}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, zIndex: 401,
          background: C.surface, boxShadow: '-4px 0 32px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Drawer header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.divider}`, flexShrink: 0, background: '#f9faf6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 4 }}>
                Case Review
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {g.id}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                {g.district}{g.taluka ? ` · ${g.taluka}` : ''} &nbsp;·&nbsp; {g.farmerName}
              </div>
            </div>
            <Pill severity={severity} />
            <button
              type="button"
              aria-label="Close panel"
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.chip, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.subtle }}>close</span>
            </button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, marginTop: 14 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.12s',
                  background: tab === t.id ? C.darkGreen : 'transparent',
                  color: tab === t.id ? '#fff' : C.muted,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Key facts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Scheme',        value: ai.detectedScheme || g.scheme || '-', icon: 'account_tree' },
                  { label: 'Category',      value: ai.category || 'General',             icon: 'category' },
                  { label: 'Assigned To',   value: ai.routeTo || 'Unassigned',           icon: 'person' },
                  { label: 'SLA (days)',     value: `${ai.slaDays || 30}d`,              icon: 'schedule' },
                  { label: 'Days Pending',  value: `${g.daysPending}d`,                 icon: 'hourglass_empty' },
                  { label: 'Derived Status',value: g.derivedStatus || g.status || '-',  icon: 'info' },
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

              {/* Description */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>Grievance Description</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.65, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#f9faf6' }}>
                  {g.description || 'No description provided.'}
                </div>
              </div>

              {/* SLA breach indicator */}
              {g.isSlaBreached && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: C.amberBg, border: `1px solid rgba(180,83,9,0.2)` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.amber, flexShrink: 0 }}>schedule</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.amber, lineHeight: 1.4 }}>
                    SLA breached by {Math.max(0, g.daysPending - (ai.slaDays || 30))} days - escalation protocol triggered
                  </span>
                </div>
              )}

              {/* Linked fraud tickets */}
              {g.linkedTickets?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>Linked Fraud Tickets</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {g.linkedTickets.map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace', padding: '4px 10px', borderRadius: 6, background: C.redBg, color: C.red, border: `1px solid rgba(186,26,26,0.15)` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI ANALYSIS TAB ── */}
          {tab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Fraud score meter */}
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
                      {g.fraudScore > 0.7
                        ? 'AI detected anomalous patterns. Refer to District Vigilance Officer immediately.'
                        : g.fraudScore > 0.4
                        ? 'Some risk indicators present. Monitor and verify claim documents.'
                        : 'No significant fraud signals. Standard processing applicable.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Classifications */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 10 }}>AI Classification Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Detected Scheme',   value: ai.detectedScheme || '-',   icon: 'account_tree' },
                    { label: 'Severity Level',    value: ai.severity || '-',          icon: 'warning' },
                    { label: 'Category',          value: ai.category || '-',          icon: 'category' },
                    { label: 'Route To',          value: ai.routeTo || '-',           icon: 'person' },
                    { label: 'SLA Target',        value: `${ai.slaDays || 30} days`,  icon: 'schedule' },
                    { label: 'Fraud Flag',        value: ai.fraudFlag ? 'Yes - vigilance review required' : 'No', icon: 'shield_locked' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#f9faf6' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: C.subtle, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{r.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: r.label === 'Fraud Flag' && ai.fraudFlag ? C.red : C.text, marginTop: 2 }}>{r.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid rgba(57,105,64,0.2)`, background: 'rgba(57,105,64,0.05)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.green, flexShrink: 0, marginTop: 1 }}>smart_toy</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.green, marginBottom: 4 }}>AI Recommendation</div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                      {ai.fraudFlag
                        ? `Immediate vigilance review required. Fraud indicators match patterns in ${g.district} district. Cross-check beneficiary Aadhaar and bank account against known clusters.`
                        : severity === 'Critical' || severity === 'High'
                        ? `Priority resolution needed. Route to ${ai.routeTo || 'DAO'} within ${ai.slaDays || 5} days. Coordinate with scheme officer for ${ai.detectedScheme || 'relevant scheme'} verification.`
                        : `Standard process applies. Assign to ${ai.routeTo || 'TAO'} for verification. Expected resolution within ${ai.slaDays || 15} days.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TIMELINE TAB ── */}
          {tab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 12 }}>
                Grievance Lifecycle
              </div>
              {TIMELINE_STEPS.map((step, idx) => (
                <div key={step.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Spine */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', border: `2px solid ${step.done ? C.green : C.divider}`,
                      background: step.done ? C.green : C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: step.done ? '#fff' : C.muted }}>
                        {step.done ? 'check' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div style={{ width: 2, height: 32, background: step.done ? C.green : C.divider, borderRadius: 1 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: step.done ? C.text : C.muted, lineHeight: 1.4 }}>{step.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{step.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ACTION TAB ── */}
          {tab === 'action' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 4 }}>
                Available Actions
              </div>
              {ACTIONS.map(a => (
                <button
                  key={a.id}
                  type="button"
                  disabled={!!actionDone[a.id]}
                  onClick={() => handleAction(a.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12,
                    border: actionDone[a.id] ? `1px solid ${C.divider}` : `1px solid ${C.border}`,
                    background: actionDone[a.id] ? C.chip : C.surface,
                    cursor: actionDone[a.id] ? 'default' : 'pointer',
                    width: '100%', textAlign: 'left',
                    opacity: actionDone[a.id] ? 0.6 : 1,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!actionDone[a.id]) { e.currentTarget.style.background = '#f9faf6'; e.currentTarget.style.borderColor = 'rgba(20,40,30,0.18)'; } }}
                  onMouseLeave={e => { if (!actionDone[a.id]) { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; } }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: actionDone[a.id] ? C.chip : sBg('Medium'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 17, color: actionDone[a.id] ? C.muted : a.color }}>
                      {actionDone[a.id] ? 'check' : a.icon}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: actionDone[a.id] ? C.muted : C.text }}>{a.label}</div>
                    {actionDone[a.id] && <div style={{ fontSize: 10, color: C.green, marginTop: 2 }}>Action recorded</div>}
                  </div>
                </button>
              ))}

              {/* Intervention note */}
              {actionDone['note'] && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 6 }}>Intervention Note</div>
                  <textarea
                    placeholder="Enter intervention details, officer name, expected resolution date…"
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: `1px solid ${C.border}`, fontSize: 12, color: C.text,
                      fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                      background: '#f9faf6', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      marginTop: 8, padding: '8px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: C.darkGreen, color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                  >
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

// ── Main component ────────────────────────────────────────────────────────────
export default function StateGrievanceIntelligence() {
  const allGrievances   = useMemo(() => getEnhancedGrievances(), []);
  const fraudGrievances = useMemo(() => getFraudLinkedGrievances(), []);

  const [schemeFilter,   setSchemeFilter]   = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search,         setSearch]         = useState('');
  const [activeCase,     setActiveCase]     = useState(null);

  const openCase  = useCallback(g  => setActiveCase(g), []);
  const closeCase = useCallback(() => setActiveCase(null), []);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const l3Escalations = useMemo(() => allGrievances.filter(g => g.escalationLevel === 2), [allGrievances]);
  const l1Escalations = useMemo(() => allGrievances.filter(g => g.escalationLevel === 1), [allGrievances]);
  const slaBreached   = useMemo(() => allGrievances.filter(g => g.isSlaBreached && g.derivedStatus !== 'Resolved'), [allGrievances]);
  const critical      = useMemo(() => allGrievances.filter(g => g.aiInsights?.severity === 'Critical'), [allGrievances]);

  const schemeStats = useMemo(() => {
    const map = {};
    allGrievances.forEach(g => { const s = g.aiInsights?.detectedScheme || 'General'; map[s] = (map[s] || 0) + 1; });
    const total = allGrievances.length || 1;
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: Math.round(count / total * 100) }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [allGrievances]);

  const districtStats = useMemo(() => {
    const map = {};
    allGrievances.forEach(g => { if (g.district) map[g.district] = (map[g.district] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [allGrievances]);

  const severityStats = useMemo(() => {
    const order = ['Critical', 'High', 'Medium', 'Low'];
    const map = {};
    allGrievances.forEach(g => { const s = g.aiInsights?.severity || 'Low'; map[s] = (map[s] || 0) + 1; });
    return order.map(s => ({ severity: s, count: map[s] || 0 }));
  }, [allGrievances]);

  const schemes = useMemo(() => ['All', ...new Set(allGrievances.map(g => g.aiInsights?.detectedScheme).filter(Boolean))], [allGrievances]);

  const tableRows = useMemo(() => {
    return l3Escalations.filter(g => {
      if (schemeFilter !== 'All' && g.aiInsights?.detectedScheme !== schemeFilter) return false;
      if (severityFilter !== 'All' && g.aiInsights?.severity !== severityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (g.id || '').toLowerCase().includes(q)
          || (g.district || '').toLowerCase().includes(q)
          || (g.farmerName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [l3Escalations, schemeFilter, severityFilter, search]);

  const maxDist   = Math.max(...districtStats.map(d => d.count), 1);
  const maxScheme = Math.max(...schemeStats.map(s => s.count), 1);

  // ── shared styles ───────────────────────────────────────────────────────────
  const select = {
    fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
    border: `1px solid rgba(20,40,30,0.12)`, background: C.chip,
    color: C.text, outline: 'none', cursor: 'pointer',
  };

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">

        {/* ── HEADER STRIP ── */}
        <div className="state-dashboard__strip">
          <span className="material-symbols-outlined state-dashboard__strip-icon">gavel</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="state-dashboard__strip-title">Grievance Intelligence Centre</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              AI-assisted monitoring of farmer grievances, escalations and scheme-wise complaint patterns · Maharashtra
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, flexShrink: 0, flexWrap: 'wrap' }}>
            <Stat label="Total Active"   value={allGrievances.length}  />
            <Stat label="L3 Escalations" value={l3Escalations.length}  color={C.red} />
            <Stat label="SLA Breached"   value={slaBreached.length}    color={C.amber} />
            <Stat label="Critical Cases" value={critical.length}       color={C.red} />
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(10px, 1.4vw, 16px)' }}>
          {[
            { icon: 'pending_actions', label: 'Pending\nResolution',   value: allGrievances.filter(g => g.derivedStatus !== 'Resolved' && g.derivedStatus !== 'Closed').length, color: C.amber, tab: null },
            { icon: 'move_up',         label: 'L1 Escalations\n(DAO Level)',   value: l1Escalations.length,   color: C.amber },
            { icon: 'crisis_alert',    label: 'L3 Escalations\n(State Level)', value: l3Escalations.length,   color: C.red   },
            { icon: 'gpp_bad',         label: 'Fraud-Linked\nGrievances',      value: fraudGrievances.length, color: C.red   },
          ].map(k => (
            <div
              key={k.label}
              className="state-dashboard__kpi"
              onClick={() => k.label.includes('L3') && document.getElementById('l3-table')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: k.label.includes('L3') ? 'pointer' : 'default' }}
            >
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

        {/* ── ANALYSIS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'clamp(10px, 1.4vw, 16px)' }}>
          {/* Scheme-wise */}
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">Scheme-wise Complaints</h3>
                <p className="state-dashboard__panel-sub">Distribution by detected scheme</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {schemeStats.map(s => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {s.count} <span style={{ fontWeight: 500, fontSize: 10 }}>({s.pct}%)</span>
                    </span>
                  </div>
                  <MiniBar pct={Math.round(s.count / maxScheme * 100)} color={C.green} />
                </div>
              ))}
            </div>
          </div>

          {/* District load */}
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">District Load</h3>
                <p className="state-dashboard__panel-sub">Top districts by grievance volume</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {districtStats.map((d, i) => (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{d.count}</span>
                  </div>
                  <MiniBar pct={Math.round(d.count / maxDist * 100)} color={i === 0 ? C.red : C.amber} />
                </div>
              ))}
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">AI Severity Classification</h3>
                <p className="state-dashboard__panel-sub">Auto-assigned priority levels</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {severityStats.map(s => {
                const pct = allGrievances.length ? Math.round(s.count / allGrievances.length * 100) : 0;
                return (
                  <div key={s.severity}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: sCol(s.severity), flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{s.severity}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: sCol(s.severity), fontVariantNumeric: 'tabular-nums' }}>{s.count}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>{pct}%</span>
                      </div>
                    </div>
                    <MiniBar pct={pct} color={sCol(s.severity)} />
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.divider}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: C.green }}>smart_toy</span>
                <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                  AI auto-routes Critical cases to District Vigilance Officer within 2-day SLA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FRAUD SIGNALS ── */}
        {fraudGrievances.length > 0 && (
          <div className="state-dashboard__panel">
            <div className="state-dashboard__panel-head">
              <div>
                <h3 className="state-dashboard__panel-title">Fraud-Linked Grievance Signals</h3>
                <p className="state-dashboard__panel-sub">AI fraud score &gt; 0.70 - click any card to review</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.red, background: 'rgba(255,218,214,0.45)', padding: '5px 10px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {fraudGrievances.length} Flagged
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {fraudGrievances.slice(0, 6).map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => openCase(g)}
                  style={{
                    padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(186,26,26,0.12)',
                    background: 'rgba(186,26,26,0.03)', cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.redBg; e.currentTarget.style.borderColor = 'rgba(186,26,26,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(186,26,26,0.03)'; e.currentTarget.style.borderColor = 'rgba(186,26,26,0.12)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.red, fontFamily: 'IBM Plex Sans, monospace' }}>{g.id}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.red, background: C.redBg, padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>
                      {(g.fraudScore * 100).toFixed(0)}% risk
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3, lineHeight: 1.4 }}>
                    {g.district} - {g.farmerName || 'Farmer'}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginBottom: 8 }}>
                    {(g.description || '').substring(0, 72)}…
                  </div>
                  {g.linkedTickets?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {g.linkedTickets.map(t => (
                        <span key={t} style={{ fontSize: 9, fontWeight: 700, fontFamily: 'IBM Plex Sans, monospace', padding: '2px 6px', borderRadius: 4, background: C.chip, color: C.muted }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── L3 ESCALATIONS TABLE ── */}
        <div id="l3-table" className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.red, flexShrink: 0 }}>crisis_alert</span>
              <h3 className="state-dashboard__data-title" style={{ margin: 0 }}>State Level Escalations (L3)</h3>
              <span className="state-dashboard__data-meta">{tableRows.length} cases</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              <input
                type="text"
                placeholder="Search ticket / district / farmer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...select, width: 200, fontWeight: 500 }}
              />
              <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)} style={select}>
                {schemes.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={select}>
                {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {tableRows.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
              No L3 escalations match the current filters.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.divider}`, background: '#f9faf6' }}>
                    {['Ticket', 'District / Taluka', 'Farmer / Scheme', 'Severity', 'Days Pending', 'Status', 'Action'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: i >= 4 ? 'center' : 'left',
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: C.muted,
                        width: i === 0 ? '120px' : i === 6 ? '90px' : 'auto',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((g, idx) => (
                    <tr
                      key={g.id}
                      style={{ borderBottom: idx < tableRows.length - 1 ? `1px solid ${C.divider}` : 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f9faf6'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Sans, monospace', fontSize: 11, fontWeight: 600, color: C.muted }}>{g.id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{g.district}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{g.taluka}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{g.farmerName}</div>
                        <div style={{ fontSize: 10, color: C.green, marginTop: 1, fontWeight: 600 }}>{g.aiInsights?.detectedScheme || g.scheme}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Pill severity={g.aiInsights?.severity || 'Medium'} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: g.daysPending > 15 ? C.red : g.daysPending > 7 ? C.amber : C.text }}>
                          {g.daysPending}d
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: C.blueBg, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                          {g.derivedStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openCase(g)}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                            border: `1px solid rgba(20,40,30,0.12)`, background: C.chip,
                            color: C.text, cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'background 0.12s, color 0.12s, border-color 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.darkGreen; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.darkGreen; }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.chip; e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(20,40,30,0.12)'; }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── SLA BREACH ── */}
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
                    {['Ticket', 'District', 'Scheme', 'Days Overdue', 'Severity', 'Routed To', 'Review'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: i >= 3 ? 'center' : 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slaBreached.slice(0, 8).map((g, idx) => (
                    <tr
                      key={g.id}
                      style={{ borderBottom: idx < Math.min(slaBreached.length, 8) - 1 ? `1px solid ${C.divider}` : 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f9faf6'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '11px 16px', fontFamily: 'IBM Plex Sans, monospace', fontSize: 11, fontWeight: 600, color: C.muted }}>{g.id}</td>
                      <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 600, color: C.text }}>{g.district}</td>
                      <td style={{ padding: '11px 16px', fontSize: 11, color: C.green, fontWeight: 600 }}>{g.aiInsights?.detectedScheme || '-'}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontVariantNumeric: 'tabular-nums' }}>
                          +{Math.max(0, g.daysPending - (g.aiInsights?.slaDays || 15))}d
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <Pill severity={g.aiInsights?.severity || 'Medium'} />
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 11, color: C.muted, textAlign: 'center' }}>{g.aiInsights?.routeTo || '-'}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openCase(g)}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                            border: `1px solid rgba(20,40,30,0.12)`, background: C.chip,
                            color: C.text, cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'background 0.12s, color 0.12s, border-color 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.darkGreen; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = C.darkGreen; }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.chip; e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(20,40,30,0.12)'; }}
                        >
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
