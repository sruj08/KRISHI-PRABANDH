import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  CROSS_DISTRICT_FRAUD_ALERTS,
  FRAUD_NETWORK_LINKS,
  FRAUD_INVESTIGATION_PIPELINE,
  FRAUD_DENSITY_BY_DISTRICT,
  DIVISION_PROFILE,
} from '../../utils/divisionMockData';
import { useLanguage } from '../../context/LanguageContext';
import { DivisionPanelSection } from './divisionDashboardUi';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DivisionCrossDistrictFraud = () => {
  const { t } = useLanguage();

  const pipelineBar = useMemo(
    () => ({
      labels: FRAUD_INVESTIGATION_PIPELINE.map((p) => p.stage),
      datasets: [{
        label: t('cases'),
        data: FRAUD_INVESTIGATION_PIPELINE.map((p) => p.count),
        backgroundColor: '#7c2d12',
        borderRadius: 4,
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

  const sevStyle = (s) => {
    if (s === 'P1') return { color: '#b71c1c', bg: 'rgba(255,218,214,0.55)' };
    return { color: '#c2410c', bg: 'rgba(255,224,178,0.45)' };
  };

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#717972', margin: 0 }}>
            {t('macroFraudIntel')}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1c1a', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
            {t('crossDistrictFraudCenter')}
          </h1>
          <p className="state-dashboard__map-sub" style={{ marginTop: 8, maxWidth: 860 }}>
            {DIVISION_PROFILE.division} division · {t('fraudCenterSub')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
          <DivisionPanelSection title={t('investigationPipeline')} subtitle={t('caseCountsDemo')}>
            <div style={{ height: 220 }}>
              <Bar data={pipelineBar} options={chartOpts} />
            </div>
          </DivisionPanelSection>
          <DivisionPanelSection title={t('fraudNetworkLinks')} subtitle={t('readOnlyDeskGraph')}>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FRAUD_NETWORK_LINKS.map((lnk, idx) => (
                <li key={idx} style={{ fontSize: 12, color: '#1a1c1a', lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 700 }}>{lnk.from}</span>
                  <span style={{ color: '#717972', margin: '0 6px' }}>→</span>
                  <span style={{ fontWeight: 600 }}>{lnk.to}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#5c6560', marginLeft: 8 }}>({lnk.type})</span>
                </li>
              ))}
            </ul>
          </DivisionPanelSection>
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>grid_on</span>
            <h3 className="state-dashboard__data-title">{t('fraudDensityByDistrict')}</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  {[t('district'), t('fraudRiskAlerts'), t('suspiciousApplicationsEst'), t('exposureDeskIndex')].map((h) => (
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
                {FRAUD_DENSITY_BY_DISTRICT.map((d, i) => (
                  <tr key={d.code} style={{ borderBottom: i !== FRAUD_DENSITY_BY_DISTRICT.length - 1 ? '1px solid #ebece8' : 'none', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#1a1c1a' }}>{d.district}</td>
                    <td style={{ padding: '16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.fraudAlerts}</td>
                    <td style={{ padding: '16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.suspiciousApplicationsEst?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{d.exposureDeskIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>crisis_alert</span>
            <h3 className="state-dashboard__data-title">{t('crossDistrictAnomalyFeed')}</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  {[
                    t('severity'),
                    t('fraudCase'),
                    t('districts'),
                    t('schemeName'),
                    t('exposureCr'),
                    t('aiConfidence'),
                    t('investigationStatus'),
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 12px',
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
                  return (
                    <tr key={a.id} style={{ borderBottom: i !== CROSS_DISTRICT_FRAUD_ALERTS.length - 1 ? '1px solid #ebece8' : 'none', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 6, color: sv.color, background: sv.bg }}>{a.severity}</span>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: 13, fontWeight: 600, color: '#1a1c1a', maxWidth: 360 }}>{a.title}</td>
                      <td style={{ padding: '16px 12px', fontSize: 12, color: '#414943' }}>{a.districts.join(' · ')}</td>
                      <td style={{ padding: '16px 12px', fontSize: 12, color: '#1a1c1a' }}>{a.scheme}</td>
                      <td style={{ padding: '16px 12px', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>₹{a.exposureCr} Cr</td>
                      <td style={{ padding: '16px 12px', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{a.confidencePct}%</td>
                      <td style={{ padding: '16px 12px', fontSize: 12, fontWeight: 600, color: '#5c6560' }}>{a.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisionCrossDistrictFraud;
