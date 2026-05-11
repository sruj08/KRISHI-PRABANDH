import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

import CircularGauge from '../../components/ui/CircularGauge';
import InsightModal from '../../components/ui/InsightModal';
import { fetchSummary, fetchEligibleFarmers, fetchApplication } from '../../utils/api';


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
      setLoading(true);
      try {
        const [s, e] = await Promise.all([fetchSummary(), fetchEligibleFarmers(8)]);
        setSummary(s);
        setEligibleFarmers(e.results || []);
        setApiOnline(true);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFarmerClick = async (app) => {
    try {
      const full = await fetchApplication(app.application_id);
      setSelectedApp({ ...full, priority: getPriority(full), daysSince: getDaysSince(full.application_date) });
    } catch (error) {
      console.error('Failed to load application:', error);
      setSelectedApp({ ...app, priority: getPriority(app), daysSince: getDaysSince(app.application_date) });
    }
  };

  const displayName = 'Sahayak Krushi Adhikari';
  const displayLocation = 'Assigned: 5 Villages';

  const statItems = [
    { icon: 'assignment',    label: 'Total Applications', value: summary?.total_applications,         color: '#033621', bg: 'rgba(3,54,33,0.06)', path: '/applications' },
    { icon: 'manage_search', label: 'Under Scrutiny',     value: summary?.by_status?.['Under Scrutiny'], color: '#B45309', bg: 'rgba(180,83,9,0.06)', path: '/applications' },
    { icon: 'priority_high', label: 'High Priority',      value: summary?.by_priority?.HIGH,          color: '#ba1a1a', bg: 'rgba(186,26,26,0.06)', path: '/applications' },
    { icon: 'warning',       label: 'Anomaly Alerts',     value: summary?.fraud_alerts,               color: '#4d2024', bg: 'rgba(77,32,36,0.06)', path: '/fraud-alerts' },
    { icon: 'check_circle',  label: 'Approved',           value: summary?.by_status?.Approved,        color: '#396940', bg: 'rgba(57,105,64,0.06)', path: '/applications' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)', animation: 'fadeIn 0.4s ease' }}>
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      {/* ── Header ── */}
      <header className="cao-header" style={{ marginLeft: '-var(--sp-6)', marginRight: '-var(--sp-6)', marginTop: '-var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div className="cao-header-left">
          <div className="logo-text">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginRight: '8px', fontSize: '24px' }}>public</span>
            Krishi Prabandh - Sahayak
          </div>
        </div>

        <div className="cao-header-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', gap: '16px' }}>
          <span>{t(displayLocation, lang)}</span> • 
          <span>{t(displayName, lang)}</span>
        </div>

        <div className="cao-header-right">
          <span className="badge badge-verified" style={{ fontSize: '11px', marginRight: '8px' }}>
            {apiOnline ? 'API Live' : 'Offline Mode'}
          </span>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>notifications</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>settings</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-dark)', cursor: 'pointer' }}>
            S
          </div>
        </div>
      </header>

      {/* ── Quick Actions ── */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)' }}>
          {[
            { icon: 'add_a_photo',    label: t('Upload Photo', lang),    path: '/capture-photo',  color: 'var(--primary)',  bg: 'rgba(3,54,33,0.06)' },
            { icon: 'post_add',       label: t('Applications', lang),    path: '/applications',   color: 'var(--amber)',    bg: 'rgba(180,83,9,0.06)' },
            { icon: 'groups',         label: t('Eligible Farmers', lang),path: '/advanced-tools', color: 'var(--success)',  bg: 'rgba(57,105,64,0.06)' },
            { icon: 'directions_car', label: t("Today's Visits", lang), path: '/visit-planner',  color: 'var(--tertiary)', bg: 'rgba(77,32,36,0.06)' },
            { icon: 'gpp_bad',        label: t('Anomaly Alerts', lang),  path: '/fraud-alerts',   color: 'var(--tertiary)', bg: 'rgba(77,32,36,0.06)' },
            { icon: 'qr_code_2',      label: 'Gram Sabha',              path: '/gram-sabha',     color: 'var(--primary)',  bg: 'var(--primary)', special: true },
          ].map((item, i) => (
            <div
              key={i}
              className="quick-action-btn"
              onClick={() => navigate(item.path)}
              style={item.special ? {
                border: '2px solid var(--primary)',
                background: 'rgba(3,54,33,0.04)',
              } : {}}
            >
              <div style={{
                width: '48px', height: '48px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: item.special ? 'var(--primary)' : item.bg,
                color: item.special ? 'white' : item.color,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
              </div>
              <span className="quick-action-label" style={item.special ? { color: 'var(--primary)', fontWeight: 800 } : {}}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Summary ── */}
      <section style={{ margin: '0 -var(--sp-6) var(--sp-6)' }}>
        {loading ? (
          <div style={{
            textAlign: 'center', padding: 'var(--sp-8)',
            color: 'var(--text-muted)', fontFamily: 'var(--font-data)', fontSize: 'var(--font-size-sm)',
          }}>
            Loading data...
          </div>
        ) : (
          <div className="cao-kpi-strip" style={{ borderTop: '1px solid var(--outline-card)', borderBottom: '1px solid var(--outline-card)' }}>
            {statItems.map((item, i) => (
              <div
                key={i}
                className="kpi-card-stitch"
                onClick={() => navigate(item.path)}
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-card-header">
                  <span className="material-symbols-outlined" style={{ color: item.color }}>{item.icon}</span> 
                  <span style={{ color: item.color }}>{item.label}</span>
                </div>
                <div className="kpi-card-value" style={{ color: item.color }}>
                  {item.value ?? '—'}
                </div>
                <div className="kpi-card-footer" style={{ color: 'var(--text-muted)' }}>
                  Active
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── District Impact Pulse ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>{t('District Impact Pulse', lang)}</h3>
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--primary)' }} onClick={() => navigate('/advanced-tools')}>
            {t('Full View', lang)}
          </button>
        </div>
        <div className="glass-panel">
          <div style={{ display: 'flex', overflowX: 'auto', gap: 'var(--sp-8)', paddingBottom: 'var(--sp-2)' }}>
            <CircularGauge value={summary?.by_priority?.HIGH ?? 0}         label="High Priority"   subtext="Needs Action"      color="var(--error)" />
            <CircularGauge value={summary?.by_status?.['Under Scrutiny'] ?? 0} label="Under Scrutiny" subtext="Being Processed"  color="var(--primary)" />
            <CircularGauge value={summary?.by_status?.Approved ?? 0}       label="Approved"        subtext="This Cycle"        color="var(--success)" />
          </div>
        </div>
      </section>

      {/* ── Eligible Farmers ── */}
      <section style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>{t('Eligible Farmers', lang)}</h3>
          <button
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--primary)', fontFamily: 'var(--font-data)',
              fontSize: 'var(--font-size-xs)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/applications')}
          >
            {t('View All', lang)}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {eligibleFarmers.length === 0 && !loading && (
            <div style={{
              textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--sp-6)',
              fontFamily: 'var(--font-data)', fontSize: 'var(--font-size-sm)',
            }}>
              No eligible farmers found.
            </div>
          )}
          {eligibleFarmers.map((app, index) => (
            <div
              key={index}
              className="card"
              style={{
                padding: 'var(--sp-4) var(--sp-5)', cursor: 'pointer',
                borderLeft: `4px solid ${getPriority(app) === 'HIGH' ? 'var(--error)' : 'var(--primary)'}`,
              }}
              onClick={() => handleFarmerClick(app)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)' }}>
                    {app.farmer_id || '—'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {app.component || '—'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {app.scheme_name || '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="badge badge-grey" style={{ fontSize: '10px' }}>{app.scheme_category || '—'}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {app.remarks || 'No remarks'}
                  </span>
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
