import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useHierarchy } from '../context/HierarchyContext';
import { useToast } from '../hooks/useToast.jsx';
import Button from '../components/ui/Button';
import InsightModal from '../components/ui/InsightModal';
import { fetchApplications, updateApplicationStatus } from '../utils/api';

const getDaysSince = (d) => {
  if (!d) return 0;
  const p = d.split('-');
  const date = p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : new Date(d);
  if (isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date) / 86400000));
};

const RISK_CONFIG = {
  HIGH:   { badgeClass: 'badge-error',   borderColor: '#ef5350', label: 'Risk: HIGH' },
  MEDIUM: { badgeClass: 'badge-pending', borderColor: '#fb8c00', label: 'Risk: MEDIUM' },
  LOW:    { badgeClass: 'badge-verified',borderColor: 'transparent', label: 'Risk: LOW' },
};

/**
 * A visit is "completed" if its remarks contain "Field visit completed".
 * It is merely "pending" if remarks contain "Field" but NOT "completed".
 */
const isVisitCompleted = (remarks = '') =>
  remarks.includes('Field visit completed');

const isVisitPending = (remarks = '') =>
  remarks.includes('Field') && !isVisitCompleted(remarks);

const VisitPlanner = () => {
  const { t, lang } = useLanguage();
  const { currentSahayak } = useHierarchy();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const params = { limit: 500 };
      if (currentSahayak) {
         params.sahayak_id = currentSahayak.sahayak_id;
      }
      const result = await fetchApplications(params);
      setAllApps(result.results || []);
    } catch (err) {
      console.error('VisitPlanner load error:', err);
      addToast(t('Could not load visit data', lang), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentSahayak]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  // Count apps per farmer for multi-app risk detection
  const appCountByFarmer = useMemo(() => {
    const counts = {};
    allApps.forEach(a => { counts[a.farmer_id] = (counts[a.farmer_id] || 0) + 1; });
    return counts;
  }, [allApps]);

  const getRiskLevel = (app) => {
    // After a successful field visit, downgrade to MEDIUM (or LOW if already approved)
    if (isVisitCompleted(app.remarks || '')) {
      return app.status === 'Approved' || app.status === 'Rejected' ? 'LOW' : 'MEDIUM';
    }
    if (app.rejection_reason || (appCountByFarmer[app.farmer_id] || 0) > 3) return 'HIGH';
    if (app.status === 'Under Scrutiny') return 'MEDIUM';
    return 'LOW';
  };

  // Show ALL apps that have any "Field" mention in remarks (both pending and completed)
  const visits = useMemo(() =>
    allApps
      .filter(app => (app.remarks || '').includes('Field'))
      .map(app => ({ ...app, daysSince: getDaysSince(app.application_date) })),
    [allApps]
  );

  const handleAction = async (app, newStatus, remarks, label) => {
    setActionLoading(app.application_id);
    try {
      const updated = await updateApplicationStatus(app.application_id, newStatus, remarks);
      // await postLog({ action: label, application_id: app.application_id, details: remarks });
      setAllApps(prev => prev.map(a =>
        a.application_id === app.application_id ? { ...a, ...updated } : a
      ));
      if (selectedApp?.application_id === app.application_id) {
        setSelectedApp(prev => ({ ...prev, ...updated }));
      }
      addToast(t(`${label}: ${app.farmer_id} → ${newStatus}`, lang), 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || t('Action failed', lang), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const highRiskCount = visits.filter(v => getRiskLevel(v) === 'HIGH').length;

  return (
    <div className="flex-col animate-fade-in mb-8" style={{ margin: 'calc(var(--sp-6) * -1) calc(var(--sp-6) * -1) 0 calc(var(--sp-6) * -1)' }}>
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      {/* Banner */}
      <div style={{ height: '180px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--success-dark)' }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: '64px', opacity: 0.3 }}>map</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--sp-4)', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
          <h2 className="text-xl fw-bold text-white mb-1">{t("Today's Route", lang)}</h2>
          <div className="flex gap-2">
            <span className="badge bg-white text-primary fw-bold">{visits.length} {t('Assigned', lang)}</span>
            <span className="badge badge-error">{highRiskCount} {t('High Risk', lang)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-col gap-4">
        {loading && <div className="text-center text-muted p-4">{t('Loading field visits…', lang)}</div>}

        {!loading && visits.length === 0 && (
          <div className="text-center text-muted p-6">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>directions_off</span>
            <p className="mt-2">{t('No field visits required today.', lang)}</p>
          </div>
        )}

        {visits.map((visit) => {
          const remarks = visit.remarks || '';
          const completed = isVisitCompleted(remarks);
          const pending   = isVisitPending(remarks);

          const riskLevel = getRiskLevel(visit);
          const rc = RISK_CONFIG[riskLevel] || RISK_CONFIG.LOW;
          const isBusy = actionLoading === visit.application_id;

          // ── Button visibility rules ──────────────────────────────────────────
          // Before visit: show "Mark as Visited" + "Investigate" (status=Applied)
          // After visit:  show "Approve" + "Reject"              (completed flag)
          const canMarkVisited = pending && visit.status === 'Applied';
          const canInvestigate = pending && ['Applied', 'Under Scrutiny'].includes(visit.status);
          const canApprove     = completed && ['Applied', 'Under Scrutiny'].includes(visit.status);
          const canReject      = completed && ['Applied', 'Under Scrutiny'].includes(visit.status);

          return (
            <div
              key={visit.application_id}
              className="card p-0"
              style={{ overflow: 'hidden', opacity: isBusy ? 0.65 : 1, borderLeft: `4px solid ${rc.borderColor}` }}
            >
              {/* Card header — click for insight modal */}
              <div className="p-4 flex justify-between items-start" style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(visit)}>
                <div style={{ flex: 1 }}>
                  <h3 className="fw-bold mb-1">{visit.farmer_id || t('Unknown Farmer', lang)}</h3>
                  <p className="text-sm fw-bold text-muted mb-0">{visit.component || '—'}</p>
                  <p className="text-xs text-muted mb-2">{visit.scheme_name || '—'}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`badge ${rc.badgeClass}`}>{t(rc.label, lang)}</span>
                    <span className="badge badge-grey" style={{ fontSize: '10px' }}>{visit.scheme_category || '—'}</span>
                    {completed && (
                      <span
                        className="badge"
                        style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', fontWeight: 700, fontSize: '10px' }}
                      >
                        {t('✓ Visited', lang)}
                      </span>
                    )}
                    {pending && (
                      <span className="badge badge-pending" style={{ fontSize: '10px' }}>{t('Visit Pending', lang)}</span>
                    )}
                    {visit.daysSince <= 7 && <span className="badge badge-blue" style={{ fontSize: '10px' }}>{t('Recent', lang)}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted">{visit.daysSince}{t('d ago', lang)}</span>
              </div>

              {/* Remarks strip */}
              {remarks && (
                <div style={{ padding: '6px 16px', backgroundColor: 'var(--surface-low)', borderTop: '1px solid var(--outline-variant)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {completed
                    ? t('✅ Field visit completed', lang)
                    : `📋 ${remarks}`
                  }
                </div>
              )}

              {/* Action footer */}
              <div className="flex gap-2 p-3" style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)' }}>

                {/* ── PRE-VISIT actions ── */}
                {canMarkVisited && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleAction(visit, 'Under Scrutiny', 'Field visit completed', 'FIELD_VISIT')}
                    disabled={isBusy}
                  >
                    {isBusy ? '…' : t('Mark as Visited', lang)}
                  </Button>
                )}
                {canInvestigate && (
                  <button
                    disabled={isBusy}
                    onClick={() => handleAction(visit, 'Under Scrutiny', 'Marked for investigation', 'INVESTIGATE')}
                    style={{ flexShrink: 0, padding: '0 14px', backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    {isBusy ? '…' : t('🔍 Investigate', lang)}
                  </button>
                )}

                {/* ── POST-VISIT actions ── */}
                {canApprove && (
                  <button
                    disabled={isBusy}
                    onClick={() => handleAction(visit, 'Approved', 'Approved after field visit', 'APPROVE')}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    {isBusy ? '…' : t('✓ Approve', lang)}
                  </button>
                )}
                {canReject && (
                  <button
                    disabled={isBusy}
                    onClick={() => handleAction(visit, 'Rejected', 'Rejected after field visit', 'REJECT')}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    {isBusy ? '…' : t('✕ Reject', lang)}
                  </button>
                )}

                {/* Capture photo link — passes appId as query param */}
                {(canMarkVisited || completed) && (
                  <button
                    disabled={isBusy}
                    onClick={() => navigate(`/capture-photo?appId=${visit.application_id}`)}
                    style={{ flexShrink: 0, padding: '0 12px', backgroundColor: '#e3f2fd', color: '#0055A4', border: '1px solid #bbdefb', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
                    {t('Photo', lang)}
                  </button>
                )}

                {/* Terminal state — no more actions */}
                {!canMarkVisited && !canInvestigate && !canApprove && !canReject && (
                  <div className="text-xs text-muted text-center" style={{ width: '100%', padding: '6px' }}>
                    {t('Status:', lang)} <strong>{visit.status}</strong> {t('— No further actions available', lang)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitPlanner;
