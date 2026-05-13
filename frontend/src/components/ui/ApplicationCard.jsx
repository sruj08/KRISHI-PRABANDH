import React from 'react';
import { t } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';
import StatusBadge from './StatusBadge';

const ApplicationCard = ({
  name,
  location,
  scheme,
  dateLabel,
  date,
  status,
  isUrgent = false
}) => {
  const { lang, t } = useLanguage();
  
  let borderClass = 'card-bordered-primary';
  if (status?.toLowerCase()?.includes('pending')) borderClass = 'card-bordered-amber';
  if (status?.toLowerCase()?.includes('req') || isUrgent) borderClass = 'card-bordered-error';
  if (status?.toLowerCase()?.includes('verified')) borderClass = 'card-bordered-success';

  return (
    <article className={`card ${borderClass} flex-col gap-3 p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-md fw-bold">{t(name, lang)}</h2>
          <p className="text-sm text-muted flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              pin_drop
            </span>
            {t(location, lang)}
          </p>
        </div>
        <StatusBadge status={t(status, lang)} />
      </div>
      
      <div className="divider" style={{ margin: '8px 0' }} />
      
      <div className="flex justify-between items-center">
        <span className="text-sm fw-bold">{t(scheme, lang)}</span>
        <p className={`text-xs ${isUrgent ? 'text-error fw-bold' : 'text-muted'}`}>
          {t(dateLabel, lang)}: {t(date, lang)}
        </p>
      </div>
    </article>
  );
};

export default ApplicationCard;
