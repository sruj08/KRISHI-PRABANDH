import React from 'react';
const MOCK_HAVELI_MANDALS = [];

const CAOMatrix = () => {
  return (
    <div className="card mb-6" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ padding: '16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="fw-bold m-0" style={{ fontSize: '16px', color: 'var(--text-dark)' }}>Circle Agriculture Officers (Mandal Adhikaris)</h3>
          <p className="text-sm text-muted m-0 mt-1">Status of work and participation across Mandals</p>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Mandal (Circle)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Circle Officer (CAO)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Pending Files</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fraud Alerts</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HAVELI_MANDALS.map((mandal) => (
              <tr key={mandal.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{mandal.name}</td>
                <td style={{ padding: '12px 16px' }}>{mandal.caoName}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontWeight: 600, color: mandal.pending > 100 ? '#d32f2f' : 'inherit' }}>
                    {mandal.pending}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {mandal.fraudAlerts > 0 ? (
                    <span className="badge" style={{ background: '#ffebee', color: '#c62828', fontSize: '11px' }}>
                      {mandal.fraudAlerts} Flagged
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '11px' }}>
                      0 Flags
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    color: mandal.status === 'Clear' ? '#2e7d32' : mandal.status === 'Warning' ? '#f57c00' : '#d32f2f',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <span style={{ 
                      width: 8, height: 8, borderRadius: '50%', 
                      background: mandal.status === 'Clear' ? '#2e7d32' : mandal.status === 'Warning' ? '#f57c00' : '#d32f2f'
                    }}></span>
                    {mandal.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button className="btn btn-outline btn-sm text-primary" style={{ padding: '4px 12px', fontSize: '11px' }}>
                    Review Circle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CAOMatrix;
