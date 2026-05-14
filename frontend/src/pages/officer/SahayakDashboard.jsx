import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  MOCK_SUMMARY, MOCK_TASKS, MOCK_FARMERS,
  MOCK_RECENT_ACTIVITY, MOCK_NOTIFICATIONS, MOCK_GRAM_SABHA,
} from '../../mock/sahayak-mock';
import './SahayakDashboard.css';

// ── Speed Dial Component ──────────────────────────────────────────────────────
const SpeedDial = ({ navigate }) => {
  const [open, setOpen] = useState(false);
  const actions = [
    { icon: 'post_add',        label: 'New Application', path: '/applications',        color: '#1f4d36' },
    { icon: 'add_a_photo',     label: 'Upload Photo',    path: '/capture-photo',        color: '#B45309' },
    { icon: 'person_add',      label: 'Add Farmer',      path: '/farmers',              color: '#396940' },
    { icon: 'document_scanner',label: 'Scan Document',   path: '/officer/scan-document',color: '#4d2024' },
  ];
  return (
    <div className="sd-container" aria-label="Quick actions">
      {open && (
        <div className="sd-backdrop" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="sd-actions">
          {actions.map((a) => (
            <button
              key={a.path}
              className="sd-item"
              onClick={() => { setOpen(false); navigate(a.path); }}
              aria-label={a.label}
            >
              <span className="sd-item-label">{a.label}</span>
              <div className="sd-item-btn" style={{ background: a.color }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>{a.icon}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        className={`sd-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Quick actions"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#fff' }}>
          {open ? 'close' : 'add'}
        </span>
      </button>
    </div>
  );
};

// ── Global Search Bar ─────────────────────────────────────────────────────────
const GlobalSearch = ({ farmers, navigate }) => {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    const s = q.toLowerCase();
    return farmers.filter(f =>
      f.name?.toLowerCase().includes(s) ||
      f.village?.toLowerCase().includes(s) ||
      f.application_id?.toLowerCase().includes(s) ||
      f.aadhaar_last4?.includes(s) ||
      f.farmer_id?.toLowerCase().includes(s)
    ).slice(0, 5);
  }, [q, farmers]);

  const statusColor = (s) =>
    s === 'Approved' ? '#396940' : s === 'Rejected' ? '#ba1a1a' : '#B45309';

  return (
    <div className="gs-wrap">
      <div className="gs-box">
        <span className="material-symbols-outlined gs-icon">search</span>
        <input
          className="gs-input"
          placeholder="Search farmer, village, application ID, Aadhaar…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
        />
        {q && (
          <button className="gs-clear" onClick={() => setQ('')} aria-label="Clear">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        )}
      </div>
      {focused && results.length > 0 && (
        <div className="gs-results">
          {results.map(f => (
            <button
              key={f.farmer_id}
              className="gs-result-row"
              onMouseDown={() => navigate('/officer/eligibility')}
            >
              <div className="gs-result-avatar">{f.name[0]}</div>
              <div className="gs-result-info">
                <span className="gs-result-name">{f.name}</span>
                <span className="gs-result-sub">{f.village} · {f.application_id}</span>
              </div>
              <span className="gs-result-status" style={{ color: statusColor(f.app_status) }}>
                {f.app_status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SahayakDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.name?.split(' ')[0] || 'Sahayak';
  const location = user?.taluka_name && user?.district_name
    ? `${user.taluka_name} · ${user.district_name}`
    : 'Baramati · Pune';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const summary = MOCK_SUMMARY;
  const tasks = MOCK_TASKS;
  const recentFarmers = MOCK_FARMERS.slice(0, 3);
  const pendingCount = summary.by_status['Under Scrutiny'];
  const alertCount  = summary.fraud_alerts;
  const approvedCount = summary.by_status.Approved;
  const verifyCount = summary.verification_pending;

  const priorityColor = (p) =>
    p === 'HIGH' ? '#ba1a1a' : p === 'MEDIUM' ? '#B45309' : '#717972';

  const statusColor = (s) =>
    s === 'Approved' ? '#396940' : s === 'Rejected' ? '#ba1a1a' : '#B45309';

  const statusBg = (s) =>
    s === 'Approved' ? 'rgba(57,105,64,0.1)' : s === 'Rejected' ? 'rgba(186,26,26,0.08)' : 'rgba(180,83,9,0.08)';

  const todayGS = MOCK_GRAM_SABHA.find(g => g.date === new Date().toISOString().slice(0,10) || g.status === 'SCHEDULED');

  return (
    <div className="sahayak-page">

      {/* ── Global Search ── */}
      <div className="sahayak-search-bar">
        <GlobalSearch farmers={MOCK_FARMERS} navigate={navigate} />
      </div>

      {/* ── Greeting ── */}
      <div className="sahayak-greeting">
        <div>
          <p className="greeting-line">{greeting}, <strong>{displayName}</strong> 👋</p>
          <p className="greeting-loc">
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 3 }}>location_on</span>
            {location}
          </p>
        </div>
        {todayGS && (
          <button className="greeting-gs-chip" onClick={() => navigate('/gram-sabha')}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
            Sabha {todayGS.time}
          </button>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <section className="sahayak-section">
        <div className="quick-grid">
          {[
            { icon: 'add_a_photo',    label: 'Upload\nPhoto',    path: '/capture-photo',          color: '#1f4d36', bg: 'rgba(3,54,33,0.07)' },
            { icon: 'post_add',       label: 'New\nApplication', path: '/applications',            color: '#B45309', bg: 'rgba(180,83,9,0.07)' },
            { icon: 'directions_car', label: 'Field\nVisit',     path: '/officer/field-verification', color: '#396940', bg: 'rgba(57,105,64,0.07)' },
            { icon: 'diversity_3',    label: 'Gram\nSabha',      path: '/gram-sabha',              color: '#4d2024', bg: 'rgba(77,32,36,0.07)', special: true },
            { icon: 'satellite_alt', label: 'Survey\nQueue',    path: '/survey',                  color: '#1f4d36', bg: 'rgba(31,77,54,0.07)' },
          ].map((item, i) => (
            <button
              key={i}
              className={`qa-card ${item.special ? 'qa-card--special' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ '--qa-color': item.color, '--qa-bg': item.bg }}
            >
              <div className="qa-icon-wrap">
                <span className="material-symbols-outlined qa-icon">{item.icon}</span>
              </div>
              <span className="qa-label" style={{ whiteSpace: 'pre-line' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Today's Status Strip ── */}
      <section className="sahayak-section">
        <div className="status-strip">
          {[
            { label: 'Pending',     value: pendingCount, icon: 'pending_actions', color: '#B45309', path: '/applications?status=pending' },
            { label: 'Verify',      value: verifyCount,  icon: 'fact_check',      color: '#1f4d36', path: '/officer/field-verification' },
            { label: 'Alerts',      value: alertCount,   icon: 'gpp_bad',         color: '#ba1a1a', path: '/officer/ai-verification' },
            { label: 'Approved',    value: approvedCount,icon: 'check_circle',    color: '#396940', path: '/applications?status=approved' },
            { label: 'Surveys',    value: pendingCount, icon: 'satellite_alt',   color: '#1f4d36', path: '/survey' },
          ].map((item, i) => (
            <button key={i} className="status-pill" onClick={() => navigate(item.path)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: item.color }}>{item.icon}</span>
              <span className="status-pill-value" style={{ color: item.color }}>{item.value}</span>
              <span className="status-pill-label">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Priority Tasks ── */}
      <section className="sahayak-section">
        <div className="section-hdr">
          <h2 className="section-title" style={{ margin: 0 }}>{t("Today's Tasks", lang)}</h2>
          <span className="task-count-badge">{tasks.length}</span>
        </div>
        <div className="task-feed">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">task_alt</span>
              <p className="empty-title">All caught up!</p>
              <p className="empty-sub">No pending tasks for today.</p>
            </div>
          ) : tasks.map((task) => (
            <button key={task.id} className="task-row" onClick={() => navigate(task.route)}>
              <span
                className="task-dot"
                style={{ background: priorityColor(task.priority) }}
              />
              <div className="task-icon-wrap" style={{ background: `${priorityColor(task.priority)}12` }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: priorityColor(task.priority) }}>
                  {task.icon}
                </span>
              </div>
              <div className="task-text">
                <span className="task-title">{task.title}</span>
                {task.time && <span className="task-time">{task.time}</span>}
              </div>
              <span className="material-symbols-outlined task-chevron">chevron_right</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Recent Farmers ── */}
      <section className="sahayak-section">
        <div className="section-hdr">
          <h2 className="section-title" style={{ margin: 0 }}>{t('Recent Farmers', lang)}</h2>
          <button className="view-all-btn" onClick={() => navigate('/officer/eligibility')}>
            {t('View All', lang)}
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          </button>
        </div>
        <div className="farmer-list">
          {recentFarmers.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">group</span>
              <p className="empty-title">No farmers yet</p>
              <p className="empty-sub">Add farmers from the registry.</p>
            </div>
          ) : recentFarmers.map((f) => (
            <div key={f.farmer_id} className="farmer-row">
              <div className="farmer-avatar" style={{ background: 'rgba(31,77,54,0.1)', color: '#1f4d36' }}>
                {f.name[0]}
              </div>
              <div className="farmer-info">
                <span className="farmer-name">{f.name}</span>
                <span className="farmer-sub">{f.village} · {f.crop}</span>
              </div>
              <span
                className="farmer-status"
                style={{ color: statusColor(f.app_status), background: statusBg(f.app_status) }}
              >
                {f.app_status === 'Under Scrutiny' ? 'Pending' : f.app_status}
              </span>
              <button
                className="farmer-action-btn"
                onClick={() => navigate('/officer/field-verification')}
                aria-label="Verify"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Speed Dial FAB ── */}
      <SpeedDial navigate={navigate} />
    </div>
  );
};

export default SahayakDashboard;
