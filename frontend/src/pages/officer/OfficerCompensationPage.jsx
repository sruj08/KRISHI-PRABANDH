import React from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import { COMPENSATION_STAGES, HIGH_RISK_CLAIMS } from '../../mock/officer-operations';

const OfficerCompensationPage = () => (
  <OfficerShell
    title="Compensation pipeline"
    purpose="Track relief cases from submission through release. Stage counts are taluka-scoped and refresh with nightly reconciliation."
    attention="AI-flagged bucket is growing — clear before weekly DAO sign-off."
    nextAction="Move verified hailstorm cases to Approved so treasury batch can pick them up."
  >
    <div className="op-pipeline" style={{ marginBottom: 22 }}>
      {COMPENSATION_STAGES.map((s) => (
        <div key={s.stage} className="op-pipeline__stage">
          <span>{s.stage}</span>
          <strong>{s.count}</strong>
        </div>
      ))}
    </div>

    <div className="op-card">
      <h2 style={{ fontSize: '1rem', marginTop: 0 }}>High risk claims</h2>
      <div className="op-table-wrap" style={{ border: 'none' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Farmer / cluster</th>
              <th>Village</th>
            </tr>
          </thead>
          <tbody>
            {HIGH_RISK_CLAIMS.map((h) => (
              <tr key={h.id}>
                <td>{h.issue}</td>
                <td>{h.farmer}</td>
                <td>{h.village}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </OfficerShell>
);

export default OfficerCompensationPage;
