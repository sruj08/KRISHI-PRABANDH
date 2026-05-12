import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_HAVELI_MANDALS } from '../../../utils/taoMapMockData';

// Approximate boundary for Haveli Taluka (just a simple polygon for visual effect)
const HAVELI_BOUNDARY = [
  [18.60, 73.70],
  [18.65, 74.00],
  [18.50, 74.20],
  [18.35, 74.15],
  [18.35, 73.75],
  [18.45, 73.65]
];

const getStatusColor = (status) => {
  if (status === 'Clear') return '#2e7d32'; // Green
  if (status === 'Warning') return '#f57c00'; // Orange
  if (status === 'Critical') return '#d32f2f'; // Red
  return '#1976d2'; // Blue
};

const TAOMap = () => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Center of Haveli Taluka
  const center = [18.4900, 73.9000];

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', borderRadius: 0, background: 'transparent', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 28px', background: '#fff', borderBottom: '1px solid #e2e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', minHeight: '70px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 className="fw-bold m-0" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3 }}>Haveli Taluka Geo-Verification</h3>
          <p className="text-sm text-muted m-0" style={{ marginTop: '5px', fontSize: '11.5px', lineHeight: 1.4 }}>Live mapping of Mandals (Circles) and CAO regions</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, alignItems: 'center' }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2e7d32', display: 'inline-block', flexShrink: 0 }}></span> Clear
           </div>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f57c00', display: 'inline-block', flexShrink: 0 }}></span> Warning
           </div>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#d32f2f', display: 'inline-block', flexShrink: 0 }}></span> Critical
           </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '380px', width: '100%', position: 'relative' }}>
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Haveli Boundary */}
          <Polygon 
            positions={HAVELI_BOUNDARY} 
            pathOptions={{ color: '#0055A4', fillColor: '#0055A4', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} 
          />

          {/* Mandals */}
          {MOCK_HAVELI_MANDALS.map((pt) => {
            const color = getStatusColor(pt.status);
            return (
              <CircleMarker
                key={pt.id}
                center={[pt.lat, pt.lng]}
                radius={9}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: color,
                  weight: 1
                }}
                eventHandlers={{
                  click: () => setSelectedPoint(pt)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <strong style={{ color: color }}>{pt.name}</strong><br/>
                  CAO: {pt.caoName}<br/>
                  Pending Files: {pt.pending}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Info Panel Overlay */}
        {selectedPoint && (
          <div style={{
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000,
            background: 'var(--surface)', padding: '16px', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '250px',
            borderLeft: `4px solid ${getStatusColor(selectedPoint.status)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <h4 className="fw-bold m-0 text-sm">{selectedPoint.name}</h4>
               <button onClick={() => setSelectedPoint(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                 <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
               </button>
            </div>
            <div className="text-xs text-muted mt-1 mb-3">MANDAL REGION • {selectedPoint.id}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div><span className="text-muted">CAO:</span> <strong>{selectedPoint.caoName}</strong></div>
              <div><span className="text-muted">Status:</span> <strong>{selectedPoint.status}</strong></div>
              <div><span className="text-muted">Pending:</span> <strong>{selectedPoint.pending}</strong></div>
              <div><span className="text-muted">Fraud Alerts:</span> <strong style={{ color: selectedPoint.fraudAlerts > 0 ? '#d32f2f' : '#2e7d32' }}>{selectedPoint.fraudAlerts}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TAOMap;
