import React from 'react';
import { t } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

const FarmerCard = ({ name, gat, caste, onLogFriction }) => {
  const { lang, t } = useLanguage();

  return (
    <div className="farmer-radar-card">
      <div className="farmer-info">
        <h4>{t(name, lang)}</h4>
        <p>{t('Gat No')}: {gat} • {t('Caste')}: {caste}</p>
      </div>
      <div className="farmer-actions">
        <button 
          className="btn btn-outline text-xs" 
          onClick={onLogFriction}
          style={{ padding: '6px 10px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>report</span>
          {t('Log Friction', lang)}
        </button>
        <button 
          className="btn-icon whatsapp"
          onClick={() => window.open(`https://wa.me/?text=Hello ${name}`, '_blank')}
          title={t('WhatsApp')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
        </button>
      </div>
    </div>
  );
};

export default FarmerCard;
