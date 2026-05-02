import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import { applicationsData } from '../data/applications';

const FraudAlerts = () => {
  const { t, lang } = useLanguage();

  const alerts = applicationsData.filter(app => (app.rejection_reason || '').includes('Duplicate'));

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      
      <header className="flex items-center gap-3 mb-2">
        <div className="btn-icon" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div>
          <h2 className="text-xl fw-bold text-error">{t("Fraud Alerts", lang)}</h2>
          <p className="text-sm text-muted">{alerts.length} Actionable Items</p>
        </div>
      </header>

      {alerts.length === 0 && (
        <div className="text-center text-muted p-4">No fraud alerts detected.</div>
      )}

      {alerts.map((alert, index) => (
        <article key={index} className="alert-article">
          <div className="alert-stripe" />
          <div className="alert-body">
            <div className="flex justify-between items-start mb-3">
              <h3 className="fw-bold text-md">{t("Possible duplicate application detected", lang)}</h3>
              <span className="badge" style={{ backgroundColor: '#ffebee', color: '#c62828' }}>
                {t("Urgent Priority", lang)}
              </span>
            </div>
            
            <div className="alert-detail-grid">
              <div>
                <div className="alert-detail-label">Farmer ID</div>
                <div className="alert-detail-value fw-bold">{alert.farmer_id || "Unknown"}</div>
              </div>
              <div>
                <div className="alert-detail-label">Status</div>
                <div className="alert-detail-value text-error fw-bold">{alert.status || "Unknown"}</div>
              </div>
              <div className="alert-detail-full">
                <div className="alert-detail-label">Details</div>
                <div className="alert-detail-value text-sm">
                  {alert.component || "Unknown Component"} • {alert.scheme_name || "Unknown Scheme"}
                  <br/>
                  <span className="text-muted text-xs mt-1 inline-block">Reason: {alert.rejection_reason}</span>
                </div>
              </div>
            </div>
            
            <Button variant="error" fullWidth icon="policy">
              {t("Investigate Case", lang)}
            </Button>
          </div>
        </article>
      ))}

    </div>
  );
};

export default FraudAlerts;
