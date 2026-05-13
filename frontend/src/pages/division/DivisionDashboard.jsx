import React from 'react';
import RegionCommandMap from '../../components/maps/RegionCommandMap';
import {
  EXEC_KPIS,
  PFMS_BATCHES,
  FRICTION_MONTH,
  DISTRICT_MATRIX,
  DIVISION_PROFILE,
} from '../../utils/divisionMockData';
import { useToast } from '../../hooks/useToast.jsx';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import '../district/district.css';

/* ── KPI Card (identical visual contract to DistrictDashboard) ── */
const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', minHeight: 152, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
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

const PanelSection = ({ title, subtitle, badge, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
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

const FrictionRow = ({ label, pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', minHeight: 22 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1c1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums', marginLeft: 8 }}>{pct}%</span>
  </div>
);

/* District matrix row — extra section unique to Division dashboard */
const STATUS_CHIP = {
  'Leading':   { color: '#1b5e20', bg: 'rgba(186,240,188,0.45)' },
  'On track':  { color: '#1b5e20', bg: 'rgba(186,240,188,0.30)' },
  'Watch':     { color: '#c47200', bg: 'rgba(255,224,178,0.45)' },
  'Lagging':   { color: '#ba1a1a', bg: 'rgba(255,218,214,0.45)' },
};

const DivisionDashboard = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { stats, mandals } = useKrishiData();
  const circlesInDivision =
    user?.division_id != null
      ? mandals.filter(
          (m) => Number(m.division_id) === Number(user.division_id),
        ).length
      : null;

  const onDscAuthorize = () => {
    const total = PFMS_BATCHES.reduce((a, b) => a + b.beneficiaries, 0);
    addToast(`DSC release queued for ${total.toLocaleString('en-IN')} beneficiaries across ${PFMS_BATCHES.length} consolidated PFMS batches (demo).`, 'success', 4200);
  };

  const totalAlerts = DISTRICT_MATRIX.reduce((a, d) => a + d.fraudAlerts, 0);
  const totalPending = DISTRICT_MATRIX.reduce((a, d) => a + d.pending, 0);

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {(user?.division_name || circlesInDivision != null || stats?.totalSurveys != null) && (
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
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>dataset</span>
          <span style={{ fontWeight: 700 }}>CSV scope (division)</span>
          {user?.division_name && (
            <span style={{ color: '#717972' }}>
              Division: <strong>{user.division_name}</strong>
            </span>
          )}
          {circlesInDivision != null && (
            <span style={{ color: '#717972' }}>
              Agriculture circles in dataset: <strong>{circlesInDivision}</strong>
            </span>
          )}
          {stats?.totalSurveys != null && (
            <span style={{ color: '#717972', marginLeft: 'auto' }}>
              Statewide surveys (CSV): {Number(stats.totalSurveys).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        <KpiCard
          icon="account_balance_wallet"
          label={"Division Allocated\nFunds"}
          value={EXEC_KPIS.totalBudgetCr}
          unit="Cr"
          sub={`5 districts • FY 2025-26`}
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

      {/* ── Main Grid: Map + Right Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Map Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f0', flexShrink: 0, gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>{DIVISION_PROFILE.division} Division — Geo-fenced Command Map</h2>
              <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4, lineHeight: 1.4 }}>Live spatial analytics • {DIVISION_PROFILE.role}</p>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 380 }}>
            <RegionCommandMap
              geoUrl="/geo/pune-division-districts.geojson"
              outerKind="division"
              innerKind="district"
              innerLabel="District"
              defaultZoom={7}
              centerOverride={[17.5, 74.5]}
            />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <PanelSection title="Cross-District Friction" subtitle="System Integration Errors">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FrictionRow label="Aadhaar Mismatch (PM-KISAN)" pct={38} color="#ba1a1a" />
              <FrictionRow label="7/12 Integration Failure" pct={26} color="#ba1a1a" />
            </div>
          </PanelSection>

          <PanelSection title="Divisional Recommendations" subtitle="AI-Driven Cross-District Insights">
            {FRICTION_MONTH.topThreeRecommendations.slice(0, 1).map((rec, i) => (
              <div key={i} style={{ borderLeft: '4px solid #396940', background: '#f5f8f6', borderRadius: '0 10px 10px 0', padding: '14px 16px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.4, margin: 0, marginBottom: 6 }}>
                  Joint audit — Solapur ↔ Sangli fraud ring suspected.
                </p>
                <p style={{ fontSize: 11, color: '#717972', lineHeight: 1.55, margin: 0 }}>
                  {rec}
                </p>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="Disaster Triage" subtitle="Live Telemetry Triggers" badge="HIGH">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.4, margin: 0 }}>
                  Drought stress detected — Solapur belt.
                </p>
                <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 6, lineHeight: 1.45 }}>11,800+ plots flagged in Madha + Mangalwedha.</p>
              </div>
              <button style={{ width: '100%', padding: '11px 0', border: '1px solid #e2e3df', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#1a1c1a', background: '#fff', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                Initiate Drone Survey
              </button>
            </div>
          </PanelSection>
        </div>
      </div>

      {/* ── District Matrix Row ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 24px', borderBottom: '1px solid #f3f4f0', flexWrap: 'wrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972' }}>table_chart</span>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', flex: 1, margin: 0, lineHeight: 1.35 }}>District Performance Matrix</h3>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#717972', background: '#f3f4f0', padding: '5px 11px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            5 districts • {totalPending.toLocaleString('en-IN')} pending • {totalAlerts} alerts
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>District</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>Officer</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>Talukas</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>Funds (Cr)</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>Disbursed</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>Pending</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {DISTRICT_MATRIX.map((d, i) => {
                const chip = STATUS_CHIP[d.status] || { color: '#717972', bg: '#f3f4f0' };
                return (
                  <tr key={d.code} style={{ borderBottom: i !== DISTRICT_MATRIX.length - 1 ? '1px solid #ebece8' : 'none', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '18px 24px', fontSize: 14, fontWeight: 600, color: '#1a1c1a' }}>{d.district}</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#444742' }}>{d.officer}</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.talukas}</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>₹{d.fundsCr}</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{d.disbursedPct}%</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.pending.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, color: chip.color, background: chip.bg, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PFMS Row ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972', flexShrink: 0 }}>account_balance_wallet</span>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', flex: 1, minWidth: 200, margin: 0, lineHeight: 1.35 }}>
            Consolidated PFMS disbursement queues (district-cleared, high confidence)
          </h3>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#396940', background: 'rgba(186,240,188,0.3)', padding: '5px 11px', borderRadius: 6, border: '1px solid #baf0bc', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {PFMS_BATCHES.length} Batches Ready
          </span>
          <button type="button" onClick={onDscAuthorize} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#396940', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(57,105,64,.25)', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
            Single DSC — release all
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PFMS_BATCHES.map((b) => (
            <div key={b.id} style={{ border: '1px solid #e2e3df', borderRadius: 12, padding: '18px 20px', background: '#f9faf6' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#717972', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, lineHeight: 1.3 }}>{b.id}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', margin: 0, marginTop: 6, lineHeight: 1.35 }}>{b.scheme}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', marginTop: 16 }}>
                <div>
                  <span style={{ fontSize: 9, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', lineHeight: 1.3 }}>Beneficiaries</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0, marginTop: 4 }}>{b.beneficiaries.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span style={{ fontSize: 9, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', lineHeight: 1.3 }}>Amount</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0, marginTop: 4 }}>₹{b.amountCr} Cr</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 9, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', lineHeight: 1.3 }}>Mean AI confidence</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0, marginTop: 4 }}>{(b.avgConfidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DivisionDashboard;
