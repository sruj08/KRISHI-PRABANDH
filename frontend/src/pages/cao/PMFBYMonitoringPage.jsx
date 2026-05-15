import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PMFBY_CLAIMS, PMFBY_STATS, TALUKAS } from '../../mock/cao-mock';
import './cao-command.css';

/* ── Status chip ── */
function StatusChip({ status }) {
  const map = {
    approved: { cls: 'cao-chip--approved', label: 'Approved' },
    pending_verification: { cls: 'cao-chip--pending_verification', label: 'Pending Verification' },
    duplicate_flag: { cls: 'cao-chip--duplicate_flag', label: 'Duplicate Flag' },
    payment_failed: { cls: 'cao-chip--payment_failed', label: 'Payment Failed' },
    rejected: { cls: 'cao-chip--critical', label: 'Rejected' },
  };
  const { cls, label } = map[status] || { cls: 'cao-chip--low', label: status };
  return <span className={`cao-chip ${cls}`}>{label}</span>;
}

/* ── Claim detail modal ── */
function ClaimModal({ claim, onClose, onAction }) {
  const [remark, setRemark] = useState('');
  return (
    <div className="cao-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cao-modal">
        <div className="cao-modal-head">
          <div>
            <h3 className="cao-modal-title">{claim.farmerName}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
              <StatusChip status={claim.status} />
              {claim.aadhaarStatus === 'inactive' && (
                <span className="cao-chip cao-chip--critical">Aadhaar Inactive</span>
              )}
            </div>
          </div>
          <button className="cao-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="cao-modal-body">
          <div style={{ marginBottom: 14 }}>
            <div className="cao-detail-row"><span className="cao-detail-label">Claim ID</span><span className="cao-detail-value">{claim.id.toUpperCase()}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Farmer</span><span className="cao-detail-value">{claim.farmerName}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Survey No.</span><span className="cao-detail-value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{claim.surveyNo}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Village</span><span className="cao-detail-value">{claim.village}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Taluka</span><span className="cao-detail-value">{claim.taluka}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Crop</span><span className="cao-detail-value">{claim.crop}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Claim Amount</span><span className="cao-detail-value" style={{ fontWeight: 700 }}>₹{claim.claimAmountRs.toLocaleString('en-IN')}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Aadhaar</span><span className="cao-detail-value" style={{ color: claim.aadhaarStatus === 'inactive' ? '#c62828' : '#2e7d32', fontWeight: 700 }}>{claim.aadhaarStatus}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Payment</span><span className="cao-detail-value">{claim.paymentStatus}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Submitted</span><span className="cao-detail-value">{claim.submittedDate}</span></div>
          </div>

          {claim.flags.length > 0 && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c62828', marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>flag</span>
                Anomaly Flags
              </div>
              {claim.flags.map((f, i) => (
                <div key={i} style={{ fontSize: 11.5, color: '#c62828', marginBottom: 2 }}>• {f}</div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>
              Officer Remark
            </label>
            <textarea
              className="cao-textarea"
              placeholder="Add review remark..."
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {claim.status === 'pending_verification' && (
              <button className="cao-btn cao-btn--primary" onClick={() => onAction('approve', claim)}>
                <span className="material-symbols-outlined">check_circle</span>
                Approve Claim
              </button>
            )}
            {(claim.status === 'duplicate_flag' || claim.status === 'pending_verification') && (
              <button className="cao-btn cao-btn--danger" onClick={() => onAction('reject', claim)}>
                <span className="material-symbols-outlined">cancel</span>
                Reject
              </button>
            )}
            {claim.status === 'payment_failed' && (
              <button className="cao-btn cao-btn--primary" onClick={() => onAction('retry', claim)}>
                <span className="material-symbols-outlined">refresh</span>
                Retry Payment
              </button>
            )}
            <button className="cao-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function PMFBYMonitoringPage() {
  const { t } = useLanguage();
  const [filterTaluka, setFilterTaluka] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimsState, setClaimsState] = useState(PMFBY_CLAIMS);
  const [toast, setToast] = useState(null);

  const handleAction = (action, claim) => {
    setSelectedClaim(null);
    const messages = {
      approve: `Claim ${claim.id.toUpperCase()} approved for ₹${claim.claimAmountRs.toLocaleString('en-IN')}`,
      reject: `Claim ${claim.id.toUpperCase()} rejected and removed from queue`,
      retry: `Payment retry initiated for ${claim.farmerName}`,
    };
    // Update state
    setClaimsState(prev => prev.map(c => {
      if (c.id !== claim.id) return c;
      if (action === 'approve') return { ...c, status: 'approved', paymentStatus: 'processed' };
      if (action === 'reject') return { ...c, status: 'rejected' };
      if (action === 'retry') return { ...c, paymentStatus: 'pending' };
      return c;
    }));
    setToast(messages[action]);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = claimsState.filter(c => {
    if (filterTaluka !== 'all' && c.taluka !== filterTaluka) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const s = PMFBY_STATS;

  return (
    <div className="cao-page">
      {selectedClaim && (
        <ClaimModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} onAction={handleAction} />
      )}

      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">PMFBY Monitoring</h1>
          <p className="cao-page-sub">Pradhan Mantri Fasal Bima Yojana claim supervision · Kharif 2025–26</p>
        </div>
      </div>

      {toast && (
        <div style={{
          margin: '12px 24px 0', padding: '10px 16px', borderRadius: 8,
          background: '#e8f5ec', color: '#2e7d32', fontSize: 12.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #c8e6c9',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
          {toast}
        </div>
      )}

      <div className="cao-content">
        {/* ── Stats strip ── */}
        <div className="cao-panel" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {[
              { label: 'Registered', value: s.totalRegistered, color: '#37474f' },
              { label: 'Pending Verification', value: s.pendingVerification, color: '#b35c00' },
              { label: 'Approved', value: s.approved, color: '#2e7d32' },
              { label: 'Duplicate Flags', value: s.duplicateFlags, color: '#c62828' },
              { label: 'Payment Failed', value: s.paymentFailed, color: '#880e4f' },
              { label: 'Survey Completion', value: `${s.surveyCompletionPct}%`, color: '#1565c0' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                padding: '14px 18px', textAlign: 'center',
                borderRight: i < 5 ? '1px solid #eceee9' : 'none',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9aa19c', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="cao-filter-bar" style={{ borderRadius: '10px 10px 0 0', border: '1px solid #e0e3db' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9aa19c', textTransform: 'uppercase', letterSpacing: '.07em', marginRight: 4 }}>Filter:</span>
          <select className="cao-select" value={filterTaluka} onChange={e => setFilterTaluka(e.target.value)}>
            <option value="all">All Talukas</option>
            {TALUKAS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <select className="cao-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="duplicate_flag">Duplicate Flagged</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="approved">Approved</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9aa19c' }}>{filtered.length} claims</span>
        </div>

        {/* ── Claims table ── */}
        <div className="cao-panel" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
          <div className="cao-table-wrap">
            <table className="cao-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Farmer Name</th>
                  <th>Survey No.</th>
                  <th>Village / Taluka</th>
                  <th>Crop</th>
                  <th>Amount</th>
                  <th>Aadhaar</th>
                  <th>Status</th>
                  <th>Flags</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td className="muted" style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.id.toUpperCase()}</td>
                    <td className="name-cell">{c.farmerName}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{c.surveyNo}</td>
                    <td className="muted">{c.village} / {c.taluka}</td>
                    <td className="muted">{c.crop}</td>
                    <td style={{ fontWeight: 700 }}>₹{c.claimAmountRs.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
                        background: c.aadhaarStatus === 'inactive' ? '#fde8e8' : '#e8f5ec',
                        color: c.aadhaarStatus === 'inactive' ? '#c62828' : '#2e7d32',
                      }}>
                        {c.aadhaarStatus}
                      </span>
                    </td>
                    <td><StatusChip status={c.status} /></td>
                    <td>
                      {c.flags.length > 0 ? (
                        <div className="cao-flag-tag">
                          <span className="material-symbols-outlined">flag</span>
                          {c.flags.length}
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td className="muted cao-date-tag">{c.submittedDate}</td>
                    <td>
                      <button className="cao-btn cao-btn--sm" onClick={() => setSelectedClaim(c)}>
                        View
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
