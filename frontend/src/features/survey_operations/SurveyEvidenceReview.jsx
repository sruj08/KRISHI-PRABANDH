import React, { useState, useCallback } from 'react';
import GeoVerifiedMedia from '../../shared/components/GeoVerifiedMedia';
import { fetchSurveyReport, fetchSurveyGrievances, updateSurveyAction, getApiOrigin } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

const SURVEY_ID = 'surveyId';
const STATUS_COLORS = {
  'Pending Sahayak Verification': '#B45309',
  'Geo Validation Complete': '#396940',
  'Escalated to Circle Officer': '#ba1a1a',
  'Re-Survey Requested': '#1f4d36',
  'Verification Completed': '#396940',
};

const SeverityBadge = ({ level }) => {
  const sev = (level || 'LOW').toUpperCase();
  const colors = { CRITICAL: '#ba1a1a', HIGH: '#e65100', MODERATE: '#b45309', LOW: '#396940' };
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border"
      style={{ background: colors[sev] || colors.LOW, color: '#fff', borderColor: colors[sev] || colors.LOW }}>
      {sev}
    </span>
  );
};

const PhaseTimeline = ({ phases = [] }) => {
  if (phases.length === 0) {
    return <div className="text-gray-500 font-mono text-xs italic py-4 text-center">[ NO PHASE DATA AVAILABLE ]</div>;
  }
  return (
    <div className="space-y-3">
      {phases.map((p, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full border-2 ${p.completed ? 'bg-primary border-primary' : 'bg-white border-gray-400'}`} />
            {i < phases.length - 1 && <div className="w-px h-6 bg-gray-300" />}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{p.name || p.phase || `Phase ${i + 1}`}</span>
              {p.status && (
                <span className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: STATUS_COLORS[p.status] || '#717972' }}>
                  {p.status}
                </span>
              )}
            </div>
            {p.remarks && <p className="text-[11px] text-gray-600 font-mono mt-0.5">{p.remarks}</p>}
            {p.completedAt && <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.completedAt}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

const GrievancePanel = ({ grievances = [], loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 font-mono text-xs gap-2">
        <span className="material-symbols-outlined text-sm animate-spin">radar</span>
        LOADING GRIEVANCES...
      </div>
    );
  }
  if (grievances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 font-mono text-xs gap-2">
        <span className="material-symbols-outlined text-lg opacity-40">check_circle</span>
        <span>No grievances reported for this survey.</span>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {grievances.map((g, i) => (
        <div key={g.grievanceId || g.id || i} className="bg-white p-4 border border-gray-300 rounded-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">
              {g.grievanceId || `GRIEVANCE #${i + 1}`}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              (g.status || '').toLowerCase() === 'resolved'
                ? 'bg-success/10 text-success border-success/30'
                : (g.status || '').toLowerCase() === 'rejected'
                ? 'bg-error/10 text-error border-error/30'
                : 'bg-amber/10 text-amber-dark border-amber/30'
            }`}>
              {g.status || 'PENDING'}
            </span>
          </div>
          <p className="text-xs text-gray-800 font-mono leading-relaxed">{g.description || g.detail || g.message || '—'}</p>
          {g.submittedAt && (
            <p className="text-[10px] text-gray-500 font-mono mt-2">{g.submittedAt}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-b-0">
    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">{label}</span>
    <span className="text-xs text-gray-900 font-mono font-medium text-right max-w-[60%] truncate">{value || '—'}</span>
  </div>
);

const SurveyEvidenceReview = ({ survey, onBack }) => {
  const surveyId = survey?.reportId || survey?.id || survey?.[SURVEY_ID];
  const [report, setReport] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grievLoading, setGrievLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadReport = useCallback(async () => {
    if (!surveyId) return;
    try {
      const data = await fetchSurveyReport(surveyId);
      setReport(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const loadGrievances = useCallback(async () => {
    if (!surveyId) return;
    try {
      const data = await fetchSurveyGrievances(surveyId);
      const arr = Array.isArray(data) ? data : data.grievances || data.results || [];
      setGrievances(arr);
    } catch (_) {
    } finally {
      setGrievLoading(false);
    }
  }, [surveyId]);

  usePolling(loadReport, 5000);
  usePolling(loadGrievances, 5000);

  const handleAction = async (action) => {
    if (!surveyId || actionLoading) return;
    setActionLoading(action);
    try {
      await updateSurveyAction(surveyId, { action });
      await loadReport();
    } catch (_) {
    } finally {
      setActionLoading(null);
    }
  };

  if (!survey) return null;

  const r = report || survey;
  const reportPhases = r.phases || r.report?.phases || [];
  const firstVideo = (r.videos && r.videos.length > 0) ? r.videos[0] : null;
  const firstImage = (r.images && r.images.length > 0) ? r.images[0] : null;
  let evidenceUrl = firstVideo || firstImage || r.mediaUrl || r.evidenceUrl || r.imageUrl || r.media?.[0]?.url || 'https://images.unsplash.com/photo-1592982537447-7440770bfc9c?q=80&w=2069&auto=format&fit=crop';
  if (evidenceUrl.startsWith('/uploads')) {
    evidenceUrl = `${getApiOrigin()}${evidenceUrl}`;
  }
  const evidenceType = firstVideo ? 'video' : (firstImage ? 'image' : (r.mediaType || r.evidenceType || 'image'));
  const gps = r.gps || r.geoCoordinates || r.gpsCoordinate || r.location || (r.lat && r.lng ? { lat: r.lat, lng: r.lng } : { lat: 18.5204, lng: 73.8567 });
  const confidence = r.confidenceScore != null ? (r.confidenceScore * 100).toFixed(0) : survey.confidenceScore != null ? (survey.confidenceScore * 100).toFixed(0) : null;

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-surface font-body text-gray-900 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500 font-mono">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">radar</span>
          <span className="text-sm">LOADING SURVEY REPORT: {surveyId}</span>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex flex-col h-full bg-surface font-body text-gray-900 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500 font-mono">
          <span className="material-symbols-outlined text-4xl text-error">error_outline</span>
          <span className="text-sm text-error">FAILED TO LOAD REPORT</span>
          <span className="text-xs text-gray-500">{error}</span>
          <button onClick={onBack} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded">
            BACK TO QUEUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface font-body text-gray-900">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-300 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-gray-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-none"
          >
            <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
            BACK TO QUEUE
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-widest uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">folder_special</span>
              Report: {r.reportId || surveyId}
            </h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-mono mt-1 flex items-center gap-3">
              <span>Farmer: {r.farmerName || survey.farmerName || r.farmer || survey.farmer || '—'}</span>
              <span>•</span>
              <span>Village: {r.village || survey.village || '—'}</span>
              <span>•</span>
              <span>Crop: {r.cropType || survey.cropType || r.crop || survey.crop || '—'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge level={r.severityLevel || survey.severityLevel} />
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider border border-gray-300 px-2 py-1 rounded bg-gray-50">
            {r.workflowStage || survey.workflowStage || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* LEFT: Evidence + Report Details */}
        <div className="w-3/5 p-6 border-r border-gray-300 overflow-y-auto relative z-10 custom-scrollbar bg-white">
          {/* Geo Verified Media */}
          <h2 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">videocam</span>
            Field Evidence
          </h2>
          <div className="rounded-sm overflow-hidden border border-gray-300 bg-gray-100 mb-6">
            <GeoVerifiedMedia
              url={evidenceUrl}
              type={evidenceType}
              gps={gps}
              timestamp={r.timestamp || survey.timestamp || r.submittedAt || survey.submittedAt}
              aiConfidence={confidence}
            />
          </div>

          {/* Phase Timeline */}
          <h2 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">account_tree</span>
            Workflow Phases
          </h2>
          <div className="bg-gray-50 p-4 border border-gray-300 rounded-sm mb-6">
            <PhaseTimeline phases={reportPhases} />
          </div>

          {/* Investigation Details */}
          <h2 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">search_insights</span>
            Investigation Details
          </h2>
          <div className="bg-gray-50 p-4 border border-gray-300 rounded-sm mb-6">
            {(r.investigation || r.investigationDetails || r.damageAssessment) ? (
              <div className="space-y-3 text-xs font-mono text-gray-800">
                {(r.investigation?.details || r.investigationDetails?.details || [
                  { label: 'Damage Pattern', value: r.investigation?.damagePattern || r.damagePattern || 'Waterlogging (Severe)' },
                  { label: 'Estimated Loss', value: r.investigation?.estimatedLoss || r.estimatedLoss || '60-70%' },
                  { label: 'Affected Area', value: r.investigation?.affectedArea || r.affectedArea || '2.5 Acres' },
                  { label: 'Crop Stage', value: r.investigation?.cropStage || r.cropStage || 'Flowering Stage' },
                ]).map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-mono text-xs italic text-center py-4">[ NO INVESTIGATION DETAILS AVAILABLE ]</div>
            )}
          </div>

          {/* Evaluation & Summary */}
          <h2 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">summarize</span>
            Evaluation Summary
          </h2>
          <div className="bg-gray-50 p-4 border border-gray-300 rounded-sm">
            {r.evaluation || r.summary || r.reviewRemarks || survey.reviewRemarks ? (
              <div className="text-xs font-mono text-gray-800 leading-relaxed">
                {r.evaluation?.conclusion || r.summary?.conclusion || r.reviewRemarks || survey.reviewRemarks || (r.evaluation ? JSON.stringify(r.evaluation) : r.summary ? JSON.stringify(r.summary) : 'No remarks provided.')}
              </div>
            ) : (
              <div className="text-gray-500 font-mono text-xs italic text-center py-4">[ NO EVALUATION SUMMARY AVAILABLE ]</div>
            )}
          </div>
        </div>

        {/* RIGHT: Grievances + Metadata + Actions */}
        <div className="w-2/5 p-6 bg-surface overflow-y-auto relative z-10 custom-scrollbar flex flex-col gap-6">
          {/* Action Buttons */}
          <div className="bg-white p-4 border border-gray-300 rounded-sm">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('verify')}
                disabled={actionLoading === 'verify'}
                className="px-3 py-2 bg-primary border border-primary-dark text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-primary-dark transition-none disabled:opacity-50"
              >
                {actionLoading === 'verify' ? (
                  <span className="material-symbols-outlined text-sm animate-spin">radar</span>
                ) : 'Verify'}
              </button>
              <button
                onClick={() => handleAction('resurvey')}
                disabled={actionLoading === 'resurvey'}
                className="px-3 py-2 bg-amber border border-amber-dark text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-amber-dark transition-none disabled:opacity-50"
              >
                {actionLoading === 'resurvey' ? (
                  <span className="material-symbols-outlined text-sm animate-spin">radar</span>
                ) : 'Re-Survey'}
              </button>
              <button
                onClick={() => handleAction('request_info')}
                disabled={actionLoading === 'request_info'}
                className="px-3 py-2 bg-white border border-gray-400 text-gray-700 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-gray-50 transition-none disabled:opacity-50"
              >
                {actionLoading === 'request_info' ? (
                  <span className="material-symbols-outlined text-sm animate-spin">radar</span>
                ) : 'Request Info'}
              </button>
              <button
                onClick={() => handleAction('escalate')}
                disabled={actionLoading === 'escalate'}
                className="px-3 py-2 bg-white border border-error text-error text-[10px] font-bold uppercase tracking-wider rounded hover:bg-error-light/20 transition-none disabled:opacity-50"
              >
                {actionLoading === 'escalate' ? (
                  <span className="material-symbols-outlined text-sm animate-spin">radar</span>
                ) : 'Escalate'}
              </button>
            </div>
          </div>

          {/* Survey Metadata */}
          <div className="bg-white p-4 border border-gray-300 rounded-sm">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Survey Details</h3>
            <div className="divide-y divide-gray-200">
              <InfoRow label="Report ID" value={r.reportId || surveyId} />
              <InfoRow label="Farmer ID" value={r.farmerId || survey.farmerId || '—'} />
              <InfoRow label="Land Parcel" value={r.landParcelId || survey.landParcelId || '—'} />
              <InfoRow label="Assigned Officer" value={r.assignedOfficer || survey.assignedOfficer || '—'} />
              <InfoRow label="Geo Verified" value={r.geoVerified != null ? (r.geoVerified ? 'YES' : 'NO') : survey.geoVerified != null ? (survey.geoVerified ? 'YES' : 'NO') : '—'} />
              <InfoRow label="Confidence" value={confidence ? `${confidence}%` : '—'} />
              <InfoRow label="Submitted" value={r.timestamp || survey.timestamp || '—'} />
            </div>
          </div>

          {/* Grievances Panel */}
          <div className="bg-white p-4 border border-gray-300 rounded-sm flex-1">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Grievances</span>
              {grievances.length > 0 && (
                <span className="bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {grievances.length}
                </span>
              )}
            </h3>
            <GrievancePanel grievances={grievances} loading={grievLoading} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SurveyEvidenceReview;
