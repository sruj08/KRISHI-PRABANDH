import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import CircularGauge from '../../components/ui/CircularGauge';
import InsightModal from '../../components/ui/InsightModal';
import { fetchSummary, fetchEligibleFarmers, fetchApplication } from '../../utils/api';

// Fallback to static data if API is unavailable
import { applicationsData } from '../../data/applications';

const getDaysSince = (dateStr) => {
  if (!dateStr) return 0;
  const parts = dateStr.split('-');
  const date = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((new Date() - date) / 86400000));
};

const getPriority = (app) => {
  const status = app.status || '';
  const remarks = app.remarks || '';
  if (status === 'Under Scrutiny' && remarks.includes('Field')) return 'HIGH';
  if (status === 'Applied') return 'MEDIUM';
  if (status === 'Rejected') return 'LOW';
  return 'NORMAL';
};

const SahayakDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState(null);
  const [summary, setSummary] = useState(null);
  const [eligibleFarmers, setEligibleFarmers] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, e] = await Promise.all([fetchSummary(), fetchEligibleFarmers(8)]);
        setSummary(s);
        setEligibleFarmers(e.results || []);
        setApiOnline(true);
      } catch {
        // Fallback to static data
        const enriched = applicationsData.map(a => ({ ...a, priority: getPriority(a) }));
        const seen = new Set(); const grouped = [];
        for (const a of enriched) {
          if ((a.status === 'Applied' || a.status === 'Under Scrutiny') && !seen.has(a.farmer_id)) {
            seen.add(a.farmer_id); grouped.push(a);
          }
          if (grouped.length >= 8) break;
        }
        setEligibleFarmers(grouped);
        setSummary({
          total_applications: applicationsData.length,
          by_status: {
            Applied: enriched.filter(a => a.status === 'Applied').length,
            'Under Scrutiny': enriched.filter(a => a.status === 'Under Scrutiny').length,
            Approved: enriched.filter(a => a.status === 'Approved').length,
            Rejected: enriched.filter(a => a.status === 'Rejected').length,
          },
          by_priority: {
            HIGH: enriched.filter(a => a.priority === 'HIGH').length,
            MEDIUM: enriched.filter(a => a.priority === 'MEDIUM').length,
            NORMAL: enriched.filter(a => a.priority === 'NORMAL').length,
            LOW: enriched.filter(a => a.priority === 'LOW').length,
          },
          fraud_alerts: enriched.filter(a => (a.rejection_reason || '').toLowerCase().includes('duplicate')).length,
        });
        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFarmerClick = async (app) => {
    if (apiOnline) {
      try {
        const full = await fetchApplication(app.application_id);
        setSelectedApp({ ...full, priority: getPriority(full), daysSince: getDaysSince(full.application_date) });
        return;
      } catch { /* fallback below */ }
    }
    setSelectedApp({ ...app, priority: getPriority(app), daysSince: getDaysSince(app.application_date) });
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      {/* Welcome Banner */}
      <section>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl fw-bold text-success-dark">
              {t('Good Morning, Sahayak Krushi Adhikari Ramesh Patil', lang)}
            </h2>
            <p className="text-muted mt-1">{t('Assigned: 5 Villages', lang)}</p>
          </div>
          <span className={`badge ${apiOnline ? 'badge-verified' : 'badge-grey'}`} style={{ fontSize: '10px', marginTop: '4px' }}>
            {apiOnline ? '🟢 API Live' : '🟡 Offline Mode'}
          </span>
        </div>
      </section>

      {/* Quick Actions */}
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

      {/* Live Summary */}
      <section>
        <h3 className="section-title">{t('Live Summary', lang)}</h3>
        {loading ? (
          <div className="text-muted text-sm p-4 text-center">Loading data...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: 'assignment',     label: 'Total Applications', value: summary?.total_applications,         color: '#0055A4', bg: '#e3f2fd', path: '/applications' },
              { icon: 'manage_search',  label: 'Under Scrutiny',     value: summary?.by_status?.['Under Scrutiny'], color: '#e65100', bg: '#fff3e0', path: '/applications' },
              { icon: 'priority_high',  label: 'High Priority',      value: summary?.by_priority?.HIGH,          color: '#c62828', bg: '#ffebee', path: '/applications' },
              { icon: 'warning',        label: 'Fraud Alerts',       value: summary?.fraud_alerts,               color: '#7b1fa2', bg: '#f3e5f5', path: '/fraud-alerts' },
              { icon: 'check_circle',   label: 'Approved',           value: summary?.by_status?.Approved,        color: '#2e7d32', bg: '#e8f5e9', path: '/applications' },
            ].map((item, i) => (
              <div
                key={i}
                className="card"
                style={{ background: item.bg, border: `1px solid ${item.color}22`, padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => navigate(item.path)}
              >
                <span className="material-symbols-outlined" style={{ color: item.color, fontSize: '28px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value ?? '—'}</div>
                  <div style={{ fontSize: '11px', color: item.color, opacity: 0.8, marginTop: '2px' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <CircularGauge value={summary?.by_priority?.HIGH ?? 0}         label="High Priority"   subtext="Needs Action"      color="var(--error)" />
            <CircularGauge value={summary?.by_status?.['Under Scrutiny'] ?? 0} label="Under Scrutiny" subtext="Being Processed"  color="var(--primary)" />
            <CircularGauge value={summary?.by_status?.Approved ?? 0}       label="Approved"        subtext="This Cycle"        color="var(--success)" />
          </div>
        </div>
      </section>

      {/* Eligible Farmers */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t('Eligible Farmers (Simulated)', lang)}</h3>
          <button className="text-primary fw-bold text-sm bg-transparent border-none" onClick={() => navigate('/applications')}>
            {t('View All', lang)}
          </button>
        </div>
        <div className="flex-col gap-2">
          {eligibleFarmers.length === 0 && !loading && (
            <div className="text-center text-muted p-4">No eligible farmers found.</div>
          )}
          {eligibleFarmers.map((app, index) => (
            <div
              key={index}
              className="card"
              style={{ padding: '12px 16px', cursor: 'pointer', borderLeft: `4px solid ${getPriority(app) === 'HIGH' ? '#ef5350' : '#42a5f5'}` }}
              onClick={() => handleFarmerClick(app)}
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
