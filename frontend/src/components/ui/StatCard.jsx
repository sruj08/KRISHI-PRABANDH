import React from 'react';
import { t } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

const StatCard = ({
  icon,
  label,
  count,
  variant = 'primary', // 'primary', 'success', 'amber', 'error'
  onClick
}) => {
  const { lang } = useLanguage();
  
  const iconBgMap = {
    primary: 'var(--primary-light)',
    success: 'var(--success-light)',
    amber: 'var(--amber-light)',
    error: 'var(--error-light)',
  };
  
  const iconColorMap = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    amber: 'var(--accent-dark)',
    error: 'var(--error)',
  };

  const borderMap = {
    primary: '4px solid var(--primary)',
    success: '4px solid var(--success)',
    amber: '4px solid var(--amber)',
    error: '4px solid var(--error)',
  };

  return (
    <div 
      className="stat-card" 
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: borderMap[variant]
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="stat-icon-wrap"
          style={{ 
            backgroundColor: iconBgMap[variant],
            color: iconColorMap[variant] 
          }}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="fw-semibold text-sm">{t(label, lang)}</span>
      </div>
      <span className={`stat-count text-${variant === 'amber' ? 'dark' : variant}`}>
        {count}
      </span>
    </div>
  );
};

export default StatCard;
