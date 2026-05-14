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
