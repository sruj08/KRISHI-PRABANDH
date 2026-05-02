import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import { applicationsData } from '../data/applications';

const VisitPlanner = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const getRiskLevel = (app) => {
    if (app.rejection_reason) return 'HIGH';
    if (app.status === 'Under Scrutiny') return 'MEDIUM';
    return 'LOW';
  };

  const visits = applicationsData.filter(app => (app.remarks || '').includes('Field'));

  return (
    <div className="flex-col animate-fade-in mb-8" style={{ margin: 'calc(var(--sp-6) * -1) calc(var(--sp-6) * -1) 0 calc(var(--sp-6) * -1)' }}>
      
      {/* Banner */}
      <div style={{ height: '180px', backgroundColor: '#e0e0e0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'var(--success-dark)' }}>
          {/* Map placeholder */}
          <span className="material-symbols-outlined text-white" style={{ fontSize: '48px', margin: 'auto', opacity: 0.5 }}>map</span>
        </div>
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, 
          padding: 'var(--sp-4)', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' 
        }}>
          <h2 className="text-xl fw-bold text-white mb-1">{t("Today's Route", lang)}</h2>
          <span className="badge badge-blue bg-white text-primary fw-bold">{visits.length} {t("Assigned", lang)}</span>
        </div>
      </div>

      <div className="p-4 flex-col gap-4">
        {visits.length === 0 && (
          <div className="text-center text-muted p-4">No field visits required today.</div>
        )}
        {visits.map((visit, index) => {
          const riskLevel = getRiskLevel(visit);
          let badgeClass = 'badge-pending';
          if (riskLevel === 'HIGH') badgeClass = 'badge-error';
          else if (riskLevel === 'MEDIUM') badgeClass = 'badge-amber';

          return (
            <div key={index} className={`card p-0 ${riskLevel === 'HIGH' ? 'card-bordered-error' : ''}`} style={{ overflow: 'hidden' }}>
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="fw-bold mb-1">{visit.farmer_id || "Unknown Farmer"}</h3>
                  <p className="text-sm text-muted mb-2">{visit.component || "Unknown Component"} • {visit.scheme_name || "Unknown Scheme"}</p>
                  <div className="flex gap-2">
                    <span className={`badge ${badgeClass}`}>
                      {t(`Risk: ${riskLevel}`, lang)}
                    </span>
                    <span className="badge badge-grey">System Suggested</span>
                  </div>
                </div>
                <button className="btn-icon text-primary">
                  <span className="material-symbols-outlined">directions</span>
                </button>
              </div>
              <div className="p-3" style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)' }}>
                <Button variant="primary" fullWidth onClick={() => navigate('/select-task')}>
                  {t("Mark as Visited", lang)}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitPlanner;
