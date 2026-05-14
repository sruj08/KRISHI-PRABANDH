import React from 'react';
import { DIVISION_ESCALATIONS, DIVISION_PROFILE } from '../../utils/divisionMockData';
import { useLanguage } from '../../context/LanguageContext';
import { STATUS_CHIP } from './divisionDashboardUi';

const statusVisual = (s) => {
  if (s === 'Open') return STATUS_CHIP.Critical;
  if (s === 'In progress') return STATUS_CHIP.Moderate;
  if (s === 'Awaiting field report') return STATUS_CHIP.Watch;
  return { color: '#1b5e20', bg: 'rgba(186,240,188,0.28)' };
};

const DivisionEscalations = () => {
  const { t } = useLanguage();

  return (
    <div className="state-dashboard-bleed">
      <div className="state-dashboard">
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#717972', margin: 0 }}>
            {t('alertsAndEscalations')}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1c1a', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
            {t('Escalations')}
          </h1>
          <p className="state-dashboard__map-sub" style={{ marginTop: 8 }}>
            {DIVISION_PROFILE.division} division · {t('escalationsPageSub')}
          </p>
        </div>

        <div className="state-dashboard__data-panel">
          <div className="state-dashboard__data-head">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5c6560' }}>priority_high</span>
            <h3 className="state-dashboard__data-title">{t('divisionEscalationQueue')}</h3>
            <span className="state-dashboard__data-meta">{t('openItemsCount', { n: DIVISION_ESCALATIONS.length })}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                  {[
                    t('ticketId'),
                    t('raised'),
                    t('district'),
                    t('topic'),
                    t('owner'),
                    t('sla'),
                    t('status'),
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        color: '#717972',
                        textAlign: 'left',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIVISION_ESCALATIONS.map((e, i) => {
                  const chip = statusVisual(e.status);
                  return (
                    <tr key={e.id} style={{ borderBottom: i !== DIVISION_ESCALATIONS.length - 1 ? '1px solid #ebece8' : 'none', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#717972', fontVariantNumeric: 'tabular-nums' }}>{e.id}</td>
                      <td style={{ padding: '16px', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{e.raised}</td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#1a1c1a' }}>{e.district}</td>
                      <td style={{ padding: '16px', fontSize: 13, color: '#1a1c1a', lineHeight: 1.45, maxWidth: 280 }}>{e.topic}</td>
                      <td style={{ padding: '16px', fontSize: 13, color: '#414943' }}>{e.owner}</td>
                      <td style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#b45309' }}>{e.sla}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, color: chip.color, background: chip.bg, letterSpacing: '0.02em' }}>{e.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisionEscalations;
