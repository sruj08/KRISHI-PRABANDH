import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHierarchy } from '../../context/HierarchyContext';
import ActionMap from './components/ActionMap';
import ShopTracker from './components/ShopTracker';
import SahayakMatrix from './components/SahayakMatrix';
import PMFBYPanel from './components/PMFBYPanel';
import {
  CAO_PROFILE, DASHBOARD_KPIS, SAHAYAKS, PMFBY_EVENTS
} from '../../utils/caoMockData';
import {
  fetchMandalSummary,
  fetchVistarAnalytics,
  fetchVistarFraudAlerts,
  fetchMKAApplicationIntelligence,
} from '../../utils/api';
import './cao.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const RiskBadge = ({ risk }) => {
  const cfg = {
    HIGH:     { bg: '#fde8e8', color: '#b91c1c', label: 'HIGH RISK' },
    MODERATE: { bg: '#fef3c7', color: '#b45309', label: 'MODERATE' },
    CLEAN:    { bg: '#dcfce7', color: '#15803d', label: 'CLEAN' },
  }[risk] || { bg: '#f5f5f5', color: '#666', label: risk };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '10px', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
};

const StatMini = ({ icon, label, value, color, bg }) => (
  <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span className="material-symbols-outlined" style={{ color, fontSize: '22px' }}>{icon}</span>
    <div>
      <div style={{ fontSize: '18px', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '10px', color, opacity: 0.75, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    </div>
  </div>
);

// ── Sub-section: Sahayak Supervision ─────────────────────────────────────────

const SahayakSupervisionPanel = ({ summary, vistar }) => {
  if (!summary) return <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>Loading sahayak data…</div>;
  const breakdown = summary.sahayak_breakdown || [];
  if (breakdown.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>No sahayak data available.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, padding: '12px' }}>
      {breakdown.map(sb => {
        const vp = vistar?.sahayak_performance?.find(p => p.sahayak_id === sb.sahayak_id);
        const approvalPct = sb.total ? Math.round((sb.approved / sb.total) * 100) : 0;
        return (
          <div key={sb.sahayak_id} style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-dark)' }}>{sb.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{sb.sahayak_id}</div>
              </div>
              {vp && <RiskBadge risk={vp.overall_risk} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', marginBottom: '8px' }}>
              <div><div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>Apps</div><b>{sb.total}</b></div>
              <div><div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>Pending</div><b style={{ color: '#e65100' }}>{sb.pending}</b></div>
              <div><div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>Approved</div><b style={{ color: '#2e7d32' }}>{sb.approved}</b></div>
            </div>
            {vp && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid var(--outline-variant)' }}>
                <div><div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>Sessions</div><b>{vp.total_sessions}</b></div>
                <div><div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>Avg Att.</div><b>{vp.avg_digital_attendance}</b></div>
                <div><div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>Fraud Flags</div><b style={{ color: vp.fraud_flags > 0 ? '#c62828' : '#2e7d32' }}>{vp.fraud_flags}</b></div>
              </div>
            )}
            <div style={{ height: '5px', background: '#eee', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${approvalPct}%`, background: '#4caf50', transition: 'width 0.5s ease' }} />
              <div style={{ width: `${sb.total ? (sb.pending / sb.total) * 100 : 0}%`, background: '#ff9800' }} />
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>{approvalPct}% approved</div>
          </div>
        );
      })}
    </div>
  );
};

// ── Sub-section: Krishi Vistar Supervision ────────────────────────────────────

const VistarSupervisionPanel = ({ vistar, fraudSes }) => {
  if (!vistar) return <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>Loading vistar data…</div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <StatMini icon="event"         label="Total Sessions"  value={vistar.total_sessions}        color="#0055A4" bg="#e3f2fd" />
        <StatMini icon="people"        label="Avg Digital Att." value={vistar.avg_digital_attendance} color="#2e7d32" bg="#e8f5e9" />
        <StatMini icon="report"        label="Fraud Flagged"   value={vistar.fraud_flagged_count}    color="#c62828" bg="#ffebee" />
        <StatMini icon="trending_down" label="Attendance Gap"  value={`${vistar.overall_gap_pct || 0}%`} color="#f57f17" bg="#fff8e1" />
      </div>

      {/* Sahayak vistar performance */}
      <div style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '10px', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '10px', color: 'var(--text-dark)' }}>Sahayak Vistar Performance</div>
        {(vistar.sahayak_performance || []).map(p => (
          <div key={p.sahayak_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid var(--outline-variant)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-dark)' }}>{p.sahayak_name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {p.total_sessions} sessions · {Math.round(p.overall_compliance_ratio * 100)}% compliance
                {p.fraud_flags > 0 && <span style={{ color: '#c62828', fontWeight: 700, marginLeft: '4px' }}>· {p.fraud_flags} flags</span>}
              </div>
              <div style={{ marginTop: '5px', height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(p.overall_compliance_ratio * 100)}%`, background: p.overall_risk === 'HIGH' ? '#ef5350' : p.overall_risk === 'MODERATE' ? '#ff9800' : '#4caf50', height: '100%' }} />
              </div>
            </div>
            <div style={{ marginLeft: '10px' }}><RiskBadge risk={p.overall_risk} /></div>
          </div>
        ))}
      </div>

      {/* Fraud alert list */}
      {fraudSes.length > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: '#b91c1c', marginBottom: '8px' }}>
            🔴 Attendance Fraud Alerts ({fraudSes.length})
          </div>
          {fraudSes.slice(0, 4).map(s => (
            <div key={s.session_id} style={{ background: 'white', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', fontSize: '11px', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{s.village} — {s.topic}</div>
                  <div style={{ color: '#888', marginTop: '2px' }}>{s.date} · {s.sahayak_name}</div>
                </div>
                <RiskBadge risk={s.risk} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '10px' }}>
                <span>📋 Reported: <b>{s.reported_attendance}</b></span>
                <span>📱 Digital: <b style={{ color: '#b91c1c' }}>{s.digital_attendance}</b></span>
                <span>Gap: <b>{s.gap_pct}%</b></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sub-section: Mandal Overview ──────────────────────────────────────────────

const MandalOverviewPanel = ({ summary, appIntel, vistar }) => {
  if (!summary) return <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>Loading mandal overview…</div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Application KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <StatMini icon="assignment"   label="Total Apps"    value={summary.total_applications}  color="#0055A4" bg="#e3f2fd" />
        <StatMini icon="pending"      label="Pending"       value={(summary.by_status?.Applied || 0) + (summary.by_status?.['Under Scrutiny'] || 0)} color="#e65100" bg="#fff3e0" />
        <StatMini icon="check_circle" label="Approved"      value={summary.by_status?.Approved}  color="#2e7d32" bg="#e8f5e9" />
        <StatMini icon="gpp_bad"      label="Fraud Alerts"  value={summary.fraud_alerts}          color="#c62828" bg="#ffebee" />
      </div>

      {/* Vistar quick bar */}
      {vistar && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: '#f57f17', marginBottom: '8px' }}>⚡ Vistar Snapshot</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
            <div><b>{vistar.total_sessions}</b> sessions</div>
            <div><b>{vistar.fraud_flagged_count}</b> flagged</div>
            <div>Avg Reported: <b>{vistar.avg_reported_attendance}</b></div>
            <div>Avg Digital: <b>{vistar.avg_digital_attendance}</b></div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
            Overall Gap: <b style={{ color: vistar.overall_gap_pct > 40 ? '#c62828' : '#2e7d32' }}>{vistar.overall_gap_pct}%</b>
          </div>
        </div>
      )}

      {/* Status funnel */}
      {appIntel && (
        <div style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '10px', color: 'var(--text-dark)' }}>Application Status Funnel</div>
          {Object.entries(appIntel.by_status || {}).map(([status, count]) => {
            const total = appIntel.total_applications || 1;
            const pct = Math.round((count / total) * 100);
            const clr = status === 'Approved' ? '#4caf50' : status === 'Rejected' ? '#ef5350' : status === 'Under Scrutiny' ? '#ff9800' : '#42a5f5';
            return (
              <div key={status} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-dark)' }}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: clr, height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scheme category distribution */}
      {appIntel?.by_scheme_category && (
        <div style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '10px', color: 'var(--text-dark)' }}>Scheme Category Distribution</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {Object.entries(appIntel.by_scheme_category).slice(0, 6).map(([cat, cnt]) => (
              <div key={cat} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '7px 10px', fontSize: '11px' }}>
                <div style={{ color: '#888', fontSize: '9px', marginBottom: '2px', textTransform: 'uppercase' }}>{cat || 'Other'}</div>
                <b>{cnt}</b>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI insights */}
      {vistar?.insights?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-dark)' }}>🧠 Supervisory Insights</div>
          {vistar.insights.map((ins, i) => (
            <div key={i} style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', lineHeight: 1.5 }}>{ins}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CAODashboard = () => {
  const [pmfbyOpen, setPmfbyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sahayak');
  const [summary, setSummary]     = useState(null);
  const [vistar, setVistar]       = useState(null);
  const [fraudSes, setFraudSes]   = useState([]);
  const [appIntel, setAppIntel]   = useState(null);
  const [loading, setLoading]     = useState(true);

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mandals } = useHierarchy();

  // Use M002 as default mandal for CAO (matches CAO_PROFILE.mandal)
  const mandal = mandals?.find(m => m.mandal_id === 'M002') || { mandal_id: 'M002' };
  const mid = mandal.mandal_id;

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetchMandalSummary(mid),
      fetchVistarAnalytics(mid),
      fetchVistarFraudAlerts(mid),
      fetchMKAApplicationIntelligence(mid),
    ]).then(([s, v, f, a]) => {
      if (s.status === 'fulfilled') setSummary(s.value);
      if (v.status === 'fulfilled') setVistar(v.value);
      if (f.status === 'fulfilled') setFraudSes(f.value.alerts || []);
      if (a.status === 'fulfilled') setAppIntel(a.value);
    }).finally(() => setLoading(false));
  }, [mid]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const kpiItems = [
    { label: 'Pending Files',  value: DASHBOARD_KPIS.total_pending,        icon: 'pending_actions', color: 'var(--primary)',      bg: 'var(--primary-light)' },
    { label: 'Red Alerts',     value: DASHBOARD_KPIS.red_queue,            icon: 'gpp_bad',         color: 'var(--error)',        bg: 'var(--error-light)' },
    { label: 'Fraud Prevented',value: DASHBOARD_KPIS.fraud_prevented,      icon: 'security',        color: 'var(--success)',      bg: 'var(--success-light)' },
    { label: 'Shops Overdue',  value: DASHBOARD_KPIS.shops_overdue,        icon: 'store_alert',     color: 'var(--amber)',        bg: 'var(--amber-light)' },
    { label: 'PMFBY Claims',   value: DASHBOARD_KPIS.pmfby_pending,        icon: 'grain',           color: '#8e24aa',             bg: '#f3e5f5' },
    { label: 'Avg Approval',   value: `${DASHBOARD_KPIS.avg_approval_days}d`, icon: 'timer',        color: 'var(--success-dark)', bg: 'var(--success-light)' },
  ];

  const SUPERVISION_TABS = [
    { id: 'sahayak', icon: 'group',      label: 'Sahayak Supervision' },
    { id: 'vistar',  icon: 'school',     label: 'Krishi Vistar' },
    { id: 'mandal',  icon: 'dashboard',  label: 'Mandal Overview' },
  ];

  return (
    <div className="cao-root">
      {/* ── Header ── */}
      <header style={{ padding: 'var(--sp-4)', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold' }}>KrishiNetra — CAO Intelligence Dashboard</h1>
          <span style={{ fontSize: '12px', opacity: 0.8, borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
            {CAO_PROFILE.mandal}, {CAO_PROFILE.district} · Circle Agriculture Officer
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <button className="cao-pmfby-btn" onClick={() => setPmfbyOpen(true)}>
            <span className="material-symbols-outlined">satellite_alt</span>
            PMFBY Disaster Triage
            <span className="cao-pmfby-badge">{PMFBY_EVENTS.length}</span>
          </button>
          <div style={{ fontSize: '14px', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '16px' }}>
            {user?.name || CAO_PROFILE.name}
          </div>
          <button className="btn-outline btn-sm text-white" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <div className="cao-kpi-strip">
        {kpiItems.map((k, i) => (
          <div className="cao-kpi-card" key={i} style={{ '--kpi-color': k.color, '--kpi-bg': k.bg }}>
            <span className="material-symbols-outlined cao-kpi-icon">{k.icon}</span>
            <div>
              <div className="cao-kpi-value">{k.value}</div>
              <div className="cao-kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid: now 3 columns ── */}
      <div className="cao-grid cao-grid-3col">
        {/* Col 1: Action Map */}
        <div className="cao-panel cao-panel--map">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">map</span>
            <span>Mandal Action Map — {CAO_PROFILE.jurisdiction}</span>
            <span className="cao-panel-badge green">Live</span>
          </div>
          <ActionMap />
        </div>

        {/* Col 2: Supervision Tabs (Sahayak / Vistar / Mandal Overview) */}
        <div className="cao-panel cao-panel--supervision">
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', background: 'var(--surface-low)', borderBottom: '1px solid var(--outline-variant)' }}>
            {SUPERVISION_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  padding: '6px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '9px', fontWeight: 700, transition: 'all .15s',
                  background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading data…
            </div>
          )}

          {/* Tab content */}
          {!loading && activeTab === 'sahayak' && (
            <SahayakSupervisionPanel summary={summary} vistar={vistar} />
          )}
          {!loading && activeTab === 'vistar' && (
            <VistarSupervisionPanel vistar={vistar} fraudSes={fraudSes} />
          )}
          {!loading && activeTab === 'mandal' && (
            <MandalOverviewPanel summary={summary} appIntel={appIntel} vistar={vistar} />
          )}
        </div>

        {/* Col 3: Right column stacked — Shop Tracker + Sahayak Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="cao-panel cao-panel--shops" style={{ flex: 1 }}>
            <div className="cao-panel-header">
              <span className="material-symbols-outlined">storefront</span>
              <span>Krushi Seva Kendra Tracker</span>
              <span className="cao-panel-badge amber">{DASHBOARD_KPIS.shops_overdue} Overdue</span>
            </div>
            <ShopTracker />
          </div>

          <div className="cao-panel cao-panel--sahayak" style={{ flex: 1 }}>
            <div className="cao-panel-header">
              <span className="material-symbols-outlined">leaderboard</span>
              <span>Sahayak Accountability Matrix</span>
              <span className="cao-panel-badge orange">{DASHBOARD_KPIS.sahayaks_critical} Critical</span>
            </div>
            <SahayakMatrix sahayaks={SAHAYAKS} />
          </div>
        </div>
      </div>

      {/* ── PMFBY Overlay ── */}
      {pmfbyOpen && (
        <PMFBYPanel events={PMFBY_EVENTS} onClose={() => setPmfbyOpen(false)} />
      )}
    </div>
  );
};

export default CAODashboard;
