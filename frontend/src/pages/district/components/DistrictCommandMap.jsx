import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geoAsset } from '../../../utils/geoAsset';
import { buildDistrictVoronoiHeatmap, districtHeatMetric01 } from '../../../utils/districtVoronoiHeatmap';

const TALUKAS_GEO_URL = geoAsset('geo/pune-district-talukas.geojson');
const DISTRICT_GEO_URL = geoAsset('geo/pune-boundary.json');

/**
 * Metric ramp for Voronoi cell fills: cool blue → green → yellow → orange → deep red
 * (same legend strip as the command map). Cells are clipped per taluka - no bleed.
 */
const TALUKA_HEAT_RGB_STOPS = [
  [0.0, [199, 228, 245]],
  [0.12, [135, 206, 235]],
  [0.28, [174, 213, 129]],
  [0.45, [255, 241, 118]],
  [0.62, [255, 183, 77]],
  [0.78, [255, 112, 67]],
  [0.92, [229, 57, 53]],
  [1.0, [127, 0, 0]],
];

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function heatColorFromMetric01(t01) {
  const t = clamp01(t01);
  const stops = TALUKA_HEAT_RGB_STOPS;
  let i = 0;
  while (i < stops.length - 2 && t >= stops[i + 1][0]) i += 1;
  const [t0, c0] = stops[i];
  const [t1, c1] = stops[i + 1];
  const span = t1 - t0 || 1;
  const u = clamp01((t - t0) / span);
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * u);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * u);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * u);
  return `rgb(${r},${g},${b})`;
}

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

/** With Voronoi heat on: taluka rings as light admin outlines above cells. */
function talukaBoundaryBaseStyle(feature, showHeat) {
  const p = feature?.properties;
  if (!p || p.kind !== 'taluka') return TALUKA_DEFAULT;
  if (showHeat) {
    return {
      color: '#0d47a1',
      weight: 1.25,
      opacity: 0.55,
      fillColor: '#1976d2',
      fillOpacity: 0,
    };
  }
  return TALUKA_DEFAULT;
}

function talukaBoundaryHoverStyle(feature, showHeat) {
  const p = feature?.properties;
  if (!p || p.kind !== 'taluka') return TALUKA_HOVER;
  if (showHeat) {
    return {
      color: '#003978',
      weight: 2.75,
      opacity: 1,
      fillColor: '#1976d2',
      fillOpacity: 0,
    };
  }
  return TALUKA_HOVER;
}

const DISTRICT_CELL_HOVER = {
  color: '#1a1c1a',
  weight: 2,
  opacity: 0.85,
  fillOpacity: 0.55,
};

function DistrictVoronoiHeatLayer({ layerKey, heatGeo, showHeat }) {
  const styleFn = useCallback((feature) => {
    const p = feature?.properties || {};
    const t = typeof p.heat === 'number' ? p.heat : 0;
    return {
      color: '#5c6560',
      weight: 1,
      opacity: 0.55,
      fillColor: heatColorFromMetric01(t),
      fillOpacity: 0.14 + t * 0.48,
    };
  }, []);

  const bindLayer = useCallback((feature, layer) => {
    const p = feature?.properties;
    if (!p || p.kind !== 'district-heat-cell') return;
    const t = typeof p.heat === 'number' ? p.heat : 0;
    const pct = Math.round(t * 100);
    const html = `
      <div style="min-width:172px;line-height:1.45;position:relative;padding-right:12px">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#222">${p.talukaName} Taluka</div>
        <div style="font-size:11px;color:#222">Scheme penetration: <b>${p.penetration}%</b></div>
        <div style="font-size:11px;color:#222">Moisture / drought stress (desk): <b>${p.ndviStress}%</b></div>
        <div style="font-size:11px;color:#222">Grievance index: <b>${p.grievanceIdx}</b></div>
        <div style="font-size:11px;color:#222;margin-top:4px">Map intensity (local): <b>${pct}%</b></div>
        <span style="position:absolute;right:4px;bottom:2px;width:8px;height:8px;border-radius:50%;background:${heatColorFromMetric01(t)};display:inline-block" aria-hidden="true"></span>
      </div>`;
    layer.bindTooltip(html, {
      sticky: false,
      direction: 'auto',
      opacity: 1,
      className: 'district-taluka-tooltip',
    });
    layer.on({
      mouseover: (e) => {
        const lyr = e.target;
        const heat = typeof lyr.feature?.properties?.heat === 'number' ? lyr.feature.properties.heat : 0;
        lyr.setStyle({
          ...DISTRICT_CELL_HOVER,
          fillColor: heatColorFromMetric01(heat),
        });
        lyr.bringToFront();
      },
      mouseout: (e) => {
        const lyr = e.target;
        lyr.setStyle(styleFn(lyr.feature));
      },
    });
  }, [styleFn]);

  if (!showHeat || !heatGeo?.features?.length) return null;

  return (
    <Pane name="districtVoronoiHeat" style={{ zIndex: 375 }}>
      <GeoJSON key={layerKey} data={heatGeo} style={styleFn} onEachFeature={bindLayer} />
    </Pane>
  );
}

function TalukaBoundariesLayer({ talukaGeo, showHeat }) {
  const baseStyle = useCallback(
    (feature) => talukaBoundaryBaseStyle(feature, showHeat),
    [showHeat],
  );

  const bindLayer = useCallback((feature, layer) => {
    const p = feature?.properties;
    if (!p || p.kind !== 'taluka') return;
    const html = `
      <div style="min-width:172px;line-height:1.45">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px">${p.name} Taluka</div>
        <div style="font-size:11px;color:#222">Scheme penetration: <b>${p.penetration}%</b></div>
        <div style="font-size:11px;color:#222">Moisture / drought stress (desk): <b>${p.ndviStress}%</b></div>
        <div style="font-size:11px;color:#222">Grievance index: <b>${p.grievanceIdx}</b></div>
      </div>`;
    layer.bindTooltip(html, { sticky: true, direction: 'auto', opacity: 0.96, className: 'district-taluka-tooltip' });
    layer.on({
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle(talukaBoundaryHoverStyle(lyr.feature, showHeat));
        lyr.bringToFront();
      },
      mouseout: (e) => {
        const lyr = e.target;
        lyr.setStyle(baseStyle(lyr.feature));
      },
    });
  }, [showHeat, baseStyle]);

  if (!talukaGeo?.features?.length) return null;

  return (
    <Pane name="districtTalukaStrokes" style={{ zIndex: 385 }}>
      <GeoJSON
        data={talukaGeo}
        style={baseStyle}
        onEachFeature={bindLayer}
      />
    </Pane>
  );
}

const MAP_MODES = [
  { id: 'penetration', label: 'Scheme penetration', sub: 'MahaDBT subsidy uptake by taluka', icon: 'hub' },
  { id: 'ndvi', label: 'Moisture / drought stress', sub: 'Open‑Meteo rainfall desk proxy (not satellite NDVI)', icon: 'satellite_alt' },
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

  /** Per-taluka Voronoi clipped to each ring (same approach as TAO mandal map). */
  const districtHeatGeo = useMemo(
    () => buildDistrictVoronoiHeatmap(talukaGeo, mapMode),
    [talukaGeo, mapMode],
  );

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
          metric: districtHeatMetric01(mapMode, f.properties)
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
            <DistrictVoronoiHeatLayer
              layerKey={`district-heat-${mapMode}`}
              heatGeo={districtHeatGeo}
              showHeat={showHeat}
            />
            <TalukaBoundariesLayer talukaGeo={talukaGeo} showHeat={showHeat} />
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
        Voronoi mesh per taluka, each cell intersected with its taluka polygon so heat never crosses an admin ring (same pattern as the TAO mandal map). Toggle heat off for a neutral taluka outline. District dashed line is the geofence (simplified demo boundary).
      </p>
    </div>
  );
};

export default DistrictCommandMap;
