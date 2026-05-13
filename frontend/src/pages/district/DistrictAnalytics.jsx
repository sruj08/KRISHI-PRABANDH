import React from 'react';
import {
  mockRiskDistribution,
  mockFraudTypeBars,
  mockInsightsFeed,
  mockSchemeLeakage,
} from '../../mock/dao-analytics';

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
  const rd = mockRiskDistribution;
  const safeTurn = rd.safe_pct / 100;
  const reviewTurn = rd.review_pct / 100;
  const highTurn = rd.high_pct / 100;

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>District Analytics</h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>
          Consolidated risk and leakage signals for district oversight. Figures are illustrative.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>Risk Distribution — All Applications</h3>
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
                Total<br />
                {rd.total_applications}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
                <span style={{ color: MUTED, flex: 1 }}>Safe (0–20)</span>
                <span style={{ fontWeight: 800, color: TEXT }}>{rd.safe_pct}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: AMBER, flexShrink: 0 }} />
                <span style={{ color: MUTED, flex: 1 }}>Needs Review (21–50)</span>
                <span style={{ fontWeight: 800, color: TEXT }}>{rd.review_pct}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: RED, flexShrink: 0 }} />
                <span style={{ color: MUTED, flex: 1 }}>High Risk (51–100)</span>
                <span style={{ fontWeight: 800, color: TEXT }}>{rd.high_pct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>Fraud Type Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mockFraudTypeBars.map((row) => (
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
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 14px' }}>Insights Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mockInsightsFeed.map((it, i) => (
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
            <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Scheme-Level Leakage</h3>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: MUTED, margin: '6px 0 0', textTransform: 'uppercase' }}>Applications · fraud rate · average risk</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scheme</th>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Applications</th>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Fraud rate</th>
                  <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Avg risk</th>
                </tr>
              </thead>
              <tbody>
                {mockSchemeLeakage.map((row) => (
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
