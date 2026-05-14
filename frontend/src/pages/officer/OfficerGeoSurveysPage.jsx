import React from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import { GEO_SURVEYS } from '../../mock/officer-operations';

const OfficerGeoSurveysPage = () => (
  <OfficerShell
    title="Geo-tagged surveys"
    purpose="Review loss surveys where GPS, imagery, or AI integrity checks failed. Cleared surveys unblock compensation stages."
    attention={`${GEO_SURVEYS.filter((g) => g.status !== 'Cleared').length} surveys pending taluka decision.`}
    nextAction="Resolve GPS drift cases before DAO audit sampling this week."
  >
    <div className="op-map-placeholder" style={{ marginBottom: 18 }}>Survey map layer (demo)</div>
    <div className="op-table-wrap">
      <table className="op-table">
        <thead>
          <tr>
            <th>Survey ID</th>
            <th>Village</th>
            <th>Crop</th>
            <th>Loss %</th>
            <th>Anomaly</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {GEO_SURVEYS.map((g) => (
            <tr key={g.id}>
              <td><strong>{g.id}</strong></td>
              <td>{g.village}</td>
              <td>{g.crop}</td>
              <td>{g.lossPct}%</td>
              <td>{g.anomaly}</td>
              <td>{g.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </OfficerShell>
);

export default OfficerGeoSurveysPage;
