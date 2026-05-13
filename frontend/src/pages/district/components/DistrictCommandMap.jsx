import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geoAsset } from '../../../utils/geoAsset';

const TALUKAS_GEO_URL = geoAsset('geo/pune-district-talukas.geojson');
const DISTRICT_GEO_URL = geoAsset('geo/pune-boundary.json');

/** Reference-style ramp: cool blue → green → yellow → orange → deep red */
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
  if (first[0] === last[0] && first[1] === last[1] && ring.length > 1) {
    coords = ring.slice(0, -1);
  }
  let sumLng = 0;
  let sumLat = 0;
  for (const [lng, lat] of coords) {
    sumLng += lng;
    sumLat += lat;
  }
  const n = coords.length;
  return { lat: sumLat / n, lng: sumLng / n };
}

function ringBBoxMeters(ring) {
  if (!ring?.length) return null;
  let coords = ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1] && ring.length > 1) {
    coords = ring.slice(0, -1);
  }
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const midLat = (minLat + maxLat) / 2;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((midLat * Math.PI) / 180);
  const wM = (maxLng - minLng) * mPerDegLng;
  const hM = (maxLat - minLat) * mPerDegLat;
  return { minLng, maxLng, minLat, maxLat, wM, hM, midLat };
}

function pointInPolygon(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Dense Gaussian-weighted samples → smooth KDE-style field when fed to L.heatLayer */
function gaussianGridHeatPoints(ring, intensity01, gridN = 26) {
  const box = ringBBoxMeters(ring);
  const c = ringCentroid(ring);
  if (!box || !c) return [];
  const { minLng, maxLng, minLat, maxLat, wM, hM, midLat } = box;
  const mLng = 111320 * Math.cos((midLat * Math.PI) / 180);
  const mLat = 111320;
  const sigma = Math.max(wM, hM) * 0.36;
  const pts = [];
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const peak = clamp01(intensity01);
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
      
      // Strict Clipping: Only add points that are inside the actual polygon ring
      if (w > 0.018 && pointInPolygon(lat, lng, ring)) {
        pts.push([lat, lng, w]);
      }
    }
  }
  return pts;
}

function heatMetric01(mapMode, props) {
  const v = mapMode === 'penetration'
    ? props.penetration
    : mapMode === 'ndvi'
      ? props.ndviStress
      : props.grievanceIdx;
  return Math.min(1, Math.max(0, v / 100));
}

/**
 * Fits the map to the DAO's district extent and locks the view so the
 * officer can zoom IN to inspect talukas but cannot zoom OUT past the
 * district nor pan into neighbouring regions. Taluka rendering inside
 * the fence is untouched.
 */
function FitDistrict({ geoData }) {
  const map = useMap();
  useEffect(() => {
    if (!geoData?.features?.length) return;
    const gj = L.geoJSON(geoData);
    const b = gj.getBounds();
    if (!b.isValid()) return;

    map.setMinZoom(0);
    map.setMaxBounds(null);

    map.fitBounds(b, { padding: [20, 20], animate: false });

    const fitZoom = map.getZoom();
    map.setMinZoom(fitZoom);
    map.setMaxBounds(b.pad(0.05));
    map.options.maxBoundsViscosity = 1.0;
  }, [geoData, map]);
  return null;
}

/** Canvas heatmap (leaflet.heat); kept under vector taluka / district outlines */
function DistrictKdeHeatLayer({ points, mapMode }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !points?.length) return undefined;

    let cancelled = false;

    const teardown = () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };

    (async () => {
      if (typeof window !== 'undefined') {
        window.L = L;
      }
      await import('leaflet.heat/dist/leaflet-heat.js');
      if (cancelled || !map || typeof L.heatLayer !== 'function') return;

      teardown();
      const layer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        minOpacity: 0.1,
        max: 0.4,
        maxZoom: 20,
        gradient: HEAT_GRADIENT,
      });
      layer.addTo(map);
      layer.bringToBack();
      layerRef.current = layer;
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [map, points, mapMode]);

  return null;
}

const TALUKA_DEFAULT = {
  color: '#1565c0',
  weight: 1.5,
  opacity: 0.32,
  fillColor: '#1976d2',
  fillOpacity: 0.05,
};

const TALUKA_HOVER = {
  color: '#0d47a1',
  weight: 4,
  opacity: 1,
  fillColor: '#0d47a1',
  fillOpacity: 0.16,
};

function TalukaBoundariesLayer({ talukaGeo }) {
  const gjRef = useRef(null);

  const bindLayer = useCallback((feature, layer) => {
    const p = feature?.properties;
    if (!p || p.kind !== 'taluka') return;
    const html = `
      <div style="min-width:172px;line-height:1.45">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px">${p.name} Taluka</div>
        <div style="font-size:11px;color:#222">Scheme penetration: <b>${p.penetration}%</b></div>
        <div style="font-size:11px;color:#222">NDVI stress index: <b>${p.ndviStress}</b></div>
        <div style="font-size:11px;color:#222">Grievance index: <b>${p.grievanceIdx}</b></div>
      </div>`;
    layer.bindTooltip(html, { sticky: true, direction: 'auto', opacity: 0.96, className: 'district-taluka-tooltip' });
    layer.on({
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle(TALUKA_HOVER);
        lyr.bringToFront();
      },
      mouseout: (e) => {
        const ref = gjRef.current;
        if (ref && typeof ref.resetStyle === 'function') {
          ref.resetStyle(e.target);
        }
      },
    });
  }, []);

  if (!talukaGeo?.features?.length) return null;

  return (
    <GeoJSON
      ref={gjRef}
      data={talukaGeo}
      style={() => TALUKA_DEFAULT}
      onEachFeature={bindLayer}
    />
  );
}

const MAP_MODES = [
  { id: 'penetration', label: 'Scheme penetration', sub: 'MahaDBT subsidy uptake by taluka', icon: 'hub' },
  { id: 'ndvi', label: 'Crop health / NDVI', sub: 'Sentinel-2 stress index (demo)', icon: 'satellite_alt' },
  { id: 'grievance', label: 'Grievance heat', sub: 'Aaple Sarkar cluster intensity', icon: 'crisis_alert' },
];

const legendForMode = (mapMode) => {
  if (mapMode === 'penetration') {
    return [
      { c: '#7f0000', t: 'High activity' },
      { c: '#ffb74d', t: 'Mid' },
      { c: '#87ceeb', t: 'Lower' },
    ];
  }
  if (mapMode === 'ndvi') {
    return [
      { c: '#7f0000', t: 'High stress' },
      { c: '#fff176', t: 'Moderate' },
      { c: '#87ceeb', t: 'Low stress' },
    ];
  }
  return [
    { c: '#7f0000', t: 'High load' },
    { c: '#ffb74d', t: 'Elevated' },
    { c: '#87ceeb', t: 'Typical' },
  ];
};

const DistrictCommandMap = () => {
  const [talukaData, setTalukaData] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [mapMode, setMapMode] = useState('penetration');
  const [showHeat, setShowHeat] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      try {
        const [talukasRes, districtRes] = await Promise.all([
          fetch(TALUKAS_GEO_URL),
          fetch(DISTRICT_GEO_URL)
        ]);

        if (!talukasRes.ok || !districtRes.ok) {
          throw new Error(`HTTP Error: Talukas ${talukasRes.status}, District ${districtRes.status}`);
        }

        const talukasJson = await talukasRes.json();
        const districtJson = await districtRes.json();

        if (!cancelled) {
          setTalukaData(talukasJson);
          setDistrictBoundary(districtJson);
        }
      } catch (e) {
        if (!cancelled) setLoadErr(e.message || 'Failed to load geodata');
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  const talukaGeo = useMemo(() => {
    if (!talukaData?.features) return null;
    return {
      type: 'FeatureCollection',
      features: talukaData.features.filter((f) => f?.properties?.kind === 'taluka'),
    };
  }, [talukaData]);

  /**
   * Builds a "strict regional isolation" mask: one giant world-sized polygon 
   * with the district boundary punched out as a hole. 
   * Blends with background (#F4F5F7) to hide neighboring districts.
   */
  const focusMaskGeo = useMemo(() => {
    if (!districtBoundary?.features?.length) return null;
    const holes = [];
    
    // Inverted Polygon Mask: extract district rings as holes
    for (const f of districtBoundary.features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === 'Polygon') {
        holes.push(g.coordinates[0]);
      } else if (g.type === 'MultiPolygon') {
        for (const poly of g.coordinates) {
          holes.push(poly[0]);
        }
      }
    }
    
    if (!holes.length) return null;

    // Global "outer ring" (world coordinates)
    const worldOuterRing = [
      [-180, -90],
      [180, -90],
      [180, 90],
      [-180, 90],
      [-180, -90],
    ];

    return {
      type: 'Feature',
      properties: { kind: 'inverted-mask' },
      geometry: {
        type: 'Polygon',
        coordinates: [worldOuterRing, ...holes],
      },
    };
  }, [districtBoundary]);

  const heatPoints = useMemo(() => {
    if (!talukaGeo?.features) return [];
    const all = [];
    for (const f of talukaGeo.features) {
      const ring = getPolygonOuterRing(f.geometry);
      const int01 = heatMetric01(mapMode, f.properties);
      all.push(...gaussianGridHeatPoints(ring, int01, 26));
    }
    return all;
  }, [talukaGeo, mapMode]);

  const centroidPins = useMemo(() => {
    if (!talukaGeo?.features) return [];
    const pins = [];
    for (const f of talukaGeo.features) {
      const ring = getPolygonOuterRing(f.geometry);
      const c = ringCentroid(ring);
      if (c) {
        pins.push({ 
          id: f.properties.name, 
          lat: c.lat, 
          lng: c.lng, 
          props: f.properties,
          metric: heatMetric01(mapMode, f.properties)
        });
      }
    }
    // Only keep top 3 priority regions for the current mode
    return pins.sort((a, b) => b.metric - a.metric).slice(0, 3);
  }, [talukaGeo, mapMode]);

  /** District outline file (`pune-boundary.json`) has no `kind`; talukas file uses `kind: 'district'` for outer ring. */
  const styleDistrictFence = useCallback(() => ({
    color: '#003978',
    weight: 3.5,
    fillColor: '#0055A4',
    fillOpacity: 0.04,
    dashArray: '10 6',
    interactive: false,
  }), []);

  const legend = useMemo(() => legendForMode(mapMode), [mapMode]);
  const center = useMemo(() => [18.52, 73.86], []);

  return (
    <div className="map-container district-command-map-root" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 520, gap: '12px', padding: '16px 20px 20px' }}>
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
        <button
          type="button"
          onClick={() => setShowHeat(!showHeat)}
          className="district-map-mode-btn"
          style={{ 
            marginLeft: 'auto', 
            background: showHeat ? '#e8f5e9' : '#fff',
            borderColor: showHeat ? '#2e7d32' : 'var(--outline-variant)',
            color: showHeat ? '#2e7d32' : 'var(--text-muted)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {showHeat ? 'layers' : 'layers_clear'}
          </span>
          <span>Heatmap</span>
        </button>
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

      <div style={{ width: '100%', height: 480, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)', position: 'relative', marginTop: 4 }}>
        {loadErr && (
          <div style={{ padding: '24px', color: 'var(--error)', fontSize: '13px' }}>{loadErr}</div>
        )}
        {!talukaData && !loadErr && (
          <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading Pune district command center…</div>
        )}
        {talukaData && districtBoundary && talukaGeo && (
          <MapContainer
            center={center}
            zoom={9}
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
            {showHeat && <DistrictKdeHeatLayer points={heatPoints} mapMode={mapMode} />}
            <Pane name="districtFocusMask" className="geo-focus-mask-pane" style={{ zIndex: 350, pointerEvents: 'none' }}>
              {focusMaskGeo && (
                <GeoJSON
                  data={focusMaskGeo}
                   style={() => ({
                    stroke: false,
                    fillColor: '#ffffff',
                    fillOpacity: 0.65,
                    className: 'geo-blur-mask',
                    interactive: false,
                  })}
                />
              )}
            </Pane>
            <TalukaBoundariesLayer talukaGeo={talukaGeo} />
            <Pane name="districtCentroidPins" style={{ zIndex: 650 }}>
              {centroidPins.map((pin) => (
                <CircleMarker
                  key={pin.id}
                  center={[pin.lat, pin.lng]}
                  radius={5}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 1.5,
                    fillColor: '#e91e63',
                    fillOpacity: 0.95,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                    <div style={{ fontWeight: 700, fontSize: '12px' }}>{pin.props.name}</div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </Pane>
            <FitDistrict geoData={districtBoundary} />
            <GeoJSON data={districtBoundary} style={styleDistrictFence} />
          </MapContainer>
        )}
      </div>

      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
        Canvas KDE heat (leaflet.heat) from taluka-weighted samples; hover taluka borders for emphasis and tooltips. District dashed line is the geofence (simplified demo boundary).
      </p>
    </div>
  );
};

export default DistrictCommandMap;
