import React, { useState, useCallback } from 'react';
import RegionalMap from '../../components/maps/RegionalMap';
import { geoAsset } from '../../utils/geoAsset';
import {
  EXEC_KPIS,
  PFMS_BATCHES,
  FRICTION_MONTH,
  DIVISION_MATRIX,
  STATE_PROFILE,
} from '../../utils/stateMockData';
import { useToast } from '../../hooks/useToast.jsx';
import { useLanguage } from '../../context/LanguageContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import { fetchClaimsSummary } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';
import '../district/district.css';

const PANEL_BORDER = '#e2e3df';
const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';

const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      border: `1px solid ${PANEL_BORDER}`,
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 152,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
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
          <span style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1 }}>{value.startsWith('₹') ? value : `₹${value}`}</span>
          {unit && <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED }}>{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 6, background: '#f3f4f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
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

const STATUS_CHIP = {
  'Leading':  { color: '#1b5e20', bg: 'rgba(186,240,188,0.45)' },
  'On track': { color: '#1b5e20', bg: 'rgba(186,240,188,0.30)' },
  'Watch':    { color: '#c47200', bg: 'rgba(255,224,178,0.45)' },
  'Lagging':  { color: '#ba1a1a', bg: 'rgba(255,218,214,0.45)' },
};

const STATE_MAP_FIT_BOUNDS_OPTIONS = {
  paddingTopLeft: [22, 118],
  paddingBottomRight: [22, 20],
};

const StateDashboard = () => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { stats } = useKrishiData();
  const [liveSummary, setLiveSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      const s = await fetchClaimsSummary();
      setLiveSummary(s);
    } catch (_) {
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  usePolling(loadSummary, 5000);

  const onDscAuthorize = () => {
    const total = PFMS_BATCHES.reduce((a, b) => a + b.beneficiaries, 0);
    addToast(t('dscReleaseQueuedState', { total: total.toLocaleString('en-IN'), count: PFMS_BATCHES.length }), 'success', 4200);
  };

  const totalAlerts = DIVISION_MATRIX.reduce((a, d) => a + d.fraudAlerts, 0);
  const totalPending = DIVISION_MATRIX.reduce((a, d) => a + d.pending, 0);

  const totalClaims = liveSummary?.totalClaims ?? liveSummary?.total_applications ?? EXEC_KPIS.totalBudgetCr;
  const approvedCount = liveSummary?.approved ?? liveSummary?.by_status?.Approved;
  const pendingCount = liveSummary?.pending ?? liveSummary?.by_status?.['Under Scrutiny'];
  const flaggedCount = liveSummary?.flagged ?? liveSummary?.fraud_alerts;

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {!summaryLoading && liveSummary && (
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 12, padding: '12px 18px', fontSize: 12, color: '#1a1c1a', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>analytics</span>
          <span style={{ fontWeight: 700 }}>{t('Live Claims Summary', lang)}</span>
          <span style={{ color: '#717972' }}>
            {t('Total', lang)}: <strong>{totalClaims ?? '—'}</strong>
          </span>
          {approvedCount != null && (
            <span style={{ color: '#2e7d32' }}>
              {t('Approved', lang)}: <strong>{approvedCount}</strong>
            </span>
          )}
          {pendingCount != null && (
            <span style={{ color: '#e65100' }}>
              {t('Pending', lang)}: <strong>{pendingCount}</strong>
            </span>
          )}
          {flaggedCount != null && (
            <span style={{ color: '#c62828' }}>
              {t('Flagged', lang)}: <strong>{flaggedCount}</strong>
            </span>
          )}
        </div>
      )}

      {stats?.totalSurveys != null && (
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 12, padding: '12px 18px', fontSize: 12, color: '#1a1c1a', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>dataset</span>
          <span style={{ fontWeight: 700 }}>{t('liveCsvAggregate')}</span>
          <span style={{ color: '#717972' }}>
            {t('surveys')}: <strong>{Number(stats.totalSurveys).toLocaleString('en-IN')}</strong>
          </span>
          {stats.totalAuditLogs != null && (
            <span style={{ color: '#717972' }}>
              {t('auditEvents')}: <strong>{Number(stats.totalAuditLogs).toLocaleString('en-IN')}</strong>
            </span>
          )}
          {stats.totalCompensationPayments != null && (
            <span style={{ color: '#717972' }}>
              {t('dbtRows')}: <strong>{Number(stats.totalCompensationPayments).toLocaleString('en-IN')}</strong>
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        <KpiCard
          icon="account_balance_wallet"
          label={t('statewideAllocatedFunds')}
          value={EXEC_KPIS.totalBudgetCr}
          unit="Cr"
          sub={t('divisionsDistricts', { divisions: STATE_PROFILE.divisions, districts: STATE_PROFILE.districts })}
        />
        <KpiCard
          icon="payments"
          label={t('disbursedYtd')}
          value={EXEC_KPIS.disbursedCr}
          unit="Cr"
          progress={parseFloat(EXEC_KPIS.disbursedPct)}
          sub={t('target', { target: EXEC_KPIS.disbursedTarget })}
        />
        <KpiCard
          icon="assignment_turned_in"
          label={t('pendingPfmsClearance')}
          value={EXEC_KPIS.pendingPfmCr}
          unit="Cr"
          sub={t('fortyEightHourAlert')}
          subIcon="warning"
          subColor="#ba1a1a"
        />
        <KpiCard
          icon="monitoring"
          label={t('underUtilization')}
          value=""
          unit=""
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1 }}>{EXEC_KPIS.projectedUnutilizedPct}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED }}>%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: TEXT_MUTED, paddingTop: 12 }}>
            {t('acrossAllSchemes')}
          </div>
        </KpiCard>
        <KpiCard
          icon="warning"
          label={t('fraudRiskAlerts')}
          value={totalAlerts.toString()}
          sub={t('divisionsAtRisk', { count: DIVISION_MATRIX.filter(d => d.status === 'Watch' || d.status === 'Lagging').length })}
          subIcon="report_problem"
          subColor="#ba1a1a"
        />
        <KpiCard
          icon="satellite_alt"
          label={t('satelliteStatus')}
          value=""
          unit=""
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: '#396940', lineHeight: 1 }}>{t('active')}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 4, paddingTop: 12 }}>
            <span style={{ color: '#396940', fontSize: 10 }}>●</span> {t('statewidePass12h')}
          </div>
        </KpiCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f0', flexShrink: 0, gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>{t('statewideCommandMap', { state: STATE_PROFILE.state })}</h2>
              <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4, lineHeight: 1.4 }}>{t('liveSpatialAnalytics', { officerTitle: STATE_PROFILE.officerTitle })}</p>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 380 }}>
            <RegionalMap
              layerType="state"
              boundaryUrl={geoAsset('geo/state-boundary.json')}
              divisionOverlayUrl={geoAsset('geo/maharashtra-divisions.geojson')}
              divisionMatrix={DIVISION_MATRIX}
              fitBoundsOptions={STATE_MAP_FIT_BOUNDS_OPTIONS}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PanelSection title={t('statewideFriction')} subtitle={t('systemIntegrationErrors')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FrictionRow label={t('aadhaarMismatch')} pct={31} color="#ba1a1a" />
              <FrictionRow label={t('integrationFailure')} pct={24} color="#ba1a1a" />
            </div>
          </PanelSection>

          <PanelSection title={t('policyRecommendations')} subtitle={t('aiDrivenStatewideInsights')}>
            {FRICTION_MONTH.topThreeRecommendations.slice(0, 1).map((rec, i) => (
              <div key={i} style={{ borderLeft: '4px solid #396940', background: '#f5f8f6', borderRadius: '0 10px 10px 0', padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.4, margin: 0, marginBottom: 6 }}>
                    {t('marathwadaDroughtRelief')}
                  </p>
                <p style={{ fontSize: 11, color: '#717972', lineHeight: 1.55, margin: 0 }}>
                  {rec}
                </p>
              </div>
            ))}
          </PanelSection>

          <PanelSection title={t('statewideDisasterTriage')} subtitle={t('liveTelemetryTriggers')} badge={t('high')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.4, margin: 0 }}>
                  {t('marathwadaDroughtVidarbha')}
                </p>
                <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 6, lineHeight: 1.45 }}>{t('heatZonesFlagged')}</p>
              </div>
              <button style={{ width: '100%', padding: '11px 0', border: '1px solid #e2e3df', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#1a1c1a', background: '#fff', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                {t('conveneNdmaCell')}
              </button>
            </div>
          </PanelSection>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 24px', borderBottom: '1px solid #f3f4f0', flexWrap: 'wrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972' }}>table_chart</span>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', flex: 1, margin: 0, lineHeight: 1.35 }}>{t('divisionPerformanceMatrix')}</h3>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#717972', background: '#f3f4f0', padding: '5px 11px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            {t('divisionsSummary', { count: DIVISION_MATRIX.length, pending: totalPending.toLocaleString('en-IN'), alerts: totalAlerts })}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('division')}</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('jda')}</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('districts')}</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('fundsCr')}</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('disbursed')}</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('pending')}</th>
                <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {DIVISION_MATRIX.map((d, i) => {
                const chip = STATUS_CHIP[d.status] || { color: '#717972', bg: '#f3f4f0' };
                return (
                  <tr key={d.code} style={{ borderBottom: i !== DIVISION_MATRIX.length - 1 ? '1px solid #ebece8' : 'none', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '18px 24px', fontSize: 14, fontWeight: 600, color: '#1a1c1a' }}>{d.division}</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#444742' }}>{d.officer}</td>
                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.districts}</td>
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

      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 28px', borderBottom: '1px solid #f3f4f0' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(57,105,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>account_balance_wallet</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>
              {t('statewidePfmsDisbursementQueues')}
            </h3>
            <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4 }}>{t('divisionClearedBatches')}</p>
          </div>
          <button
            type="button"
            onClick={onDscAuthorize}
            className="district-dsc-btn"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
            {t('authorizeRelease')}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                <th className="district-table-header">{t('batchId')}</th>
                <th className="district-table-header">{t('schemeName')}</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>{t('beneficiaries')}</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>{t('amountCr')}</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>{t('aiConfidence')}</th>
                <th className="district-table-header" style={{ textAlign: 'center' }}>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {PFMS_BATCHES.map((b, idx) => (
                <tr key={b.id} className="district-table-row" style={{ borderBottom: idx === PFMS_BATCHES.length - 1 ? 'none' : '1px solid #f3f4f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '18px 28px', fontSize: '12px', fontWeight: 700, color: '#717972', fontVariantNumeric: 'tabular-nums' }}>{b.id}</td>
                  <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 600, color: '#1a1c1a' }}>{b.scheme}</td>
                  <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{b.beneficiaries.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₹{b.amountCr}</td>
                  <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: '#e2e3df', borderRadius: 2 }}>
                        <div style={{ height: '100%', background: '#396940', borderRadius: 2, width: `${b.avgConfidence * 100}%` }} />
                      </div>
                      <span className="district-stat-value" style={{ fontSize: '12px', color: '#396940', minWidth: 36 }}>{(b.avgConfidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                    <span className="district-status-pill" style={{ color: '#396940', background: 'rgba(186,240,188,0.3)', border: '1px solid rgba(57,105,64,0.2)' }}>{t('ready')}</span>
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

export default StateDashboard;