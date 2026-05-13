import React, { useState } from 'react';
import { mockTalukaComparisonRows, mockTalukaDetailByName, mockOfficerPerformance } from '../../mock/dao-analytics';

const PANEL = '#e2e3df';
const MUTED = '#717972';
const TEXT = '#1a1c1a';

const TalukaComparison = () => {
  const [openTaluka, setOpenTaluka] = useState(null);

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>Taluka Comparison</h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>
          Compare throughput and risk posture across talukas. Expand a row for a structured breakdown.
        </p>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${PANEL}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Comparison</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Taluka</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Total apps</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Approval rate</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Fraud rate</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Pending</th>
              </tr>
            </thead>
            <tbody>
              {mockTalukaComparisonRows.map((row) => {
                const open = openTaluka === row.taluka;
                const detail = mockTalukaDetailByName[row.taluka];
                return (
                  <React.Fragment key={row.taluka}>
                    <tr
                      onClick={() => setOpenTaluka(open ? null : row.taluka)}
                      style={{
                        borderBottom: `1px solid #f3f4f0`,
                        cursor: 'pointer',
                        background: open ? '#f7faf7' : '#fff',
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: TEXT }}>{row.taluka}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.total}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.approval_rate}%</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {row.fraud_rate}% {row.fraud_emoji}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.pending}</td>
                    </tr>
                    {open && detail && (
                      <tr style={{ background: '#fafbf9' }}>
                        <td colSpan={5} style={{ padding: '14px 18px 18px', fontSize: 12, color: TEXT, lineHeight: 1.55, borderBottom: `1px solid ${PANEL}` }}>
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>
                            {row.taluka} — Detailed breakdown
                          </div>
                          <div>
                            <strong>Top fraud types:</strong> {detail.top_fraud_types}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <strong>Most flagged scheme:</strong> {detail.flagged_scheme}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <strong>TAO review speed:</strong> {detail.tao_review_days} days avg
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <strong>Officer:</strong> {detail.officer} ({detail.officer_pending} pending)
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${PANEL}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Officer Performance Metrics</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: `1px solid ${PANEL}` }}>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>TAO name</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Taluka</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Pending</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Avg review</th>
                <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {mockOfficerPerformance.map((o) => (
                <tr key={o.name} style={{ borderBottom: `1px solid #f3f4f0` }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: TEXT }}>{o.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: MUTED }}>{o.taluka}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{o.pending}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right' }}>{o.avg_review_days} days</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: o.efficiency_tone === 'green' ? '#396940' : '#b45309' }}>
                    {o.efficiency_tone === 'green' ? '🟢' : '🟡'} {o.efficiency}
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

export default TalukaComparison;
