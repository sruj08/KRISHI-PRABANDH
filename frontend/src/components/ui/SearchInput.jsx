import React from 'react';
import { t } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

const SearchInput = ({ placeholder = 'Search...', value, onChange, onFilterClick }) => {
  const { lang } = useLanguage();

  return (
    <div className="flex gap-2">
      <div className="form-input-with-icon" style={{ flex: 1 }}>
        <span className="material-symbols-outlined input-icon">search</span>
        <input 
          type="text" 
          className="form-input" 
          placeholder={t(placeholder, lang)} 
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </div>
      {onFilterClick && (
        <button 
          className="btn-secondary" 
          style={{ width: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)' }}
          onClick={onFilterClick}
          aria-label="Filter"
        >
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
