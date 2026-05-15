/**
 * Baramati taluka - mandal seed points + Voronoi cells clipped to the official
 * outer boundary so the heat layer never extends past the taluka/AC fence.
 * Coordinates are [lng, lat] (GeoJSON). Intensity is derived from demo metrics.
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

/** Demo mandals aligned with TAO table + adjacent revenue clusters (Baramati taluka). */
export const BARAMATI_MANDAL_SEEDS = [
  {
    lng: 74.42,
    lat: 18.24,
    id: 'M-BRM-01',
    name: 'Malegaon BK',
    marathi: 'मालेगाव बु.',
    caoName: 'Ramesh Patil',
    status: 'Critical',
    pending: 42,
    fraudAlerts: 3,
    description: 'High mechanisation subsidy queue',
  },
  {
    lng: 74.56,
    lat: 18.27,
    id: 'M-BRM-02',
    name: 'Hol',
    marathi: 'होळ',
    caoName: 'Sunita Deshmukh',
    status: 'Clear',
    pending: 15,
    fraudAlerts: 0,
    description: 'Stable clearance velocity',
  },
  {
    lng: 74.52,
    lat: 18.14,
    id: 'M-BRM-03',
    name: 'Vadgaon Nimbalkar',
    marathi: 'वडगाव निंबाळकर',
    caoName: 'Vijay More',
    status: 'Critical',
    pending: 52,
    fraudAlerts: 6,
    description: 'Cross-check on duplicate land extracts',
  },
  {
    lng: 74.33,
    lat: 18.18,
    id: 'M-BRM-04',
    name: 'Katphal',
    marathi: 'काटफळ',
    caoName: 'Anil Kulkarni',
    status: 'Warning',
    pending: 31,
    fraudAlerts: 2,
    description: 'Irrigation component backlog',
  },
  {
    lng: 74.62,
    lat: 18.20,
    id: 'M-BRM-05',
    name: 'Nira',
    marathi: 'निरा',
    caoName: 'Meera Jadhav',
    status: 'Warning',
    pending: 28,
    fraudAlerts: 1,
    description: 'River belt verification load',
  },
  {
    lng: 74.38,
    lat: 18.32,
    id: 'M-BRM-06',
    name: 'Supe',
    marathi: 'सुपे',
    caoName: 'Kiran Bhosale',
    status: 'Clear',
    pending: 12,
    fraudAlerts: 0,
    description: 'Within SLA this fortnight',
  },
  {
    lng: 74.58,
    lat: 18.33,
    id: 'M-BRM-07',
    name: 'Baramati (HQ)',
    marathi: 'बारामती',
    caoName: 'Usha Pawar',
    status: 'Warning',
    pending: 36,
    fraudAlerts: 2,
    description: 'HQ circle - mixed scheme intake',
  },
  {
    lng: 74.28,
    lat: 18.30,
    id: 'M-BRM-08',
    name: 'Rui',
    marathi: 'रूई',
    caoName: 'Deepak Shinde',
    status: 'Clear',
    pending: 9,
    fraudAlerts: 0,
    description: 'Low dispute rate',
  },
];

function nudgeIntoTaluka(seed, talukaFeature, com) {
  const [cx, cy] = com.geometry.coordinates;
  for (let t = 1; t >= 0.05; t -= 0.05) {
    const lng = seed.lng * t + cx * (1 - t);
    const lat = seed.lat * t + cy * (1 - t);
    if (booleanPointInPolygon(point([lng, lat]), talukaFeature)) {
      return { ...seed, lng, lat };
    }
  }
  return { ...seed, lng: cx, lat: cy };
}

function heatScore(props, maxP, maxF) {
  const p = props.pending ?? 0;
  const f = props.fraudAlerts ?? 0;
  const w = 0.58 * (p / maxP) + 0.42 * (f / Math.max(maxF, 1));
  return Math.max(0, Math.min(1, w));
}

/**
 * @param {import('geojson').Feature} talukaFeature - Polygon or MultiPolygon outer boundary
 * @param {typeof BARAMATI_MANDAL_SEEDS} seeds
 * @returns {import('geojson').FeatureCollection | null}
 */
export function buildMandalHeatmapClippedToTaluka(talukaFeature, seeds = BARAMATI_MANDAL_SEEDS) {
  if (!talukaFeature?.geometry) return null;
  const taluka = rewind(talukaFeature, { reverse: false });
  const com = centerOfMass(taluka);

  const maxP = Math.max(1, ...seeds.map((s) => s.pending ?? 0));
  const maxF = Math.max(1, ...seeds.map((s) => s.fraudAlerts ?? 0));

  const adjusted = seeds.map((s) => {
    if (booleanPointInPolygon(point([s.lng, s.lat]), taluka)) return { ...s };
    return nudgeIntoTaluka(s, taluka, com);
  });

  const pts = featureCollection(
    adjusted.map((s) =>
      point([s.lng, s.lat], {
        id: s.id,
        name: s.name,
        marathi: s.marathi,
        caoName: s.caoName,
        status: s.status,
        pending: s.pending,
        fraudAlerts: s.fraudAlerts,
        description: s.description,
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
    const heat = heatScore(base, maxP, maxF);
    clipped.properties = {
      ...base,
      kind: 'mandal',
      heat,
      intensity: heat,
    };
    features.push(clipped);
  }

  if (!features.length) return null;
  return { type: 'FeatureCollection', features };
}
