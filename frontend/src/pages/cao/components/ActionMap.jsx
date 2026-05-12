import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { VILLAGES, FERTILIZER_SHOPS } from '../../../utils/caoMockData';

const getPendencyColor = (pending) => {
  if (pending <= 10) return { fill: '#2D6A4F', label: 'Low', ring: '#40916c' };
  if (pending <= 30) return { fill: '#FF9933', label: 'Medium', ring: '#e07800' };
  return { fill: '#ba1a1a', label: 'High', ring: '#93000a' };
};

const getDaysSinceInspection = (dateStr) => {
  const d = new Date(dateStr);
  return Math.floor((new Date() - d) / 86400000);
};

const ActionMap = () => {
  const [selected, setSelected] = useState(null);
  const [showShops, setShowShops] = useState(false);

  // Center of Wagholi Mandal
  const center = [18.57, 73.95];

  // Geofence polygon for Wagholi Mandal
  const MANDAL_BOUNDARY = [
    [18.60, 73.87],
    [18.60, 74.00],
    [18.55, 74.05],
    [18.51, 74.05],
    [18.54, 73.90],
    [18.58, 73.87]
  ];

  return (
    <div className="map-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', padding: '16px 20px 18px' }}>
      {/* Legend */}
      <div className="map-legend" style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '11.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ background: '#2D6A4F', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} /> 0–10 (Low)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ background: '#FF9933', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} /> 11–30 (Med)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ background: '#ba1a1a', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} /> 31+ (High)
        </div>
        <label className="shop-toggle" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: '4px 10px', border: '1px solid var(--outline-variant)', borderRadius: '999px', background: '#fff' }}>
          <input type="checkbox" checked={showShops} onChange={e => setShowShops(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>storefront</span>
          Shops
        </label>
      </div>

      {/* Leaflet Map */}
      <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)', minHeight: '300px' }}>
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Mandal Geofence Boundary */}
          <Polygon 
            positions={MANDAL_BOUNDARY} 
            pathOptions={{ color: '#0055A4', fillColor: '#0055A4', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} 
          />

          {/* Village Circles */}
          {VILLAGES.map((v) => {
            const { fill } = getPendencyColor(v.pending);
            const isSelected = selected?.id === v.id;
            
            return (
              <CircleMarker
                key={v.id}
                center={[v.lat, v.lng]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  fillColor: fill,
                  fillOpacity: 0.8,
                  color: 'white',
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () => setSelected(v),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <strong>{v.name}</strong><br/>
                  Pending: {v.pending}
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Fertilizer Shops */}
          {showShops && FERTILIZER_SHOPS.map((shop) => {
            const days = getDaysSinceInspection(shop.last_inspected);
            const overdue = days > 90;
            const color = overdue ? '#FF9933' : '#0055A4';

            return (
              <CircleMarker
                key={shop.id}
                center={[shop.lat, shop.lng]}
                radius={6}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 1,
                  color: 'white',
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () => setSelected(shop),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <strong>{shop.name}</strong> (🏪 Shop)<br/>
                  Owner: {shop.owner}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="card" style={{ padding: 'var(--sp-3)', marginTop: 'var(--sp-2)', backgroundColor: 'var(--surface-low)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {selected.survey_no !== undefined ? (
            // It's a shop
            <>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-dark)' }}>{selected.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Owner:</span><strong>{selected.owner}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Village:</span><strong>{selected.village}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Last Inspected:</span>
                  <strong style={{ color: getDaysSinceInspection(selected.last_inspected) > 90 ? 'var(--error)' : 'var(--success)' }}>
                    {getDaysSinceInspection(selected.last_inspected)} days ago
                  </strong>
                </div>
              </div>
            </>
          ) : (
            // It's a village
            <>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-dark)' }}>{selected.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>Sahayak:</span><strong>{selected.sahayak}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pending:</span>
                  <strong style={{ color: getPendencyColor(selected.pending).fill }}>{selected.pending} files</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Overdue:</span>
                  <strong style={{ color: selected.overdue > 0 ? 'var(--error)' : 'var(--success)' }}>{selected.overdue}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMap;
