import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SearchInput from '../components/ui/SearchInput';
import ApplicationCard from '../components/ui/ApplicationCard';
import { applicationsData } from '../data/applications';

const Applications = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');

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
    if (parts.length === 3) {
      // Assuming DD-MM-YYYY
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dateStr);
  };

  const getDaysSince = (dateStr) => {
    const date = parseDateStr(dateStr);
    if (!date || isNaN(date.getTime())) return 0;
    const diff = new Date() - date;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  let filteredApps = applicationsData
    .map(app => ({
      ...app,
      priority: getPriority(app),
      daysSince: getDaysSince(app.application_date),
      parsedDate: parseDateStr(app.application_date)
    }))
    .filter(app => {
      const matchSearch = search ? (app.farmer_id || '').toLowerCase().includes(search.toLowerCase()) : true;
      const matchStatus = statusFilter ? app.status === statusFilter : true;
      const matchPriority = priorityFilter ? app.priority === priorityFilter : true;
      return matchSearch && matchStatus && matchPriority;
    });

  // Sorting
  filteredApps.sort((a, b) => {
    if (sortOption === 'date_desc') {
      return a.daysSince - b.daysSince; // fewest days since = newest
    } else if (sortOption === 'date_asc') {
      return b.daysSince - a.daysSince;
    } else if (sortOption === 'priority') {
      const pMap = { 'HIGH': 1, 'MEDIUM': 2, 'NORMAL': 3, 'LOW': 4 };
      return (pMap[a.priority] || 5) - (pMap[b.priority] || 5);
    }
    return 0;
  });

  return (
    <div className="flex-col gap-4 animate-fade-in">
      <header className="mb-2">
        <h2 className="text-xl fw-bold text-primary-dark">{t("Applications", lang)}</h2>
      </header>

      <div className="sticky" style={{ top: 'var(--header-height)', backgroundColor: 'var(--surface)', padding: 'var(--sp-2) 0', zIndex: 10 }}>
        <SearchInput 
          placeholder="Search Farmer ID..." 
          value={search} 
          onChange={setSearch} 
          onFilterClick={() => setShowFilters(!showFilters)}
        />
        
        {showFilters && (
          <div className="flex-col gap-2 mt-3 p-3" style={{ backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)' }}>
            <div className="flex gap-2">
              <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '4px', fontSize: '12px', flex: 1 }}>
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Scrutiny">Under Scrutiny</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select className="form-input" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '4px', fontSize: '12px', flex: 1 }}>
                <option value="">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="NORMAL">Normal Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
            <div>
              <select className="form-input" value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ padding: '4px', fontSize: '12px', width: '100%' }}>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="priority">By Priority (High to Low)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-col gap-4 mt-2 mb-6">
        {filteredApps.map((app, index) => (
          <ApplicationCard 
            key={index} 
            name={app.farmer_id} 
            location={app.component || "Unknown Component"} 
            scheme={app.scheme_name || "Unknown Scheme"} 
            dateLabel={app.application_date ? `${app.daysSince} days ago` : 'Unknown date'} 
            date={app.application_date} 
            status={app.status || "Unknown Status"} 
            isUrgent={app.priority === 'HIGH'} 
          />
        ))}
        {filteredApps.length === 0 && (
          <div className="text-center text-muted p-4">No applications found matching the criteria.</div>
        )}
      </div>
    </div>
  );
};

export default Applications;
