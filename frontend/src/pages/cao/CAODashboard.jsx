import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ActionMap from './components/ActionMap';
import TriageQueue from './components/TriageQueue';
import ShopTracker from './components/ShopTracker';
import SahayakMatrix from './components/SahayakMatrix';
import PMFBYPanel from './components/PMFBYPanel';
import {
  CAO_PROFILE, DASHBOARD_KPIS, TRIAGE_QUEUE,
  SAHAYAKS, PMFBY_EVENTS
} from '../../utils/caoMockData';
import './cao.css';

const CAODashboard = () => {
  const [pmfbyOpen, setPmfbyOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const kpiItems = [
    { label: 'Pending Files', value: DASHBOARD_KPIS.total_pending, icon: 'pending_actions', color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Red Alerts', value: DASHBOARD_KPIS.red_queue, icon: 'gpp_bad', color: 'var(--error)', bg: 'var(--error-light)' },
    { label: 'Fraud Prevented', value: DASHBOARD_KPIS.fraud_prevented, icon: 'security', color: 'var(--success)', bg: 'var(--success-light)' },
    { label: 'Shops Overdue', value: DASHBOARD_KPIS.shops_overdue, icon: 'store_alert', color: 'var(--amber)', bg: 'var(--amber-light)' },
    { label: 'PMFBY Claims', value: DASHBOARD_KPIS.pmfby_pending, icon: 'grain', color: '#8e24aa', bg: '#f3e5f5' },
    { label: 'Avg Approval', value: `${DASHBOARD_KPIS.avg_approval_days}d`, icon: 'timer', color: 'var(--success-dark)', bg: 'var(--success-light)' },
  ];

  return (
    <div className="cao-root">
      {/* ── Header ── */}
      <header style={{ padding: 'var(--sp-4)', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold' }}>KrishiNetra - CAO Intelligence Dashboard</h1>
          <span style={{ fontSize: '12px', opacity: 0.8, borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
            {CAO_PROFILE.mandal}, {CAO_PROFILE.district}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <button className="cao-pmfby-btn" onClick={() => setPmfbyOpen(true)}>
            <span className="material-symbols-outlined">satellite_alt</span>
            PMFBY Disaster Triage
            <span className="cao-pmfby-badge">{PMFBY_EVENTS.length}</span>
          </button>
          <div style={{ fontSize: '14px', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '16px' }}>
            {user?.name || CAO_PROFILE.name}
          </div>
          <button className="btn-outline btn-sm text-white" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <div className="cao-kpi-strip">
        {kpiItems.map((k, i) => (
          <div className="cao-kpi-card" key={i} style={{ '--kpi-color': k.color, '--kpi-bg': k.bg }}>
            <span className="material-symbols-outlined cao-kpi-icon">{k.icon}</span>
            <div>
              <div className="cao-kpi-value">{k.value}</div>
              <div className="cao-kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 2×2 Grid ── */}
      <div className="cao-grid">
        {/* Top-Left: Action Map */}
        <div className="cao-panel cao-panel--map">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">map</span>
            <span>Mandal Action Map — {CAO_PROFILE.jurisdiction}</span>
            <span className="cao-panel-badge green">Live</span>
          </div>
          <ActionMap />
        </div>

        {/* Top-Right: Triage Queue */}
        <div className="cao-panel cao-panel--triage">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">order_approve</span>
            <span>Mahabhulekh AI Triage Queue</span>
            <span className="cao-panel-badge red">{DASHBOARD_KPIS.red_queue} Alerts</span>
          </div>
          <TriageQueue queue={TRIAGE_QUEUE} />
        </div>

        {/* Bottom-Left: Shop Tracker */}
        <div className="cao-panel cao-panel--shops">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">storefront</span>
            <span>Krushi Seva Kendra Inspection Tracker</span>
            <span className="cao-panel-badge amber">{DASHBOARD_KPIS.shops_overdue} Overdue</span>
          </div>
          <ShopTracker />
        </div>

        {/* Bottom-Right: Sahayak Matrix */}
        <div className="cao-panel cao-panel--sahayak">
          <div className="cao-panel-header">
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Krishi Sahayak Accountability Matrix</span>
            <span className="cao-panel-badge orange">{DASHBOARD_KPIS.sahayaks_critical} Critical</span>
          </div>
          <SahayakMatrix sahayaks={SAHAYAKS} />
        </div>
      </div>

      {/* ── PMFBY Overlay ── */}
      {pmfbyOpen && (
        <PMFBYPanel events={PMFBY_EVENTS} onClose={() => setPmfbyOpen(false)} />
      )}
    </div>
  );
};

export default CAODashboard;
