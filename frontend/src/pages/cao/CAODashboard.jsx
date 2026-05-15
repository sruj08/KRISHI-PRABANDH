import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../context/LanguageContext';
import {
  CAO_PROFILE, CAO_KPI, TALUKAS, FIELD_ALERTS, WEATHER_SUMMARY,
} from '../../mock/cao-mock';
import './cao-command.css';

const RISK_STROKE = { high: '#c62828', medium: '#e65100', low: '#2e7d32' };
const RISK_FILL = { high: '#ef5350', medium: '#ffa726', low: '#66bb6a' };

const LAYER_OPACITY = {
  rainfall: { barshi: 0.85, pandharpur: 0.55, madha: 0.45, sangola: 0.3, mohol: 0.25 },
  crop_stress: { barshi: 0.8, pandharpur: 0.72, mohol: 0.4, sangola: 0.25, madha: 0.1 },
  pmfby: { barshi: 0.65, pandharpur: 0.6, madha: 0.35, sangola: 0.22, mohol: 0.2 },
  surveys: { barshi: 0.7, pandharpur: 0.5, madha: 0.2, sangola: 0.1, mohol: 0.3 },
};

const LAYER_COLOR = {
  rainfall: '#1565c0',
  crop_stress: '#e65100',
  pmfby: '#6a1b9a',
  surveys: '#2e6b3e',
};

/**
 * Leaflet measures the container on first paint — flex/% height often resolves to 0.
 * Invalidate after layout, then fit bounds (same pattern as ActionMap: explicit px wrapper).
 */
function SolapurMapLayout({ latLngs }) {
  const map = useMap();
  useEffect(() => {
    const apply = () => {
      map.invalidateSize({ animate: false });
      if (!latLngs?.length) return;
      const b = L.latLngBounds(latLngs.map(([la, ln]) => L.latLng(la, ln)));
      if (b.isValid()) map.fitBounds(b, { padding: [44, 44], maxZoom: 10, animate: false });
    };
    const raf = requestAnimationFrame(apply);
    const t1 = setTimeout(apply, 120);
    const t2 = setTimeout(apply, 400);
    window.addEventListener('resize', apply);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', apply);
    };
  }, [map, latLngs]);
  return null;
}

/* ── District risk map — real basemap (Leaflet) + same operational risk model as before ── */
function DistrictMap({ talukas, activeLayer, onTalukaClick }) {
  const layerColor = LAYER_COLOR[activeLayer] || '#2e6b3e';
  const layerOpacity = LAYER_OPACITY[activeLayer] || {};

  const latLngs = useMemo(
    () => talukas.filter((t) => t.lat != null && t.lng != null).map((t) => [t.lat, t.lng]),
    [talukas],
  );

  const center = useMemo(() => {
    if (!latLngs.length) return [17.65, 75.55];
    const b = L.latLngBounds(latLngs.map(([la, ln]) => L.latLng(la, ln)));
    const c = b.getCenter();
    return [c.lat, c.lng];
  }, [latLngs]);

  return (
    <div className="cao-map-fallback cao-risk-leaflet" style={{ position: 'relative' }}>
      <div className="cao-risk-leaflet-legend">
        <div className="cao-risk-leaflet-legend__title">
          Layer: {activeLayer.replaceAll('_', ' ').toUpperCase()}
        </div>
        {['high', 'medium', 'low'].map((r) => (
          <div key={r} className="cao-risk-leaflet-legend__row">
            <span className="cao-risk-leaflet-legend__swatch" style={{ background: RISK_FILL[r] }} />
            <span className="cao-risk-leaflet-legend__label">{r} risk</span>
          </div>
        ))}
        <div className="cao-risk-leaflet-legend__divider">
          <span className="cao-risk-leaflet-legend__swatch cao-risk-leaflet-legend__swatch--layer" style={{ background: layerColor }} />
          <span className="cao-risk-leaflet-legend__label">Layer intensity</span>
        </div>
      </div>

      <div className="cao-risk-leaflet-map">
        <MapContainer
          center={center}
          zoom={9}
          scrollWheelZoom
          className="cao-risk-leaflet-map__inner"
          style={{ height: '100%', width: '100%' }}
        >
          <SolapurMapLayout latLngs={latLngs} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains="abc"
            maxZoom={19}
          />
          {talukas.map((t) => {
            if (t.lat == null || t.lng == null) return null;
            const risk = t.riskLevel || 'low';
            const stroke = RISK_STROKE[risk] || RISK_STROKE.low;
            const layerOp = layerOpacity[t.id] ?? 0.25;
            const radius = 12 + Math.min(24, Math.round((t.pending + t.pmfbyClaims) / 5));
            const fillOp = Math.min(0.78, 0.22 + layerOp * 0.55);
            return (
              <CircleMarker
                key={t.id}
                center={[t.lat, t.lng]}
                radius={radius}
                pathOptions={{
                  color: stroke,
                  weight: risk === 'high' ? 3 : 2,
                  fillColor: layerColor,
                  fillOpacity: fillOp,
                  opacity: 0.95,
                }}
                eventHandlers={{ click: () => onTalukaClick(t.id) }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.95} className="cao-taluka-tooltip">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#37474f' }}>
                    {t.pending} pending · {t.pmfbyClaims} PMFBY · {t.riskLevel} risk
                  </div>
                  <div style={{ fontSize: 10, color: '#616161', marginTop: 4 }}>
                    Layer {activeLayer.replaceAll('_', ' ')} · rain alerts: {t.rainAlerts ?? 0}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <p className="cao-risk-leaflet-caption">
        Solapur district — Barshi circle · OpenStreetMap basemap · click a marker for taluka performance
      </p>
    </div>
  );
}

/* ── Layer Toggle ── */
const LAYERS = [
  { id: 'rainfall', label: 'Rainfall', icon: 'water_drop' },
  { id: 'crop_stress', label: 'Crop Stress', icon: 'grass' },
  { id: 'pmfby', label: 'PMFBY', icon: 'verified_user' },
  { id: 'surveys', label: 'Surveys', icon: 'assignment' },
];

/* ── KPI Card ── */
function KpiCard({ icon, label, value, unit, sub, subColor, accent }) {
  return (
    <div className="cao-kpi" style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <div className="cao-kpi-label">
        <span className="material-symbols-outlined">{icon}</span>
        {label}
      </div>
      <div>
        <span className="cao-kpi-value">{value}</span>
        {unit && <span className="cao-kpi-unit">{unit}</span>}
      </div>
      {sub && <div className="cao-kpi-sub" style={subColor ? { color: subColor } : {}}>{sub}</div>}
    </div>
  );
}

/* ── Alert Item ── */
function AlertItem({ alert, onAction }) {
  const sevColor = {
    critical: 'cao-chip--critical',
    high: 'cao-chip--high',
    medium: 'cao-chip--medium',
    low: 'cao-chip--low',
  };
  return (
    <div className="cao-alert-item">
      <div className="cao-alert-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className={`cao-chip ${sevColor[alert.severity] || 'cao-chip--low'}`}>
            {alert.severity}
          </span>
          <span className="cao-date-tag">{alert.timestamp}</span>
          <span style={{ fontSize: 10.5, color: '#717972' }}>·</span>
          <span style={{ fontSize: 10.5, color: '#717972' }}>{alert.taluka}</span>
        </div>
        <p className="cao-alert-title">{alert.title}</p>
        <p className="cao-alert-desc">{alert.body}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {alert.actions.map(a => (
            <button key={a} className="cao-btn cao-btn--sm" onClick={() => onAction(a, alert)}>
              <span className="material-symbols-outlined">{a === 'View Case' ? 'open_in_new' : a === 'Assign Officer' ? 'person_add' : 'assignment'}</span>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function CAODashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState('rainfall');
  const [actionMsg, setActionMsg] = useState(null);

  const handleAction = (action, alert) => {
    if (action === 'View Case') {
      setActionMsg({ type: 'info', text: `Opening case: ${alert.title}` });
    } else if (action === 'Assign Officer') {
      setActionMsg({ type: 'success', text: `Officer assignment workflow opened for ${alert.taluka}` });
    } else {
      setActionMsg({ type: 'info', text: `Survey module opening for ${alert.village}` });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleTalukaClick = (talukaId) => {
    navigate(`/cao/taluka-performance?taluka=${talukaId}`);
  };

  const w = WEATHER_SUMMARY;

  return (
    <div className="cao-page">
      {/* ── Header ── */}
      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">District Agriculture Command — {CAO_PROFILE.district}</h1>
          <p className="cao-page-sub">{CAO_PROFILE.designation} · {CAO_PROFILE.circle} · {CAO_PROFILE.season}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, color: '#717972', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>schedule</span>
            {w.lastUpdated}
          </span>
          <span className={`cao-chip cao-chip--${w.imdAlert === 'Yellow Alert' ? 'high' : 'medium'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>wb_cloudy</span>
            IMD: {w.imdAlert}
          </span>
        </div>
      </div>

      {/* ── Action toast ── */}
      {actionMsg && (
        <div style={{
          margin: '12px 24px 0', padding: '10px 16px', borderRadius: 8,
          background: actionMsg.type === 'success' ? '#e8f5ec' : '#e3f2fd',
          color: actionMsg.type === 'success' ? '#2e6b3e' : '#1565c0',
          fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${actionMsg.type === 'success' ? '#c8e6c9' : '#bbdefb'}`,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {actionMsg.type === 'success' ? 'check_circle' : 'info'}
          </span>
          {actionMsg.text}
        </div>
      )}

      <div className="cao-content">
        {/* ── KPI Strip ── */}
        <div className="cao-kpi-strip">
          <KpiCard icon="pending_actions" label="Pending Approvals" value={CAO_KPI.pendingApprovals} accent="#ffa726" sub="↑ 8 since Monday" subColor="#b35c00" />
          <KpiCard icon="water_drop" label="Active Rain Alerts" value={CAO_KPI.activeRainAlerts} accent="#1565c0" sub="Barshi + Pandharpur" subColor="#1565c0" />
          <KpiCard icon="verified_user" label="PMFBY Under Review" value={CAO_KPI.pmfbyClaimsUnderReview} accent="#6a1b9a" sub={`of ${CAO_KPI.totalApplicationsThisSeason} total`} />
          <KpiCard icon="location_on" label="High Risk Villages" value={CAO_KPI.highRiskVillages} accent="#c62828" sub="Crop loss exposure" subColor="#c62828" />
          <KpiCard icon="timer" label="Avg Disposal Time" value={CAO_KPI.avgDisposalDays} unit="days" accent="#2e6b3e" sub="Target: 3.0 days" />
          <KpiCard icon="badge" label="Officer Attendance" value={CAO_KPI.fieldOfficerAttendance} unit="%" accent={CAO_KPI.fieldOfficerAttendance < 85 ? '#ffa726' : '#2e6b3e'} sub="2 inactive today" subColor={CAO_KPI.fieldOfficerAttendance < 85 ? '#b35c00' : undefined} />
        </div>

        {/* ── Main two-col layout ── */}
        <div className="cao-cols">
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* District Map Panel */}
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">District Risk Map — Solapur</h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {LAYERS.map(l => (
                    <button
                      key={l.id}
                      className={`cao-btn cao-btn--sm${activeLayer === l.id ? ' cao-btn--primary' : ''}`}
                      onClick={() => setActiveLayer(l.id)}
                    >
                      <span className="material-symbols-outlined">{l.icon}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cao-panel-body" style={{ padding: '12px 16px' }}>
                <DistrictMap talukas={TALUKAS} activeLayer={activeLayer} onTalukaClick={handleTalukaClick} />
                <p style={{ fontSize: 11, color: '#9aa19c', marginTop: 8, textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 3 }}>touch_app</span>
                  Click any taluka to open Taluka Performance details
                </p>
              </div>
            </div>

            {/* Field Alerts */}
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">Active Field Alerts</h2>
                <span className={`cao-chip cao-chip--critical`}>{FIELD_ALERTS.filter(a => a.status === 'open').length} Open</span>
              </div>
              <div className="cao-panel-body--tight">
                {FIELD_ALERTS.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onAction={handleAction} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Taluka Snapshot */}
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">Taluka Snapshot</h2>
                <button className="cao-btn cao-btn--sm" onClick={() => navigate('/cao/taluka-performance')}>
                  View All
                </button>
              </div>
              <div className="cao-panel-body--tight cao-table-wrap">
                <table className="cao-table">
                  <thead>
                    <tr>
                      <th>Taluka</th>
                      <th>Pending</th>
                      <th>Avg Days</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TALUKAS.map(tal => (
                      <tr key={tal.id} style={{ cursor: 'pointer' }} onClick={() => handleTalukaClick(tal.id)}>
                        <td className="name-cell" style={{ color: '#2e6b3e' }}>{tal.name}</td>
                        <td>{tal.pending}</td>
                        <td>{tal.avgDisposalDays}d</td>
                        <td><span className={`cao-risk cao-risk--${tal.riskLevel}`}>{tal.riskLevel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weather Summary */}
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">Weather Summary</h2>
                <button className="cao-btn cao-btn--sm" onClick={() => navigate('/cao/rain-crop-stress')}>
                  Full Desk →
                </button>
              </div>
              <div className="cao-weather-row">
                <div className="cao-weather-cell">
                  <div className="cao-weather-cell-label">Rainfall (24h)</div>
                  <div className="cao-weather-cell-value" style={{ color: w.deviationColor }}>{w.currentRainfallMM} mm</div>
                  <div className="cao-weather-cell-sub">{w.deviationPct} vs normal</div>
                </div>
                <div className="cao-weather-cell">
                  <div className="cao-weather-cell-label">IMD Status</div>
                  <div className="cao-weather-cell-value" style={{ color: w.imdAlertColor }}>{w.imdAlert}</div>
                  <div className="cao-weather-cell-sub">Barshi active</div>
                </div>
                <div className="cao-weather-cell">
                  <div className="cao-weather-cell-label">Humidity</div>
                  <div className="cao-weather-cell-value">{w.humidity}%</div>
                  <div className="cao-weather-cell-sub">High</div>
                </div>
                <div className="cao-weather-cell">
                  <div className="cao-weather-cell-label">Crop Stress</div>
                  <div className="cao-weather-cell-value" style={{ color: w.cropStressColor }}>{w.cropStressLevel}</div>
                  <div className="cao-weather-cell-sub">2 talukas affected</div>
                </div>
                <div className="cao-weather-cell">
                  <div className="cao-weather-cell-label">Soil Moisture</div>
                  <div className="cao-weather-cell-value" style={{ color: w.soilMoistureColor }}>{w.soilMoisture}</div>
                  <div className="cao-weather-cell-sub">Waterlogging risk</div>
                </div>
                <div className="cao-weather-cell">
                  <div className="cao-weather-cell-label">Season</div>
                  <div className="cao-weather-cell-value" style={{ fontSize: 13 }}>{CAO_PROFILE.season}</div>
                  <div className="cao-weather-cell-sub">Kharif onset</div>
                </div>
              </div>

              {/* Taluka rainfall bars */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9aa19c', marginBottom: 10 }}>
                  Taluka Rainfall vs Normal (mm)
                </div>
                {w.talukaRainfall.map(tr => {
                  const pct = Math.min(100, Math.round((tr.mm / Math.max(tr.normal * 1.8, tr.mm)) * 100));
                  const normalPct = Math.round((tr.normal / Math.max(tr.normal * 1.8, tr.mm)) * 100);
                  const barColor = tr.status === 'excess' ? '#1565c0' : tr.status === 'above' ? '#42a5f5' : tr.status === 'deficient' ? '#ef5350' : '#66bb6a';
                  return (
                    <div className="cao-rain-bar-wrap" key={tr.taluka}>
                      <div className="cao-rain-bar-header">
                        <span className="cao-rain-bar-name">{tr.taluka}</span>
                        <span className="cao-rain-bar-mm">{tr.mm} mm <span style={{ color: '#c8cbc5' }}>/ {tr.normal} normal</span></span>
                      </div>
                      <div className="cao-rain-bar-track">
                        <div className="cao-rain-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                        <div className="cao-rain-bar-normal-marker" style={{ left: `${normalPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Nav */}
            <div className="cao-panel">
              <div className="cao-panel-head"><h2 className="cao-panel-title">Quick Actions</h2></div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Review Pending PMFBY Claims', icon: 'verified_user', path: '/cao/pmfby', count: CAO_KPI.pmfbyClaimsUnderReview },
                  { label: 'Open Grievance Queue', icon: 'gavel', path: '/cao/grievances', count: 4 },
                  { label: 'Field Operations Overview', icon: 'agriculture', path: '/cao/field-operations' },
                  { label: 'Taluka Performance Board', icon: 'leaderboard', path: '/cao/taluka-performance' },
                ].map(q => (
                  <button key={q.path} className="cao-btn" style={{ justifyContent: 'space-between' }} onClick={() => navigate(q.path)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{q.icon}</span>
                      {q.label}
                    </span>
                    {q.count !== undefined && (
                      <span style={{ background: '#fde8e8', color: '#c62828', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4 }}>
                        {q.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
