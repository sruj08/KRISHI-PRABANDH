import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const TAOAnomalyModal = ({ application, onClose }) => {
  const { t, lang } = useLanguage();

  if (!application) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div className="card w-full animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6" style={{ padding: '24px 24px 0 24px' }}>
          <div>
            <h2 className="text-xl fw-bold text-base" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Document Review: {application.farmerName}
            </h2>
            <div className="text-sm text-muted mt-1">{application.id} • {application.scheme}</div>
          </div>
          <button className="btn btn-icon text-muted" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ padding: '0 24px 24px 24px' }}>
          {/* Anomaly Banner */}
          {application.anomalyType && (
            <div style={{
              background: '#ffebee',
              border: '1px solid #ffcdd2',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex', gap: '12px', alignItems: 'flex-start'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#c62828' }}>warning</span>
              <div>
                <div style={{ fontWeight: 700, color: '#c62828', marginBottom: '4px' }}>{application.anomalyType}</div>
                <p style={{ color: '#b71c1c', fontSize: '14px', margin: 0 }}>{application.details.alert}</p>
              </div>
              <div className="ml-auto flex-col items-end">
                 <span className="badge" style={{ background: '#c62828', color: 'white' }}>{application.riskScore}% RISK</span>
              </div>
            </div>
          )}

          {/* Document Comparison Section */}
          <h3 className="section-title mb-4">Fraud Review & Verification</h3>
          
          {application.anomalyType === "Duplicate 7/12 Detected" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-color)', border: '1px solid var(--border)' }}>
                <h4 className="fw-bold text-sm mb-2 p-3 border-b border-border">Current Submission ({application.id})</h4>
                <div className="p-3">
                   <div style={{ height: '200px', background: '#e0e0e0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #9e9e9e', marginBottom: '12px' }}>
                     <span className="text-muted text-sm">7/12 Extract Preview</span>
                   </div>
                   <div className="text-sm">
                     <strong>Survey No:</strong> 45/2<br/>
                     <strong>Name:</strong> Baburao Kadam
                   </div>
                </div>
              </div>
              <div className="card" style={{ background: '#ffebee', border: '1px solid #ef5350' }}>
                <h4 className="fw-bold text-sm mb-2 p-3 border-b" style={{ borderColor: '#ef9a9a', color: '#c62828' }}>Flagged Previous Usage (APP-2025-412)</h4>
                <div className="p-3">
                   <div style={{ height: '200px', background: '#ffcdd2', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ef5350', marginBottom: '12px' }}>
                     <span style={{ color: '#c62828', fontSize: '12px' }}>Document Preview</span>
                   </div>
                   <div className="text-sm" style={{ color: '#b71c1c' }}>
                     <strong>Survey No:</strong> 45/2<br/>
                     <strong>Name:</strong> Suresh Kadam
                   </div>
                </div>
              </div>
            </div>
          )}

          {application.anomalyType === "GPS Media Mismatch" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-color)', border: '1px solid var(--border)' }}>
                 <h4 className="fw-bold text-sm mb-2 p-3 border-b border-border">Uploaded Equipment Photo</h4>
                 <div className="p-3">
                    <div style={{ height: '200px', background: '#e0e0e0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #9e9e9e', position: 'relative', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>image</span>
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>
                        GPS: 18.5204° N, 73.8567° E
                      </div>
                    </div>
                 </div>
              </div>
              <div className="card" style={{ background: '#ffebee', border: '1px solid #ef5350' }}>
                 <h4 className="fw-bold text-sm mb-2 p-3 border-b" style={{ borderColor: '#ef9a9a', color: '#c62828' }}>AgriStack Registered Plot</h4>
                 <div className="p-3">
                    <div style={{ height: '200px', background: '#ffcdd2', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ef5350', position: 'relative', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef5350' }}>map</span>
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#ff8a80' }}>
                        GPS: 18.1234° N, 73.2345° E
                      </div>
                    </div>
                    <div className="text-sm fw-bold" style={{ color: '#c62828' }}>
                      Distance Discrepancy: ~45km from registered plot.
                    </div>
                 </div>
              </div>
            </div>
          )}

          {application.anomalyType === "Invoice Date Mismatch" && (
             <div className="card p-4" style={{ background: '#fff3e0', border: '1px solid #ffb74d' }}>
                <h4 className="fw-bold text-sm mb-4" style={{ color: '#e65100' }}>Invoice Analysis</h4>
                <div className="flex gap-4">
                  <div style={{ flex: 1, background: '#ffe0b2', height: '150px', borderRadius: '8px', border: '1px dashed #ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#e65100', fontSize: '12px' }}>Invoice Preview (Extracted Date: 10-Apr-2026)</span>
                  </div>
                  <div style={{ flex: 1 }}>
                     <ul style={{ color: '#e65100', fontSize: '14px', lineHeight: '1.6' }}>
                       <li><strong>Invoice Date:</strong> 10-Apr-2026</li>
                       <li><strong>Scheme Approval:</strong> 15-Apr-2026</li>
                       <li className="mt-2 text-xs">Equipment purchased before formal approval, violating scheme guidelines.</li>
                     </ul>
                  </div>
                </div>
             </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button className="btn btn-outline" onClick={onClose}>{t('Cancel', lang)}</button>
            <button className="btn btn-primary" style={{ background: '#da3633', borderColor: '#da3633' }}>{t('Reject & Flag for Fraud', lang)}</button>
            <button className="btn btn-primary">{t('Request Clarification', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TAOAnomalyModal;
