import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { fetchClaims, fetchClaimsSummary } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

const PANEL = '#e2e3df';
const MUTED = '#717972';
const TEXT = '#1a1c1a';
const GREEN = '#396940';
const AMBER = '#b45309';
const RED = '#ba1a1a';

const severityDot = (s) => {
  if (s === 'critical') return RED;
  if (s === 'medium') return AMBER;
  return GREEN;
};

const DistrictAnalytics = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        fetchClaimsSummary().catch(() => null),
        fetchClaims().catch(() => []),
      ]);
      if (s) setSummary(s);
      const arr = Array.isArray(c) ? c : c.results || c.claims || [];
      setClaims(arr);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(loadData, 5000);

  const totalApps = summary?.totalClaims ?? summary?.total_applications ?? (claims.length || 753);
  const safePct = summary?.safePct ?? summary?.safe_pct ?? 68;
  const reviewPct = summary?.reviewPct ?? summary?.review_pct ?? 21;
  const highPct = summary?.highPct ?? summary?.high_pct ?? 11;

  const safeTurn = safePct / 100;
  const reviewTurn = reviewPct / 100;
  const highTurn = highPct / 100;

  const fraudTypeLabels = {};
  const fraudTypeCounts = {};
  for (const c of claims) {
    const ft = c.fraudType || c.fraud_type || 'Unknown';
    fraudTypeCounts[ft] = (fraudTypeCounts[ft] || 0) + 1;
    fraudTypeLabels[ft] = ft;
  }
  const fraudTypeBars = Object.entries(fraudTypeCounts)
    .map(([label, count]) => ({
      label,
      pct: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  const insightsFeed = [];
  if (highPct > 15) {
    insightsFeed.push({ severity: 'critical', time: 'LIVE', text: `High risk claims at ${highPct}% - immediate review recommended.` });
  }
  if (reviewPct > 25) {
    insightsFeed.push({ severity: 'medium', time: 'LIVE', text: `${reviewPct}% of claims flagged for review - escalate to district officers.` });
  }
  if (fraudTypeBars.length > 0) {
    const topFraud = fraudTypeBars[0];
    insightsFeed.push({ severity: 'medium', time: 'LIVE', text: `Top fraud type: "${topFraud.label}" at ${topFraud.pct}% of total claims.` });
  }
  insightsFeed.push({ severity: 'low', time: 'LIVE', text: `Total ${totalApps} claims processed - ${safePct}% safe, ${reviewPct}% needs review.` });

  const schemeLeakageMap = {};
  for (const c of claims) {
    const scheme = c.scheme || c.scheme_name || 'General';
    if (!schemeLeakageMap[scheme]) {
      schemeLeakageMap[scheme] = { scheme, applications: 0, fraudRate: 0, totalRisk: 0, flagged: 0 };
    }
    schemeLeakageMap[scheme].applications += 1;
    const risk = c.confidenceScore != null ? (1 - c.confidenceScore) * 100 : c.duplicateRisk || 0;
    schemeLeakageMap[scheme].totalRisk += risk;
    if (c.duplicateRisk || (c.confidenceScore != null && c.confidenceScore < 0.5)) {
      schemeLeakageMap[scheme].flagged += 1;
    }
  }
  let schemeLeakage = Object.values(schemeLeakageMap).map((s) => ({
    ...s,
    fraud_rate: s.applications > 0 ? Math.round((s.flagged / s.applications) * 100) : 0,
    avg_risk: s.applications > 0 ? Math.round(s.totalRisk / s.applications) : 0,
    highlight: s.flagged > 0 && s.applications > 0 && (s.flagged / s.applications) > 0.3,
  })).sort((a, b) => b.fraud_rate - a.fraud_rate);

  if (schemeLeakage.length === 0) {
    schemeLeakage = [
      { scheme: 'PMFBY', applications: 320, fraud_rate: 14, avg_risk: 42, highlight: true },
      { scheme: 'PM-KISAN', applications: 280, fraud_rate: 8, avg_risk: 28, highlight: false },
      { scheme: 'Micro Irrigation', applications: 95, fraud_rate: 5, avg_risk: 18, highlight: false },
      { scheme: 'Mechanization', applications: 58, fraud_rate: 3, avg_risk: 12, highlight: false },
    ];
  }

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {loading && (
        <div style={{ textAlign: 'center', padding: 12, color: MUTED, fontSize: 12 }}>
          {t('Loading live analytics...')}
        </div>
      )}

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>{t('District Analytics')}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>
          {t('Consolidated risk and leakage signals for district oversight.')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>{t('Risk Distribution - All Applications')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `conic-gradient(${GREEN} 0turn ${safeTurn}turn, ${AMBER} ${safeTurn}turn ${safeTurn + reviewTurn}turn, ${RED} ${safeTurn + reviewTurn}turn 1turn)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 36,
                  background: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: TEXT,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  border: `1px solid ${PANEL}`,
                }}
              >
                {t('Total')}<br />
                {totalApps}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
                <span style={{ color: MUTED, flex: 1 }}>{t('Safe (0–20)')}</span>
                <span style={{ fontWeight: 800, color: TEXT }}>{safePct}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: AMBER, flexShrink: 0 }} />
                <span style={{ color: MUTED, flex: 1 }}>{t('Needs Review (21–50)')}</span>
                <span style={{ fontWeight: 800, color: TEXT }}>{reviewPct}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: RED, flexShrink: 0 }} />
                <span style={{ color: MUTED, flex: 1 }}>{t('High Risk (51–100)')}</span>
                <span style={{ fontWeight: 800, color: TEXT }}>{highPct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>{t('Fraud Type Distribution')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(fraudTypeBars.length > 0 ? fraudTypeBars : [
              { label: 'High Risk', pct: highPct },
              { label: 'Needs Review', pct: reviewPct },
              { label: 'Safe', pct: safePct },
            ]).map((row) => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 4 }}>
                  <span>{row.label}</span>
                  <span style={{ color: TEXT }}>{row.pct}%</span>
                </div>
                <div style={{ height: 8, background: '#f0f0ec', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${row.pct}%`, height: '100%', background: GREEN, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 14px' }}>{t('Insights Feed')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {insightsFeed.length === 0 && (
              <div style={{ fontSize: 12, color: MUTED }}>{t('No insights available.')}</div>
            )}
            {insightsFeed.map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: severityDot(it.severity), marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{it.time}</div>
                  <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, marginTop: 4 }}>{it.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '0', boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '22px 24px', borderBottom: `1px solid ${PANEL}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{t('Scheme-Level Leakage')}</h3>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: MUTED, margin: '6px 0 0', textTransform: 'uppercase' }}>{t('Applications · fraud rate · average risk')}</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('Scheme')}</th>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Applications')}</th>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Fraud rate')}</th>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Avg risk')}</th>
                </tr>
              </thead>
              <tbody>
                {schemeLeakage.map((row) => (
                  <tr
                    key={row.scheme}
                    style={{
                      borderBottom: `1px solid #f3f4f0`,
                      background: row.highlight ? 'rgba(186,26,26,0.08)' : '#fff',
                    }}
                  >
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: TEXT }}>
                      {row.scheme}
                      {row.highlight && <span style={{ marginLeft: 8 }}>🔴</span>}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.applications}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.fraud_rate}%</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.avg_risk}</td>
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

export default DistrictAnalytics;