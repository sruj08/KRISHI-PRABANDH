import React, { useState, useCallback, useMemo } from 'react';
import RegionalMap from '../../components/maps/RegionalMap';
import { geoAsset } from '../../utils/geoAsset';
import {
  EXEC_KPIS,
  PFMS_BATCHES,
  FRICTION_MONTH,
  DISTRICT_MATRIX,
  DIVISION_PROFILE,
  DISTRICT_EXEC_INSIGHTS,
} from '../../utils/divisionMockData';
import { buildLiveDistrictMapMetrics } from '../../utils/divisionMapLiveOverlay';
import { useToast } from '../../hooks/useToast.jsx';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import { fetchClaimsSummary } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';
import { useDivisionLiveIntel } from '../../hooks/useDivisionLiveIntel';
import {
  DivisionKpiCard,
  DivisionPanelSection,
  DivisionFrictionRow,
  STATUS_CHIP,
} from './divisionDashboardUi';

const DivisionDashboard = () => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { stats, mandals } = useKrishiData();
  const [liveSummary, setLiveSummary] = useState(null);
  const { liveByCode, climateMeta, error: liveIntelError } = useDivisionLiveIntel();

  const liveDistrictMapMetrics = useMemo(
    () => buildLiveDistrictMapMetrics(liveByCode, DISTRICT_MATRIX, 'PNE'),
    [liveByCode],
  );

  const loadSummary = useCallback(async () => {
    try {
      const s = await fetchClaimsSummary();
      setLiveSummary(s);
    } catch (_) {}
  }, []);

  usePolling(loadSummary, 5000);

  const circlesInDivision =
    user?.division_id != null
      ? mandals.filter((m) => Number(m.division_id) === Number(user.division_id)).length
      : null;

  const onDscAuthorize = () => {
    const total = PFMS_BATCHES.reduce((a, b) => a + b.beneficiaries, 0);
    addToast(t('dscReleaseQueuedDivision', { total: total.toLocaleString('en-IN'), count: PFMS_BATCHES.length }), 'success', 4200);
  };

  const totalAlerts = DISTRICT_MATRIX.reduce((a, d) => a + d.fraudAlerts, 0);
  const totalPending = DISTRICT_MATRIX.reduce((a, d) => a + d.pending, 0);

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">

        {liveSummary && (
          <div className="state-dashboard__strip">
            <span className="material-symbols-outlined state-dashboard__strip-icon">analytics</span>
            <span className="state-dashboard__strip-title">{t('Live Claims Summary')}</span>
            <span style={{ color: '#5c6560' }}>
              {t('Total')}: <strong style={{ color: '#1a1c1a' }}>{liveSummary.totalClaims ?? liveSummary.total_applications ?? '-'}</strong>
            </span>
            {liveSummary.approved != null && (
              <span style={{ color: '#2e7d32' }}>
                {t('Approved')}: <strong>{liveSummary.approved}</strong>
              </span>
            )}
            {liveSummary.pending != null && (
              <span style={{ color: '#c2410c' }}>
                {t('Pending')}: <strong>{liveSummary.pending}</strong>
              </span>
            )}
          </div>
        )}

        {(user?.division_name || circlesInDivision != null || stats?.totalSurveys != null) && (
          <div className="state-dashboard__strip">
            <span className="material-symbols-outlined state-dashboard__strip-icon">dataset</span>
            <span className="state-dashboard__strip-title">{t('csvScopeDivision')}</span>
            {user?.division_name && (
              <span style={{ color: '#5c6560' }}>
                {t('division')}: <strong style={{ color: '#1a1c1a' }}>{user.division_name}</strong>
              </span>
            )}
            {circlesInDivision != null && (
              <span style={{ color: '#5c6560' }}>
                {t('agricultureCirclesInDataset')}: <strong style={{ color: '#1a1c1a' }}>{circlesInDivision}</strong>
              </span>
            )}
            {stats?.totalSurveys != null && (
              <span style={{ color: '#5c6560', marginLeft: 'auto' }}>
                {t('statewideSurveysCsv')}: {Number(stats.totalSurveys).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        )}

        <div className="state-dashboard-kpi-grid">
          <DivisionKpiCard
            icon="account_balance_wallet"
            label={t('divisionAllocatedFunds')}
            value={EXEC_KPIS.totalBudgetCr}
            unit="Cr"
            sub={t('fyBudgetPeriod')}
          />
          <DivisionKpiCard
            icon="payments"
            label={t('disbursedYtd')}
            value={EXEC_KPIS.disbursedCr}
            unit="Cr"
            progress={parseFloat(EXEC_KPIS.disbursedPct)}
            sub={t('target', { target: EXEC_KPIS.disbursedTarget })}
          />
          <DivisionKpiCard
            icon="assignment_turned_in"
            label={t('pendingPfmsClearance')}
            value={EXEC_KPIS.pendingPfmCr}
            unit="Cr"
            sub={t('fortyEightHourAlert')}
            subIcon="warning"
            subColor="#ba1a1a"
          />
          <DivisionKpiCard
            icon="monitoring"
            label={t('underUtilization')}
            value=""
            unit=""
          >
            <div className="state-dashboard__kpi-value-row">
              <span className="state-dashboard__kpi-value">{EXEC_KPIS.projectedUnutilizedPct}</span>
              <span className="state-dashboard__kpi-unit">%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#717972', paddingTop: 12 }}>
              {t('acrossAllSchemes')}
            </div>
          </DivisionKpiCard>
          <DivisionKpiCard
            icon="warning"
            label={t('fraudRiskAlerts')}
            value={String(totalAlerts)}
            unit=""
            noCurrency
            sub={t('districtsAtRisk', { count: DISTRICT_MATRIX.filter((d) => d.status === 'Watch' || d.status === 'Lagging').length })}
            subIcon="report_problem"
            subColor="#ba1a1a"
          />
          <DivisionKpiCard
            icon="satellite_alt"
            label={t('satelliteStatus')}
            value=""
            unit=""
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2d6b48', lineHeight: 1 }}>{t('active')}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#717972', display: 'flex', alignItems: 'center', gap: 6, paddingTop: 12 }}>
              <span style={{ color: '#396940', fontSize: 10, lineHeight: 1 }} aria-hidden>●</span>
              <span>{EXEC_KPIS.sentinel2Pass}</span>
            </div>
          </DivisionKpiCard>
        </div>

        <div className="state-dashboard-command-layout">
          <div className="state-dashboard__map-panel">
            <div className="state-dashboard__map-head">
              <div>
                <h2 className="state-dashboard__map-title">{t('districtCommandMapTitle')}</h2>
                <p className="state-dashboard__map-sub">
                  {DIVISION_PROFILE.division} · {DIVISION_PROFILE.role} - {t('districtCommandMapSub')}
                </p>
                {liveIntelError && (
                  <p className="state-dashboard__live-warn">{t('liveDivisionMetricsWarn')}</p>
                )}
                {climateMeta?.source && (
                  <p className="state-dashboard__map-sub" style={{ marginTop: 8, fontSize: 11 }}>
                    {t('mapClimateSourceLine', {
                      source: climateMeta.source,
                      window: climateMeta.window ? `${climateMeta.window.start} → ${climateMeta.window.end}` : '-',
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="state-dashboard__map-body">
              <RegionalMap
                layerType="division"
                boundaryUrl={geoAsset('geo/maharashtra-division.topo.json')}
                divisionOverlayUrl={geoAsset('geo/pune-division-districts.geojson')}
                divisionMatrix={DISTRICT_MATRIX}
                liveDivisionMetrics={liveDistrictMapMetrics}
              />
            </div>
          </div>

          <div className="state-dashboard-insight-rail">
            <DivisionPanelSection title={t('executiveInsightPanel')} subtitle={t('divisionRollingSummary')}>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DISTRICT_EXEC_INSIGHTS.map((line) => (
                  <li key={line.slice(0, 28)} style={{ fontSize: 12, color: '#414943', lineHeight: 1.5 }}>
                    {line}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #eceee9' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717972', margin: '0 0 8px' }}>
                  {t('divisionNextActions')}
                </p>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#1a1c1a', lineHeight: 1.45 }}>
                  <li>{t('divisionActionClearPfms')}</li>
                  <li>{t('divisionActionSurveySolapur')}</li>
                  <li>{t('divisionActionFraudRing')}</li>
                </ol>
              </div>
            </DivisionPanelSection>

            <DivisionPanelSection title={t('crossDistrictFriction')} subtitle={t('systemIntegrationErrors')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <DivisionFrictionRow label={t('aadhaarMismatch')} pct={38} color="#ba1a1a" />
                <DivisionFrictionRow label={t('integrationFailure')} pct={26} color="#ba1a1a" />
              </div>
            </DivisionPanelSection>

            <DivisionPanelSection title={t('divisionalRecommendations')} subtitle={t('aiDrivenCrossDistrictInsights')}>
              {FRICTION_MONTH.topThreeRecommendations.slice(0, 1).map((rec, i) => (
                <div key={i} className="state-dashboard__rec-card">
                  <p className="state-dashboard__rec-title">{t('jointAuditSolapurSangli')}</p>
                  <p className="state-dashboard__rec-body">{rec}</p>
                </div>
              ))}
            </DivisionPanelSection>

            <DivisionPanelSection title={t('disasterTriage')} subtitle={t('liveTelemetryTriggers')} badge={t('high')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <p className="state-dashboard__rec-title" style={{ marginBottom: 6 }}>{t('droughtStressSolapur')}</p>
                  <p className="state-dashboard__rec-body">{t('plotsFlaggedMadhaMangalwedha')}</p>
                </div>
                <button type="button" className="state-dashboard__cta">
                  {t('initiateDroneSurvey')}
                </button>
              </div>
            </DivisionPanelSection>
          </div>
        </div>

        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>table_chart</span>
            <h3 className="state-dashboard__data-title">{t('districtPerformanceMatrix')}</h3>
            <span className="state-dashboard__data-meta">
              {t('districtsSummary', { pending: totalPending.toLocaleString('en-IN'), alerts: totalAlerts })}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('district')}</th>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('officer')}</th>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('talukas')}</th>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('fundsCr')}</th>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('disbursed')}</th>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'right', textTransform: 'uppercase', fontWeight: 700 }}>{t('pending')}</th>
                  <th style={{ padding: '14px 24px', fontSize: 10, letterSpacing: '0.1em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('status')}</th>
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

        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__pfms-head">
            <div className="state-dashboard__pfms-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#2d6b48' }}>account_balance_wallet</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="state-dashboard__data-title" style={{ fontSize: 15 }}>
                {t('divisionalPfmsDisbursementQueues')}
              </h3>
              <p className="state-dashboard__map-sub" style={{ marginTop: 4 }}>{t('districtClearedBatches')}</p>
            </div>
            <button type="button" onClick={onDscAuthorize} className="district-dsc-btn">
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
    </div>
  );
};

export default DivisionDashboard;
