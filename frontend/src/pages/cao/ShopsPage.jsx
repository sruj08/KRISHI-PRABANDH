import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ShopTracker from './components/ShopTracker';
import './cao.css';

const ShopsPage = () => {
  const { t } = useLanguage();

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1c1a' }}>{t('Krushi Seva Kendra')}</h1>
        <p style={{ fontSize: 12, color: '#717972', fontWeight: 600, marginTop: 4 }}>{t('Fertilizer shop inspection tracker')}</p>
      </div>

      <div className="surface-card" style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <ShopTracker />
      </div>
    </div>
  );
};

export default ShopsPage;
