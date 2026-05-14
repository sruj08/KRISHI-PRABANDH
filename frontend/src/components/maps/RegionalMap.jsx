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
 *   • Division / district choropleth from overlay GeoJSON (`kind: division` or
 *     `kind: district`) + canvas KDE heat (default)
 *   • Optional Voronoi micro-mesh per division (disabled — use choropleth + KDE)
 *   • Three interactive metric modes: Scheme penetration / Crop health / Grievance heat
 *   • Zoom/pan locked to active boundary
 *   • Top-3 centroid pins (most critical locations per mode)
 *
 * Z-index overlay order (Leaflet overlayPane ≈ 400 — mask must sit above it or heat /
 *   Voronoi “leaks” past the state geofence; same pattern as TAO taluka focus mask):
 *   TileLayer → Division choropleth → [optional Voronoi] → KDE (overlayPane)
 *   → Inverted mask (state/taluka hole punch) → Dashed geofence → Centroid pins / tooltips
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
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
import { buildDivisionVoronoiHeatmap, divisionHeatMetric01 } from '../../utils/divisionVoronoiHeatmap';
import { buildPuneDivisionDistrictFeatureCollection } from '../../utils/puneDivisionDistrictMesh';
import { bareDivisionCode } from '../../utils/divisionIntelMock';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Choropleth fill opacity — constant so hover/selection does not shift colour vs legend */
const CHOROPLETH_FILL_OPACITY = 0.5;

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
    sub: 'Moisture stress (Open-Meteo rain)',
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

/** Legend strip title — short label for the active map mode */
const MAP_INTENSITY_STRIP_LABEL = {
  penetration: 'Scheme',
  ndvi: 'Stress',
  grievance: 'Grievance',
};

// Heatmap params per layer tier
const HEAT_CONFIG = {
  state:    { radius: 20, blur: 15, pointCount: 200 },
  division: { radius: 28, blur: 20, pointCount: 100 },
  district: { radius: 32, blur: 22, pointCount:  70 },
  taluka:   { radius: 40, blur: 28, pointCount:  30 },
};

/** Dense per-division Voronoi cells — off: command maps use choropleth + smooth KDE only. */
const ENABLE_DIVISION_VORONOI_MESH = false;

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

/** Match demo matrix row to division or district name from GeoJSON / Voronoi (handles naming variants). */
function matrixRowForDivision(divisionMatrix, geoName, geoCode) {
  if (!divisionMatrix?.length) return null;
  if (geoCode) {
    const s = String(geoCode);
    const bare = s.replace(/^DIV-/i, '');
    const byCode = divisionMatrix.find(
      (r) => r.code === s || r.code === bare || `DIV-${r.code}` === s,
    );
    if (byCode) return byCode;
  }
  if (!geoName) return null;
  const direct = divisionMatrix.find((r) => r.division === geoName);
  if (direct) return direct;
  const asDistrict = divisionMatrix.find((r) => r.district === geoName);
  if (asDistrict) return asDistrict;
  if (geoName === 'Chhatrapati Sambhajinagar' || geoName === 'Chhatrapati Sambhaji Nagar') {
    return divisionMatrix.find((r) => r.division === 'Chh. Sambhajinagar') || null;
  }
  return null;
}

/** 0–1 intensity from division feature properties for current map mode */
function metricNormalizedFromProps(props, mapMode) {
  const p = props || {};
  let v = 0.5;
  if (mapMode === 'penetration') v = p.schemePenetration != null ? p.schemePenetration / 100 : 0.5;
  else if (mapMode === 'ndvi') v = p.ndviStress != null ? p.ndviStress / 100 : 0.35;
  else v = p.grievanceIdx != null ? p.grievanceIdx / 100 : 0.3;
  return Math.max(0, Math.min(1, v));
}

function formatMetricPct(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  return Number.isFinite(n) ? `${Math.round(n)}%` : '—';
}

function formatMetricIdx(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  return Number.isFinite(n) ? String(Math.round(n)) : '—';
}

/** Map hover: name, then a two-word label + value for the active mode; pending is separate in scheme mode. */
function divisionChoroplethTooltipForMode(p, mapMode, treatPenetrationAsFraud = false) {
  const name = (p.name || p.division || 'Division').trim();
  if (mapMode === 'penetration') {
    if (treatPenetrationAsFraud) return `${name}\nDistrict fraud alerts ${formatMetricPct(p.schemePenetration)}`;
    return `${name}\nScheme uptake ${formatMetricPct(p.schemePenetration)}`;
  }
  if (mapMode === 'ndvi') return `${name}\nMoisture stress ${formatMetricPct(p.ndviStress)}`;
  return `${name}\nGrievance index ${formatMetricIdx(p.grievanceIdx)}`;
}

function divisionChoroplethPathStyle(feature, mapMode, selectedDivisionKey, showDivisionVoronoi, divisionCollection) {
  if (showDivisionVoronoi && divisionCollection?.features?.length) {
    return {
      fillOpacity: 0,
      fillColor: '#000000',
      color: '#0f172a',
      weight: 1.35,
      opacity: 0.72,
      interactive: false,
    };
  }
  const p = feature?.properties || {};
  const n = metricNormalizedFromProps(p, mapMode);
  const fill = fillColorForNormalizedMetric(n);
  const key = p.code || p.name;
  const selected = Boolean(key && key === selectedDivisionKey);
  return {
    fillColor: fill,
    fillOpacity: CHOROPLETH_FILL_OPACITY,
    color: '#0f172a',
    weight: selected ? 3 : 1.35,
    opacity: 1,
  };
}

function fillColorForNormalizedMetric(n) {
  const x = Math.max(0, Math.min(1, n));
  if (x < 0.25) return HEAT_GRADIENT[0.2];
  if (x < 0.5) return HEAT_GRADIENT[0.5];
  if (x < 0.75) return HEAT_GRADIENT[0.8];
  return HEAT_GRADIENT[1.0];
}

/**
 * KDE points sampled inside each division polygon, weighted by that division’s metric.
 * When `stateRings` is provided, points must also lie inside the state outer boundary
 * so heat blobs do not leak outside the masked map area.
 */
function buildDivisionHeatPoints(divisionFC, mapMode, layerType, stateRings = []) {
  if (!divisionFC?.features?.length) return [];
  const nDiv = divisionFC.features.length;
  const baseCfg = HEAT_CONFIG[layerType] || HEAT_CONFIG.state;
  const perDiv = Math.max(28, Math.floor(baseCfg.pointCount / nDiv));
  const pts = [];
  for (const f of divisionFC.features) {
    const ring = getOuterRing(f.geometry);
    if (!ring?.length) continue;
    const p = f.properties || {};
    const t = metricNormalizedFromProps(p, mapMode);
    const seedStr = `${p.code || ''}${p.name || ''}${mapMode}`;
    const seed = seedStr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
    const rand = seededRand(seed);
    const box = ringBBox(ring);
    let added = 0;
    let attempts = 0;
    while (added < perDiv && attempts < perDiv * 30) {
      attempts += 1;
      const lat = box.minLat + rand() * (box.maxLat - box.minLat);
      const lng = box.minLng + rand() * (box.maxLng - box.minLng);
      if (!pointInPolygon(lat, lng, ring)) continue;
      if (stateRings.length && !pointInAnyRing(lat, lng, stateRings)) continue;
      const jitter = 0.1 + rand() * 0.22;
      const intensity = Math.min(0.98, Math.max(0.16, t * 0.82 + jitter * 0.28));
      pts.push([lat, lng, intensity]);
      added += 1;
    }
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

/** Leaflet needs a size pass when the parent flex/grid height resolves after paint */
function MapLayoutFix() {
  const map = useMap();
  useEffect(() => {
    const fix = () => {
      try {
        map.invalidateSize(true);
      } catch (_) { /* noop */ }
    };
    fix();
    const raf = requestAnimationFrame(fix);
    const t1 = setTimeout(fix, 100);
    const t2 = setTimeout(fix, 400);
    window.addEventListener('resize', fix);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', fix);
    };
  }, [map]);
  return null;
}

/** Fits + locks map to the active boundary */
function FitBounds({ featureCollection, fitBoundsOptions }) {
  const map = useMap();
  useEffect(() => {
    if (!featureCollection?.features?.length) return;
    const gj = L.geoJSON(featureCollection);
    const b = gj.getBounds();
    if (!b.isValid()) return;

    map.setMinZoom(0);
    map.setMaxBounds(null);
    const fitOpts = fitBoundsOptions
      ? { animate: false, ...fitBoundsOptions }
      : { padding: [20, 20], animate: false };
    map.fitBounds(b, fitOpts);

    const fitZoom = map.getZoom();
    map.setMinZoom(Math.max(4, fitZoom - 1));
    map.setMaxBounds(b.pad(0.08));
    map.options.maxBoundsViscosity = 1.0;
  }, [featureCollection, fitBoundsOptions, map]);
  return null;
}

/** Canvas KDE heatmap layer via leaflet.heat */
function KdeHeatLayer({ points, layerType, mapMode, contained }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !points?.length) return undefined;
    const baseCfg = HEAT_CONFIG[layerType] || HEAT_CONFIG.taluka;
    const cfg = contained
      ? { radius: Math.min(14, baseCfg.radius), blur: Math.min(10, baseCfg.blur) }
      : baseCfg;
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
        minOpacity: contained ? 0.08 : 0.1,
        max:        1.0,
        maxZoom:    contained ? 11 : 20,
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
  }, [map, points, layerType, mapMode, contained]);

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

const DIV_VORONOI_CELL_HOVER = {
  color: '#1a1c1a',
  weight: 2,
  opacity: 0.9,
};

function DivisionVoronoiHeatLayer({
  geo,
  layerKey,
  showHeat,
  divisionMatrix,
  onSelectDivision,
  mapMode = 'penetration',
}) {
  const styleFn = useCallback((feature) => {
    const t = typeof feature?.properties?.heat === 'number' ? feature.properties.heat : 0;
    return {
      color: '#5c6560',
      weight: 1,
      opacity: 0.55,
      fillColor: fillColorForNormalizedMetric(t),
      fillOpacity: 0.14 + t * 0.48,
    };
  }, []);

  const bindLayer = useCallback(
    (feature, layer) => {
      const p = feature?.properties;
      if (!p || p.kind !== 'division-heat-cell') return;
      const title = (p.regionName || 'Division').replace(/</g, '&lt;');
      let val = '—';
      if (mapMode === 'penetration') val = p.schemePenetration != null ? `${p.schemePenetration}%` : '—';
      else if (mapMode === 'ndvi') val = p.ndviStress != null ? `${p.ndviStress}%` : '—';
      else val = p.grievanceIdx != null ? String(p.grievanceIdx) : '—';
      const lbl = mapMode === 'penetration' ? 'Scheme uptake' : mapMode === 'ndvi' ? 'Moisture stress' : 'Grievance index';
      const html = `
      <div style="min-width:120px;line-height:1.45">
        <div style="font-weight:700;font-size:13px;color:#222">${title}</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;margin-top:6px">${lbl}</div>
        <div style="font-size:15px;font-weight:700;margin-top:4px;color:#111">${val}</div>
      </div>`;
      layer.bindTooltip(html, {
        sticky: true,
        direction: 'auto',
        opacity: 1,
        className: 'district-taluka-tooltip',
      });
      layer.on({
        click: () => {
          const row = matrixRowForDivision(divisionMatrix, p.regionName, p.code);
          onSelectDivision({
            properties: {
              name: p.regionName,
              tag: p.tag,
              schemePenetration: p.schemePenetration,
              ndviStress: p.ndviStress,
              grievanceIdx: p.grievanceIdx,
              officer: p.officer,
              districts: p.districts,
              fundsCr: p.fundsCr,
              disbursedPct: p.disbursedPct,
              fraudAlerts: p.fraudAlerts,
              code: p.code,
            },
            matrixRow: row,
          });
        },
        mouseover: (e) => {
          const lyr = e.target;
          const heat = typeof lyr.feature?.properties?.heat === 'number' ? lyr.feature.properties.heat : 0;
          const base = styleFn(lyr.feature);
          lyr.setStyle({
            ...base,
            ...DIV_VORONOI_CELL_HOVER,
            fillColor: fillColorForNormalizedMetric(heat),
          });
          lyr.bringToFront();
        },
        mouseout: (e) => {
          const lyr = e.target;
          lyr.setStyle(styleFn(lyr.feature));
        },
      });
    },
    [divisionMatrix, onSelectDivision, styleFn, mapMode],
  );

  if (!showHeat || !geo?.features?.length) return null;

  return (
    <Pane name="divisionVoronoiHeat" style={{ zIndex: 415 }}>
      <GeoJSON key={layerKey} data={geo} style={styleFn} onEachFeature={bindLayer} />
    </Pane>
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
 * @param {string} [props.divisionOverlayUrl] - Optional GeoJSON overlay: `kind: division` features (state-style) or `kind: district` for per-district choropleth inside a division
 * @param {Array} [props.divisionMatrix] - Optional matrix rows (`division` or `district` key) for desk merge + tooltips
 * @param {object} [props.fitBoundsOptions] - Optional Leaflet `fitBounds` options (e.g. asymmetric padding to bias framing)
 * @param {string} [props.title]     - Optional header title
 * @param {string} [props.subtitle]  - Optional header subtitle
 * @param {Record<string, { schemePenetration?: number, ndviStress?: number, grievanceIdx?: number }>} [props.liveDivisionMetrics] - Bare division codes (KKN, PNE, …) merged into overlay GeoJSON for heatmap + tooltips
 * @param {boolean} [props.treatPenetrationLayerAsFraudHeat] - When true, first map mode labels tooltips/legend as district fraud intensity (values still use `schemePenetration` slot)
 */
const RegionalMap = ({
  layerType = 'state',
  boundaryUrl,
  divisionOverlayUrl = null,
  divisionMatrix = null,
  fitBoundsOptions = null,
  title,
  subtitle,
  liveDivisionMetrics = null,
  treatPenetrationLayerAsFraudHeat = false,
}) => {
  const [rawData, setRawData] = useState(null);
  const [rawDivisionData, setRawDivisionData] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [divisionLoadErr, setDivisionLoadErr] = useState(null);
  const [mapMode, setMapMode] = useState('penetration');
  const [showHeat, setShowHeat] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const navigate = useNavigate();

  const displayMapModes = useMemo(() => {
    if (!treatPenetrationLayerAsFraudHeat) return MAP_MODES;
    return MAP_MODES.map((m) =>
      m.id === 'penetration'
        ? { ...m, label: 'District fraud alerts', sub: 'Relative AI fraud intensity by district (demo).' }
        : m,
    );
  }, [treatPenetrationLayerAsFraudHeat]);

  const activeIntensityStripLabel = useMemo(() => {
    if (treatPenetrationLayerAsFraudHeat && mapMode === 'penetration') return 'Fraud intensity';
    return MAP_INTENSITY_STRIP_LABEL[mapMode] || MAP_INTENSITY_STRIP_LABEL.penetration;
  }, [treatPenetrationLayerAsFraudHeat, mapMode]);

  const activeLegendRows = useMemo(() => {
    if (treatPenetrationLayerAsFraudHeat && mapMode === 'penetration') {
      return [
        { c: '#d90429', t: 'Higher alert load' },
        { c: '#ffd670', t: 'Moderate' },
        { c: '#a0c4ff', t: 'Lower' },
      ];
    }
    return LEGEND[mapMode] || LEGEND.penetration;
  }, [treatPenetrationLayerAsFraudHeat, mapMode]);

  const penetrationMetricTitle = treatPenetrationLayerAsFraudHeat ? 'District fraud alerts' : 'Scheme uptake';
  const penetrationMetricTitleLong = treatPenetrationLayerAsFraudHeat ? 'District fraud alerts' : 'Scheme penetration';

  // ── Fetch boundary data (state outline — never modified on disk) ───────────
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

  // ── Optional division overlay (GeoJSON: `kind: district` and/or `kind: division`) ──
  useEffect(() => {
    if (!divisionOverlayUrl) {
      setRawDivisionData(null);
      setDivisionLoadErr(null);
      return;
    }
    let cancelled = false;
    setRawDivisionData(null);
    setDivisionLoadErr(null);
    (async () => {
      try {
        const res = await fetch(divisionOverlayUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${divisionOverlayUrl}`);
        const json = await res.json();
        if (!cancelled) setRawDivisionData(json);
      } catch (e) {
        if (!cancelled) setDivisionLoadErr(e.message || 'Failed to load division overlay');
      }
    })();
    return () => { cancelled = true; };
  }, [divisionOverlayUrl]);

  // ── Parse into FeatureCollection ─────────────────────────────────────────
  const featureCollection = useMemo(() => parseBoundaryData(rawData), [rawData]);

  /**
   * Choropleth source from overlay GeoJSON:
   * - `kind: district` — per-district polygons (division command map)
   * - else `kind: division` — revenue-division rings (state command map)
   */
  const divisionCollection = useMemo(() => {
    if (!rawDivisionData) return null;
    const fc = parseBoundaryData(rawDivisionData);
    if (!fc?.features?.length) return null;

    const mergeLive = (f) => {
      if (!liveDivisionMetrics) return f;
      const code = bareDivisionCode(f.properties?.code);
      const L = liveDivisionMetrics[code];
      if (!L) return f;
      return {
        ...f,
        properties: {
          ...f.properties,
          ...(L.schemePenetration != null ? { schemePenetration: L.schemePenetration } : {}),
          ...(L.ndviStress != null ? { ndviStress: L.ndviStress } : {}),
          ...(L.grievanceIdx != null ? { grievanceIdx: L.grievanceIdx } : {}),
        },
      };
    };

    const districts = fc.features.filter((f) => f.properties?.kind === 'district');
    if (districts.length) {
      return { type: 'FeatureCollection', features: districts.map(mergeLive) };
    }

    const divs = fc.features.filter((f) => f.properties?.kind === 'division');
    if (!divs.length) return null;
    return { type: 'FeatureCollection', features: divs.map(mergeLive) };
  }, [rawDivisionData, liveDivisionMetrics]);

  // ── Build all polygon rings (for clipping + bbox) ────────────────────────
  const allRings = useMemo(
    () => getAllOuterRings(featureCollection),
    [featureCollection],
  );

  /** Leaflet [lat, lng] — required before fitBounds; must never be undefined */
  const defaultCenter = useMemo(() => {
    if (!allRings.length) return [19.75, 74.5];
    const box = mergedBBox(allRings);
    return [(box.minLat + box.maxLat) / 2, (box.minLng + box.maxLng) / 2];
  }, [allRings]);

  // ── Inverted mask ─────────────────────────────────────────────────────────
  const invertedMask = useMemo(
    () => buildInvertedMask(featureCollection),
    [featureCollection],
  );

  /** Division polygons for Voronoi: overlay file, or Pune division boundary → five district meshes. */
  const divisionVoronoiSourceFc = useMemo(() => {
    if (divisionCollection?.features?.length) return divisionCollection;
    if (layerType === 'division' && featureCollection?.features?.length) {
      const mesh = buildPuneDivisionDistrictFeatureCollection(featureCollection);
      if (mesh?.features?.length) return mesh;
    }
    return null;
  }, [divisionCollection, layerType, featureCollection]);

  const divisionVoronoiGeo = useMemo(
    () => (ENABLE_DIVISION_VORONOI_MESH && divisionVoronoiSourceFc
      ? buildDivisionVoronoiHeatmap(divisionVoronoiSourceFc, mapMode)
      : null),
    [divisionVoronoiSourceFc, mapMode],
  );

  const showDivisionVoronoi = Boolean(
    ENABLE_DIVISION_VORONOI_MESH && showHeat && divisionVoronoiGeo?.features?.length,
  );

  // ── Mock heatmap points (KDE) — skipped when Voronoi division mesh is active ──
  const heatPoints = useMemo(() => {
    if (divisionVoronoiGeo?.features?.length) return [];
    if (divisionCollection?.features?.length) {
      return buildDivisionHeatPoints(divisionCollection, mapMode, layerType, allRings);
    }
    return buildMockPoints(allRings, mapMode, layerType);
  }, [divisionVoronoiGeo, allRings, divisionCollection, mapMode, layerType]);

  const selectedDivisionKey = selectedDivision?.properties?.code
    || selectedDivision?.properties?.name
    || null;

  /** Remount division GeoJSON when metrics/mode change so tooltips and styles stay in sync */
  const divisionOverlayKey = useMemo(() => {
    if (!divisionCollection?.features?.length) return `div-${mapMode}-empty`;
    const sig = divisionCollection.features.map((f) => {
      const q = f.properties || {};
      return `${q.code ?? q.name}:${q.schemePenetration ?? 'x'}-${q.ndviStress ?? 'x'}-${q.grievanceIdx ?? 'x'}`;
    }).join('|');
    return `div-${mapMode}-${sig}`;
  }, [divisionCollection, mapMode]);

  const divisionStyleFn = useCallback(
    (feature) => divisionChoroplethPathStyle(
      feature,
      mapMode,
      selectedDivisionKey,
      showDivisionVoronoi,
      divisionCollection,
    ),
    [mapMode, selectedDivisionKey, showDivisionVoronoi, divisionCollection],
  );

  const bindDivisionLayer = useCallback(
    (feature, layer) => {
      const p = feature?.properties || {};
      const row = matrixRowForDivision(divisionMatrix, p.name, p.code);
      layer.on({
        click: () => setSelectedDivision({ properties: p, matrixRow: row }),
        mouseover: (e) => {
          const st = divisionChoroplethPathStyle(
            feature,
            mapMode,
            selectedDivisionKey,
            showDivisionVoronoi,
            divisionCollection,
          );
          e.target.setStyle({ ...st, weight: Math.max(2.85, st.weight) });
        },
        mouseout: (e) => {
          e.target.setStyle(divisionStyleFn(feature));
        },
      });
      const baseTip = divisionChoroplethTooltipForMode(p, mapMode, treatPenetrationLayerAsFraudHeat);
      const fraudLine = (treatPenetrationLayerAsFraudHeat && mapMode === 'penetration' && row?.fraudAlerts != null)
        ? `\nFraud alerts ${Number(row.fraudAlerts).toLocaleString('en-IN')}`
        : '';
      const pendingLine = (mapMode === 'penetration' && row?.pending != null)
        ? `\nPending files ${Number(row.pending).toLocaleString('en-IN')}`
        : '';
      layer.bindTooltip(`${baseTip}${fraudLine}${pendingLine}`, {
        sticky: true,
        direction: 'auto',
        className: 'tao-mandal-tooltip',
      });
    },
    [divisionMatrix, divisionStyleFn, divisionCollection, mapMode, selectedDivisionKey, showDivisionVoronoi, treatPenetrationLayerAsFraudHeat],
  );

  // ── Top-3 centroid pins (division centroids when overlay present) ─────────
  const centroidPins = useMemo(() => {
    if (divisionCollection?.features?.length) {
      const pins = [];
      for (const f of divisionCollection.features) {
        const ring = getOuterRing(f.geometry);
        const c = ringCentroid(ring);
        if (!c) continue;
        const p = f.properties || {};
        const metric = metricNormalizedFromProps(p, mapMode);
        pins.push({
          id: p.code || p.name,
          label: p.name || 'Division',
          lat: c.lat,
          lng: c.lng,
          metric,
          props: { ...p },
        });
      }
      return pins.sort((a, b) => b.metric - a.metric).slice(0, 3);
    }
    if (layerType === 'division' && divisionVoronoiSourceFc?.features?.length) {
      const pins = [];
      for (const f of divisionVoronoiSourceFc.features) {
        const ring = getOuterRing(f.geometry);
        const c = ringCentroid(ring);
        if (!c) continue;
        const p = f.properties || {};
        pins.push({
          id: p.code || p.name,
          label: p.name || 'Division',
          lat: c.lat,
          lng: c.lng,
          metric: divisionHeatMetric01(mapMode, p),
          props: { ...p },
        });
      }
      return pins.sort((a, b) => b.metric - a.metric).slice(0, 3);
    }
    if (!featureCollection?.features) return [];
    const pins = [];
    for (const f of featureCollection.features) {
      const ring = getOuterRing(f.geometry);
      const c = ringCentroid(ring);
      if (c) {
        const idx = featureCollection.features.indexOf(f);
        const rand = seededRand(idx * 100 + (mapMode === 'penetration' ? 1 : mapMode === 'ndvi' ? 2 : 3));
        pins.push({
          id: f.properties?.name || f.properties?.AC_NAME || `pin-${idx}`,
          label: f.properties?.AC_NAME || f.properties?.name || f.properties?.division || 'Region',
          lat: c.lat,
          lng: c.lng,
          metric: rand(),
        });
      }
    }
    return pins.sort((a, b) => b.metric - a.metric).slice(0, 3);
  }, [divisionCollection, divisionVoronoiSourceFc, layerType, featureCollection, mapMode]);


  const maskStyle = useCallback(() => ({
    stroke:      false,
    fillColor:   '#F4F5F7',
    fillOpacity: 1,
    interactive: false,
  }), []);

  const overlayUiInMap =
    layerType === 'state' && (divisionCollection?.features?.length ?? 0) > 0;

  const renderMapControls = () => (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: overlayUiInMap ? 6 : 8,
        width: overlayUiInMap ? '100%' : undefined,
      }}
      >
        {displayMapModes.map((m) => (
          <button
            key={m.id}
            type="button"
            title={overlayUiInMap ? undefined : m.sub}
            onClick={() => setMapMode(m.id)}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              padding:        overlayUiInMap ? '5px 10px' : '6px 14px',
              borderRadius:   8,
              border:         `1px solid ${mapMode === m.id ? '#1a365d' : 'var(--outline-variant, #ccc)'}`,
              background:     mapMode === m.id ? '#1a365d' : '#fff',
              color:          mapMode === m.id ? '#fff' : 'var(--text-muted, #666)',
              fontSize:       overlayUiInMap ? '11px' : '12px',
              fontWeight:     600,
              cursor:         'pointer',
              transition:     'all 0.18s ease',
              whiteSpace:     'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: overlayUiInMap ? 15 : 16 }}>
              {m.icon}
            </span>
            {m.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowHeat((v) => !v)}
          style={{
            marginLeft:  'auto',
            display:     'inline-flex',
            alignItems:  'center',
            gap:         6,
            padding:     overlayUiInMap ? '5px 10px' : '6px 14px',
            borderRadius: 8,
            border:      `1px solid ${showHeat ? '#2e7d32' : 'var(--outline-variant, #ccc)'}`,
            background:  showHeat ? '#e8f5e9' : '#fff',
            color:       showHeat ? '#2e7d32' : 'var(--text-muted, #666)',
            fontSize:    overlayUiInMap ? '11px' : '12px',
            fontWeight:  600,
            cursor:      'pointer',
            transition:  'all 0.18s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: overlayUiInMap ? 15 : 16 }}>
            {showHeat ? 'layers' : 'layers_clear'}
          </span>
          Heatmap
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: overlayUiInMap ? 10 : 16,
        flexWrap: 'wrap',
        marginTop: overlayUiInMap ? 8 : 0,
      }}
      >
        <span style={{
          fontSize:      overlayUiInMap ? '9px' : '10px',
          fontWeight:    700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         'var(--text-muted, #888)',
          flexShrink:    0,
        }}>
          {activeIntensityStripLabel}
        </span>
        <div style={{
          flex:        1,
          height:      6,
          borderRadius: 99,
          background:  `linear-gradient(to right, ${HEAT_GRADIENT[0.2]}, ${HEAT_GRADIENT[0.5]}, ${HEAT_GRADIENT[0.8]}, ${HEAT_GRADIENT[1.0]})`,
          maxWidth:    overlayUiInMap ? 160 : 200,
          minWidth:    60,
        }} />
        {activeLegendRows.map((row) => (
          <span key={row.t} style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        5,
            fontSize:   overlayUiInMap ? '10px' : '11px',
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
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        flex:          1,
        minHeight:     0,
        width:         '100%',
        height:        '100%',
        gap:           '12px',
        padding:       '16px 20px 20px',
      }}
    >
      {!overlayUiInMap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {renderMapControls()}
        </div>
      )}

      {/* ── Map canvas ── */}
      <div
        className="regional-map-frame"
        style={{
          flex:         1,
          borderRadius: 'var(--radius, 12px)',
          overflow:     'hidden',
          border:       '1px solid var(--outline-variant, #ddd)',
          minHeight:    420,
          position:     'relative',
          marginTop:    overlayUiInMap ? 0 : 4,
          isolation:    'isolate',
        }}
      >
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
          <>
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

              {/* 2 ── KDE Heatmap (division-weighted or state-clipped mock) */}
              {showHeat && heatPoints.length > 0 && !showDivisionVoronoi && (
                <KdeHeatLayer
                  key={`kde-heat-${mapMode}`}
                  points={heatPoints}
                  layerType={layerType}
                  mapMode={mapMode}
                  contained={Boolean(
                    divisionCollection?.features?.length
                    && (layerType === 'state' || layerType === 'division'),
                  )}
                />
              )}

              {/* 3b ── Division choropleth + borders (below Voronoi & mask) */}
              {divisionCollection?.features?.length > 0 && (
                <Pane name="divisionChoroplethPane" style={{ zIndex: 405 }}>
                  <GeoJSON
                    key={divisionOverlayKey}
                    data={divisionCollection}
                    style={divisionStyleFn}
                    onEachFeature={bindDivisionLayer}
                  />
                </Pane>
              )}

              {showDivisionVoronoi && (
                <DivisionVoronoiHeatLayer
                  geo={divisionVoronoiGeo}
                  layerKey={`div-voronoi-${mapMode}`}
                  showHeat={showHeat}
                  divisionMatrix={divisionMatrix}
                  onSelectDivision={setSelectedDivision}
                  mapMode={mapMode}
                />
              )}

              {showDivisionVoronoi &&
                layerType === 'division' &&
                !divisionCollection?.features?.length &&
                divisionVoronoiSourceFc?.features?.length > 1 && (
                <Pane name="puneDistrictRim" style={{ zIndex: 422, pointerEvents: 'none' }}>
                  <GeoJSON
                    key={`pune-rim-${divisionVoronoiSourceFc.features.length}`}
                    data={divisionVoronoiSourceFc}
                    interactive={false}
                    style={() => ({
                      fillOpacity: 0,
                      color: '#0d47a1',
                      weight: 1.65,
                      opacity: 0.82,
                      interactive: false,
                    })}
                  />
                </Pane>
              )}

              {/* 3 ── Inverted mask (above overlayPane ≈400 so heat/Voronoi cannot paint outside geofence) */}
              <Pane
                name="invertedMaskPane"
                style={{ zIndex: 510, pointerEvents: 'none' }}
              >
                {invertedMask && (
                  <GeoJSON
                    key="inverted-mask"
                    data={invertedMask}
                    style={maskStyle}
                  />
                )}
              </Pane>

              {/* 4 ── Dashed geofence (state outline) — above mask so the fence stays crisp */}
              <Pane
                name="geofencePane"
                style={{ zIndex: 530, pointerEvents: 'none' }}
              >
                <GeofenceLayer featureCollection={featureCollection} />
              </Pane>

              {/* 5 ── Centroid pins (top 3 divisions or regions) */}
              <Pane name="centroidPinsPane" style={{ zIndex: 640 }}>
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
                      {pin.props ? (
                        <div style={{ whiteSpace: 'pre-line', fontSize: 11, lineHeight: 1.45, color: '#1a1c1a' }}>
                          {divisionChoroplethTooltipForMode(pin.props, mapMode, treatPenetrationLayerAsFraudHeat)}
                        </div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{pin.label}</div>
                          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                            {(divisionCollection?.features?.length || showDivisionVoronoi)
                              ? `Top divisions by ${mapMode === 'penetration' ? (treatPenetrationLayerAsFraudHeat ? 'fraud alert intensity' : 'scheme uptake') : mapMode === 'ndvi' ? 'moisture stress' : 'grievance load'}`
                              : `Sample point · ${mapMode === 'penetration' ? (treatPenetrationLayerAsFraudHeat ? 'fraud' : 'uptake') : mapMode === 'ndvi' ? 'stress' : 'grievance'}`}
                          </div>
                        </>
                      )}
                    </Tooltip>
                  </CircleMarker>
                ))}
              </Pane>

              <FitBounds featureCollection={featureCollection} fitBoundsOptions={fitBoundsOptions} />
              <MapLayoutFix />
            </MapContainer>

            {overlayUiInMap && (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  zIndex: 1800,
                  pointerEvents: 'none',
                  maxWidth: 'calc(100% - 20px)',
                }}
              >
                <div
                  style={{
                    pointerEvents: 'auto',
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(226, 227, 223, 0.95)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                    maxHeight: 'min(38%, 200px)',
                    overflowY: 'auto',
                  }}
                >
                  {renderMapControls()}
                </div>
              </div>
            )}

            {divisionLoadErr && (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  zIndex: 2000,
                  maxWidth: 420,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 237, 213, 0.97)',
                  border: '1px solid #f59e0b',
                  fontSize: 11,
                  color: '#92400e',
                }}
              >
                Division overlay: {divisionLoadErr}
              </div>
            )}

            {selectedDivision?.properties && (() => {
              const p = selectedDivision.properties;
              const row =
                selectedDivision.matrixRow
                ?? matrixRowForDivision(divisionMatrix, p.name, p.code);
              const dp = row?.disbursedPct ?? p.disbursedPct;
              const disbursedText = dp == null || dp === '' ? '—' : `${String(dp).replace(/%$/, '')}%`;
              const pen = p.schemePenetration;
              const ndvi = p.ndviStress;
              const griv = p.grievanceIdx;

              const panelShellStyle = {
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                maxWidth: 'min(520px, calc(100% - 20px))',
                marginLeft: 'auto',
                maxHeight: overlayUiInMap ? 'min(38vh, 320px)' : 'min(42vh, 380px)',
                zIndex: 2000,
                pointerEvents: 'auto',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'saturate(1.1) blur(12px)',
                WebkitBackdropFilter: 'saturate(1.1) blur(12px)',
                border: '1px solid #e2e3df',
                borderLeft: '4px solid #1a365d',
                borderRadius: 12,
                boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                padding: '14px 16px 16px',
                fontSize: 12,
                color: '#1a1c1a',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              };

              const goDivisionAnalysis = () => {
                const code = row?.code || bareDivisionCode(p.code);
                navigate(`/state/divisional-analysis?division=${encodeURIComponent(code)}&focus=${mapMode}`);
              };

              if (overlayUiInMap) {
                return (
                  <div style={panelShellStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#717972', textTransform: 'uppercase' }}>
                          Map preview · {mapMode === 'penetration' ? penetrationMetricTitle : mapMode === 'ndvi' ? 'Crop stress' : 'Grievance load'}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25, marginTop: 4, color: '#0f172a' }}>
                          {p.name}
                        </div>
                        <div
                          style={{
                            marginTop: 10,
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: mapMode === 'penetration' ? '#f0f6ff' : mapMode === 'ndvi' ? '#fffbeb' : '#fef2f2',
                            border: `1px solid ${mapMode === 'penetration' ? '#bfdbfe' : mapMode === 'ndvi' ? '#fde68a' : '#fecaca'}`,
                          }}
                        >
                          <div style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#64748b',
                            marginBottom: 6,
                          }}
                          >
                            {mapMode === 'penetration' ? penetrationMetricTitle : mapMode === 'ndvi' ? 'Moisture stress' : 'Grievance index'}
                          </div>
                          <div style={{
                            fontSize: 26,
                            fontWeight: 800,
                            marginTop: 0,
                            fontVariantNumeric: 'tabular-nums',
                            color: '#0f172a',
                          }}
                          >
                            {mapMode === 'penetration' && <>{pen != null ? `${pen}%` : '—'}</>}
                            {mapMode === 'ndvi' && <>{ndvi != null ? `${ndvi}%` : '—'}</>}
                            {mapMode === 'grievance' && <>{griv != null ? griv : '—'}</>}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDivision(null)}
                        aria-label="Close division info"
                        style={{
                          border: 'none',
                          background: '#eef1ee',
                          borderRadius: 8,
                          cursor: 'pointer',
                          padding: '6px 8px',
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#414943' }}>close</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={goDivisionAnalysis}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid #1a365d',
                        background: '#1a365d',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>analytics</span>
                      Open division analysis
                    </button>

                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#033621', textTransform: 'uppercase', marginBottom: 8 }}>
                      Command desk
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>JDA / lead</span>
                        <strong style={{ fontSize: 13, color: '#1a1c1a' }}>{row?.officer || p.officer || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Districts</span>
                        <strong style={{ fontSize: 13 }}>{row?.districts ?? p.districts ?? '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Funds (Cr)</span>
                        <strong style={{ fontSize: 13 }}>{row?.fundsCr ?? p.fundsCr ?? '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Disbursed</span>
                        <strong style={{ fontSize: 13 }}>{disbursedText}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Pending files</span>
                        <strong style={{ fontSize: 13 }}>{row?.pending != null ? Number(row.pending).toLocaleString('en-IN') : '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Fraud alerts</span>
                        <strong style={{ fontSize: 13, color: '#ba1a1a' }}>{row?.fraudAlerts ?? p.fraudAlerts ?? '—'}</strong>
                      </div>
                    </div>

                    <div style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px solid #eef1ee',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 10,
                      color: '#414943',
                    }}
                    >
                      <span style={{ fontWeight: 700, color: '#1a365d' }}>Map lens:</span>
                      <span style={{ fontWeight: 600 }}>{mapMode === 'penetration' ? penetrationMetricTitleLong : mapMode === 'ndvi' ? 'Moisture stress (NDVI lens)' : 'Grievance heat'}</span>
                      {row?.status && (
                        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#f3f4f0', color: '#1a1c1a' }}>
                          {row.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return (
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  right: 10,
                  maxWidth: 'min(440px, calc(100% - 20px))',
                  marginLeft: 'auto',
                  maxHeight: 'min(42vh, 380px)',
                  zIndex: 2000,
                  pointerEvents: 'auto',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'saturate(1.1) blur(12px)',
                  WebkitBackdropFilter: 'saturate(1.1) blur(12px)',
                  border: '1px solid #e2e3df',
                  borderLeft: '4px solid #1a365d',
                  borderRadius: 12,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                  padding: '14px 16px 16px',
                  fontSize: 12,
                  color: '#1a1c1a',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#717972', textTransform: 'uppercase' }}>
                      {layerType === 'state' ? 'Statewide division desk' : 'Division overview'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25, marginTop: 4, color: '#0f172a' }}>
                      {p.name}
                    </div>
                    {layerType === 'state' && (
                      <div style={{ fontSize: 10, color: '#717972', marginTop: 6, lineHeight: 1.45 }}>
                        Heat and analytics are clipped to the state geofence; click a division or heat cell for desk context.
                      </div>
                    )}
                    {p.tag && (
                      <div style={{ fontSize: 11, color: '#414943', marginTop: 8, lineHeight: 1.5 }}>
                        {p.tag}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDivision(null)}
                    aria-label="Close division info"
                    style={{
                      border: 'none',
                      background: '#eef1ee',
                      borderRadius: 8,
                      cursor: 'pointer',
                      padding: '6px 8px',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#414943' }}>close</span>
                  </button>
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#033621', textTransform: 'uppercase', marginBottom: 8 }}>
                  Active lens
                </div>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    marginBottom: 14,
                    background: mapMode === 'penetration' ? '#f0f6ff' : mapMode === 'ndvi' ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${mapMode === 'penetration' ? '#bfdbfe' : mapMode === 'ndvi' ? '#fde68a' : '#fecaca'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    marginBottom: 8,
                  }}
                  >
                    {mapMode === 'penetration' ? penetrationMetricTitle : mapMode === 'ndvi' ? 'Moisture stress' : 'Grievance index'}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#0f172a' }}>
                    {mapMode === 'penetration' && (pen != null ? `${pen}%` : '—')}
                    {mapMode === 'ndvi' && (ndvi != null ? `${ndvi}%` : '—')}
                    {mapMode === 'grievance' && (griv != null ? griv : '—')}
                  </div>
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#033621', textTransform: 'uppercase', marginBottom: 8 }}>
                  Command desk
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>JDA / lead</span>
                    <strong style={{ fontSize: 13, color: '#1a1c1a' }}>{row?.officer || p.officer || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Districts</span>
                    <strong style={{ fontSize: 13 }}>{row?.districts ?? p.districts ?? '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Funds (Cr)</span>
                    <strong style={{ fontSize: 13 }}>{row?.fundsCr ?? p.fundsCr ?? '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Disbursed</span>
                    <strong style={{ fontSize: 13 }}>{disbursedText}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Pending files</span>
                    <strong style={{ fontSize: 13 }}>{row?.pending != null ? Number(row.pending).toLocaleString('en-IN') : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#717972', display: 'block', marginBottom: 2 }}>Fraud alerts</span>
                    <strong style={{ fontSize: 13, color: '#ba1a1a' }}>{row?.fraudAlerts ?? p.fraudAlerts ?? '—'}</strong>
                  </div>
                </div>

                <div style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: '1px solid #eef1ee',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  color: '#414943',
                }}
                >
                  <span style={{ fontWeight: 700, color: '#1a365d' }}>Active map layer:</span>
                  <span style={{ fontWeight: 600 }}>{mapMode === 'penetration' ? penetrationMetricTitleLong : mapMode === 'ndvi' ? 'Moisture stress (NDVI lens)' : 'Grievance heat'}</span>
                  {row?.status && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#f3f4f0', color: '#1a1c1a' }}>
                      Status · {row.status}
                    </span>
                  )}
                </div>
              </div>
              );
            })()}
          </>
        )}
      </div>

      {overlayUiInMap ? null : (
      <p style={{
        fontSize:   '10px',
        color:      'var(--text-muted, #888)',
        margin:     0,
        lineHeight: 1.5,
      }}>
        {divisionCollection?.features?.length
          ? (treatPenetrationLayerAsFraudHeat
            ? 'Click a district for desk context. Pins mark the three highest-intensity districts for the selected map mode.'
            : 'Click a division for the desk panel. Pins mark top 3 by the selected map mode.')
          : 'Boundary-clipped heat samples. Pins mark top 3 by the selected map mode.'}
      </p>
      )}
    </div>
  );
};

export default RegionalMap;
