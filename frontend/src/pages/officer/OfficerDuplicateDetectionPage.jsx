import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerShell from '../../components/officer/OfficerShell';
import { DUPLICATE_DETECTION } from '../../mock/officer-operations';

const OfficerDuplicateDetectionPage = () => {
  const navigate = useNavigate();
  return (
    <OfficerShell
      title="Duplicate detection"
      purpose="Taluka-level identity and document reuse: bank mapping, invoice hashes, chassis numbers, and mobile clusters across applications."
      attention={`${DUPLICATE_DETECTION.filter((d) => d.status === 'Open').length} open duplicate threads require officer assignment.`}
      nextAction="Escalate cross-district chassis matches to the division fraud desk with evidence bundle."
    >
      <p style={{ marginBottom: 14 }}>
        <button type="button" className="op-link" onClick={() => navigate('/division/fraud')}>Open division cross-district fraud workspace</button>
      </p>
      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              <th>Farmer / cluster</th>
              <th>Districts</th>
              <th>Match</th>
              <th>Similarity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {DUPLICATE_DETECTION.map((d, i) => (
              <tr key={i}>
                <td><strong>{d.farmer}</strong></td>
                <td>{d.districts}</td>
                <td>{d.match}</td>
                <td>{d.similarity}%</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OfficerShell>
  );
};

export default OfficerDuplicateDetectionPage;
