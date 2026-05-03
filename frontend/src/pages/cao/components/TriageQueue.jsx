import React, { useState } from 'react';

const STATUS_CONFIG = {
  green:  { label: '🟢 AI Verified',       bg: '#ebf7f1', border: '#40916c', text: '#1b4332', btn: '#2D6A4F', btnText: 'Bulk Approve' },
  yellow: { label: '🟡 Manual Review',     bg: '#fff8e1', border: '#FFB703', text: '#281900', btn: '#FF9933', btnText: 'Review File' },
  red:    { label: '🔴 Fraud Alert',       bg: '#ffdad6', border: '#ba1a1a', text: '#93000a', btn: '#ba1a1a', btnText: 'Reject & Flag' },
};

const FRAUD_ICONS = {
  land_mismatch:       { icon: 'straighten',      label: 'Land Size Violation' },
  duplicate_survey:    { icon: 'content_copy',     label: 'Ghost Subsidy' },
  multiple_violations: { icon: 'gpp_bad',          label: 'Multiple Violations' },
};

const CHECK = ({ ok, label }) => (
  <span className={`triage-check ${ok ? 'ok' : 'fail'}`}>
    <span className="material-symbols-outlined">{ok ? 'check_circle' : 'cancel'}</span>
    {label}
  </span>
);

const TriageQueue = ({ queue }) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [approved, setApproved] = useState(new Set());
  const [rejected, setRejected] = useState(new Set());

  const tabs = [
    { key: 'all',    label: 'All',    count: queue.length },
    { key: 'green',  label: '🟢 Ready',   count: queue.filter(q => q.status === 'green').length },
    { key: 'yellow', label: '🟡 Review',  count: queue.filter(q => q.status === 'yellow').length },
    { key: 'red',    label: '🔴 Fraud',   count: queue.filter(q => q.status === 'red').length },
  ];

  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter);

  const handleApprove = (id) => {
    setApproved(prev => new Set([...prev, id]));
    setExpanded(null);
  };

  const handleReject = (id) => {
    setRejected(prev => new Set([...prev, id]));
    setExpanded(null);
  };

  const handleBulkApprove = () => {
    const greenIds = queue.filter(q => q.status === 'green').map(q => q.id);
    setApproved(prev => new Set([...prev, ...greenIds]));
  };

  return (
    <div className="triage-wrap">
      {/* Tabs */}
      <div className="triage-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`triage-tab ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}>
            {t.label} <span className="triage-tab-count">{t.count}</span>
          </button>
        ))}
        {filter === 'green' && (
          <button className="cao-bulk-btn" onClick={handleBulkApprove}>
            <span className="material-symbols-outlined">done_all</span>
            1-Click Bulk Approve
          </button>
        )}
      </div>

      {/* List */}
      <div className="triage-list">
        {filtered.map((app) => {
          const cfg = STATUS_CONFIG[app.status];
          const isApproved = approved.has(app.id);
          const isRejected = rejected.has(app.id);
          const isExpanded = expanded === app.id;
          const fraud = app.fraud_type ? FRAUD_ICONS[app.fraud_type] : null;

          return (
            <div key={app.id}
              className={`triage-card ${isApproved ? 'done' : ''} ${isRejected ? 'rejected' : ''}`}
              style={{ borderLeft: `4px solid ${cfg.border}`, background: isApproved || isRejected ? '#f5f5f5' : cfg.bg }}>

              <div className="triage-card-header" onClick={() => setExpanded(isExpanded ? null : app.id)}>
                <div className="triage-left">
                  {isApproved && <span className="triage-done-badge">✓ Approved</span>}
                  {isRejected && <span className="triage-rej-badge">✗ Rejected</span>}
                  {!isApproved && !isRejected && <span className="triage-status-label" style={{ color: cfg.text }}>{cfg.label}</span>}
                  <div className="triage-farmer">{app.farmer}</div>
                  <div className="triage-meta">
                    {app.village} · {app.scheme} · {app.amount}
                    {fraud && (
                      <span className="fraud-badge">
                        <span className="material-symbols-outlined">{fraud.icon}</span>
                        {fraud.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="triage-right">
                  <div className="triage-checks">
                    <CHECK ok={app.aadhar_match} label="Aadhar" />
                    <CHECK ok={app.geo_match}    label="Geo" />
                    <CHECK ok={app.land_match}   label="Land" />
                  </div>
                  <span className="material-symbols-outlined triage-chevron">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>

              {isExpanded && !isApproved && !isRejected && (
                <div className="triage-detail">
                  <div className="triage-ai-note">{app.ai_note}</div>
                  <div className="triage-info-grid">
                    <div><span>App ID</span><strong>{app.id}</strong></div>
                    <div><span>Survey No.</span><strong>{app.survey_no}</strong></div>
                    <div><span>Land Owned</span><strong>{app.land_owned} Ha</strong></div>
                    <div><span>Land Required</span>
                      <strong style={{ color: !app.land_match ? '#ba1a1a' : '#2D6A4F' }}>
                        {app.land_required} Ha
                      </strong>
                    </div>
                    <div><span>Component</span><strong>{app.component}</strong></div>
                    <div><span>Applied</span><strong>{app.applied_date}</strong></div>
                  </div>
                  <div className="triage-actions">
                    {app.status !== 'red' && (
                      <button className="triage-btn approve" onClick={() => handleApprove(app.id)}>
                        <span className="material-symbols-outlined">check_circle</span>
                        {cfg.btnText}
                      </button>
                    )}
                    <button className="triage-btn reject" onClick={() => handleReject(app.id)}>
                      <span className="material-symbols-outlined">cancel</span>
                      {app.status === 'red' ? cfg.btnText : 'Reject'}
                    </button>
                    <button className="triage-btn whatsapp">
                      <span className="material-symbols-outlined">chat</span>
                      WhatsApp Farmer
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TriageQueue;
