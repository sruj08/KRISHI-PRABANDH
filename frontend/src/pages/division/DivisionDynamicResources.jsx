import React, { useMemo, useState, useEffect } from 'react';
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
  RESOURCE_LOAD_ROWS,
  RESOURCE_REALLOCATION_SUGGESTION,
  RESOURCE_EVENT_SCENARIOS,
  DISTRICT_MATRIX,
} from '../../utils/divisionMockData';
import { useLanguage } from '../../context/LanguageContext';
import { DivisionKpiCard, STATUS_CHIP } from './divisionDashboardUi';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/** Western Maharashtra centroid — Open-Meteo public API (no key). */
const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=17.65&longitude=74.25&daily=precipitation_sum&forecast_days=7&timezone=Asia%2FKolkata';

const DivisionDynamicResources = () => {
  const { t } = useLanguage();
  const [openMeteo, setOpenMeteo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(OPEN_METEO_URL);
        if (!res.ok) throw new Error(String(res.status));
        const j = await res.json();
        const sums = j.daily?.precipitation_sum || [];
        const weekMm = sums.reduce((a, x) => a + (Number(x) || 0), 0);
        if (!cancelled) {
          setOpenMeteo({
            weekMm,
            start: j.daily?.time?.[0],
            end: j.daily?.time?.[sums.length - 1],
          });
        }
      } catch {
        if (!cancelled) setOpenMeteo(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadBarGrouped = useMemo(
    () => ({
      labels: RESOURCE_LOAD_ROWS.map((r) => r.district),
      datasets: [
        {
          label: t('pendingSurveys'),
          data: RESOURCE_LOAD_ROWS.map((r) => r.pendingSurveys),
          backgroundColor: '#1a365d',
          borderRadius: 4,
        },
        {
          label: t('pendingClaims'),
          data: RESOURCE_LOAD_ROWS.map((r) => r.pendingClaims),
          backgroundColor: '#5c6560',
          borderRadius: 4,
        },
        {
          label: t('pendingGrievances'),
          data: RESOURCE_LOAD_ROWS.map((r) => r.pendingGrievances),
          backgroundColor: '#b45309',
          borderRadius: 4,
        },
        {
          label: t('soilHealthTestBacklog'),
          data: RESOURCE_LOAD_ROWS.map((r) => r.soilHealthTestBacklog),
          backgroundColor: '#7c2d12',
          borderRadius: 4,
        },
      ],
    }),
    [t],
  );

  const chartOptsGrouped = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { font: { size: 9 }, boxWidth: 10 } } },
    scales: {
      x: { ticks: { font: { size: 9 }, maxRotation: 28 }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
    },
  };

  const overloaded = RESOURCE_LOAD_ROWS.filter((r) => r.stress === 'Overloaded' || r.stress === 'Critical').length;

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#717972', margin: 0 }}>
            {t('divisionAuthorityWorkflow')}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1c1a', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
            {t('Dynamic Resource Reallocation')}
          </h1>
          <p className="state-dashboard__map-sub" style={{ marginTop: 8, maxWidth: 820 }}>
            {t('dynamicResourceIntro')}
          </p>
        </div>

        {openMeteo && (
          <div className="state-dashboard__strip" style={{ marginBottom: 4 }}>
            <span className="material-symbols-outlined state-dashboard__strip-icon">water_drop</span>
            <span className="state-dashboard__strip-title">{t('openMeteoRainContext')}</span>
            <span style={{ color: '#5c6560' }}>
              {t('openMeteoSevenDaySum', { mm: openMeteo.weekMm.toFixed(1) })}
            </span>
            {openMeteo.start && (
              <span style={{ color: '#5c6560', marginLeft: 'auto', fontSize: 11 }}>
                {openMeteo.start} → {openMeteo.end}
              </span>
            )}
          </div>
        )}

        <div className="state-dashboard-kpi-grid">
          <DivisionKpiCard icon="warning" label={t('districtsInStress')} value={String(overloaded)} unit="" noCurrency sub={t('stressModerateOrAbove')} subColor="#b45309" />
          <DivisionKpiCard icon="groups" label={t('activeFieldStaffDivision')} value={String(RESOURCE_LOAD_ROWS.reduce((a, r) => a + r.activeFieldStaff, 0))} unit="" noCurrency sub={t('surveyPlusVerification')} />
          <DivisionKpiCard icon="schedule" label={t('avgResolutionHours')} value={String(Math.round(RESOURCE_LOAD_ROWS.reduce((a, r) => a + r.avgResolutionHrs, 0) / RESOURCE_LOAD_ROWS.length))} unit="h" noCurrency sub={t('divisionWeightedMean')} />
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>bolt</span>
            <h3 className="state-dashboard__data-title">{t('eventResponseMode')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, padding: '18px 22px 22px' }}>
            {RESOURCE_EVENT_SCENARIOS.map((ev) => (
              <div key={ev.id} className="state-dashboard__panel" style={{ margin: 0, boxShadow: '0 1px 2px rgba(20,40,30,0.06)' }}>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a1c1a', lineHeight: 1.35 }}>{ev.title}</h4>
                <p style={{ margin: '10px 0 0', fontSize: 12, color: '#414943', lineHeight: 1.5 }}>{ev.impact}</p>
                <p style={{ margin: '12px 0 0', fontSize: 11, fontWeight: 700, color: '#5c6560' }}>{ev.demandShift}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>swap_horiz</span>
            <h3 className="state-dashboard__data-title">{t('suggestedReallocation')}</h3>
          </div>
          <div style={{ padding: '20px 24px 24px' }}>
            <div className="state-dashboard__rec-card" style={{ borderLeftColor: '#1a365d', maxWidth: 720 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717972' }}>{t('workforceRebalance')}</p>
              <p style={{ margin: '14px 0 0', fontSize: 14, fontWeight: 700, color: '#1a1c1a' }}>
                {t('fromToTransfer', {
                  from: RESOURCE_REALLOCATION_SUGGESTION.fromDistrict,
                  to: RESOURCE_REALLOCATION_SUGGESTION.toDistrict,
                  n: RESOURCE_REALLOCATION_SUGGESTION.transferCount,
                  role: RESOURCE_REALLOCATION_SUGGESTION.transferRole,
                })}
              </p>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#414943', lineHeight: 1.55 }}>
                {RESOURCE_REALLOCATION_SUGGESTION.expectedRecovery}
              </p>
            </div>
          </div>
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>bar_chart</span>
            <h3 className="state-dashboard__data-title">{t('districtWorkloadStacked')}</h3>
          </div>
          <p className="state-dashboard__map-sub" style={{ padding: '0 22px', marginTop: 0 }}>
            {t('districtWorkloadStackedSub')}
          </p>
          <div style={{ height: 300, padding: '12px 18px 20px' }}>
            <Bar data={loadBarGrouped} options={chartOptsGrouped} />
          </div>
        </div>

        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>table_chart</span>
            <h3 className="state-dashboard__data-title">{t('liveDistrictLoadTable')}</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  {[
                    t('district'),
                    t('pendingSurveys'),
                    t('pendingClaims'),
                    t('pendingGrievances'),
                    t('soilHealthTestBacklog'),
                    t('agriInputCouponQueue'),
                    t('droughtReliefPending'),
                    t('fieldDemoFortnight'),
                    t('mandalReviewBacklog'),
                    t('activeFieldStaff'),
                    t('avgResolutionTime'),
                    t('stressStatus'),
                    t('staffUtilization'),
                    t('recommendedAction'),
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 10px',
                        fontSize: 9,
                        letterSpacing: '0.06em',
                        color: '#717972',
                        textAlign: h === t('district') || h === t('recommendedAction') || h === t('stressStatus') ? 'left' : 'right',
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
                {RESOURCE_LOAD_ROWS.map((r, i) => {
                  const chip = STATUS_CHIP[r.stress] || { color: '#717972', bg: '#f3f4f0' };
                  return (
                    <tr key={r.code} style={{ borderBottom: i !== RESOURCE_LOAD_ROWS.length - 1 ? '1px solid #ebece8' : 'none', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '14px 10px', fontSize: 14, fontWeight: 600, color: '#1a1c1a' }}>{r.district}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.pendingSurveys.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.pendingClaims.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.pendingGrievances?.toLocaleString('en-IN') ?? '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.soilHealthTestBacklog?.toLocaleString('en-IN') ?? '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.agriInputCouponQueue?.toLocaleString('en-IN') ?? '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.droughtReliefPending?.toLocaleString('en-IN') ?? '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.fieldDemoFortnight ?? '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.mandalReviewBacklog ?? '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.activeFieldStaff}</td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.avgResolutionHrs}h</td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, color: chip.color, background: chip.bg, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.stress}</span>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.utilizationPct}%</td>
                      <td style={{ padding: '14px 10px', fontSize: 11, color: '#1a1c1a', lineHeight: 1.45, maxWidth: 280 }}>{r.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#717972', margin: '8px 0 0', lineHeight: 1.45 }}>
          {t('resourceTableFootnote', { n: DISTRICT_MATRIX.length })}
        </p>
        <p style={{ fontSize: 10, color: '#9ca3af', margin: '6px 0 0', lineHeight: 1.45 }}>
          {t('openMeteoAttribution')}
        </p>
      </div>
    </div>
  );
};

export default DivisionDynamicResources;
