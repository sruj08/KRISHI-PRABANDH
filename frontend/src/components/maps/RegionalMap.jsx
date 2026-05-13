/**
 * RegionalMap — Scalable, reusable react-leaflet map component.
 *
 * Props:
 *   layerType   : 'state' | 'division' | 'taluka'
 *   boundaryUrl : URL string to fetch the boundary file from (GeoJSON or TopoJSON)
 *
 * Supports:
 *   • TopoJSON input (division level) — parsed via topojson-client
 *   • GeoJSON input (state / taluka) — used directly
 *   • Inverted polygon mask to isolate the active region
 *   • Canvas KDE heatmap (leaflet.heat) with strict boundary clipping
 *   • Three interactive metric modes: Scheme penetration / Crop health / Grievance heat
 *   • Zoom/pan locked to active boundary
 *   • Top-3 centroid pins (most critical locations per mode)
 *
 * Z-index overlay order:
 *   TileLayer (base) → Heatmap Canvas → Inverted Mask → Dashed Geofence → Centroid Pins
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip,
  Pane,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as topojson from 'topojson-client';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Heatmap colour ramp matching the requested design spec */
const HEAT_GRADIENT = {
  0.2: '#a0c4ff',
  0.5: '#ffd670',
  0.8: '#ff9770',
  1.0: '#d90429',
};

const MAP_MODES = [
  {
    id: 'penetration',
    label: 'Scheme penetration',
    icon: 'hub',
    sub: 'MahaDBT subsidy uptake',
  },
  {
    id: 'ndvi',
    label: 'Crop health / NDVI',
    icon: 'satellite_alt',
    sub: 'Sentinel-2 stress index (demo)',
  },
  {
    id: 'grievance',
    label: 'Grievance heat',
    icon: 'crisis_alert',
    sub: 'Aaple Sarkar cluster intensity',
  },
];

/** Per-mode legend colour entries */
const LEGEND = {
  penetration: [
    { c: '#d90429', t: 'High uptake' },
    { c: '#ffd670', t: 'Moderate' },
    { c: '#a0c4ff', t: 'Low uptake' },
  ],
  ndvi: [
    { c: '#d90429', t: 'High stress' },
    { c: '#ffd670', t: 'Moderate' },
    { c: '#a0c4ff', t: 'Low stress' },
  ],
  grievance: [
    { c: '#d90429', t: 'High load' },
    { c: '#ffd670', t: 'Elevated' },
    { c: '#a0c4ff', t: 'Typical' },
  ],
};

// Heatmap params per layer tier
const HEAT_CONFIG = {
  state:    { radius: 20, blur: 15, pointCount: 200 },
  division: { radius: 28, blur: 20, pointCount: 100 },
  district: { radius: 32, blur: 22, pointCount:  70 },
  taluka:   { radius: 40, blur: 28, pointCount:  30 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pure geometry utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the first outer ring from any Polygon or MultiPolygon */
function getOuterRing(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Polygon') return geometry.coordinates[0];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates[0][0];
  return null;
}

/** Collect ALL outer rings from a FeatureCollection (multi-feature regions) */
function getAllOuterRings(featureCollection) {
  if (!featureCollection?.features) return [];
  const rings = [];
  for (const f of featureCollection.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') {
      rings.push(g.coordinates[0]);
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates) rings.push(poly[0]);
    }
  }
  return rings;
}

/** Ray-casting point-in-polygon — GeoJSON coords are [lng, lat] */
function pointInPolygon(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Returns true if a point [lat, lng] is inside ANY ring in the array */
function pointInAnyRing(lat, lng, rings) {
  return rings.some((ring) => pointInPolygon(lat, lng, ring));
}

/** Bounding box of a ring */
function ringBBox(ring) {
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return { minLng, maxLng, minLat, maxLat };
}

/** Merged bounding box over all rings */
function mergedBBox(rings) {
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  for (const ring of rings) {
    const b = ringBBox(ring);
    minLng = Math.min(minLng, b.minLng);
    maxLng = Math.max(maxLng, b.maxLng);
    minLat = Math.min(minLat, b.minLat);
    maxLat = Math.max(maxLat, b.maxLat);
  }
  return { minLng, maxLng, minLat, maxLat };
}

/** Ring centroid (average of vertices) */
function ringCentroid(ring) {
  if (!ring?.length) return null;
  let coords = ring;
  const first = ring[0], last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1] && ring.length > 1) {
    coords = ring.slice(0, -1);
  }
  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of coords) { sumLng += lng; sumLat += lat; }
  return { lat: sumLat / coords.length, lng: sumLng / coords.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data engine — strictly boundary-clipped
// ─────────────────────────────────────────────────────────────────────────────

/** Seeded pseudo-random to keep dataset stable per mode */
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Generate mock heatmap points that are:
 *   1. Inside the merged bounding box of all rings
 *   2. Inside at least one ring (via ray-casting)
 *   3. Scaled by layerType
 */
function buildMockPoints(rings, mode, layerType) {
  if (!rings.length) return [];
  const { pointCount } = HEAT_CONFIG[layerType] || HEAT_CONFIG.district;
  const box = mergedBBox(rings);
  const rand = seededRand(
    mode === 'penetration' ? 42 : mode === 'ndvi' ? 137 : 256,
  );

  const pts = [];
  let attempts = 0;
  const maxAttempts = pointCount * 20;

  while (pts.length < pointCount && attempts < maxAttempts) {
    attempts++;
    const lat = box.minLat + rand() * (box.maxLat - box.minLat);
    const lng = box.minLng + rand() * (box.maxLng - box.minLng);
    if (!pointInAnyRing(lat, lng, rings)) continue;
    const intensity = 0.15 + rand() * 0.85;
    pts.push([lat, lng, intensity]);
  }
  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// TopoJSON / GeoJSON parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Intelligently extract a GeoJSON FeatureCollection from the raw boundary data.
 * - TopoJSON: uses topojson.feature() targeting objects['maharashtra-divisions']
 * - GeoJSON:  used directly
 */
function parseBoundaryData(raw) {
  if (!raw) return null;

  // Detect TopoJSON by presence of `type === 'Topology'` or `objects` key
  if (raw.type === 'Topology' || raw.objects) {
    const objKey = Object.keys(raw.objects)[0]; // e.g. 'maharashtra-divisions'
    const featureCollection = topojson.feature(raw, raw.objects[objKey]);
    // Filter for Pune / Western Zone if applicable
    const filtered = featureCollection.features.filter(
      (f) =>
        f.properties?.division === 'Western Zone (Pune Division)' ||
        // Fallback: keep all if no division prop
        f.properties?.division === undefined,
    );
    return {
      ...featureCollection,
      features: filtered.length > 0 ? filtered : featureCollection.features,
    };
  }

  // Standard GeoJSON FeatureCollection
  if (raw.type === 'FeatureCollection') return raw;

  // Single Feature — wrap it
  if (raw.type === 'Feature') return { type: 'FeatureCollection', features: [raw] };

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inverted mask builder
// ─────────────────────────────────────────────────────────────────────────────

const WORLD_RING = [
  [-180, -90],
  [180, -90],
  [180, 90],
  [-180, 90],
  [-180, -90],
];

/**
 * Build an inverted polygon Feature:
 *   outer ring = world bbox
 *   inner rings = all district/region rings (punched as holes)
 * This masks everything OUTSIDE the active region.
 */
function buildInvertedMask(featureCollection) {
  if (!featureCollection?.features?.length) return null;
  const holes = getAllOuterRings(featureCollection);
  if (!holes.length) return null;

  // Reverse winding of inner holes so they read as holes in GeoJSON spec
  const reversedHoles = holes.map((ring) => [...ring].reverse());

  return {
    type: 'Feature',
    properties: { kind: 'inverted-mask' },
    geometry: {
      type: 'Polygon',
      coordinates: [WORLD_RING, ...reversedHoles],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Fits + locks map to the active boundary */
function FitBounds({ featureCollection }) {
  const map = useMap();
  useEffect(() => {
    if (!featureCollection?.features?.length) return;
    const gj = L.geoJSON(featureCollection);
    const b = gj.getBounds();
    if (!b.isValid()) return;

    map.setMinZoom(0);
    map.setMaxBounds(null);
    map.fitBounds(b, { padding: [20, 20], animate: false });

    const fitZoom = map.getZoom();
    map.setMinZoom(Math.max(4, fitZoom - 1));
    map.setMaxBounds(b.pad(0.08));
    map.options.maxBoundsViscosity = 1.0;
  }, [featureCollection, map]);
  return null;
}

/** Canvas KDE heatmap layer via leaflet.heat */
function KdeHeatLayer({ points, layerType, mapMode }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !points?.length) return undefined;
    const cfg = HEAT_CONFIG[layerType] || HEAT_CONFIG.taluka;
    let cancelled = false;

    const teardown = () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (_) {}
        layerRef.current = null;
      }
    };

    (async () => {
      if (typeof window !== 'undefined') window.L = L;
      await import('leaflet.heat/dist/leaflet-heat.js');
      if (cancelled || typeof L.heatLayer !== 'function') return;

      teardown();
      const layer = L.heatLayer(points, {
        radius:     cfg.radius,
        blur:       cfg.blur,
        minOpacity: 0.1,
        max:        1.0,
        maxZoom:    20,
        gradient:   HEAT_GRADIENT,
      });
      layer.addTo(map);
      layer.bringToBack();
      layerRef.current = layer;
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [map, points, layerType, mapMode]);

  return null;
}

/** Dashed administrative geofence overlay */
function GeofenceLayer({ featureCollection }) {
  if (!featureCollection?.features?.length) return null;
  return (
    <GeoJSON
      key={JSON.stringify(featureCollection.features.map((f) => f.properties))}
      data={featureCollection}
      style={() => ({
        color:        '#1a365d',
        weight:       3,
        dashArray:    '8, 8',
        fillColor:    '#1a365d',
        fillOpacity:  0.07,
        interactive:  false,
      })}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RegionalMap
 *
 * @param {string} props.layerType   - 'state' | 'division' | 'taluka'
 * @param {string} props.boundaryUrl - URL to GeoJSON or TopoJSON boundary file
 * @param {string} [props.title]     - Optional header title
 * @param {string} [props.subtitle]  - Optional header subtitle
 */
const RegionalMap = ({ layerType = 'state', boundaryUrl, title, subtitle }) => {
  const [rawData, setRawData]     = useState(null);
  const [loadErr, setLoadErr]     = useState(null);
  const [mapMode, setMapMode]     = useState('penetration');
  const [showHeat, setShowHeat]   = useState(true);

  // ── Fetch boundary data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!boundaryUrl) return;
    let cancelled = false;
    setRawData(null);
    setLoadErr(null);

    (async () => {
      try {
        const res = await fetch(boundaryUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${boundaryUrl}`);
        const json = await res.json();
        if (!cancelled) setRawData(json);
      } catch (e) {
        if (!cancelled) setLoadErr(e.message || 'Failed to load boundary');
      }
    })();

    return () => { cancelled = true; };
  }, [boundaryUrl]);

  // ── Parse into FeatureCollection ─────────────────────────────────────────
  const featureCollection = useMemo(() => parseBoundaryData(rawData), [rawData]);

  // ── Build all polygon rings (for clipping + bbox) ────────────────────────
  const allRings = useMemo(
    () => getAllOuterRings(featureCollection),
    [featureCollection],
  );

  // ── Inverted mask ─────────────────────────────────────────────────────────
  const invertedMask = useMemo(
    () => buildInvertedMask(featureCollection),
    [featureCollection],
  );

  // ── Mock heatmap points (strictly clipped to boundary) ───────────────────
  const heatPoints = useMemo(
    () => buildMockPoints(allRings, mapMode, layerType),
    [allRings, mapMode, layerType],
  );

  // ── Top-3 centroid pins ───────────────────────────────────────────────────
  const centroidPins = useMemo(() => {
    if (!featureCollection?.features) return [];
    const pins = [];
    for (const f of featureCollection.features) {
      const ring = getOuterRing(f.geometry);
      const c = ringCentroid(ring);
      if (c) {
        // Assign a mock metric seeded by feature index for stable sorting
        const idx = featureCollection.features.indexOf(f);
        const rand = seededRand(idx * 100 + (mapMode === 'penetration' ? 1 : mapMode === 'ndvi' ? 2 : 3));
        pins.push({
          id:     f.properties?.name || f.properties?.AC_NAME || `pin-${idx}`,
          label:  f.properties?.AC_NAME || f.properties?.name || f.properties?.division || 'Region',
          lat:    c.lat,
          lng:    c.lng,
          metric: rand(),
        });
      }
    }
    return pins.sort((a, b) => b.metric - a.metric).slice(0, 3);
  }, [featureCollection, mapMode]);

  const legend    = LEGEND[mapMode] || LEGEND.penetration;
  const defaultCenter = useMemo(() => [18.52, 73.86], []);

  const maskStyle = useCallback(() => ({
    stroke:      false,
    fillColor:   '#F4F5F7',
    fillOpacity: 1,
    interactive: false,
  }), []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        gap:           '12px',
        padding:       '16px 20px 20px',
      }}
    >
      {/* ── Mode toggle buttons ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {MAP_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.sub}
            onClick={() => setMapMode(m.id)}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              padding:        '6px 14px',
              borderRadius:   8,
              border:         `1px solid ${mapMode === m.id ? '#1a365d' : 'var(--outline-variant, #ccc)'}`,
              background:     mapMode === m.id ? '#1a365d' : '#fff',
              color:          mapMode === m.id ? '#fff' : 'var(--text-muted, #666)',
              fontSize:       '12px',
              fontWeight:     600,
              cursor:         'pointer',
              transition:     'all 0.18s ease',
              whiteSpace:     'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {m.icon}
            </span>
            {m.label}
          </button>
        ))}

        {/* Heatmap toggle */}
        <button
          type="button"
          onClick={() => setShowHeat((v) => !v)}
          style={{
            marginLeft:  'auto',
            display:     'inline-flex',
            alignItems:  'center',
            gap:         6,
            padding:     '6px 14px',
            borderRadius: 8,
            border:      `1px solid ${showHeat ? '#2e7d32' : 'var(--outline-variant, #ccc)'}`,
            background:  showHeat ? '#e8f5e9' : '#fff',
            color:       showHeat ? '#2e7d32' : 'var(--text-muted, #666)',
            fontSize:    '12px',
            fontWeight:  600,
            cursor:      'pointer',
            transition:  'all 0.18s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {showHeat ? 'layers' : 'layers_clear'}
          </span>
          Heatmap
        </button>
      </div>

      {/* ── Legend strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{
          fontSize:      '10px',
          fontWeight:    700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         'var(--text-muted, #888)',
          flexShrink:    0,
        }}>
          Intensity
        </span>
        <div style={{
          flex:        1,
          height:      6,
          borderRadius: 99,
          background:  `linear-gradient(to right, ${HEAT_GRADIENT[0.2]}, ${HEAT_GRADIENT[0.5]}, ${HEAT_GRADIENT[0.8]}, ${HEAT_GRADIENT[1.0]})`,
          maxWidth:    200,
        }} />
        {legend.map((row) => (
          <span key={row.t} style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        5,
            fontSize:   '11px',
            color:      'var(--text-muted, #666)',
          }}>
            <span style={{
              width:        9,
              height:       9,
              borderRadius: '50%',
              background:   row.c,
              border:       '1px solid rgba(0,0,0,.12)',
              flexShrink:   0,
            }} />
            {row.t}
          </span>
        ))}
      </div>

      {/* ── Map canvas ── */}
      <div style={{
        flex:         1,
        borderRadius: 'var(--radius, 12px)',
        overflow:     'hidden',
        border:       '1px solid var(--outline-variant, #ddd)',
        minHeight:    420,
        position:     'relative',
        marginTop:    4,
      }}>
        {loadErr && (
          <div style={{ padding: 24, color: 'var(--error, #c00)', fontSize: 13 }}>
            {loadErr}
          </div>
        )}
        {!rawData && !loadErr && (
          <div style={{
            height:         '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color:          'var(--text-muted, #888)',
            fontSize:       13,
            gap:            10,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, opacity: 0.4 }}>
              map
            </span>
            Loading boundary data…
          </div>
        )}

        {featureCollection && (
          <MapContainer
            center={defaultCenter}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            worldCopyJump={false}
            maxBoundsViscosity={1.0}
          >
            {/* 1 ── Base tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap
            />

            {/* 2 ── KDE Heatmap (bringToBack — under everything) */}
            {showHeat && heatPoints.length > 0 && (
              <KdeHeatLayer
                points={heatPoints}
                layerType={layerType}
                mapMode={mapMode}
              />
            )}

            {/* 3 ── Inverted mask (hides exterior) */}
            <Pane
              name="invertedMaskPane"
              style={{ zIndex: 350, pointerEvents: 'none' }}
            >
              {invertedMask && (
                <GeoJSON
                  key="inverted-mask"
                  data={invertedMask}
                  style={maskStyle}
                />
              )}
            </Pane>

            {/* 4 ── Dashed geofence */}
            <Pane
              name="geofencePane"
              style={{ zIndex: 400, pointerEvents: 'none' }}
            >
              <GeofenceLayer featureCollection={featureCollection} />
            </Pane>

            {/* 5 ── Centroid pins (top 3) */}
            <Pane name="centroidPinsPane" style={{ zIndex: 650 }}>
              {centroidPins.map((pin) => (
                <CircleMarker
                  key={pin.id}
                  center={[pin.lat, pin.lng]}
                  radius={5}
                  pathOptions={{
                    color:       '#ffffff',
                    weight:      1.5,
                    fillColor:   '#d90429',
                    fillOpacity: 0.95,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{pin.label}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      Priority area · {mapMode === 'penetration' ? 'Low uptake' : mapMode === 'ndvi' ? 'High stress' : 'High grievances'}
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </Pane>

            {/* Fit + lock camera to active boundary */}
            <FitBounds featureCollection={featureCollection} />
          </MapContainer>
        )}
      </div>

      {/* ── Footer note ── */}
      <p style={{
        fontSize:   '10px',
        color:      'var(--text-muted, #888)',
        margin:     0,
        lineHeight: 1.5,
      }}>
        Canvas KDE heatmap (leaflet.heat) with boundary-clipped samples.{' '}
        Showing <strong>top 3 priority locations</strong> for current mode.{' '}
        {layerType === 'division' && 'TopoJSON boundary decoded via topojson-client.'}
        {layerType === 'state' && 'State-level aggregation (Maharashtra).'}
        {layerType === 'district' && 'District-level taluka boundary view (Pune).'}
        {layerType === 'taluka' && 'Assembly constituency / Taluka command view (Baramati).'}
      </p>
    </div>
  );
};

export default RegionalMap;
