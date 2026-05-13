/**
 * Division-level command maps — Voronoi micro-cells per division polygon, each
 * clipped to that division’s ring (same pattern as `districtVoronoiHeatmap.js`
 * and TAO mandal Voronoi). Heat never crosses a division boundary.
 */

import {
  bbox,
  booleanPointInPolygon,
  centerOfMass,
  intersect,
  point,
  featureCollection,
  voronoi,
  rewind,
} from '@turf/turf';

/** @param {string} mapMode penetration | ndvi | grievance */
export function divisionHeatMetric01(mapMode, props) {
  if (!props) return 0;
  const v =
    mapMode === 'penetration'
      ? props.schemePenetration
      : mapMode === 'ndvi'
        ? props.ndviStress
        : props.grievanceIdx;
  if (v == null || Number.isNaN(v)) return 0.5;
  return Math.min(1, Math.max(0, v / 100));
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function hash01(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 10001) / 10001;
}

function buildSeedsForDivision(divisionFeature, mapMode) {
  const region = rewind(divisionFeature, { reverse: false });
  const props = region.properties || {};
  const name = props.name || props.division || 'division';
  const base = divisionHeatMetric01(mapMode, props);
  const noiseAmp = 0.2;

  const box = bbox(region);
  const [minLng, minLat, maxLng, maxLat] = box;
  const w = Math.max(maxLng - minLng, 1e-5);
  const h = Math.max(maxLat - minLat, 1e-5);
  const area = w * h;

  const target = Math.min(26, Math.max(8, Math.round(11 + area * 900)));

  const com = centerOfMass(region);
  const [cx, cy] = com.geometry.coordinates;

  const candidates = [];
  const pushIfInside = (lng, lat) => {
    if (!booleanPointInPolygon(point([lng, lat]), region)) return;
    candidates.push({ lng, lat });
  };

  pushIfInside(cx, cy);

  const aspect = w / h;
  const nx = Math.max(2, Math.ceil(Math.sqrt(target * aspect)));
  const ny = Math.max(2, Math.ceil(target / nx));

  for (let i = 0; i < nx; i += 1) {
    for (let j = 0; j < ny; j += 1) {
      const u = (i + 0.5) / nx;
      const v = (j + 0.5) / ny;
      pushIfInside(minLng + u * w, minLat + v * h);
    }
  }

  const epsilon = Math.min(w, h) * 0.015;
  const deduped = [];
  for (const c of candidates) {
    if (deduped.some((d) => Math.hypot(d.lng - c.lng, d.lat - c.lat) < epsilon)) continue;
    deduped.push(c);
  }

  let seeds = deduped;
  if (seeds.length > target) {
    const step = seeds.length / target;
    const out = [];
    for (let k = 0; k < target; k += 1) {
      out.push(seeds[Math.min(seeds.length - 1, Math.floor(k * step))]);
    }
    seeds = out;
  }

  const jitter = (idx) => clamp01(base + (hash01(`${name}-${idx}`) - 0.5) * noiseAmp);

  if (seeds.length < 2) {
    const offsets = [
      [w * 0.06, 0],
      [-w * 0.06, 0],
      [0, h * 0.06],
      [0, -h * 0.06],
      [w * 0.05, h * 0.05],
    ];
    for (const [dx, dy] of offsets) {
      if (seeds.length >= 4) break;
      const lng = cx + dx;
      const lat = cy + dy;
      if (booleanPointInPolygon(point([lng, lat]), region)) {
        if (!seeds.some((s) => Math.hypot(s.lng - lng, s.lat - lat) < epsilon)) {
          seeds.push({ lng, lat });
        }
      }
    }
  }

  return seeds.map((s, idx) => ({
    ...s,
    heat: jitter(idx),
  }));
}

function voronoiCellsForOneDivision(divisionFeature, mapMode) {
  if (!divisionFeature?.geometry) return null;
  const region = rewind(divisionFeature, { reverse: false });
  const seeds = buildSeedsForDivision(divisionFeature, mapMode);
  if (seeds.length < 2) return null;

  const props = divisionFeature.properties || {};
  const label = props.name || props.division || 'Division';

  const pts = featureCollection(
    seeds.map((s, idx) =>
      point([s.lng, s.lat], {
        heat: s.heat,
        seedIndex: idx,
        regionName: label,
        schemePenetration: props.schemePenetration ?? 0,
        ndviStress: props.ndviStress ?? 0,
        grievanceIdx: props.grievanceIdx ?? 0,
        code: props.code ?? '',
        officer: props.officer ?? '',
        districts: props.districts ?? '',
        fundsCr: props.fundsCr ?? '',
        disbursedPct: props.disbursedPct ?? '',
        fraudAlerts: props.fraudAlerts ?? '',
        tag: props.tag ?? '',
      }),
    ),
  );

  const box = bbox(region);
  const vor = voronoi(pts, { bbox: box });
  const features = [];

  for (const cell of vor.features) {
    let clipped;
    try {
      clipped = intersect(featureCollection([cell, region]));
    } catch {
      clipped = null;
    }
    if (!clipped?.geometry) continue;

    const base = cell.properties || {};
    clipped.properties = {
      kind: 'division-heat-cell',
      heat: typeof base.heat === 'number' ? base.heat : divisionHeatMetric01(mapMode, props),
      regionName: base.regionName ?? label,
      schemePenetration: base.schemePenetration ?? props.schemePenetration ?? 0,
      ndviStress: base.ndviStress ?? props.ndviStress ?? 0,
      grievanceIdx: base.grievanceIdx ?? props.grievanceIdx ?? 0,
      code: base.code ?? props.code ?? '',
      officer: base.officer ?? props.officer ?? '',
      districts: base.districts ?? props.districts ?? '',
      fundsCr: base.fundsCr ?? props.fundsCr ?? '',
      disbursedPct: base.disbursedPct ?? props.disbursedPct ?? '',
      fraudAlerts: base.fraudAlerts ?? props.fraudAlerts ?? '',
      tag: base.tag ?? props.tag ?? '',
    };
    features.push(clipped);
  }

  if (!features.length) return null;
  return { type: 'FeatureCollection', features };
}

/**
 * @param {import('geojson').FeatureCollection | null} divisionFc — features with kind:division (recommended)
 * @param {string} mapMode
 * @returns {import('geojson').FeatureCollection | null}
 */
export function buildDivisionVoronoiHeatmap(divisionFc, mapMode) {
  if (!divisionFc?.features?.length) return null;
  const all = [];
  for (const f of divisionFc.features) {
    if (f?.properties?.kind !== 'division') continue;
    if (!f.geometry || (f.geometry.type !== 'Polygon' && f.geometry.type !== 'MultiPolygon')) continue;
    const part = voronoiCellsForOneDivision(f, mapMode);
    if (part?.features?.length) all.push(...part.features);
  }
  if (!all.length) return null;
  return { type: 'FeatureCollection', features: all };
}
