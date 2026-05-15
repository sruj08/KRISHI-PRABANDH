import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { TALUKAS, VILLAGES, FIELD_OPS_SUMMARY } from '../../mock/cao-mock';
import './cao-command.css';

/* ── Flatten all villages ── */
const ALL_VILLAGES = Object.entries(VILLAGES).flatMap(([talukaId, villages]) => {
  const taluka = TALUKAS.find(t => t.id === talukaId);
  return villages.map(v => ({ ...v, talukaName: taluka?.name || talukaId }));
});

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

/* ── Village ops detail modal ── */
function VillageDetailModal({ village, onClose }) {
  const [reassignedTo, setReassignedTo] = useState('');
  const [saved, setSaved] = useState(false);

  const OFFICERS = [
    'Ramesh Dagadu Shinde', 'Sunita Baburao Jadhav', 'Dnyanoba Vitthal Kale',
    'Vishwanath Tukaram Mane', 'Rekha Pandhari Bhosale', 'Kavita More', 'Balu Patil',
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1800);
  };

  return (
    <div className="cao-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cao-modal">
        <div className="cao-modal-head">
          <div>
            <h3 className="cao-modal-title">{village.name} — {village.talukaName} Taluka</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <SurveyChip status={village.surveyStatus} />
              <span className={`cao-risk cao-risk--${village.riskLevel}`}>{village.riskLevel} risk</span>
            </div>
          </div>
          <button className="cao-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="cao-modal-body">
          <div style={{ marginBottom: 16 }}>
            <div className="cao-detail-row"><span className="cao-detail-label">Village</span><span className="cao-detail-value">{village.name}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Taluka</span><span className="cao-detail-value">{village.talukaName}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Current Officer</span><span className="cao-detail-value">{village.officer}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Main Crop</span><span className="cao-detail-value">{village.crop}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Pending Surveys</span><span className="cao-detail-value" style={{ color: village.pendingSurveys > 3 ? '#c62828' : 'inherit', fontWeight: 700 }}>{village.pendingSurveys}</span></div>
            <div className="cao-detail-row"><span className="cao-detail-label">Last Updated</span><span className="cao-detail-value">{village.lastUpdated}</span></div>
          </div>

          {village.officer === 'Unassigned' && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#c62828' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>person_off</span>
                No officer assigned — village is unmapped
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#717972', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>
              Reassign to Officer
            </label>
            <select
              className="cao-select"
              style={{ width: '100%', padding: '8px 10px' }}
              value={reassignedTo}
              onChange={e => setReassignedTo(e.target.value)}
            >
              <option value="">— Select officer —</option>
              {OFFICERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {saved && (
            <div style={{ background: '#e8f5ec', color: '#2e7d32', padding: '8px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>
              ✓ Changes saved. Officer updated.
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="cao-btn cao-btn--primary" onClick={handleSave} disabled={!reassignedTo}>
              <span className="material-symbols-outlined">save</span>
              Save Assignment
            </button>
            <button className="cao-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function FieldOperationsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filterTaluka, setFilterTaluka] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState(null);

  const filtered = ALL_VILLAGES.filter(v => {
    if (filterTaluka !== 'all' && v.talukaName.toLowerCase() !== filterTaluka) return false;
    if (filterStatus !== 'all' && v.surveyStatus !== filterStatus) return false;
    if (filterRisk !== 'all' && v.riskLevel !== filterRisk) return false;
    return true;
  });

  const s = FIELD_OPS_SUMMARY;

  return (
    <div className="cao-page">
      {selectedVillage && (
        <VillageDetailModal village={selectedVillage} onClose={() => setSelectedVillage(null)} />
      )}

      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">Field Operations</h1>
          <p className="cao-page-sub">Village-level survey tracking, officer movement & crop-loss verification</p>
        </div>
      </div>

      <div className="cao-content">
        {/* ── Today's Operational Summary ── */}
        <div className="cao-panel" style={{ marginBottom: 16 }}>
          <div className="cao-panel-head">
            <h2 className="cao-panel-title">Today's Operational Summary</h2>
            <span style={{ fontSize: 10.5, color: '#9aa19c' }}>15-May-2026 · Kharif 2025–26</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { icon: 'check_circle', label: 'Inspections Completed', value: s.inspectionsCompleted, color: '#2e6b3e', bg: '#e8f5ec' },
              { icon: 'pending_actions', label: 'Pending Crop-Loss Surveys', value: s.pendingCropLossSurveys, color: '#b35c00', bg: '#fff3e0' },
              { icon: 'water_drop', label: 'Rainfall Escalation Villages', value: s.rainfallEscalationVillages, color: '#1565c0', bg: '#e3f2fd' },
              { icon: 'person_off', label: 'Inactive Officers', value: s.inactiveOfficers, color: '#c62828', bg: '#fde8e8' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '14px 18px',
                borderRight: i < 3 ? '1px solid #eceee9' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 19, color: item.color }}>{item.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: 10.5, color: '#9aa19c', fontWeight: 600, marginTop: 2 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 18px', borderTop: '1px solid #eceee9', display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11.5, color: '#717972' }}>
            <span><strong style={{ color: '#37474f' }}>{s.unassignedVillages}</strong> villages unassigned</span>
            <span><strong style={{ color: '#37474f' }}>{s.overdueInspections}</strong> overdue inspections</span>
            <span><strong style={{ color: '#37474f' }}>{s.surveysThisWeek}</strong> surveys completed this week</span>
            <span><strong style={{ color: '#37474f' }}>{s.totalVillages}</strong> total villages in circle</span>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="cao-filter-bar" style={{ borderRadius: '10px 10px 0 0', border: '1px solid #e0e3db', background: '#fafbf8', marginBottom: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9aa19c', textTransform: 'uppercase', letterSpacing: '.07em', marginRight: 4 }}>Filter:</span>
          <select className="cao-select" value={filterTaluka} onChange={e => setFilterTaluka(e.target.value)}>
            <option value="all">All Talukas</option>
            {TALUKAS.map(t => <option key={t.id} value={t.name.toLowerCase()}>{t.name}</option>)}
          </select>
          <select className="cao-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="overdue">Overdue</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="cao-select" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9aa19c' }}>{filtered.length} villages</span>
        </div>

        {/* ── Village Operations Table ── */}
        <div className="cao-panel" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
          <div className="cao-table-wrap">
            <table className="cao-table">
              <thead>
                <tr>
                  <th>Village</th>
                  <th>Taluka</th>
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="cao-empty" style={{ padding: '24px 16px' }}>
                        <div className="cao-empty-title">No villages match the current filters</div>
                        <div className="cao-empty-sub">Try adjusting the taluka or status filter</div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(v => (
                  <tr key={v.id}>
                    <td className="name-cell">{v.name}</td>
                    <td className="muted">{v.talukaName}</td>
                    <td><SurveyChip status={v.surveyStatus} /></td>
                    <td style={{ color: v.officer === 'Unassigned' ? '#c62828' : 'inherit', fontWeight: v.officer === 'Unassigned' ? 700 : 400 }}>
                      {v.officer}
                    </td>
                    <td className="muted">{v.crop}</td>
                    <td style={{ fontWeight: v.pendingSurveys > 3 ? 700 : 400, color: v.pendingSurveys > 3 ? '#c62828' : v.pendingSurveys > 0 ? '#b35c00' : '#2e7d32' }}>
                      {v.pendingSurveys > 0 ? v.pendingSurveys : '—'}
                    </td>
                    <td><span className={`cao-risk cao-risk--${v.riskLevel}`}>{v.riskLevel}</span></td>
                    <td className="cao-date-tag muted">{v.lastUpdated}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="cao-btn cao-btn--sm" onClick={() => setSelectedVillage(v)}>Open</button>
                        {(v.officer === 'Unassigned' || v.surveyStatus === 'overdue') && (
                          <button className="cao-btn cao-btn--sm cao-btn--danger" onClick={() => setSelectedVillage(v)}>
                            Reassign
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
      </div>
    </div>
  );
}
