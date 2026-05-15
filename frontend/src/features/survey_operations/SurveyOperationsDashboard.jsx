import React, { useState, useCallback } from 'react';
import SurveyTriageQueue from './SurveyTriageQueue';
import SurveyEvidenceReview from './SurveyEvidenceReview';
import { fetchReports } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

const SummaryStat = ({ icon, label, value, color, bg }) => (
  <div className="flex items-center gap-3 bg-white px-4 py-3 border border-gray-300 rounded-sm shadow-sm min-w-[140px]">
    <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: bg || 'rgba(31,77,54,0.08)' }}>
      <span className="material-symbols-outlined text-sm" style={{ color: color || '#1f4d36' }}>{icon}</span>
    </div>
    <div>
      <div className="text-lg font-bold font-mono" style={{ color: color || '#1f4d36' }}>{value ?? '-'}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</div>
    </div>
  </div>
);

const SurveyOperationsDashboard = () => {
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [reports, setReports] = useState([]);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (_) {
    }
  }, []);

  usePolling(loadReports, 5000);

  const total = reports.length;
  const pending = reports.filter(r => {
    const s = (r.workflowStage || '').toLowerCase();
    return s.includes('pending') || s.includes('submitted') || s.includes('additional info');
  }).length;
  const critical = reports.filter(r => (r.severityLevel || '').toUpperCase() === 'CRITICAL').length;
  const grievance = reports.filter(r => r.hasGrievance || r.grievanceCount > 0).length;
  const completed = reports.filter(r => {
    const s = (r.workflowStage || '').toLowerCase();
    return s.includes('verified') || s.includes('approved');
  }).length;

  const stats = [
    { icon: 'satellite_alt', label: 'Total Reports', value: total, color: '#1f4d36', bg: 'rgba(31,77,54,0.08)' },
    { icon: 'pending_actions', label: 'Pending', value: pending, color: '#B45309', bg: 'rgba(180,83,9,0.08)' },
    { icon: 'gpp_bad', label: 'Critical', value: critical, color: '#ba1a1a', bg: 'rgba(186,26,26,0.08)' },
    { icon: 'feedback', label: 'Grievances', value: grievance, color: '#4d2024', bg: 'rgba(77,32,36,0.08)' },
    { icon: 'check_circle', label: 'Completed', value: completed, color: '#396940', bg: 'rgba(57,105,64,0.08)' },
  ];

  return (
    <div className="h-full min-h-[calc(100vh-56px)] overflow-hidden bg-surface flex flex-col">
      {!selectedSurvey ? (
        <>
          <div className="px-6 pt-4 pb-0 bg-surface">
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4">
              {stats.map((s, i) => (
                <SummaryStat key={i} {...s} />
              ))}
            </div>
          </div>
          <SurveyTriageQueue onSelectSurvey={setSelectedSurvey} />
        </>
      ) : (
        <SurveyEvidenceReview
          survey={selectedSurvey}
          onBack={() => setSelectedSurvey(null)}
        />
      )}
    </div>
  );
};

export default SurveyOperationsDashboard;
