import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

import CircularGauge from '../../components/ui/CircularGauge';
import { fetchSummary } from '../../utils/api';

const SahayakDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const s = await fetchSummary();
        setSummary(s);
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

  const displayName = 'Sahayak Krushi Adhikari';
  const displayLocation = 'Assigned: 5 Villages';

  const statItems = [
    { icon: 'assignment',    label: 'Total Applications', value: summary?.total_applications,         color: '#033621', bg: 'rgba(3,54,33,0.06)', path: '/applications' },
    { icon: 'manage_search', label: 'Under Scrutiny',     value: summary?.by_status?.['Under Scrutiny'], color: '#B45309', bg: 'rgba(180,83,9,0.06)', path: '/applications' },
    { icon: 'priority_high', label: 'High Priority',      value: summary?.by_priority?.HIGH,          color: '#ba1a1a', bg: 'rgba(186,26,26,0.06)', path: '/applications' },
    { icon: 'warning',       label: 'Anomaly Alerts',     value: summary?.fraud_alerts,               color: '#4d2024', bg: 'rgba(77,32,36,0.06)', path: '/fraud-alerts' },
    { icon: 'check_circle',  label: 'Approved',           value: summary?.by_status?.Approved,        color: '#396940', bg: 'rgba(57,105,64,0.06)', path: '/applications' },
  ];

  const pendingAlerts = Number(summary?.fraud_alerts) || 0;

  const docIntelCards = [
    {
      icon: 'description',
      label: 'GR ASSISTANT',
      subtitle: 'Upload & understand GR documents',
      path: '/officer/gr-assistant',
      badgeNew: true,
      color: 'var(--primary)',
      bg: 'rgba(3,54,33,0.06)',
    },
    {
      icon: 'document_scanner',
      label: 'SCAN DOCUMENT',
      subtitle: 'Aadhaar • Satbara • Bank Passbook',
      path: '/officer/scan-document',
      color: 'var(--amber)',
      bg: 'rgba(180,83,9,0.06)',
    },
    {
      icon: 'verified_user',
      label: 'AI VERIFICATION',
      subtitle: 'View flagged anomalies',
      path: '/officer/ai-verification',
      color: 'var(--tertiary)',
      bg: 'rgba(77,32,36,0.06)',
      countBadge: pendingAlerts > 0 ? pendingAlerts : null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)', animation: 'fadeIn 0.4s ease' }}>
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

      {/* ── Document Intelligence (replaces Eligible Farmers block) ── */}
      <section style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>{t('Document Intelligence', lang)}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)' }}>
          {docIntelCards.map((item, i) => (
            <div
              key={i}
              className="quick-action-btn"
              onClick={() => navigate(item.path)}
              style={{ position: 'relative' }}
            >
              {item.badgeNew && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--success)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  NEW
                </span>
              )}
              {item.countBadge != null && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--error)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 800,
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.countBadge}
                </span>
              )}
              <div style={{
                width: '48px', height: '48px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: item.bg,
                color: item.color,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
              </div>
              <span className="quick-action-label">{item.label}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px', lineHeight: 1.35 }}>
                {item.subtitle}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SahayakDashboard;
