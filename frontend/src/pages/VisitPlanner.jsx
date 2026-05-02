import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';

const VisitPlanner = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

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
          <span className="badge badge-blue bg-white text-primary fw-bold">3 {t("Assigned", lang)}</span>
        </div>
      </div>

      <div className="p-4 flex-col gap-4">
        
        {/* Visit 1 */}
        <div className="card p-0" style={{ overflow: 'hidden' }}>
          <div className="p-4 flex justify-between items-start">
            <div>
              <h3 className="fw-bold mb-1">Elias Thorne</h3>
              <p className="text-sm text-muted mb-2">North Sector • Plot 42</p>
              <span className="badge badge-pending">{t("Survey Pending", lang)}</span>
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

        {/* Visit 2 */}
        <div className="card p-0 card-bordered-error" style={{ overflow: 'hidden' }}>
          <div className="p-4 flex justify-between items-start">
            <div>
              <h3 className="fw-bold mb-1">Sarah Jenkins</h3>
              <p className="text-sm text-muted mb-2">East Sector • Plot 18</p>
              <span className="badge badge-error">{t("Urgent Inspection", lang)}</span>
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

        {/* Visit 3 (Completed) */}
        <div className="card p-0" style={{ overflow: 'hidden', opacity: 0.7 }}>
          <div className="p-4 flex justify-between items-start">
            <div>
              <h3 className="fw-bold mb-1 text-muted" style={{ textDecoration: 'line-through' }}>Marcus Vance</h3>
              <p className="text-sm text-muted mb-2">South Sector • Plot 05</p>
              <span className="badge badge-grey">{t("Task Completed", lang)}</span>
            </div>
            <span className="material-symbols-outlined text-success" style={{ fontSize: '32px' }}>check_circle</span>
          </div>
          <div className="p-3 text-center text-sm fw-bold text-success" style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>done_all</span>
            {t("Visit Logged", lang)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VisitPlanner;
