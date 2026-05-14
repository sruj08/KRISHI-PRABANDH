import React, { useState } from 'react';
import { APPLICATION_REVIEW } from '../../mock/officer-operations';

const OfficerPendingSurveysPage = () => {
  const [selectedApp, setSelectedApp] = useState(APPLICATION_REVIEW[0] || null);
  const [modalAction, setModalAction] = useState(null);

  const handleAction = (action) => {
    setModalAction(action);
  };

  const confirmAction = () => {
    alert(`Successfully processed action: ${modalAction} for ${selectedApp?.id}`);
    setModalAction(null);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#f8f9f8', margin: '-24px -32px', overflow: 'hidden' }}>
      
      {/* LEFT PANE: QUEUE */}
      <div style={{ width: '380px', borderRight: '1px solid #e2e9e6', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e9e6' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>Pending Queue</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#717972' }}>{APPLICATION_REVIEW.length} items require review</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {APPLICATION_REVIEW.map((app) => (
            <div 
              key={app.id} 
              onClick={() => setSelectedApp(app)}
              style={{
                padding: '16px', 
                marginBottom: '8px',
                borderRadius: '8px', 
                cursor: 'pointer',
                border: selectedApp?.id === app.id ? '2px solid #1f4d36' : '1px solid #e2e9e6',
                background: selectedApp?.id === app.id ? '#f3f4f0' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: '#1a1c1a' }}>{app.farmer}</span>
                <span style={{ fontSize: '0.75rem', color: '#717972' }}>{app.daysOpen}d ago</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#414943', marginBottom: '4px' }}>
                {app.scheme} &bull; {app.village}
              </div>
              <div style={{ 
                display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: app.priority === 'HIGH' ? '#fff0ef' : '#eef0eb',
                color: app.priority === 'HIGH' ? '#ba1a1a' : '#414943',
                marginTop: '6px'
              }}>
                AI: {app.stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: DETAIL VIEW */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafbf8' }}>
        {selectedApp ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: '12px', padding: '24px' }}>
                
                <div style={{ borderBottom: '1px solid #e2e9e6', paddingBottom: '20px', marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>
                    {selectedApp.farmer}
                  </h1>
                  <div style={{ display: 'flex', gap: '16px', color: '#717972', fontSize: '0.9rem' }}>
                    <span><strong>ID:</strong> {selectedApp.id}</span>
                    <span><strong>Village:</strong> {selectedApp.village}</span>
                    <span><strong>Scheme:</strong> {selectedApp.scheme}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#414943', marginBottom: '12px' }}>AI Summary & Remarks</h3>
                  <div style={{ background: '#fff0ef', border: '1px solid #f9dcdb', borderRadius: '8px', padding: '16px', color: '#ba1a1a', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {selectedApp.summary}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#414943', marginBottom: '12px' }}>Uploaded Documents</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '80px', height: '100px', background: '#e2e9e6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: '#9eaa9f' }}>description</span>
                      </div>
                      <div style={{ width: '80px', height: '100px', background: '#e2e9e6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: '#9eaa9f' }}>description</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#414943', marginBottom: '12px' }}>Geo-tagged Photos</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '120px', height: '100px', background: '#e2e9e6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: '#9eaa9f' }}>image</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#414943', marginBottom: '12px' }}>Officer Remarks</h3>
                  <textarea 
                    placeholder="Add your review notes here..."
                    style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid #e2e9e6', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

              </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div style={{ background: '#fff', borderTop: '1px solid #e2e9e6', padding: '20px 32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => handleAction('Flag for Inspection')}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e9e6', borderRadius: '6px', color: '#ba1a1a', fontWeight: 600, cursor: 'pointer' }}>
                Flag for Inspection
              </button>
              <button 
                onClick={() => handleAction('Request Clarification')}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e9e6', borderRadius: '6px', color: '#414943', fontWeight: 600, cursor: 'pointer' }}>
                Request Clarification
              </button>
              <button 
                onClick={() => handleAction('Send Back')}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e9e6', borderRadius: '6px', color: '#414943', fontWeight: 600, cursor: 'pointer' }}>
                Send Back
              </button>
              <button 
                onClick={() => handleAction('Approve')}
                style={{ padding: '10px 24px', background: '#1f4d36', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Approve Application
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9eaa9f' }}>
            Select an application to review
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {modalAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: '#1a1c1a' }}>Confirm Action</h2>
            <p style={{ margin: '0 0 24px', color: '#414943', lineHeight: '1.5' }}>
              Are you sure you want to <strong>{modalAction}</strong> for application {selectedApp?.id}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalAction(null)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #e2e9e6', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={confirmAction} style={{ padding: '8px 16px', background: '#1f4d36', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfficerPendingSurveysPage;
