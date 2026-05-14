/**
 * Deterministic mock intelligence for state command map + divisional analysis.
 * Values derive from division code so UI stays stable across reloads.
 */

/** Mirrors `public/geo/maharashtra-divisions.geojson` (division features). */
export const DIVISION_MAP_METRICS = {
  KKN: { schemePenetration: 81, ndviStress: 18, grievanceIdx: 24 },
  PNE: { schemePenetration: 79, ndviStress: 31, grievanceIdx: 28 },
  NSK: { schemePenetration: 74, ndviStress: 36, grievanceIdx: 31 },
  CSN: { schemePenetration: 68, ndviStress: 62, grievanceIdx: 47 },
  AMR: { schemePenetration: 70, ndviStress: 44, grievanceIdx: 35 },
  NGP: { schemePenetration: 73, ndviStress: 38, grievanceIdx: 29 },
};

/**
 * NDVI / crop-stress monitoring blocks aligned to Maharashtra revenue divisions.
 * District lists follow the official 6-division grouping (Konkan, Pune, Nashik,
 * Chhatrapati Sambhajinagar / Marathwada, Amravati, Nagpur). Stress % and
 * hectares remain demo-derived but stable per seed — use for layout & desk logic only.
 */
export const NDVI_MONITORING_ZONES = {
  KKN: [
    {
      label: 'MMR & north Konkan',
      districts: 'Mumbai City, Mumbai Suburban, Thane, Palghar',
      deskNote: 'Dense urban–peri-urban interface: prioritize water-stress pockets, rooftop shadow, and peri-urban horticulture for camp routing.',
    },
    {
      label: 'Raigad coast & Matheran foothills',
      districts: 'Raigad',
      deskNote: 'Steep ghats + industrial belt: watch landslip-prone villages after extreme rain; align relief with PMFBY crop-cut calendars.',
    },
    {
      label: 'Ratnagiri mid-coast',
      districts: 'Ratnagiri',
      deskNote: 'Lateritic slopes and horticulture: hail and wind squalls spike claims — keep taluka-wise SMS nudges in sync with IMD nowcasts.',
    },
    {
      label: 'Sindhudurg south coast',
      districts: 'Sindhudurg',
      deskNote: 'Monsoon-heavy tail of Konkan: cashew–rice mosaic; use field visits to validate satellite stress vs actual soil moisture.',
    },
  ],
  PNE: [
    {
      label: 'Pune district & Ghat fringe',
      districts: 'Pune',
      deskNote: 'High-value horticulture + urban fringe; NDVI drops often track irrigation scheduling — cross-check with canal rotation.',
    },
    {
      label: 'Satara plateau',
      districts: 'Satara',
      deskNote: 'Sugarcane–cereal mix on leeward side of ghats; stress spikes usually precede pest cycles — brief TAO teams on cotton & millet.',
    },
    {
      label: 'Sangli–Kolhapur basin',
      districts: 'Sangli, Kolhapur',
      deskNote: 'Perennial irrigation belt: stress here flags canal maintenance or power curtailment more than rainfall alone.',
    },
    {
      label: 'Solapur rain-shadow',
      districts: 'Solapur',
      deskNote: 'Chronic moisture deficit: prioritize drought code triggers, cattle camp placement, and PMFBY notification windows.',
    },
  ],
  NSK: [
    {
      label: 'Nashik upland & vineyards',
      districts: 'Nashik',
      deskNote: 'Godavari upper basin: grape + onion belt — frost / hail false positives are common; confirm with mandal crop books.',
    },
    {
      label: 'Ahmednagar sugar & coarse cereals',
      districts: 'Ahmednagar',
      deskNote: 'Large rainfed blocks: align stress tiles with fodder camps and MGNREGS water works to avoid duplicate surveys.',
    },
    {
      label: 'Jalgaon irrigated corridor',
      districts: 'Jalgaon',
      deskNote: 'Banana + cotton under irrigation: sudden NDVI drops may be power or bore failure — coordinate with MSEDCL outage feeds.',
    },
    {
      label: 'Dhule–Nandurbar tribal uplands',
      districts: 'Dhule, Nandurbar',
      deskNote: 'Tribal talukas with sparse road access; use mobile camps and satellite passes to triage before on-ground crop cutting.',
    },
  ],
  CSN: [
    {
      label: 'Chhatrapati Sambhajinagar–Jalna–Parbhani',
      districts: 'Chhatrapati Sambhajinagar (Aurangabad), Jalna, Parbhani',
      deskNote: 'Core Marathwada corridor: combine NDVI with groundwater stage data before declaring distress — avoids over-alerting.',
    },
    {
      label: 'Beed–Dharashiv (Osmanabad) belt',
      districts: 'Beed, Dharashiv (Osmanabad)',
      deskNote: 'Cotton–soy dominant; stress clusters often align with delayed monsoon onset — sync with agromet advisories.',
    },
    {
      label: 'Latur–Nanded south-east',
      districts: 'Latur, Nanded',
      deskNote: 'Ujjani command fringe: canal delays mimic drought in satellite view — verify with irrigation department schedules.',
    },
    {
      label: 'Hingoli pocket',
      districts: 'Hingoli',
      deskNote: 'Smaller district but high volatility in kharif; useful as early bellwether for wider Marathwada escalation.',
    },
  ],
  AMR: [
    {
      label: 'Amravati–Akola cotton belt',
      districts: 'Amravati, Akola',
      deskNote: 'Pink bollworm history: pair NDVI stress with entomology traps before scaling pesticide subsidies.',
    },
    {
      label: 'Buldhana cotton–soy mosaic',
      districts: 'Buldhana',
      deskNote: 'Vidarbha west entry: watch for false green from late sowing — validate with sowing window registry.',
    },
    {
      label: 'Yavatmal high-stress cotton',
      districts: 'Yavatmal',
      deskNote: 'Historically sensitive belt: escalate only when stress persists across two consecutive passes to cut noise.',
    },
    {
      label: 'Washim transition zone',
      districts: 'Washim',
      deskNote: 'Marathwada–Vidarbha transition: use for cross-division resource sharing (cattle camps, fodder trains).',
    },
  ],
  NGP: [
    {
      label: 'Nagpur–Wardha central plain',
      districts: 'Nagpur, Wardha',
      deskNote: 'Orange belt + soy: irrigation shifts from wells can mimic crop failure — confirm with pump energisation data.',
    },
    {
      label: 'Bhandara–Gondia rice bowl',
      districts: 'Bhandara, Gondia',
      deskNote: 'Transplanted rice masks early stress; delay auto-escalation until tillering stage in crop calendar.',
    },
    {
      label: 'Chandrapur forest–farm edge',
      districts: 'Chandrapur',
      deskNote: 'Forest fringe fires and smoke can distort NDVI — cross-read with Forest Dept fire alerts.',
    },
    {
      label: 'Gadchiroli forest division',
      districts: 'Gadchiroli',
      deskNote: 'Sparse cloud-free imagery: weight field gram sabha reports higher than satellite in dense canopy blocks.',
    },
  ],
};

/** Planning blocks for uptake bar chart — same revenue-division district reality, different grouping from NDVI zones. */
export const UPTAKE_PLANNING_BLOCKS = {
  KKN: [
    { label: 'MMR outreach block', districts: 'Mumbai City, Mumbai Suburban, Thane' },
    { label: 'Palghar tribal–orchard', districts: 'Palghar' },
    { label: 'Raigad coastal talukas', districts: 'Raigad' },
    { label: 'Ratnagiri–Sindhudurg', districts: 'Ratnagiri, Sindhudurg' },
  ],
  PNE: [
    { label: 'Pune metro hinterland', districts: 'Pune' },
    { label: 'Satara–western talukas', districts: 'Satara' },
    { label: 'Sangli–Kolhapur', districts: 'Sangli, Kolhapur' },
    { label: 'Solapur', districts: 'Solapur' },
  ],
  NSK: [
    { label: 'Nashik', districts: 'Nashik' },
    { label: 'Ahmednagar', districts: 'Ahmednagar' },
    { label: 'Jalgaon', districts: 'Jalgaon' },
    { label: 'Dhule–Nandurbar', districts: 'Dhule, Nandurbar' },
  ],
  CSN: [
    { label: 'Chhatrapati Sambhajinagar core', districts: 'Chhatrapati Sambhajinagar (Aurangabad)' },
    { label: 'Jalna–Parbhani', districts: 'Jalna, Parbhani' },
    { label: 'Beed–Dharashiv', districts: 'Beed, Dharashiv (Osmanabad)' },
    { label: 'Latur–Nanded–Hingoli', districts: 'Latur, Nanded, Hingoli' },
  ],
  AMR: [
    { label: 'Amravati–Akola', districts: 'Amravati, Akola' },
    { label: 'Buldhana', districts: 'Buldhana' },
    { label: 'Yavatmal', districts: 'Yavatmal' },
    { label: 'Washim', districts: 'Washim' },
  ],
  NGP: [
    { label: 'Nagpur–Wardha', districts: 'Nagpur, Wardha' },
    { label: 'Bhandara–Gondia', districts: 'Bhandara, Gondia' },
    { label: 'Chandrapur', districts: 'Chandrapur' },
    { label: 'Gadchiroli', districts: 'Gadchiroli' },
  ],
};

function hashCode(str) {
  let h = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalize DIV-KKN → KKN */
export function bareDivisionCode(code) {
  if (!code) return '';
  const s = String(code);
  return s.replace(/^DIV-/i, '');
}

export function resolveDivisionKey(matrixRow, props) {
  return bareDivisionCode(matrixRow?.code || props?.code) || matrixRow?.division || props?.name || '';
}

/**
 * @param {object} opts
 * @param {string} opts.key - matrix code or name slug
 * @param {object} opts.props - GeoJSON feature properties
 * @param {object|null} opts.row - DIVISION_MATRIX row
 */
export function buildDivisionIntelSnapshot({ key, props, row }) {
  const seed = hashCode(key || props?.name || 'MH');
  const rnd = mulberry32(seed);
  const pen = props?.schemePenetration ?? row?.disbursedPct ?? 72;
  const ndvi = props?.ndviStress ?? 35;
  const griv = props?.grievanceIdx ?? 22;

  const eligible = 62000 + (seed % 78000);
  const applied = Math.max(0, Math.min(eligible, Math.round((eligible * pen) / 100)));
  const gap = Math.max(0, eligible - applied);

  const pieAwareness = 18 + Math.floor(rnd() * 16);
  const pieBank = 14 + Math.floor(rnd() * 12);
  const pieLand = 12 + Math.floor(rnd() * 14);
  const pieDigital = 10 + Math.floor(rnd() * 10);
  const pieCamp = Math.max(8, 100 - pieAwareness - pieBank - pieLand - pieDigital);

  const regPie = {
    labels: ['Awareness / outreach gap', 'Bank / KYC friction', '7/12 · land record', 'Digital / connectivity', 'Camp timing / mobility'],
    data: [pieAwareness, pieBank, pieLand, pieDigital, pieCamp],
    colors: ['#1a365d', '#396940', '#b45309', '#7c3aed', '#be123c'],
  };

  const plotsWatch = 4200 + (seed % 19000);
  const baselineDelta = (ndvi / 10 + rnd() * 4).toFixed(1);
  const sentinelH = 8 + (seed % 30);

  const stressPie = {
    labels: ['Soil moisture deficit', 'Pest / disease pressure', 'Hail / wind events', 'Irrigation lag', 'Other'],
    data: [32 + (seed % 18), 18 + (seed % 12), 12 + (seed % 10), 14 + (seed % 8), 10 + (seed % 6)],
    colors: ['#b91c1c', '#c2410c', '#ca8a04', '#0369a1', '#64748b'],
  };

  const officers = [
    {
      name: 'AO · ' + (row?.division || props?.name || 'Division') + ' (West cluster)',
      penetrationRank: 1 + (seed % 4),
      clearancePct: 72 + (seed % 22),
      openGrievances: 40 + (seed % 120),
    },
    {
      name: 'TAO · Central cluster',
      penetrationRank: 1 + ((seed * 3) % 5),
      clearancePct: 65 + ((seed * 2) % 25),
      openGrievances: 55 + ((seed * 5) % 90),
    },
    {
      name: 'Krishi Sahayak · Field desk',
      penetrationRank: 2 + ((seed * 7) % 4),
      clearancePct: 58 + ((seed * 11) % 30),
      openGrievances: 30 + ((seed * 13) % 70),
    },
  ];

  return {
    key,
    eligible,
    applied,
    uptakePct: pen,
    gap,
    regPie,
    ndviStress: ndvi,
    plotsWatch,
    baselineDelta,
    sentinelH,
    stressPie,
    grievanceIdx: griv,
    officers,
    medianPeerPen: 74 + (seed % 8),
  };
}

/**
 * Analysis-page-only datasets (not shown on the command map).
 * @param {{ key: string, divisionCode: string, divisionName: string }} opts
 */
export function buildDeepAnalysisBundle({ key, divisionCode, divisionName }) {
  const code = bareDivisionCode(divisionCode) || 'PNE';
  const seed = hashCode(`${key}|deep`);
  const rnd = mulberry32(seed);

  const uptakeTpl = UPTAKE_PLANNING_BLOCKS[code] || UPTAKE_PLANNING_BLOCKS.PNE;
  const talukaPen = uptakeTpl.map((tpl, idx) => {
    const r = mulberry32(seed + idx * 17 + 3);
    return {
      label: tpl.label,
      districts: tpl.districts,
      penetration: 52 + Math.floor(r() * 38),
      gapK: 0.8 + r() * 4.2,
    };
  });

  const schemePortfolio = [
    { scheme: 'PM-KISAN', sharePct: 22 + (seed % 12), backlogK: Math.floor(rnd() * 8) },
    { scheme: 'PMFBY — Kharif', sharePct: 28 + (seed % 10), backlogK: Math.floor(rnd() * 12) },
    { scheme: 'Mechanization', sharePct: 8 + (seed % 6), backlogK: Math.floor(rnd() * 4) },
    { scheme: 'Soil health / micro-irrigation', sharePct: 12 + (seed % 8), backlogK: Math.floor(rnd() * 6) },
    { scheme: 'State top-up / allied', sharePct: 10 + (seed % 7), backlogK: Math.floor(rnd() * 5) },
  ];

  const zonesTpl = NDVI_MONITORING_ZONES[code] || NDVI_MONITORING_ZONES.PNE;
  const ndviZones = zonesTpl.map((tpl, idx) => {
    const r = mulberry32(seed + idx * 41 + 7);
    return {
      zone: tpl.label,
      districts: tpl.districts,
      deskNote: tpl.deskNote,
      stress: 22 + Math.floor(r() * 58),
      hectares: Math.floor(8000 + r() * 42000),
    };
  });

  const grievanceTopicPie = {
    labels: ['SLA >30d', 'Data / Aadhaar mismatch', 'DBT / bank return', 'Land · crop dispute', 'Portal / camp UX'],
    data: [
      12 + Math.floor(rnd() * 14),
      10 + Math.floor(rnd() * 12),
      14 + Math.floor(rnd() * 10),
      11 + Math.floor(rnd() * 9),
      8 + Math.floor(rnd() * 8),
    ],
    colors: ['#7f1d1d', '#9a3412', '#854d0e', '#1e3a8a', '#52525b'],
  };

  const slaBands = [
    { band: '0–7d', count: 120 + Math.floor(rnd() * 80), pct: 28 + (seed % 8) },
    { band: '8–30d', count: 90 + Math.floor(rnd() * 60), pct: 22 + (seed % 6) },
    { band: '31–60d', count: 55 + Math.floor(rnd() * 40), pct: 18 + (seed % 5) },
    { band: '>60d', count: 35 + Math.floor(rnd() * 30), pct: 12 + (seed % 6) },
  ];

  return {
    talukaPen,
    schemePortfolio,
    ndviZones,
    grievanceTopicPie,
    slaBands,
  };
}

export const PIE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, font: { size: 10 } },
    },
  },
};
