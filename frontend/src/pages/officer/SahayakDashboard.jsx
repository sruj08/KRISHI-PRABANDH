import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import CircularGauge from '../../components/ui/CircularGauge';
import InsightModal from '../../components/ui/InsightModal';
import { applicationsData } from '../../data/applications';

const getPriority = (app) => {
  const status = app.status || '';
  const remarks = app.remarks || '';
  if (status === 'Under Scrutiny' && remarks.includes('Field')) return 'HIGH';
  if (status === 'Applied') return 'MEDIUM';
  if (status === 'Rejected') return 'LOW';
  return 'NORMAL';
};

const getDaysSince = (dateStr) => {
  if (!dateStr) return 0;
  const parts = dateStr.split('-');
  const date = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((new Date() - date) / 86400000));
};

const SahayakDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState(null);

  const enriched = useMemo(() => applicationsData.map(app => ({
    ...app,
    priority: getPriority(app),
    daysSince: getDaysSince(app.application_date),
  })), []);

  // Summary stats from real data
  const totalApps = enriched.length;
  const underScrutinyCount = enriched.filter(a => a.status === 'Under Scrutiny').length;
  const highPriorityCount = enriched.filter(a => a.priority === 'HIGH').length;
  const fraudCount = enriched.filter(a => (a.rejection_reason || '').includes('Duplicate')).length;
  const approvedCount = enriched.filter(a => a.status === 'Approved').length;

  // Top 8 eligible farmers (Applied or Under Scrutiny), grouped by farmer_id
  const eligibleFarmers = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const app of enriched) {
      if ((app.status === 'Applied' || app.status === 'Under Scrutiny') && !seen.has(app.farmer_id)) {
        seen.add(app.farmer_id);
        result.push(app);
      }
      if (result.length >= 8) break;
    }
    return result;
  }, [enriched]);

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      {/* Welcome Banner */}
      <section>
        <h2 className="text-xl fw-bold text-success-dark">
          {t('Good Morning, Sahayak Krushi Adhikari Ramesh Patil', lang)}
        </h2>
        <p className="text-muted mt-1">{t('Assigned: 5 Villages', lang)}</p>
      </section>

      {/* Quick Action Grid */}
      <section className="quick-action-grid">
        <div className="quick-action-btn" onClick={() => navigate('/capture-photo')}>
          <div className="quick-action-icon blue"><span className="material-symbols-outlined">add_a_photo</span></div>
          <span className="quick-action-label">{t('Upload Photo', lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => navigate('/applications')}>
          <div className="quick-action-icon amber"><span className="material-symbols-outlined">post_add</span></div>
          <span className="quick-action-label">{t('Applications', lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => navigate('/advanced-tools')}>
          <div className="quick-action-icon green"><span className="material-symbols-outlined">groups</span></div>
          <span className="quick-action-label">{t('Eligible Farmers', lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => navigate('/visit-planner')}>
          <div className="quick-action-icon rose"><span className="material-symbols-outlined">directions_car</span></div>
          <span className="quick-action-label">{t("Today's Visits", lang)}</span>
        </div>
      </section>

      {/* Summary Stats (real data) */}
      <section>
        <h3 className="section-title">{t('Live Summary', lang)}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: 'assignment', label: 'Total Applications', value: totalApps, color: '#0055A4', bg: '#e3f2fd', onClick: () => navigate('/applications') },
            { icon: 'manage_search', label: 'Under Scrutiny', value: underScrutinyCount, color: '#e65100', bg: '#fff3e0', onClick: () => navigate('/applications') },
            { icon: 'priority_high', label: 'High Priority', value: highPriorityCount, color: '#c62828', bg: '#ffebee', onClick: () => navigate('/applications') },
            { icon: 'warning', label: 'Fraud Alerts', value: fraudCount, color: '#7b1fa2', bg: '#f3e5f5', onClick: () => navigate('/fraud-alerts') },
            { icon: 'check_circle', label: 'Approved', value: approvedCount, color: '#2e7d32', bg: '#e8f5e9', onClick: () => navigate('/applications') },
          ].map((item, i) => (
            <div
              key={i}
              className="card"
              style={{ background: item.bg, border: `1px solid ${item.color}22`, padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              onClick={item.onClick}
            >
              <span className="material-symbols-outlined" style={{ color: item.color, fontSize: '28px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: item.color, opacity: 0.8, marginTop: '2px' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* District Impact Pulse */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t('District Impact Pulse', lang)}</h3>
          <button className="btn btn-outline btn-sm text-primary" onClick={() => navigate('/advanced-tools')}>
            {t('Full View', lang)}
          </button>
        </div>
        <div className="glass-panel">
          <div style={{ display: 'flex', overflowX: 'auto', gap: 'var(--sp-6)', paddingBottom: 'var(--sp-2)' }}>
            <CircularGauge value={85} label="Equity Index" subtext="SC/ST/Women Funds" color="var(--primary)" />
            <CircularGauge value={92} label="Purified Queue" subtext="AI Scrutinized" color="var(--success)" />
            <CircularGauge value={4250000} label="Wealth Delivered" subtext="Subsidies this Month" isCurrency />
          </div>
        </div>
      </section>

      {/* Eligible Farmers (Simulated) */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t('Eligible Farmers (Simulated)', lang)}</h3>
          <button className="text-primary fw-bold text-sm bg-transparent border-none" onClick={() => navigate('/applications')}>
            {t('View All', lang)}
          </button>
        </div>
        <div className="flex-col gap-2">
          {eligibleFarmers.length === 0 && (
            <div className="text-center text-muted p-4">No eligible farmers found.</div>
          )}
          {eligibleFarmers.map((app, index) => (
            <div
              key={index}
              className="card"
              style={{ padding: '12px 16px', cursor: 'pointer', borderLeft: `4px solid ${app.priority === 'HIGH' ? '#ef5350' : '#42a5f5'}` }}
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="fw-bold text-sm">{app.farmer_id || '—'}</div>
                  <div className="text-sm text-muted mt-1">{app.component || '—'}</div>
                  <div className="text-xs text-muted">{app.scheme_name || '—'}</div>
                </div>
                <div className="flex-col items-end gap-1">
                  <span className="badge badge-grey" style={{ fontSize: '10px' }}>{app.scheme_category || '—'}</span>
                  <span className="text-xs text-muted mt-1">{app.remarks || 'No remarks'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SahayakDashboard;
