/**
 * Pune Division (DJDA) — five district polygons inside the published division
 * boundary: five interior seed sites → Voronoi → each cell clipped to the
 * outer ring (full coverage, no bleed). Metrics align with `DISTRICT_MATRIX`.
 */

import {
  bbox,
  booleanPointInPolygon,
  centerOfMass,
  featureCollection,
  intersect,
  point,
  rewind,
  union,
  voronoi,
} from '@turf/turf';
import { DISTRICT_MATRIX } from './divisionMockData';

/** Map-mode fields 0–100 derived from the division desk matrix row (demo). */
function districtPropsFromMatrixRow(row) {
  const schemePenetration = Math.round(Math.min(96, 48 + row.disbursedPct * 0.82));
  const ndviStress = Math.min(92, 20 + Math.round(row.pending / 35));
  const grievanceIdx = Math.min(94, 14 + row.fraudAlerts * 5);
  return {
    kind: 'division',
    name: row.district,
    code: row.code,
    officer: row.officer,
    districts: 1,
    talukas: row.talukas,
    fundsCr: row.fundsCr,
    disbursedPct: row.disbursedPct,
    pending: row.pending,
    fraudAlerts: row.fraudAlerts,
    status: row.status,
    tag: `${row.talukas} talukas`,
    schemePenetration,
    ndviStress,
    grievanceIdx,
  };
}

function firstPolygonalFeature(fc) {
  if (!fc?.features?.length) return null;
  const polys = fc.features.filter(
    (f) => f?.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'),
  );
  if (!polys.length) return null;
  if (polys.length === 1) return polys[0];
  try {
    let acc = rewind(polys[0], { reverse: false });
    for (let i = 1; i < polys.length; i += 1) {
      const next = rewind(polys[i], { reverse: false });
      const u = union(featureCollection([acc, next]));
      if (u?.geometry) acc = u;
    }
    return acc;
  } catch {
    return rewind(polys[0], { reverse: false });
  }
}

/** Five column probes west→east so order matches desk: Pune … Kolhapur. */
function fiveSeedsInPolygon(polyFeature) {
  const poly = rewind(polyFeature, { reverse: false });
  const box = bbox(poly);
  const [minX, minY, maxX, maxY] = box;
  const w = maxX - minX;
  const h = maxY - minY;
  const seeds = [];
  const yFracs = [0.52, 0.38, 0.62, 0.28, 0.72, 0.45, 0.55, 0.5];

  for (let i = 0; i < 5; i += 1) {
    const x = minX + ((i + 0.5) / 5) * w;
    let picked = null;
    for (const fy of yFracs) {
      const y = minY + fy * h;
      if (booleanPointInPolygon(point([x, y]), poly)) {
        picked = [x, y];
        break;
      }
    }
    if (!picked) {
      const com = centerOfMass(poly);
      picked = [com.geometry.coordinates[0], com.geometry.coordinates[1]];
    }
    seeds.push(picked);
  }

  for (let a = 0; a < seeds.length; a += 1) {
    for (let b = a + 1; b < seeds.length; b += 1) {
      const dx = seeds[a][0] - seeds[b][0];
      const dy = seeds[a][1] - seeds[b][1];
      if (dx * dx + dy * dy < (w * 0.02) ** 2) {
        seeds[b][1] += h * 0.04 * (b % 2 === 0 ? 1 : -1);
      }
    }
  }

  return seeds;
}

/**
 * @param {import('geojson').FeatureCollection} boundaryFc — e.g. Pune division TopoJSON parse result
 * @returns {import('geojson').FeatureCollection | null} five `kind: division` district polygons
 */
export function buildPuneDivisionDistrictFeatureCollection(boundaryFc) {
  const parent = firstPolygonalFeature(boundaryFc);
  if (!parent?.geometry) return null;

  const rows = DISTRICT_MATRIX;
  if (rows.length !== 5) return null;

  const seeds = fiveSeedsInPolygon(parent);
  const pts = featureCollection(
    rows.map((row, i) =>
      point(seeds[i], districtPropsFromMatrixRow(row)),
    ),
  );

  const box = bbox(parent);
  let vor;
  try {
    vor = voronoi(pts, { bbox: box });
  } catch {
    return null;
  }

  const features = [];
  for (let i = 0; i < vor.features.length; i += 1) {
    const cell = vor.features[i];
    let clipped;
    try {
      clipped = intersect(featureCollection([cell, parent]));
    } catch {
      clipped = null;
    }
    if (!clipped?.geometry) continue;
    const row = rows[i];
    clipped.properties = {
      ...districtPropsFromMatrixRow(row),
    };
    features.push(clipped);
  }

  if (features.length < 3) return null;
  return { type: 'FeatureCollection', features };
}
