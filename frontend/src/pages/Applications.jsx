import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SearchInput from '../components/ui/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import InsightModal from '../components/ui/InsightModal';
import { applicationsData } from '../data/applications';

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   color: '#c62828', bg: '#ffebee', dot: '#ef5350' },
  MEDIUM: { label: 'Medium', color: '#e65100', bg: '#fff3e0', dot: '#fb8c00' },
  NORMAL: { label: 'Normal', color: '#0055A4', bg: '#e3f2fd', dot: '#42a5f5' },
  LOW:    { label: 'Low',    color: '#388e3c', bg: '#e8f5e9', dot: '#66bb6a' },
};

const getPriority = (app) => {
  const status = app.status || '';
  const remarks = app.remarks || '';
  if (status === 'Under Scrutiny' && remarks.includes('Field')) return 'HIGH';
  if (status === 'Applied') return 'MEDIUM';
  if (status === 'Rejected') return 'LOW';
  return 'NORMAL';
};

const parseDateStr = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return new Date(dateStr);
};

const getDaysSince = (dateStr) => {
  const date = parseDateStr(dateStr);
  if (!date || isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((new Date() - date) / 86400000));
};

const Applications = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [highOnly, setHighOnly] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const enriched = useMemo(() => applicationsData.map(app => ({
    ...app,
    priority: getPriority(app),
    daysSince: getDaysSince(app.application_date),
  })), []);

  const filteredApps = useMemo(() => {
    let result = enriched.filter(app => {
      if (search && !(app.farmer_id || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && app.status !== statusFilter) return false;
      if (priorityFilter && app.priority !== priorityFilter) return false;
      if (highOnly && app.priority !== 'HIGH') return false;
      return true;
    });
    result = [...result].sort((a, b) => {
      if (sortOption === 'date_desc') return a.daysSince - b.daysSince;
      if (sortOption === 'date_asc') return b.daysSince - a.daysSince;
      if (sortOption === 'priority') {
        const m = { HIGH: 1, MEDIUM: 2, NORMAL: 3, LOW: 4 };
        return (m[a.priority] || 5) - (m[b.priority] || 5);
      }
      return 0;
    });
    return result;
  }, [enriched, search, statusFilter, priorityFilter, sortOption, highOnly]);

  const highCount = useMemo(() => enriched.filter(a => a.priority === 'HIGH').length, [enriched]);

  return (
    <div className="flex-col gap-4 animate-fade-in">
      <InsightModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      <header className="mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl fw-bold text-primary-dark">{t('Applications', lang)}</h2>
          <span className="badge badge-error" style={{ fontSize: '12px' }}>
            {highCount} High Priority
          </span>
        </div>
        <p className="text-sm text-muted mt-1">{filteredApps.length} of {enriched.length} records</p>
      </header>

      {/* Sticky search + filters */}
      <div className="sticky" style={{ top: 'var(--header-height)', backgroundColor: 'var(--surface)', padding: 'var(--sp-2) 0', zIndex: 10 }}>
        <SearchInput
          placeholder="Search Farmer ID..."
          value={search}
          onChange={setSearch}
          onFilterClick={() => setShowFilters(!showFilters)}
        />

        {/* High-priority quick toggle */}
        <div className="flex items-center gap-3 mt-2">
          <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={highOnly}
              onChange={e => setHighOnly(e.target.checked)}
              style={{ accentColor: '#c62828', width: '16px', height: '16px' }}
            />
            <span style={{ color: highOnly ? '#c62828' : 'inherit', fontWeight: highOnly ? 700 : 400 }}>
              Show HIGH priority only
            </span>
          </label>
        </div>

        {showFilters && (
          <div className="flex-col gap-2 mt-3 p-3" style={{ backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)' }}>
            <div className="flex gap-2">
              <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px', fontSize: '12px', flex: 1 }}>
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Scrutiny">Under Scrutiny</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select className="form-input" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '6px', fontSize: '12px', flex: 1 }}>
                <option value="">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="NORMAL">Normal Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
            <select className="form-input" value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ padding: '6px', fontSize: '12px', width: '100%' }}>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority">By Priority (High → Low)</option>
            </select>
          </div>
        )}
      </div>

      {/* Application cards */}
      <div className="flex-col gap-3 mt-2 mb-6">
        {filteredApps.map((app, index) => {
          const pc = PRIORITY_CONFIG[app.priority] || PRIORITY_CONFIG.NORMAL;
          return (
            <article
              key={index}
              className="card flex-col gap-0 p-0"
              style={{ cursor: 'pointer', borderLeft: `4px solid ${pc.dot}`, overflow: 'hidden' }}
              onClick={() => setSelectedApp(app)}
            >
              {/* Top row */}
              <div className="p-4 flex justify-between items-start">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-md fw-bold" style={{ margin: 0 }}>{app.farmer_id || '—'}</h2>
                    {app.daysSince <= 7 && (
                      <span className="badge badge-blue" style={{ fontSize: '10px' }}>Recently Applied</span>
                    )}
                    {app.priority === 'HIGH' && (
                      <span className="badge badge-error" style={{ fontSize: '10px' }}>Action Required</span>
                    )}
                  </div>
                  {/* Component-first hierarchy */}
                  <p className="text-sm fw-bold text-muted" style={{ margin: 0 }}>{app.component || '—'}</p>
                  <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>{app.scheme_name || '—'}</p>
                </div>
                <div className="flex-col items-end gap-2">
                  <StatusBadge status={app.status || 'Unknown'} />
                  <span style={{ fontSize: '11px', backgroundColor: pc.bg, color: pc.color, padding: '2px 8px', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pc.dot, display: 'inline-block' }} />
                    {pc.label}
                  </span>
                </div>
              </div>

              {/* Footer row */}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)', padding: '8px 16px' }}>
                <span className="badge badge-grey" style={{ fontSize: '10px' }}>{app.scheme_category || '—'}</span>
                <span className={`text-xs ${app.priority === 'HIGH' ? 'text-error fw-bold' : 'text-muted'}`}>
                  {app.daysSince}d ago • {app.application_date || '—'}
                </span>
              </div>
            </article>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="text-center text-muted p-6">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>search_off</span>
            <p className="mt-2">No applications match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
