import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Generic two-tier command map used by DAO / Division / State dashboards.
 *
 * Reads a GeoJSON FeatureCollection where each feature has properties.kind ∈
 *   { outerKind, innerKind }
 * — `outerKind` defines the geo-fence (e.g. district / division / state) and
 * `innerKind` defines the inner sub-regions that get heat-coloured + hover-tooltipped.
 *
 * Visual / interaction parity with DistrictCommandMap:
 *   • KDE-style canvas heatmap from per-feature intensity samples
 *   • Three metric modes (penetration / NDVI stress / grievance heat)
 *   • Mode-aware legend strip
 *   • Outer dashed geo-fence + focus mask spotlight outside the fence
 *   • Pan/zoom locked to the outer fence
 */

const HEAT_GRADIENT = {
  0.0: 'rgba(173, 216, 230, 0.15)',
  0.12: '#87ceeb',
  0.28: '#aed581',
  0.45: '#fff176',
  0.62: '#ffb74d',
  0.78: '#ff7043',
  0.92: '#e53935',
  1.0: '#7f0000',
};

const MAP_MODES = [
  { id: 'penetration', label: 'Scheme penetration', sub: 'MahaDBT subsidy uptake', icon: 'hub' },
  { id: 'ndvi', label: 'Crop health / NDVI', sub: 'Sentinel-2 stress index (demo)', icon: 'satellite_alt' },
  { id: 'grievance', label: 'Grievance heat', sub: 'Aaple Sarkar cluster intensity', icon: 'crisis_alert' },
];

const legendForMode = (mapMode) => {
  if (mapMode === 'penetration') return [
    { c: '#7f0000', t: 'High activity' },
    { c: '#ffb74d', t: 'Mid' },
    { c: '#87ceeb', t: 'Lower' },
  ];
  if (mapMode === 'ndvi') return [
    { c: '#7f0000', t: 'High stress' },
    { c: '#fff176', t: 'Moderate' },
    { c: '#87ceeb', t: 'Low stress' },
  ];
  return [
    { c: '#7f0000', t: 'High load' },
    { c: '#ffb74d', t: 'Elevated' },
    { c: '#87ceeb', t: 'Typical' },
  ];
};

function getPolygonOuterRing(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Polygon') return geometry.coordinates[0];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates[0][0];
  return null;
}

function ringCentroid(ring) {
  if (!ring?.length) return null;
  let coords = ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1] && ring.length > 1) coords = ring.slice(0, -1);
  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of coords) { sumLng += lng; sumLat += lat; }
  const n = coords.length;
  return { lat: sumLat / n, lng: sumLng / n };
}

function ringBBoxMeters(ring) {
  if (!ring?.length) return null;
  let coords = ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1] && ring.length > 1) coords = ring.slice(0, -1);
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const midLat = (minLat + maxLat) / 2;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((midLat * Math.PI) / 180);
  return { minLng, maxLng, minLat, maxLat, wM: (maxLng - minLng) * mPerDegLng, hM: (maxLat - minLat) * mPerDegLat, midLat };
}

function gaussianGridHeatPoints(ring, intensity01, gridN = 26) {
  const box = ringBBoxMeters(ring);
  const c = ringCentroid(ring);
  if (!box || !c) return [];
  const { minLng, maxLng, minLat, maxLat, wM, hM, midLat } = box;
  const mLng = 111320 * Math.cos((midLat * Math.PI) / 180);
  const mLat = 111320;
  const sigma = Math.max(wM, hM) * 0.36;
  const pts = [];
  const peak = Math.min(1, Math.max(0, intensity01));
  for (let i = 0; i < gridN; i += 1) {
    for (let j = 0; j < gridN; j += 1) {
      const u = (i + 0.5) / gridN;
      const v = (j + 0.5) / gridN;
      const lng = minLng + u * (maxLng - minLng);
      const lat = minLat + v * (maxLat - minLat);
      const dx = (lng - c.lng) * mLng;
      const dy = (lat - c.lat) * mLat;
      const g = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      const w = g * (0.08 + 0.92 * peak);
      if (w > 0.018) pts.push([lat, lng, w]);
    }
  }
  return pts;
}

function heatMetric01(mapMode, props) {
  const v = mapMode === 'penetration' ? props.schemePenetration : mapMode === 'ndvi' ? props.ndviStress : props.grievanceIdx;
  return Math.min(1, Math.max(0, (v ?? 0) / 100));
}

/** Fits + locks pan/zoom to outer fence bounds. */
function FitRegion({ bounds }) {
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

function KdeHeatLayer({ points, mapMode }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !points?.length) return undefined;
    let cancelled = false;
    const teardown = () => {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    };
    (async () => {
      if (typeof window !== 'undefined') window.L = L;
      await import('leaflet.heat/dist/leaflet-heat.js');
      if (cancelled || !map || typeof L.heatLayer !== 'function') return;
      teardown();
      const layer = L.heatLayer(points, { radius: 40, blur: 30, minOpacity: 0.22, max: 0.55, maxZoom: 20, gradient: HEAT_GRADIENT });
      layer.addTo(map);
      layer.bringToBack();
      layerRef.current = layer;
    })();
    return () => { cancelled = true; teardown(); };
  }, [map, points, mapMode]);

  return null;
}

const INNER_DEFAULT = {
  color: '#1565c0', weight: 1.5, opacity: 0.32,
  fillColor: '#1976d2', fillOpacity: 0.05,
};
const INNER_HOVER = {
  color: '#0d47a1', weight: 4, opacity: 1,
  fillColor: '#0d47a1', fillOpacity: 0.16,
};

function InnerBoundariesLayer({ innerGeo, innerLabel }) {
  const gjRef = useRef(null);
  const bindLayer = useCallback((feature, layer) => {
    const p = feature?.properties;
    if (!p) return;
    const html = `
      <div style="min-width:200px;line-height:1.5">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px">${p.name} ${innerLabel}</div>
        ${p.officer ? `<div style="font-size:11px;color:#222">Officer: <b>${p.officer}</b></div>` : ''}
        ${p.tag ? `<div style="font-size:10.5px;color:#555;margin-bottom:4px;font-style:italic">${p.tag}</div>` : ''}
        ${p.schemePenetration != null ? `<div style="font-size:11px;color:#222">Scheme penetration: <b>${p.schemePenetration}%</b></div>` : ''}
        ${p.ndviStress != null ? `<div style="font-size:11px;color:#222">NDVI stress index: <b>${p.ndviStress}</b></div>` : ''}
        ${p.grievanceIdx != null ? `<div style="font-size:11px;color:#222">Grievance index: <b>${p.grievanceIdx}</b></div>` : ''}
        ${p.fundsCr != null ? `<div style="font-size:11px;color:#222">Allocation: <b>₹${p.fundsCr} Cr</b></div>` : ''}
        ${p.disbursedPct != null ? `<div style="font-size:11px;color:#222">Disbursed: <b>${p.disbursedPct}%</b></div>` : ''}
        ${p.fraudAlerts != null ? `<div style="font-size:11px;color:#222">Fraud alerts: <b>${p.fraudAlerts}</b></div>` : ''}
      </div>`;
    layer.bindTooltip(html, { sticky: true, direction: 'auto', opacity: 0.96, className: 'district-taluka-tooltip' });
    layer.on({
      mouseover: (e) => { e.target.setStyle(INNER_HOVER); e.target.bringToFront(); },
      mouseout: (e) => { const ref = gjRef.current; if (ref?.resetStyle) ref.resetStyle(e.target); },
    });
  }, [innerLabel]);

  if (!innerGeo?.features?.length) return null;
  return <GeoJSON ref={gjRef} data={innerGeo} style={() => INNER_DEFAULT} onEachFeature={bindLayer} />;
}

/**
 * @param {string}  geoUrl       — Public path to the FeatureCollection geojson.
 * @param {string}  outerKind    — properties.kind for the outer fence feature(s).
 * @param {string}  innerKind    — properties.kind for the inner sub-region features.
 * @param {string}  innerLabel   — Human label appended to the tooltip name (e.g. "District").
 * @param {number}  defaultZoom  — Initial leaflet zoom before the bounds fit kicks in.
 * @param {[number,number]} centerOverride — Initial leaflet center [lat, lng].
 */
const RegionCommandMap = ({ geoUrl, outerKind, innerKind, innerLabel, defaultZoom = 8, centerOverride = [18.5, 75.0] }) => {
  const [geoData, setGeoData] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [mapMode, setMapMode] = useState('penetration');

  useEffect(() => {
    let cancelled = false;
    fetch(geoUrl)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => { if (!cancelled) setGeoData(j); })
      .catch((e) => { if (!cancelled) setLoadErr(e.message || 'Failed to load geofence'); });
    return () => { cancelled = true; };
  }, [geoUrl]);

  const outerGeo = useMemo(() => {
    if (!geoData?.features) return null;
    return { type: 'FeatureCollection', features: geoData.features.filter((f) => f?.properties?.kind === outerKind) };
  }, [geoData, outerKind]);

  const innerGeo = useMemo(() => {
    if (!geoData?.features) return null;
    return { type: 'FeatureCollection', features: geoData.features.filter((f) => f?.properties?.kind === innerKind) };
  }, [geoData, innerKind]);

  const outerBounds = useMemo(() => {
    if (!outerGeo?.features?.length) return null;
    const b = L.geoJSON(outerGeo).getBounds();
    return b.isValid() ? b : null;
  }, [outerGeo]);

  const focusMaskGeo = useMemo(() => {
    if (!outerGeo?.features?.length) return null;
    const holes = [];
    for (const f of outerGeo.features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === 'Polygon') holes.push(g.coordinates[0]);
      else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) holes.push(poly[0]);
    }
    if (!holes.length) return null;
    return {
      type: 'Feature',
      properties: { kind: 'focus-mask' },
      geometry: { type: 'Polygon', coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ...holes] },
    };
  }, [outerGeo]);

  const heatPoints = useMemo(() => {
    if (!innerGeo?.features) return [];
    const all = [];
    for (const f of innerGeo.features) {
      const ring = getPolygonOuterRing(f.geometry);
      const int01 = heatMetric01(mapMode, f.properties || {});
      all.push(...gaussianGridHeatPoints(ring, int01, 26));
    }
    return all;
  }, [innerGeo, mapMode]);

  const centroidPins = useMemo(() => {
    if (!innerGeo?.features) return [];
    const pins = [];
    for (const f of innerGeo.features) {
      const ring = getPolygonOuterRing(f.geometry);
      const c = ringCentroid(ring);
      if (c) pins.push({ id: f.properties?.code || f.properties?.name, lat: c.lat, lng: c.lng, props: f.properties || {} });
    }
    return pins;
  }, [innerGeo]);

  const styleOuterFence = useCallback((feature) => {
    if (feature?.properties?.kind === outerKind) {
      return { color: '#003978', weight: 3.5, fillColor: '#0055A4', fillOpacity: 0.04, dashArray: '10 6', interactive: false };
    }
    return { stroke: false, fillOpacity: 0, interactive: false };
  }, [outerKind]);

  const legend = useMemo(() => legendForMode(mapMode), [mapMode]);

  return (
    <div className="map-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', padding: '16px 20px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        {MAP_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMapMode(m.id)}
            className="district-map-mode-btn"
            data-active={mapMode === m.id}
            title={m.sub}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
        <span className="cao-panel-badge green" style={{ marginLeft: 'auto' }}>KDE heatmap</span>
      </div>

      <div className="district-heat-legend-strip" aria-hidden style={{ marginTop: 2 }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '8px', flexShrink: 0, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Intensity</span>
        <div className="district-heat-legend-gradient" />
      </div>

      <div className="map-legend" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
        {legend.map((row) => (
          <span key={row.t} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: row.c, border: '1px solid rgba(0,0,0,0.12)' }} />
            {row.t}
          </span>
        ))}
      </div>

      <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)', minHeight: '480px', position: 'relative', marginTop: 4 }}>
        {loadErr && (<div style={{ padding: '24px', color: 'var(--error)', fontSize: '13px' }}>{loadErr}</div>)}
        {!geoData && !loadErr && (<div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading geofence…</div>)}
        {geoData && outerGeo && innerGeo && (
          <MapContainer
            center={centerOverride}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap
            />
            <KdeHeatLayer points={heatPoints} mapMode={mapMode} />
            <Pane name="regionFocusMask" className="geo-focus-mask-pane" style={{ zIndex: 350, pointerEvents: 'none' }}>
              {focusMaskGeo && (
                <GeoJSON
                  data={focusMaskGeo}
                  style={() => ({ stroke: false, color: 'transparent', weight: 0, fillColor: '#0b1416', fillOpacity: 0.55, interactive: false })}
                />
              )}
            </Pane>
            <FitRegion bounds={outerBounds} />
            <InnerBoundariesLayer innerGeo={innerGeo} innerLabel={innerLabel} />
            {centroidPins.map((pin) => (
              <CircleMarker
                key={pin.id}
                center={[pin.lat, pin.lng]}
                radius={6}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#e91e63', fillOpacity: 0.95 }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>{pin.props.name}</div>
                </Tooltip>
              </CircleMarker>
            ))}
            <GeoJSON data={outerGeo} style={styleOuterFence} />
          </MapContainer>
        )}
      </div>

      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
        Canvas KDE heat (leaflet.heat) from {innerLabel.toLowerCase()}-weighted samples; hover the boundaries for emphasis and tooltips. Outer dashed line is the geofence (simplified demo boundary).
      </p>
    </div>
  );
};

export default RegionCommandMap;
