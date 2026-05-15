import React, { useState } from 'react';
import { APPLICATION_REVIEW } from '../../mock/officer-operations';

const THUMB = { width: '80px', height: '100px', background: '#e2e9e6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

const ActionBtn = ({ onClick, variant = 'ghost', children }) => {
  const base = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    fontFamily: 'inherit',
  };
  const styles = {
    danger:   { ...base, background: '#fff',    borderColor: 'rgba(186,26,26,0.35)', color: '#ba1a1a' },
    ghost:    { ...base, background: '#fff',    borderColor: '#e2e9e6',              color: '#414943' },
    primary:  { ...base, background: '#1f4d36', borderColor: '#1f4d36',              color: '#fff',   padding: '10px 24px' },
  };
  return <button onClick={onClick} style={styles[variant]}>{children}</button>;
};

const OfficerPendingSurveysPage = () => {
  const [selectedApp, setSelectedApp] = useState(APPLICATION_REVIEW[0] || null);
  const [modalAction, setModalAction] = useState(null);

  const confirmAction = () => {
    alert(`Successfully processed action: ${modalAction} for ${selectedApp?.id}`);
    setModalAction(null);
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 60px)',
      background: '#f8f9f8',
      overflow: 'hidden',
    }}>

      {/* ── LEFT PANE: QUEUE ── */}
      <div style={{
        width: '320px',
        minWidth: '280px',
        borderRight: '1px solid #e2e9e6',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Queue header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e9e6' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 4px' }}>
            Pending Queue
          </h2>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#717972' }}>
            {APPLICATION_REVIEW.length} items require review
          </p>
        </div>

        {/* Queue list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {APPLICATION_REVIEW.map((app) => {
            const isActive = selectedApp?.id === app.id;
            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{
                  padding: '14px 16px',
                  marginBottom: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: isActive ? '2px solid #1f4d36' : '1px solid #e2e9e6',
                  background: isActive ? '#f3f4f0' : '#fff',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1c1a', lineHeight: 1.3 }}>
                    {app.farmer}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9eaa9f', whiteSpace: 'nowrap', marginLeft: '8px', paddingTop: '2px' }}>
                    {app.daysOpen}d ago
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#5c6656', marginBottom: '8px' }}>
                  {app.scheme} &bull; {app.village}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: app.priority === 'HIGH' ? '#fff0ef' : '#eef0eb',
                  color: app.priority === 'HIGH' ? '#ba1a1a' : '#414943',
                }}>
                  AI: {app.stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANE: DETAIL VIEW ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f4f5f1' }}>
        {selectedApp ? (
          <>
            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{
                background: '#fff',
                border: '1px solid #e2e9e6',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>

                {/* Farmer header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e9e6' }}>
                  <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 10px' }}>
                    {selectedApp.farmer}
                  </h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', color: '#717972', fontSize: '0.875rem', alignItems: 'center' }}>
                    <span><strong style={{ color: '#414943' }}>ID:</strong> {selectedApp.id}</span>
                    <span style={{ color: '#c8d0c4' }}>·</span>
                    <span><strong style={{ color: '#414943' }}>Village:</strong> {selectedApp.village}</span>
                    <span style={{ color: '#c8d0c4' }}>·</span>
                    <span><strong style={{ color: '#414943' }}>Scheme:</strong> {selectedApp.scheme}</span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                  {/* AI Summary */}
                  <section>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#414943', margin: '0 0 10px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      AI Summary &amp; Remarks
                    </h3>
                    <div style={{
                      background: '#fff8f7',
                      border: '1px solid #f4d0ce',
                      borderLeft: '3px solid #ba1a1a',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      color: '#7a1212',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                    }}>
                      {selectedApp.summary}
                    </div>
                  </section>

                  {/* Docs + Photos */}
                  <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#414943', margin: '0 0 12px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                        Uploaded Documents
                      </h3>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={THUMB}>
                          <span className="material-symbols-outlined" style={{ color: '#9eaa9f', fontSize: '22px' }}>description</span>
                        </div>
                        <div style={THUMB}>
                          <span className="material-symbols-outlined" style={{ color: '#9eaa9f', fontSize: '22px' }}>description</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#414943', margin: '0 0 12px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                        Geo-tagged Photos
                      </h3>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ ...THUMB, width: '100px' }}>
                          <span className="material-symbols-outlined" style={{ color: '#9eaa9f', fontSize: '22px' }}>image</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Officer Remarks */}
                  <section>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#414943', margin: '0 0 10px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      Officer Remarks
                    </h3>
                    <textarea
                      placeholder="Add your review notes here..."
                      style={{
                        width: '100%',
                        height: '96px',
                        padding: '12px',
                        border: '1px solid #dde3d9',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#1a1c1a',
                        background: '#fafbf8',
                        outline: 'none',
                      }}
                    />
                  </section>

                </div>
              </div>
            </div>

            {/* ── BOTTOM ACTION BAR ── */}
            <div style={{
              background: '#fff',
              borderTop: '1px solid #e2e9e6',
              padding: '16px 24px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <ActionBtn onClick={() => setModalAction('Flag for Inspection')} variant="danger">
                Flag for Inspection
              </ActionBtn>
              <ActionBtn onClick={() => setModalAction('Request Clarification')} variant="ghost">
                Request Clarification
              </ActionBtn>
              <ActionBtn onClick={() => setModalAction('Send Back')} variant="ghost">
                Send Back
              </ActionBtn>
              <ActionBtn onClick={() => setModalAction('Approve')} variant="primary">
                Approve Application
              </ActionBtn>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9eaa9f', fontSize: '0.9375rem' }}>
            Select an application to review
          </div>
        )}
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {modalAction && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(12,14,10,0.45)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            padding: '28px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #e2e9e6',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.125rem', fontWeight: 600, color: '#1a1c1a' }}>
              Confirm Action
            </h2>
            <p style={{ margin: '0 0 24px', color: '#5c6656', lineHeight: '1.6', fontSize: '0.9rem' }}>
              Are you sure you want to <strong style={{ color: '#1a1c1a' }}>{modalAction}</strong> for application <strong style={{ color: '#1a1c1a' }}>{selectedApp?.id}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <ActionBtn onClick={() => setModalAction(null)} variant="ghost">Cancel</ActionBtn>
              <ActionBtn onClick={confirmAction} variant="primary">Confirm</ActionBtn>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfficerPendingSurveysPage;
