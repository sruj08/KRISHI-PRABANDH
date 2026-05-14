import React, { useState } from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import { ELIGIBILITY_QUEUE } from '../../mock/officer-operations';

const OfficerEligibilityEnginePage = () => {
  const [sel, setSel] = useState(ELIGIBILITY_QUEUE[0]);

  return (
    <OfficerShell
      title="Eligibility engine"
      purpose="Rules engine view: which checks passed, which failed, and how much subsidy remains eligible before human sign-off."
      attention={`${ELIGIBILITY_QUEUE.filter((r) => r.eligibilityPct < 70).length} applications under manual review threshold.`}
      nextAction="Work failed bank and invoice rules before crop-window closes — auto-approval will not run on partial passes."
    >
      <div className="op-purpose-grid" style={{ marginBottom: 18 }}>
        <div className="op-purpose-card">
          <p className="op-purpose-card__k">Processed today</p>
          <p className="op-purpose-card__v" style={{ fontSize: '1.5rem', fontWeight: 700 }}>38</p>
        </div>
        <div className="op-purpose-card">
          <p className="op-purpose-card__k">Auto-approved</p>
          <p className="op-purpose-card__v" style={{ fontSize: '1.5rem', fontWeight: 700 }}>21</p>
        </div>
        <div className="op-purpose-card">
          <p className="op-purpose-card__k">Manual review</p>
          <p className="op-purpose-card__v" style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</p>
        </div>
        <div className="op-purpose-card">
          <p className="op-purpose-card__k">AI rejected</p>
          <p className="op-purpose-card__v" style={{ fontSize: '1.5rem', fontWeight: 700 }}>5</p>
        </div>
      </div>

      <div className="op-grid-2">
        <div className="op-table-wrap">
          <table className="op-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Farmer</th>
                <th>Eligible %</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {ELIGIBILITY_QUEUE.map((r) => (
                <tr key={r.id} onClick={() => setSel(r)}>
                  <td><strong>{r.id}</strong></td>
                  <td>{r.farmer}</td>
                  <td>{r.eligibilityPct}%</td>
                  <td>{r.riskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="op-card">
          <div className="op-section-head">
            <h2>Rule explanation</h2>
          </div>
          {sel && (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--op-muted)', marginTop: 0 }}>{sel.scheme}</p>
              <div style={{ marginBottom: 12 }}>
                <p className="op-purpose-card__k">Passed</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.875rem' }}>
                  {sel.passed.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
              {sel.failed.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p className="op-purpose-card__k">Failed</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.875rem', color: 'var(--op-red)' }}>
                    {sel.failed.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              )}
              <div className="op-card" style={{ background: '#f7f8f5', boxShadow: 'none' }}>
                <p className="op-purpose-card__k">AI recommendation</p>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{sel.aiNote}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </OfficerShell>
  );
};

export default OfficerEligibilityEnginePage;
