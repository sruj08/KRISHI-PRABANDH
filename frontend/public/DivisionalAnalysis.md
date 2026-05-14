# Divisional analysis — data methodology

**As of:** 2026-05-14  
**Scope:** Maharashtra revenue divisions (bare codes: KKN, PNE, NSK, CSN, AMR, NGP)  
**UI surfaces:** State command map (`RegionalMap` heat / Voronoi), Divisional analysis workspace.

---

## 1. Moisture stress (NDVI module label; not satellite NDVI)

**Source:** [Open-Meteo Archive API](https://open-meteo.com/) — `precipitation_sum` daily, aggregated Mar–Jun 2024.

**Committed bundle:** `/data/maharashtra-live-climate-stress.json`

| Code | Division            | Sample lat | Sample lon | Precip Mar–Jun 2024 (mm) | Moisture recharge index (0–100) | Drought / moisture stress proxy (0–100) |
|------|---------------------|------------|------------|---------------------------|-----------------------------------|-------------------------------------------|
| KKN  | Konkan              | 19.15      | 73.00      | 415.4                     | 100                               | 0                                         |
| PNE  | Pune                | 18.20      | 74.20      | 312.9                     | 41                                | 59                                        |
| NSK  | Nashik              | 20.00      | 74.30      | 241.3                     | 0                                 | 100                                       |
| CSN  | Chh. Sambhajinagar  | 19.85      | 76.35      | 384.9                     | 82                                | 18                                        |
| AMR  | Amravati            | 20.90      | 77.75      | 287.1                     | 26                                | 74                                        |
| NGP  | Nagpur              | 21.15      | 79.10      | 269.1                     | 16                                | 84                                        |

**Interpretation (from bundle `note`):**

- Values are **point samples** at division representative coordinates, **not** district polygons or taluka grids.
- `droughtStressProxy0to100` = 100 minus min–max normalised cumulative Mar–Jun 2024 rainfall across the six samples → **higher = drier relative to other divisions** in that window (peer-ranked moisture stress signal).

**Limitation:** For relief triggers, cross-check with IMD gridded / district rain and ground reports. Point samples can miss localised storms.

---

## 2. Scheme penetration (desk index)

**Source file:** `/data/division-scheme-grievance-referenced.json` — field `schemePenetration.byCode`.

**Press anchor (narrative only; not a district MIS extract):**

- Headline (summary): Maharashtra reported large farmer registration under PMFBY in a recent Kharif push.
- URL: `https://krishijagran.com/agriculture-world/pmfby-over-50-lakh-farmers-in-maharashtra-register-for-pm-crop-insurance-scheme/`
- JSON `note`: Division % values are **modelled desk indices (0–100)** scaled to that statewide intensity — replace with Agristack / PMFBY MIS when integrated.

| Code | Scheme desk % (0–100) |
|------|------------------------|
| KKN  | 82 |
| PNE  | 79 |
| NSK  | 74 |
| CSN  | 68 |
| AMR  | 70 |
| NGP  | 73 |

---

## 3. Grievance heat index (composite)

Until Aaple Sarkar / CM Helpline open APIs are wired, the app computes a **single 0–100 index per division**:

```text
grievanceIdx = clamp( round( 0.44 × droughtStressProxy0to100 + 0.36 × (100 − schemePenetration) + 14 ), 16, 88 )
```

**Press anchor (topic context):**

- URL: `https://www.etnownews.com/personal-finance/pmfby-1-75-lakh-farmers-in-maharashtra-to-face-disqualification-who-is-eligible-who-is-not-find-out-here-article-116215477`
- Use: explains eligibility / compliance friction in press — **not** a division-level grievance count series.

**Example (NSK):** stress 100, scheme 74 → `0.44×100 + 0.36×26 + 14` ≈ **67** (after clamp rules in code).

---

## 4. Map heatmap behaviour

- Division polygons merge **live** `schemePenetration`, `ndviStress` (moisture proxy), and `grievanceIdx` from the hook when JSON loads; otherwise GeoJSON desk defaults apply.
- Voronoi / ramp colouring uses normalised metrics per map mode (penetration vs stress vs grievance).

---

## 5. Desk AI signals (Divisional analysis page)

Recommendations are **rule-based** (`buildDivisionAiPack`): thresholds on stress, scheme %, grievance index, archive rain, deep-bundle geo blocks, and inclusion gap. They are **not** outputs of a hosted LLM.

---

## 6. Refreshing real climate numbers

1. Pick division centroid lat/lon (representative point).
2. Call Open-Meteo Archive for `precipitation_sum`, `start_date` / `end_date` for the window you want.
3. Sum daily values to mm; recompute min–max stress across divisions; update `maharashtra-live-climate-stress.json` and `fetchedAt`.

---

*This document is served as static content at `/DivisionalAnalysis.md` from `frontend/public/`.*
