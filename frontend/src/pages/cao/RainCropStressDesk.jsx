import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WEATHER_SUMMARY, CROP_STRESS_DATA, TALUKAS } from '../../mock/cao-mock';
import './cao-command.css';

/* ── Crop stress SVG heatmap ── */
function CropStressHeatmap({ data, talukas }) {
  const [hoveredTaluka, setHoveredTaluka] = useState(null);

  const riskColors = {
    High: '#ef5350',
    Medium: '#ffa726',
    Low: '#a5d6a7',
    Nil: '#e8f5ec',
  };

  // Schematic Solapur district taluka blocks
  const shapes = [
    { id: 'barshi', label: 'Barshi', x: 200, y: 70, w: 160, h: 100 },
    { id: 'pandharpur', label: 'Pandharpur', x: 60, y: 165, w: 170, h: 100 },
    { id: 'madha', label: 'Madha', x: 240, y: 165, w: 140, h: 100 },
    { id: 'sangola', label: 'Sangola', x: 100, y: 260, w: 150, h: 90 },
    { id: 'mohol', label: 'Mohol', x: 260, y: 260, w: 120, h: 90 },
  ];

  const stressById = Object.fromEntries(data.talukaStress.map(s => [s.taluka.toLowerCase(), s]));

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 450 400" style={{ width: '100%', display: 'block', borderRadius: 10, background: '#eef3ee', border: '1px solid #dce5dc' }}>
        {/* Background */}
        <rect x="40" y="50" width="370" height="320" rx="20" fill="#e4ede4" stroke="#c8d4c8" strokeWidth="1.5" />

        {shapes.map(s => {
          const stress = stressById[s.label.toLowerCase()];
          const risk = stress?.cropLossRisk || 'Nil';
          const color = riskColors[risk];
          const isHovered = hoveredTaluka === s.label;
          const ndvi = stress?.ndviDrop;

          return (
            <g key={s.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredTaluka(s.label)}
              onMouseLeave={() => setHoveredTaluka(null)}
            >
              <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10}
                fill={color}
                fillOpacity={isHovered ? 0.8 : 0.65}
                stroke={isHovered ? '#37474f' : '#bbb'}
                strokeWidth={isHovered ? 2 : 1}
              />
              {/* NDVI texture stripes for stressed areas */}
              {(risk === 'High' || risk === 'Medium') && (
                <line x1={s.x + 10} y1={s.y + 8} x2={s.x + s.w - 10} y2={s.y + 8}
                  stroke="rgba(0,0,0,.12)" strokeWidth="2.5" strokeDasharray="4,4" />
              )}
              <text x={s.x + s.w / 2} y={s.y + s.h / 2 - 10} textAnchor="middle"
                fontSize="11" fontWeight="700" fill="#1a1c1a" fontFamily="inherit">{s.label}</text>
              <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 6} textAnchor="middle"
                fontSize="9.5" fill="#37474f" fontFamily="inherit">{risk} risk</text>
              {ndvi !== undefined && (
                <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 20} textAnchor="middle"
                  fontSize="9" fill="#555" fontFamily="inherit">NDVI {ndvi > 0 ? '+' : ''}{ndvi}%</text>
              )}
              {stress?.affectedAcres > 0 && (
                <text x={s.x + s.w / 2} y={s.y + s.h - 8} textAnchor="middle"
                  fontSize="8.5" fill="#555" fontFamily="inherit">{stress.affectedAcres.toLocaleString()} ac</text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        {[
          { color: riskColors.High, label: 'High' },
          { color: riskColors.Medium, label: 'Medium' },
          { color: riskColors.Low, label: 'Low' },
          { color: riskColors.Nil, label: 'Nil' },
        ].map((l, i) => (
          <g key={l.label}>
            <rect x={50 + i * 70} y={380} width={14} height={10} rx={2} fill={l.color} stroke="#bbb" strokeWidth=".5" />
            <text x={67 + i * 70} y={389} fontSize="9" fill="#555" fontFamily="inherit">{l.label}</text>
          </g>
        ))}
        <text x="225" y={397} textAnchor="middle" fontSize="8" fill="#9aa19c" fontFamily="inherit">
          Crop Loss Risk Heatmap · Kharif 2025–26 · NDVI composite
        </text>

        {/* Title */}
        <text x="225" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#37474f" fontFamily="inherit">
          SOLAPUR DISTRICT — CROP STRESS HEATMAP
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredTaluka && (() => {
        const s = stressById[hoveredTaluka.toLowerCase()];
        if (!s) return null;
        return (
          <div style={{
            position: 'absolute', bottom: 40, left: 12,
            background: 'rgba(255,255,255,.96)', border: '1px solid #dce5dc',
            borderRadius: 8, padding: '8px 12px', fontSize: 11.5, minWidth: 160,
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}>
            <div style={{ fontWeight: 700, color: '#1a1c1a', marginBottom: 4 }}>{hoveredTaluka}</div>
            <div style={{ color: '#717972' }}>Risk: <strong style={{ color: s.cropLossRisk === 'High' ? '#c62828' : s.cropLossRisk === 'Medium' ? '#b35c00' : '#2e7d32' }}>{s.cropLossRisk}</strong></div>
            <div style={{ color: '#717972' }}>NDVI: <strong>{s.ndviDrop > 0 ? '+' : ''}{s.ndviDrop}%</strong></div>
            <div style={{ color: '#717972' }}>Crop: {s.mainCrop}</div>
            {s.affectedAcres > 0 && <div style={{ color: '#717972' }}>Affected: {s.affectedAcres.toLocaleString()} acres</div>}
          </div>
        );
      })()}
    </div>
  );
}

/* ── Main ── */
export default function RainCropStressDesk() {
  const { t } = useLanguage();
  const w = WEATHER_SUMMARY;
  const c = CROP_STRESS_DATA;
  const [activeTab, setActiveTab] = useState('heatmap');

  const TABS = [
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'taluka_table', label: 'Taluka Table' },
    { id: 'rainfall', label: 'Rainfall Data' },
  ];

  return (
    <div className="cao-page">
      <div className="cao-page-header">
        <div>
          <h1 className="cao-page-title">Rain &amp; Crop Stress Desk</h1>
          <p className="cao-page-sub">Weather intelligence, NDVI crop stress monitoring &amp; agricultural risk assessment · {w.lastUpdated}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
        {/* ── Top stats ── */}
        <div className="cao-stress-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="cao-stress-card" style={{ borderTop: `3px solid ${w.deviationColor}` }}>
            <div className="cao-stress-card-val" style={{ color: w.deviationColor }}>{w.currentRainfallMM}<span style={{ fontSize: 14, fontWeight: 500 }}> mm</span></div>
            <div className="cao-stress-card-label">Rainfall (24h)</div>
            <div style={{ fontSize: 10.5, color: w.deviationColor, marginTop: 3, fontWeight: 600 }}>{w.deviationPct} vs normal</div>
          </div>
          <div className="cao-stress-card" style={{ borderTop: '3px solid #ef5350' }}>
            <div className="cao-stress-card-val" style={{ color: '#ef5350' }}>{c.stressVillages}</div>
            <div className="cao-stress-card-label">Stress Villages</div>
            <div style={{ fontSize: 10.5, color: '#717972', marginTop: 3 }}>{c.stressTalukas} talukas affected</div>
          </div>
          <div className="cao-stress-card" style={{ borderTop: '3px solid #e65100' }}>
            <div className="cao-stress-card-val" style={{ color: '#e65100' }}>{c.satelliteStressPct}<span style={{ fontSize: 14, fontWeight: 500 }}>%</span></div>
            <div className="cao-stress-card-label">Satellite NDVI Stress</div>
            <div style={{ fontSize: 10.5, color: '#717972', marginTop: 3 }}>Sentinel-2 composite</div>
          </div>
          <div className="cao-stress-card" style={{ borderTop: '3px solid #1565c0' }}>
            <div className="cao-stress-card-val" style={{ color: '#1565c0' }}>{w.humidity}<span style={{ fontSize: 14, fontWeight: 500 }}>%</span></div>
            <div className="cao-stress-card-label">Humidity</div>
            <div style={{ fontSize: 10.5, color: w.soilMoistureColor, marginTop: 3, fontWeight: 600 }}>Soil: {w.soilMoisture}</div>
          </div>
        </div>

        <div className="cao-cols">
          {/* LEFT: map / table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="cao-panel">
              <div className="cao-panel-head" style={{ paddingBottom: 0, borderBottom: 'none' }}>
                <h2 className="cao-panel-title">District Crop Stress Map</h2>
                <div style={{ display: 'flex', gap: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid #e0e3db' }}>
                  {TABS.map(tab => (
                    <button key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '5px 12px', fontSize: 11, fontWeight: 600,
                        background: activeTab === tab.id ? '#2e6b3e' : '#fff',
                        color: activeTab === tab.id ? '#fff' : '#717972',
                        border: 'none', cursor: 'pointer',
                        borderRight: '1px solid #e0e3db',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cao-panel-body">
                {activeTab === 'heatmap' && (
                  <CropStressHeatmap data={c} talukas={TALUKAS} />
                )}

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
                        {c.talukaStress.map(s => (
                          <tr key={s.taluka}>
                            <td className="name-cell">{s.taluka}</td>
                            <td className="muted">{s.mainCrop}</td>
                            <td style={{ fontWeight: 700, color: s.ndviDrop < -10 ? '#c62828' : s.ndviDrop < -5 ? '#b35c00' : s.ndviDrop >= 0 ? '#2e7d32' : '#717972' }}>
                              {s.ndviDrop > 0 ? '+' : ''}{s.ndviDrop}%
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
                    {w.talukaRainfall.map(tr => {
                      const max = Math.max(...w.talukaRainfall.map(r => r.mm)) * 1.2;
                      const pct = Math.round((tr.mm / max) * 100);
                      const normalPct = Math.round((tr.normal / max) * 100);
                      const barColor = tr.status === 'excess' ? '#1565c0' : tr.status === 'above' ? '#42a5f5' : tr.status === 'deficient' ? '#ef5350' : '#66bb6a';
                      return (
                        <div key={tr.taluka} style={{ marginBottom: 16, padding: '0 4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
                            <span style={{ fontWeight: 600, color: '#1a1c1a' }}>{tr.taluka}</span>
                            <span style={{ color: barColor, fontWeight: 700 }}>{tr.mm} mm
                              <span style={{ color: '#9aa19c', fontWeight: 500 }}> / {tr.normal} normal</span>
                            </span>
                          </div>
                          <div style={{ height: 10, background: '#eceee9', borderRadius: 99, position: 'relative', overflow: 'visible' }}>
                            <div style={{ height: '100%', background: barColor, borderRadius: 99, width: `${pct}%` }} />
                            <div style={{ position: 'absolute', top: -5, left: `${normalPct}%`, width: 2, height: 20, background: '#9aa19c', borderRadius: 1 }} />
                          </div>
                          <div style={{ fontSize: 10, color: '#9aa19c', marginTop: 3 }}>
                            {tr.status === 'excess' ? '⚠ Excess rainfall — waterlogging risk'
                              : tr.status === 'above' ? 'Above normal'
                              : tr.status === 'deficient' ? '⚠ Deficient — crop stress risk'
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

          {/* RIGHT: insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="cao-panel">
              <div className="cao-panel-head">
                <h2 className="cao-panel-title">Crop Intelligence Feed</h2>
                <span style={{ fontSize: 10.5, color: '#9aa19c' }}>Today</span>
              </div>
              <div>
                {c.insights.map(ins => {
                  const iconBg = ins.severity === 'high' ? { bg: '#fde8e8', color: '#c62828' }
                    : ins.severity === 'medium' ? { bg: '#fff3cd', color: '#b35c00' }
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

            {/* Weather widget */}
            <div className="cao-panel">
              <div className="cao-panel-head"><h2 className="cao-panel-title">Current Conditions</h2></div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'IMD Alert', value: w.imdAlert, color: w.imdAlertColor },
                  { label: 'Crop Stress', value: w.cropStressLevel, color: w.cropStressColor },
                  { label: 'Soil Moisture', value: w.soilMoisture, color: w.soilMoistureColor },
                  { label: 'Humidity', value: `${w.humidity}%`, color: '#1565c0' },
                  { label: 'Rainfall 24h', value: `${w.currentRainfallMM}mm (${w.deviationPct})`, color: w.deviationColor },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '6px 0', borderBottom: '1px solid #f0f2ee' }}>
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
