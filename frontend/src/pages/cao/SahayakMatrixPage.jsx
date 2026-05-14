import React, { useState, useEffect, useMemo } from 'react';
import { useHierarchy } from '../../context/HierarchyContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import { useLanguage } from '../../context/LanguageContext';
import SahayakMatrix from './components/SahayakMatrix';
import './cao.css';

const SahayakMatrixPage = () => {
  const { t } = useLanguage();
  const { mandals, currentMandal } = useHierarchy();
  const { buildSahayakMatrixForMandal } = useKrishiData();

  const mandal = useMemo(() => {
    if (currentMandal) return currentMandal;
    return mandals[0] || { mandal_id: 'C001', name: 'Agriculture circle' };
  }, [currentMandal, mandals]);

  const rows = useMemo(() => buildSahayakMatrixForMandal(mandal), [mandal, buildSahayakMatrixForMandal]);

  const criticalCount = rows.filter((r) => r.status === 'critical').length;

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1c1a', letterSpacing: '-0.01em' }}>
            {t('Sahayak Accountability Matrix')}
          </h1>
          <p style={{ fontSize: 12, color: '#717972', fontWeight: 600, marginTop: 4 }}>
            {mandal?.name || 'Circle'} · {rows.length} {t('Sahayaks')}
          </p>
        </div>
        {criticalCount > 0 && (
          <span style={{ background: '#fff4e6', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.18)', padding: '4px 10px', borderRadius: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em' }}>
            {criticalCount} {t('Critical')}
          </span>
        )}
      </div>

      <div className="surface-card" style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div className="p-0 overflow-x-auto w-full">
          <SahayakMatrix sahayaks={rows} />
        </div>
      </div>
    </div>
  );
};

export default SahayakMatrixPage;
