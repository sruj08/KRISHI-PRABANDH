import React, { useState, useCallback, useMemo } from 'react';
import { useToast } from '../../hooks/useToast.jsx';
import { useLanguage } from '../../context/LanguageContext';
import { fetchClaims, fetchWeather } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

const PANEL = '#e2e3df';
const MUTED = '#717972';
const TEXT = '#1a1c1a';
const RED = '#ba1a1a';
const AMBER = '#b45309';
const GREEN = '#396940';

const FraudTrends = () => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [c, w] = await Promise.all([
        fetchClaims().catch(() => []),
        fetchWeather().catch(() => null),
      ]);
      const arr = Array.isArray(c) ? c : c.results || c.claims || [];
      setClaims(arr);
      if (w) setWeather(w);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(loadData, 5000);

  const highRiskCount = claims.filter((c) => {
    const risk = c.confidenceScore != null ? (1 - c.confidenceScore) * 100 : 0;
    return risk > 50 || c.duplicateRisk > 0;
  }).length;

  const duplicateCount = claims.filter((c) => c.duplicateRisk > 0).length;
  const pendingReview = claims.filter((c) => {
    const stage = c.workflowStage || c.status || '';
    return stage.includes('Review') || stage.includes('Pending') || stage === 'Applied';
  }).length;

  const summaryCards = [
    {
      title: 'High Risk Claims',
      line1: highRiskCount.toString(),
      line2: `${((highRiskCount / (claims.length || 1)) * 100).toFixed(0)}% of total claims`,
      trendBad: highRiskCount > 0,
    },
    {
      title: 'Duplicate Alerts',
      line1: duplicateCount.toString(),
      line2: `${duplicateCount} claims flagged for duplicate detection`,
      trendBad: duplicateCount > 0,
    },
    {
      title: 'Pending Review',
      line1: pendingReview.toString(),
      line2: `${((pendingReview / (claims.length || 1)) * 100).toFixed(0)}% awaiting workflow action`,
      trendBad: pendingReview > claims.length * 0.3,
    },
  ];

  const monthlyTrendData = {};
  for (const c of claims) {
    const date = c.applicationDate || c.application_date || '2026-05';
    const month = date.slice(0, 7);
    if (!monthlyTrendData[month]) {
      monthlyTrendData[month] = { month, high_risk: 0, invoice: 0, bhade_khat: 0, bank: 0 };
    }
    const ft = c.fraudType || c.fraud_type || '';
    const risk = c.confidenceScore != null ? (1 - c.confidenceScore) * 100 : 0;
    if (risk > 50 || c.duplicateRisk > 0) monthlyTrendData[month].high_risk += 1;
    if (ft.toLowerCase().includes('invoice')) monthlyTrendData[month].invoice += 1;
    if (ft.toLowerCase().includes('bhade') || ft.toLowerCase().includes('khat')) monthlyTrendData[month].bhade_khat += 1;
    if (ft.toLowerCase().includes('bank')) monthlyTrendData[month].bank += 1;
  }
  const mockFraudTrends = Object.values(monthlyTrendData).sort((a, b) => a.month.localeCompare(b.month));
  if (mockFraudTrends.length === 0) {
    mockFraudTrends.push({ month: '2026-05', high_risk: 0, invoice: 0, bhade_khat: 0, bank: 0 });
  }

  const colMax = useMemo(() => {
    const keys = ['high_risk', 'invoice', 'bhade_khat', 'bank'];
    const max = {};
    keys.forEach((k) => {
      max[k] = Math.max(...mockFraudTrends.map((r) => r[k]));
    });
    return max;
  }, [mockFraudTrends]);

  const suspiciousPatterns = [];
  if (duplicateCount > 0) {
    suspiciousPatterns.push({
      severity: '⚠ CRITICAL',
      title: `${duplicateCount} Duplicate Claims Detected`,
      body: `System identified ${duplicateCount} claims with duplicate risk flags. Cross-reference survey numbers and farmer IDs.`,
      cta: 'Investigate Patterns',
      tone: 'red',
    });
  }
  if (highRiskCount > 5) {
    suspiciousPatterns.push({
      severity: '⚠ HIGH',
      title: `Elevated Risk Concentration (${highRiskCount} claims)`,
      body: `${highRiskCount} claims exceed 50% risk threshold. Review assigned officers and verification workflow.`,
      cta: 'Review High Risk Claims',
      tone: 'amber',
    });
  }
  if (weather) {
    const rainfallAnomaly = weather.rainfallAnomaly || weather.anomaly;
    if (rainfallAnomaly) {
      suspiciousPatterns.push({
        severity: '🌦 WEATHER ALERT',
        title: 'Rainfall Anomaly Detected',
        body: `Weather station data indicates rainfall anomaly: ${typeof rainfallAnomaly === 'string' ? rainfallAnomaly : 'Deviation from historical baseline'}. Cross-check crop insurance claims.`,
        cta: 'View Weather Data',
        tone: 'amber',
      });
    }
  }

  const escalationQueue = [];
  for (const c of claims) {
    if (c.duplicateRisk > 0 || (c.confidenceScore != null && c.confidenceScore < 0.3)) {
      escalationQueue.push({
        id: c.farmerId || c.farmer_id || c.id || 'Unknown',
        severity: (c.confidenceScore != null && c.confidenceScore < 0.3) ? 'critical' : 'high',
        description: `Duplicate risk: ${c.duplicateRisk || 'High'}. Assigned to ${c.assignedOfficer || 'unassigned'}.`,
      });
    }
  }

  const patternToast = () => addToast('Full investigation report coming soon.', 'success', 3400);
  const escalationToast = () => addToast('Escalation case details - coming soon.', 'success', 3400);

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {loading && (
        <div style={{ textAlign: 'center', padding: 12, color: MUTED, fontSize: 12 }}>
          {t('Loading live fraud data...')}
        </div>
      )}

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>{t('Fraud Trends')}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>
          {t('Month-on-month pressure signals and escalation posture for the district command view.')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {summaryCards.map((c) => (
          <div key={c.title} style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase' }}>{c.title}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, marginTop: 10, lineHeight: 1.2 }}>{c.line1}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8, color: c.trendBad ? RED : MUTED }}>
              {c.line2}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${PANEL}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{t('Monthly Trend')}</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('Month')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('High risk')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Invoice fraud')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Bhade Khat')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Bank issues')}</th>
              </tr>
            </thead>
            <tbody>
              {mockFraudTrends.map((row) => (
                <tr key={row.month} style={{ borderBottom: `1px solid #f3f4f0` }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: TEXT }}>{row.month}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: row.high_risk === colMax.high_risk ? 800 : 600, background: row.high_risk === colMax.high_risk ? 'rgba(186,26,26,0.08)' : 'transparent' }}>
                    {row.high_risk}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: row.invoice === colMax.invoice ? 800 : 600, background: row.invoice === colMax.invoice ? 'rgba(186,26,26,0.08)' : 'transparent' }}>
                    {row.invoice}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: row.bhade_khat === colMax.bhade_khat ? 800 : 600, background: row.bhade_khat === colMax.bhade_khat ? 'rgba(186,26,26,0.08)' : 'transparent' }}>
                    {row.bhade_khat}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: row.bank === colMax.bank ? 800 : 600, background: row.bank === colMax.bank ? 'rgba(186,26,26,0.08)' : 'transparent' }}>
                    {row.bank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 14px' }}>{t('Suspicious Pattern Alerts')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {suspiciousPatterns.length === 0 && (
            <div style={{ fontSize: 12, color: MUTED, padding: 12 }}>{t('No suspicious patterns detected.')}</div>
          )}
          {suspiciousPatterns.map((p, i) => {
            const border = p.tone === 'red' ? RED : AMBER;
            return (
              <div key={i} style={{ border: `1px solid ${PANEL}`, borderLeft: `4px solid ${border}`, borderRadius: 12, padding: '14px 16px', background: '#fafbf9' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: border, letterSpacing: '0.08em' }}>{p.severity}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginTop: 6 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>{p.body}</div>
                <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={patternToast}>
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${PANEL}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{t('Escalation Queue')} ({escalationQueue.length} {t('active')})</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('Case')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('Severity')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('Description')}</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {escalationQueue.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '12px 14px', fontSize: 12, color: MUTED, textAlign: 'center' }}>{t('No escalations at this time.')}</td></tr>
              )}
              {escalationQueue.slice(0, 10).map((e) => (
                <tr key={e.id} style={{ borderBottom: `1px solid #f3f4f0` }}>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: TEXT }}>{e.id}</td>
                  <td style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: e.severity === 'critical' ? RED : AMBER }}>
                    {e.severity === 'critical' ? <>&#x1F534; {t('CRITICAL')}</> : <>&#x1F7E1; {t('HIGH')}</>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: TEXT, maxWidth: 420 }}>{e.description}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={escalationToast}>
                      {t('Review')}
                    </button>
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

export default FraudTrends;