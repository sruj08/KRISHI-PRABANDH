import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHierarchy } from '../context/HierarchyContext';
import { useToast } from '../hooks/useToast.jsx';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import InsightModal from '../components/ui/InsightModal';
import { fetchFraudAlerts, updateApplicationStatus } from '../utils/api';

const FraudAlerts = () => {
  const { t, lang } = useLanguage();
  const { currentSahayak } = useHierarchy();
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    try {
      // The current backend route doesn't accept sahayak_id natively for fraud-alerts,
      // but we can client-side filter if needed, or if the backend route is updated to support it.
      // Since fetchApplications does support it, and fraud alerts uses the same data structure, 
      // let's do a client side filter for now to ensure scope.
      const result = await fetchFraudAlerts();
      let data = result.results || [];
      if (currentSahayak) {
         data = data.filter(a => a.sahayak_id === currentSahayak.sahayak_id);
      }
      setAlerts(data);
    } catch (err) {
      console.error('FraudAlerts load error:', err);
      addToast(t('Could not load fraud alerts', lang), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentSahayak]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleInvestigate = async (alert) => {
    setActionLoading(alert.application_id);
    try {
      const updated = await updateApplicationStatus(alert.application_id, 'Under Scrutiny', 'Marked for investigation');
      // await postLog({ action: 'INVESTIGATE', application_id: alert.application_id, details: 'Fraud investigation initiated' });
      setAlerts(prev => prev.map(a =>
        a.application_id === alert.application_id ? { ...a, ...updated } : a
      ));
      if (selectedApp?.application_id === alert.application_id) {
        setSelectedApp(prev => ({ ...prev, ...updated }));
      }
      addToast(t(`Investigation opened for ${alert.farmer_id}`, lang), 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || t('Action failed', lang), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      <header className="flex items-center gap-3 mb-2">
        <div className="btn-icon" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div>
          <h2 className="text-xl fw-bold text-error">{t('Fraud Alerts', lang)}</h2>
          <p className="text-sm text-muted">
            {loading ? t('Loading…', lang) : `${alerts.length} ${t('Actionable Items', lang)}`}
          </p>
        </div>
      </header>

      {loading && <div className="text-center text-muted p-4">{t('Loading fraud alerts…', lang)}</div>}

      {!loading && alerts.length === 0 && (
        <div className="text-center text-muted p-6">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>verified_user</span>
          <p className="mt-2">{t('No fraud alerts detected.', lang)}</p>
        </div>
      )}

      {alerts.map((alert) => {
        const isBusy = actionLoading === alert.application_id;
        const canInvestigate = ['Applied', 'Under Scrutiny'].includes(alert.status);

        return (
          <article key={alert.application_id} className="alert-article" style={{ opacity: isBusy ? 0.6 : 1 }}>
            <div className="alert-stripe" />
            <div className="alert-body">
              {/* Title row */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="fw-bold text-md">{t('Possible duplicate application detected', lang)}</h3>
                <span className="badge" style={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '11px' }}>
                  {t('Urgent Priority', lang)}
                </span>
              </div>

              {/* Data grid — component-first */}
              <div className="alert-detail-grid">
                <div>
                  <div className="alert-detail-label">{t('Farmer ID', lang)}</div>
                  <div className="alert-detail-value fw-bold">{alert.farmer_id || '—'}</div>
                </div>
                <div>
                  <div className="alert-detail-label">{t('Status', lang)}</div>
                  <StatusBadge status={alert.status || 'Unknown'} />
                </div>
                <div className="alert-detail-full">
                  <div className="alert-detail-label">{t('Component', lang)}</div>
                  <div className="alert-detail-value fw-bold">{alert.component || '—'}</div>
                </div>
                <div className="alert-detail-full">
                  <div className="alert-detail-label">{t('Scheme', lang)}</div>
                  <div className="alert-detail-value">{alert.scheme_name || '—'}</div>
                </div>
                <div>
                  <div className="alert-detail-label">{t('Category', lang)}</div>
                  <span className="badge badge-grey" style={{ fontSize: '10px' }}>{alert.scheme_category || '—'}</span>
                </div>
              </div>

              {/* Rejection reason */}
              <div style={{ margin: '12px 0', backgroundColor: '#ffebee', borderRadius: 'var(--radius)', padding: '8px 12px', border: '1px solid #ffcdd2', fontSize: '12px', color: '#c62828' }}>
                <strong>{t('Rejection Reason:', lang)}</strong> {alert.rejection_reason}
              </div>

              {/* System explanation */}
              <div style={{ backgroundColor: '#fff3e0', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '12px', color: '#e65100', marginBottom: '12px' }}>
                {alert.explanation || t('⚠️ Possible duplicate application detected. This farmer may have submitted the same application under multiple IDs.', lang)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="error"
                  fullWidth
                  icon="policy"
                  onClick={() => canInvestigate ? handleInvestigate(alert) : addToast(t('No further action possible for this status', lang), 'info')}
                  disabled={isBusy}
                >
                  {isBusy ? t('Processing…', lang) : t('Investigate Case', lang)}
                </Button>
                <button
                  className="btn btn-outline"
                  style={{ flexShrink: 0, padding: '0 16px' }}
                  onClick={() => setSelectedApp({ ...alert, priority: 'LOW' })}
                >
                  {t('View Details', lang)}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default FraudAlerts;
