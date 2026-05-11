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
      {/* ── Header ── */}
      <header className="cao-header">
        <div className="cao-header-left">
          <div className="logo-text">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginRight: '8px', fontSize: '24px' }}>public</span>
            KrishiNetra - DAO
          </div>
        </div>

        <div className="cao-header-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', gap: '16px' }}>
          <span>Pune District</span> • 
          <span>Maharashtra State</span> • 
          <span>District Superintending Agriculture Officer</span>
        </div>

        <div className="cao-header-right">
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>notifications</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>settings</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-dark)', cursor: 'pointer' }}>
            D
          </div>
        </div>
      </header>

      <div className="cao-kpi-strip">
        {execKpiStrip.map((k, i) => (
          <div className="kpi-card-stitch" key={i}>
            <div className="kpi-card-header">
              <span className="material-symbols-outlined">{k.icon}</span> {k.label}
            </div>
            <div className="kpi-card-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-card-footer" style={{ color: 'var(--text-muted)' }}>
              Live telemetry
            </div>
          </div>
        ))}
      </div>

      <p style={{ margin: '0 var(--sp-6)', padding: '10px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
        {EXEC_KPIS.sentinel2Pass} · DAO: {DISTRICT_PROFILE.dao}
      </p>

      <div className="stitch-exec-grid">
        <div className="cao-panel cao-panel--map" style={{ minHeight: '560px' }}>
          <div className="cao-panel-header" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-dark)' }}>Taluka — Geo-fenced Command Map</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Live spatial analytics and telemetry</div>
            </div>
            <button className="stitch-map-mode-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span> Layers
            </button>
          </div>
          <div style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <DistrictCommandMap />
          </div>
        </div> 

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: 0 }}>
          {/* Card 1: Friction Logger */}
          <div className="cao-panel" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-dark)' }}>Friction Logger</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>SYSTEM INTEGRATION ERRORS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--error)', marginRight: '8px', fontSize: '18px' }}>•</span>
                Aadhar Mismatch (PM-KISAN)
                <span style={{ color: 'var(--error)', marginLeft: 'auto' }}>42%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--error)', marginRight: '8px', fontSize: '18px' }}>•</span>
                7/12 Integration Failure
                <span style={{ color: 'var(--error)', marginLeft: 'auto' }}>28%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Administrative Recommendations */}
          <div className="cao-panel" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-dark)' }}>Administrative Recommendations</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>AI-DRIVEN ACTIONABLE INSIGHTS</div>
            </div>
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f4fbf6', borderLeft: '4px solid #1b5e20', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-dark)', marginBottom: '4px' }}>Increase PM-KISAN outreach in Loni Kalbhor.</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Registration deficit detected vs. land record baseline. Deploy 2 mobile units.</div>
            </div>
          </div>

          {/* Card 3: PMFBY Disaster Alerts */}
          <div className="cao-panel" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-dark)' }}>PMFBY Disaster Alerts</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>LIVE TELEMETRY TRIGGERS</div>
              </div>
              <span className="cao-panel-badge" style={{ backgroundColor: '#fff0f0', color: '#d32f2f', padding: '2px 6px', fontSize: '9px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ffcdd2' }}>HIGH</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-dark)', marginBottom: '4px' }}>Localized hail damage in Jejuri.</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>450+ early claims logged.</div>
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
