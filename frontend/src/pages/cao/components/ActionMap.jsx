import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geoAsset } from '../../../utils/geoAsset';

const VILLAGES = [];
const FERTILIZER_SHOPS = [];

const CIRCLE_GEO_URL = geoAsset('geo/baramati-ac.json');
const MALEGAON_GEO_URL = geoAsset('geo/malegaon.json');

const getPendencyColor = (pending) => {
  if (pending <= 10) return { fill: '#2D6A4F', label: 'Low', ring: '#40916c' };
  if (pending <= 30) return { fill: '#FF9933', label: 'Medium', ring: '#e07800' };
  return { fill: '#ba1a1a', label: 'High', ring: '#93000a' };
};

const getDaysSinceInspection = (dateStr) => {
  const d = new Date(dateStr);
  return Math.floor((new Date() - d) / 86400000);
};

function FitToGeoJSON({ data }) {
  const map = useMap();
  useEffect(() => {
    if (!data?.features?.length) return;
    const gj = L.geoJSON(data);
    const b = gj.getBounds();
    if (!b.isValid()) return;
    map.fitBounds(b, { padding: [18, 18], animate: false });
  }, [data, map]);
  return null;
}

const circleBoundaryStyle = () => ({
  color: '#0055A4',
  weight: 2,
  fillColor: '#0055A4',
  fillOpacity: 0.12,
  dashArray: '6 5',
});

/** Malegaon Outer + Central AC segments (Nashik) — distinct from Baramati on the same CAO map. */
const malegaonBoundaryStyle = () => ({
  color: '#B45309',
  weight: 2,
  fillColor: '#B45309',
  fillOpacity: 0.1,
  dashArray: '2 4',
});

const ActionMap = () => {
  const [selected, setSelected] = useState(null);
  const [showShops, setShowShops] = useState(false);
  const [geo, setGeo] = useState(null);
  const [malegaonGeo, setMalegaonGeo] = useState(null);
  const [loadErr, setLoadErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(CIRCLE_GEO_URL).then((r) => {
        if (!r.ok) throw new Error(`Baramati ${r.status}`);
        return r.json();
      }),
      fetch(MALEGAON_GEO_URL).then((r) => {
        if (!r.ok) throw new Error(`Malegaon ${r.status}`);
        return r.json();
      }),
    ])
      .then(([baramati, malegaon]) => {
        if (!cancelled) {
          setGeo(baramati);
          setMalegaonGeo(malegaon);
          setLoadErr(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadErr(e?.message || 'Failed to load circle boundaries');
          setGeo(null);
          setMalegaonGeo(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const combinedBoundsGeo = useMemo(() => {
    const features = [...(geo?.features || []), ...(malegaonGeo?.features || [])];
    if (!features.length) return null;
    return { type: 'FeatureCollection', features };
  }, [geo, malegaonGeo]);

  const defaultCenter = [19.5, 74.35];

  return (
    <div className="map-container action-map-root" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 420, gap: '12px', padding: '16px 20px 18px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px', borderLeft: '1px solid var(--outline-variant)' }}>
          <span style={{ width: 18, height: 3, background: '#0055A4', borderRadius: 2, display: 'inline-block' }} /> Baramati AC
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 18, height: 3, background: '#B45309', borderRadius: 2, display: 'inline-block' }} /> Malegaon circles
        </div>
        <label className="shop-toggle" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: '4px 10px', border: '1px solid var(--outline-variant)', borderRadius: '999px', background: '#fff' }}>
          <input type="checkbox" checked={showShops} onChange={(e) => setShowShops(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>storefront</span>
          Shops
        </label>
      </div>

      <div style={{ width: '100%', height: 400, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)' }}>
        {loadErr && (
          <div style={{ padding: 20, fontSize: 13, color: 'var(--error, #ba1a1a)' }}>{loadErr}</div>
        )}
        {!combinedBoundsGeo && !loadErr && (
          <div style={{ padding: 20, fontSize: 13, color: 'var(--text-muted)' }}>Loading circle boundaries…</div>
        )}
        {combinedBoundsGeo && (
          <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitToGeoJSON data={combinedBoundsGeo} />
            {geo?.features?.length > 0 && (
              <GeoJSON data={geo} style={circleBoundaryStyle} />
            )}
            {malegaonGeo?.features?.length > 0 && (
              <GeoJSON data={malegaonGeo} style={malegaonBoundaryStyle} />
            )}

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
                    weight: 1.5,
                  }}
                  eventHandlers={{
                    click: () => setSelected(v),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <strong>{v.name}</strong><br />
                    Pending: {v.pending}
                  </Tooltip>
                </CircleMarker>
              );
            })}

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
                    weight: 1.5,
                  }}
                  eventHandlers={{
                    click: () => setSelected(shop),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <strong>{shop.name}</strong> (Shop)<br />
                    Owner: {shop.owner}
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {selected && (
        <div className="card" style={{ padding: 'var(--sp-3)', marginTop: 'var(--sp-2)', backgroundColor: 'var(--surface-low)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {selected.survey_no !== undefined ? (
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
