import React, { useMemo, useState, useCallback } from 'react';
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
  DISTRICT_MATRIX,
  DIVISION_PROFILE,
  DISTRICT_OPERATIONAL_HEALTH,
  DISTRICT_COMPARATIVE_RANKS,
  DISTRICT_BOTTLENECKS,
  DISTRICT_EXEC_INSIGHTS,
} from '../../utils/divisionMockData';
import { useLanguage } from '../../context/LanguageContext';
import {
  DivisionKpiCard,
  DivisionPanelSection,
  DivisionFrictionRow,
  STATUS_CHIP,
} from './divisionDashboardUi';
import './division-district-performance.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const hBarWithLegend = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 9 } } } },
  scales: {
    x: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
    y: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
};

function mergedDistrictRows() {
  return DISTRICT_MATRIX.map((d) => {
    const h = DISTRICT_OPERATIONAL_HEALTH.find((x) => x.code === d.code) || {};
    return { ...d, ...h };
  });
}

function compareParamDefs(t) {
  return [
    { id: 'pendingFiles', label: t('pendingFiles'), numeric: true },
    { id: 'avgApprovalDays', label: t('avgApprovalTime'), numeric: true, suffix: ` ${t('days')}` },
    { id: 'surveyCompletionPct', label: t('surveyCompletion'), numeric: true, suffix: '%' },
    { id: 'escalation30d', label: t('escalationVolume30d'), numeric: true },
    { id: 'schemeEfficiencyPct', label: t('schemeProcessingEfficiency'), numeric: true, suffix: '%' },
    { id: 'staffUtilizationPct', label: t('staffUtilization'), numeric: true, suffix: '%' },
    { id: 'beneficiaryThroughputPerDay', label: t('beneficiaryThroughput'), numeric: true, suffix: ` ${t('perDay')}` },
    { id: 'fundsCr', label: t('fundsCr'), numeric: true, prefix: '₹' },
    { id: 'pending', label: t('pending'), numeric: true },
    { id: 'fraudAlerts', label: t('fraudAlertsCount'), numeric: true },
    { id: 'talukas', label: t('talukas'), numeric: true },
    { id: 'disbursedPct', label: t('disbursed'), numeric: true, suffix: '%' },
    { id: 'status', label: t('status'), numeric: false },
  ];
}

function formatCompareCell(row, def) {
  if (!row) return '-';
  const v = row[def.id];
  if (v == null) return '-';
  if (def.id === 'status') return String(v);
  if (def.id === 'fundsCr') return `₹${v}`;
  if (def.suffix) return `${v}${def.suffix}`;
  if (typeof v === 'number') return v.toLocaleString('en-IN');
  return String(v);
}

function parseNumericCompare(row, def) {
  if (!row || !def.numeric) return null;
  const v = row[def.id];
  if (v == null || Number.isNaN(Number(v))) return null;
  return Number(v);
}

const DivisionDistrictPerformance = () => {
  const { t } = useLanguage();
  const rows = useMemo(() => mergedDistrictRows(), []);
  const paramDefs = useMemo(() => compareParamDefs(t), [t]);

  const [codeA, setCodeA] = useState(DISTRICT_MATRIX[0].code);
  const [codeB, setCodeB] = useState(DISTRICT_MATRIX[2].code);
  const [paramsOn, setParamsOn] = useState(() =>
    Object.fromEntries(paramDefs.map((p, i) => [p.id, i < 9])),
  );

  const toggleParam = useCallback((id) => {
    setParamsOn((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const rowA = useMemo(() => rows.find((r) => r.code === codeA) || null, [rows, codeA]);
  const rowB = useMemo(() => rows.find((r) => r.code === codeB) || null, [rows, codeB]);

  const totals = useMemo(() => {
    const pendingFiles = rows.reduce((a, r) => a + (r.pendingFiles || 0), 0);
    const avgApproval =
      rows.reduce((a, r) => a + (r.avgApprovalDays || 0), 0) / Math.max(rows.length, 1);
    const surveyAvg =
      rows.reduce((a, r) => a + (r.surveyCompletionPct || 0), 0) / Math.max(rows.length, 1);
    const esc = rows.reduce((a, r) => a + (r.escalation30d || 0), 0);
    const effAvg =
      rows.reduce((a, r) => a + (r.schemeEfficiencyPct || 0), 0) / Math.max(rows.length, 1);
    const utilAvg =
      rows.reduce((a, r) => a + (r.staffUtilizationPct || 0), 0) / Math.max(rows.length, 1);
    const throughput = rows.reduce((a, r) => a + (r.beneficiaryThroughputPerDay || 0), 0);
    return { pendingFiles, avgApproval, surveyAvg, esc, effAvg, utilAvg, throughput };
  }, [rows]);

  const efficiencyBar = useMemo(
    () => ({
      labels: DISTRICT_COMPARATIVE_RANKS.map((r) => r.district),
      datasets: [{
        label: t('efficiencyScore'),
        data: DISTRICT_COMPARATIVE_RANKS.map((r) => Math.max(12, 104 - r.efficiencyRank * 18)),
        backgroundColor: '#1a365d',
        borderRadius: 4,
      }],
    }),
    [t],
  );

  const backlogBar = useMemo(
    () => ({
      labels: DISTRICT_COMPARATIVE_RANKS.map((r) => r.district),
      datasets: [{
        label: t('surveyBacklogRank'),
        data: DISTRICT_COMPARATIVE_RANKS.map((r) => 6 - r.surveyBacklogRank),
        backgroundColor: '#b45309',
        borderRadius: 4,
      }],
    }),
    [t],
  );

  const fraudRiskBar = useMemo(
    () => ({
      labels: DISTRICT_COMPARATIVE_RANKS.map((r) => r.district),
      datasets: [{
        label: t('fraudRiskRank'),
        data: DISTRICT_COMPARATIVE_RANKS.map((r) => Math.max(8, 96 - r.fraudRiskRank * 16)),
        backgroundColor: '#7c2d12',
        borderRadius: 4,
      }],
    }),
    [t],
  );

  const selectStyle = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(20,40,30,0.12)',
    fontSize: 13,
    fontWeight: 600,
    color: '#1a1c1a',
    background: '#fff',
    minWidth: 160,
  };

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">
        <div style={{ marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#717972', margin: 0 }}>
            {t('districtOperationsIntel')}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1c1a', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
            {t('districtPerformanceTitle')}
          </h1>
          <p className="state-dashboard__map-sub" style={{ marginTop: 8, maxWidth: 720 }}>
            {DIVISION_PROFILE.division} revenue division · {DIVISION_PROFILE.name} · {DIVISION_PROFILE.officerTitle}
          </p>
        </div>

        <div className="state-dashboard-kpi-grid ddp-kpi-grid">
          <DivisionKpiCard
            icon="folder_open"
            label={t('pendingFilesDistrict')}
            value={String(totals.pendingFiles)}
            unit=""
            noCurrency
            sub={t('aggregateFiveDistricts')}
          />
          <DivisionKpiCard
            icon="schedule"
            label={t('avgApprovalTime')}
            value={totals.avgApproval.toFixed(1)}
            unit={t('days')}
            noCurrency
            sub={t('daoDeskMedian')}
          />
          <DivisionKpiCard
            icon="task_alt"
            label={t('surveyCompletion')}
            value={String(Math.round(totals.surveyAvg))}
            unit="%"
            noCurrency
            sub={t('kharifWindow')}
          />
          <DivisionKpiCard
            icon="crisis_alert"
            label={t('escalationVolume30d')}
            value={String(totals.esc)}
            unit=""
            noCurrency
            sub={t('aapleSarkarPlusDesk')}
          />
          <DivisionKpiCard
            icon="percent"
            label={t('schemeProcessingEfficiency')}
            value={String(Math.round(totals.effAvg))}
            unit="%"
            noCurrency
            sub={t('pfmsPlusField')}
          />
          <DivisionKpiCard
            icon="groups"
            label={t('staffUtilization')}
            value={String(Math.round(totals.utilAvg))}
            unit="%"
            noCurrency
            sub={t('fieldPlusCamp')}
          />
          <DivisionKpiCard
            icon="moving"
            label={t('beneficiaryThroughput')}
            value={String(totals.throughput)}
            unit={t('perDay')}
            noCurrency
            sub={t('divisionWideDesks')}
          />
        </div>

        <div className="ddp-insight-grid">
          <DivisionPanelSection title={t('executiveInsightPanel')} subtitle={t('divisionRollingSummary')} bodyClassName="ddp-panel-body">
            <ul className="ddp-insight-list">
              {DISTRICT_EXEC_INSIGHTS.map((line) => (
                <li key={line.slice(0, 28)}>
                  {line}
                </li>
              ))}
            </ul>
          </DivisionPanelSection>
          <DivisionPanelSection title={t('crossDistrictFriction')} subtitle={t('systemIntegrationErrors')} bodyClassName="ddp-panel-body">
            <div style={{ marginTop: 4 }}>
              <DivisionFrictionRow label={t('aadhaarMismatch')} pct={34} color="#ba1a1a" />
              <DivisionFrictionRow label={t('integrationFailure')} pct={22} color="#c2410c" />
            </div>
          </DivisionPanelSection>
          <DivisionPanelSection title={t('bottleneckSignals')} subtitle={t('sevenDayDelta')} bodyClassName="ddp-panel-body">
            <div className="ddp-bottleneck-stack">
              {DISTRICT_BOTTLENECKS.map((b) => (
                <div key={b.id} className="state-dashboard__rec-card" style={{ borderLeftColor: '#b45309' }}>
                  <p className="state-dashboard__rec-body" style={{ margin: 0 }}>{b.text}</p>
                </div>
              ))}
            </div>
          </DivisionPanelSection>
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>compare_arrows</span>
            <h3 className="state-dashboard__data-title">{t('comparativeDistrictAnalysis')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, padding: '18px 22px 22px' }}>
            <div style={{ height: 200 }}>
              <Bar data={efficiencyBar} options={hBarWithLegend} />
            </div>
            <div style={{ height: 200 }}>
              <Bar data={backlogBar} options={hBarWithLegend} />
            </div>
            <div style={{ height: 200 }}>
              <Bar data={fraudRiskBar} options={hBarWithLegend} />
            </div>
          </div>
        </div>

        <div className="state-dashboard__data-panel" style={{ marginBottom: 16 }}>
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>compare</span>
            <h3 className="state-dashboard__data-title">{t('compareTwoDistricts')}</h3>
          </div>
          <div style={{ padding: '16px 22px 8px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('districtA')}
              <select style={selectStyle} value={codeA} onChange={(e) => setCodeA(e.target.value)}>
                {DISTRICT_MATRIX.map((d) => (
                  <option key={d.code} value={d.code}>{d.district}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('districtB')}
              <select style={selectStyle} value={codeB} onChange={(e) => setCodeB(e.target.value)}>
                {DISTRICT_MATRIX.map((d) => (
                  <option key={d.code} value={d.code}>{d.district}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ padding: '8px 22px 12px', borderBottom: '1px solid #eceee9' }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#5c6560' }}>{t('compareParametersPick')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px' }}>
              {paramDefs.map((p) => (
                <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1a1c1a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(paramsOn[p.id])}
                    onChange={() => toggleParam(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto', padding: '0 22px 22px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  <th style={{ padding: '12px 14px', fontSize: 10, letterSpacing: '0.08em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('parameter')}</th>
                  <th style={{ padding: '12px 14px', fontSize: 10, letterSpacing: '0.08em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{rowA?.district ?? '-'}</th>
                  <th style={{ padding: '12px 14px', fontSize: 10, letterSpacing: '0.08em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{rowB?.district ?? '-'}</th>
                  <th style={{ padding: '12px 14px', fontSize: 10, letterSpacing: '0.08em', color: '#717972', textAlign: 'left', textTransform: 'uppercase', fontWeight: 700 }}>{t('delta')}</th>
                </tr>
              </thead>
              <tbody>
                {paramDefs.filter((p) => paramsOn[p.id]).map((p, i) => {
                  const a = formatCompareCell(rowA, p);
                  const b = formatCompareCell(rowB, p);
                  let delta = '-';
                  if (p.numeric) {
                    const na = parseNumericCompare(rowA, p);
                    const nb = parseNumericCompare(rowB, p);
                    if (na != null && nb != null) {
                      const d = nb - na;
                      delta = `${d > 0 ? '+' : ''}${d.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
                    }
                  } else if (rowA && rowB) {
                    delta = rowA[p.id] === rowB[p.id] ? t('match') : t('divergent');
                  }
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #ebece8', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1a1c1a' }}>{p.label}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#414943' }}>{a}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#414943' }}>{b}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#5c6560', fontVariantNumeric: 'tabular-nums' }}>{delta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>table_chart</span>
            <h3 className="state-dashboard__data-title">{t('districtOperationalHealthTable')}</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ddp-health-table">
              <thead>
                <tr>
                  <th className="ddp-th-left ddp-col-district">{t('district')}</th>
                  <th className="ddp-th-num">{t('pendingFiles')}</th>
                  <th className="ddp-th-num">{t('avgApprovalTime')}</th>
                  <th className="ddp-th-num">{t('surveyCompletion')}</th>
                  <th className="ddp-th-num">{t('escalationVolume30d')}</th>
                  <th className="ddp-th-num">{t('schemeProcessingEfficiency')}</th>
                  <th className="ddp-th-num">{t('staffUtilization')}</th>
                  <th className="ddp-th-num">{t('beneficiaryThroughput')}</th>
                  <th className="ddp-th-num">{t('fundsCr')}</th>
                  <th className="ddp-th-num">{t('pending')}</th>
                  <th className="ddp-th-left">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const chip = STATUS_CHIP[r.status] || { color: '#717972', bg: '#f3f4f0' };
                  return (
                    <tr key={r.code}>
                      <td className="ddp-td-left" style={{ fontWeight: 600, color: '#1a1c1a' }}>{r.district}</td>
                      <td className="ddp-td-num">{r.pendingFiles != null ? Number(r.pendingFiles).toLocaleString('en-IN') : '-'}</td>
                      <td className="ddp-td-num">{r.avgApprovalDays != null ? `${r.avgApprovalDays} ${t('days')}` : '-'}</td>
                      <td className="ddp-td-num">{r.surveyCompletionPct != null ? `${r.surveyCompletionPct}%` : '-'}</td>
                      <td className="ddp-td-num">{r.escalation30d ?? '-'}</td>
                      <td className="ddp-td-num">{r.schemeEfficiencyPct != null ? `${r.schemeEfficiencyPct}%` : '-'}</td>
                      <td className="ddp-td-num">{r.staffUtilizationPct != null ? `${r.staffUtilizationPct}%` : '-'}</td>
                      <td className="ddp-td-num">{r.beneficiaryThroughputPerDay != null ? `${r.beneficiaryThroughputPerDay} ${t('perDay')}` : '-'}</td>
                      <td className="ddp-td-num" style={{ fontWeight: 600 }}>₹{r.fundsCr}</td>
                      <td className="ddp-td-num">{r.pending?.toLocaleString('en-IN')}</td>
                      <td className="ddp-td-left">
                        <span
                          className="ddp-status-pill"
                          style={{ color: chip.color, background: chip.bg }}
                        >
                          {r.status}
                        </span>
                      </td>
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

export default DivisionDistrictPerformance;
