import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';

const FraudAlerts = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      
      <header className="flex items-center gap-3 mb-2">
        <div className="btn-icon" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div>
          <h2 className="text-xl fw-bold text-error">{t("Fraud Alerts", lang)}</h2>
          <p className="text-sm text-muted">2 Actionable Items</p>
        </div>
      </header>

      {/* Alert 1 */}
      <article className="alert-article">
        <div className="alert-stripe" />
        <div className="alert-body">
          <div className="flex justify-between items-start mb-3">
            <h3 className="fw-bold text-md">{t("Duplicate Land Record", lang)}</h3>
            <span className="badge" style={{ backgroundColor: '#ffebee', color: '#c62828' }}>
              {t("Urgent Priority", lang)}
            </span>
          </div>
          
          <div className="alert-detail-grid">
            <div>
              <div className="alert-detail-label">Case ID</div>
              <div className="alert-detail-value fw-bold">#FR-8821-A</div>
            </div>
            <div>
              <div className="alert-detail-label">SLA</div>
              <div className="alert-detail-value text-error fw-bold">24 Hours</div>
            </div>
            <div className="alert-detail-full">
              <div className="alert-detail-label">Details</div>
              <div className="alert-detail-value text-sm">
                Same 7/12 extract submitted by two different Aadhaar IDs in North Sector.
              </div>
            </div>
          </div>
          
          <Button variant="error" fullWidth icon="policy">
            {t("Investigate Case", lang)}
          </Button>
        </div>
      </article>

      {/* Alert 2 */}
      <article className="alert-article">
        <div className="alert-stripe" style={{ backgroundColor: 'var(--amber)' }} />
        <div className="alert-body">
          <div className="flex justify-between items-start mb-3">
            <h3 className="fw-bold text-md">{t("Suspicious Activity Pattern", lang)}</h3>
            <span className="badge" style={{ backgroundColor: 'var(--amber-light)', color: 'var(--accent-dark)' }}>
              {t("High Priority", lang)}
            </span>
          </div>
          
          <div className="alert-detail-grid">
            <div>
              <div className="alert-detail-label">Case ID</div>
              <div className="alert-detail-value fw-bold">#FR-8822-B</div>
            </div>
            <div>
              <div className="alert-detail-label">SLA</div>
              <div className="alert-detail-value fw-bold" style={{ color: 'var(--accent-dark)' }}>48 Hours</div>
            </div>
            <div className="alert-detail-full">
              <div className="alert-detail-label">Details</div>
              <div className="alert-detail-value text-sm">
                Unusually high number of tractor subsidy applications from East Village in last 2 days.
              </div>
            </div>
          </div>
          
          <Button variant="outline" fullWidth icon="search">
            {t("Investigate Case", lang)}
          </Button>
        </div>
      </article>

    </div>
  );
};

export default FraudAlerts;
