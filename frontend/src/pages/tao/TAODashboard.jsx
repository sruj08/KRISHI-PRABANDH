import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import { MOCK_APPLICATIONS, MOCK_GRIEVANCES } from '../../utils/taoMockData';
import TAOMap from './components/TAOMap';
import TAOAnomalyModal from './components/TAOAnomalyModal';
import '../district/district.css';
import './tao.css';
import { useLanguage } from '../../context/LanguageContext';

/* ── Shared design primitives ───────────────────────────────────────────────── */
const PANEL_BORDER = '#e2e3df';
const TEXT_PRIMARY = '#1a1c1a';
const TEXT_MUTED = '#717972';

const KpiCard = ({ icon, label, value, unit, sub, subIcon, subColor = '#717972', progress, children, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      border: `1px solid ${PANEL_BORDER}`,
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 152,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 28, marginBottom: 14 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#f3f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#717972' }}>{icon}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717972', lineHeight: 1.3 }}>{label}</span>
    </div>
    {children ? (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>{children}</div>
    ) : (
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED }}>{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 6, background: '#f3f4f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
          </div>
        )}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, marginTop: 'auto', paddingTop: 12, color: subColor }}>
            {subIcon && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{subIcon}</span>}
            {sub}
          </div>
        )}
      </>
    )}
  </div>
);

const TAODashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getReportingChain } = useKrishiData();
  const reportsTo = user?.user_id != null ? getReportingChain(user.user_id)[1] : null;

  const [selectedAppId, setSelectedAppId] = useState(null);
  const selectedApp = MOCK_APPLICATIONS.find((app) => app.id === selectedAppId);
  const demoAnomalyApp = MOCK_APPLICATIONS[0];

  return (
    <div
      className="tao-dash-root"
      style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {selectedApp && (
        <TAOAnomalyModal
          application={selectedApp}
          onClose={() => setSelectedAppId(null)}
        />
      )}

      {reportsTo && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e3df',
            borderRadius: 12,
            padding: '12px 18px',
            fontSize: 12,
            color: '#1a1c1a',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>account_tree</span>
          <span style={{ fontWeight: 700 }}>{t('Reporting line')}</span>
          <span style={{ color: '#717972' }}>
            {t('You report to')} <strong style={{ color: '#1a1c1a' }}>{reportsTo.label || reportsTo.name || t('DAO')}</strong>
            {user?.taluka_name && (
              <>
                {' '}
                · {t('Taluka')}: <strong style={{ color: '#1a1c1a' }}>{user.taluka_name}</strong>
              </>
            )}
          </span>
        </div>
      )}

      {/* KPI strip */}
      <div className="tao-kpi-grid">
        <KpiCard icon="folder_open" label={t('Files processed (YTD)')} value="1,402" sub={t('FY 2024-25')} />
        <KpiCard icon="pending_actions" label={t('Pending at TAO')} value="89" sub={t('Across circles')} subIcon="schedule" />
        <KpiCard icon="shield" label={t('Fraud reviews')} value="7" sub={t('Open this week')} subColor="#ba1a1a" />
        <KpiCard icon="groups" label={t('Field visits')} value="124" unit={t('/wk')} sub={t('Geo-tagged')} />
        <KpiCard
          icon="gavel"
          label={t('Sample anomaly')}
          value={t('Open')}
          sub={t('Duplicate 7/12 demo')}
          onClick={() => setSelectedAppId(demoAnomalyApp?.id)}
        />
      </div>

      {/* Map + right rail */}
      <div className="tao-command-row">
        <div className="tao-map-card" style={{ padding: 0 }}>
          <TAOMap />
        </div>

        <div className="tao-command-rail">
          <div className="tao-rail-panel">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>{t('Fraud &amp; anomaly pulse')}</h3>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6 }}>{t('System flagged inconsistencies')}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ba1a1a' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#444742', flex: 1 }}>{t('Duplicate 7/12 extracts')}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ba1a1a' }}>{t('18%')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#444742', flex: 1 }}>{t('Aadhaar name mismatch')}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#d97706' }}>{t('24%')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#717972' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#444742', flex: 1 }}>{t('Geo-fencing breaches')}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#717972' }}>{t('5%')}</span>
              </div>
            </div>
          </div>

          <div className="tao-rail-panel">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>{t('Audit recommendations')}</h3>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6 }}>{t('AI-driven actionable insights')}</p>
            </div>
            <div style={{ borderLeft: '4px solid #0055A4', background: '#f0f3f2', borderRadius: '0 10px 10px 0', padding: '14px 16px' }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1a1c1a', margin: 0, marginBottom: 6 }}>{t('Initiate immediate audit in Loni Kalbhor.')}</p>
              <p style={{ fontSize: 11.5, color: '#444742', lineHeight: 1.6, margin: 0 }}>{t('High volume of pending files (89) combined with 7 fraud alerts requires intervention.')}</p>
            </div>
          </div>

          <div className="tao-rail-panel tao-rail-panel--grow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>{t('Grievance routing')}</h3>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6 }}>{t('Farmer dispute escalation')}</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#ba1a1a', background: '#ffdad6', padding: '4px 9px', borderRadius: 6 }}>{t('Action req')}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {MOCK_GRIEVANCES.slice(0, 1).map((g) => (
                <div key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#717972' }}>{t('ID')} · {g.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ba1a1a' }}>{t('High priority')}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#1a1c19', fontStyle: 'italic', marginBottom: 16 }}>&ldquo;{g.text}&rdquo;</p>
                  <div style={{ background: '#f9fafa', border: '1px solid #e2e3df', borderRadius: 10, padding: '12px 14px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#033621', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{t('AI translation')}</span>
                    <p style={{ fontSize: 11.5, color: '#444742', margin: 0 }}>&ldquo;{g.translated}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mandal-wise performance — Baramati taluka (demo) */}
      <div style={{ background: '#fff', border: 'none', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 28px', borderBottom: '1px solid #f3f4f0' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(57, 105, 64, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>leaderboard</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>
              {t('Mandal officer performance — Baramati taluka')}
            </h3>
            <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4 }}>{t('Pending files and fraud alerts by mandal under this taluka')}</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                <th className="district-table-header">{t('Officer name')}</th>
                <th className="district-table-header">{t('Mandal')}</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>{t('Pending files')}</th>
                <th className="district-table-header" style={{ textAlign: 'center' }}>{t('Fraud alerts')}</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="district-table-row" style={{ borderBottom: '1px solid #f3f4f0' }}>
                <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 700, color: '#1a1c1a' }}>Ramesh Patil</td>
                <td style={{ padding: '18px 28px', fontSize: '13px', color: '#717972' }}>Malegaon BK</td>
                <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right' }}>42</td>
                <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ba1a1a', background: '#ffdad6', padding: '4px 10px', borderRadius: 6 }}>{t('3 High')}</span>
                </td>
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <button type="button" onClick={() => setSelectedAppId(demoAnomalyApp?.id)} style={{ color: '#396940', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>{t('Review')}</button>
                </td>
              </tr>
              <tr className="district-table-row" style={{ borderBottom: '1px solid #f3f4f0', background: '#fafafa' }}>
                <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 700, color: '#1a1c1a' }}>Sunita Deshmukh</td>
                <td style={{ padding: '18px 28px', fontSize: '13px', color: '#717972' }}>Hol</td>
                <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right' }}>15</td>
                <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#717972', background: '#f3f4f0', padding: '4px 10px', borderRadius: 6 }}>{t('0')}</span>
                </td>
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <button type="button" onClick={() => setSelectedAppId(demoAnomalyApp?.id)} style={{ color: '#396940', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>{t('Review')}</button>
                </td>
              </tr>
              <tr className="district-table-row">
                <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 700, color: '#1a1c1a' }}>Vijay More</td>
                <td style={{ padding: '18px 28px', fontSize: '13px', color: '#717972' }}>Vadgaon Nimbalkar</td>
                <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right' }}>52</td>
                <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ba1a1a', background: '#ffdad6', padding: '4px 10px', borderRadius: 6 }}>{t('6 High')}</span>
                </td>
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <button type="button" onClick={() => setSelectedAppId(demoAnomalyApp?.id)} style={{ color: '#396940', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>{t('Review')}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TAODashboard;
