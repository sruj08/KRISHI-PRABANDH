import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import RegionalMap from '../../components/maps/RegionalMap';
import { geoAsset } from '../../utils/geoAsset';
import {
  AI_FRAUD_SIGNALS,
  CROSS_DISTRICT_FRAUD_ALERTS,
  DIVISION_FRAUD_KPIS,
  DIVISION_PROFILE,
  DISTRICT_MATRIX,
  FRAUD_CASE_STATUS_STAGES,
  FRAUD_DENSITY_BY_DISTRICT,
} from '../../utils/divisionMockData';
import { buildFraudDistrictMapMetrics } from '../../utils/divisionMapLiveOverlay';
import { useLanguage } from '../../context/LanguageContext';
import { DivisionKpiCard, DivisionPanelSection } from './divisionDashboardUi';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AI_SIGNAL_I18N = {
  dup_docs: 'aiFraudSignal_dup_docs',
  aadhaar: 'aiFraudSignal_aadhaar',
  gps: 'aiFraudSignal_gps',
  invoice: 'aiFraudSignal_invoice',
  land: 'aiFraudSignal_land',
};

const DivisionCrossDistrictFraud = () => {
  const { t } = useLanguage();
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const fraudMapMetrics = useMemo(
    () => buildFraudDistrictMapMetrics(FRAUD_DENSITY_BY_DISTRICT),
    [],
  );

  const selectedCase = useMemo(
    () => CROSS_DISTRICT_FRAUD_ALERTS.find((a) => a.id === selectedCaseId) || null,
    [selectedCaseId],
  );

  const maxSeverityScore = useMemo(
    () => Math.max(1, ...FRAUD_DENSITY_BY_DISTRICT.map((d) => d.fraudSeverityScore ?? 0)),
    [],
  );

  const severityBandStyle = (score) => {
    const n = (Number(score) || 0) / maxSeverityScore;
    if (n >= 0.66) return { bg: 'rgba(183, 28, 28, 0.12)', border: 'rgba(183, 28, 28, 0.35)' };
    if (n >= 0.33) return { bg: 'rgba(194, 65, 12, 0.1)', border: 'rgba(194, 65, 12, 0.3)' };
    return { bg: 'rgba(57, 105, 64, 0.08)', border: 'rgba(57, 105, 64, 0.28)' };
  };

  const aiSignalsBar = useMemo(
    () => ({
      labels: AI_FRAUD_SIGNALS.map((s) => t(AI_SIGNAL_I18N[s.id])),
      datasets: [{
        label: t('cases'),
        data: AI_FRAUD_SIGNALS.map((s) => s.count),
        backgroundColor: ['#7c2d12', '#9a3412', '#c2410c', '#a16207', '#365314'],
        borderRadius: 4,
      }],
    }),
    [t],
  );

  const caseStatusBar = useMemo(
    () => ({
      labels: FRAUD_CASE_STATUS_STAGES.map((p) => p.stage),
      datasets: [{
        label: t('cases'),
        data: FRAUD_CASE_STATUS_STAGES.map((p) => p.count),
        backgroundColor: '#57534e',
        borderRadius: 3,
      }],
    }),
    [t],
  );

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 10 }, maxRotation: 35 }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
    },
  };

  const caseStatusOpts = {
    ...chartOpts,
    scales: {
      ...chartOpts.scales,
      x: { ...chartOpts.scales.x, ticks: { font: { size: 9 }, maxRotation: 45 } },
    },
  };

  const sevStyle = (s) => {
    if (s === 'P1') return { color: '#b71c1c', bg: 'rgba(255,218,214,0.55)' };
    return { color: '#c2410c', bg: 'rgba(255,224,178,0.45)' };
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 999,
    background: '#eef1ee',
    color: '#374151',
    border: '1px solid #e2e3df',
    marginRight: 6,
    marginBottom: 4,
  };

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#717972', margin: 0 }}>
            {t('fraudDeskIntel')}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1c1a', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
            {t('crossDistrictFraudCenter')}
          </h1>
          <p className="state-dashboard__map-sub" style={{ marginTop: 8, maxWidth: 900 }}>
            {DIVISION_PROFILE.division} division · {t('fraudCenterSubAgriWorkflow')}
          </p>
        </div>

        <div className="state-dashboard-kpi-grid" style={{ marginBottom: 16 }}>
          <DivisionKpiCard
            icon="priority_high"
            label={t('fraudKpiOpenP1')}
            value={String(DIVISION_FRAUD_KPIS.openP1)}
            unit=""
            noCurrency
            sub={t('caseCountsDemo')}
          />
          <DivisionKpiCard
            icon="flag"
            label={t('fraudKpiOpenP2')}
            value={String(DIVISION_FRAUD_KPIS.openP2)}
            unit=""
            noCurrency
            sub={t('caseCountsDemo')}
          />
          <DivisionKpiCard
            icon="hub"
            label={t('fraudKpiCrossDistrictRings')}
            value={String(DIVISION_FRAUD_KPIS.crossDistrictRings)}
            unit=""
            noCurrency
            sub={t('fraudKpiRingsSub')}
          />
          <DivisionKpiCard
            icon="account_balance"
            label={t('fraudKpiExposureCr')}
            value={String(DIVISION_FRAUD_KPIS.estimatedExposureCr)}
            unit="Cr"
            sub={t('exposureCr')}
          />
          <DivisionKpiCard
            icon="groups"
            label={t('fraudKpiDaoDesks')}
            value={String(DIVISION_FRAUD_KPIS.daoVigilanceDesks)}
            unit=""
            noCurrency
            sub={t('fraudKpiDaoDesksSub')}
          />
        </div>

        <div className="state-dashboard-command-layout" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__map-panel">
            <div className="state-dashboard__map-head">
              <div>
                <h2 className="state-dashboard__map-title">{t('districtFraudCommandMapTitle')}</h2>
                <p className="state-dashboard__map-sub">{t('districtFraudCommandMapSub')}</p>
              </div>
            </div>
            <div className="state-dashboard__map-body">
              <RegionalMap
                layerType="division"
                boundaryUrl={geoAsset('geo/maharashtra-division.topo.json')}
                divisionOverlayUrl={geoAsset('geo/pune-division-districts.geojson')}
                divisionMatrix={DISTRICT_MATRIX}
                liveDivisionMetrics={fraudMapMetrics}
                treatPenetrationLayerAsFraudHeat
              />
            </div>
          </div>

          <div className="state-dashboard-insight-rail">
            <DivisionPanelSection title={t('aiFraudSignals')} subtitle={t('aiFraudSignalsSub')}>
              <div style={{ height: 200 }}>
                <Bar data={aiSignalsBar} options={chartOpts} />
              </div>
            </DivisionPanelSection>
            <DivisionPanelSection title={t('fraudCaseStatusBars')} subtitle={t('fraudCaseStatusBarsSub')}>
              <div style={{ height: 120 }}>
                <Bar data={caseStatusBar} options={caseStatusOpts} />
              </div>
            </DivisionPanelSection>
          </div>
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>grid_on</span>
            <h3 className="state-dashboard__data-title">{t('districtFraudAlertsTable')}</h3>
            <span className="state-dashboard__data-meta">{t('districtFraudAlertsTableSub')}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  {[t('district'), t('fraudRiskAlerts'), t('suspiciousSubsidyClaims'), t('fraudSeverityScore')].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        color: '#717972',
                        textAlign: h === t('district') ? 'left' : 'right',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FRAUD_DENSITY_BY_DISTRICT.map((d, i) => {
                  const band = severityBandStyle(d.fraudSeverityScore);
                  return (
                    <tr
                      key={d.code}
                      style={{
                        borderBottom: i !== FRAUD_DENSITY_BY_DISTRICT.length - 1 ? '1px solid #ebece8' : 'none',
                        background: i % 2 === 1 ? '#fafafa' : '#fff',
                        boxShadow: `inset 3px 0 0 0 ${band.border}`,
                      }}
                    >
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#1a1c1a' }}>{d.district}</td>
                      <td style={{ padding: '16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.fraudAlerts}</td>
                      <td style={{ padding: '16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.suspiciousApplicationsEst?.toLocaleString('en-IN')}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: 13,
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 700,
                        background: band.bg,
                      }}
                      >
                        {d.fraudSeverityScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div className="state-dashboard__data-panel" style={{ marginBottom: 0 }}>
            <div className="state-dashboard__data-head">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>crisis_alert</span>
              <h3 className="state-dashboard__data-title">{t('crossDistrictFraudFeedTitle')}</h3>
              <span className="state-dashboard__data-meta">{t('crossDistrictFraudFeedSub')}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1020 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                    {[
                      t('severity'),
                      t('fraudCase'),
                      t('whyFlagged'),
                      t('districts'),
                      t('schemeName'),
                      t('aiSuspicionPct'),
                      t('exposureCr'),
                      t('fraudCaseStatusCol'),
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 10px',
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          color: '#717972',
                          textAlign: 'left',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CROSS_DISTRICT_FRAUD_ALERTS.map((a, i) => {
                    const sv = sevStyle(a.severity);
                    const selected = a.id === selectedCaseId;
                    return (
                      <tr
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCaseId(a.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCaseId(a.id);
                          }
                        }}
                        style={{
                          borderBottom: i !== CROSS_DISTRICT_FRAUD_ALERTS.length - 1 ? '1px solid #ebece8' : 'none',
                          background: selected ? 'rgba(26, 54, 93, 0.06)' : i % 2 === 1 ? '#fafafa' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 6, color: sv.color, background: sv.bg }}>{a.severity}</span>
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: 13, fontWeight: 600, color: '#1a1c1a', maxWidth: 280, verticalAlign: 'top' }}>
                          <div>{a.title}</div>
                          {a.aiReasonLine && (
                            <div style={{ marginTop: 6, fontSize: 11, fontWeight: 500, color: '#5c6560', lineHeight: 1.45 }}>
                              {a.aiReasonLine}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 10px', verticalAlign: 'top', minWidth: 160 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {(a.whyFlagged || []).map((w) => (
                              <span key={w} style={chipStyle}>{w}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: 12, color: '#414943', verticalAlign: 'top' }}>{a.districts.join(' · ')}</td>
                        <td style={{ padding: '14px 10px', fontSize: 12, color: '#1a1c1a', verticalAlign: 'top' }}>{a.scheme}</td>
                        <td style={{ padding: '14px 10px', fontSize: 13, fontVariantNumeric: 'tabular-nums', verticalAlign: 'top' }}>{a.confidencePct}%</td>
                        <td style={{ padding: '14px 10px', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', verticalAlign: 'top' }}>₹{a.exposureCr} Cr</td>
                        <td style={{ padding: '14px 10px', fontSize: 12, fontWeight: 600, color: '#5c6560', verticalAlign: 'top' }}>{a.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="state-dashboard__data-panel">
              <div className="state-dashboard__data-head">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>link</span>
                <h3 className="state-dashboard__data-title">{t('linkedSubsidyRecords')}</h3>
              </div>
              {!selectedCase ? (
                <p style={{ margin: '8px 16px 16px', fontSize: 13, color: '#5c6560', lineHeight: 1.5 }}>
                  {t('selectCaseForLinkedApps')}
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                        {[t('farmerNameCol'), t('applicationIdCol'), t('schemeName'), t('district'), t('talukaCol'), t('invoiceOrChassisCol'), t('dealerCol'), t('bankHintCol'), t('uploadedAtCol')].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '10px 12px',
                              fontSize: 9,
                              letterSpacing: '0.08em',
                              color: '#717972',
                              textAlign: 'left',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCase.linkedApplications || []).map((row, idx) => (
                        <tr key={`${selectedCase.id}-${idx}`} style={{ borderBottom: '1px solid #ebece8', background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>
                          <td style={{ padding: '12px', fontSize: 12, fontWeight: 600 }}>{row.farmerName}</td>
                          <td style={{ padding: '12px', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>{row.applicationId}</td>
                          <td style={{ padding: '12px', fontSize: 11 }}>{row.scheme}</td>
                          <td style={{ padding: '12px', fontSize: 12 }}>{row.district}</td>
                          <td style={{ padding: '12px', fontSize: 12 }}>{row.taluka || '—'}</td>
                          <td style={{ padding: '12px', fontSize: 11 }}>{row.invoiceOrChassis || '—'}</td>
                          <td style={{ padding: '12px', fontSize: 11 }}>{row.dealer || '—'}</td>
                          <td style={{ padding: '12px', fontSize: 11 }}>{row.bankOrAadhaarHint || '—'}</td>
                          <td style={{ padding: '12px', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{row.uploadedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="state-dashboard__data-panel">
              <div className="state-dashboard__data-head">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>account_tree</span>
                <h3 className="state-dashboard__data-title">{t('caseRelationshipView')}</h3>
              </div>
              {!selectedCase ? (
                <p style={{ margin: '8px 16px 16px', fontSize: 13, color: '#5c6560', lineHeight: 1.5 }}>
                  {t('selectCaseForLinkedApps')}
                </p>
              ) : (
                <ul style={{ margin: '8px 16px 16px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(selectedCase.relationshipSnippets || []).map((line, idx) => (
                    <li key={idx} style={{ fontSize: 12, color: '#1a1c1a', lineHeight: 1.5 }}>
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisionCrossDistrictFraud;
