import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import InsightModal from '../components/ui/InsightModal';
import { applicationsData } from '../data/applications';

const FraudAlerts = () => {
  const { t, lang } = useLanguage();
  const [selectedApp, setSelectedApp] = useState(null);

  const alerts = useMemo(() =>
    applicationsData.filter(app => (app.rejection_reason || '').toLowerCase().includes('duplicate')),
    []
  );

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      <header className="flex items-center gap-3 mb-2">
        <div className="btn-icon" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div>
          <h2 className="text-xl fw-bold text-error">{t('Fraud Alerts', lang)}</h2>
          <p className="text-sm text-muted">{alerts.length} Actionable Items</p>
        </div>
      </header>

      {alerts.length === 0 && (
        <div className="text-center text-muted p-6">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>verified_user</span>
          <p className="mt-2">No fraud alerts detected.</p>
        </div>
      )}

      {alerts.map((alert, index) => (
        <article key={index} className="alert-article">
          <div className="alert-stripe" />
          <div className="alert-body">
            {/* Title row */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="fw-bold text-md">{t('Possible duplicate application detected', lang)}</h3>
              <span className="badge" style={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '11px' }}>
                Urgent Priority
              </span>
            </div>

            {/* Data grid */}
            <div className="alert-detail-grid">
              <div>
                <div className="alert-detail-label">Farmer ID</div>
                <div className="alert-detail-value fw-bold">{alert.farmer_id || '—'}</div>
              </div>
              <div>
                <div className="alert-detail-label">Status</div>
                <StatusBadge status={alert.status || 'Unknown'} />
              </div>
              {/* Component-first hierarchy */}
              <div className="alert-detail-full">
                <div className="alert-detail-label">Component</div>
                <div className="alert-detail-value fw-bold">{alert.component || '—'}</div>
              </div>
              <div className="alert-detail-full">
                <div className="alert-detail-label">Scheme</div>
                <div className="alert-detail-value">{alert.scheme_name || '—'}</div>
              </div>
              <div>
                <div className="alert-detail-label">Category</div>
                <span className="badge badge-grey" style={{ fontSize: '10px' }}>{alert.scheme_category || '—'}</span>
              </div>
            </div>

            {/* Rejection reason — highlighted */}
            <div style={{ margin: '12px 0', backgroundColor: '#ffebee', borderRadius: 'var(--radius)', padding: '8px 12px', border: '1px solid #ffcdd2', fontSize: '12px', color: '#c62828' }}>
              <strong>Rejection Reason:</strong> {alert.rejection_reason}
            </div>

            {/* System explanation */}
            <div style={{ backgroundColor: '#fff3e0', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '12px', color: '#e65100', marginBottom: '12px' }}>
              ⚠️ Possible duplicate application detected. This farmer may have submitted the same application under multiple IDs.
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="error" fullWidth icon="policy">
                {t('Investigate Case', lang)}
              </Button>
              <button
                className="btn btn-outline"
                style={{ flexShrink: 0, padding: '0 16px' }}
                onClick={() => setSelectedApp(alert)}
              >
                View Details
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FraudAlerts;
