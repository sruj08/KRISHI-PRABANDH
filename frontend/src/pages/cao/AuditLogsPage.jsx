import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AUDIT_LOGS, TALUKAS } from '../../mock/cao-mock';
import './cao-command.css';

const MODULE_ICONS = {
  'PMFBY': 'verified_user',
  'Grievance': 'gavel',
  'Dashboard': 'dashboard',
  'Field Ops': 'agriculture',
};

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [filterTaluka, setFilterTaluka] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const modules = [...new Set(AUDIT_LOGS.map(l => l.module))];

  const filtered = AUDIT_LOGS.filter(l => {
    if (filterTaluka !== 'all' && l.taluka !== filterTaluka) return false;
    if (filterModule !== 'all' && l.module !== filterModule) return false;
    if (filterDate === 'today' && !l.timestamp.startsWith('15-May')) return false;
    if (filterDate === 'yesterday' && !l.timestamp.startsWith('14-May')) return false;
    return true;
  });

  return (
    <div className="cao-page">
      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">Audit Logs</h1>
          <p className="cao-page-sub">Officer activity log — all actions across modules · Barshi Circle</p>
        </div>
        <span style={{ fontSize: 11, color: '#9aa19c', fontWeight: 600 }}>
          {AUDIT_LOGS.length} entries · Last 7 days
        </span>
      </div>

      <div className="cao-content">
        <div className="cao-filter-bar" style={{ borderRadius: '10px 10px 0 0', border: '1px solid #e0e3db' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9aa19c', textTransform: 'uppercase', letterSpacing: '.07em', marginRight: 4 }}>Filter:</span>
          <select className="cao-select" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="all">All Dates</option>
            <option value="today">Today (15-May)</option>
            <option value="yesterday">Yesterday (14-May)</option>
          </select>
          <select className="cao-select" value={filterTaluka} onChange={e => setFilterTaluka(e.target.value)}>
            <option value="all">All Talukas</option>
            {TALUKAS.map(ta => <option key={ta.id} value={ta.name}>{ta.name}</option>)}
          </select>
          <select className="cao-select" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="all">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9aa19c' }}>{filtered.length} entries</span>
        </div>

        <div className="cao-panel" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
          <div className="cao-table-wrap">
            <table className="cao-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Officer</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Ref</th>
                  <th>Taluka</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="cao-empty">
                        <span className="material-symbols-outlined">history</span>
                        <div className="cao-empty-title">No log entries match the current filters</div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(log => (
                  <tr key={log.id}>
                    <td className="muted cao-date-tag" style={{ whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td className="name-cell" style={{ fontSize: 12 }}>{log.officer}</td>
                    <td style={{ fontSize: 12 }}>{log.action}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#717972' }}>
                          {MODULE_ICONS[log.module] || 'settings'}
                        </span>
                        <span style={{ fontSize: 11.5 }}>{log.module}</span>
                      </div>
                    </td>
                    <td className="muted" style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.ref}</td>
                    <td className="muted">{log.taluka}</td>
                    <td>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 3,
                        background: log.device.includes('Mobile') ? '#e3f2fd' : '#f3f4f0',
                        color: log.device.includes('Mobile') ? '#1565c0' : '#37474f',
                      }}>
                        {log.device.includes('Mobile') ? '📱' : '🖥'} {log.device}
                      </span>
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
