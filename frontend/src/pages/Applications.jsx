import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHierarchy } from '../context/HierarchyContext';
import { useToast } from '../hooks/useToast.jsx';
import SearchInput from '../components/ui/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import InsightModal from '../components/ui/InsightModal';
import { fetchApplications, updateApplicationStatus } from '../utils/api';
import { fetchClaims, updateClaim } from '../shared/api/services';
import usePolling from '../hooks/usePolling';

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   color: '#c62828', bg: '#ffebee', dot: '#ef5350' },
  MEDIUM: { label: 'Medium', color: '#e65100', bg: '#fff3e0', dot: '#fb8c00' },
  NORMAL: { label: 'Normal', color: '#0055A4', bg: '#e3f2fd', dot: '#42a5f5' },
  LOW:    { label: 'Low',    color: '#388e3c', bg: '#e8f5e9', dot: '#66bb6a' },
};

const WORKFLOW_COLORS = {
  'Under Administrative Review': '#e65100',
  'Geo Verification Completed': '#1565c0',
  'PMFBY Validation Pending': '#6a1b9a',
  'DBT Initiated': '#2e7d32',
  'Rainfall Anomaly Detected': '#c62828',
  'High Priority Claim': '#c62828',
  Approved: '#2e7d32',
  Rejected: '#c62828',
  Applied: '#e65100',
};

const getWorkflowStyle = (stage) => {
  const color = WORKFLOW_COLORS[stage] || '#717972';
  return { color, bg: color + '18' };
};

const getPriority = (app) => {
  const stage = app.workflowStage || app.status || '';
  const remarks = app.reviewRemarks || app.remarks || '';
  const visitCompleted = remarks.includes('Field visit completed');
  const visitPending = remarks.includes('Field') && !visitCompleted;
  if (stage === 'High Priority Claim' || stage === 'Rainfall Anomaly Detected') return 'HIGH';
  if (stage === 'Under Administrative Review' && visitPending) return 'HIGH';
  if (stage === 'Under Administrative Review' && visitCompleted) return 'MEDIUM';
  if (stage === 'Applied' || stage === 'PMFBY Validation Pending') return 'MEDIUM';
  if (stage === 'Rejected') return 'LOW';
  return 'NORMAL';
};

const parseDateStr = (d) => {
  if (!d) return null;
  const p = d.split('-');
  return p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : new Date(d);
};

const getDaysSince = (d) => {
  const date = parseDateStr(d);
  if (!date || isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date) / 86400000));
};

const mapBackendClaim = (claim) => ({
  application_id: claim.farmerId || claim.id || claim.application_id,
  farmer_id: claim.farmerId || '—',
  farmer_name: claim.farmerName || claim.farmer_name,
  workflowStage: claim.workflowStage || claim.status || 'Applied',
  status: claim.workflowStage || claim.status || 'Applied',
  confidenceScore: claim.confidenceScore ?? null,
  geoVerified: claim.geoVerified ?? null,
  rainfallMatched: claim.rainfallMatched ?? null,
  duplicateRisk: claim.duplicateRisk ?? null,
  reviewRemarks: claim.reviewRemarks || claim.remarks || '',
  assignedOfficer: claim.assignedOfficer || '',
  landParcelId: claim.landParcelId || '',
  component: claim.scheme || claim.component || '—',
  scheme_name: claim.scheme || claim.scheme_name || '—',
  scheme_category: claim.scheme_category || 'General',
  application_date: claim.applicationDate || claim.application_date || '2026-05-01',
  auditTrail: claim.auditTrail || [],
  _fromBackend: true,
});

const Applications = () => {
  const { t, lang } = useLanguage();
  const { currentSahayak } = useHierarchy();
  const { addToast } = useToast();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [apiError, setApiError] = useState(null);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [highOnly, setHighOnly] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const loadData = useCallback(async () => {
    try {
      let data = [];
      try {
        const backendClaims = await fetchClaims();
        data = (Array.isArray(backendClaims) ? backendClaims : backendClaims.results || backendClaims.claims || []).map(mapBackendClaim);
      } catch (_) {
        const fallback = await fetchApplications({ limit: 500 });
        data = (fallback.results || []).map((a) => ({ ...a, _fromBackend: false }));
      }
      setApps(data.map(enrich));
      setApiError(null);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApiError(err.message || 'Failed to load');
      addToast(t('Failed to load applications.', lang), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentSahayak, addToast, t, lang]);

  const enrich = (app) => ({
    ...app,
    priority: getPriority(app),
    daysSince: getDaysSince(app.application_date),
  });

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadData]);

  usePolling(loadData, 5000, !loading);

  const handleStatusAction = async (app, newStatus, remarks, label) => {
    setActionLoading(app.application_id);
    try {
      let updated;
      try {
        updated = await updateClaim(app.farmer_id, { workflowStage: newStatus, reviewRemarks: remarks });
      } catch (_) {
        updated = await updateApplicationStatus(app.application_id, newStatus, remarks);
      }
      setApps(prev => prev.map(a =>
        a.application_id === app.application_id ? enrich({ ...a, ...updated, status: newStatus, workflowStage: newStatus }) : a
      ));
      if (selectedApp?.application_id === app.application_id) {
        setSelectedApp(enrich({ ...selectedApp, ...updated, status: newStatus, workflowStage: newStatus }));
      }
      const displayId = app.farmer_id || app.application_id;
      addToast(`${displayId} → ${t(newStatus, lang)}`, 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || t('Failed to update status', lang), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  let displayed = apps.filter(app => {
    if (search) {
      const q = search.toLowerCase();
      const farmerId = (app.farmer_id || '').toLowerCase();
      const officer = (app.assignedOfficer || '').toLowerCase();
      if (!farmerId.includes(q) && !officer.includes(q)) return false;
    }
    if (statusFilter && app.status !== statusFilter) return false;
    if (priorityFilter && app.priority !== priorityFilter) return false;
    if (highOnly && app.priority !== 'HIGH') return false;
    return true;
  });
  displayed = [...displayed].sort((a, b) => {
    if (sortOption === 'date_desc') return a.daysSince - b.daysSince;
    if (sortOption === 'date_asc') return b.daysSince - a.daysSince;
    if (sortOption === 'priority') {
      const m = { HIGH: 1, MEDIUM: 2, NORMAL: 3, LOW: 4 };
      return (m[a.priority] || 5) - (m[b.priority] || 5);
    }
    return 0;
  });

  const highCount = apps.filter(a => a.priority === 'HIGH').length;

  return (
    <div className="flex-col gap-4 animate-fade-in">
      <InsightModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onApprove={selectedApp && ['Applied', 'Under Administrative Review', 'PMFBY Validation Pending', 'Under Scrutiny'].includes(selectedApp.status)
          ? () => handleStatusAction(selectedApp, 'Approved', 'Approved via dashboard', 'APPROVE')
          : null}
        onReject={selectedApp && ['Applied', 'Under Administrative Review', 'PMFBY Validation Pending', 'Under Scrutiny'].includes(selectedApp.status)
          ? () => handleStatusAction(selectedApp, 'Rejected', 'Rejected via dashboard', 'REJECT')
          : null}
        actionLoading={actionLoading === selectedApp?.application_id}
      />

      <header className="mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl fw-bold text-primary-dark">
            {t('Claims', lang)}
          </h2>
          <span className="badge badge-error" style={{ fontSize: '12px' }}>{highCount} {t('High Priority', lang)}</span>
        </div>
        {currentSahayak && (
          <div className="badge badge-verified mt-1" style={{ fontSize: '10px', display: 'inline-block' }}>
            {t('Your Assigned Claims', lang)}
          </div>
        )}
        <p className="text-sm text-muted mt-1">
          {loading ? t('Loading…', lang) : `${displayed.length} ${t('of', lang)} ${apps.length} ${t('claims', lang)}`}
        </p>
      </header>

      <div className="sticky" style={{ top: 'var(--header-height)', backgroundColor: 'var(--surface)', padding: 'var(--sp-2) 0', zIndex: 10 }}>
        <SearchInput
          placeholder={t('Search Farmer ID or Officer...', lang)}
          value={search}
          onChange={setSearch}
          onFilterClick={() => setShowFilters(!showFilters)}
        />
        <div className="flex items-center gap-3 mt-2">
          <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={highOnly} onChange={e => setHighOnly(e.target.checked)} style={{ accentColor: '#c62828', width: '16px', height: '16px' }} />
            <span style={{ color: highOnly ? '#c62828' : 'inherit', fontWeight: highOnly ? 700 : 400 }}>{t('Show HIGH priority only', lang)}</span>
          </label>
        </div>

        {showFilters && (
          <div className="flex-col gap-2 mt-3 p-3" style={{ backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)' }}>
            <div className="flex gap-2">
              <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px', fontSize: '12px', flex: 1 }}>
                <option value="">{t('All Statuses', lang)}</option>
                <option value="Under Administrative Review">{t('Under Administrative Review', lang)}</option>
                <option value="Geo Verification Completed">{t('Geo Verification Completed', lang)}</option>
                <option value="PMFBY Validation Pending">{t('PMFBY Validation Pending', lang)}</option>
                <option value="DBT Initiated">{t('DBT Initiated', lang)}</option>
                <option value="Rainfall Anomaly Detected">{t('Rainfall Anomaly Detected', lang)}</option>
                <option value="Applied">{t('Applied', lang)}</option>
                <option value="Approved">{t('Approved', lang)}</option>
                <option value="Rejected">{t('Rejected', lang)}</option>
              </select>
              <select className="form-input" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '6px', fontSize: '12px', flex: 1 }}>
                <option value="">{t('All Priorities', lang)}</option>
                <option value="HIGH">{t('High Priority', lang)}</option>
                <option value="MEDIUM">{t('Medium Priority', lang)}</option>
                <option value="NORMAL">{t('Normal Priority', lang)}</option>
                <option value="LOW">{t('Low Priority', lang)}</option>
              </select>
            </div>
            <select className="form-input" value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ padding: '6px', fontSize: '12px', width: '100%' }}>
              <option value="date_desc">{t('Newest First', lang)}</option>
              <option value="date_asc">{t('Oldest First', lang)}</option>
              <option value="priority">{t('By Priority (High → Low)', lang)}</option>
            </select>
          </div>
        )}
      </div>

      {apiError && (
        <div className="card p-4" style={{ borderLeft: '4px solid #c62828', backgroundColor: '#ffebee' }}>
          <p className="text-sm fw-bold" style={{ color: '#c62828' }}>{t('API Error', lang)}: {apiError}</p>
          <button className="btn btn-sm mt-2" onClick={() => { setLoading(true); setApiError(null); loadData(); }} style={{ color: '#1565c0' }}>
            {t('Retry', lang)}
          </button>
        </div>
      )}

      <div className="flex-col gap-3 mt-2 mb-6">
        {loading && (
          <div className="text-center p-6">
            <div className="spinner" style={{ width: 32, height: 32, border: '3px solid #e2e3df', borderTopColor: '#396940', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <p className="text-muted mt-2 text-sm">{t('Loading claims…', lang)}</p>
          </div>
        )}

        {!loading && !apiError && displayed.length === 0 && (
          <div className="text-center text-muted p-6">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>search_off</span>
            <p className="mt-2">{t('No claims match the selected filters.', lang)}</p>
          </div>
        )}

        {!loading && displayed.map((app) => {
          const pc = PRIORITY_CONFIG[app.priority] || PRIORITY_CONFIG.NORMAL;
          const isBusy = actionLoading === app.application_id;
          const canApprove = ['Applied', 'Under Administrative Review', 'PMFBY Validation Pending', 'Under Scrutiny'].includes(app.status);
          const canReject = ['Applied', 'Under Administrative Review', 'PMFBY Validation Pending', 'Under Scrutiny'].includes(app.status);
          const ws = WORKFLOW_COLORS[app.workflowStage || app.status];
          const showConfidence = app.confidenceScore != null;
          const showGeo = app.geoVerified != null;
          const showRainfall = app.rainfallMatched != null;
          const showDuplicate = app.duplicateRisk != null;

          return (
            <article
              key={app.application_id}
              className="card flex-col gap-0 p-0"
              style={{ borderLeft: `4px solid ${pc.dot}`, overflow: 'hidden', opacity: isBusy ? 0.6 : 1 }}
            >
              <div className="p-4 flex justify-between items-start" style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(app)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-md fw-bold" style={{ margin: 0 }}>{app.farmer_id || '—'}</h2>
                    {app.assignedOfficer && (
                      <span className="badge badge-grey" style={{ fontSize: '10px' }}>{t('Officer', lang)}: {app.assignedOfficer}</span>
                    )}
                    {app.daysSince <= 7 && <span className="badge badge-blue" style={{ fontSize: '10px' }}>{t('Recently Applied', lang)}</span>}
                    {app.priority === 'HIGH' && <span className="badge badge-error" style={{ fontSize: '10px' }}>{t('Action Required', lang)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: ws ? ws + '18' : '#f3f4f0', color: ws || '#717972', fontWeight: 600 }}>
                      {app.workflowStage || app.status || t('Unknown', lang)}
                    </span>
                    {showConfidence && (
                      <span className="badge badge-grey" style={{ fontSize: '10px' }}>
                        {t('Confidence', lang)}: {(app.confidenceScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1" style={{ margin: 0 }}>{app.component || '—'}</p>
                  <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>{app.scheme_name || '—'}</p>
                  {(showGeo || showRainfall || showDuplicate) && (
                    <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                      {showGeo && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: app.geoVerified ? '#e8f5e9' : '#ffebee', color: app.geoVerified ? '#2e7d32' : '#c62828' }}>
                          {app.geoVerified ? '✓' : '✗'} {t('Geo Verified', lang)}
                        </span>
                      )}
                      {showRainfall && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: app.rainfallMatched ? '#e8f5e9' : '#fff3e0', color: app.rainfallMatched ? '#2e7d32' : '#e65100' }}>
                          {app.rainfallMatched ? '✓' : '⚠'} {t('Rainfall Matched', lang)}
                        </span>
                      )}
                      {showDuplicate && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: !app.duplicateRisk ? '#e8f5e9' : '#ffebee', color: !app.duplicateRisk ? '#2e7d32' : '#c62828' }}>
                          {app.duplicateRisk ? `${t('Duplicate Risk', lang)}: ${app.duplicateRisk}` : t('No Duplicate', lang)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-col items-end gap-2" style={{ flexShrink: 0 }}>
                  <StatusBadge status={app.status || t('Unknown', lang)} />
                  <span style={{ fontSize: '11px', backgroundColor: pc.bg, color: pc.color, padding: '2px 8px', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pc.dot, display: 'inline-block' }} />
                    {t(pc.label, lang)}
                  </span>
                </div>
              </div>

              {(canApprove || canReject) && (
                <div className="flex gap-2 px-4 pb-3" onClick={e => e.stopPropagation()}>
                  {canApprove && (
                    <button
                      className="btn btn-sm"
                      disabled={isBusy}
                      style={{ flex: 1, backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 'var(--radius)', padding: '6px', fontSize: '12px', fontWeight: 700 }}
                      onClick={() => handleStatusAction(app, 'Approved', 'Approved via claims page', 'APPROVE')}
                    >
                      {isBusy ? '…' : t('✓ Approve', lang)}
                    </button>
                  )}
                  {canReject && (
                    <button
                      className="btn btn-sm"
                      disabled={isBusy}
                      style={{ flex: 1, backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 'var(--radius)', padding: '6px', fontSize: '12px', fontWeight: 700 }}
                      onClick={() => handleStatusAction(app, 'Rejected', 'Rejected via claims page', 'REJECT')}
                    >
                      {isBusy ? '…' : t('✕ Reject', lang)}
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)', padding: '8px 16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-grey" style={{ fontSize: '10px' }}>{app.scheme_category || '—'}</span>
                  {app.landParcelId && (
                    <span style={{ fontSize: '10px', color: '#717972' }}>{t('Parcel', lang)}: {app.landParcelId}</span>
                  )}
                </div>
                <span className={`text-xs ${app.priority === 'HIGH' ? 'text-error fw-bold' : 'text-muted'}`}>
                  {app.daysSince}{t('d ago', lang)} • {app.application_date || '—'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Applications;