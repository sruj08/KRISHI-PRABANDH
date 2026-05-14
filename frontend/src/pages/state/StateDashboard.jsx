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
import { fetchClaimsSummary } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';
import { useDivisionLiveIntel } from '../../hooks/useDivisionLiveIntel';
import '../district/district.css';
import './state-dashboard.css';

const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';

const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children, onClick }) => (
  <div
    onClick={onClick}
    className={`state-dashboard__kpi${onClick ? ' state-dashboard__kpi--clickable' : ''}`}
  >
    <div className="state-dashboard__kpi-head">
      <div className="state-dashboard__kpi-icon-wrap">
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#5c6560' }}>{icon}</span>
      </div>
      <span className="state-dashboard__kpi-label">{label}</span>
    </div>
    {children ? (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>{children}</div>
    ) : (
      <>
        <div className="state-dashboard__kpi-value-row">
          <span className="state-dashboard__kpi-value">{value.startsWith('₹') ? value : `₹${value}`}</span>
          {unit && <span className="state-dashboard__kpi-unit">{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 6, background: '#eceee9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
          </div>
        )}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, fontWeight: 600, marginTop: 'auto', paddingTop: 12, color: subColor, lineHeight: 1.45 }}>
            {subIcon && <span className="material-symbols-outlined" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{subIcon}</span>}
            <span style={{ minWidth: 0 }}>{sub}</span>
          </div>
        )}
      </>
    )}
  </div>
);

const PanelSection = ({ title, subtitle, badge, children }) => (
  <div className="state-dashboard__panel">
    <div className="state-dashboard__panel-head">
      <div style={{ minWidth: 0 }}>
        <h3 className="state-dashboard__panel-title">{title}</h3>
        {subtitle && <p className="state-dashboard__panel-sub">{subtitle}</p>}
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ba1a1a', background: 'rgba(255,218,214,0.45)', padding: '5px 10px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>{badge}</span>
      )}
    </div>
    <div>{children}</div>
  </div>
);

const FrictionRow = ({ label, pct, color }) => (
  <div className="state-dashboard__friction-row">
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 500, color: TEXT_PRIMARY, flex: 1, minWidth: 0, lineHeight: 1.45 }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums', paddingLeft: 4 }}>{pct}%</span>
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
  const { t, lang } = useLanguage();
  const { liveByCode, error: liveIntelError } = useDivisionLiveIntel();
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
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">

      {!summaryLoading && liveSummary && (
        <div className="state-dashboard__strip">
          <span className="material-symbols-outlined state-dashboard__strip-icon">analytics</span>
          <span className="state-dashboard__strip-title">{t('Live Claims Summary', lang)}</span>
          <span style={{ color: '#5c6560' }}>
            {t('Total', lang)}: <strong style={{ color: '#1a1c1a' }}>{totalClaims ?? '—'}</strong>
          </span>
          {approvedCount != null && (
            <span style={{ color: '#2e7d32' }}>
              {t('Approved', lang)}: <strong>{approvedCount}</strong>
            </span>
          )}
          {pendingCount != null && (
            <span style={{ color: '#c2410c' }}>
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

      <div className="state-dashboard-kpi-grid">
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
          <div className="state-dashboard__kpi-value-row">
            <span className="state-dashboard__kpi-value">{EXEC_KPIS.projectedUnutilizedPct}</span>
            <span className="state-dashboard__kpi-unit">%</span>
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
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2d6b48', lineHeight: 1 }}>{t('active')}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 6, paddingTop: 12 }}>
            <span style={{ color: '#396940', fontSize: 10, lineHeight: 1 }} aria-hidden>●</span>
            <span>{t('statewidePass12h')}</span>
          </div>
        </KpiCard>
      </div>

      <div className="state-dashboard-command-layout">
        <div className="state-dashboard__map-panel">
          <div className="state-dashboard__map-head">
            <div>
              <h2 className="state-dashboard__map-title">{t('statewideCommandMap', { state: STATE_PROFILE.state })}</h2>
              <p className="state-dashboard__map-sub">{t('liveSpatialAnalytics', { officerTitle: STATE_PROFILE.officerTitle })}</p>
              {liveIntelError && (
                <p className="state-dashboard__live-warn">Live division metrics could not be refreshed.</p>
              )}
            </div>
          </div>
          <div className="state-dashboard__map-body">
            <RegionalMap
              layerType="state"
              boundaryUrl={geoAsset('geo/state-boundary.json')}
              divisionOverlayUrl={geoAsset('geo/maharashtra-divisions.geojson')}
              divisionMatrix={DIVISION_MATRIX}
              fitBoundsOptions={STATE_MAP_FIT_BOUNDS_OPTIONS}
              liveDivisionMetrics={liveByCode || undefined}
            />
          </div>
        </div>

        <div className="state-dashboard-insight-rail">
          <PanelSection title={t('statewideFriction')} subtitle={t('systemIntegrationErrors')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <FrictionRow label={t('aadhaarMismatch')} pct={31} color="#ba1a1a" />
              <FrictionRow label={t('integrationFailure')} pct={24} color="#ba1a1a" />
            </div>
          </PanelSection>

          <PanelSection title={t('policyRecommendations')} subtitle={t('aiDrivenStatewideInsights')}>
            {FRICTION_MONTH.topThreeRecommendations.slice(0, 1).map((rec, i) => (
              <div key={i} className="state-dashboard__rec-card">
                <p className="state-dashboard__rec-title">{t('marathwadaDroughtRelief')}</p>
                <p className="state-dashboard__rec-body">{rec}</p>
              </div>
            ))}
          </PanelSection>

          <PanelSection title={t('statewideDisasterTriage')} subtitle={t('liveTelemetryTriggers')} badge={t('high')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p className="state-dashboard__rec-title" style={{ marginBottom: 6 }}>{t('marathwadaDroughtVidarbha')}</p>
                <p className="state-dashboard__rec-body">{t('heatZonesFlagged')}</p>
              </div>
              <button type="button" className="state-dashboard__cta">
                {t('conveneNdmaCell')}
              </button>
            </div>
          </PanelSection>
        </div>
      </div>

      <div className="state-dashboard__data-panel">
        <div className="state-dashboard__data-head">
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>table_chart</span>
          <h3 className="state-dashboard__data-title">{t('divisionPerformanceMatrix')}</h3>
          <span className="state-dashboard__data-meta">
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

      <div className="state-dashboard__data-panel">
        <div className="state-dashboard__pfms-head">
          <div className="state-dashboard__pfms-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#2d6b48' }}>account_balance_wallet</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="state-dashboard__data-title" style={{ fontSize: 15 }}>
              {t('statewidePfmsDisbursementQueues')}
            </h3>
            <p className="state-dashboard__map-sub" style={{ marginTop: 4 }}>{t('divisionClearedBatches')}</p>
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
    </div>
  );
};

export default StateDashboard;