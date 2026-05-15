import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { TALUKAS, VILLAGES } from '../../mock/cao-mock';
import './cao-command.css';

/* ── Survey status chip ── */
function SurveyChip({ status }) {
  const map = {
    completed: { cls: 'cao-chip--approved', label: 'Completed' },
    in_progress: { cls: 'cao-chip--investigating', label: 'In Progress' },
    overdue: { cls: 'cao-chip--critical', label: 'Overdue' },
  };
  const { cls, label } = map[status] || { cls: 'cao-chip--low', label: status };
  return <span className={`cao-chip ${cls}`}>{label}</span>;
}

/* ── Village detail modal ── */
function VillageModal({ village, onClose, onReassign }) {
  const [remark, setRemark] = useState('');
  return (
    <div className="cao-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cao-modal">
        <div className="cao-modal-head">
          <h3 className="cao-modal-title">{village.name} — Village Operations</h3>
          <button className="cao-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="cao-modal-body">
          <div style={{ marginBottom: 16 }}>
            <div className="cao-detail-row"><span className="cao-detail-label">Village</span><span className="cao-detail-value">{village.name}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Survey Status</span><span className="cao-detail-value"><SurveyChip status={village.surveyStatus} /></span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Assigned Officer</span><span className="cao-detail-value">{village.officer}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Last Updated</span><span className="cao-detail-value">{village.lastUpdated}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Risk Level</span><span className="cao-detail-value"><span className={`cao-risk cao-risk--${village.riskLevel}`}>{village.riskLevel}</span></span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Pending Surveys</span><span className="cao-detail-value">{village.pendingSurveys}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Main Crop</span><span className="cao-detail-value">{village.crop}</span></div>
          </div>

          {village.surveyStatus === 'overdue' && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#c62828', marginBottom: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>warning</span>
                Survey overdue — {village.pendingSurveys} crop-loss surveys pending
              </div>
              <div style={{ fontSize: 11, color: '#c62828' }}>Immediate field visit required before PMFBY processing window closes.</div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>
              Officer Remark
            </label>
            <textarea
              className="cao-textarea"
              placeholder="Add supervisory remark or action note..."
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="cao-btn cao-btn--primary" onClick={() => onReassign(village)}>
              <span className="material-symbols-outlined">person_add</span>
              Reassign Officer
            </button>
            <button className="cao-btn" onClick={() => onReassign(village, 'survey')}>
              <span className="material-symbols-outlined">assignment</span>
              Open Survey
            </button>
            <button className="cao-btn" onClick={onClose}>
              <span className="material-symbols-outlined">save</span>
              Save &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function TalukaPerformancePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTaluka = searchParams.get('taluka') || 'all';

  const [selectedTaluka, setSelectedTaluka] = useState(initialTaluka);
  const [sortKey, setSortKey] = useState('pending');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  const filteredTalukas = selectedTaluka === 'all'
    ? TALUKAS
    : TALUKAS.filter(t => t.id === selectedTaluka);

  const sortedTalukas = [...filteredTalukas].sort((a, b) => {
    if (sortKey === 'pending') return b.pending - a.pending;
    if (sortKey === 'disposal') return b.avgDisposalDays - a.avgDisposalDays;
    if (sortKey === 'risk') return ['high', 'medium', 'low'].indexOf(a.riskLevel) - ['high', 'medium', 'low'].indexOf(b.riskLevel);
    return 0;
  });

  const activeTalukaVillages = selectedTaluka !== 'all' ? (VILLAGES[selectedTaluka] || []) : [];

  const handleReassign = (village, mode) => {
    setSelectedVillage(null);
    setActionToast(mode === 'survey'
      ? `Survey workflow opened for ${village.name}`
      : `Officer reassignment initiated for ${village.name}`);
    setTimeout(() => setActionToast(null), 3500);
  };

  return (
    <div className="cao-page">
      {selectedVillage && (
        <VillageModal
          village={selectedVillage}
          onClose={() => setSelectedVillage(null)}
          onReassign={handleReassign}
        />
      )}

      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">Taluka Performance</h1>
          <p className="cao-page-sub">Workload, pendency, PMFBY processing & inspection completion by taluka</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="cao-select" value={selectedTaluka} onChange={e => setSelectedTaluka(e.target.value)}>
            <option value="all">All Talukas</option>
            {TALUKAS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="cao-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
            <option value="pending">Sort: Pending Cases</option>
            <option value="disposal">Sort: Avg Disposal</option>
            <option value="risk">Sort: Risk Level</option>
          </select>
        </div>
      </div>

      {actionToast && (
        <div style={{
          margin: '12px 24px 0', padding: '10px 16px', borderRadius: 8,
          background: '#e8f5ec', color: '#2e6b3e', fontSize: 12.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #c8e6c9',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
          {actionToast}
        </div>
      )}

      <div className="cao-content">
        {/* ── Taluka Performance Table ── */}
        <div className="cao-panel" style={{ marginBottom: 20 }}>
          <div className="cao-panel-head">
            <h2 className="cao-panel-title">Taluka-wise Workload Summary</h2>
            <span style={{ fontSize: 11, color: '#9aa19c', fontWeight: 500 }}>
              {TALUKAS.reduce((a, b) => a + b.pending, 0)} total pending · Kharif 2025–26
            </span>
          </div>
          <div className="cao-table-wrap">
            <table className="cao-table">
              <thead>
                <tr>
                  <th>Taluka</th>
                  <th>Officer</th>
                  <th>Pending</th>
                  <th>Approved</th>
                  <th>Flagged</th>
                  <th>Avg Disposal</th>
                  <th>PMFBY Claims</th>
                  <th>Survey %</th>
                  <th>Grievances</th>
                  <th>Rain Alerts</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedTalukas.map(tal => {
                  const dispColor = tal.avgDisposalDays > 4 ? '#c62828' : tal.avgDisposalDays > 3 ? '#b35c00' : '#2e7d32';
                  return (
                    <tr key={tal.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTaluka(tal.id)}>
                      <td className="name-cell" style={{ color: '#2e6b3e' }}>{tal.name}</td>
                      <td className="muted" style={{ fontSize: 11.5 }}>{tal.assignedOfficer}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{tal.pending}</span>
                      </td>
                      <td>{tal.approved}</td>
                      <td>
                        {tal.flagged > 0
                          ? <span style={{ color: '#c62828', fontWeight: 700 }}>{tal.flagged}</span>
                          : <span className="muted">—</span>}
                      </td>
                      <td style={{ color: dispColor, fontWeight: 600 }}>{tal.avgDisposalDays}d</td>
                      <td>{tal.pmfbyClaims}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="cao-progress-bar-track" style={{ width: 48 }}>
                            <div className="cao-progress-bar-fill"
                              style={{ width: `${tal.surveyCompletion}%`, background: tal.surveyCompletion < 70 ? '#ef5350' : tal.surveyCompletion < 85 ? '#ffa726' : '#66bb6a' }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600 }}>{tal.surveyCompletion}%</span>
                        </div>
                      </td>
                      <td>{tal.activeGrievances}</td>
                      <td>
                        {tal.rainAlerts > 0
                          ? <span className="cao-chip cao-chip--high">{tal.rainAlerts} alert</span>
                          : <span className="muted">—</span>}
                      </td>
                      <td><span className={`cao-risk cao-risk--${tal.riskLevel}`}>{tal.riskLevel}</span></td>
                      <td>
                        <button className="cao-btn cao-btn--sm" onClick={e => { e.stopPropagation(); navigate(`/cao/taluka-performance?taluka=${tal.id}`); }}>
                          Detail →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Village drilldown ── */}
        {selectedTaluka !== 'all' && activeTalukaVillages.length > 0 && (
          <div className="cao-panel">
            <div className="cao-panel-head">
              <h2 className="cao-panel-title">
                Village Operations — {TALUKAS.find(t => t.id === selectedTaluka)?.name}
              </h2>
              <span style={{ fontSize: 11, color: '#9aa19c' }}>
                {activeTalukaVillages.filter(v => v.surveyStatus === 'overdue').length} overdue
              </span>
            </div>
            <div className="cao-table-wrap">
              <table className="cao-table">
                <thead>
                  <tr>
                    <th>Village</th>
                    <th>Survey Status</th>
                    <th>Assigned Officer</th>
                    <th>Main Crop</th>
                    <th>Pending Surveys</th>
                    <th>Risk</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTalukaVillages.map(v => (
                    <tr key={v.id}>
                      <td className="name-cell">{v.name}</td>
                      <td><SurveyChip status={v.surveyStatus} /></td>
                      <td className="muted">{v.officer}</td>
                      <td className="muted">{v.crop}</td>
                      <td style={{ fontWeight: v.pendingSurveys > 0 ? 700 : 400, color: v.pendingSurveys > 3 ? '#c62828' : 'inherit' }}>
                        {v.pendingSurveys || '—'}
                      </td>
                      <td><span className={`cao-risk cao-risk--${v.riskLevel}`}>{v.riskLevel}</span></td>
                      <td className="muted cao-date-tag">{v.lastUpdated}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="cao-btn cao-btn--sm" onClick={() => setSelectedVillage(v)}>
                            Open
                          </button>
                          {v.surveyStatus === 'overdue' && (
                            <button className="cao-btn cao-btn--sm cao-btn--danger" onClick={() => setSelectedVillage(v)}>
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTaluka === 'all' && (
          <div className="cao-panel">
            <div className="cao-panel-head"><h2 className="cao-panel-title">Village Drilldown</h2></div>
            <div className="cao-empty">
              <span className="material-symbols-outlined">map</span>
              <div className="cao-empty-title">Select a taluka to see village-level operations</div>
              <div className="cao-empty-sub">Click on any row above or use the taluka filter</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
