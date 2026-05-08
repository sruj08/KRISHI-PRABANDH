import React from 'react';

const AnomalyDetail = ({ application }) => {
  if (!application) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', background: 'rgba(22, 27, 34, 0.4)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
        Select an application from the triage queue to view details.
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(22, 27, 34, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', marginBottom: '8px' }}>
            {application.farmerName} - {application.scheme}
          </h2>
          <div style={{ display: 'flex', gap: '16px', color: '#8b949e', fontSize: '13px' }}>
            <span><strong style={{ color: '#c9d1d9' }}>ID:</strong> {application.id}</span>
            <span><strong style={{ color: '#c9d1d9' }}>Location:</strong> {application.details.location}</span>
            <span><strong style={{ color: '#c9d1d9' }}>Amount:</strong> {application.details.amount}</span>
          </div>
        </div>
        
        <div style={{
          background: application.riskScore > 50 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(82, 183, 136, 0.1)',
          color: application.riskScore > 50 ? '#ff6b6b' : '#52b788',
          border: `1px solid ${application.riskScore > 50 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(82, 183, 136, 0.3)'}`,
          padding: '8px 16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{application.riskScore}%</div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Risk Score</div>
        </div>
      </div>

      {application.anomalyType && (
        <div style={{
          background: 'rgba(255, 184, 108, 0.1)',
          border: '1px solid rgba(255, 184, 108, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb86c', fontWeight: 700, marginBottom: '8px' }}>
            <span className="material-symbols-outlined">warning</span>
            {application.anomalyType}
          </div>
          <p style={{ color: '#e6edf3', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            {application.details.alert}
          </p>
        </div>
      )}

      {application.anomalyType === "Duplicate 7/12 Detected" && (
        <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, background: '#0d1117', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '14px', color: '#8b949e', marginBottom: '12px' }}>Current Application (ID: {application.id})</h3>
            <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#8b949e', fontSize: '12px' }}>7/12 Extract Preview</span>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#e6edf3' }}>
              <strong>Survey No:</strong> 45/2<br/>
              <strong>Name on Document:</strong> Baburao Kadam
            </div>
          </div>
          <div style={{ flex: 1, background: '#0d1117', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
            <h3 style={{ fontSize: '14px', color: '#8b949e', marginBottom: '12px' }}>Previous Application (ID: APP-2025-412)</h3>
            <div style={{ height: '200px', background: 'rgba(255,107,107,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,107,107,0.2)' }}>
              <span style={{ color: '#ff6b6b', fontSize: '12px' }}>Flagged 7/12 Extract Preview</span>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#ffb86c' }}>
              <strong>Survey No:</strong> 45/2<br/>
              <strong>Name on Document:</strong> Suresh Kadam
            </div>
          </div>
        </div>
      )}

      {application.anomalyType === "GPS Media Mismatch" && (
        <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, background: '#0d1117', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
             <h3 style={{ fontSize: '14px', color: '#8b949e', marginBottom: '12px' }}>Uploaded Field Photograph</h3>
             <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#30363d' }}>image</span>
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#e6edf3' }}>
                  GPS: 18.5204° N, 73.8567° E
                </div>
             </div>
          </div>
          <div style={{ flex: 1, background: '#0d1117', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
             <h3 style={{ fontSize: '14px', color: '#8b949e', marginBottom: '12px' }}>AgriStack Plot Location</h3>
             <div style={{ height: '200px', background: 'rgba(255,107,107,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,107,107,0.2)', position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ff6b6b' }}>map</span>
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#ffb86c' }}>
                  GPS: 18.1234° N, 73.2345° E
                </div>
             </div>
             <div style={{ marginTop: '12px', fontSize: '13px', color: '#ffb86c' }}>
              <strong>Distance Discrepancy:</strong> ~45km from registered plot.
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '12px 24px',
          background: 'transparent',
          color: '#e6edf3',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Request Clarification</button>
        <button style={{
          padding: '12px 24px',
          background: '#da3633',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Reject Application</button>
        <button style={{
          padding: '12px 24px',
          background: '#238636',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Override & Sanction</button>
      </div>
    </div>
  );
};

export default AnomalyDetail;
