import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';

import CircularGauge from '../../components/ui/CircularGauge';
import InsightModal from '../../components/ui/InsightModal';
import { fetchSummary, fetchEligibleFarmers, fetchApplication } from '../../utils/api';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Build farmer “application” cards from CSV dataset for this Krushi Sahayak when API returns nothing */
function buildDatasetFarmersForSahayak(user, officers, farmerProfiles, villages) {
  if (!user?.user_id || !officers?.length) return [];
  const uid = num(user.user_id);
  const villageById = Object.fromEntries(
    (villages || []).map((v) => [String(v.village_id), v.name || '']),
  );
  const profileByUserId = Object.fromEntries(
    (farmerProfiles || []).map((p) => [String(p.user_id), p]),
  );

  let farmers = officers.filter(
    (o) => o.appRole === 'farmer' && num(o.reports_to_user_id) === uid,
  );
  if (!farmers.length && user.circle_id != null) {
    farmers = officers.filter(
      (o) => o.appRole === 'farmer' && num(o.circle_id) === num(user.circle_id),
    );
  }
  if (!farmers.length && user.taluka_id != null) {
    farmers = officers.filter(
      (o) => o.appRole === 'farmer' && num(o.taluka_id) === num(user.taluka_id),
    );
  }
  if (!farmers.length && user.district_id != null) {
    farmers = officers.filter(
      (o) => o.appRole === 'farmer' && num(o.district_id) === num(user.district_id),
    );
  }

  return farmers.slice(0, 80).map((o) => {
    const p = profileByUserId[String(o.user_id)];
    const kyc = p?.kyc_status || 'PENDING';
    const status =
      kyc === 'VERIFIED' ? 'Approved' : kyc === 'REJECTED' ? 'Rejected' : 'Under Scrutiny';
    const villageName =
      (o.village_id != null && villageById[String(o.village_id)]) ||
      (p?.village_id != null && villageById[String(p.village_id)]) ||
      `Village ref ${p?.village_id ?? o.village_id ?? '—'}`;
    return {
      application_id: `csv-farmer-${o.user_id}`,
      farmer_id: p?.farmer_id_external || o.name || `User ${o.user_id}`,
      farmer_name: o.label || o.name,
      component: villageName,
      scheme_name: 'Registry (CSV) — linked to your circle / taluka',
      scheme_category: `KYC ${kyc}`,
      remarks: [o.email, user.district_name && `District: ${user.district_name}`]
        .filter(Boolean)
        .join(' · '),
      status,
      application_date: '2026-04-15',
      _fromDataset: true,
    };
  });
}

function buildDatasetSummary(rows) {
  const byStatus = { Approved: 0, Rejected: 0, 'Under Scrutiny': 0 };
  for (const r of rows) {
    if (r.status === 'Approved') byStatus.Approved += 1;
    else if (r.status === 'Rejected') byStatus.Rejected += 1;
    else byStatus['Under Scrutiny'] += 1;
  }
  const high = rows.filter((r) => r.status === 'Under Scrutiny').length;
  return {
    total_applications: rows.length,
    by_status: byStatus,
    by_priority: {
      HIGH: Math.min(high, Math.max(1, Math.ceil(rows.length * 0.15))),
      MEDIUM: Math.ceil(rows.length * 0.25),
      LOW: Math.max(0, rows.length - high),
    },
    fraud_alerts: Math.min(5, Math.ceil(rows.length * 0.02)),
  };
}


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
  const { user } = useAuth();
  const { officers, farmerProfiles, villages } = useKrishiData();

  const csvFarmers = useMemo(
    () => buildDatasetFarmersForSahayak(user, officers, farmerProfiles, villages),
    [user, officers, farmerProfiles, villages],
  );

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
        const apiRows = e?.results || [];
        setSummary(s);
        setEligibleFarmers(apiRows);
        setApiOnline(true);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setApiOnline(false);
        setSummary(null);
        setEligibleFarmers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /** When API returns no rows, show farmers from merged CSV (same sahayak / circle / taluka) */
  useEffect(() => {
    if (loading) return;
    if (eligibleFarmers.length > 0) return;
    if (!csvFarmers.length) return;
    setEligibleFarmers(csvFarmers);
    setSummary((prev) => prev || buildDatasetSummary(csvFarmers));
  }, [loading, eligibleFarmers.length, csvFarmers]);

  const handleFarmerClick = async (app) => {
    if (app._fromDataset || String(app.application_id || '').startsWith('csv-farmer-')) {
      setSelectedApp({
        ...app,
        priority: getPriority(app),
        daysSince: getDaysSince(app.application_date),
      });
      return;
    }
    try {
      const full = await fetchApplication(app.application_id);
      setSelectedApp({ ...full, priority: getPriority(full), daysSince: getDaysSince(full.application_date) });
    } catch (error) {
      console.error('Failed to load application:', error);
      setSelectedApp({ ...app, priority: getPriority(app), daysSince: getDaysSince(app.application_date) });
    }
  };

  const displayName = user?.name || 'Sahayak Krushi Adhikari';
  const displayLocation =
    user?.district_name && user?.taluka_name
      ? `${user.district_name} · ${user.taluka_name}`
      : 'Assigned villages (CSV scope)';

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
            {apiOnline ? 'API Live' : eligibleFarmers.some((f) => f._fromDataset) ? 'CSV roster' : 'Offline Mode'}
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
              No farmers linked to this sahayak in the CSV (check <strong>reports_to_user_id</strong> / circle / taluka).
            </div>
          )}
          {eligibleFarmers.map((app, index) => (
            <div
              key={app.application_id || index}
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
                    {app.farmer_name || app.farmer_id || '—'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    ID: {app.farmer_id || '—'}
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
