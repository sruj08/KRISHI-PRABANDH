import React, { useState } from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import ConfirmActionModal from '../../components/officer/ConfirmActionModal';
import { FIELD_VISITS } from '../../mock/officer-operations';

const OfficerFieldVerificationPage = () => {
  const [visit, setVisit] = useState(FIELD_VISITS[0]);
  const [modal, setModal] = useState(null);

  return (
    <OfficerShell
      title="Field verification"
      purpose="Plan visits, review geo evidence, and close the loop with approve / flag / re-survey actions tied to the visit record."
      attention={`${FIELD_VISITS.filter((v) => v.risk === 'HIGH').length} high-risk visits need photo and GPS reconciliation today.`}
      nextAction="Approve cleared visits before 15:00 so DAO batch includes your taluka."
    >
      <div className="op-card" style={{ marginBottom: 16 }}>
        <div className="op-section-head">
          <h2>Field visit planner</h2>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>
          Today: {FIELD_VISITS.length} stops · ~{FIELD_VISITS.reduce((a, v) => a + v.km, 0).toFixed(1)} km loop · cluster: Nimbut–Malegaon ridge
        </p>
      </div>

      <div className="op-grid-2">
        <div>
          <h2 style={{ fontSize: '1rem', margin: '0 0 10px' }}>Visit queue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FIELD_VISITS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`op-card op-card--hover ${visit.id === v.id ? '' : ''}`}
                style={{ textAlign: 'left', borderColor: visit.id === v.id ? 'rgba(31,77,54,0.45)' : undefined }}
                onClick={() => setVisit(v)}
              >
                <strong>{v.farmer}</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--op-muted)', marginTop: 4 }}>{v.village} · {v.scheme}</div>
                <div style={{ fontSize: '0.75rem', marginTop: 6 }}>{v.km} km · risk {v.risk}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="op-card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 10px' }}>Selected verification</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--op-muted)' }}>{visit.farmer} — {visit.id}</p>
          <div className="op-map-placeholder" style={{ margin: '12px 0' }}>Interactive map (demo)</div>
          <ul style={{ fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: 18 }}>
            <li>Uploaded field photos: {visit.photos}</li>
            <li>GPS check: {visit.gpsOk ? 'Inside parcel envelope' : 'Outside envelope — review'}</li>
            <li>Last verification: {visit.lastVisit}</li>
            <li>Officer remarks: {visit.remarks}</li>
            <li>AI image consistency: {visit.risk === 'HIGH' ? 'Mismatch vs reference plot' : 'No issues'}</li>
          </ul>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            <button type="button" className="op-btn op-btn--primary" onClick={() => setModal('ok')}>Approve</button>
            <button type="button" className="op-btn op-btn--danger" onClick={() => setModal('flag')}>Flag anomaly</button>
            <button type="button" className="op-btn op-btn--ghost" onClick={() => setModal('resurvey')}>Request re-survey</button>
          </div>
        </div>
      </div>

      <ConfirmActionModal open={modal === 'ok'} title="Approve field verification?" body="Marks visit complete and unlocks downstream payment stages." onClose={() => setModal(null)} onConfirm={() => {}} />
      <ConfirmActionModal open={modal === 'flag'} title="Flag anomaly?" body="Freezes subsidy until DAO clears the flag." variant="danger" confirmLabel="Flag" onClose={() => setModal(null)} onConfirm={() => {}} />
      <ConfirmActionModal open={modal === 'resurvey'} title="Request re-survey?" body="DAO scheduling will assign a new visit window." onClose={() => setModal(null)} onConfirm={() => {}} />
    </OfficerShell>
  );
};

export default OfficerFieldVerificationPage;
