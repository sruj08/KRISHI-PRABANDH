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
        <p className="text-sm text-muted">{t("Select beneficiary for field operation", lang)}</p>
      </header>

      {/* Search & Filter */}
      <div className="card flex-col gap-3 p-4">
        <SearchInput placeholder={t("Search Gat No. or Name...", lang)} />
        <div className="form-group">
          <label className="form-label">{t("Filter by Scheme", lang)}</label>
          <select className="form-select">
            <option>{t("All Schemes", lang)}</option>
            <option>{t("Tractor Subsidy", lang)}</option>
            <option>{t("Drip Irrigation", lang)}</option>
            <option>{t("Seed Distribution", lang)}</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="section-title mb-3">{t("Matching Records", lang)} {t("(2)", lang)}</h3>
        
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
              <h4 className="fw-bold mb-1">{t("Ramesh D. Kumar", lang)}</h4>
              <p className="text-sm text-muted mb-2">{t("Gat No. 104/2 • North Sector", lang)}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-grey">{t("Tractor Subsidy", lang)}</span>
                <span className="badge badge-pending">{t("Pending", lang)}</span>
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
              <h4 className="fw-bold mb-1">{t("Suresh V. Patil", lang)}</h4>
              <p className="text-sm text-muted mb-2">{t("Gat No. 88/1 • East Sector", lang)}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-grey">{t("PM-Kisan", lang)}</span>
                <span className="badge badge-verified">{t("Verified", lang)}</span>
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
