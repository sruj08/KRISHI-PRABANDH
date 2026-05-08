import React from 'react';

const GrievancePanel = ({ grievances }) => {
  return (
    <div style={{
      background: 'rgba(22, 27, 34, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6edf3', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined" style={{ color: '#ffb86c' }}>forum</span>
        Intelligent Grievance Prioritization
      </h2>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {grievances.map(g => (
          <div key={g.id} style={{
            background: 'rgba(13, 17, 23, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>{g.farmerName}</span>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', color: '#c9d1d9',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600
                }}>{g.id}</span>
              </div>
              <div style={{ 
                background: g.sentiment === 'Critical' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(82, 183, 136, 0.1)',
                color: g.sentiment === 'Critical' ? '#ff6b6b' : '#52b788',
                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700
              }}>
                {g.category}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#c9d1d9', marginBottom: '6px', fontStyle: 'italic' }}>
              "{g.text}"
            </div>
            <div style={{ fontSize: '12px', color: '#8b949e', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '8px' }}>
              <strong>AI Translation:</strong> {g.translated}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
               <button style={{
                 background: 'transparent', color: '#58a6ff', border: '1px solid rgba(88, 166, 255, 0.3)',
                 padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
               }}>Route to Department</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrievancePanel;
