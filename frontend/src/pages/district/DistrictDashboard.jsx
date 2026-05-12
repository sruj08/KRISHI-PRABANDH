import React from 'react';
import DistrictCommandMap from './components/DistrictCommandMap';
import {
  EXEC_KPIS,
  PFMS_BATCHES,
  FRICTION_MONTH,
} from '../../utils/districtMockData';
import { useToast } from '../../hooks/useToast.jsx';
import './district.css';

/* ── KPI Card ── */
const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e2e3df',
      borderRadius: 16,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f3f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#717972' }}>{icon}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717972', lineHeight: 1.35, whiteSpace: 'pre-line' }}>{label}</span>
    </div>
    {children ? (
      children
    ) : (
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1c1a', lineHeight: 1 }}>₹{value}</span>
          {unit && <span style={{ fontSize: 14, fontWeight: 500, color: '#717972' }}>{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, height: 6, background: '#f3f4f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#717972' }}>{progress}%</span>
          </div>
        )}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, marginTop: 2, color: subColor }}>
            {subIcon && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{subIcon}</span>}
            {sub}
          </div>
        )}
      </>
    )}
  </div>
);

/* ── Right Panel Section Wrapper ── */
const PanelSection = ({ title, subtitle, badge, children }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e2e3df',
      borderRadius: 16,
      padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.3, margin: 0 }}>{title}</h3>
        {subtitle && (
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', marginTop: 3, margin: 0, marginTop: 3 }}>{subtitle}</p>
        )}
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ba1a1a', background: 'rgba(255,218,214,0.4)', padding: '3px 8px', borderRadius: 4, flexShrink: 0, whiteSpace: 'nowrap' }}>{badge}</span>
      )}
    </div>
    <div style={{ marginTop: 14 }}>{children}</div>
  </div>
);

/* ── Friction Row ── */
const FrictionRow = ({ label, pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1c1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums', marginLeft: 8 }}>{pct}%</span>
  </div>
);

/* ── Dashboard ── */
const DistrictDashboard = () => {
  const { addToast } = useToast();

  const onDscAuthorize = () => {
    const total = PFMS_BATCHES.reduce((a, b) => a + b.beneficiaries, 0);
    addToast(`DSC release queued for ${total.toLocaleString('en-IN')} beneficiaries across ${PFMS_BATCHES.length} PFMS batches (demo).`, 'success', 4200);
  };

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        <KpiCard
          icon="account_balance_wallet"
          label={"Total Allocated\nFunds"}
          value={EXEC_KPIS.totalBudgetCr}
          unit="Cr"
          sub="FY 2025-26"
        />
        <KpiCard
          icon="payments"
          label={"Disbursed\n(YTD)"}
          value={EXEC_KPIS.disbursedCr}
          unit="Cr"
          progress={parseFloat(EXEC_KPIS.disbursedPct)}
          sub={`Target: ₹${EXEC_KPIS.disbursedTarget} Cr`}
        />
        <KpiCard
          icon="assignment_turned_in"
          label={"Pending PFMS\nClearance"}
          value={EXEC_KPIS.pendingPfmCr}
          unit="Cr"
          sub="> 48h alert"
          subIcon="warning"
          subColor="#ba1a1a"
        />
        <KpiCard
          icon="monitoring"
          label={"Under\nUtilization"}
          value=""
          unit=""
          sub="Across all schemes"
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1c1a', lineHeight: 1 }}>{EXEC_KPIS.projectedUnutilizedPct}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#717972' }}>%</span>
          </div>
        </KpiCard>
        <KpiCard
          icon="satellite_alt"
          label="Satellite Status"
          value=""
          unit=""
        >
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#396940', lineHeight: 1 }}>Active</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#717972', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#396940', fontSize: 10 }}>●</span> Next pass in 2h
            </div>
          </div>
        </KpiCard>
      </div>

      {/* ── Main Grid: Map + Right Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Map Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 480 }}>
          {/* Map Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f0', flexShrink: 0, gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>Taluka — Geo-fenced Command Map</h2>
              <p style={{ fontSize: 11, color: '#717972', marginTop: 3, margin: 0, marginTop: 3 }}>Live spatial analytics and telemetry</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #e2e3df', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#414943', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>layers</span>
              Layers
            </button>
          </div>

          {/* Map body */}
          <div style={{ flex: 1, position: 'relative', minHeight: 380 }}>
            <DistrictCommandMap />

            {/* GIS Overlays Panel */}
            <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', borderRadius: 12, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,.1)', border: '1px solid #e2e3df', width: 200 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#717972', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>GIS Overlays</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Mandal Boundaries', checked: true },
                  { label: 'Crop Health (NDVI)', checked: true },
                  { label: 'Verification Status', checked: true },
                  { label: 'Grievance Hotspots', checked: false },
                ].map(({ label, checked }) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      defaultChecked={checked}
                      style={{ width: 16, height: 16, borderRadius: 4, accentColor: '#396940' }}
                    />
                    <span style={{ fontSize: 12, color: '#1a1c1a', fontWeight: 500 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Friction Logger */}
          <PanelSection title="Friction Logger" subtitle="System Integration Errors">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FrictionRow label="Aadhar Mismatch (PM-KISAN)" pct={42} color="#ba1a1a" />
              <FrictionRow label="7/12 Integration Failure" pct={28} color="#ba1a1a" />
            </div>
          </PanelSection>

          {/* Admin Recommendations */}
          <PanelSection title="Administrative Recommendations" subtitle="AI-Driven Actionable Insights">
            {FRICTION_MONTH.topThreeRecommendations.slice(0, 1).map((rec, i) => (
              <div key={i} style={{ borderLeft: '4px solid #396940', background: '#f5f8f6', borderRadius: '0 10px 10px 0', padding: '12px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.35, marginBottom: 6 }}>
                  Increase PM-KISAN outreach in Loni Kalbhor.
                </p>
                <p style={{ fontSize: 11, color: '#717972', lineHeight: 1.55 }}>
                  Registration deficit detected vs. land record baseline. Deploy 2 mobile units.
                </p>
              </div>
            ))}
          </PanelSection>

          {/* PMFBY Disaster Alerts */}
          <PanelSection title="PMFBY Disaster Alerts" subtitle="Live Telemetry Triggers" badge="HIGH">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.35 }}>
                  Localized hail damage in Jejuri.
                </p>
                <p style={{ fontSize: 11, color: '#717972', marginTop: 4 }}>450+ early claims logged.</p>
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: '1px solid #e2e3df',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1a1c1a',
                  background: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                }}
              >
                Initiate Drone Survey
              </button>
            </div>
          </PanelSection>
        </div>
      </div>

      {/* ── PFMS Row ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', padding: '20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972' }}>account_balance_wallet</span>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', flex: 1, minWidth: 200, margin: 0 }}>
            Automated PFMS disbursement queues (TAO-cleared, high confidence)
          </h3>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#396940', background: 'rgba(186,240,188,0.3)', padding: '4px 10px', borderRadius: 6, border: '1px solid #baf0bc', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {PFMS_BATCHES.length} Batches Ready
          </span>
          <button
            type="button"
            onClick={onDscAuthorize}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#396940',
              color: '#fff',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(57,105,64,.25)',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
            Single DSC — release all
          </button>
        </div>

        {/* Batch cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PFMS_BATCHES.map((b) => (
            <div key={b.id} style={{ border: '1px solid #e2e3df', borderRadius: 12, padding: '16px 18px', background: '#f9faf6' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#717972', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{b.id}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', marginTop: 6 }}>{b.scheme}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 14 }}>
                <div>
                  <span style={{ fontSize: 9, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Beneficiaries</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', marginTop: 2 }}>{b.beneficiaries.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span style={{ fontSize: 9, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', marginTop: 2 }}>₹{b.amountCr} Cr</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 9, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mean AI confidence</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', marginTop: 2 }}>{(b.avgConfidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistrictDashboard;
