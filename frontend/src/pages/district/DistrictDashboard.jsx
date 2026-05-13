import React from 'react';
import DistrictCommandMap from './components/DistrictCommandMap';
import {
  EXEC_KPIS,
  PFMS_BATCHES,
  FRICTION_MONTH,
} from '../../utils/districtMockData';
import { useToast } from '../../hooks/useToast.jsx';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import './district.css';

/* ── KPI Card ── */
const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e2e3df',
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 152,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    }}
  >
    {/* Header — fixed height row to lock baselines across all cards */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 28, marginBottom: 14 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#f3f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#717972' }}>{icon}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717972', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{label}</span>
    </div>
    {children ? (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>{children}</div>
    ) : (
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1c1a', lineHeight: 1 }}>₹{value}</span>
          {unit && <span style={{ fontSize: 14, fontWeight: 500, color: '#717972' }}>{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 6, background: '#f3f4f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#717972', fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
          </div>
        )}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, marginTop: 'auto', paddingTop: 12, color: subColor }}>
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
      padding: '22px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.3, margin: 0 }}>{title}</h3>
        {subtitle && (
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6, lineHeight: 1.3 }}>{subtitle}</p>
        )}
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ba1a1a', background: 'rgba(255,218,214,0.4)', padding: '4px 9px', borderRadius: 6, flexShrink: 0, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>{badge}</span>
      )}
    </div>
    <div>{children}</div>
  </div>
);

/* ── Friction Row ── */
const FrictionRow = ({ label, pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', minHeight: 22 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1c1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums', marginLeft: 8 }}>{pct}%</span>
  </div>
);

/* ── Dashboard ── */
const DistrictDashboard = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { stats } = useKrishiData();
  const surveyCount =
    user?.district_id != null && stats?.surveyCountByDistrict
      ? stats.surveyCountByDistrict[String(user.district_id)]
      : null;
  const evidenceInDistrict =
    user?.district_id != null && stats?.evidenceCountByDistrict
      ? stats.evidenceCountByDistrict[String(user.district_id)]
      : null;

  const surveyCount =
    user?.district_id != null && stats?.surveyCountByDistrict
      ? stats.surveyCountByDistrict[String(user.district_id)]
      : null;

  const onDscAuthorize = () => {
    const total = PFMS_BATCHES.reduce((a, b) => a + b.beneficiaries, 0);
    addToast(`DSC release queued for ${total.toLocaleString('en-IN')} beneficiaries across ${PFMS_BATCHES.length} PFMS batches (demo).`, 'success', 4200);
  };

  return (
    <div
      className="district-dash-root"
      style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}
    >

      {(surveyCount != null ||
        user?.district_name ||
        stats?.totalSurveyEvidence != null) && (
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e3df',
              borderRadius: 12,
              padding: '12px 18px',
              fontSize: 12,
              color: '#1a1c1a',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>hub</span>
            <span style={{ fontWeight: 700 }}>CSV dataset scope</span>
            {user?.district_name && (
              <span style={{ color: '#717972' }}>
                District: <strong style={{ color: '#1a1c1a' }}>{user.district_name}</strong>
              </span>
            )}
            {surveyCount != null && (
              <span style={{ color: '#717972' }}>
                Surveys in dataset (linked via farms → villages → districts):{' '}
                <strong style={{ color: '#1a1c1a' }}>{surveyCount.toLocaleString('en-IN')}</strong>
              </span>
            )}
            {evidenceInDistrict != null && (
              <span style={{ color: '#717972' }}>
                Evidence rows (this district via surveys):{' '}
                <strong style={{ color: '#1a1c1a' }}>
                  {evidenceInDistrict.toLocaleString('en-IN')}
                </strong>
              </span>
            )}
            {evidenceInDistrict == null && stats?.totalSurveyEvidence != null && (
              <span style={{ color: '#717972' }}>
                Evidence rows (CSV, statewide):{' '}
                <strong style={{ color: '#1a1c1a' }}>
                  {Number(stats.totalSurveyEvidence).toLocaleString('en-IN')}
                </strong>
              </span>
            )}
            {stats?.paymentsByStatus && (
              <span style={{ color: '#717972' }}>
                DBT: completed{' '}
                <strong>
                  {Number(stats.paymentsByStatus.COMPLETED || 0).toLocaleString('en-IN')}
                </strong>{' '}
                · failed{' '}
                <strong>{Number(stats.paymentsByStatus.FAILED || 0).toLocaleString('en-IN')}</strong>
              </span>
            )}
            {stats?.totalSurveys != null && (
              <span style={{ color: '#717972', marginLeft: 'auto' }}>
                Statewide surveys in CSV:{' '}
                {Number(stats.totalSurveys).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        )}

      {/* ── KPI Strip ── */}
      <div className="district-kpi-grid">
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
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1c1a', lineHeight: 1 }}>{EXEC_KPIS.projectedUnutilizedPct}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#717972' }}>%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#717972', paddingTop: 12 }}>
            Across all schemes
          </div>
        </KpiCard>
        <KpiCard
          icon="satellite_alt"
          label="Satellite Status"
          value=""
          unit=""
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: '#396940', lineHeight: 1 }}>Active</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#717972', display: 'flex', alignItems: 'center', gap: 4, paddingTop: 12 }}>
            <span style={{ color: '#396940', fontSize: 10 }}>●</span> Next pass in 2h
          </div>
        </KpiCard>
      </div>

      {/* ── Main: map + right rail ── */}
      <div className="district-command-row">

        {/* Map Card */}
        <div className="district-map-column" style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
          {/* Map Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f0', flexShrink: 0, gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>Taluka — Geo-fenced Command Map</h2>
              <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4, lineHeight: 1.4 }}>Live spatial analytics and telemetry</p>
            </div>
          </div>

          {/* Map body */}
          <div className="district-map-slot">
            <DistrictCommandMap />
          </div>
        </div>

        {/* ── Right rail ── */}
        <div className="district-command-rail">

          {/* Friction Logger */}
          <PanelSection title="Friction Logger" subtitle="System Integration Errors">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FrictionRow label="Aadhar Mismatch (PM-KISAN)" pct={42} color="#ba1a1a" />
              <FrictionRow label="7/12 Integration Failure" pct={28} color="#ba1a1a" />
            </div>
          </PanelSection>

          {/* Admin Recommendations */}
          <PanelSection title="Administrative Recommendations" subtitle="AI-Driven Actionable Insights">
            {FRICTION_MONTH.topThreeRecommendations.slice(0, 1).map((rec, i) => (
              <div key={i} style={{ borderLeft: '4px solid #396940', background: '#f5f8f6', borderRadius: '0 10px 10px 0', padding: '14px 16px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.4, margin: 0, marginBottom: 6 }}>
                  Increase PM-KISAN outreach in Loni Kalbhor.
                </p>
                <p style={{ fontSize: 11, color: '#717972', lineHeight: 1.55, margin: 0 }}>
                  Registration deficit detected vs. land record baseline. Deploy 2 mobile units.
                </p>
              </div>
            ))}
          </PanelSection>

          {/* PMFBY Disaster Alerts */}
          <PanelSection title="PMFBY Disaster Alerts" subtitle="Live Telemetry Triggers" badge="HIGH">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.4, margin: 0 }}>
                  Localized hail damage in Jejuri.
                </p>
                <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 6, lineHeight: 1.45 }}>450+ early claims logged.</p>
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '11px 0',
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

      {/* ── PFMS Disbursement Table ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 28px', borderBottom: '1px solid #f3f4f0' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(57,105,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>account_balance_wallet</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>
              Automated PFMS Disbursement Queues
            </h3>
            <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4 }}>TAO-cleared, high-confidence batches ready for release</p>
          </div>
          <button
            type="button"
            onClick={onDscAuthorize}
            className="district-dsc-btn"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
            Authorize Release
          </button>
        </div>

        {/* Dense Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                <th style={{ padding: '14px 28px', fontSize: '10px', fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Batch ID</th>
                <th style={{ padding: '14px 28px', fontSize: '10px', fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scheme Name</th>
                <th style={{ padding: '14px 28px', fontSize: '10px', fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Beneficiaries</th>
                <th style={{ padding: '14px 28px', fontSize: '10px', fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Amount (Cr)</th>
                <th style={{ padding: '14px 28px', fontSize: '10px', fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>AI Confidence</th>
                <th style={{ padding: '14px 28px', fontSize: '10px', fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {PFMS_BATCHES.map((b, idx) => (
                <tr key={b.id} style={{ borderBottom: idx === PFMS_BATCHES.length - 1 ? 'none' : '1px solid #f3f4f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '18px 28px', fontSize: '12px', fontWeight: 700, color: '#717972', fontVariantNumeric: 'tabular-nums' }}>{b.id}</td>
                  <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 600, color: '#1a1c1a' }}>{b.scheme}</td>
                  <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{b.beneficiaries.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₹{b.amountCr}</td>
                  <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: '#e2e3df', borderRadius: 2 }}>
                        <div style={{ height: '100%', background: '#396940', borderRadius: 2, width: `${b.avgConfidence * 100}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#396940', fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{(b.avgConfidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: '#396940', background: 'rgba(186,240,188,0.3)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(57,105,64,0.2)' }}>Ready</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistrictDashboard;
