/**
 * Pune district command map — Voronoi “micro-cells” per taluka, each clipped to
 * that taluka’s ring (same pattern as `taoMandalHeatmap.js` / TAO mandal map).
 * Nothing is drawn outside a taluka boundary; tiles together cover the district.
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

/** @param {string} mapMode */
export function districtHeatMetric01(mapMode, props) {
  if (!props) return 0;
  const v =
    mapMode === 'penetration'
      ? props.penetration
      : mapMode === 'ndvi'
        ? props.ndviStress
        : props.grievanceIdx;
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

/**
 * Grid + centroid samples inside one taluka; heat = base metric + small
 * deterministic jitter so adjacent Voronoi cells read like the TAO mandal view.
 */
function buildSeedsForTaluka(talukaFeature, mapMode) {
  const taluka = rewind(talukaFeature, { reverse: false });
  const props = taluka.properties || {};
  const name = props.name || 'taluka';
  const base = districtHeatMetric01(mapMode, props);
  const noiseAmp = 0.2;

  const box = bbox(taluka);
  const [minLng, minLat, maxLng, maxLat] = box;
  const w = Math.max(maxLng - minLng, 1e-5);
  const h = Math.max(maxLat - minLat, 1e-5);
  const area = w * h;

  const target = Math.min(22, Math.max(7, Math.round(10 + area * 3200)));

  const com = centerOfMass(taluka);
  const [cx, cy] = com.geometry.coordinates;

  const candidates = [];
  const pushIfInside = (lng, lat) => {
    if (!booleanPointInPolygon(point([lng, lat]), taluka)) return;
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
    let idx = seeds.length;
    for (const [dx, dy] of offsets) {
      if (seeds.length >= 4) break;
      const lng = cx + dx;
      const lat = cy + dy;
      if (booleanPointInPolygon(point([lng, lat]), taluka)) {
        if (!seeds.some((s) => Math.hypot(s.lng - lng, s.lat - lat) < epsilon)) {
          seeds.push({ lng, lat });
          idx += 1;
        }
      }
    }
  }

  return seeds.map((s, idx) => ({
    ...s,
    heat: jitter(idx),
  }));
}

/**
 * @param {import('geojson').Feature} talukaFeature — Polygon or MultiPolygon, kind taluka
 * @param {string} mapMode — penetration | ndvi | grievance
 * @returns {import('geojson').FeatureCollection | null}
 */
function voronoiCellsForOneTaluka(talukaFeature, mapMode) {
  if (!talukaFeature?.geometry) return null;
  const taluka = rewind(talukaFeature, { reverse: false });
  const seeds = buildSeedsForTaluka(talukaFeature, mapMode);
  if (seeds.length < 2) return null;

  const props = taluka.properties || {};
  const pts = featureCollection(
    seeds.map((s, idx) =>
      point([s.lng, s.lat], {
        heat: s.heat,
        seedIndex: idx,
        talukaName: props.name ?? '',
        penetration: props.penetration ?? 0,
        ndviStress: props.ndviStress ?? 0,
        grievanceIdx: props.grievanceIdx ?? 0,
      }),
    ),
  );

  const box = bbox(taluka);
  const vor = voronoi(pts, { bbox: box });
  const features = [];

  for (const cell of vor.features) {
    let clipped;
    try {
      clipped = intersect(featureCollection([cell, taluka]));
    } catch {
      clipped = null;
    }
    if (!clipped?.geometry) continue;

    const base = cell.properties || {};
    clipped.properties = {
      kind: 'district-heat-cell',
      heat: typeof base.heat === 'number' ? base.heat : districtHeatMetric01(mapMode, props),
      talukaName: base.talukaName ?? props.name ?? '',
      penetration: base.penetration ?? props.penetration ?? 0,
      ndviStress: base.ndviStress ?? props.ndviStress ?? 0,
      grievanceIdx: base.grievanceIdx ?? props.grievanceIdx ?? 0,
    };
    features.push(clipped);
  }

  if (!features.length) return null;
  return { type: 'FeatureCollection', features };
}

/**
 * @param {import('geojson').FeatureCollection | null} talukaFc — only kind:taluka features
 * @param {string} mapMode
 * @returns {import('geojson').FeatureCollection | null}
 */
export function buildDistrictVoronoiHeatmap(talukaFc, mapMode) {
  if (!talukaFc?.features?.length) return null;
  const all = [];
  for (const f of talukaFc.features) {
    if (f?.properties?.kind !== 'taluka') continue;
    const part = voronoiCellsForOneTaluka(f, mapMode);
    if (part?.features?.length) all.push(...part.features);
  }
  if (!all.length) return null;
  return { type: 'FeatureCollection', features: all };
}
