import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerShell from '../../components/officer/OfficerShell';
import ConfirmActionModal from '../../components/officer/ConfirmActionModal';
import { APPLICATION_REVIEW } from '../../mock/officer-operations';

const OfficerApplicationReviewPage = () => {
  const navigate = useNavigate();
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);

  return (
    <OfficerShell
      title="Application review"
      purpose="Pending verification queue for your taluka: scheme context, dwell time, and AI summary in one row. Drill in to approve, flag, or request field evidence."
      attention={`${APPLICATION_REVIEW.filter((a) => a.priority === 'HIGH').length} applications breaching SLA for document verification.`}
      nextAction="Work high-priority tractor and PM-KISAN NPCI rejects first — they have hard DBT dependencies."
    >
      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Farmer</th>
              <th>Scheme</th>
              <th>Village</th>
              <th>Stage</th>
              <th>Days open</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {APPLICATION_REVIEW.map((a) => (
              <tr key={a.id} onClick={() => setSel(a)}>
                <td><strong>{a.id}</strong></td>
                <td>{a.farmer}</td>
                <td>{a.scheme}</td>
                <td>{a.village}</td>
                <td>{a.stage}</td>
                <td>{a.daysOpen}</td>
                <td>{a.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 14, fontSize: '0.8125rem', color: 'var(--op-muted)' }}>
        Need legacy PFMS view?{' '}
        <button type="button" className="op-link" onClick={() => navigate('/applications')}>Open full applications workspace</button>
      </p>

      {sel && (
        <div className="op-drawer-overlay" role="presentation" onClick={() => setSel(null)}>
          <aside className="op-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{sel.id}</h3>
            <p style={{ color: 'var(--op-muted)', fontSize: '0.875rem' }}>{sel.farmer} · {sel.scheme}</p>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{sel.summary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <button type="button" className="op-btn op-btn--primary" onClick={() => setModal('approve')}>Approve</button>
              <button type="button" className="op-btn op-btn--danger" onClick={() => setModal('flag')}>Flag</button>
              <button type="button" className="op-btn op-btn--ghost" onClick={() => navigate('/officer/field-verification')}>Request field visit</button>
            </div>
          </aside>
        </div>
      )}

      <ConfirmActionModal
        open={modal === 'approve'}
        title="Approve application?"
        body={`${sel?.id} will move to approved state for ${sel?.scheme}.`}
        onClose={() => setModal(null)}
        onConfirm={() => {}}
      />
      <ConfirmActionModal
        open={modal === 'flag'}
        title="Flag for DAO?"
        body="Application will be frozen for payment until anomaly is cleared."
        variant="danger"
        confirmLabel="Flag"
        onClose={() => setModal(null)}
        onConfirm={() => {}}
      />
    </OfficerShell>
  );
};

export default OfficerApplicationReviewPage;
