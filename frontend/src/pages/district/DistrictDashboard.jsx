import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast.jsx';
import DistrictCommandMap from './components/DistrictCommandMap';
import {
  DISTRICT_PROFILE,
  EXEC_KPIS,
  FRICTION_MONTH,
  PFMS_BATCHES,
  GRIEVANCE_SPIKES,
  PMFBY_TRIAGE,
  SCHEME_PENETRATION_RANK,
} from '../../utils/districtMockData';
import '../cao/cao.css';
import './district.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatMini = ({ icon, label, value, color, bg }) => (
  <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span className="material-symbols-outlined" style={{ color, fontSize: '22px' }}>{icon}</span>
    <div>
      <div style={{ fontSize: '17px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color, opacity: 0.78, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    </div>
  </div>
);

const DistrictDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onDscAuthorize = () => {
    const total = PFMS_BATCHES.reduce((a, b) => a + b.beneficiaries, 0);
    addToast(`DSC release queued for ${total.toLocaleString('en-IN')} beneficiaries across ${PFMS_BATCHES.length} PFMS batches (demo).`, 'success', 4200);
  };

  const frictionTop3 = useMemo(() => {
    const pairs = FRICTION_MONTH.labels.map((label, i) => ({ label, c: FRICTION_MONTH.counts[i] }));
    pairs.sort((a, b) => b.c - a.c);
    return pairs.slice(0, 3);
  }, []);

  const barData = {
    labels: frictionTop3.map((x) => x.label),
    datasets: [
      {
        label: 'Drop-offs (district)',
        data: frictionTop3.map((x) => x.c),
        backgroundColor: ['#0055A4', '#f57c00', '#2e7d32'],
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: false },
      },
    },
  };

  const execKpiStrip = [
    { icon: 'account_balance', label: 'Total district budget', value: `₹${EXEC_KPIS.totalBudgetCr} Cr`, color: '#0055A4', bg: '#e3f2fd' },
    { icon: 'payments', label: 'Disbursed (YTD)', value: `₹${EXEC_KPIS.disbursedCr} Cr`, color: '#2e7d32', bg: '#e8f5e9' },
    { icon: 'hourglass_top', label: 'Pending PFMS clearance', value: `₹${EXEC_KPIS.pendingPfmCr} Cr`, color: '#e65100', bg: '#fff3e0' },
    { icon: 'trending_down', label: 'Projected unutilized', value: `${EXEC_KPIS.projectedUnutilizedPct}%`, color: '#c62828', bg: '#ffebee' },
    { icon: 'satellite_alt', label: 'Sentinel-2 coverage', value: '36h', color: '#6a1b9a', bg: '#f3e5f5' },
  ];

  return (
    <div className="cao-root">
      <header style={{ padding: 'var(--sp-4)', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold' }}>KrishiNetra — District Executive Command Center</h1>
          <span style={{ fontSize: '12px', opacity: 0.88, borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
            {DISTRICT_PROFILE.district} · {DISTRICT_PROFILE.state} — {DISTRICT_PROFILE.officerTitle}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <span style={{ fontSize: '12px', opacity: 0.9, maxWidth: '280px', textAlign: 'right' }}>
            {user?.name || DISTRICT_PROFILE.name}
          </span>
          <button type="button" className="btn-outline btn-sm text-white" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="cao-kpi-strip">
        {execKpiStrip.map((k, i) => (
          <div className="cao-kpi-card" key={i} style={{ '--kpi-color': k.color, '--kpi-bg': k.bg }}>
            <span className="material-symbols-outlined cao-kpi-icon">{k.icon}</span>
            <div>
              <div className="cao-kpi-value">{k.value}</div>
              <div className="cao-kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ margin: '0 var(--sp-6)', padding: '10px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
        {EXEC_KPIS.sentinel2Pass} · DAO: {DISTRICT_PROFILE.dao}
      </p>

      <div className="district-exec-grid">
        <div className="cao-panel cao-panel--map" style={{ minHeight: '560px' }}>
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">map</span>
            <span>Pune district — geofenced command map</span>
            <span className="cao-panel-badge green">Live overlay</span>
          </div>
          <div style={{ flex: 1, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <DistrictCommandMap />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: 0 }}>
          <div className="cao-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '280px' }}>
            <div className="cao-panel-header">
              <span className="material-symbols-outlined">troubleshoot</span>
              <span>Friction logger — top drop-off drivers</span>
              <span className="cao-panel-badge amber">This month</span>
            </div>
            <div style={{ padding: 'var(--sp-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div style={{ flex: 1, minHeight: '200px', position: 'relative' }}>
                <Bar data={barData} options={barOptions} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-dark)', marginTop: '4px' }}>AI administrative recommendations</div>
              {FRICTION_MONTH.topThreeRecommendations.map((text, idx) => (
                <div key={idx} className="district-ai-bullet">
                  <span style={{ fontWeight: 800, color: '#1b5e20' }}>{idx + 1}. </span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="cao-panel" style={{ flex: '0 0 auto' }}>
            <div className="cao-panel-header">
              <span className="material-symbols-outlined">crisis_alert</span>
              <span>Grievance escalation heatmap (signals)</span>
              <span className="cao-panel-badge red">Spikes</span>
            </div>
            <div style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GRIEVANCE_SPIKES.map((g) => (
                <div key={g.taluka} style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <strong>{g.taluka}</strong>
                    <span className="cao-panel-badge" style={{ background: g.flag === 'audit' ? 'var(--error-light)' : 'var(--amber-light)', color: g.flag === 'audit' ? 'var(--error-dark)' : 'var(--on-amber)' }}>
                      {g.flag === 'audit' ? 'Audit' : 'Watch'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{g.category}</div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '11px' }}>
                    <span>Week spike: <b style={{ color: '#c62828' }}>+{g.wowPct}%</b></span>
                    <span>Open: <b>{g.open}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cao-panel" style={{ flex: '0 0 auto' }}>
            <div className="cao-panel-header">
              <span className="material-symbols-outlined">satellite_alt</span>
              <span>PMFBY / disaster triage (satellite-led)</span>
            </div>
            <div style={{ padding: '12px 14px', fontSize: '12px', lineHeight: 1.55 }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>{PMFBY_TRIAGE.event}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{PMFBY_TRIAGE.ndviDeltaSummary}</div>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span className="cao-panel-badge green">{PMFBY_TRIAGE.automatedHeatZones} heat zones</span>
                {PMFBY_TRIAGE.priorityTalukas.map((t) => (
                  <span key={t} className="cao-panel-badge amber">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="district-pfms-row">
        <div className="cao-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="cao-panel-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Automated PFMS disbursement queues (TAO-cleared, high confidence)</span>
            <span className="cao-panel-badge green">{PFMS_BATCHES.length} batches ready</span>
            <button type="button" className="district-dsc-btn" style={{ marginLeft: 'auto' }} onClick={onDscAuthorize}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
              Single DSC — release all verified batches
            </button>
          </div>
          <div style={{ padding: 'var(--sp-4)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {PFMS_BATCHES.map((b) => (
              <div key={b.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: '10px', padding: '12px', background: 'var(--surface-lowest)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{b.id}</div>
                <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '4px' }}>{b.scheme}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Beneficiaries</span><br /><b>{b.beneficiaries.toLocaleString('en-IN')}</b></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Amount</span><br /><b>₹{b.amountCr} Cr</b></div>
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>Mean AI confidence</span><br /><b>{(b.avgConfidence * 100).toFixed(1)}%</b></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cao-panel">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Scheme penetration — top talukas</span>
          </div>
          <div style={{ padding: '12px' }}>
            {SCHEME_PENETRATION_RANK.map((row, i) => (
              <div key={row.taluka} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < SCHEME_PENETRATION_RANK.length - 1 ? '1px solid var(--outline-variant)' : 'none', fontSize: '12px' }}>
                <span style={{ fontWeight: 600 }}>{row.taluka}</span>
                <span style={{ fontWeight: 800, color: row.pct >= 82 ? '#1b5e20' : '#0055A4' }}>{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cao-panel">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">summarize</span>
            <span>Utilization matrix snapshot</span>
          </div>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StatMini icon="percent" label="On-track schemes" value="76%" color="#2e7d32" bg="#e8f5e9" />
            <StatMini icon="block" label="Friction-tagged stalled" value="12.4k" color="#e65100" bg="#fff3e0" />
            <StatMini icon="schedule" label="Median PFMS cycle (est.)" value="4.2 d" color="#0055A4" bg="#e3f2fd" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictDashboard;
