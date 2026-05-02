import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import InsightModal from '../components/ui/InsightModal';
import { applicationsData } from '../data/applications';

const getDaysSince = (dateStr) => {
  if (!dateStr) return 0;
  const parts = dateStr.split('-');
  const date = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((new Date() - date) / 86400000));
};

const VisitPlanner = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState(null);

  // Count apps per farmer to detect multi-application HIGH risk
  const appCountByFarmer = useMemo(() => {
    const counts = {};
    applicationsData.forEach(app => {
      counts[app.farmer_id] = (counts[app.farmer_id] || 0) + 1;
    });
    return counts;
  }, []);

  const getRiskLevel = (app) => {
    if (app.rejection_reason || (appCountByFarmer[app.farmer_id] || 0) > 3) return 'HIGH';
    if (app.status === 'Under Scrutiny') return 'MEDIUM';
    return 'LOW';
  };

  const visits = useMemo(() =>
    applicationsData
      .filter(app => (app.remarks || '').includes('Field'))
      .map(app => ({ ...app, daysSince: getDaysSince(app.application_date) })),
    []
  );

  const RISK_CONFIG = {
    HIGH:   { badgeClass: 'badge-error',   borderClass: 'card-bordered-error', label: 'Risk: HIGH',   color: '#c62828' },
    MEDIUM: { badgeClass: 'badge-pending',  borderClass: '',                    label: 'Risk: MEDIUM', color: '#e65100' },
    LOW:    { badgeClass: 'badge-verified', borderClass: '',                    label: 'Risk: LOW',    color: '#2e7d32' },
  };

  return (
    <div className="flex-col animate-fade-in mb-8" style={{ margin: 'calc(var(--sp-6) * -1) calc(var(--sp-6) * -1) 0 calc(var(--sp-6) * -1)' }}>
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      {/* Banner */}
      <div style={{ height: '180px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--success-dark)' }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: '64px', opacity: 0.3 }}>map</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--sp-4)', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
          <h2 className="text-xl fw-bold text-white mb-1">{t("Today's Route", lang)}</h2>
          <div className="flex gap-2">
            <span className="badge bg-white text-primary fw-bold">{visits.length} {t('Assigned', lang)}</span>
            <span className="badge badge-error">{visits.filter(v => getRiskLevel(v) === 'HIGH').length} High Risk</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-col gap-4">
        {visits.length === 0 && (
          <div className="text-center text-muted p-6">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>directions_off</span>
            <p className="mt-2">No field visits required today.</p>
          </div>
        )}

        {visits.map((visit, index) => {
          const riskLevel = getRiskLevel(visit);
          const rc = RISK_CONFIG[riskLevel] || RISK_CONFIG.LOW;
          return (
            <div key={index} className={`card p-0 ${rc.borderClass}`} style={{ overflow: 'hidden' }}>
              {/* Card header — clickable for insight */}
              <div className="p-4 flex justify-between items-start" style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(visit)}>
                <div style={{ flex: 1 }}>
                  <h3 className="fw-bold mb-1">{visit.farmer_id || 'Unknown Farmer'}</h3>
                  {/* Component-first */}
                  <p className="text-sm fw-bold text-muted mb-0">{visit.component || '—'}</p>
                  <p className="text-xs text-muted mb-2">{visit.scheme_name || '—'}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`badge ${rc.badgeClass}`}>{rc.label}</span>
                    <span className="badge badge-grey" style={{ fontSize: '10px' }}>{visit.scheme_category || '—'}</span>
                    <span className="badge badge-grey">System Suggested</span>
                    {visit.daysSince <= 7 && <span className="badge badge-blue" style={{ fontSize: '10px' }}>Recent</span>}
                  </div>
                </div>
                <div className="flex-col items-end gap-2">
                  <button className="btn-icon text-primary" onClick={e => { e.stopPropagation(); }}>
                    <span className="material-symbols-outlined">directions</span>
                  </button>
                  <span className="text-xs text-muted">{visit.daysSince}d ago</span>
                </div>
              </div>

              {/* Remarks strip */}
              {visit.remarks && (
                <div style={{ padding: '6px 16px', backgroundColor: 'var(--surface-low)', borderTop: '1px solid var(--outline-variant)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  📋 {visit.remarks}
                </div>
              )}

              {/* Action footer */}
              <div className="p-3" style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)' }}>
                <Button variant="primary" fullWidth onClick={() => navigate('/select-task')}>
                  {t('Mark as Visited', lang)}
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
