import { useEffect, useMemo, useState } from 'react';

const BARE_CODES = ['KKN', 'PNE', 'NSK', 'CSN', 'AMR', 'NGP'];

/**
 * Loads committed Open-Meteo-derived climate stress + referenced scheme anchors,
 * merges per-division metrics for maps and analysis screens.
 */
export function useDivisionLiveIntel() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [climRes, refRes] = await Promise.all([
          fetch('/data/maharashtra-live-climate-stress.json'),
          fetch('/data/division-scheme-grievance-referenced.json'),
        ]);
        if (!climRes.ok) throw new Error(`Climate bundle HTTP ${climRes.status}`);
        if (!refRes.ok) throw new Error(`Scheme bundle HTTP ${refRes.status}`);
        const clim = await climRes.json();
        const ref = await refRes.json();
        const byCode = {};
        for (const c of BARE_CODES) {
          const cd = clim.divisions?.[c];
          const pen = ref.schemePenetration?.byCode?.[c];
          if (pen == null) continue;
          const stress = cd?.droughtStressProxy0to100 ?? 40;
          const griev = Math.min(88, Math.max(16, Math.round(
            0.44 * stress + 0.36 * (100 - pen) + 14,
          )));
          byCode[c] = {
            schemePenetration: pen,
            /** Legacy key name: 0–100 rainfall drought / moisture stress desk proxy (not NDVI). */
            ndviStress: stress,
            grievanceIdx: griev,
            precipMmMarJun2024: cd?.precipMmMarJun2024,
            moistureRechargeIndex: cd?.moistureRechargeIndex,
            climateNote: clim.note,
            climateFetchedAt: clim.fetchedAt,
            climateSource: clim.source,
            climateWindow: clim.window,
            schemeAnchor: ref.schemePenetration.anchor,
            grievAnchor: ref.grievanceHeat.anchor,
          };
        }
        if (!cancelled) {
          setPayload({
            byCode,
            climateMeta: {
              fetchedAt: clim.fetchedAt,
              source: clim.source,
              window: clim.window,
              note: clim.note,
            },
            referenceMeta: ref,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const liveByCode = payload?.byCode ?? null;

  return useMemo(
    () => ({ liveByCode, climateMeta: payload?.climateMeta, referenceMeta: payload?.referenceMeta, error }),
    [liveByCode, payload, error],
  );
}
