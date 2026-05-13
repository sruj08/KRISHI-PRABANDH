import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useHierarchy } from '../../context/HierarchyContext';
import {
  fetchMandalSummary,
  fetchVistarAnalytics,
  fetchVistarFraudAlerts,
  fetchMKAApplicationIntelligence,
} from '../../utils/api';

// ── Risk badge helper ──────────────────────────────────────────────────────────
const RiskBadge = ({ risk, t: tFn }) => {
  const cfg = {
    HIGH:     { bg: '#ffebee', color: '#c62828', label: tFn('HIGH RISK') },
    MODERATE: { bg: '#fff8e1', color: '#f57f17', label: tFn('MODERATE') },
    CLEAN:    { bg: '#e8f5e9', color: '#2e7d32', label: tFn('CLEAN') },
  }[risk] || { bg: '#f5f5f5', color: '#666', label: risk };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '10px', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <span className="material-symbols-outlined" style={{ color, fontSize: '28px' }}>{icon}</span>
    <div>
      <div style={{ fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '11px', color, opacity: 0.8, marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
    <span className="material-symbols-outlined" style={{ color: '#2e7d32', fontSize: '22px' }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '11px', color: '#888' }}>{subtitle}</div>}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const MandalDashboard = () => {
  const { currentMandal, setCurrentSahayak } = useHierarchy();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // ── Tab bar (inside component so t() is available) ──────────────────────────
  const TABS = [
    { id: 'overview',  icon: 'dashboard',        label: t('Overview') },
    { id: 'sahayak',   icon: 'group',            label: t('Sahayak Supervision') },
    { id: 'apps',      icon: 'assignment',       label: t('App Intelligence') },
    { id: 'vistar',    icon: 'school',           label: t('Krushi Vistar') },
  ];

  const [summary,   setSummary]   = useState(null);
  const [vistar,    setVistar]    = useState(null);
  const [fraudSes,  setFraudSes]  = useState([]);
  const [appIntel,  setAppIntel]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!currentMandal) { setLoading(false); return; }
    const mid = currentMandal.mandal_id;
    setLoading(true);
    Promise.allSettled([
      fetchMandalSummary(mid),
      fetchVistarAnalytics(mid),
      fetchVistarFraudAlerts(mid),
      fetchMKAApplicationIntelligence(mid),
    ]).then(([s, v, f, a]) => {
      if (s.status === 'fulfilled') setSummary(s.value);
      if (v.status === 'fulfilled') setVistar(v.value);
      if (f.status === 'fulfilled') setFraudSes(f.value.alerts || []);
      if (a.status === 'fulfilled') setAppIntel(a.value);
    }).finally(() => setLoading(false));
  }, [currentMandal]);

  if (!currentMandal) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ccc' }}>location_city</span>
      <h2 style={{ marginTop: '16px', color: '#888' }}>{t('No Mandal Selected')}</h2>
      <p style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>{t('Select a Mandal from the header to begin supervisory view.')}</p>
    </div>
  );

  const mid = currentMandal.mandal_id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <header className="cao-header" style={{ marginLeft: '-var(--sp-6)', marginRight: '-var(--sp-6)', marginTop: '-var(--sp-6)' }}>
        <div className="cao-header-left">
          <div className="logo-text">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginRight: '8px', fontSize: '24px' }}>public</span>
            {t('Krishi Prabandh - Mandal')}
          </div>
        </div>

        <div className="cao-header-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', gap: '16px' }}>
          <span>{currentMandal.name} {t('Mandal')}</span> • 
          <span>{currentMandal.district} {t('District')}</span> •
          <span>{t('Mandal Krishi Adhikari')}</span>
        </div>

        <div className="cao-header-right">
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>notifications</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>settings</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-dark)', cursor: 'pointer' }}>
            M
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '6px', background: '#f5f5f5', borderRadius: '12px', padding: '4px', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, minWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '8px 6px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 700, transition: 'all .15s',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#2e7d32' : '#888',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>{t('Loading data…')}</div>}

      {/* ── TAB: OVERVIEW ────────────────────────────────────────── */}
      {!loading && activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionHeader icon="bar_chart" title={t('Mandal Overview')} subtitle={t('Aggregate application statistics')} />
          <div className="cao-kpi-strip" style={{ margin: '0 -var(--sp-6)', borderTop: '1px solid var(--outline-card)', borderBottom: '1px solid var(--outline-card)' }}>
            <div className="kpi-card-stitch">
              <div className="kpi-card-header"><span className="material-symbols-outlined" style={{ color: '#0055A4' }}>assignment</span> <span style={{ color: '#0055A4' }}>{t('TOTAL APPS')}</span></div>
              <div className="kpi-card-value" style={{ color: '#0055A4' }}>{summary?.total_applications ?? '—'}</div>
              <div className="kpi-card-footer" style={{ color: 'var(--text-muted)' }}>{t('Mandal-wide')}</div>
            </div>
            <div className="kpi-card-stitch">
              <div className="kpi-card-header"><span className="material-symbols-outlined" style={{ color: '#e65100' }}>pending</span> <span style={{ color: '#e65100' }}>{t('PENDING ACTION')}</span></div>
              <div className="kpi-card-value" style={{ color: '#e65100' }}>{(summary?.by_status?.Applied || 0) + (summary?.by_status?.['Under Scrutiny'] || 0) || '—'}</div>
              <div className="kpi-card-footer" style={{ color: 'var(--text-muted)' }}>{t('Awaiting review')}</div>
            </div>
            <div className="kpi-card-stitch">
              <div className="kpi-card-header"><span className="material-symbols-outlined" style={{ color: '#2e7d32' }}>check_circle</span> <span style={{ color: '#2e7d32' }}>{t('APPROVED')}</span></div>
              <div className="kpi-card-value" style={{ color: '#2e7d32' }}>{summary?.by_status?.Approved ?? '—'}</div>
              <div className="kpi-card-footer" style={{ color: 'var(--text-muted)' }}>{t('Verified clear')}</div>
            </div>
            <div className="kpi-card-stitch">
              <div className="kpi-card-header"><span className="material-symbols-outlined" style={{ color: '#c62828' }}>gpp_bad</span> <span style={{ color: '#c62828' }}>{t('FRAUD ALERTS')}</span></div>
              <div className="kpi-card-value" style={{ color: '#c62828' }}>{summary?.fraud_alerts ?? '—'}</div>
              <div className="kpi-card-footer" style={{ color: 'var(--text-muted)' }}><span className="badge badge-error p-0 bg-transparent" style={{ color: '#c62828' }}>{t('Needs Audit')}</span></div>
            </div>
          </div>

          {/* Vistar quick stats */}
          {vistar && (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#f57f17', marginBottom: '10px' }}>{t('⚡ Vistar Quick Stats')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ fontSize: '12px' }}><b>{vistar.total_sessions}</b> {t('sessions')}</div>
                <div style={{ fontSize: '12px' }}><b>{vistar.fraud_flagged_count}</b> {t('flagged')}</div>
                <div style={{ fontSize: '12px' }}>{t('Avg Reported:')} <b>{vistar.avg_reported_attendance}</b></div>
                <div style={{ fontSize: '12px' }}>{t('Avg Digital:')} <b>{vistar.avg_digital_attendance}</b></div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>{t('Gap:')} <b style={{ color: vistar.overall_gap_pct > 40 ? '#c62828' : '#2e7d32' }}>{vistar.overall_gap_pct}%</b></div>
            </div>
          )}

          {/* AI Insights */}
          {vistar?.insights?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>{t('🧠 Supervisory Insights')}</div>
              {vistar.insights.map((ins, i) => (
                <div key={i} style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', lineHeight: 1.5 }}>{ins}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SAHAYAK SUPERVISION ─────────────────────────────── */}
      {!loading && activeTab === 'sahayak' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SectionHeader icon="group" title={t('Sahayak Supervision')} subtitle={t('Monitor field officer activity and workload')} />
          {(summary?.sahayak_breakdown || []).map(sb => {
            const vp = vistar?.sahayak_performance?.find(p => p.sahayak_id === sb.sahayak_id);
            return (
              <div key={sb.sahayak_id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{sb.name}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{sb.sahayak_id}</div>
                  </div>
                  {vp && <RiskBadge risk={vp.overall_risk} t={t} />}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><div style={{ color: '#888', fontSize: '10px' }}>{t('TOTAL APPS')}</div><b>{sb.total}</b></div>
                  <div><div style={{ color: '#888', fontSize: '10px' }}>{t('PENDING')}</div><b style={{ color: '#e65100' }}>{sb.pending}</b></div>
                  <div><div style={{ color: '#888', fontSize: '10px' }}>{t('APPROVED')}</div><b style={{ color: '#2e7d32' }}>{sb.approved}</b></div>
                </div>
                {vp && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <div><div style={{ color: '#888', fontSize: '10px' }}>{t('SESSIONS')}</div><b>{vp.total_sessions}</b></div>
                    <div><div style={{ color: '#888', fontSize: '10px' }}>{t('AVG ATTEND.')}</div><b>{vp.avg_digital_attendance}</b></div>
                    <div><div style={{ color: '#888', fontSize: '10px' }}>{t('FRAUD FLAGS')}</div><b style={{ color: vp.fraud_flags > 0 ? '#c62828' : '#2e7d32' }}>{vp.fraud_flags}</b></div>
                  </div>
                )}
                <div style={{ marginTop: '10px', height: '5px', background: '#eee', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${sb.total ? (sb.approved / sb.total) * 100 : 0}%`, background: '#4caf50' }} />
                  <div style={{ width: `${sb.total ? (sb.pending / sb.total) * 100 : 0}%`, background: '#ff9800' }} />
                </div>
                <button
                  onClick={() => { setCurrentSahayak({ sahayak_id: sb.sahayak_id, name: sb.name, mandal_id: mid }); }}
                  style={{ marginTop: '10px', width: '100%', padding: '7px', fontSize: '12px', fontWeight: 700, border: '1px solid #e0e0e0', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: '#0055A4' }}>
                  {t('View Sahayak Dashboard →')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: APPLICATION INTELLIGENCE ────────────────────────── */}
      {!loading && activeTab === 'apps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SectionHeader icon="analytics" title={t('Application Intelligence')} subtitle={t('Supervisory view only — no approve/reject actions')} />

          {/* Status funnel */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>{t('Status Funnel')}</div>
            {Object.entries(appIntel?.by_status || {}).map(([status, count]) => {
              const total = appIntel?.total_applications || 1;
              const pct = Math.round((count / total) * 100);
              const clr = status === 'Approved' ? '#4caf50' : status === 'Rejected' ? '#ef5350' : status === 'Under Scrutiny' ? '#ff9800' : '#42a5f5';
              return (
                <div key={status} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                    <span>{t(status)}</span><span style={{ fontWeight: 700 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: clr, height: '100%', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scheme distribution */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>{t('Scheme Category Distribution')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(appIntel?.by_scheme_category || {}).slice(0, 6).map(([cat, cnt]) => (
                <div key={cat} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}>
                  <div style={{ color: '#888', fontSize: '10px', marginBottom: '2px' }}>{cat || t('Other')}</div>
                  <b>{cnt}</b>
                </div>
              ))}
            </div>
          </div>

          {/* Duplicate / fraud doc alerts */}
          {(appIntel?.duplicate_alerts || []).length > 0 && (
            <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#c62828', marginBottom: '10px' }}>
                {t('🚨 Duplicate / Fraud Document Alerts')} ({appIntel.duplicate_alerts.length})
              </div>
              {appIntel.duplicate_alerts.slice(0, 5).map((a, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700 }}>{a.application_id}</div>
                  <div style={{ color: '#888', marginTop: '2px' }}>{a.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: KRUSHI VISTAR INTELLIGENCE ──────────────────────── */}
      {!loading && activeTab === 'vistar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SectionHeader icon="school" title={t('Krushi Vistar Intelligence')} subtitle={t('Training session attendance verification & fraud detection')} />

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <StatCard icon="event"        label={t('Total Sessions')}   value={vistar?.total_sessions}         color="#0055A4" bg="#e3f2fd" />
            <StatCard icon="people"       label={t('Avg Digital Att.')} value={vistar?.avg_digital_attendance}  color="#2e7d32" bg="#e8f5e9" />
            <StatCard icon="report"       label={t('Fraud Flagged')}    value={vistar?.fraud_flagged_count}     color="#c62828" bg="#ffebee" />
            <StatCard icon="trending_down" label={t('Attendance Gap')}  value={`${vistar?.overall_gap_pct || 0}%`} color="#f57f17" bg="#fff8e1" />
          </div>

          {/* Sahayak performance table */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>{t('Sahayak Vistar Performance')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(vistar?.sahayak_performance || []).map(p => (
                <div key={p.sahayak_id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '10px', padding: '10px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{p.sahayak_name}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                      {p.total_sessions}{t(' sessions · Reported avg: ')}{p.avg_reported_attendance}{t(' · Digital avg: ')}{p.avg_digital_attendance}
                      {p.fraud_flags > 0 && <span style={{ color: '#c62828', fontWeight: 700, marginLeft: '6px' }}>· {p.fraud_flags} {t('HIGH flags')}</span>}
                    </div>
                    <div style={{ marginTop: '6px', height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(p.overall_compliance_ratio * 100)}%`, background: p.overall_risk === 'HIGH' ? '#ef5350' : p.overall_risk === 'MODERATE' ? '#ff9800' : '#4caf50', height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{Math.round(p.overall_compliance_ratio * 100)}{t('% compliance')}</div>
                  </div>
                  <RiskBadge risk={p.overall_risk} t={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Fraud alerts panel */}
          {fraudSes.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#c62828' }}>
                {t('🔴 Attendance Fraud Alerts')} ({fraudSes.length})
              </div>
              {fraudSes.map(s => (
                <div key={s.session_id} style={{ marginBottom: '10px', padding: '12px', background: s.risk === 'HIGH' ? '#ffebee' : '#fff8e1', borderRadius: '10px', border: `1px solid ${s.risk === 'HIGH' ? '#ffcdd2' : '#ffe082'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.village} — {s.topic}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{s.date} · {s.sahayak_name} · {s.session_id}</div>
                    </div>
                    <RiskBadge risk={s.risk} t={t} />
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', marginBottom: '8px' }}>
                    <span>{t('📋 Reported:')} <b>{s.reported_attendance}</b></span>
                    <span>{t('📱 Digital:')} <b style={{ color: s.risk === 'HIGH' ? '#c62828' : '#f57f17' }}>{s.digital_attendance}</b></span>
                    <span>{t('Gap:')} <b>{s.gap_pct}%</b></span>
                  </div>
                  {s.notes && <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>"{s.notes}"</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, padding: '7px', fontSize: '11px', fontWeight: 700, border: '1px solid #0055A4', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: '#0055A4' }}>
                      {t('🔍 Investigate')}
                    </button>
                    <button style={{ flex: 1, padding: '7px', fontSize: '11px', fontWeight: 700, border: '1px solid #c62828', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: '#c62828' }}>
                      {t('🚗 Schedule Surprise Visit')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Session timeline */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>{t('Session Timeline')}</div>
            {fraudSes.concat(
              (vistar?.sahayak_performance || [])
                .filter(p => p.overall_risk === 'CLEAN')
                .map(p => ({ session_id: p.sahayak_id + '-clean', sahayak_name: p.sahayak_name, risk: 'CLEAN', date: '—', village: '—', topic: `${p.total_sessions}${t(' clean sessions')}`, gap_pct: 0 }))
            ).slice(0, 8).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: s.risk === 'HIGH' ? '#ef5350' : s.risk === 'MODERATE' ? '#ff9800' : '#4caf50' }} />
                <div style={{ flex: 1, fontSize: '12px' }}>
                  <b>{s.village !== '—' ? s.village : s.sahayak_name}</b> — {s.topic}
                  <div style={{ color: '#aaa', fontSize: '10px' }}>{s.date !== '—' ? s.date : ''} {s.sahayak_name}</div>
                </div>
                <RiskBadge risk={s.risk} t={t} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MandalDashboard;
