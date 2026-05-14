import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { DIVISION_MATRIX, STATE_PROFILE } from '../../utils/stateMockData';
import {
  bareDivisionCode,
  buildDeepAnalysisBundle,
  buildDivisionIntelSnapshot,
  DIVISION_MAP_METRICS,
  PIE_CHART_OPTIONS,
  resolveDivisionKey,
} from '../../utils/divisionIntelMock';
import { useDivisionLiveIntel } from '../../hooks/useDivisionLiveIntel';
import { buildDivisionAiPack } from '../../utils/divisionAiRecommendations';
import '../district/district.css';
import './divisional-analysis.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PANEL_BORDER = '#e2e3df';
const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';

const FOCUS_IDS = ['penetration', 'ndvi', 'grievance'];

const ANALYSIS_MODULES = [
  {
    id: 'penetration',
    title: 'Uptake & inclusion',
    hint: 'Schemes, gaps, district uptake',
    icon: 'deployed_code',
  },
  {
    id: 'ndvi',
    title: 'Crop stress & NDVI',
    hint: 'Rain proxy, stress blocks',
    icon: 'terrain',
  },
  {
    id: 'grievance',
    title: 'Grievance & cadence',
    hint: 'SLA, topics, desks',
    icon: 'support_agent',
  },
];

function matrixRowByParam(param) {
  if (!param) return DIVISION_MATRIX[0];
  const decoded = decodeURIComponent(param).trim();
  const bare = bareDivisionCode(decoded);
  return (
    DIVISION_MATRIX.find((r) => r.code === bare || r.code === decoded)
    || DIVISION_MATRIX.find((r) => r.division === decoded)
    || DIVISION_MATRIX[0]
  );
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { font: { size: 10 }, maxRotation: 35, minRotation: 0 } },
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { font: { size: 10 } },
      title: { display: true, text: '%', font: { size: 10 } },
    },
  },
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="da-section-card">
    <div className="da-section-card__head">
      <h2 className="da-card-title">{title}</h2>
      {subtitle && <p className="da-card-subtitle">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const DivisionalAnalysis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mainRef = useRef(null);
  const divisionParam = searchParams.get('division') || DIVISION_MATRIX[0].code;
  const rawFocus = searchParams.get('focus') || 'penetration';
  const focus = FOCUS_IDS.includes(rawFocus) ? rawFocus : 'penetration';

  const row = useMemo(() => matrixRowByParam(divisionParam), [divisionParam]);
  const key = resolveDivisionKey(row, { name: row.division, code: `DIV-${row.code}` });
  const geoM = DIVISION_MAP_METRICS[row.code] || {};
  const { liveByCode, climateMeta, error: liveIntelError } = useDivisionLiveIntel();
  const liveRow = liveByCode?.[row.code];

  const props = useMemo(
    () => ({
      name: row.division,
      code: `DIV-${row.code}`,
      schemePenetration: liveRow?.schemePenetration ?? geoM.schemePenetration ?? row.disbursedPct,
      ndviStress: liveRow?.ndviStress ?? geoM.ndviStress ?? 35,
      grievanceIdx: liveRow?.grievanceIdx ?? geoM.grievanceIdx ?? 25,
    }),
    [row, geoM, liveRow],
  );

  const snap = useMemo(
    () => buildDivisionIntelSnapshot({ key, props, row }),
    [key, props, row],
  );

  const deep = useMemo(
    () => buildDeepAnalysisBundle({ key, divisionCode: row.code, divisionName: row.division }),
    [key, row.code, row.division],
  );

  const aiMetrics = useMemo(
    () => ({
      schemePenetration: props.schemePenetration,
      ndviStress: props.ndviStress,
      grievanceIdx: props.grievanceIdx,
      precipMmMarJun2024: liveRow?.precipMmMarJun2024,
    }),
    [props.schemePenetration, props.ndviStress, props.grievanceIdx, liveRow?.precipMmMarJun2024],
  );

  const aiItems = useMemo(
    () => buildDivisionAiPack({ divisionName: row.division, liveRow: aiMetrics, snap, deep }),
    [row.division, aiMetrics, snap, deep],
  );

  const regRanking = useMemo(() => {
    const labels = snap.regPie.labels;
    const data = snap.regPie.data;
    const colors = snap.regPie.colors;
    const pairs = labels.map((label, i) => ({
      label,
      pct: data[i],
      color: colors[i],
    }));
    pairs.sort((a, b) => b.pct - a.pct);
    return pairs;
  }, [snap]);

  const regPieData = useMemo(
    () => ({
      labels: regRanking.map((p) => p.label),
      datasets: [{
        data: regRanking.map((p) => p.pct),
        backgroundColor: regRanking.map((p) => p.color),
        borderWidth: 0,
      }],
    }),
    [regRanking],
  );

  const stressPieData = useMemo(
    () => ({
      labels: snap.stressPie.labels,
      datasets: [{ data: snap.stressPie.data, backgroundColor: snap.stressPie.colors, borderWidth: 0 }],
    }),
    [snap],
  );

  const grievTopicPieData = useMemo(
    () => ({
      labels: deep.grievanceTopicPie.labels,
      datasets: [{
        data: deep.grievanceTopicPie.data,
        backgroundColor: deep.grievanceTopicPie.colors,
        borderWidth: 0,
      }],
    }),
    [deep],
  );

  const talukaBarData = useMemo(
    () => ({
      labels: deep.talukaPen.map((t) => t.label),
      datasets: [{
        label: 'Model uptake %',
        data: deep.talukaPen.map((t) => t.penetration),
        backgroundColor: '#1a365d',
        borderRadius: 4,
      }],
    }),
    [deep],
  );

  const ndviZoneBarData = useMemo(
    () => ({
      labels: deep.ndviZones.map((z) => z.zone),
      datasets: [{
        label: 'Stress %',
        data: deep.ndviZones.map((z) => z.stress),
        backgroundColor: '#b45309',
        borderRadius: 4,
      }],
    }),
    [deep],
  );

  useEffect(() => {
    mainRef.current?.scrollTo?.(0, 0);
  }, [focus, row.code]);

  const onDivisionChange = (e) => {
    const v = e.target.value;
    setSearchParams({ division: v, focus }, { replace: true });
  };

  const setFocus = (id) => {
    setSearchParams({ division: row.code, focus: id }, { replace: true });
  };

  return (
    <div className="da-page" style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 40px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p className="da-kicker">State intelligence · {STATE_PROFILE.state}</p>
          <h1 className="da-title">Divisional analysis</h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Division
            <select
              value={row.code}
              onChange={onDivisionChange}
              style={{
                display: 'block',
                marginTop: 6,
                minWidth: 220,
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${PANEL_BORDER}`,
                fontSize: 13,
                fontWeight: 600,
                color: TEXT_PRIMARY,
                background: '#fff',
              }}
            >
              {DIVISION_MATRIX.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.division}
                </option>
              ))}
            </select>
          </label>
          <Link
            to="/state/dashboard"
            style={{
              marginTop: 22,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${PANEL_BORDER}`,
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              textDecoration: 'none',
              background: '#fff',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Command map
          </Link>
          <a
            href={`${String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}DivisionalAnalysis.md`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 22,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${PANEL_BORDER}`,
              fontSize: 12,
              fontWeight: 700,
              color: '#1a365d',
              textDecoration: 'none',
              background: '#fff',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>description</span>
            Methodology & source data
          </a>
        </div>
      </div>

      {liveIntelError && (
        <p className="da-body" style={{ margin: 0, color: '#b45309' }}>
          Live data failed to load ({liveIntelError}).
        </p>
      )}

      <div className="da-live-strip" aria-label="Division metrics strip">
        <div className="da-live-metric">
          <div className="da-live-label">Moisture stress</div>
          <div className="da-live-value">{props.ndviStress}%</div>
          <div className="da-live-sub">Rain archive · point sample</div>
        </div>
        <div className="da-live-metric">
          <div className="da-live-label">Scheme desk %</div>
          <div className="da-live-value">{props.schemePenetration}%</div>
          <div className="da-live-sub">Desk index</div>
        </div>
        <div className="da-live-metric">
          <div className="da-live-label">Grievance index</div>
          <div className="da-live-value">{props.grievanceIdx}</div>
          <div className="da-live-sub">Composite</div>
        </div>
        <div className="da-live-metric">
          <div className="da-live-label">Mar–Jun rain (pt.)</div>
          <div className="da-live-value">
            {liveRow?.precipMmMarJun2024 != null ? `${liveRow.precipMmMarJun2024} mm` : '—'}
          </div>
          <div className="da-live-sub">
            {climateMeta?.window
              ? `${climateMeta.window.start} → ${climateMeta.window.end}`
              : 'Loading archive…'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <nav
          aria-label="Analysis modules"
          style={{
            width: 260,
            flexShrink: 0,
            background: '#fff',
            border: `1px solid ${PANEL_BORDER}`,
            borderRadius: 16,
            padding: '12px 10px',
            boxShadow: '0 1px 3px rgba(0,0,0,.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginRight: 20,
            marginBottom: 16,
          }}
        >
          <div className="da-kicker" style={{ padding: '4px 8px 10px' }}>
            Analysis modules
          </div>
          {ANALYSIS_MODULES.map((m) => {
            const active = focus === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setFocus(m.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px 12px',
                  borderRadius: 10,
                  border: active ? '1px solid #1a365d' : '1px solid transparent',
                  background: active ? 'rgba(26,54,93,0.06)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: active ? '#1a365d' : TEXT_MUTED, flexShrink: 0 }}>
                  {m.icon}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: active ? '#0f172a' : TEXT_PRIMARY, lineHeight: 1.25 }}>
                    {m.title}
                  </span>
                  <span style={{ display: 'block', fontSize: 10, color: TEXT_MUTED, marginTop: 4, lineHeight: 1.35 }}>
                    {m.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div ref={mainRef} style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {focus === 'penetration' && (
            <>
              <SectionCard
                title="Scheme uptake & inclusion"
                subtitle={`${row.division} revenue division · ${row.officer}`}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: '#f0f6ff', border: '1px solid #cfe0fc', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Eligible (merged rules)</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a8a', marginTop: 8 }}>{snap.eligible.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applications filed</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#14532d', marginTop: 8 }}>{snap.applied.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gap (eligible − applied)</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#78350f', marginTop: 8 }}>{snap.gap.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <h3 className="da-subhead">Uptake by planning block</h3>
                <div style={{ height: 220, marginBottom: 12 }}>
                  <Bar data={talukaBarData} options={barOptions} />
                </div>
                <div style={{ overflowX: 'auto', marginBottom: 22 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL_BORDER}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Block</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Districts covered</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Uptake %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deep.talukaPen.map((t) => (
                        <tr key={t.label} style={{ borderBottom: '1px solid #f3f4f0' }}>
                          <td style={{ padding: '10px 10px', fontWeight: 700, color: TEXT_PRIMARY }}>{t.label}</td>
                          <td style={{ padding: '10px 10px', color: TEXT_MUTED, lineHeight: 1.45 }}>{t.districts}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>{t.penetration}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="da-subhead">Scheme portfolio & backlog (₹ Cr)</h3>
                <div style={{ overflowX: 'auto', marginBottom: 22 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL_BORDER}` }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Scheme</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Share of push</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Backlog K</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deep.schemePortfolio.map((s) => (
                        <tr key={s.scheme} style={{ borderBottom: '1px solid #f3f4f0' }}>
                          <td style={{ padding: '12px 12px', fontWeight: 600 }}>{s.scheme}</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.sharePct}%</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right' }}>{s.backlogK}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="da-subhead">Why eligible farmers are not registering</h3>
                <div className="da-registration-layout">
                  <ol className="da-registration-list" aria-label="Registration barriers by estimated share">
                    {regRanking.map((row, i) => (
                        <li key={row.label} className="da-registration-item">
                          <span className="da-registration-rank" aria-hidden="true">{i + 1}</span>
                          <div className="da-registration-item-body">
                            <span className="da-registration-pct">{row.pct}%</span>
                            <span className="da-registration-label">{row.label}</span>
                          </div>
                        </li>
                      ))}
                  </ol>
                  <div className="da-registration-chart">
                    <Pie data={regPieData} options={PIE_CHART_OPTIONS} />
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {focus === 'ndvi' && (
            <SectionCard
              title="Crop stress, NDVI telemetry & geo zones"
              subtitle={`${row.division} — ${snap.plotsWatch.toLocaleString('en-IN')} plots on automated watch vs 30-day baseline.`}
            >
              <p style={{ fontSize: 11, color: TEXT_MUTED, margin: '0 0 14px', lineHeight: 1.55 }}>
                Moisture stress uses archive precipitation at a division sample point. Block table below lists districts and planning notes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
                <div style={{ border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, padding: '14px 16px', background: '#fafafa' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Moisture stress (desk)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{snap.ndviStress}%</div>
                  <div style={{ fontSize: 9, color: TEXT_MUTED, marginTop: 6, lineHeight: 1.35 }}>Rain-recharge proxy 0–100 (higher = drier vs other divisions)</div>
                </div>
                <div style={{ border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, padding: '14px 16px', background: '#fafafa' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Δ vs baseline</div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: '#b45309' }}>+{snap.baselineDelta}%</div>
                </div>
                <div style={{ border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, padding: '14px 16px', background: '#fafafa' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Sentinel-2 pass</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>{snap.sentinelH}h ago</div>
                </div>
              </div>

              <h3 className="da-subhead">Stress by monitoring block (districts + desk tip)</h3>
              <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL_BORDER}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', minWidth: 140 }}>Block</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', minWidth: 200 }}>Districts</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', minWidth: 220 }}>Desk tip</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Stress %</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Ha on watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deep.ndviZones.map((z) => (
                      <tr key={z.zone} style={{ borderBottom: '1px solid #f3f4f0' }}>
                        <td style={{ padding: '10px 10px', fontWeight: 700, color: TEXT_PRIMARY, verticalAlign: 'top' }}>{z.zone}</td>
                        <td style={{ padding: '10px 10px', color: TEXT_MUTED, lineHeight: 1.45, verticalAlign: 'top' }}>{z.districts}</td>
                        <td style={{ padding: '10px 10px', color: TEXT_PRIMARY, lineHeight: 1.45, verticalAlign: 'top' }}>{z.deskNote}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', verticalAlign: 'top', fontWeight: 700 }}>{z.stress}%</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', verticalAlign: 'top' }}>{z.hectares.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="da-muted-lead da-muted-lead--tight">
                Bars match the stress column in the table above.
              </p>
              <div style={{ height: 220, marginBottom: 18 }}>
                <Bar data={ndviZoneBarData} options={barOptions} />
              </div>
              <h3 className="da-subhead">Driver mix (agronomy / weather)</h3>
              <div style={{ height: 260, maxWidth: 420, margin: '0 auto' }}>
                <Pie data={stressPieData} options={PIE_CHART_OPTIONS} />
              </div>
            </SectionCard>
          )}

          {focus === 'grievance' && (
            <SectionCard
              title="Grievance mechanics & field cadence"
              subtitle={`${row.division} — workload index ${snap.grievanceIdx} (case pipeline, not registration drivers).`}
            >
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL_BORDER}` }}>
                      <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Desk</th>
                      <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Penetration rank</th>
                      <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Clearance</th>
                      <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Open queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.officers.map((o, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f0' }}>
                        <td style={{ padding: '14px 14px', fontSize: 13, fontWeight: 600 }}>{o.name}</td>
                        <td style={{ padding: '14px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{o.penetrationRank}</td>
                        <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 700, color: '#166534' }}>{o.clearancePct}%</td>
                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>{o.openGrievances}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 320px)', gap: 20, alignItems: 'start' }}>
                <div>
                  <h3 className="da-subhead">SLA aging (open grievances)</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL_BORDER}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Age band</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Count</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' }}>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deep.slaBands.map((b) => (
                        <tr key={b.band} style={{ borderBottom: '1px solid #f3f4f0' }}>
                          <td style={{ padding: '10px 10px', fontWeight: 600 }}>{b.band}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'right' }}>{b.count}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'right' }}>{b.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="da-subhead">Grievance topic mix</h3>
                  <p className="da-muted-lead da-muted-lead--tight">
                    Open-case categories (desk / portal), not the uptake “why not filing” breakdown.
                  </p>
                  <div style={{ height: 240 }}>
                    <Pie data={grievTopicPieData} options={PIE_CHART_OPTIONS} />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          <section className="da-ai-panel" aria-labelledby="da-ai-heading">
            <h2 id="da-ai-heading" className="da-section-title">Desk AI signals</h2>
            <p className="da-ai-intro">
              Short desk prompts from current metrics (rule-based, not an external model).
            </p>
            {aiItems.length === 0 ? (
              <p className="da-body" style={{ margin: 0 }}>No recommendation lines matched the current thresholds.</p>
            ) : (
              aiItems.map((item, idx) => (
                <article
                  key={`${item.tag}-${idx}`}
                  className={`da-ai-card${item.priority === 'high' ? ' da-ai-high' : ''}`}
                >
                  <span className="da-ai-tag">{item.tag}</span>
                  <h3 className="da-ai-card-title">{item.title}</h3>
                  <p className="da-ai-card-body">{item.body}</p>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DivisionalAnalysis;
