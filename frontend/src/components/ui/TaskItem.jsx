import React from 'react';
import { t } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

const TaskItem = ({ icon, title, subtitle, time, iconColor = 'primary', onClick }) => {
  const { lang, t } = useLanguage();

  return (
    <div 
      className="card flex items-center justify-between p-3" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', padding: '12px' }}
    >
      <div className="flex items-center gap-3">
        <div className="btn-icon" style={{ backgroundColor: `var(--${iconColor}-light)`, color: `var(--${iconColor})` }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h4 className="text-sm fw-bold mb-1" style={{ margin: 0 }}>{t(title, lang)}</h4>
          <p className="text-xs text-muted" style={{ margin: 0 }}>{t(subtitle, lang)}</p>
        </div>
      </div>
      {time && <span className="badge badge-grey">{t(time, lang)}</span>}
    </div>
  );
};

export default TaskItem;
