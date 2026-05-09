import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const GEO_URL = '/geo/pune-district-talukas.geojson';

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
      if (w > 0.018) pts.push([lat, lng, w]);
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

function FitDistrict({ geoData }) {
  const map = useMap();
  useEffect(() => {
    if (!geoData?.features?.length) return;
    const gj = L.geoJSON(geoData);
    const b = gj.getBounds();
    if (b.isValid()) map.fitBounds(b, { padding: [40, 40], maxZoom: 10 });
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
        radius: 40,
        blur: 30,
        minOpacity: 0.22,
        max: 0.55,
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
  const [geoData, setGeoData] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [mapMode, setMapMode] = useState('penetration');

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setGeoData(j);
      })
      .catch((e) => {
        if (!cancelled) setLoadErr(e.message || 'Failed to load geofence');
      });
    return () => { cancelled = true; };
  }, []);

  const districtGeo = useMemo(() => {
    if (!geoData?.features) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.filter((f) => f?.properties?.kind === 'district'),
    };
  }, [geoData]);

  const talukaGeo = useMemo(() => {
    if (!geoData?.features) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.filter((f) => f?.properties?.kind === 'taluka'),
    };
  }, [geoData]);

  const heatPoints = useMemo(() => {
    if (!geoData?.features) return [];
    const all = [];
    for (const f of geoData.features) {
      if (f?.properties?.kind !== 'taluka') continue;
      const ring = getPolygonOuterRing(f.geometry);
      const int01 = heatMetric01(mapMode, f.properties);
      all.push(...gaussianGridHeatPoints(ring, int01, 26));
    }
    return all;
  }, [geoData, mapMode]);

  const centroidPins = useMemo(() => {
    if (!geoData?.features) return [];
    const pins = [];
    for (const f of geoData.features) {
      if (f?.properties?.kind !== 'taluka') continue;
      const ring = getPolygonOuterRing(f.geometry);
      const c = ringCentroid(ring);
      if (c) pins.push({ id: f.properties.name, lat: c.lat, lng: c.lng, props: f.properties });
    }
    return pins;
  }, [geoData]);

  const styleDistrictFence = useCallback((feature) => {
    if (feature?.properties?.kind === 'district') {
      return {
        color: '#003978',
        weight: 3.5,
        fillColor: '#0055A4',
        fillOpacity: 0.04,
        dashArray: '10 6',
        interactive: false,
      };
    }
    return { stroke: false, fillOpacity: 0, interactive: false };
  }, []);

  const legend = useMemo(() => legendForMode(mapMode), [mapMode]);
  const center = useMemo(() => [18.52, 73.86], []);

  return (
    <div className="map-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--sp-3)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-2)' }}>
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

      <div className="district-heat-legend-strip" aria-hidden>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '8px', flexShrink: 0 }}>Intensity</span>
        <div className="district-heat-legend-gradient" />
      </div>

      <div className="map-legend" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-3)', fontSize: '11px', color: 'var(--text-muted)' }}>
        {legend.map((row) => (
          <span key={row.t} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: row.c, border: '1px solid rgba(0,0,0,0.12)' }} />
            {row.t}
          </span>
        ))}
      </div>

      <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)', minHeight: '480px', position: 'relative' }}>
        {loadErr && (
          <div style={{ padding: '24px', color: 'var(--error)', fontSize: '13px' }}>{loadErr}</div>
        )}
        {!geoData && !loadErr && (
          <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading Pune district geofence…</div>
        )}
        {geoData && districtGeo && talukaGeo && (
          <MapContainer
            center={center}
            zoom={9}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DistrictKdeHeatLayer points={heatPoints} mapMode={mapMode} />
            <TalukaBoundariesLayer talukaGeo={talukaGeo} />
            <Pane name="districtCentroidPins" style={{ zIndex: 650 }}>
              {centroidPins.map((pin) => (
                <CircleMarker
                  key={pin.id}
                  center={[pin.lat, pin.lng]}
                  radius={6}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
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
            <FitDistrict geoData={geoData} />
            <GeoJSON data={districtGeo} style={styleDistrictFence} />
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
