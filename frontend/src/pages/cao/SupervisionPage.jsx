import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useHierarchy } from '../../context/HierarchyContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchMandalSummary,
  fetchVistarAnalytics,
  fetchVistarFraudAlerts,
  fetchMKAApplicationIntelligence,
} from '../../utils/api';
import SahayakMatrix from './components/SahayakMatrix';
import './cao.css';

const PANEL_BORDER = '#e2e3df';
const PANEL_DIVIDER = '#ebece8';
const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';
const LABEL_GREY = '#9aa19c';

const RiskBadge = ({ risk }) => {
  const { t } = useLanguage();
  const cfg = {
    HIGH: { bg: '#fff0ee', color: '#ba1a1a', border: '#ffdad6', label: 'HIGH RISK' },
    MODERATE: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'MODERATE' },
    CLEAN: { bg: '#e8f0ea', color: '#1f4d36', border: '#c8e0d0', label: 'CLEAN' },
  }[risk] || { bg: '#f3f4f0', color: TEXT_MUTED, border: PANEL_BORDER, label: risk };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: 700, fontSize: '9.5px', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.2 }}>
      {t(cfg.label)}
    </span>
  );
};

const StatColumn = ({ label, value, accent = TEXT_PRIMARY }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
    <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LABEL_GREY, lineHeight: 1.2 }}>{label}</span>
    <span style={{ fontSize: '17px', fontWeight: 700, color: accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
  </div>
);

const StatTile = ({ icon, label, value, accent = TEXT_PRIMARY }) => (
  <div style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, minHeight: 60 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: accent }}>{icon}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LABEL_GREY, lineHeight: 1.2 }}>{label}</span>
    </div>
  </div>
);

const EmptyState = ({ icon = 'info', label }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, color: TEXT_MUTED }}>
    <span className="material-symbols-outlined" style={{ fontSize: 28, opacity: 0.4 }}>{icon}</span>
    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
  </div>
);

const SahayakSupervisionPanel = ({ summary, vistar }) => {
  const { t } = useLanguage();
  const breakdown = summary?.sahayak_breakdown || [];
  if (breakdown.length === 0) return <EmptyState icon="person_off" label={t('No sahayak data available')} />;
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {breakdown.map(sb => {
        const vp = vistar?.sahayak_performance?.find(p => p.sahayak_id === sb.sahayak_id);
        const approvalPct = sb.total ? Math.round((sb.approved / sb.total) * 100) : 0;
        const pendingPct = sb.total ? Math.round((sb.pending / sb.total) * 100) : 0;
        return (
          <div key={sb.sahayak_id} style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.3, marginBottom: 3 }}>{sb.name}</div>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LABEL_GREY, lineHeight: 1.2 }}>{sb.sahayak_id}</div>
              </div>
              {vp && <RiskBadge risk={vp.overall_risk} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <StatColumn label={t('Apps')} value={sb.total} />
              <StatColumn label={t('Pending')} value={sb.pending} accent={sb.pending > 0 ? '#b45309' : TEXT_PRIMARY} />
              <StatColumn label={t('Approved')} value={sb.approved} accent="#1f4d36" />
            </div>
            {vp && (
              <>
                <div style={{ height: 1, background: PANEL_DIVIDER, margin: '14px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <StatColumn label={t('Sessions')} value={vp.total_sessions} />
                  <StatColumn label={t('Compliance')} value={`${Math.round(vp.overall_compliance_ratio * 100)}%`} />
                  <StatColumn label={t('Fraud Flags')} value={vp.fraud_flags} accent={vp.fraud_flags > 0 ? '#ba1a1a' : '#1f4d36'} />
                </div>
              </>
            )}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', height: 4, background: '#f0f0ec', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${approvalPct}%`, background: '#1f4d36' }} />
                <div style={{ width: `${pendingPct}%`, background: '#d4d4cf' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '10.5px', fontWeight: 600, color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>
                <span>{approvalPct}% {t('approved')}</span>
                <span>{pendingPct}% {t('pending')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const VistarSupervisionPanel = ({ vistar, fraudSes }) => {
  const { t } = useLanguage();
  if (!vistar) return <EmptyState icon="school" label={t('No vistar data available')} />;
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile icon="event" label={t('Total Sessions')} value={vistar.total_sessions} />
        <StatTile icon="people" label={t('Avg Digital Att')} value={vistar.avg_digital_attendance} />
        <StatTile icon="report" label={t('Fraud Flagged')} value={vistar.fraud_flagged_count} accent={vistar.fraud_flagged_count > 0 ? '#ba1a1a' : TEXT_PRIMARY} />
        <StatTile icon="trending_down" label={t('Attendance Gap')} value={`${vistar.overall_gap_pct || 0}%`} accent={(vistar.overall_gap_pct || 0) >= 20 ? '#b45309' : TEXT_PRIMARY} />
      </div>
      <div style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${PANEL_DIVIDER}`, fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY }}>
          {t('Sahayak Vistar Performance')}
        </div>
        <div style={{ padding: '4px 16px 12px' }}>
          {(vistar.sahayak_performance || []).map((p, i, arr) => {
            const pct = Math.round(p.overall_compliance_ratio * 100);
            const barColor = p.overall_risk === 'HIGH' ? '#ba1a1a' : p.overall_risk === 'MODERATE' ? '#b45309' : '#1f4d36';
            return (
              <div key={p.sahayak_id} style={{ padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${PANEL_DIVIDER}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT_PRIMARY, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.sahayak_name}</span>
                  <RiskBadge risk={p.overall_risk} />
                </div>
                <div style={{ display: 'flex', gap: 14, marginBottom: 8, fontSize: '11px', color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>
                  <span><b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{p.total_sessions}</b> {t('sessions')}</span>
                  <span><b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{pct}%</b> {t('compliance')}</span>
                  {p.fraud_flags > 0 && <span style={{ color: '#ba1a1a', fontWeight: 700 }}>{p.fraud_flags} {t(p.fraud_flags > 1 ? 'flags' : 'flag')}</span>}
                </div>
                <div style={{ height: 3, background: '#f0f0ec', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {fraudSes && fraudSes.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${PANEL_DIVIDER}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ba1a1a' }} />
            {t('Attendance Fraud Alerts')} ({fraudSes.length})
          </div>
          <div style={{ padding: '4px 16px 12px' }}>
            {fraudSes.slice(0, 4).map((s, i, arr) => (
              <div key={s.session_id} style={{ padding: '12px 0', borderBottom: i < Math.min(arr.length, 4) - 1 ? `1px solid ${PANEL_DIVIDER}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.3 }}>{s.village} - {s.topic}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED, marginTop: 3 }}>{s.date} · {s.sahayak_name}</div>
                  </div>
                  <RiskBadge risk={s.risk} />
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: '11px', color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>
                  <span>{t('Reported')}: <b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{s.reported_attendance}</b></span>
                  <span>{t('Digital')}: <b style={{ fontWeight: 700, color: '#ba1a1a' }}>{s.digital_attendance}</b></span>
                  <span>{t('Gap')}: <b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{s.gap_pct}%</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MandalOverviewPanel = ({ summary, appIntel, vistar }) => {
  const { t } = useLanguage();
  if (!summary) return <EmptyState icon="dashboard" label={t('No mandal data available')} />;
  const pending = (summary.by_status?.Applied || 0) + (summary.by_status?.['Under Scrutiny'] || 0);
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile icon="assignment" label={t('Total Apps')} value={summary.total_applications} />
        <StatTile icon="pending" label={t('Pending')} value={pending} accent={pending > 20 ? '#b45309' : TEXT_PRIMARY} />
        <StatTile icon="check_circle" label={t('Approved')} value={summary.by_status?.Approved || 0} accent="#1f4d36" />
        <StatTile icon="gpp_bad" label={t('Fraud Alerts')} value={summary.fraud_alerts || 0} accent={(summary.fraud_alerts || 0) > 0 ? '#ba1a1a' : TEXT_PRIMARY} />
      </div>
      {vistar && (
        <div style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${PANEL_DIVIDER}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#b45309' }}>bolt</span>
            {t('Vistar Snapshot')}
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
              <StatColumn label={t('Sessions')} value={vistar.total_sessions} />
              <StatColumn label={t('Fraud Flagged')} value={vistar.fraud_flagged_count} accent={vistar.fraud_flagged_count > 0 ? '#ba1a1a' : TEXT_PRIMARY} />
              <StatColumn label={t('Avg Reported')} value={vistar.avg_reported_attendance} />
              <StatColumn label={t('Avg Digital')} value={vistar.avg_digital_attendance} />
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${PANEL_DIVIDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: TEXT_MUTED }}>
              <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LABEL_GREY }}>{t('Overall Gap')}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: (vistar.overall_gap_pct || 0) > 20 ? '#ba1a1a' : '#1f4d36', fontVariantNumeric: 'tabular-nums' }}>{vistar.overall_gap_pct}%</span>
            </div>
          </div>
        </div>
      )}
      {appIntel && (
        <div style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${PANEL_DIVIDER}`, fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY }}>
            {t('Application Status Funnel')}
          </div>
          <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(appIntel.by_status || {}).map(([status, count]) => {
              const total = appIntel.total_applications || 1;
              const pct = Math.round((count / total) * 100);
              const clr = status === 'Approved' ? '#1f4d36' : status === 'Rejected' ? '#ba1a1a' : status === 'Under Scrutiny' ? '#b45309' : '#5b7c8d';
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: TEXT_PRIMARY }}>{status}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: TEXT_PRIMARY }}>
                      <b style={{ fontWeight: 700 }}>{count}</b>
                      <span style={{ color: TEXT_MUTED, fontWeight: 500, marginLeft: 6 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#f0f0ec', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: clr, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {appIntel?.by_scheme_category && (
        <div style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${PANEL_DIVIDER}`, fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY }}>
            {t('Scheme Category Distribution')}
          </div>
          <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(appIntel.by_scheme_category).slice(0, 6).map(([cat, cnt]) => (
              <div key={cat} style={{ background: '#f9faf6', border: `1px solid ${PANEL_DIVIDER}`, borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 56 }}>
                <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: LABEL_GREY, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat || t('Other')}</span>
                <span style={{ fontSize: '17px', fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{cnt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {vistar?.insights?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: LABEL_GREY, padding: '0 2px', marginBottom: 10 }}>{t('Supervisory Insights')}</div>
          {vistar.insights.map((ins, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${PANEL_BORDER}`, borderLeft: '3px solid #1f4d36', borderRadius: 8, padding: '11px 14px', fontSize: '11.5px', color: TEXT_PRIMARY, lineHeight: 1.55 }}>
              {ins}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SupervisionPage = () => {
  const { t } = useLanguage();
  const { mandals, currentMandal } = useHierarchy();
  const { buildSahayakMatrixForMandal, stats } = useKrishiData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('sahayak');
  const [summary, setSummary] = useState(null);
  const [vistar, setVistar] = useState(null);
  const [fraudSes, setFraudSes] = useState([]);
  const [appIntel, setAppIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  const mandal = useMemo(() => {
    if (currentMandal) return currentMandal;
    if (user?.district_id) {
      const m = mandals.find((x) => Number(x.district_id) === Number(user.district_id));
      if (m) return m;
    }
    return mandals[0] || { mandal_id: 'C001', name: 'Agriculture circle', circle_id: 1, district_name: '', taluka_name: '' };
  }, [currentMandal, mandals, user?.district_id]);

  const mid = mandal?.mandal_id || 'C001';
  const sahayakMatrixRows = useMemo(() => buildSahayakMatrixForMandal(mandal), [mandal, buildSahayakMatrixForMandal]);

  const buildFallbackData = useCallback(() => {
    const rows = sahayakMatrixRows.length > 0 ? sahayakMatrixRows : [{ id: 'KS0', name: 'Demo Sahayak', status: 'good', verifications_week: 12, avg_days: 3, overdue_15d: 1, villages: ['Demo'] }];
    const totalSurveys = stats?.totalSurveys ?? 4046;
    return {
      fallbackSummary: { total_applications: Math.min(900, Math.round(totalSurveys / 5)), by_status: { Applied: 18, 'Under Scrutiny': 12, Approved: 95, Rejected: 17 }, fraud_alerts: rows.reduce((s, r) => s + r.overdue_15d, 0), sahayak_breakdown: rows.map((s) => ({ sahayak_id: s.id, name: s.name, total: s.verifications_week + s.total_pending, pending: s.total_pending, approved: s.verifications_week })) },
      fallbackVistar: { total_sessions: 48, avg_reported_attendance: 42, avg_digital_attendance: 31, fraud_flagged_count: 5, overall_gap_pct: 26, sahayak_performance: rows.map((s) => ({ sahayak_id: s.id, sahayak_name: s.name, total_sessions: Math.round(s.verifications_week * 1.3), overall_compliance_ratio: s.status === 'excellent' ? 0.92 : s.status === 'good' ? 0.78 : 0.55, fraud_flags: s.overdue_15d, overall_risk: s.status === 'excellent' ? 'CLEAN' : s.status === 'good' ? 'MODERATE' : 'HIGH' })), insights: [`${mandal?.district_name || 'District'} - ${mandal?.name || 'circle'} linked to CSV (${rows.length} Sahayaks).`, `Statewide survey records: ${totalSurveys.toLocaleString('en-IN')}.`] },
      fallbackAppIntel: { total_applications: 142, by_status: { Applied: 18, 'Under Scrutiny': 12, Approved: 95, Rejected: 17 }, by_scheme_category: { 'Drip Irrigation': 38, 'PM-KUSUM Solar': 22, 'Seed Subsidy': 31, 'PMFBY Insurance': 27, 'Fertilizer DBT': 16, Other: 8 } },
    };
  }, [sahayakMatrixRows, mandal, stats]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([fetchMandalSummary(mid), fetchVistarAnalytics(mid), fetchVistarFraudAlerts(mid), fetchMKAApplicationIntelligence(mid)])
      .then(([s, v, f, a]) => {
        const { fallbackSummary, fallbackVistar, fallbackAppIntel } = buildFallbackData();
        setSummary(s.status === 'fulfilled' && s.value ? s.value : fallbackSummary);
        setVistar(v.status === 'fulfilled' && v.value ? v.value : fallbackVistar);
        setFraudSes(f.status === 'fulfilled' ? (f.value?.alerts || []) : []);
        setAppIntel(a.status === 'fulfilled' && a.value ? a.value : fallbackAppIntel);
      }).finally(() => setLoading(false));
  }, [mid, buildFallbackData]);

  const TABS = [
    { id: 'sahayak', icon: 'group', label: t('Sahayaks') },
    { id: 'vistar', icon: 'school', label: t('Krishi Vistar') },
    { id: 'mandal', icon: 'dashboard', label: t('Mandal Info') },
  ];

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1c1a' }}>{t('Supervision')}</h1>
        <p style={{ fontSize: 12, color: '#717972', fontWeight: 600, marginTop: 4 }}>{mandal?.name || 'Circle'} · {mid}</p>
      </div>

      <div className="surface-card" style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 400, maxHeight: 'calc(100vh - 200px)' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '14px 14px', background: '#f7f8f4', borderBottom: '1px solid #e2e3df', flexShrink: 0 }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', minHeight: '52px', background: isActive ? '#033621' : 'transparent', color: isActive ? '#ffffff' : '#717972', boxShadow: isActive ? '0 2px 8px rgba(3, 54, 33, 0.18)' : 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'inherit' }}>{tab.icon}</span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.04em', color: 'inherit' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, color: '#717972' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.4 }}>hourglass_top</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{t('Loading...')}</span>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {activeTab === 'sahayak' && <SahayakSupervisionPanel summary={summary} vistar={vistar} />}
            {activeTab === 'vistar' && <VistarSupervisionPanel vistar={vistar} fraudSes={fraudSes} />}
            {activeTab === 'mandal' && <MandalOverviewPanel summary={summary} appIntel={appIntel} vistar={vistar} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisionPage;
