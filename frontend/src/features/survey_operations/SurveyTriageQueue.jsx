import React, { useState, useCallback } from 'react';
import DenseTable from '../../shared/components/DenseTable';
import { fetchSurveyQueue } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

const SEVERITY_COLORS = {
  CRITICAL: { bg: '#ba1a1a', text: '#fff' },
  HIGH: { bg: '#e65100', text: '#fff' },
  MODERATE: { bg: '#b45309', text: '#fff' },
  LOW: { bg: '#396940', text: '#fff' },
};

const SurveyTriageQueue = ({ onSelectSurvey }) => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [filter, setFilter] = useState('all');

  const loadQueue = useCallback(async () => {
    try {
      const data = await fetchSurveyQueue();
      const arr = Array.isArray(data) ? data : data.queue || data.results || data.surveys || [];
      setSurveys(arr);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(loadQueue, 5000);

  const filtered = filter === 'all' ? surveys : surveys.filter((s) => {
    const stage = (s.workflowStage || s.status || '').toLowerCase();
    if (filter === 'pending') return stage.includes('pending') || stage.includes('submitted');
    if (filter === 'critical') return (s.severityLevel || s.severity || '').toLowerCase() === 'critical';
    if (filter === 'grievance') return s.hasGrievance || s.grievanceCount > 0;
    if (filter === 'completed') return stage.includes('completed') || stage.includes('verified');
    return true;
  });

  const headers = [
    'Report ID', 'Farmer', 'Village', 'Crop', 'Severity',
    'Workflow Stage', 'Confidence', 'Submitted',
  ];

  const formattedData = filtered.map((s) => [
    <span className="font-mono text-primary font-bold flex items-center gap-2">
      <span className="material-symbols-outlined text-[14px]">description</span>
      {s.reportId || s.id || s.surveyId || '—'}
    </span>,
    <span className="text-gray-900 font-semibold">{s.farmerName || s.farmer_name || s.farmer || '—'}</span>,
    <span className="text-gray-700">{s.village || '—'}</span>,
    <span className="text-gray-700">{s.cropType || s.crop || '—'}</span>,
    (() => {
      const sev = s.severityLevel || s.severity || 'LOW';
      const c = SEVERITY_COLORS[sev] || SEVERITY_COLORS.LOW;
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border"
          style={{ background: c.bg, color: c.text, borderColor: c.bg }}>
          {sev}
        </span>
      );
    })(),
    <span className="text-gray-700 text-sm font-medium">
      {s.workflowStage || s.status || '—'}
    </span>,
    <span className="font-mono font-bold text-gray-900">
      {s.confidenceScore != null ? `${(s.confidenceScore * 100).toFixed(0)}%` : '—'}
    </span>,
    <span className="text-gray-500 text-sm">
      {s.timestamp || s.submittedAt || s.date || '—'}
    </span>,
  ]);

  return (
    <div className="flex flex-col h-full bg-surface font-body">
      <div className="px-6 py-4 border-b border-gray-300 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-300">
            <span className="material-symbols-outlined text-gray-700">satellite_alt</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-widest uppercase">Survey Verification Queue</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-mono flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              {surveys.length} Reports · Live Sync
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
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'critical' ? 'Critical' : f === 'grievance' ? 'Grievances' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-mono text-sm gap-4">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">radar</span>
            [ LOADING SURVEY QUEUE ]
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-mono text-sm gap-3">
            <span className="material-symbols-outlined text-4xl opacity-40">inbox</span>
            <span>No surveys match the selected filter.</span>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            <DenseTable
              headers={headers}
              data={formattedData}
              onRowClick={(row) => onSelectSurvey && onSelectSurvey(filtered.find((s) => {
                const id = row[0]?.props?.children?.[1] || '';
                return (s.reportId || s.id || s.surveyId) === id;
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyTriageQueue;