import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const MOCK_HAVELI_MANDALS = [];

const GEO_URL = '/geo/haveli-taluka-mandals.geojson';

const getStatusColor = (status) => {
  if (status === 'Clear') return '#2e7d32';
  if (status === 'Warning') return '#f57c00';
  if (status === 'Critical') return '#d32f2f';
  return '#1976d2';
};

const STATUS_FILL = {
  Clear: 'rgba(46, 125, 50, 0.10)',
  Warning: 'rgba(245, 124, 0, 0.14)',
  Critical: 'rgba(211, 47, 47, 0.18)',
};

/**
 * Fits the map to a Leaflet bounds object and locks the view so the
 * TAO can zoom IN to inspect mandals but cannot zoom OUT past the
 * taluka nor pan into neighbouring talukas.
 */
function FitTaluka({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds || !bounds.isValid()) return;
    map.setMinZoom(0);
    map.setMaxBounds(null);
    map.fitBounds(bounds, { padding: [20, 20], animate: false });
    const fitZoom = map.getZoom();
    map.setMinZoom(fitZoom);
    map.setMaxBounds(bounds.pad(0.05));
    map.options.maxBoundsViscosity = 1.0;
  }, [bounds, map]);
  return null;
}

/** Default + hover styling for mandal polygons. Matches DAO taluka pattern. */
const MANDAL_HOVER = {
  color: '#0d47a1',
  weight: 4,
  opacity: 1,
  fillOpacity: 0.28,
};

function MandalBoundariesLayer({ mandalGeo }) {
  const gjRef = useRef(null);

  const styleFn = useCallback((feature) => {
    const p = feature?.properties || {};
    return {
      color: '#1565c0',
      weight: 1.6,
      opacity: 0.45,
      fillColor: getStatusColor(p.status),
      fillOpacity: STATUS_FILL[p.status] ? 0.18 : 0.08,
    };
  }, []);

  const bindLayer = useCallback((feature, layer) => {
    const p = feature?.properties;
    if (!p || p.kind !== 'mandal') return;
    const color = getStatusColor(p.status);
    const html = `
      <div style="min-width:200px;line-height:1.5">
        <div style="font-weight:700;font-size:13px;color:${color};margin-bottom:2px">${p.name} Mandal</div>
        <div style="font-size:11px;color:#444;margin-bottom:6px">${p.marathi || ''}</div>
        <div style="font-size:11px;color:#222">CAO: <b>${p.caoName}</b></div>
        <div style="font-size:11px;color:#222">Status: <b style="color:${color}">${p.status}</b></div>
        <div style="font-size:11px;color:#222">Pending files: <b>${p.pending}</b></div>
        <div style="font-size:11px;color:#222">Fraud alerts: <b>${p.fraudAlerts}</b></div>
        ${p.description ? `<div style="font-size:10.5px;color:#555;margin-top:6px;font-style:italic">${p.description}</div>` : ''}
      </div>`;
    layer.bindTooltip(html, { sticky: true, direction: 'auto', opacity: 0.97, className: 'tao-mandal-tooltip' });
    layer.on({
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle({ ...MANDAL_HOVER, fillColor: getStatusColor(p.status) });
        lyr.bringToFront();
      },
      mouseout: (e) => {
        const ref = gjRef.current;
        if (ref && typeof ref.resetStyle === 'function') ref.resetStyle(e.target);
      },
    });
  }, []);

  if (!mandalGeo?.features?.length) return null;

  return (
    <GeoJSON
      ref={gjRef}
      data={mandalGeo}
      style={styleFn}
      onEachFeature={bindLayer}
    />
  );
}

const TAOMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => { if (!cancelled) setGeoData(j); })
      .catch((e) => { if (!cancelled) setLoadErr(e.message || 'Failed to load mandal geofence'); });
    return () => { cancelled = true; };
  }, []);

  const talukaGeo = useMemo(() => {
    if (!geoData?.features) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.filter((f) => f?.properties?.kind === 'taluka'),
    };
  }, [geoData]);

  const mandalGeo = useMemo(() => {
    if (!geoData?.features) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.filter((f) => f?.properties?.kind === 'mandal'),
    };
  }, [geoData]);

  /** Fence outline + bounds derived from the taluka feature. */
  const talukaBounds = useMemo(() => {
    if (!talukaGeo?.features?.length) return null;
    const gj = L.geoJSON(talukaGeo);
    const b = gj.getBounds();
    return b.isValid() ? b : null;
  }, [talukaGeo]);

  /** World-sized polygon with the taluka cut out as a hole. */
  const focusMaskGeo = useMemo(() => {
    if (!talukaGeo?.features?.length) return null;
    const holes = [];
    for (const f of talukaGeo.features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === 'Polygon') holes.push(g.coordinates[0]);
      else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) holes.push(poly[0]);
    }
    if (!holes.length) return null;
    return {
      type: 'Feature',
      properties: { kind: 'focus-mask' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
          ...holes,
        ],
      },
    };
  }, [talukaGeo]);

  const styleTalukaFence = useCallback((feature) => {
    if (feature?.properties?.kind === 'taluka') {
      return {
        color: '#003978',
        weight: 3,
        fillColor: '#0055A4',
        fillOpacity: 0.04,
        dashArray: '8 5',
        interactive: false,
      };
    }
    return { stroke: false, fillOpacity: 0, interactive: false };
  }, []);

  const center = [18.49, 73.92];

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
        {loadErr && (
          <div style={{ padding: '24px', color: 'var(--error)', fontSize: '13px' }}>{loadErr}</div>
        )}
        {!geoData && !loadErr && (
          <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading Haveli mandal geofence…</div>
        )}
        {geoData && talukaGeo && mandalGeo && (
          <MapContainer
            center={center}
            zoom={11}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap
            />

            {/* Focus spotlight: dim + soft-blur everything outside the taluka */}
            <Pane name="talukaFocusMask" className="geo-focus-mask-pane" style={{ zIndex: 350, pointerEvents: 'none' }}>
              {focusMaskGeo && (
                <GeoJSON
                  data={focusMaskGeo}
                  style={() => ({
                    stroke: false,
                    color: 'transparent',
                    weight: 0,
                    fillColor: '#0b1416',
                    fillOpacity: 0.55,
                    interactive: false,
                  })}
                />
              )}
            </Pane>

            <FitTaluka bounds={talukaBounds} />

            {/* Mandal boundaries with hover tooltips (mirrors DAO taluka layer) */}
            <MandalBoundariesLayer mandalGeo={mandalGeo} />

            {/* Outer dashed taluka fence */}
            <GeoJSON data={talukaGeo} style={styleTalukaFence} />

            {/* Mandal centroid markers — rendered into Leaflet's default
                markerPane (z 500, DOM order before the tooltipPane), so any
                tooltip or popup naturally paints above these dots. */}
            {MOCK_HAVELI_MANDALS.map((pt) => {
              const color = getStatusColor(pt.status);
              return (
                <CircleMarker
                  key={pt.id}
                  center={[pt.lat, pt.lng]}
                  radius={8}
                  pathOptions={{ fillColor: color, fillOpacity: 0.92, color: '#ffffff', weight: 2 }}
                  eventHandlers={{ click: () => setSelectedPoint(pt) }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={1} className="tao-mandal-tooltip">
                    <strong style={{ color }}>{pt.name}</strong><br/>
                    CAO: {pt.caoName}<br/>
                    Pending Files: {pt.pending}
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}

        {/* Info Panel Overlay — z-index 2000 so it sits above any leaflet
            pane (capped at 500 by the global rule). */}
        {selectedPoint && (
          <div style={{
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 2000,
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
