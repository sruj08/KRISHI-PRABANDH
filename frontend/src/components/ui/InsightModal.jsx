import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High Priority', color: '#c62828', bg: '#ffebee', icon: 'priority_high' },
  MEDIUM: { label: 'Medium Priority', color: '#e65100', bg: '#fff3e0', icon: 'pending_actions' },
  NORMAL: { label: 'Normal', color: '#0055A4', bg: '#e3f2fd', icon: 'info' },
  LOW:    { label: 'Low Priority', color: '#388e3c', bg: '#e8f5e9', icon: 'check_circle' },
};

const deriveExplanation = (app) => {
  const remarks = (app.remarks || '').toLowerCase();
  const rejection = (app.rejection_reason || '').toLowerCase();
  const status = (app.status || '').toLowerCase();
  if (rejection.includes('duplicate')) return '⚠️ Possible duplicate application detected. Requires investigation.';
  if (remarks.includes('field')) return '📍 Field verification required. Schedule a visit to confirm details.';
  if (status === 'under scrutiny') return '🔍 Application is under scrutiny. Pending document verification.';
  if (status === 'rejected') return '❌ Application has been rejected. Review rejection reason.';
  if (status === 'approved') return '✅ Application approved. Disbursement pending.';
  return '📋 Application is in progress. No special action required at this time.';
};

const InsightModal = ({ app, onClose, onApprove, onReject, actionLoading }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleUploadPhoto = () => {
    onClose();
    navigate(`/capture-photo?appId=${app.application_id}`);
  };
  if (!app) return null;
  const priority = app.priority || 'NORMAL';
  const pConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.NORMAL;
  const explanation = deriveExplanation(app);
  const daysSince = app.daysSince ?? 0;

  return (
    <Modal isOpen={!!app} onClose={onClose} title={t('Application Insight')}>
      {/* Priority banner */}
      <div style={{ backgroundColor: pConfig.bg, border: `1px solid ${pConfig.color}`, borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: pConfig.color }}>{pConfig.icon}</span>
        <span style={{ fontWeight: 700, color: pConfig.color, fontSize: '13px' }}>{t(pConfig.label)}</span>
        {daysSince <= 7 && <span className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: '11px' }}>{t('Recently Applied')}</span>}
        {priority === 'HIGH' && <span className="badge badge-error" style={{ marginLeft: daysSince <= 7 ? '4px' : 'auto', fontSize: '11px' }}>{t('Action Required')}</span>}
      </div>

      {/* Core fields */}
      <div className="flex-col gap-3">
        <div className="alert-detail-grid">
          <div>
            <div className="alert-detail-label">{t('Farmer ID')}</div>
            <div className="alert-detail-value fw-bold">{app.farmer_id || '-'}</div>
          </div>
          <div>
            <div className="alert-detail-label">{t('Status')}</div>
            <StatusBadge status={app.status || t('Unknown')} />
          </div>
          <div className="alert-detail-full">
            <div className="alert-detail-label">{t('Component')}</div>
            <div className="alert-detail-value fw-bold">{app.component || '-'}</div>
          </div>
          <div className="alert-detail-full">
            <div className="alert-detail-label">{t('Scheme Name')}</div>
            <div className="alert-detail-value">{app.scheme_name || '-'}</div>
          </div>
          <div>
            <div className="alert-detail-label">{t('Category')}</div>
            <span className="badge badge-grey" style={{ fontSize: '11px' }}>{app.scheme_category || '-'}</span>
          </div>
          <div>
            <div className="alert-detail-label">{t('Applied')}</div>
            <div className="alert-detail-value">{app.application_date || '-'} {daysSince > 0 ? `(${daysSince}d ${t('ago')})` : ''}</div>
          </div>
        </div>

        {/* Uploaded photo thumbnail */}
        {app.photo && (
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)' }}>
            <div className="alert-detail-label" style={{ padding: '6px 12px 4px', backgroundColor: 'var(--surface-low)' }}>{t('Field Photo')}</div>
            <img
              src={app.photo}
              alt={t('Field photo')}
              style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
            />
            {app.photo_uploaded_at && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 12px', backgroundColor: 'var(--surface-low)' }}>
                {t('Uploaded')}: {app.photo_uploaded_at}
              </div>
            )}
          </div>
        )}

        {/* Remarks */}
        <div style={{ backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
          <div className="alert-detail-label mb-1">{t('Remarks')}</div>
          <div className="text-sm">{app.remarks || t('No remarks')}</div>
        </div>

        {/* Rejection reason - only if present */}
        {app.rejection_reason && (
          <div style={{ backgroundColor: '#ffebee', borderRadius: 'var(--radius)', padding: '10px 12px', border: '1px solid #ffcdd2' }}>
            <div className="alert-detail-label mb-1" style={{ color: '#c62828' }}>{t('Rejection Reason')}</div>
            <div className="text-sm" style={{ color: '#c62828' }}>{app.rejection_reason}</div>
          </div>
        )}

        {/* Derived explanation */}
        <div style={{ backgroundColor: '#e8f5e9', borderRadius: 'var(--radius)', padding: '10px 12px', border: '1px solid #c8e6c9' }}>
          <div className="alert-detail-label mb-1" style={{ color: '#2e7d32' }}>{t('System Insight')}</div>
          <div className="text-sm">{t(explanation)}</div>
        </div>

        {/* Action buttons - only rendered when callbacks provided */}
        {(onApprove || onReject) && (
          <div className="flex gap-2 mt-2">
            {onApprove && (
              <button
                disabled={actionLoading}
                style={{ flex: 1, backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 'var(--radius)', padding: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}
                onClick={() => { onApprove(); onClose(); }}
              >
                {actionLoading ? '…' : t('✓ Approve')}
              </button>
            )}
            {onReject && (
              <button
                disabled={actionLoading}
                style={{ flex: 1, backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 'var(--radius)', padding: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}
                onClick={() => { onReject(); onClose(); }}
              >
                {actionLoading ? '…' : t('✕ Reject')}
              </button>
            )}
          </div>
        )}

        {/* Upload Photo button - always available */}
        <button
          id="insight-upload-photo-btn"
          onClick={handleUploadPhoto}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            backgroundColor: app.photo ? 'var(--surface-container)' : '#0055A4',
            color: app.photo ? 'var(--text-dark)' : '#fff',
            border: app.photo ? '1.5px solid var(--outline-variant)' : 'none',
            borderRadius: 'var(--radius)', padding: '10px 16px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
          {app.photo ? t('📷 Update Field Photo') : t('📷 Upload Field Photo')}
        </button>
      </div>
    </Modal>
  );
};

export default InsightModal;
