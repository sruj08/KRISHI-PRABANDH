import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { fetchReports } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';
import { MOCK_TASKS, MOCK_FARMERS, MOCK_SUMMARY, MOCK_GRAM_SABHA } from '../../mock/sahayak-mock';

const PANEL = '#e2e3df';
const TEXT = '#1a1c1a';
const MUTED = '#717972';
const BG = '#f3f4f0';
const WHITE = '#ffffff';

const KpiCard = ({ icon, label, value, color, onClick }) => (
  <div onClick={onClick} style={{ background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100, boxShadow: '0 1px 3px rgba(0,0,0,.04)', cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color || '#1f4d36'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: color || '#1f4d36' }}>{icon}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED }}>{label}</span>
    </div>
    <span style={{ fontSize: 24, fontWeight: 800, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{value ?? '—'}</span>
  </div>
);

const SectionHeader = ({ title, count, onViewAll, viewAllLabel }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{title}</span>
      {count != null && <span style={{ fontSize: 10, fontWeight: 700, background: '#1f4d3618', color: '#1f4d36', padding: '2px 8px', borderRadius: 999 }}>{count}</span>}
    </div>
    {onViewAll && (
      <button onClick={onViewAll} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#1f4d36', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
        {viewAllLabel || 'View All'}
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
      </button>
    )}
  </div>
);

const SahayakDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.name?.split(' ')[0] || 'Sahayak';
  const location = user?.taluka_name && user?.district_name ? `${user.taluka_name} · ${user.district_name}` : 'Baramati · Pune';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [reports, setReports] = useState([]);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (_) {
    }
  }, []);

  usePolling(loadReports, 5000);

  const reportPending = reports.filter(r => {
    const s = (r.workflowStage || '').toLowerCase();
    return s.includes('pending') || s.includes('submitted') || s.includes('additional info');
  }).length;

  const summary = MOCK_SUMMARY;
  const tasks = MOCK_TASKS;
  const recentFarmers = MOCK_FARMERS.slice(0, 3);
  const pendingCount = summary.by_status['Under Scrutiny'];
  const alertCount = summary.fraud_alerts;
  const approvedCount = summary.by_status.Approved;
  const verifyCount = summary.verification_pending;
  const todayGS = MOCK_GRAM_SABHA.find(g => g.date === new Date().toISOString().slice(0, 10) || g.status === 'SCHEDULED');

  const statusColor = (s) => s === 'Approved' ? '#396940' : s === 'Rejected' ? '#ba1a1a' : '#B45309';
  const statusBg = (s) => s === 'Approved' ? 'rgba(57,105,64,0.1)' : s === 'Rejected' ? 'rgba(186,26,26,0.08)' : 'rgba(180,83,9,0.08)';

  const quickActions = [
    { icon: 'add_a_photo', label: 'Upload\nPhoto', path: '/capture-photo', color: '#1f4d36' },
    { icon: 'post_add', label: 'New\nApplication', path: '/applications', color: '#B45309' },
    { icon: 'directions_car', label: 'Field\nVisit', path: '/officer/field-verification', color: '#396940' },
    { icon: 'diversity_3', label: 'Gram\nSabha', path: '/gram-sabha', color: '#4d2024' },
    { icon: 'satellite_alt', label: 'Survey\nQueue', path: '/survey', color: '#1f4d36' },
  ];

  const statusItems = [
    { label: 'Pending', value: pendingCount, icon: 'pending_actions', color: '#B45309', path: '/applications' },
    { label: 'Verify', value: verifyCount, icon: 'fact_check', color: '#1f4d36', path: '/officer/field-verification' },
    { label: 'Alerts', value: alertCount, icon: 'gpp_bad', color: '#ba1a1a', path: '/officer/ai-verification' },
    { label: 'Approved', value: approvedCount, icon: 'check_circle', color: '#396940', path: '/applications' },
    { label: 'Surveys', value: reportPending || pendingCount, icon: 'satellite_alt', color: '#1f4d36', path: '/survey' },
  ];

  const priorityColor = (p) => p === 'HIGH' ? '#ba1a1a' : p === 'MEDIUM' ? '#B45309' : '#717972';

  return (
    <div style={{ minHeight: '100%', background: BG, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
            {greeting}, <strong>{displayName}</strong>
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
            {location}
          </div>
        </div>
        {todayGS && (
          <button onClick={() => navigate('/gram-sabha')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(3,54,33,0.07)', color: '#1f4d36', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
            Sabha {todayGS.time}
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
        {quickActions.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 16, padding: '20px 12px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'border-color 140ms, box-shadow 140ms', minHeight: 100 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: item.color }}>{item.icon}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.35 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Status Strip */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {statusItems.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, padding: '10px 16px', minWidth: 76, flexShrink: 0, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.03)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: item.color }}>{item.icon}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{item.value}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Priority Tasks */}
      <div>
        <SectionHeader title={t("Today's Tasks", lang)} count={tasks.length} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c0c9c1', marginBottom: 8 }}>task_alt</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#414943' }}>All caught up!</span>
              <span style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>No pending tasks for today.</span>
            </div>
          ) : tasks.map((task) => (
            <button key={task.id} onClick={() => navigate(task.route)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,.03)', minHeight: 56 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: priorityColor(task.priority), flexShrink: 0 }} />
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${priorityColor(task.priority)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: priorityColor(task.priority) }}>{task.icon}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                {task.time && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{task.time}</div>}
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#c0c9c1', flexShrink: 0 }}>chevron_right</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Farmers */}
      <div>
        <SectionHeader title={t('Recent Farmers', lang)} onViewAll={() => navigate('/officer/eligibility')} viewAllLabel={t('View All', lang)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recentFarmers.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c0c9c1', marginBottom: 8 }}>group</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#414943' }}>No farmers yet</span>
              <span style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Add farmers from the registry.</span>
            </div>
          ) : recentFarmers.map((f) => (
            <div key={f.farmer_id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: WHITE, border: `1px solid ${PANEL}`, borderRadius: 12, padding: '11px 12px', minHeight: 56, boxShadow: '0 1px 3px rgba(0,0,0,.03)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(31,77,54,0.1)', color: '#1f4d36', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {f.name[0]}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{f.village} · {f.crop}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap', color: statusColor(f.app_status), background: statusBg(f.app_status) }}>
                {f.app_status === 'Under Scrutiny' ? 'Pending' : f.app_status}
              </span>
              <button onClick={() => navigate('/officer/field-verification')} style={{ background: 'none', border: 'none', color: '#c0c9c1', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Speed Dial FAB */}
      <SpeedDial navigate={navigate} />
    </div>
  );
};

// ── Speed Dial ──
const SpeedDial = ({ navigate }) => {
  const [open, setOpen] = useState(false);
  const actions = [
    { icon: 'post_add', label: 'New Application', path: '/applications', color: '#1f4d36' },
    { icon: 'add_a_photo', label: 'Upload Photo', path: '/capture-photo', color: '#B45309' },
    { icon: 'person_add', label: 'Add Farmer', path: '/farmers', color: '#396940' },
    { icon: 'document_scanner', label: 'Scan Document', path: '/officer/scan-document', color: '#4d2024' },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 'calc(64px + env(safe-area-inset-bottom))', right: 20, zIndex: 1060, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: -1 }} />}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {actions.map((a) => (
            <button key={a.path} onClick={() => { setOpen(false); navigate(a.path); }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span style={{ background: 'rgba(26,28,26,0.85)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}>{a.label}</span>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>{a.icon}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #2d6b48 0%, #1f4d36 100%)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(31,77,54,0.35)', cursor: 'pointer' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#fff' }}>{open ? 'close' : 'add'}</span>
      </button>
    </div>
  );
};

export default SahayakDashboard;
