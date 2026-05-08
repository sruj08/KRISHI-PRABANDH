import React from 'react';

const TriageQueue = ({ applications, selectedId, onSelect }) => {
  return (
    <div style={{
      background: 'rgba(22, 27, 34, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6edf3', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined" style={{ color: '#ff6b6b' }}>warning</span>
        AI Triage Queue
      </h2>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button style={{
          flex: 1, padding: '8px', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: 600
        }}>High Risk (Audit)</button>
        <button style={{
          flex: 1, padding: '8px', background: 'transparent', color: '#8b949e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '13px'
        }}>Low Risk (Auto)</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
        {applications.map(app => (
          <div 
            key={app.id}
            onClick={() => onSelect(app)}
            style={{
              padding: '16px',
              background: selectedId === app.id ? 'rgba(255, 107, 107, 0.05)' : 'rgba(13, 17, 23, 0.6)',
              border: selectedId === app.id ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{app.farmerName}</div>
              <div style={{ 
                background: app.riskScore > 50 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(82, 183, 136, 0.1)',
                color: app.riskScore > 50 ? '#ff6b6b' : '#52b788',
                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700
              }}>
                {app.riskScore}% RISK
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>
              {app.id} • {app.scheme}
            </div>

            {app.anomalyType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ffb86c' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                {app.anomalyType}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TriageQueue;
