/**
 * Merge division-level live intel (Open-Meteo + desk JSON, keyed by revenue division code)
 * with per-district desk rows so RegionalMap choropleth + tooltips vary by district.
 *
 * @param {Record<string, object>|null} liveByCode - from useDivisionLiveIntel
 * @param {{ code: string, pending?: number, fraudAlerts?: number, disbursedPct?: number }[]} districtRows
 * @param {string} [divisionCode='PNE'] - bare division code for demo Pune division desk
 */
export function buildLiveDistrictMapMetrics(liveByCode, districtRows, divisionCode = 'PNE') {
  if (!districtRows?.length) return liveByCode || undefined;
  const div = liveByCode?.[divisionCode];
  const out = {};
  for (const d of districtRows) {
    const basePen = Math.min(96, Math.round(48 + (d.disbursedPct ?? 0) * 0.82));
    const stress = div
      ? Math.min(
        94,
        Math.round((div.ndviStress ?? 38) * 0.42 + (d.pending ?? 0) / 28 + (d.fraudAlerts ?? 0) * 3.2),
      )
      : Math.min(92, 20 + Math.round((d.pending ?? 0) / 35));
    const griev = div
      ? Math.min(
        94,
        Math.round((div.grievanceIdx ?? 26) * 0.45 + (d.fraudAlerts ?? 0) * 5.5 + (d.pending ?? 0) / 100),
      )
      : Math.min(94, 14 + (d.fraudAlerts ?? 0) * 5);
    out[d.code] = {
      schemePenetration: basePen,
      ndviStress: stress,
      grievanceIdx: griev,
      ...(div?.precipMmMarJun2024 != null ? { precipMmMarJun2024: div.precipMmMarJun2024 } : {}),
    };
  }
  return out;
}

/**
 * Map per-district fraud desk rows into RegionalMap's `liveDivisionMetrics` shape.
 * Values are written to `schemePenetration` (0–100) so the default "penetration"
 * choropleth mode colours districts by relative fraudSeverityScore.
 * Use with RegionalMap `treatPenetrationLayerAsFraudHeat`.
 *
 * @param {{ code: string, fraudSeverityScore?: number, fraudAlerts?: number, suspiciousApplicationsEst?: number }[]} fraudDensityRows
 * @returns {Record<string, { schemePenetration: number, ndviStress: number, grievanceIdx: number }>|undefined}
 */
export function buildFraudDistrictMapMetrics(fraudDensityRows) {
  if (!fraudDensityRows?.length) return undefined;
  const scores = fraudDensityRows.map((d) => Number(d.fraudSeverityScore) || 0);
  const maxScore = Math.max(1, ...scores);
  const out = {};
  for (const d of fraudDensityRows) {
    const raw = Number(d.fraudSeverityScore) || 0;
    const schemePenetration = Math.min(100, Math.round((raw / maxScore) * 100));
    const fa = Number(d.fraudAlerts) || 0;
    const sus = Number(d.suspiciousApplicationsEst) || 0;
    out[d.code] = {
      schemePenetration,
      ndviStress: Math.min(100, Math.round(fa * 8 + sus / 85)),
      grievanceIdx: Math.min(100, Math.round(sus / 22)),
    };
  }
  return out;
}
