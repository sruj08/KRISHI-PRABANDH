import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHierarchy } from '../../context/HierarchyContext';
import ActionMap from './components/ActionMap';
import ShopTracker from './components/ShopTracker';
import SahayakMatrix from './components/SahayakMatrix';
import PMFBYPanel from './components/PMFBYPanel';
const CAO_PROFILE = { name: 'CAO Officer', designation: 'Mandal Krushi Adhikari', mandal: 'Wagholi Mandal', district: 'Pune' };
const DASHBOARD_KPIS = {};
const SAHAYAKS = [];
const PMFBY_EVENTS = [];
import {
  fetchMandalSummary,
  fetchVistarAnalytics,
  fetchVistarFraudAlerts,
  fetchMKAApplicationIntelligence,
} from '../../utils/api';
import './cao.css';

// ── Shared design primitives ─────────────────────────────────────────────────

const PANEL_BORDER = '#e2e3df';
const PANEL_DIVIDER = '#ebece8';
const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';
const LABEL_GREY = '#9aa19c';

const RiskBadge = ({ risk }) => {
  const cfg = {
    HIGH:     { bg: '#fff0ee', color: '#ba1a1a', border: '#ffdad6', label: 'HIGH RISK' },
    MODERATE: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'MODERATE' },
    CLEAN:    { bg: '#e8f0ea', color: '#1f4d36', border: '#c8e0d0', label: 'CLEAN' },
  }[risk] || { bg: '#f3f4f0', color: TEXT_MUTED, border: PANEL_BORDER, label: risk };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontWeight: 700,
      fontSize: '9.5px',
      letterSpacing: '0.08em',
      padding: '3px 8px',
      borderRadius: 6,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      lineHeight: 1.2,
    }}>
      {cfg.label}
    </span>
  );
};

const StatColumn = ({ label, value, accent = TEXT_PRIMARY, align = 'left' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, textAlign: align }}>
    <span style={{
      fontSize: '9.5px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: LABEL_GREY,
      lineHeight: 1.2,
    }}>{label}</span>
    <span style={{
      fontSize: '17px',
      fontWeight: 700,
      color: accent,
      lineHeight: 1.1,
      fontVariantNumeric: 'tabular-nums',
    }}>{value}</span>
  </div>
);

const StatTile = ({ icon, label, value, accent = TEXT_PRIMARY }) => (
  <div style={{
    background: '#fff',
    border: `1px solid ${PANEL_BORDER}`,
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
  }}>
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      background: '#f3f4f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: accent }}>{icon}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{
        fontSize: 18,
        fontWeight: 700,
        color: accent,
        lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      <span style={{
        fontSize: '9.5px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: LABEL_GREY,
        lineHeight: 1.2,
      }}>{label}</span>
    </div>
  </div>
);

const SectionHeader = ({ children }) => (
  <div style={{
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: LABEL_GREY,
    padding: '0 2px',
    marginBottom: 10,
  }}>
    {children}
  </div>
);

const EmptyState = ({ icon = 'info', label }) => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    color: TEXT_MUTED,
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 28, opacity: 0.4 }}>{icon}</span>
    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
  </div>
);

// ── Sub-section: Sahayak Supervision ─────────────────────────────────────────

const SahayakSupervisionPanel = ({ summary, vistar }) => {
  const breakdown = summary?.sahayak_breakdown || [];
  if (breakdown.length === 0) return <EmptyState icon="person_off" label="No sahayak data available" />;

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '14px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {breakdown.map(sb => {
        const vp = vistar?.sahayak_performance?.find(p => p.sahayak_id === sb.sahayak_id);
        const approvalPct = sb.total ? Math.round((sb.approved / sb.total) * 100) : 0;
        const pendingPct = sb.total ? Math.round((sb.pending / sb.total) * 100) : 0;
        return (
          <div key={sb.sahayak_id} style={{
            background: '#fff',
            border: `1px solid ${PANEL_BORDER}`,
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            {/* Header: name + ID + badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 14,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  lineHeight: 1.3,
                  marginBottom: 3,
                }}>{sb.name}</div>
                <div style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: LABEL_GREY,
                  lineHeight: 1.2,
                }}>{sb.sahayak_id}</div>
              </div>
              {vp && <RiskBadge risk={vp.overall_risk} />}
            </div>

            {/* Apps / Pending / Approved row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <StatColumn label="Apps" value={sb.total} />
              <StatColumn label="Pending" value={sb.pending} accent={sb.pending > 0 ? '#b45309' : TEXT_PRIMARY} />
              <StatColumn label="Approved" value={sb.approved} accent="#1f4d36" />
            </div>

            {/* Vistar performance row */}
            {vp && (
              <>
                <div style={{ height: 1, background: PANEL_DIVIDER, margin: '14px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <StatColumn label="Sessions" value={vp.total_sessions} />
                  <StatColumn label="Compliance" value={`${Math.round(vp.overall_compliance_ratio * 100)}%`} />
                  <StatColumn
                    label="Fraud Flags"
                    value={vp.fraud_flags}
                    accent={vp.fraud_flags > 0 ? '#ba1a1a' : '#1f4d36'}
                  />
                </div>
              </>
            )}

            {/* Progress bar + footnote */}
            <div style={{ marginTop: 14 }}>
              <div style={{
                display: 'flex',
                height: 4,
                background: '#f0f0ec',
                borderRadius: 99,
                overflow: 'hidden',
              }}>
                <div style={{ width: `${approvalPct}%`, background: '#1f4d36' }} />
                <div style={{ width: `${pendingPct}%`, background: '#d4d4cf' }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                fontSize: '10.5px',
                fontWeight: 600,
                color: TEXT_MUTED,
                fontVariantNumeric: 'tabular-nums',
              }}>
                <span>{approvalPct}% approved</span>
                <span>{pendingPct}% pending</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Sub-section: Krishi Vistar Supervision ────────────────────────────────────

const VistarSupervisionPanel = ({ vistar, fraudSes }) => {
  if (!vistar) return <EmptyState icon="school" label="No vistar data available" />;

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '14px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* KPI grid — neutral, no pastel boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile icon="event" label="Total Sessions" value={vistar.total_sessions} />
        <StatTile icon="people" label="Avg Digital Att" value={vistar.avg_digital_attendance} />
        <StatTile
          icon="report"
          label="Fraud Flagged"
          value={vistar.fraud_flagged_count}
          accent={vistar.fraud_flagged_count > 0 ? '#ba1a1a' : TEXT_PRIMARY}
        />
        <StatTile
          icon="trending_down"
          label="Attendance Gap"
          value={`${vistar.overall_gap_pct || 0}%`}
          accent={(vistar.overall_gap_pct || 0) >= 20 ? '#b45309' : TEXT_PRIMARY}
        />
      </div>

      {/* Performance list */}
      <div style={{
        background: '#fff',
        border: `1px solid ${PANEL_BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${PANEL_DIVIDER}`,
          fontSize: '12.5px',
          fontWeight: 700,
          color: TEXT_PRIMARY,
        }}>
          Sahayak Vistar Performance
        </div>
        <div style={{ padding: '4px 16px 12px' }}>
          {(vistar.sahayak_performance || []).map((p, i, arr) => {
            const pct = Math.round(p.overall_compliance_ratio * 100);
            const barColor =
              p.overall_risk === 'HIGH' ? '#ba1a1a' :
              p.overall_risk === 'MODERATE' ? '#b45309' :
              '#1f4d36';
            return (
              <div key={p.sahayak_id} style={{
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${PANEL_DIVIDER}` : 'none',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                  gap: 12,
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{p.sahayak_name}</span>
                  <RiskBadge risk={p.overall_risk} />
                </div>
                <div style={{
                  display: 'flex',
                  gap: 14,
                  marginBottom: 8,
                  fontSize: '11px',
                  color: TEXT_MUTED,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <span><b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{p.total_sessions}</b> sessions</span>
                  <span><b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{pct}%</b> compliance</span>
                  {p.fraud_flags > 0 && (
                    <span style={{ color: '#ba1a1a', fontWeight: 700 }}>{p.fraud_flags} flag{p.fraud_flags > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div style={{
                  height: 3,
                  background: '#f0f0ec',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fraud alerts — minimal, no pink card */}
      {fraudSes && fraudSes.length > 0 && (
        <div style={{
          background: '#fff',
          border: `1px solid ${PANEL_BORDER}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${PANEL_DIVIDER}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_PRIMARY,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ba1a1a' }} />
            Attendance Fraud Alerts ({fraudSes.length})
          </div>
          <div style={{ padding: '4px 16px 12px' }}>
            {fraudSes.slice(0, 4).map((s, i, arr) => (
              <div key={s.session_id} style={{
                padding: '12px 0',
                borderBottom: i < Math.min(arr.length, 4) - 1 ? `1px solid ${PANEL_DIVIDER}` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.3 }}>{s.village} — {s.topic}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED, marginTop: 3 }}>{s.date} · {s.sahayak_name}</div>
                  </div>
                  <RiskBadge risk={s.risk} />
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: '11px', color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>
                  <span>Reported: <b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{s.reported_attendance}</b></span>
                  <span>Digital: <b style={{ fontWeight: 700, color: '#ba1a1a' }}>{s.digital_attendance}</b></span>
                  <span>Gap: <b style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{s.gap_pct}%</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-section: Mandal Overview ──────────────────────────────────────────────

const MandalOverviewPanel = ({ summary, appIntel, vistar }) => {
  if (!summary) return <EmptyState icon="dashboard" label="No mandal data available" />;
  const pending = (summary.by_status?.Applied || 0) + (summary.by_status?.['Under Scrutiny'] || 0);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '14px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Application KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile icon="assignment" label="Total Apps" value={summary.total_applications} />
        <StatTile icon="pending" label="Pending" value={pending} accent={pending > 20 ? '#b45309' : TEXT_PRIMARY} />
        <StatTile icon="check_circle" label="Approved" value={summary.by_status?.Approved || 0} accent="#1f4d36" />
        <StatTile
          icon="gpp_bad"
          label="Fraud Alerts"
          value={summary.fraud_alerts || 0}
          accent={(summary.fraud_alerts || 0) > 0 ? '#ba1a1a' : TEXT_PRIMARY}
        />
      </div>

      {/* Vistar snapshot — clean white card with subtle accent */}
      {vistar && (
        <div style={{
          background: '#fff',
          border: `1px solid ${PANEL_BORDER}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${PANEL_DIVIDER}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_PRIMARY,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#b45309' }}>bolt</span>
            Vistar Snapshot
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
              <StatColumn label="Sessions" value={vistar.total_sessions} />
              <StatColumn label="Fraud Flagged" value={vistar.fraud_flagged_count} accent={vistar.fraud_flagged_count > 0 ? '#ba1a1a' : TEXT_PRIMARY} />
              <StatColumn label="Avg Reported" value={vistar.avg_reported_attendance} />
              <StatColumn label="Avg Digital" value={vistar.avg_digital_attendance} />
            </div>
            <div style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${PANEL_DIVIDER}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: TEXT_MUTED,
            }}>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: LABEL_GREY,
              }}>Overall Gap</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 700,
                color: (vistar.overall_gap_pct || 0) > 20 ? '#ba1a1a' : '#1f4d36',
                fontVariantNumeric: 'tabular-nums',
              }}>{vistar.overall_gap_pct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Status funnel */}
      {appIntel && (
        <div style={{
          background: '#fff',
          border: `1px solid ${PANEL_BORDER}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${PANEL_DIVIDER}`,
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_PRIMARY,
          }}>
            Application Status Funnel
          </div>
          <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(appIntel.by_status || {}).map(([status, count]) => {
              const total = appIntel.total_applications || 1;
              const pct = Math.round((count / total) * 100);
              const clr =
                status === 'Approved' ? '#1f4d36' :
                status === 'Rejected' ? '#ba1a1a' :
                status === 'Under Scrutiny' ? '#b45309' :
                '#5b7c8d';
              return (
                <div key={status}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                    fontSize: '12px',
                  }}>
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

      {/* Scheme category distribution */}
      {appIntel?.by_scheme_category && (
        <div style={{
          background: '#fff',
          border: `1px solid ${PANEL_BORDER}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${PANEL_DIVIDER}`,
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_PRIMARY,
          }}>
            Scheme Category Distribution
          </div>
          <div style={{
            padding: '14px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}>
            {Object.entries(appIntel.by_scheme_category).slice(0, 6).map(([cat, cnt]) => (
              <div key={cat} style={{
                background: '#f9faf6',
                border: `1px solid ${PANEL_DIVIDER}`,
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minHeight: 56,
              }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: LABEL_GREY,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{cat || 'Other'}</span>
                <span style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}>{cnt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supervisory Insights */}
      {vistar?.insights?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHeader>Supervisory Insights</SectionHeader>
          {vistar.insights.map((ins, i) => (
            <div key={i} style={{
              background: '#fff',
              border: `1px solid ${PANEL_BORDER}`,
              borderLeft: '3px solid #1f4d36',
              borderRadius: 8,
              padding: '11px 14px',
              fontSize: '11.5px',
              color: TEXT_PRIMARY,
              lineHeight: 1.55,
            }}>
              {ins}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CAODashboard = () => {
  const [pmfbyOpen, setPmfbyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sahayak');
  const [summary, setSummary]     = useState(null);
  const [vistar, setVistar]       = useState(null);
  const [fraudSes, setFraudSes]   = useState([]);
  const [appIntel, setAppIntel]   = useState(null);
  const [loading, setLoading]     = useState(true);

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mandals } = useHierarchy();

  // Use M002 as default mandal for CAO (matches CAO_PROFILE.mandal)
  const mandal = mandals?.find(m => m.mandal_id === 'M002') || { mandal_id: 'M002' };
  const mid = mandal.mandal_id;

  // Synthesize fallback data from SAHAYAKS mock so the panel always shows content
  // when the backend API is unreachable (demo / standalone mode).
  const buildFallbackData = () => {
    const fallbackSummary = {
      total_applications: 142,
      by_status: { Applied: 18, 'Under Scrutiny': 12, Approved: 95, Rejected: 17 },
      fraud_alerts: SAHAYAKS.reduce((sum, s) => sum + s.overdue_15d, 0),
      sahayak_breakdown: SAHAYAKS.map(s => ({
        sahayak_id: s.id,
        name: s.name,
        total: s.verifications_week + s.total_pending,
        pending: s.total_pending,
        approved: s.verifications_week,
      })),
    };
    const fallbackVistar = {
      total_sessions: 48,
      avg_reported_attendance: 42,
      avg_digital_attendance: 31,
      fraud_flagged_count: 5,
      overall_gap_pct: 26,
      sahayak_performance: SAHAYAKS.map(s => ({
        sahayak_id: s.id,
        sahayak_name: s.name,
        total_sessions: Math.round(s.verifications_week * 1.3),
        overall_compliance_ratio: s.status === 'excellent' ? 0.92 : s.status === 'good' ? 0.78 : 0.55,
        fraud_flags: s.overdue_15d,
        overall_risk: s.status === 'excellent' ? 'CLEAN' : s.status === 'good' ? 'MODERATE' : 'HIGH',
      })),
      insights: [
        'Suresh Mane has 2 overdue verifications older than 15 days — recommend on-site review.',
        'Wagholi mandal attendance gap is 26 % — exceeds the 20 % policy threshold.',
        'Priya Desai is the strongest performer this week (35 verifications, avg 1.8 days).',
      ],
    };
    const fallbackAppIntel = {
      total_applications: 142,
      by_status: fallbackSummary.by_status,
      by_scheme_category: {
        'Drip Irrigation': 38,
        'PM-KUSUM Solar': 22,
        'Seed Subsidy': 31,
        'PMFBY Insurance': 27,
        'Fertilizer DBT': 16,
        'Other': 8,
      },
    };
    return { fallbackSummary, fallbackVistar, fallbackAppIntel };
  };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetchMandalSummary(mid),
      fetchVistarAnalytics(mid),
      fetchVistarFraudAlerts(mid),
      fetchMKAApplicationIntelligence(mid),
    ]).then(([s, v, f, a]) => {
      const { fallbackSummary, fallbackVistar, fallbackAppIntel } = buildFallbackData();
      setSummary(s.status === 'fulfilled' && s.value ? s.value : fallbackSummary);
      setVistar(v.status === 'fulfilled' && v.value ? v.value : fallbackVistar);
      setFraudSes(f.status === 'fulfilled' ? (f.value?.alerts || []) : []);
      setAppIntel(a.status === 'fulfilled' && a.value ? a.value : fallbackAppIntel);
    }).finally(() => setLoading(false));
  }, [mid]);

  const SUPERVISION_TABS = [
    { id: 'sahayak', icon: 'group',      label: 'Sahayaks' },
    { id: 'vistar',  icon: 'school',     label: 'Krishi Vistar' },
    { id: 'mandal',  icon: 'dashboard',  label: 'Mandal Info' },
  ];

  return (
    <div className="min-h-full dashboard-bg animate-fade-in">

      {/* Main Content Area */}
      <div className="flex flex-col gap-6" style={{ padding: '24px 32px 32px 36px' }}>
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Card 1: Pending Files */}
          <div className="surface-card surface-card-static flex flex-col relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>description</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Pending Files</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">71</span>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-2" style={{ width: '100%' }}>
              <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">Target: &lt; 50</span>
              <div className="flex-1 bg-surface-variant h-1 rounded-full overflow-hidden ml-1">
                <div className="bg-error h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
              <span className="text-[10px] text-error font-data-tabular font-medium flex-shrink-0">12%</span>
            </div>
          </div>
          
          {/* Card 2: Red Alerts */}
          <div className="surface-card surface-card-static flex flex-col relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-label-caps text-[10px] text-error tracking-wider uppercase font-semibold truncate">Red Alerts</span>
            </div>
            <div className="flex items-end gap-2" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-error leading-none tracking-tight">3</span>
              <span className="text-[13px] font-bold text-error" style={{ marginBottom: '3px' }}>High</span>
            </div>
            <div className="mt-auto pt-3">
              <span className="text-[11px] text-on-surface-variant font-medium">9 batches pending</span>
            </div>
          </div>
          
          {/* Card 3: Fraud Prevented */}
          <div className="surface-card surface-card-static flex flex-col relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>security</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Fraud Prevented</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight flex items-baseline gap-1">₹1.05<span className="text-xl">L</span></span>
            </div>
            <div className="mt-auto pt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Across all schemes</p>
            </div>
          </div>
          
          {/* Card 4: Shops Overdue */}
          <div className="surface-card surface-card-static flex flex-col relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>storefront</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Shops Overdue</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">2</span>
            </div>
            <div className="mt-auto pt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Require inspections</p>
            </div>
          </div>
          
          {/* Card 5: PMFBY Claims */}
          <div className="surface-card flex flex-col cursor-pointer relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }} onClick={() => setPmfbyOpen(true)}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>account_balance</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">PMFBY Claims</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">318</span>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant flex-shrink-0"></span>
              <span className="font-body-main text-[11px] text-on-surface-variant font-medium truncate">Processed this month</span>
            </div>
          </div>
          
          {/* Card 6: Avg Approval */}
          <div className="surface-card surface-card-static flex flex-col relative overflow-hidden" style={{ padding: '22px 22px', minHeight: '152px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px', minHeight: '20px' }}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>schedule</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Avg Approval</span>
            </div>
            <div className="flex items-end" style={{ minHeight: '38px' }}>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">4.2d</span>
            </div>
            <div className="mt-auto pt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Target: 3d</p>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ marginTop: '8px' }}>
          {/* Left Column (Spans 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
            {/* Map Container */}
            <div className="surface-card surface-card-static surface-card-lg overflow-hidden flex flex-col min-w-0" style={{ height: '520px' }}>
              <div className="flex justify-between items-center z-10 hairline" style={{ padding: '22px 24px', gap: '16px', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                <div className="min-w-0">
                  <h2 className="font-section-header font-bold text-base text-on-background tracking-tight truncate" style={{ lineHeight: 1.3 }}>Circle — Geo-fenced Command Map</h2>
                  <p className="font-body-main text-xs text-on-surface-variant font-medium truncate" style={{ marginTop: '4px', lineHeight: 1.4 }}>Live spatial analytics and telemetry</p>
                </div>
                <button className="btn-secondary-soft flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span> Layers
                </button>
              </div>
              <div className="relative flex-1 bg-[#f0f3f2] w-full">
                <ActionMap />
              </div>
            </div>

            {/* Sahayak Matrix */}
            <div className="surface-card surface-card-static overflow-hidden flex flex-col min-w-0">
              <div className="flex justify-between items-center hairline" style={{ padding: '22px 24px', gap: '16px', minHeight: '64px', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                <div className="flex items-center min-w-0" style={{ gap: '12px' }}>
                  <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '22px' }}>leaderboard</span>
                  <h3 className="font-section-header font-bold text-base text-on-background tracking-tight truncate" style={{ lineHeight: 1.3 }}>Sahayak Accountability Matrix</h3>
                </div>
                <span className="inline-flex items-center font-bold flex-shrink-0 whitespace-nowrap" style={{ background: '#fff4e6', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.18)', padding: '4px 10px', borderRadius: '8px', fontSize: '10.5px', letterSpacing: '0.04em' }}>
                  {DASHBOARD_KPIS.sahayaks_critical} Critical
                </span>
              </div>
              <div className="p-0 overflow-x-auto w-full">
                <SahayakMatrix sahayaks={SAHAYAKS} />
              </div>
            </div>
          </div>

          {/* Right Column (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
            
            {/* Supervision Tabs Widget */}
            <div className="surface-card surface-card-static flex flex-col min-w-0" style={{ height: '410px' }}>
              {/* Tab bar */}
              <div className="flex hairline rounded-t-[16px]" style={{ gap: '8px', padding: '14px 14px', background: '#f7f8f4', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                {SUPERVISION_TABS.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex-1 flex flex-col items-center justify-center rounded-lg transition-all duration-200"
                      style={{
                        gap: '6px',
                        padding: '10px 6px',
                        minHeight: '52px',
                        background: isActive ? '#033621' : 'transparent',
                        color: isActive ? '#ffffff' : '#717972',
                        boxShadow: isActive ? '0 2px 8px rgba(3, 54, 33, 0.18)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#eef2ee'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'inherit' }}>{tab.icon}</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.04em', color: 'inherit' }}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: '12px', padding: '32px', color: '#717972' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', opacity: 0.4 }}>hourglass_top</span>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Loading supervision data…</span>
                </div>
              ) : (
                <>
                  {activeTab === 'sahayak' && <SahayakSupervisionPanel summary={summary} vistar={vistar} />}
                  {activeTab === 'vistar' && <VistarSupervisionPanel vistar={vistar} fraudSes={fraudSes} />}
                  {activeTab === 'mandal' && <MandalOverviewPanel summary={summary} appIntel={appIntel} vistar={vistar} />}
                </>
              )}
            </div>

            {/* Shop Tracker Widget */}
            <div className="surface-card surface-card-static flex flex-col overflow-hidden min-w-0">
              <div className="flex justify-between items-center hairline" style={{ padding: '22px 24px', gap: '16px', minHeight: '64px', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                <div className="flex items-center min-w-0" style={{ gap: '12px' }}>
                  <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '22px' }}>storefront</span>
                  <h3 className="font-section-header font-bold text-base text-on-background tracking-tight truncate" style={{ lineHeight: 1.3 }}>Krushi Seva Kendra</h3>
                </div>
                <span className="inline-flex items-center font-bold flex-shrink-0 whitespace-nowrap" style={{ background: '#fff4e6', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.18)', padding: '4px 10px', borderRadius: '8px', fontSize: '10.5px', letterSpacing: '0.04em' }}>
                  {DASHBOARD_KPIS.shops_overdue} Overdue
                </span>
              </div>
              <div className="p-0 overflow-x-auto w-full">
                <ShopTracker />
              </div>
            </div>

          </div>
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

