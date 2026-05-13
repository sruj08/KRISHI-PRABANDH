import React, { useMemo } from 'react';
import { useToast } from '../../hooks/useToast.jsx';
import {
  mockFraudTrendSummaryCards,
  mockFraudTrends,
  mockSuspiciousPatterns,
  mockEscalationQueue,
} from '../../mock/dao-analytics';

const PANEL = '#e2e3df';
const MUTED = '#717972';
const TEXT = '#1a1c1a';
const RED = '#ba1a1a';
const AMBER = '#b45309';

const FraudTrends = () => {
  const { addToast } = useToast();

  const colMax = useMemo(() => {
    const keys = ['high_risk', 'invoice', 'bhade_khat', 'bank'];
    const max = {};
    keys.forEach((k) => {
      max[k] = Math.max(...mockFraudTrends.map((r) => r[k]));
    });
    return max;
  }, []);

  const patternToast = () => addToast('Full investigation report coming soon.', 'success', 3400);
  const escalationToast = () => addToast('Escalation case details — coming soon.', 'success', 3400);

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>Fraud Trends</h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>
          Month-on-month pressure signals and escalation posture for the district command view.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {mockFraudTrendSummaryCards.map((c) => (
          <div key={c.title} style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase' }}>{c.title}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, marginTop: 10, lineHeight: 1.2 }}>{c.line1}</div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginTop: 8,
                color: c.trendBad ? RED : MUTED,
              }}
            >
              {c.line2}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${PANEL}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Monthly Trend</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Month</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>High risk</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Invoice fraud</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Bhade Khat</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Bank issues</th>
              </tr>
            </thead>
            <tbody>
              {mockFraudTrends.map((row) => (
                <tr key={row.month} style={{ borderBottom: `1px solid #f3f4f0` }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: TEXT }}>{row.month}</td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: row.high_risk === colMax.high_risk ? 800 : 600,
                      background: row.high_risk === colMax.high_risk ? 'rgba(186,26,26,0.08)' : 'transparent',
                    }}
                  >
                    {row.high_risk}
                  </td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: row.invoice === colMax.invoice ? 800 : 600,
                      background: row.invoice === colMax.invoice ? 'rgba(186,26,26,0.08)' : 'transparent',
                    }}
                  >
                    {row.invoice}
                  </td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: row.bhade_khat === colMax.bhade_khat ? 800 : 600,
                      background: row.bhade_khat === colMax.bhade_khat ? 'rgba(186,26,26,0.08)' : 'transparent',
                    }}
                  >
                    {row.bhade_khat}
                  </td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: row.bank === colMax.bank ? 800 : 600,
                      background: row.bank === colMax.bank ? 'rgba(186,26,26,0.08)' : 'transparent',
                    }}
                  >
                    {row.bank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 14px' }}>Suspicious Pattern Alerts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mockSuspiciousPatterns.map((p, i) => {
            const border = p.tone === 'red' ? RED : AMBER;
            return (
              <div
                key={i}
                style={{
                  border: `1px solid ${PANEL}`,
                  borderLeft: `4px solid ${border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  background: '#fafbf9',
                }}
              >
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
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Escalation Queue ({mockEscalationQueue.length} active)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Case</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Severity</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockEscalationQueue.map((e) => (
                <tr key={e.id} style={{ borderBottom: `1px solid #f3f4f0` }}>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: TEXT }}>{e.id}</td>
                  <td style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: e.severity === 'critical' ? RED : AMBER }}>
                    {e.severity === 'critical' ? '🔴 CRITICAL' : '🟡 HIGH'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: TEXT, maxWidth: 420 }}>{e.description}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={escalationToast}>
                      Review
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
