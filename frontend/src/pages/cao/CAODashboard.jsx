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
    HIGH:     { bg: 'bg-error-container', color: 'text-on-error-container', label: 'HIGH RISK' },
    MODERATE: { bg: 'bg-secondary-container', color: 'text-on-secondary-container', label: 'MODERATE' },
    CLEAN:    { bg: 'bg-primary-container', color: 'text-on-primary-container', label: 'CLEAN' },
  }[risk] || { bg: 'bg-surface-variant', color: 'text-on-surface-variant', label: risk };
  return (
    <span className={`${cfg.bg} ${cfg.color} font-bold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap`}>
      {cfg.label}
    </span>
  );
};

// ── Sub-section: Sahayak Supervision ─────────────────────────────────────────

const SahayakSupervisionPanel = ({ summary, vistar }) => {
  if (!summary) return <div className="text-center p-5 text-on-surface-variant text-sm">Loading sahayak data…</div>;
  const breakdown = summary.sahayak_breakdown || [];
  if (breakdown.length === 0) return <div className="text-center p-5 text-on-surface-variant text-sm">No sahayak data available.</div>;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-3">
      {breakdown.map(sb => {
        const vp = vistar?.sahayak_performance?.find(p => p.sahayak_id === sb.sahayak_id);
        const approvalPct = sb.total ? Math.round((sb.approved / sb.total) * 100) : 0;
        return (
          <div key={sb.sahayak_id} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-bold text-sm text-on-background">{sb.name}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{sb.sahayak_id}</div>
              </div>
              {vp && <RiskBadge risk={vp.overall_risk} />}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div><div className="text-on-surface-variant text-[10px] uppercase">Apps</div><b className="text-on-background">{sb.total}</b></div>
              <div><div className="text-on-surface-variant text-[10px] uppercase">Pending</div><b className="text-[#e65100]">{sb.pending}</b></div>
              <div><div className="text-on-surface-variant text-[10px] uppercase">Approved</div><b className="text-[#2e7d32]">{sb.approved}</b></div>
            </div>
            {vp && (
              <div className="grid grid-cols-3 gap-2 text-xs mb-3 pt-3 border-t border-outline-variant">
                <div><div className="text-on-surface-variant text-[10px] uppercase">Sessions</div><b className="text-on-background">{vp.total_sessions}</b></div>
                <div><div className="text-on-surface-variant text-[10px] uppercase">Avg Att.</div><b className="text-on-background">{vp.avg_digital_attendance}</b></div>
                <div><div className="text-on-surface-variant text-[10px] uppercase">Fraud Flags</div><b className={vp.fraud_flags > 0 ? 'text-[#c62828]' : 'text-[#2e7d32]'}>{vp.fraud_flags}</b></div>
              </div>
            )}
            <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden flex">
              <div className="bg-[#4caf50] transition-all duration-500 ease-in-out" style={{ width: `${approvalPct}%` }} />
              <div className="bg-[#ff9800]" style={{ width: `${sb.total ? (sb.pending / sb.total) * 100 : 0}%` }} />
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1.5">{approvalPct}% approved</div>
          </div>
        );
      })}
    </div>
  );
};

// ── Sub-section: Krishi Vistar Supervision ────────────────────────────────────

const VistarSupervisionPanel = ({ vistar, fraudSes }) => {
  if (!vistar) return <div className="text-center p-5 text-on-surface-variant text-sm">Loading vistar data…</div>;

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#e3f2fd] border border-[#0055A4]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0055A4] text-[20px]">event</span>
          <div>
            <div className="text-lg font-bold text-[#0055A4] leading-none">{vistar.total_sessions}</div>
            <div className="text-[10px] text-[#0055A4]/75 mt-1 uppercase tracking-wider">Total Sessions</div>
          </div>
        </div>
        <div className="bg-[#e8f5e9] border border-[#2e7d32]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2e7d32] text-[20px]">people</span>
          <div>
            <div className="text-lg font-bold text-[#2e7d32] leading-none">{vistar.avg_digital_attendance}</div>
            <div className="text-[10px] text-[#2e7d32]/75 mt-1 uppercase tracking-wider">Avg Digital Att.</div>
          </div>
        </div>
        <div className="bg-[#ffebee] border border-[#c62828]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c62828] text-[20px]">report</span>
          <div>
            <div className="text-lg font-bold text-[#c62828] leading-none">{vistar.fraud_flagged_count}</div>
            <div className="text-[10px] text-[#c62828]/75 mt-1 uppercase tracking-wider">Fraud Flagged</div>
          </div>
        </div>
        <div className="bg-[#fff8e1] border border-[#f57f17]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f57f17] text-[20px]">trending_down</span>
          <div>
            <div className="text-lg font-bold text-[#f57f17] leading-none">{vistar.overall_gap_pct || 0}%</div>
            <div className="text-[10px] text-[#f57f17]/75 mt-1 uppercase tracking-wider">Attendance Gap</div>
          </div>
        </div>
      </div>

      {/* Sahayak vistar performance */}
      <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="font-bold text-[13px] mb-3 text-on-background">Sahayak Vistar Performance</div>
        {(vistar.sahayak_performance || []).map(p => (
          <div key={p.sahayak_id} className="flex justify-between items-center pb-2 mb-2 border-b border-outline-variant last:border-0 last:mb-0 last:pb-0">
            <div className="flex-1">
              <div className="font-bold text-xs text-on-background">{p.sahayak_name}</div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                {p.total_sessions} sessions · {Math.round(p.overall_compliance_ratio * 100)}% compliance
                {p.fraud_flags > 0 && <span className="text-[#c62828] font-bold ml-1">· {p.fraud_flags} flags</span>}
              </div>
              <div className="mt-1.5 h-1 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${Math.round(p.overall_compliance_ratio * 100)}%`, background: p.overall_risk === 'HIGH' ? '#ef5350' : p.overall_risk === 'MODERATE' ? '#ff9800' : '#4caf50' }} />
              </div>
            </div>
            <div className="ml-3"><RiskBadge risk={p.overall_risk} /></div>
          </div>
        ))}
      </div>

      {/* Fraud alert list */}
      {fraudSes.length > 0 && (
        <div className="bg-[#fff5f5] border border-[#fca5a5] rounded-xl p-4">
          <div className="font-bold text-xs text-[#b91c1c] mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#b91c1c]"></span>
            Attendance Fraud Alerts ({fraudSes.length})
          </div>
          {fraudSes.slice(0, 4).map(s => (
            <div key={s.session_id} className="bg-white rounded-lg p-3 mb-2 text-xs border border-[#fecaca] shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-on-background">{s.village} — {s.topic}</div>
                  <div className="text-on-surface-variant mt-0.5">{s.date} · {s.sahayak_name}</div>
                </div>
                <RiskBadge risk={s.risk} />
              </div>
              <div className="flex gap-3 mt-2 text-[11px]">
                <span className="text-on-background">📋 Reported: <b className="font-medium">{s.reported_attendance}</b></span>
                <span className="text-on-background">📱 Digital: <b className="text-[#b91c1c]">{s.digital_attendance}</b></span>
                <span className="text-on-background">Gap: <b className="font-medium">{s.gap_pct}%</b></span>
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
  if (!summary) return <div className="text-center p-5 text-on-surface-variant text-sm">Loading mandal overview…</div>;

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      {/* Application KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#e3f2fd] border border-[#0055A4]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0055A4] text-[20px]">assignment</span>
          <div>
            <div className="text-lg font-bold text-[#0055A4] leading-none">{summary.total_applications}</div>
            <div className="text-[10px] text-[#0055A4]/75 mt-1 uppercase tracking-wider">Total Apps</div>
          </div>
        </div>
        <div className="bg-[#fff3e0] border border-[#e65100]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#e65100] text-[20px]">pending</span>
          <div>
            <div className="text-lg font-bold text-[#e65100] leading-none">{(summary.by_status?.Applied || 0) + (summary.by_status?.['Under Scrutiny'] || 0)}</div>
            <div className="text-[10px] text-[#e65100]/75 mt-1 uppercase tracking-wider">Pending</div>
          </div>
        </div>
        <div className="bg-[#e8f5e9] border border-[#2e7d32]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2e7d32] text-[20px]">check_circle</span>
          <div>
            <div className="text-lg font-bold text-[#2e7d32] leading-none">{summary.by_status?.Approved || 0}</div>
            <div className="text-[10px] text-[#2e7d32]/75 mt-1 uppercase tracking-wider">Approved</div>
          </div>
        </div>
        <div className="bg-[#ffebee] border border-[#c62828]/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c62828] text-[20px]">gpp_bad</span>
          <div>
            <div className="text-lg font-bold text-[#c62828] leading-none">{summary.fraud_alerts || 0}</div>
            <div className="text-[10px] text-[#c62828]/75 mt-1 uppercase tracking-wider">Fraud Alerts</div>
          </div>
        </div>
      </div>

      {/* Vistar quick bar */}
      {vistar && (
        <div className="bg-[#fff8e1] border border-[#ffe082] rounded-xl p-4 shadow-sm">
          <div className="font-bold text-xs text-[#f57f17] mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            Vistar Snapshot
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-on-background">
            <div><b className="font-semibold">{vistar.total_sessions}</b> sessions</div>
            <div><b className="font-semibold text-error">{vistar.fraud_flagged_count}</b> flagged</div>
            <div>Avg Reported: <b className="font-semibold">{vistar.avg_reported_attendance}</b></div>
            <div>Avg Digital: <b className="font-semibold">{vistar.avg_digital_attendance}</b></div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#ffe082]/50 text-[11px] text-on-surface-variant">
            Overall Gap: <b className={`font-semibold ${vistar.overall_gap_pct > 40 ? 'text-[#c62828]' : 'text-[#2e7d32]'}`}>{vistar.overall_gap_pct}%</b>
          </div>
        </div>
      )}

      {/* Status funnel */}
      {appIntel && (
        <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="font-bold text-[13px] mb-3 text-on-background">Application Status Funnel</div>
          {Object.entries(appIntel.by_status || {}).map(([status, count]) => {
            const total = appIntel.total_applications || 1;
            const pct = Math.round((count / total) * 100);
            const clr = status === 'Approved' ? '#4caf50' : status === 'Rejected' ? '#ef5350' : status === 'Under Scrutiny' ? '#ff9800' : '#42a5f5';
            return (
              <div key={status} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-background">{status}</span>
                  <span className="font-bold text-on-background">{count} <span className="text-on-surface-variant font-normal">({pct}%)</span></span>
                </div>
                <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 ease-in-out" style={{ width: `${pct}%`, background: clr }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scheme category distribution */}
      {appIntel?.by_scheme_category && (
        <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="font-bold text-[13px] mb-3 text-on-background">Scheme Category Distribution</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(appIntel.by_scheme_category).slice(0, 6).map(([cat, cnt]) => (
              <div key={cat} className="bg-surface-container-low rounded-lg p-2.5 text-xs">
                <div className="text-on-surface-variant text-[10px] mb-1 uppercase tracking-wider">{cat || 'Other'}</div>
                <b className="text-on-background text-sm">{cnt}</b>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI insights */}
      {vistar?.insights?.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="font-bold text-[13px] text-on-background flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">tips_and_updates</span>
            Supervisory Insights
          </div>
          {vistar.insights.map((ins, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs text-on-background leading-relaxed shadow-sm">
              {ins}
            </div>
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

  const SUPERVISION_TABS = [
    { id: 'sahayak', icon: 'group',      label: 'Sahayaks' },
    { id: 'vistar',  icon: 'school',     label: 'Krishi Vistar' },
    { id: 'mandal',  icon: 'dashboard',  label: 'Mandal Info' },
  ];

  return (
    <div className="min-h-full bg-[#f3f4f0] animate-fade-in">

      {/* Main Content Area */}
      <div className="p-6 flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Card 1: Pending Files */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>description</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Pending Files</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">71</span>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-2" style={{ width: '100%' }}>
              <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">Target: &lt; 50</span>
              <div className="flex-1 bg-surface-variant h-1 rounded-full overflow-hidden ml-1">
                <div className="bg-error h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
              <span className="text-[10px] text-error font-data-tabular font-medium flex-shrink-0">12%</span>
            </div>
          </div>
          
          {/* Card 2: Red Alerts */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-label-caps text-[10px] text-error tracking-wider uppercase font-semibold truncate">Red Alerts</span>
            </div>
            <div className="flex items-end gap-2" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-error leading-none tracking-tight">3</span>
              <span className="text-[13px] font-bold text-error" style={{ marginBottom: '3px' }}>High</span>
            </div>
            <div className="mt-auto pt-3">
              <span className="text-[11px] text-on-surface-variant font-medium">9 batches pending</span>
            </div>
          </div>
          
          {/* Card 3: Fraud Prevented */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>security</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Fraud Prevented</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight flex items-baseline gap-1">₹1.05<span className="text-xl">L</span></span>
            </div>
            <div className="mt-auto pt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Across all schemes</p>
            </div>
          </div>
          
          {/* Card 4: Shops Overdue */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>storefront</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Shops Overdue</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">2</span>
            </div>
            <div className="mt-auto pt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Require inspections</p>
            </div>
          </div>
          
          {/* Card 5: PMFBY Claims */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] cursor-pointer hover:bg-surface-container-lowest transition-colors hover:border-outline-variant relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }} onClick={() => setPmfbyOpen(true)}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>account_balance</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">PMFBY Claims</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">318</span>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant flex-shrink-0"></span>
              <span className="font-body-main text-[11px] text-on-surface-variant font-medium truncate">Processed this month</span>
            </div>
          </div>
          
          {/* Card 6: Avg Approval */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>schedule</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Avg Approval</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">4.2d</span>
            </div>
            <div className="mt-auto pt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Target: 3d</p>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ marginTop: '8px' }}>
          {/* Left Column (Spans 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
            {/* Map Container */}
            <div className="bg-white rounded-[16px] overflow-hidden flex flex-col shadow-sm border border-[#e2e3df] min-w-0" style={{ height: '520px' }}>
              <div className="flex justify-between items-center z-10 border-b border-surface-variant" style={{ padding: '22px 24px', gap: '16px' }}>
                <div className="min-w-0">
                  <h2 className="font-section-header font-bold text-base text-on-background tracking-tight truncate" style={{ lineHeight: 1.3 }}>Circle — Geo-fenced Command Map</h2>
                  <p className="font-body-main text-xs text-on-surface-variant font-medium truncate" style={{ marginTop: '4px', lineHeight: 1.4 }}>Live spatial analytics and telemetry</p>
                </div>
                <button className="flex-shrink-0 flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors font-medium text-[11px] text-on-background" style={{ padding: '7px 14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span> Layers
                </button>
              </div>
              <div className="relative flex-1 bg-[#f0f3f2] w-full">
                <ActionMap />
              </div>
            </div>

            {/* Sahayak Matrix */}
            <div className="bg-white rounded-[16px] overflow-hidden shadow-sm flex flex-col border border-[#e2e3df] min-w-0">
              <div className="border-b border-surface-variant flex justify-between items-center" style={{ padding: '22px 24px', gap: '16px', minHeight: '64px' }}>
                <div className="flex items-center min-w-0" style={{ gap: '12px' }}>
                  <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '22px' }}>leaderboard</span>
                  <h3 className="font-section-header font-bold text-base text-on-background tracking-tight truncate" style={{ lineHeight: 1.3 }}>Sahayak Accountability Matrix</h3>
                </div>
                <span className="inline-flex items-center rounded-lg text-[11px] font-bold bg-[#fff3e0] text-[#e65100] flex-shrink-0 whitespace-nowrap" style={{ padding: '5px 11px' }}>
                  {DASHBOARD_KPIS.sahayaks_critical} Critical
                </span>
              </div>
              <div className="p-0 overflow-x-auto w-full">
                <SahayakMatrix sahayaks={SAHAYAKS} />
              </div>
            </div>
          </div>

          {/* Right Column (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
            
            {/* Supervision Tabs Widget */}
            <div className="bg-white rounded-[16px] shadow-sm flex flex-col border border-[#e2e3df] min-w-0" style={{ height: '410px' }}>
              {/* Tab bar */}
              <div className="flex bg-surface-container-lowest border-b border-surface-variant rounded-t-[16px]" style={{ gap: '8px', padding: '14px 14px' }}>
                {SUPERVISION_TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center rounded-lg transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-transparent text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                    style={{ gap: '6px', padding: '10px 6px', minHeight: '52px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                    <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant" style={{ gap: '10px', padding: '24px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', opacity: 0.5 }}>hourglass_top</span>
                  <span className="text-sm font-medium">Loading sahayak data…</span>
                </div>
              ) : (
                <>
                  {activeTab === 'sahayak' && <SahayakSupervisionPanel summary={summary} vistar={vistar} />}
                  {activeTab === 'vistar' && <VistarSupervisionPanel vistar={vistar} fraudSes={fraudSes} />}
                  {activeTab === 'mandal' && <MandalOverviewPanel summary={summary} appIntel={appIntel} vistar={vistar} />}
                </>
              )}
            </div>

            {/* Shop Tracker Widget */}
            <div className="bg-white rounded-[16px] shadow-sm flex flex-col overflow-hidden border border-[#e2e3df] min-w-0">
              <div className="border-b border-surface-variant flex justify-between items-center" style={{ padding: '22px 24px', gap: '16px', minHeight: '64px' }}>
                <div className="flex items-center min-w-0" style={{ gap: '12px' }}>
                  <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '22px' }}>storefront</span>
                  <h3 className="font-section-header font-bold text-base text-on-background tracking-tight truncate" style={{ lineHeight: 1.3 }}>Krushi Seva Kendra</h3>
                </div>
                <span className="inline-flex items-center rounded-lg text-[11px] font-bold bg-[#fff8e1] text-[#f57f17] flex-shrink-0 whitespace-nowrap" style={{ padding: '5px 11px' }}>
                  {DASHBOARD_KPIS.shops_overdue} Overdue
                </span>
              </div>
              <div className="p-0 overflow-x-auto w-full">
                <ShopTracker />
              </div>
            </div>

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

