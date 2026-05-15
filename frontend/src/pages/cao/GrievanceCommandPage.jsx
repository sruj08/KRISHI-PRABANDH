import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GRIEVANCES, TALUKAS } from '../../mock/cao-mock';
import './cao-command.css';

const WORKFLOW_STEPS = ['received', 'assigned', 'investigating', 'resolved'];
const WORKFLOW_LABELS = {
  received: 'Received',
  assigned: 'Assigned',
  investigating: 'Investigating',
  resolved: 'Resolved',
};

const OFFICERS = [
  'Smt. Rekha Mane', 'Shri. Dilip Yadav', 'Shri. Suresh Patil',
  'Smt. Anita Shinde', 'Shri. Mohan Bhosale',
];

function StatusChip({ status }) {
  const cls = {
    received: 'cao-chip--high',
    assigned: 'cao-chip--investigating',
    investigating: 'cao-chip--investigating',
    resolved: 'cao-chip--approved',
  }[status] || 'cao-chip--low';
  return <span className={`cao-chip ${cls}`}>{WORKFLOW_LABELS[status] || status}</span>;
}

function PriorityChip({ priority }) {
  const cls = priority === 'high' ? 'cao-chip--critical' : priority === 'medium' ? 'cao-chip--high' : 'cao-chip--medium';
  return <span className={`cao-chip ${cls}`}>{priority}</span>;
}

function WorkflowProgress({ currentStatus }) {
  const currentIdx = WORKFLOW_STEPS.indexOf(currentStatus);
  return (
    <div className="cao-workflow">
      {WORKFLOW_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="cao-workflow-step">
            <span className={`cao-workflow-label ${i < currentIdx ? 'cao-workflow-label--done' : i === currentIdx ? 'cao-workflow-label--active' : 'cao-workflow-label--pending'}`}>
              {WORKFLOW_LABELS[step]}
            </span>
          </div>
          {i < WORKFLOW_STEPS.length - 1 && (
            <div className="cao-workflow-arrow" style={{ background: i < currentIdx ? '#c8e6c9' : '#eceee9' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Grievance modal ── */
function GrievanceModal({ grievance, onClose, onUpdate }) {
  const [status, setStatus] = useState(grievance.status);
  const [assignedTo, setAssignedTo] = useState(grievance.assignedTo);
  const [remark, setRemark] = useState(grievance.remark);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate({ ...grievance, status, assignedTo, remark });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  };

  return (
    <div className="cao-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cao-modal">
        <div className="cao-modal-head">
          <div>
            <h3 className="cao-modal-title">{grievance.ref}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
              <StatusChip status={grievance.status} />
              <PriorityChip priority={grievance.priority} />
              <span style={{ fontSize: 10.5, color: '#9aa19c' }}>{grievance.daysOpen}d open</span>
            </div>
          </div>
          <button className="cao-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="cao-modal-body">
          {/* Workflow progress */}
          <WorkflowProgress currentStatus={status} />

          <div style={{ marginBottom: 14, marginTop: 8 }}>
            <div className="cao-detail-row"><span className="cao-detail-label">Ref No.</span><span className="cao-detail-value" style={{ fontFamily: 'monospace' }}>{grievance.ref}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Farmer</span><span className="cao-detail-value">{grievance.farmerName}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Village</span><span className="cao-detail-value">{grievance.village}, {grievance.taluka}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Category</span><span className="cao-detail-value">{grievance.category}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Subject</span><span className="cao-detail-value">{grievance.subject}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Received</span><span className="cao-detail-value">{grievance.receivedDate}</span></div>
          </div>

          {/* Update status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>
                Update Status
              </label>
              <select className="cao-select" style={{ width: '100%', padding: '8px 10px' }}
                value={status} onChange={e => setStatus(e.target.value)}>
                {WORKFLOW_STEPS.map(s => <option key={s} value={s}>{WORKFLOW_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>
                Assign Officer
              </label>
              <select className="cao-select" style={{ width: '100%', padding: '8px 10px' }}
                value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {OFFICERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>
              Add / Update Remark
            </label>
            <textarea
              className="cao-textarea"
              placeholder="Enter action remark or resolution note..."
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>

          {saved && (
            <div style={{ background: '#e8f5ec', color: '#2e7d32', padding: '8px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span>
              Grievance updated successfully.
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cao-btn cao-btn--primary" onClick={handleSave}>
              <span className="material-symbols-outlined">save</span>
              Save Changes
            </button>
            <button className="cao-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function GrievanceCommandPage() {
  const { t } = useLanguage();
  const [grievances, setGrievances] = useState(GRIEVANCES);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTaluka, setFilterTaluka] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  const handleUpdate = (updated) => {
    setGrievances(prev => prev.map(g => g.id === updated.id ? updated : g));
    setSelectedGrievance(null);
  };

  const filtered = grievances.filter(g => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    if (filterTaluka !== 'all' && g.taluka !== filterTaluka) return false;
    if (filterCategory !== 'all' && g.category !== filterCategory) return false;
    return true;
  });

  const categories = [...new Set(GRIEVANCES.map(g => g.category))];
  const openCount = grievances.filter(g => g.status !== 'resolved').length;

  return (
    <div className="cao-page">
      {selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
          onUpdate={handleUpdate}
        />
      )}

      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">Grievance Command</h1>
          <p className="cao-page-sub">Farmer grievance tracking, assignment &amp; resolution workflow</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`cao-chip cao-chip--${openCount > 3 ? 'critical' : 'high'}`}>
            {openCount} Open
          </span>
        </div>
      </div>

      <div className="cao-content">
        {/* ── Status summary row ── */}
        <div className="cao-panel" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', overflow: 'hidden' }}>
            {WORKFLOW_STEPS.map((step, i) => {
              const count = grievances.filter(g => g.status === step).length;
              const colors = {
                received: { bg: '#fff8e1', color: '#b35c00' },
                assigned: { bg: '#e8f0fe', color: '#1a56db' },
                investigating: { bg: '#e3f2fd', color: '#1565c0' },
                resolved: { bg: '#e8f5ec', color: '#2e7d32' },
              };
              const { bg, color } = colors[step];
              return (
                <div key={step} style={{
                  flex: 1, padding: '14px 18px', cursor: 'pointer',
                  borderRight: i < 3 ? '1px solid #eceee9' : 'none',
                  background: filterStatus === step ? bg : 'transparent',
                  transition: 'background .12s',
                }}
                  onClick={() => setFilterStatus(filterStatus === step ? 'all' : step)}
                >
                  <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 2 }}>{count}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9aa19c' }}>{WORKFLOW_LABELS[step]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="cao-filter-bar" style={{ borderRadius: '10px 10px 0 0', border: '1px solid #e0e3db' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9aa19c', textTransform: 'uppercase', letterSpacing: '.07em', marginRight: 4 }}>Filter:</span>
          <select className="cao-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {WORKFLOW_STEPS.map(s => <option key={s} value={s}>{WORKFLOW_LABELS[s]}</option>)}
          </select>
          <select className="cao-select" value={filterTaluka} onChange={e => setFilterTaluka(e.target.value)}>
            <option value="all">All Talukas</option>
            {TALUKAS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <select className="cao-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9aa19c' }}>{filtered.length} grievances</span>
        </div>

        {/* ── Grievances table ── */}
        <div className="cao-panel" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
          <div className="cao-table-wrap">
            <table className="cao-table">
              <thead>
                <tr>
                  <th>Ref No.</th>
                  <th>Farmer</th>
                  <th>Village / Taluka</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Days Open</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="cao-empty">
                        <span className="material-symbols-outlined">gavel</span>
                        <div className="cao-empty-title">No grievances match the current filters</div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#717972' }}>{g.ref}</td>
                    <td className="name-cell">{g.farmerName}</td>
                    <td className="muted">{g.village} / {g.taluka}</td>
                    <td className="muted">{g.category}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{g.subject}</td>
                    <td style={{ color: g.assignedTo === 'Unassigned' ? '#c62828' : '#37474f', fontWeight: g.assignedTo === 'Unassigned' ? 700 : 400 }}>{g.assignedTo}</td>
                    <td><PriorityChip priority={g.priority} /></td>
                    <td><StatusChip status={g.status} /></td>
                    <td style={{ color: g.daysOpen > 14 ? '#c62828' : g.daysOpen > 7 ? '#b35c00' : '#2e7d32', fontWeight: 700 }}>
                      {g.daysOpen}d
                    </td>
                    <td>
                      <button className="cao-btn cao-btn--sm" onClick={() => setSelectedGrievance(g)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
