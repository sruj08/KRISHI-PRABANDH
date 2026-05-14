import React, { useState, useCallback } from 'react';
import { fetchReports } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

const SEVERITY_BG = { CRITICAL: '#ba1a1a', HIGH: '#e65100', MODERATE: '#b45309', LOW: '#396940' };

const STAGE_COLORS = {
  'Pending Sahayak Verification': '#B45309',
  'Geo Validation Complete': '#396940',
  'Escalated': '#ba1a1a',
  'Re-Survey Requested': '#1f4d36',
  'Verified': '#396940',
  'Additional Info Requested': '#6a1b9a',
  'Approved': '#2e7d32',
};

const MediaThumbnail = ({ item }) => {
  const url = item?.url || item?.evidenceUrl || item?.filePath || null;
  const isVideo = item?.type === 'video' || url?.match(/\.(mp4|webm|mov)$/i);
  const gps = item?.gps || item?.location || null;
  return (
    <div className="relative w-full aspect-video bg-gray-200 rounded overflow-hidden border border-gray-300 flex-shrink-0">
      {url ? (
        isVideo ? (
          <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
        ) : (
          <img src={url} alt="Evidence" className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span className="material-symbols-outlined text-3xl">image</span>
        </div>
      )}
      {gps && (
        <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
          <span className="material-symbols-outlined text-[10px]">location_on</span>
          {typeof gps.lat === 'number' ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'GPS'}
        </div>
      )}
    </div>
  );
};

const SurveyTriageQueue = ({ onSelectSurvey }) => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');

  const loadQueue = useCallback(async () => {
    try {
      const data = await fetchReports();
      const arr = Array.isArray(data) ? data : [];
      setReports(arr);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(loadQueue, 5000);

  const filtered = filter === 'all' ? reports : reports.filter((r) => {
    const stage = (r.workflowStage || '').toLowerCase();
    if (filter === 'pending') return stage.includes('pending') || stage.includes('submitted') || stage.includes('additional info');
    if (filter === 'critical') return (r.severityLevel || '').toUpperCase() === 'CRITICAL';
    if (filter === 'grievance') return r.hasGrievance || r.grievanceCount > 0;
    if (filter === 'completed') return stage.includes('verified') || stage.includes('approved');
    return true;
  });

  const filterLabel = (f) =>
    f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'critical' ? 'Critical' : f === 'grievance' ? 'Grievances' : 'Completed';

  const firstEvidence = (r) => {
    const ev = r.uploadedEvidence;
    if (Array.isArray(ev) && ev.length > 0) return ev[0];
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-surface font-body">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-300 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-300">
            <span className="material-symbols-outlined text-gray-700">satellite_alt</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-widest uppercase">Operational Reports</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-mono flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              {reports.length} Reports · Live Sync
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'critical', 'grievance', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-none ${
                filter === f
                  ? 'bg-primary text-white border-primary-dark'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      <div className="p-6 flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-mono text-sm gap-4">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">radar</span>
            [ LOADING REPORTS ]
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-mono text-sm gap-3">
            <span className="material-symbols-outlined text-4xl opacity-40">inbox</span>
            <span>No reports match the selected filter.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((r) => {
              const sev = (r.severityLevel || 'LOW').toUpperCase();
              const sevColor = SEVERITY_BG[sev] || SEVERITY_BG.LOW;
              const stage = r.workflowStage || 'Pending';
              const stageColor = STAGE_COLORS[stage] || '#717972';
              const confidence = r.confidenceScore != null ? `${(r.confidenceScore * 100).toFixed(0)}%` : null;
              const evidence = firstEvidence(r);
              const gps = r.gps || evidence?.gps || evidence?.location || null;

              return (
                <div
                  key={r.reportId || r.id}
                  onClick={() => onSelectSurvey && onSelectSurvey(r)}
                  className="bg-white border border-gray-300 rounded shadow-sm hover:shadow-md hover:border-gray-400 transition-all cursor-pointer flex flex-col overflow-hidden"
                >
                  <MediaThumbnail item={evidence} />
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {r.farmerName || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono truncate">
                          {r.village || '—'}
                          {r.taluka ? `, ${r.taluka}` : ''}
                          {r.cropType ? ` · ${r.cropType}` : ''}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
                        style={{ background: sevColor, color: '#fff', borderColor: sevColor }}>
                        {sev}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-primary font-bold truncate">
                      {r.reportId || r.id || '—'}
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: `${stageColor}15`, color: stageColor }}>
                        {stage}
                      </span>
                      <div className="flex items-center gap-2">
                        {confidence && (
                          <span className="text-[10px] font-mono font-bold text-gray-700">{confidence}</span>
                        )}
                        {r.hasGrievance || r.grievanceCount > 0 ? (
                          <span className="material-symbols-outlined text-[14px] text-error">feedback</span>
                        ) : null}
                        <span className="material-symbols-outlined text-[14px] text-gray-400">chevron_right</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyTriageQueue;
