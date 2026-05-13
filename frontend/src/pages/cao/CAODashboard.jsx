import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHierarchy } from '../../context/HierarchyContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import ActionMap from './components/ActionMap';
import ShopTracker from './components/ShopTracker';
import SahayakMatrix from './components/SahayakMatrix';
import PMFBYPanel from './components/PMFBYPanel';
const DASHBOARD_KPIS = {};
const PMFBY_EVENTS = [];
import {
  fetchMandalSummary,
  fetchVistarAnalytics,
  fetchVistarFraudAlerts,
  fetchMKAApplicationIntelligence,
} from '../../utils/api';
import './cao.css';

/* ── Shared design primitives ───────────────────────────────────────────────── */
const PANEL_BORDER = '#e2e3df';
const PANEL_DIVIDER = '#ebece8';
const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';
const LABEL_GREY = '#9aa19c';

const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      border: `1px solid ${PANEL_BORDER}`,
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 152,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 28, marginBottom: 14 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#f3f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#717972' }}>{icon}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717972', lineHeight: 1.3 }}>{label}</span>
    </div>
    {children ? (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>{children}</div>
    ) : (
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED }}>{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 6, background: '#f3f4f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
          </div>
        )}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, marginTop: 'auto', paddingTop: 12, color: subColor }}>
            {subIcon && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{subIcon}</span>}
            {sub}
          </div>
        )}
      </>
    )}
  </div>
);

const RiskBadge = ({ risk }) => {
  const cfg = {
    HIGH: { bg: '#fff0ee', color: '#ba1a1a', border: '#ffdad6', label: 'HIGH RISK' },
    MODERATE: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'MODERATE' },
    CLEAN: { bg: '#e8f0ea', color: '#1f4d36', border: '#c8e0d0', label: 'CLEAN' },
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
  const [summary, setSummary] = useState(null);
  const [vistar, setVistar] = useState(null);
  const [fraudSes, setFraudSes] = useState([]);
  const [appIntel, setAppIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mandals, currentMandal } = useHierarchy();
  const { buildSahayakMatrixForMandal, stats } = useKrishiData();

  const mandal = useMemo(() => {
    if (currentMandal) return currentMandal;
    if (user?.district_id) {
      const m = mandals.find(
        (x) => Number(x.district_id) === Number(user.district_id),
      );
      if (m) return m;
    }
    return (
      mandals[0] || {
        mandal_id: 'C001',
        name: 'Agriculture circle',
        circle_id: 1,
        district_name: '',
        taluka_name: '',
      }
    );
  }, [currentMandal, mandals, user?.district_id]);

  const mid = mandal?.mandal_id || 'C001';

  const sahayakMatrixRows = useMemo(
    () => buildSahayakMatrixForMandal(mandal),
    [mandal, buildSahayakMatrixForMandal],
  );

  const buildFallbackData = useCallback(() => {
    const rows =
      sahayakMatrixRows.length > 0
        ? sahayakMatrixRows
        : [
          {
            id: 'KS0',
            name: 'Demo Sahayak',
            status: 'good',
            verifications_week: 12,
            avg_days: 3,
            overdue_15d: 1,
            circle: mandal?.name || '—',
            villages: ['Demo village'],
            trend: [3, 4, 5, 4, 3, 5, 4],
            total_pending: 8,
            last_field_visit: '—',
            whatsapp: '919999999999',
          },
        ];
    const totalSurveys = stats?.totalSurveys ?? 4046;
    const fallbackSummary = {
      total_applications: Math.min(900, Math.round(totalSurveys / 5)),
      by_status: {
        Applied: 18,
        'Under Scrutiny': 12,
        Approved: 95,
        Rejected: 17,
      },
      fraud_alerts: rows.reduce((sum, s) => sum + s.overdue_15d, 0),
      sahayak_breakdown: rows.map((s) => ({
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
      sahayak_performance: rows.map((s) => ({
        sahayak_id: s.id,
        sahayak_name: s.name,
        total_sessions: Math.round(s.verifications_week * 1.3),
        overall_compliance_ratio:
          s.status === 'excellent'
            ? 0.92
            : s.status === 'good'
              ? 0.78
              : 0.55,
        fraud_flags: s.overdue_15d,
        overall_risk:
          s.status === 'excellent'
            ? 'CLEAN'
            : s.status === 'good'
              ? 'MODERATE'
              : 'HIGH',
      })),
      insights: [
        `${mandal?.district_name || 'District'} — ${mandal?.name || 'circle'} linked to CSV hierarchy (${rows.length} Krushi Sahayak profile${rows.length === 1 ? '' : 's'}).`,
        'Attendance and verification metrics below are synthesized for demo when the API is offline.',
        `Statewide survey records in dataset: ${totalSurveys.toLocaleString('en-IN')}.`,
      ],
    };
    const fallbackAppIntel = {
      total_applications: fallbackSummary.total_applications,
      by_status: fallbackSummary.by_status,
      by_scheme_category: {
        'Drip Irrigation': 38,
        'PM-KUSUM Solar': 22,
        'Seed Subsidy': 31,
        'PMFBY Insurance': 27,
        'Fertilizer DBT': 16,
        Other: 8,
      },
    };
    return { fallbackSummary, fallbackVistar, fallbackAppIntel };
  }, [sahayakMatrixRows, mandal, stats]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetchMandalSummary(mid),
      fetchVistarAnalytics(mid),
      fetchVistarFraudAlerts(mid),
      fetchMKAApplicationIntelligence(mid),
    ]).then(([s, v, f, a]) => {
      const { fallbackSummary, fallbackVistar, fallbackAppIntel } =
        buildFallbackData();
      setSummary(s.status === 'fulfilled' && s.value ? s.value : fallbackSummary);
      setVistar(v.status === 'fulfilled' && v.value ? v.value : fallbackVistar);
      setFraudSes(f.status === 'fulfilled' ? (f.value?.alerts || []) : []);
      setAppIntel(a.status === 'fulfilled' && a.value ? a.value : fallbackAppIntel);
    }).finally(() => setLoading(false));
  }, [mid, buildFallbackData]);

  const SUPERVISION_TABS = [
    { id: 'sahayak', icon: 'group', label: 'Sahayaks' },
    { id: 'vistar', icon: 'school', label: 'Krishi Vistar' },
    { id: 'mandal', icon: 'dashboard', label: 'Mandal Info' },
  ];

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        <KpiCard icon="description" label="Pending Files" value="71" sub="Target: < 50" progress={12} subColor="#ba1a1a" />
        <KpiCard icon="warning" label="Red Alerts" value="3" sub="9 batches pending" subIcon="warning" subColor="#ba1a1a" />
        <KpiCard icon="security" label="Fraud Prevented" value="1.05" unit="L" sub="Across all schemes" />
        <KpiCard icon="storefront" label="Shops Overdue" value="2" sub="Require inspections" />
        <KpiCard icon="account_balance" label="PMFBY Claims" value="318" sub="Processed this month" onClick={() => setPmfbyOpen(true)} />
        <KpiCard icon="schedule" label="Avg Approval" value="4.2" unit="d" sub="Target: 3d" />
      </div>

      {/* ── Main Grid: Map + Right Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Map Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f0', flexShrink: 0, gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>Circle — Geo-fenced Command Map</h2>
              <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4, lineHeight: 1.4 }}>Live spatial analytics and telemetry</p>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 380 }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, color: '#717972' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.4 }}>hourglass_top</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Loading...</span>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'sahayak' && <SahayakSupervisionPanel summary={summary} vistar={vistar} />}
              {activeTab === 'vistar' && <VistarSupervisionPanel vistar={vistar} fraudSes={fraudSes} />}
              {activeTab === 'mandal' && <MandalOverviewPanel summary={summary} appIntel={appIntel} vistar={vistar} />}
            </div>
          )}
        </div>

        {/* Shop Tracker Widget - Condensed */}
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972' }}>storefront</span>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>Krushi Seva Kendra</h3>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#b45309', background: 'rgba(255,244,230,0.6)', padding: '3px 8px', borderRadius: 6 }}>{DASHBOARD_KPIS.shops_overdue} Overdue</span>
          </div>
          <div style={{ padding: '0px' }}>
            <ShopTracker condensed />
          </div>
        </div>
      </div>

      {/* ── Sahayak Accountability Table (Full Width) ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 28px', borderBottom: '1px solid #f3f4f0' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(3, 54, 33, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#033621' }}>leaderboard</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>
              Sahayak Accountability Matrix
            </h3>
            <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4 }}>Live performance and compliance telemetry across the circle</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#b45309', background: '#fff4e6', border: '1px solid rgba(180, 83, 9, 0.18)', padding: '6px 12px', borderRadius: 8 }}>
            {DASHBOARD_KPIS.sahayaks_critical} Critical Sahayaks
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <SahayakMatrix sahayaks={SAHAYAKS} />
        </div>
      </div>

      {pmfbyOpen && (
        <PMFBYPanel events={PMFBY_EVENTS} onClose={() => setPmfbyOpen(false)} />
      )}
    </div>
  );
};

export default CAODashboard;

