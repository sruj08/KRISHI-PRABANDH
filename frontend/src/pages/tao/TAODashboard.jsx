import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_TAO_STATS, MOCK_APPLICATIONS, MOCK_GRIEVANCES } from '../../utils/taoMockData';
import RegionalMap from '../../components/maps/RegionalMap';
import CAOMatrix from './components/CAOMatrix';
import TAOAnomalyModal from './components/TAOAnomalyModal';

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
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [selectedAppId, setSelectedAppId] = useState(null);
  const selectedApp = MOCK_APPLICATIONS.find(app => app.id === selectedAppId);

  return (
    <div style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {selectedApp && (
        <TAOAnomalyModal
          application={selectedApp}
          onClose={() => setSelectedAppId(null)}
        />
      )}

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        <KpiCard icon="folder_open" label="Files Processed" value="1,402" sub="YTD 2024-25" />
        <KpiCard icon="pending_actions" label="Pending Audits" value="84" sub="Target: < 50" progress={12} subColor="#ba1a1a" />
        <KpiCard icon="satellite_alt" label="Geo-Verification" value="Active" sub="Telemetry stable" subIcon="check_circle" subColor="#396940" />
        <KpiCard icon="shield_locked" label="Leakage Prevented" value="42.5" unit="L" sub="Across all schemes" />
        <KpiCard icon="warning" label="Fraud Alerts" value="12" sub="9 batches pending" subIcon="warning" subColor="#ba1a1a" />
        <KpiCard icon="queue" label="Verification Queue" value="315" sub="Next pass in 2h" subIcon="schedule" />
      </div>

      {/* ── Main Grid: Map + Right Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, flex: 1, minHeight: 0 }}>
        
        {/* Map Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f0', flexShrink: 0, gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>Haveli Taluka — Geo Verification Map</h2>
              <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4, lineHeight: 1.4 }}>Live spatial analytics and field officer telemetry</p>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 380 }}>
            <RegionalMap
              layerType="taluka"
              boundaryUrl="/geo/baramati-ac.json"
            />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Fraud Pulse Widget */}
          <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, padding: '24px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>Fraud & Anomaly Pulse</h3>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6 }}>System flagged inconsistencies</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ba1a1a' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#444742', flex: 1 }}>Duplicate 7/12 Extracts</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ba1a1a' }}>18%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#444742', flex: 1 }}>Aadhar Name Mismatch</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#d97706' }}>24%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#717972' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#444742', flex: 1 }}>Geo-fencing Breaches</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#717972' }}>5%</span>
              </div>
            </div>
          </div>

          {/* Audit Recommendations */}
          <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, padding: '24px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>Audit Recommendations</h3>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6 }}>AI-driven actionable insights</p>
            </div>
            <div style={{ borderLeft: '4px solid #0055A4', background: '#f0f3f2', borderRadius: '0 10px 10px 0', padding: '14px 16px' }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1a1c1a', margin: 0, marginBottom: 6 }}>Initiate immediate audit in Loni Kalbhor.</p>
              <p style={{ fontSize: 11.5, color: '#444742', lineHeight: 1.6, margin: 0 }}>High volume of pending files (89) combined with 7 fraud alerts requires intervention.</p>
            </div>
          </div>

          {/* Grievance Routing */}
          <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, padding: '24px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>Grievance Routing</h3>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717972', margin: 0, marginTop: 6 }}>Farmer dispute escalation</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#ba1a1a', background: '#ffdad6', padding: '4px 9px', borderRadius: 6 }}>Action Req</span>
            </div>
            {MOCK_GRIEVANCES.slice(0, 1).map(g => (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#717972' }}>ID · {g.id}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#ba1a1a' }}>High Priority</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#1a1c19', fontStyle: 'italic', marginBottom: 16 }}>"{g.text}"</p>
                <div style={{ background: '#f9fafa', border: '1px solid #e2e3df', borderRadius: 10, padding: '12px 14px' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#033621', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>AI Translation</span>
                  <p style={{ fontSize: 11.5, color: '#444742', margin: 0 }}>"{g.translated}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Officer Performance Table (Full Width) ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e3df', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 28px', borderBottom: '1px solid #f3f4f0' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(57, 105, 64, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#396940' }}>leaderboard</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1a', margin: 0, lineHeight: 1.3 }}>
              Circle Agriculture Officer Performance
            </h3>
            <p style={{ fontSize: 11, color: '#717972', margin: 0, marginTop: 4 }}>Monitoring file processing velocity and accountability metrics</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e2e3df' }}>
                <th className="district-table-header">Officer Name</th>
                <th className="district-table-header">Circle</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>Pending Files</th>
                <th className="district-table-header" style={{ textAlign: 'center' }}>Fraud Alerts</th>
                <th className="district-table-header" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="district-table-row" style={{ borderBottom: '1px solid #f3f4f0' }}>
                <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 700, color: '#1a1c1a' }}>Ramesh Patil</td>
                <td style={{ padding: '18px 28px', fontSize: '13px', color: '#717972' }}>Wagholi</td>
                <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right' }}>42</td>
                <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ba1a1a', background: '#ffdad6', padding: '4px 10px', borderRadius: 6 }}>3 High</span>
                </td>
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <button style={{ color: '#396940', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Review</button>
                </td>
              </tr>
              <tr className="district-table-row" style={{ borderBottom: '1px solid #f3f4f0', background: '#fafafa' }}>
                <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 700, color: '#1a1c1a' }}>Sunita Deshmukh</td>
                <td style={{ padding: '18px 28px', fontSize: '13px', color: '#717972' }}>Khed Shivapur</td>
                <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right' }}>15</td>
                <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#717972', background: '#f3f4f0', padding: '4px 10px', borderRadius: 6 }}>0</span>
                </td>
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <button style={{ color: '#396940', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Review</button>
                </td>
              </tr>
              <tr className="district-table-row">
                <td style={{ padding: '18px 28px', fontSize: '13px', fontWeight: 700, color: '#1a1c1a' }}>Vijay More</td>
                <td style={{ padding: '18px 28px', fontSize: '13px', color: '#717972' }}>Loni Kalbhor</td>
                <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: 700, color: '#1a1c1a', textAlign: 'right' }}>52</td>
                <td style={{ padding: '18px 28px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ba1a1a', background: '#ffdad6', padding: '4px 10px', borderRadius: 6 }}>6 High</span>
                </td>
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <button style={{ color: '#396940', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Review</button>
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
