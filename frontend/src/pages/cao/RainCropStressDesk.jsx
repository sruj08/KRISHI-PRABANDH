import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WEATHER_SUMMARY, CROP_STRESS_DATA, TALUKAS } from '../../mock/cao-mock';
import './cao-command.css';

/** Same layout fix as CAO district map — explicit height + invalidateSize after paint. */
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

const RISK_FILL = { High: '#ef5350', Medium: '#ffa726', Low: '#c5e1a5', Nil: '#e8f5e9' };
const RISK_RING = { High: '#c62828', Medium: '#e65100', Low: '#689f38', Nil: '#81c784' };

function CropStressLeafletMap({ data }) {
  const rows = useMemo(() => {
    const byName = Object.fromEntries(data.talukaStress.map((s) => [s.taluka.toLowerCase(), s]));
    return TALUKAS.filter((t) => t.lat != null && t.lng != null).map((t) => ({
      ...t,
      stress: byName[t.name.toLowerCase()],
    }));
  }, [data.talukaStress]);

  const latLngs = useMemo(() => rows.map((t) => [t.lat, t.lng]), [rows]);
  const center = useMemo(() => {
    if (!latLngs.length) return [17.65, 75.55];
    const b = L.latLngBounds(latLngs.map(([la, ln]) => L.latLng(la, ln)));
    const c = b.getCenter();
    return [c.lat, c.lng];
  }, [latLngs]);

  return (
    <div className="cao-map-fallback cao-risk-leaflet" style={{ position: 'relative' }}>
      <div className="cao-risk-leaflet-legend">
        <div className="cao-risk-leaflet-legend__title">Crop loss risk (NDVI)</div>
        {['High', 'Medium', 'Low', 'Nil'].map((r) => (
          <div key={r} className="cao-risk-leaflet-legend__row">
            <span className="cao-risk-leaflet-legend__swatch" style={{ background: RISK_FILL[r] }} />
            <span className="cao-risk-leaflet-legend__label">{r}</span>
          </div>
        ))}
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
          {rows.map((t) => {
            const risk = t.stress?.cropLossRisk || 'Nil';
            const fill = RISK_FILL[risk] || RISK_FILL.Nil;
            const ring = RISK_RING[risk] || RISK_RING.Nil;
            const acres = t.stress?.affectedAcres ?? 0;
            const radius = Math.max(12, 14 + Math.min(22, Math.round(acres / 85)));
            const fillOp = risk === 'High' ? 0.82 : risk === 'Medium' ? 0.7 : risk === 'Low' ? 0.55 : 0.42;
            return (
              <CircleMarker
                key={t.id}
                center={[t.lat, t.lng]}
                radius={radius}
                pathOptions={{
                  color: ring,
                  weight: risk === 'High' ? 3 : 2,
                  fillColor: fill,
                  fillOpacity: fillOp,
                  opacity: 0.95,
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.95} className="cao-taluka-tooltip">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#37474f' }}>
                    Risk <strong>{risk}</strong>
                    {t.stress?.ndviDrop != null && (
                      <>
                        {' · '}
                        NDVI {t.stress.ndviDrop > 0 ? '+' : ''}
                        {t.stress.ndviDrop}%
                      </>
                    )}
                  </div>
                  {t.stress?.mainCrop && (
                    <div style={{ fontSize: 10, color: '#616161', marginTop: 4 }}>Crop: {t.stress.mainCrop}</div>
                  )}
                  {acres > 0 && (
                    <div style={{ fontSize: 10, color: '#616161' }}>Affected: {acres.toLocaleString()} ac</div>
                  )}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <p className="cao-risk-leaflet-caption">
        Solapur district · Sentinel-2 NDVI composite · hover markers for taluka stress
      </p>
    </div>
  );
}

const MAP_TABS = [
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'taluka_table', label: 'Taluka Table' },
  { id: 'rainfall', label: 'Rainfall Data' },
];

export default function RainCropStressDesk() {
  const w = WEATHER_SUMMARY;
  const c = CROP_STRESS_DATA;
  const [activeTab, setActiveTab] = useState('heatmap');

  return (
    <div className="cao-page">
      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">Rain &amp; Crop Stress</h1>
          <p className="cao-page-sub">
            NDVI crop stress &amp; rainfall intelligence · {w.lastUpdated}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`cao-chip cao-chip--${w.imdAlert === 'Yellow Alert' ? 'high' : 'medium'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>wb_cloudy</span>
            IMD: {w.imdAlert}
          </span>
          <span className="cao-chip cao-chip--critical" style={{ background: '#fde8e8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
            Crop Stress: {w.cropStressLevel}
          </span>
        </div>
      </div>

      <div className="cao-content">
        <div className="cao-cols">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">District Crop Stress Map</h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MAP_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`cao-btn cao-btn--sm${activeTab === tab.id ? ' cao-btn--primary' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cao-panel-body" style={{ padding: activeTab === 'heatmap' ? 0 : '12px 16px' }}>
                {activeTab === 'heatmap' && <CropStressLeafletMap data={c} />}

                {activeTab === 'taluka_table' && (
                  <div className="cao-table-wrap">
                    <table className="cao-table">
                      <thead>
                        <tr>
                          <th>Taluka</th>
                          <th>Main Crop</th>
                          <th>NDVI Drop</th>
                          <th>Crop Loss Risk</th>
                          <th>Affected Acres</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.talukaStress.map((s) => (
                          <tr key={s.taluka}>
                            <td className="name-cell">{s.taluka}</td>
                            <td className="muted">{s.mainCrop}</td>
                            <td
                              style={{
                                fontWeight: 700,
                                color:
                                  s.ndviDrop < -10 ? '#c62828' : s.ndviDrop < -5 ? '#b35c00' : s.ndviDrop >= 0 ? '#2e7d32' : '#717972',
                              }}
                            >
                              {s.ndviDrop > 0 ? '+' : ''}
                              {s.ndviDrop}%
                            </td>
                            <td>
                              <span className={`cao-risk cao-risk--${s.cropLossRisk.toLowerCase()}`}>{s.cropLossRisk}</span>
                            </td>
                            <td>{s.affectedAcres > 0 ? `${s.affectedAcres.toLocaleString()} ac` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'rainfall' && (
                  <div style={{ padding: '8px 0' }}>
                    {w.talukaRainfall.map((tr) => {
                      const max = Math.max(...w.talukaRainfall.map((r) => r.mm)) * 1.2;
                      const pct = Math.round((tr.mm / max) * 100);
                      const normalPct = Math.round((tr.normal / max) * 100);
                      const barColor =
                        tr.status === 'excess'
                          ? '#1565c0'
                          : tr.status === 'above'
                            ? '#42a5f5'
                            : tr.status === 'deficient'
                              ? '#ef5350'
                              : '#66bb6a';
                      return (
                        <div key={tr.taluka} style={{ marginBottom: 16, padding: '0 4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
                            <span style={{ fontWeight: 600, color: '#1a1c1a' }}>{tr.taluka}</span>
                            <span style={{ color: barColor, fontWeight: 700 }}>
                              {tr.mm} mm
                              <span style={{ color: '#9aa19c', fontWeight: 500 }}> / {tr.normal} normal</span>
                            </span>
                          </div>
                          <div style={{ height: 10, background: '#eceee9', borderRadius: 99, position: 'relative', overflow: 'visible' }}>
                            <div style={{ height: '100%', background: barColor, borderRadius: 99, width: `${pct}%` }} />
                            <div
                              style={{
                                position: 'absolute',
                                top: -5,
                                left: `${normalPct}%`,
                                width: 2,
                                height: 20,
                                background: '#9aa19c',
                                borderRadius: 1,
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 10, color: '#9aa19c', marginTop: 3 }}>
                            {tr.status === 'excess'
                              ? '⚠ Excess rainfall — waterlogging risk'
                              : tr.status === 'above'
                                ? 'Above normal'
                                : tr.status === 'deficient'
                                  ? '⚠ Deficient — crop stress risk'
                                  : 'Normal'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">Crop Intelligence Feed</h2>
                <span style={{ fontSize: 10.5, color: '#9aa19c' }}>Today</span>
              </div>
              <div>
                {c.insights.map((ins) => {
                  const iconBg =
                    ins.severity === 'high'
                      ? { bg: '#fde8e8', color: '#c62828' }
                      : ins.severity === 'medium'
                        ? { bg: '#fff3cd', color: '#b35c00' }
                        : { bg: '#e8f5ec', color: '#2e7d32' };
                  return (
                    <div key={ins.id} className="cao-insight-item">
                      <div className="cao-insight-icon" style={{ background: iconBg.bg }}>
                        <span className="material-symbols-outlined" style={{ color: iconBg.color }}>{ins.icon}</span>
                      </div>
                      <div>
                        <div className="cao-insight-text">{ins.text}</div>
                        <div className="cao-insight-meta">
                          <span>{ins.taluka}</span>
                          <span>·</span>
                          <span>{ins.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">Current Conditions</h2>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'IMD Alert', value: w.imdAlert, color: w.imdAlertColor },
                  { label: 'Crop Stress', value: w.cropStressLevel, color: w.cropStressColor },
                  { label: 'Soil Moisture', value: w.soilMoisture, color: w.soilMoistureColor },
                  { label: 'Humidity', value: `${w.humidity}%`, color: '#1565c0' },
                  { label: 'Rainfall 24h', value: `${w.currentRainfallMM}mm (${w.deviationPct})`, color: w.deviationColor },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      padding: '6px 0',
                      borderBottom: '1px solid #f0f2ee',
                    }}
                  >
                    <span style={{ color: '#717972', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 700 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
