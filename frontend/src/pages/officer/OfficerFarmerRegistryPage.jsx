import React, { useMemo, useState } from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import ConfirmActionModal from '../../components/officer/ConfirmActionModal';
import { FARMER_REGISTRY } from '../../mock/officer-operations';

const FILTERS = ['All', 'Verified', 'Pending', 'High risk', 'Duplicate suspected', 'KYC failed'];

const riskClass = (r) => {
  if (r === 'high') return 'op-risk op-risk--high';
  if (r === 'medium') return 'op-risk op-risk--medium';
  return 'op-risk op-risk--low';
};

const OfficerFarmerRegistryPage = () => {
  const [q, setQ] = useState('');
  const [chip, setChip] = useState('All');
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  const rows = useMemo(() => {
    let list = FARMER_REGISTRY;
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(s) ||
          f.aadhaarLast4.includes(s) ||
          f.mobile.includes(s) ||
          f.surveyNo.toLowerCase().includes(s) ||
          f.village.toLowerCase().includes(s) ||
          f.appId.toLowerCase().includes(s),
      );
    }
    if (chip === 'Verified') list = list.filter((f) => f.verification === 'Verified');
    if (chip === 'Pending') list = list.filter((f) => f.verification.toLowerCase().includes('pending'));
    if (chip === 'High risk') list = list.filter((f) => f.risk === 'high');
    if (chip === 'Duplicate suspected') list = list.filter((f) => f.risk !== 'low');
    if (chip === 'KYC failed') list = list.filter((f) => f.verification.includes('hold') || f.verification.includes('review'));
    return list;
  }, [q, chip]);

  return (
    <OfficerShell
      title="Farmer registry"
      purpose="Operational farmer database for your taluka: search across identity, land, and application keys, then open a profile to verify or flag."
      attention={`${FARMER_REGISTRY.filter((f) => f.risk === 'high').length} farmers on elevated watch in the current extract.`}
      nextAction="Clear high-risk holds before releasing today’s DBT batch."
      actions={(
        <button type="button" className="op-btn op-btn--primary" onClick={() => setModal('stub')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Register walk-in
        </button>
      )}
    >
      <div style={{ marginBottom: 14 }}>
        <input
          className="op-card"
          placeholder="Search name, Aadhaar last four, mobile, survey no., village, application ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', fontSize: '0.9375rem', border: '1px solid var(--op-border)', borderRadius: 12 }}
        />
        <div className="op-hero__chips" style={{ marginTop: 10 }}>
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`op-chip ${chip === f ? 'op-chip--on' : ''}`} onClick={() => setChip(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              <th>Farmer</th>
              <th>Village</th>
              <th>Land (ha)</th>
              <th>Schemes</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Last activity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id} onClick={() => setSelected(f)}>
                <td><strong>{f.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--op-soft)' }}>{f.id}</div></td>
                <td>{f.village}</td>
                <td>{f.landHa}</td>
                <td>{f.schemes}</td>
                <td>{f.verification}</td>
                <td><span className={riskClass(f.risk)}>{f.risk}</span></td>
                <td>{f.lastActivity}</td>
                <td><span className="op-link">Open</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="op-drawer-overlay" role="presentation" onClick={() => setSelected(null)}>
          <aside className="op-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.name}</h3>
            <p style={{ margin: '0 0 12px', color: 'var(--op-muted)', fontSize: '0.875rem' }}>{selected.village} · {selected.id}</p>
            <div style={{ display: 'grid', gap: 10, fontSize: '0.875rem', marginBottom: 16 }}>
              <div><strong>Land:</strong> {selected.landHa} ha · survey {selected.surveyNo}</div>
              <div><strong>Schemes:</strong> {selected.schemes}</div>
              <div><strong>Application:</strong> {selected.appId}</div>
              <div><strong>Timeline:</strong> last touch {selected.lastActivity} — verification {selected.verification}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="op-btn op-btn--primary" onClick={() => setModal('approve')}>Approve verification</button>
              <button type="button" className="op-btn op-btn--danger" onClick={() => setModal('flag')}>Flag anomaly</button>
              <button type="button" className="op-btn op-btn--ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </aside>
        </div>
      )}

      <ConfirmActionModal
        open={modal === 'approve'}
        title="Approve verification?"
        body={`Mark ${selected?.name} as verified for active schemes in ${selected?.village}. This will be written to the audit log.`}
        confirmLabel="Approve"
        onClose={() => setModal(null)}
        onConfirm={() => {}}
      />
      <ConfirmActionModal
        open={modal === 'flag'}
        title="Flag anomaly?"
        body="Creates a DAO-visible anomaly with your default taluka routing. AI duplicate checks will re-run overnight."
        confirmLabel="Flag"
        variant="danger"
        onClose={() => setModal(null)}
        onConfirm={() => {}}
      />
      <ConfirmActionModal
        open={modal === 'stub'}
        title="Walk-in registration"
        body="Demo: opens farmer intake in a future build. For now this confirms the action rail is wired."
        confirmLabel="OK"
        onClose={() => setModal(null)}
        onConfirm={() => {}}
      />
    </OfficerShell>
  );
};

export default OfficerFarmerRegistryPage;
