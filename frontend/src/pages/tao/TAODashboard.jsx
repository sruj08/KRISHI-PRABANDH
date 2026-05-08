import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import CircularGauge from '../../components/ui/CircularGauge';
import { MOCK_TAO_STATS, MOCK_APPLICATIONS, MOCK_GRIEVANCES } from '../../utils/taoMockData';
import TAOAnomalyModal from './components/TAOAnomalyModal';
import TAOMap from './components/TAOMap';
import CAOMatrix from './components/CAOMatrix';
import { useRef } from 'react';

const TAODashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [selectedAppId, setSelectedAppId] = useState(null);
  
  const selectedApp = MOCK_APPLICATIONS.find(app => app.id === selectedAppId);

  // Refs for scrolling
  const fraudSectionRef = useRef(null);
  const mapSectionRef = useRef(null);
  const grievanceSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayName = 'Taluka Agriculture Officer';
  const displayLocation = 'Taluka: Pune District';

  return (
    <div className="flex-col gap-6 animate-fade-in">
      {/* If selectedApp is present, we show the document review modal */}
      {selectedApp && (
        <TAOAnomalyModal 
          application={selectedApp} 
          onClose={() => setSelectedAppId(null)} 
        />
      )}

      {/* Welcome Banner */}
      <section>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl fw-bold text-success-dark">
              {t(`Good Morning, ${displayName}`, lang)}
            </h2>
            <p className="text-muted mt-1">{t(displayLocation, lang)}</p>
          </div>
          <span className="badge badge-verified" style={{ fontSize: '10px', marginTop: '4px' }}>
            🟢 API Live
          </span>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-3)' }}>
        <div className="quick-action-btn" onClick={() => scrollToSection(fraudSectionRef)}>
          <div className="quick-action-icon blue"><span className="material-symbols-outlined">rule_folder</span></div>
          <span className="quick-action-label">{t('Triage Queue', lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => scrollToSection(fraudSectionRef)}>
          <div className="quick-action-icon amber"><span className="material-symbols-outlined">fact_check</span></div>
          <span className="quick-action-label">{t('Pending Audits', lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => scrollToSection(mapSectionRef)}>
          <div className="quick-action-icon rose"><span className="material-symbols-outlined">map</span></div>
          <span className="quick-action-label">{t('Geo-Verification', lang)}</span>
        </div>
      </section>

      {/* Live Summary */}
      <section>
        <h3 className="section-title">{t('Live Summary', lang)}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: 'task_alt',     label: 'Files Processed',    value: MOCK_TAO_STATS.processed,         color: '#0055A4', bg: '#e3f2fd' },
            { icon: 'security',     label: 'Leakage Prevented',  value: `₹${MOCK_TAO_STATS.leakagePrevented}L`, color: '#2e7d32', bg: '#e8f5e9' },
            { icon: 'warning',      label: 'Pending Audit',      value: MOCK_TAO_STATS.pendingManualAudit, color: '#c62828', bg: '#ffebee' },
            { icon: 'gpp_bad',      label: 'High Risk (Fraud)',  value: MOCK_APPLICATIONS.filter(a => a.riskScore > 50).length, color: '#e65100', bg: '#fff3e0' },
          ].map((item, i) => (
            <div
              key={i}
              className="card"
              style={{ background: item.bg, border: `1px solid ${item.color}22`, padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <span className="material-symbols-outlined" style={{ color: item.color, fontSize: '28px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value ?? '—'}</div>
                <div style={{ fontSize: '11px', color: item.color, opacity: 0.8, marginTop: '2px' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* District Impact Pulse */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t('Fraud & Anomaly Pulse', lang)}</h3>
        </div>
        <div className="glass-panel">
          <div style={{ display: 'flex', overflowX: 'auto', gap: 'var(--sp-6)', paddingBottom: 'var(--sp-2)' }}>
            <CircularGauge value={15} label="High Risk" subtext="Needs Audit" color="var(--error)" />
            <CircularGauge value={85} label="Low Risk" subtext="Auto Compliant" color="var(--success)" />
            <CircularGauge value={98} label="Resolution Rate" subtext="This Cycle" color="var(--primary)" />
          </div>
        </div>
      </section>

      {/* Fraud Alerts / Risky Documents Section */}
      <section className="mb-6" ref={fraudSectionRef}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span className="material-symbols-outlined text-error">gpp_maybe</span>
             {t('Fraud Alerts & Document Review', lang)}
          </h3>
          <button className="text-primary fw-bold text-sm bg-transparent border-none">
            {t('View All', lang)}
          </button>
        </div>
        <div className="flex-col gap-2">
          {MOCK_APPLICATIONS.filter(app => app.riskScore > 50).map((app, index) => (
            <div
              key={index}
              className="card"
              style={{ padding: '12px 16px', cursor: 'pointer', borderLeft: '4px solid var(--error)' }}
              onClick={() => setSelectedAppId(app.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="fw-bold text-sm">{app.farmerName}</div>
                  <div className="text-sm text-muted mt-1">{app.id} • {app.scheme}</div>
                  <div className="text-xs font-bold text-error mt-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                    {app.anomalyType}
                  </div>
                </div>
                <div className="flex-col items-end gap-1">
                  <span className="badge" style={{ background: '#ffebee', color: '#c62828', fontSize: '10px' }}>
                    {app.riskScore}% RISK
                  </span>
                  <button className="btn btn-outline btn-sm text-primary mt-2" style={{ padding: '2px 8px', fontSize: '10px' }}>
                     Review Document
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider my-6" style={{ borderTop: '2px dashed var(--border)' }}></div>

      {/* Map Section */}
      <section className="mb-6" ref={mapSectionRef}>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <TAOMap />
            <CAOMatrix />
         </div>
      </section>

      <div className="divider my-6" style={{ borderTop: '2px dashed var(--border)' }}></div>

      {/* Separate Grievance Section */}
      <section className="mb-6" ref={grievanceSectionRef}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span className="material-symbols-outlined" style={{ color: '#e65100' }}>forum</span>
             {t('Intelligent Grievances', lang)}
          </h3>
        </div>
        <div className="flex-col gap-3">
           {MOCK_GRIEVANCES.map(g => (
             <div key={g.id} className="card" style={{ padding: '16px', borderLeft: `4px solid ${g.sentiment === 'Critical' ? 'var(--error)' : 'var(--primary)'}` }}>
               <div className="flex justify-between items-start mb-2">
                 <div className="fw-bold">{g.farmerName} <span className="text-muted text-xs font-normal">({g.id})</span></div>
                 <span className="badge" style={{ background: g.sentiment === 'Critical' ? '#ffebee' : '#e3f2fd', color: g.sentiment === 'Critical' ? '#c62828' : '#0055A4', fontSize: '10px' }}>
                   {g.category}
                 </span>
               </div>
               <p className="text-sm text-muted italic mb-2">"{g.text}"</p>
               <div className="p-2 rounded bg-base text-xs" style={{ borderLeft: '2px solid var(--border)' }}>
                 <strong>AI Translation:</strong> {g.translated}
               </div>
               <div className="flex justify-end mt-3">
                 <button className="btn btn-sm text-primary" style={{ background: '#e3f2fd', border: 'none' }}>Route Ticket</button>
               </div>
             </div>
           ))}
        </div>
      </section>

    </div>
  );
};

export default TAODashboard;
