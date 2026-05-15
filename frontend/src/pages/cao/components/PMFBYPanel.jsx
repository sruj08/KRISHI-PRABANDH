import React, { useState } from 'react';

const NDVIBar = ({ before, after }) => {
  const pct = after * 100;
  const drop = ((before - after) / before * 100).toFixed(1);
  return (
    <div className="ndvi-bar-wrap">
      <div className="ndvi-row">
        <span className="ndvi-label">Before</span>
        <div className="ndvi-track">
          <div className="ndvi-fill ndvi-before" style={{ width: `${before * 100}%` }} />
        </div>
        <span className="ndvi-val">{before.toFixed(2)}</span>
      </div>
      <div className="ndvi-row">
        <span className="ndvi-label">After</span>
        <div className="ndvi-track">
          <div className="ndvi-fill ndvi-after" style={{ width: `${pct}%` }} />
        </div>
        <span className="ndvi-val">{after.toFixed(2)}</span>
      </div>
      <div className="ndvi-drop">
        <span className="material-symbols-outlined">arrow_downward</span>
        {drop}% vegetation loss
      </div>
    </div>
  );
};

const PMFBYPanel = ({ events, onClose }) => {
  const [selected, setSelected] = useState(events[0]?.id || null);
  const [approving, setApproving] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState(new Set());

  const event = events.find(e => e.id === selected);

  const handleAutoApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApprovedEvents(prev => new Set([...prev, event.id]));
      setApproving(false);
    }, 2000);
  };

  return (
    <div className="pmfby-overlay" onClick={onClose}>
      <div className="pmfby-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pmfby-header">
          <div className="pmfby-header-left">
            <span className="material-symbols-outlined pmfby-sat-icon">satellite_alt</span>
            <div>
              <div className="pmfby-title">PMFBY Satellite Disaster Triage</div>
              <div className="pmfby-sub">Pradhan Mantri Fasal Bima Yojana - Haveli Mandal</div>
            </div>
          </div>
          <button className="pmfby-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Event tabs */}
        <div className="pmfby-event-tabs">
          {events.map(e => (
            <button key={e.id}
              className={`pmfby-event-tab ${selected === e.id ? 'active' : ''} ${approvedEvents.has(e.id) ? 'approved' : ''}`}
              onClick={() => setSelected(e.id)}>
              <span className="material-symbols-outlined">
                {e.event.includes('Hail') ? 'thunderstorm' : 'drought'}
              </span>
              <div>
                <div className="pmfby-tab-name">{e.event}</div>
                <div className="pmfby-tab-date">{e.date}</div>
              </div>
              {approvedEvents.has(e.id) && <span className="pmfby-approved-chip">✓ Approved</span>}
            </button>
          ))}
        </div>

        {event && (
          <div className="pmfby-body">
            {/* Satellite verification banner */}
            <div className={`pmfby-sat-banner ${event.auto_approvable ? 'green' : 'amber'}`}>
              <span className="material-symbols-outlined">
                {event.auto_approvable ? 'verified' : 'pending'}
              </span>
              <div>
                <strong>
                  {event.auto_approvable
                    ? `Satellite confirms ${event.vegetation_drop}% vegetation drop - Auto-Approval Eligible`
                    : `Vegetation drop ${event.vegetation_drop}% - Below 70% threshold. Manual review required.`}
                </strong>
                <div>Crop: {event.crop} · Satellite: ISRO Bhuvan NDVI · Source: Mock Data</div>
              </div>
            </div>

            <div className="pmfby-content-grid">
              {/* Left: NDVI + Claims */}
              <div>
                <div className="pmfby-section-title">
                  <span className="material-symbols-outlined">satellite</span>
                  NDVI Satellite Data
                </div>
                <NDVIBar before={event.ndvi_before} after={event.ndvi_after} />

                <div className="pmfby-section-title" style={{ marginTop: 16 }}>
                  <span className="material-symbols-outlined">location_on</span>
                  Village-wise Claims ({event.total_claims} total)
                </div>
                <div className="pmfby-village-list">
                  {event.claims_breakdown.map((row, i) => (
                    <div key={i} className="pmfby-village-row">
                      <div className="pmfby-village-name">{row.village}</div>
                      <div className="pmfby-village-bar-wrap">
                        <div className="pmfby-village-bar" style={{ width: `${row.ndvi_drop}%`, background: row.ndvi_drop >= 70 ? '#ba1a1a' : '#FF9933' }} />
                      </div>
                      <div className="pmfby-village-stats">
                        <span style={{ color: row.ndvi_drop >= 70 ? '#ba1a1a' : '#e07800' }}>{row.ndvi_drop}% loss</span>
                        <span className="pmfby-claims-count">{row.claims} claims</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Action panel */}
              <div>
                <div className="pmfby-action-panel">
                  <div className="pmfby-action-title">Disbursement Details</div>
                  <div className="pmfby-action-rows">
                    <div><span>Total Claims</span><strong>{event.total_claims}</strong></div>
                    <div><span>Estimated Amount</span><strong>{event.estimated_disbursement}</strong></div>
                    <div><span>Affected Villages</span><strong>{event.affected_villages.length}</strong></div>
                    <div><span>Crop Season</span><strong>{event.crop}</strong></div>
                    <div><span>Disaster Date</span><strong>{event.date}</strong></div>
                    <div><span>Satellite Status</span>
                      <strong style={{ color: '#2D6A4F' }}>✓ Verified (Mock ISRO)</strong>
                    </div>
                  </div>

                  {approvedEvents.has(event.id) ? (
                    <div className="pmfby-done-state">
                      <span className="material-symbols-outlined">verified</span>
                      All {event.total_claims} Panchnamas Approved!
                      <div>Disbursement initiated to {event.affected_villages.length} villages.</div>
                    </div>
                  ) : event.auto_approvable ? (
                    <button className="pmfby-approve-btn" onClick={handleAutoApprove} disabled={approving}>
                      {approving ? (
                        <><span className="material-symbols-outlined spin">progress_activity</span> Processing…</>
                      ) : (
                        <><span className="material-symbols-outlined">done_all</span>
                          Auto-Approve All {event.total_claims} Panchnamas</>
                      )}
                    </button>
                  ) : (
                    <button className="pmfby-review-btn">
                      <span className="material-symbols-outlined">assignment</span>
                      Schedule Field Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PMFBYPanel;
