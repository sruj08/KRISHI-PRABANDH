import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';

const SelectTask = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('FM-88291');

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      
      <header>
        <h2 className="text-xl fw-bold text-primary-dark">{t("Target Selection", lang)}</h2>
        <p className="text-sm text-muted">Select beneficiary for field operation</p>
      </header>

      {/* Search & Filter */}
      <div className="card flex-col gap-3 p-4">
        <SearchInput placeholder="Search Gat No. or Name..." />
        <div className="form-group">
          <label className="form-label">{t("Filter by Scheme", lang)}</label>
          <select className="form-select">
            <option>All Schemes</option>
            <option>Tractor Subsidy</option>
            <option>Drip Irrigation</option>
            <option>Seed Distribution</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="section-title mb-3">{t("Matching Records", lang)} (2)</h3>
        
        <div className="flex-col gap-3">
          {/* Record 1 (Selected) */}
          <div 
            className={`card p-4 flex gap-3 ${selectedId === 'FM-88291' ? 'card-bordered-primary' : ''}`}
            onClick={() => setSelectedId('FM-88291')}
            style={{ cursor: 'pointer', backgroundColor: selectedId === 'FM-88291' ? 'var(--primary-light)' : 'var(--surface-lowest)' }}
          >
            <input 
              type="radio" 
              name="target" 
              checked={selectedId === 'FM-88291'} 
              onChange={() => setSelectedId('FM-88291')}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', marginTop: '4px' }}
            />
            <div>
              <h4 className="fw-bold mb-1">Ramesh D. Kumar</h4>
              <p className="text-sm text-muted mb-2">Gat No. 104/2 • North Sector</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-grey">Tractor Subsidy</span>
                <span className="badge badge-pending">Pending</span>
              </div>
            </div>
          </div>

          {/* Record 2 */}
          <div 
            className={`card p-4 flex gap-3 ${selectedId === 'FM-99012' ? 'card-bordered-primary' : ''}`}
            onClick={() => setSelectedId('FM-99012')}
            style={{ cursor: 'pointer', backgroundColor: selectedId === 'FM-99012' ? 'var(--primary-light)' : 'var(--surface-lowest)' }}
          >
            <input 
              type="radio" 
              name="target" 
              checked={selectedId === 'FM-99012'} 
              onChange={() => setSelectedId('FM-99012')}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', marginTop: '4px' }}
            />
            <div>
              <h4 className="fw-bold mb-1">Suresh V. Patil</h4>
              <p className="text-sm text-muted mb-2">Gat No. 88/1 • East Sector</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-grey">PM-Kisan</span>
                <span className="badge badge-verified">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button 
        variant="primary" 
        fullWidth 
        icon="arrow_forward" 
        disabled={!selectedId}
        onClick={() => navigate('/confirm-verification')}
      >
        {t("Proceed to Site Details", lang)}
      </Button>

    </div>
  );
};

export default SelectTask;
