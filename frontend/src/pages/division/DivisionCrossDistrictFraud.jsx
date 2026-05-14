import React, { useCallback, useState } from 'react';
import './DivisionCrossDistrictFraud.css';

/** District concentration strip (Pune division cluster). Intensity 1–5 = relative load from mock alerts + claims. */
const DISTRICT_HEAT = [
  { name: 'Pune', intensity: 5, alerts: 42, claims: 158 },
  { name: 'Solapur', intensity: 5, alerts: 51, claims: 176 },
  { name: 'Satara', intensity: 4, alerts: 28, claims: 94 },
  { name: 'Sangli', intensity: 4, alerts: 31, claims: 88 },
  { name: 'Kolhapur', intensity: 3, alerts: 19, claims: 62 },
];

const KPI_CARDS = [
  { key: 'high', label: 'High Risk Cases', value: '12', icon: 'warning' },
  { key: 'susp', label: 'Suspicious Claims', value: '485', icon: 'receipt_long' },
  { key: 'dist', label: 'Districts Affected', value: '5', icon: 'map' },
  { key: 'exp', label: 'Estimated Exposure', value: '₹4.8 Cr', icon: 'account_balance' },
];

/** Rich hero payload for the dominant Hover Analytics card (demo, deterministic). */
const heroPayload = ({
  key,
  titleUpper,
  rows,
  zone = null,
  exposure = null,
  period = 'Last 14 days',
  bars,
}) => ({
  key,
  titleUpper,
  rows,
  zone,
  exposure,
  period,
  bars,
});

const districtHoverPayload = (d) => {
  const ai = Math.min(97, 72 + d.intensity * 5);
  const overlap = Math.min(96, 58 + d.intensity * 7);
  return heroPayload({
    key: `dist-${d.name}`,
    titleUpper: `DISTRICT · ${d.name.toUpperCase()}`,
    rows: [
      { label: 'Linked records', value: String(28 + d.alerts) },
      { label: 'Affected villages', value: String(5 + d.intensity * 2) },
      { label: 'Cross-taluka matches', value: String(11 + d.intensity * 3) },
      { label: 'Avg claimed area', value: `${(1.2 + d.intensity * 0.35).toFixed(1)} acres` },
      { label: 'AI similarity score', value: `${ai}%` },
    ],
    zone: `${d.name} peri-urban · co-op belt`,
    exposure: `₹${(0.18 + d.intensity * 0.09).toFixed(2)} Cr`,
    period: 'Last 14 days',
    bars: [
      { label: 'Load intensity', pct: ai },
      { label: 'Village overlap', pct: overlap },
    ],
  });
};

const severityHoverPayload = (sev) => {
  const ai = sev === 'P1' ? 91 : sev === 'P2' ? 84 : 76;
  const overlap = sev === 'P1' ? 88 : 71;
  const band = sev === 'P1' ? 'P1 CRITICAL' : sev === 'P2' ? 'P2 ELEVATED' : 'P3 ROUTINE';
  return heroPayload({
    key: `sev-${sev}`,
    titleUpper: `FRAUD BAND · ${band}`,
    rows: [
      { label: 'Open in queue', value: sev === 'P1' ? '38' : sev === 'P2' ? '52' : '19' },
      { label: 'Cross-district links', value: sev === 'P1' ? '14' : '9' },
      { label: 'Avg review time', value: sev === 'P1' ? '1.2 d' : '2.4 d' },
      { label: 'DAO escalations', value: sev === 'P1' ? '6' : '3' },
      { label: 'AI similarity score', value: `${ai}%` },
    ],
    zone: sev === 'P1' ? 'Pune · Solapur pressure arc' : 'Division-wide watchlist',
    exposure: `₹${sev === 'P1' ? '1.9' : '0.8'} Cr`,
    period: 'Last 14 days',
    bars: [
      { label: 'Desk pressure', pct: ai },
      { label: 'Linkage density', pct: overlap },
    ],
  });
};

const schemeHoverPayload = (scheme) => {
  const ai = 80 + (scheme.length % 15);
  const overlap = 62 + (scheme.length % 28);
  if (scheme === 'PMFBY') {
    return heroPayload({
      key: 'scheme-PMFBY',
      titleUpper: 'PMFBY GPS REUSE',
      rows: [
        { label: 'Repeated GPS clusters', value: '17' },
        { label: 'Linked villages', value: '9' },
        { label: 'Cross-taluka matches', value: '14' },
        { label: 'AI similarity score', value: '93%' },
      ],
      zone: 'Madha · Sangola belt',
      exposure: '₹0.55 Cr',
      period: 'Last 14 days',
      bars: [
        { label: 'GPS reuse intensity', pct: 93 },
        { label: 'Village overlap', pct: 74 },
      ],
    });
  }
  return heroPayload({
    key: `scheme-${scheme}`,
    titleUpper: `${scheme.toUpperCase()} · SCHEME LENS`,
    rows: [
      { label: 'Linked records', value: String(22 + scheme.length * 2) },
      { label: 'Affected villages', value: String(8 + (scheme.length % 7)) },
      { label: 'Avg claimed area', value: `${(2.1 + (scheme.length % 5) * 0.2).toFixed(1)} acres` },
      { label: 'AI similarity score', value: `${ai}%` },
    ],
    zone: 'Satara · Sangli corridor',
    exposure: `₹${(0.22 + (scheme.length % 9) / 10).toFixed(2)} Cr`,
    period: 'Last 14 days',
    bars: [
      { label: 'Scheme risk index', pct: ai },
      { label: 'Document reuse', pct: overlap },
    ],
  });
};

const dealerHoverPayload = (dealer, schemeShort) => {
  const ai = 88 + (schemeShort.length % 8);
  const overlap = 70 + (dealer.length % 22);
  return heroPayload({
    key: `dealer-${dealer}`,
    titleUpper: `DEALER · ${dealer.toUpperCase()}`,
    rows: [
      { label: 'Linked records', value: String(18 + dealer.length) },
      { label: 'Invoice burst (7d)', value: String(4 + (dealer.length % 5)) },
      { label: 'District overlap', value: String(2 + (dealer.length % 3)) },
      { label: 'AI similarity score', value: `${ai}%` },
    ],
    zone: 'Barshi · Pune invoice ring',
    exposure: `₹${(0.35 + (dealer.length % 6) / 10).toFixed(2)} Cr`,
    period: 'Last 14 days',
    bars: [
      { label: 'Dealer concentration', pct: ai },
      { label: 'Serial invoice risk', pct: overlap },
    ],
  });
};

const rowHoverPayload = (c) => {
  const ai = c.confidence;
  const overlap = Math.min(95, 58 + c.linked.length * 6);
  if (c.id === 'c4') {
    return heroPayload({
      key: `row-${c.id}`,
      titleUpper: 'PMFBY GPS REUSE',
      rows: [
        { label: 'Repeated GPS clusters', value: '17' },
        { label: 'Linked villages', value: '9' },
        { label: 'Cross-taluka matches', value: '14' },
        { label: 'AI similarity score', value: `${c.confidence}%` },
      ],
      zone: 'Madha · Sangola belt',
      exposure: `₹${c.exposureCr} Cr`,
      period: 'Last 14 days',
      bars: [
        { label: 'GPS reuse intensity', pct: 93 },
        { label: 'Village overlap', pct: 74 },
      ],
    });
  }
  return heroPayload({
    key: `row-${c.id}`,
    titleUpper: `${c.hoverTheme.toUpperCase()} · CASE`,
    rows: [
      { label: 'Linked records', value: String(36 + c.linked.length * 4) },
      { label: 'Affected villages', value: String(9 + c.linked.length * 2) },
      { label: 'Cross-taluka matches', value: String(10 + c.linked.length * 3) },
      { label: 'Avg claimed area', value: `${(2.4 + c.exposureCr).toFixed(1)} acres` },
      { label: 'AI similarity score', value: `${ai}%` },
    ],
    zone: `${c.districts[0]} · ${c.districts[1] || c.districts[0]} belt`,
    exposure: `₹${c.exposureCr} Cr`,
    period: 'Last 14 days',
    bars: [
      { label: 'Signal intensity', pct: ai },
      { label: 'Village overlap', pct: overlap },
    ],
  });
};

const statusHoverPayload = (c) => {
  const ai = c.confidence;
  return heroPayload({
    key: `status-${c.id}`,
    titleUpper: `WORKFLOW · ${c.status.toUpperCase()}`,
    rows: [
      { label: 'Cases in stage', value: String(12 + c.linked.length) },
      { label: 'Avg dwell', value: '1.8 d' },
      { label: 'DAO touchpoints', value: String(2 + (c.status.length % 4)) },
      { label: 'AI similarity score', value: `${ai}%` },
    ],
    zone: 'DAO cluster · Pune division',
    exposure: `₹${c.exposureCr} Cr`,
    period: 'Last 14 days',
    bars: [
      { label: 'Queue pressure', pct: Math.min(94, 62 + c.status.length) },
      { label: 'SLA tightness', pct: 68 },
    ],
  });
};

/**
 * Investigation cards — Maharashtra agri subsidy context only.
 */
const FRAUD_CASES = [
  {
    id: 'c1',
    severity: 'P1',
    schemeTag: 'Tractor Subsidy',
    dealerTag: 'Mahalakshmi Agro Barshi',
    hoverTheme: 'Invoice reuse',
    title: 'Tractor subsidy — same invoice reused across districts',
    districts: ['Pune', 'Satara', 'Solapur'],
    narrative:
      'Same chassis number and dealer tax invoice PDF attached to multiple Farm Mechanization (tractor) subsidy claims. Dealer and invoice timestamps do not align with field verification dates.',
    whyFlagged: [
      'Same chassis number on RC and invoice',
      'Invoice PDF byte-identical across three DAO uploads',
      'Dealer (Mahalakshmi Agro Barshi) named on claims in different districts',
    ],
    confidence: 96,
    exposureCr: 2.4,
    status: 'Under Verification',
    linked: [
      { farmer: 'Nishant Gadsing', scheme: 'Tractor Subsidy', district: 'Pune', match: 'Same chassis MH-19-TR-8841' },
      { farmer: 'Jalinder Padule', scheme: 'Tractor Subsidy', district: 'Satara', match: 'Same invoice PDF hash' },
      { farmer: 'Ravindra Padule', scheme: 'Tractor Subsidy', district: 'Solapur', match: 'Dealer overlap · invoice reuse' },
      { farmer: 'Shivaji Munde', scheme: 'Farm Mechanization', district: 'Solapur', match: 'RC area vs invoice mismatch' },
    ],
  },
  {
    id: 'c2',
    severity: 'P1',
    schemeTag: 'PM-KISAN',
    dealerTag: null,
    hoverTheme: 'Aadhaar cluster',
    title: 'PM-KISAN — shared mobile and masked Aadhaar tail cluster',
    districts: ['Solapur', 'Sangli', 'Kolhapur'],
    narrative:
      'Several PM-KISAN beneficiary records show one registered mobile number across households, with repeating last-four Aadhaar pattern and inactive Aadhaar seeding failures at bank NPCI.',
    whyFlagged: [
      'Same mobile on multiple beneficiary IDs',
      'Masked Aadhaar tail repeats across unrelated khata numbers',
      'Bank mapping error spike for same IFSC branch',
    ],
    confidence: 91,
    exposureCr: 1.1,
    status: 'AI Flagged Today',
    linked: [
      { farmer: 'Sunita Jadhav', scheme: 'PM-KISAN', district: 'Solapur', match: 'Shared mobile · Madha taluka' },
      { farmer: 'Popat Shinde', scheme: 'PM-KISAN', district: 'Sangli', match: 'Same Aadhaar tail · different farmer name' },
      { farmer: 'Anil Khot', scheme: 'PM-KISAN', district: 'Kolhapur', match: 'Inactive Aadhaar · repeat NPCI reject' },
    ],
  },
  {
    id: 'c3',
    severity: 'P2',
    schemeTag: 'Drip Irrigation',
    dealerTag: 'Sai Irrigation Pune',
    hoverTheme: 'Dealer burst',
    title: 'Drip irrigation — dealer invoice burst in one window',
    districts: ['Solapur', 'Pune'],
    narrative:
      'Sai Irrigation Pune issued identical line-item invoices for drip laterals; twelve claims filed within 36 hours using the same PDF from AgroCare Solapur counter series.',
    whyFlagged: [
      'Invoice serial gap inconsistent with stock dispatch',
      'Burst submissions from adjacent villages',
      'Land area on 7/12 does not match billed lateral length',
    ],
    confidence: 88,
    exposureCr: 0.62,
    status: 'Sent to DAO',
    linked: [
      { farmer: 'Bhausaheb Patil', scheme: 'Drip Irrigation', district: 'Solapur', match: 'Invoice PDF reused' },
      { farmer: 'Kisan Thorat', scheme: 'Drip Irrigation', district: 'Solapur', match: 'Same dealer · same invoice no.' },
      { farmer: 'Dnyaneshwar Raut', scheme: 'Drip Irrigation', district: 'Pune', match: 'Land area vs billed qty' },
    ],
  },
  {
    id: 'c4',
    severity: 'P1',
    schemeTag: 'PMFBY',
    dealerTag: null,
    hoverTheme: 'Survey overlap',
    title: 'PMFBY — same geotagged crop-loss photo across villages',
    districts: ['Satara', 'Pune', 'Sangli'],
    narrative:
      'Kharif soybean loss intimation photos carry identical GPS coordinates and file hash though village names differ; survey numbers on attached 7/12 excerpts do not match village cadastre.',
    whyFlagged: [
      'Same GPS coordinates on loss photos',
      'Duplicate image hash in PMFBY upload bundle',
      'Survey number not found in village FMB',
    ],
    confidence: 93,
    exposureCr: 0.55,
    status: 'Under Verification',
    linked: [
      { farmer: 'Rahul Kadam', scheme: 'PMFBY', district: 'Satara', match: 'GPS reused · photo hash match' },
      { farmer: 'Vaishali Shinde', scheme: 'PMFBY', district: 'Pune', match: 'Same image · different village code' },
      { farmer: 'Ganesh Mane', scheme: 'PMFBY', district: 'Sangli', match: 'Survey no. not in FMB' },
    ],
  },
  {
    id: 'c5',
    severity: 'P3',
    schemeTag: 'Soyabean Compensation',
    dealerTag: null,
    hoverTheme: 'Survey overlap',
    title: 'Soyabean compensation — overlapping survey numbers on relief list',
    districts: ['Kolhapur', 'Sangli'],
    narrative:
      'Relief survey list for soyabean weather loss shows duplicate survey numbers mapped to two different farmer names; khata continuity broken in one case; amounts within single-taluka reconciliation.',
    whyFlagged: [
      'Duplicate survey number on compensation sheet',
      'Khata number reused after name change window',
      'Adjacent parcel overlap in manual survey sketch',
    ],
    confidence: 74,
    exposureCr: 0.13,
    status: 'Closed',
    linked: [
      { farmer: 'Subhash Patil', scheme: 'Soyabean Compensation', district: 'Kolhapur', match: 'Duplicate survey no.' },
      { farmer: 'Laxmi Powar', scheme: 'Soyabean Compensation', district: 'Sangli', match: 'Khata overlap · same survey block' },
    ],
  },
];

const TREND_ROWS = [
  { label: 'Invoice reuse', dir: 'up', strength: 0.78 },
  { label: 'GPS reuse', dir: 'up2', strength: 0.92 },
  { label: 'Aadhaar clusters', dir: 'flat', strength: 0.55 },
  { label: 'Survey overlap', dir: 'up', strength: 0.68 },
];

const sevClass = (s) => (s === 'P1' ? 'fi-sev--p1' : s === 'P2' ? 'fi-sev--p2' : 'fi-sev--p3');

const trendArrow = (dir) => {
  if (dir === 'up2') return '↑↑';
  if (dir === 'up') return '↑';
  if (dir === 'down') return '↓';
  return '→';
};

const DivisionCrossDistrictFraud = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [hoverPayload, setHoverPayload] = useState(null);

  const setHover = useCallback((payload) => {
    setHoverPayload(payload);
  }, []);

  const clearHover = useCallback(() => {
    setHoverPayload(null);
  }, []);

  const toggleCase = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fi-page">
      <div className="fi-inner fi-inner--split">
        <h1 className="fi-title">AI Cross-District Fraud Intelligence</h1>
        <p className="fi-sub">
          AI-detected linked subsidy anomalies across Maharashtra districts.
        </p>

        <div className="fi-kpis" role="list">
          {KPI_CARDS.map((k) => (
            <div key={k.key} className="fi-kpi" role="listitem">
              <div className="fi-kpi__icon" aria-hidden>
                <span className="material-symbols-outlined">{k.icon}</span>
              </div>
              <div>
                <div className="fi-kpi__value">{k.value}</div>
                <div className="fi-kpi__label">{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        <section className="fi-heat" aria-labelledby="fi-heat-title">
          <div className="fi-heat__head">
            <h2 id="fi-heat-title" className="fi-heat__title">
              District concentration (suspicious claims · AI alerts)
            </h2>
            <span className="fi-heat__hint">Pune division cluster — illustrative counts for desk review</span>
          </div>
          <div className="fi-heat__row">
            {DISTRICT_HEAT.map((d) => (
              <div
                key={d.name}
                className="fi-heat__cell fi-hover-target"
                data-intensity={d.intensity}
                title={`${d.name}: ${d.alerts} AI alerts · ${d.claims} suspicious claims (demo)`}
                onMouseEnter={() => setHover(districtHoverPayload(d))}
                onMouseLeave={clearHover}
                onFocus={() => setHover(districtHoverPayload(d))}
                onBlur={clearHover}
                tabIndex={0}
                role="group"
              >
                <span className="fi-heat__name">{d.name}</span>
                <span className="fi-heat__meta">{d.alerts} alerts · {d.claims} claims</span>
              </div>
            ))}
          </div>
          <div className="fi-heat__legend" aria-hidden>
            <span>Low risk</span>
            <span className="fi-heat__segments">
              <span className="fi-heat__seg fi-heat__seg--1" />
              <span className="fi-heat__seg fi-heat__seg--3" />
              <span className="fi-heat__seg fi-heat__seg--5" />
            </span>
            <span>High risk</span>
          </div>
        </section>

        <div className="fi-split">
          <div className="fi-feed">
            <p className="fi-feed__kicker">AI fraud feed</p>
            <p className="fi-feed__hint">Click a card to expand. Hover districts, tags, schemes, or dealers — analytics update on the right.</p>
            {FRAUD_CASES.map((c) => {
              const open = expandedId === c.id;
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  data-expanded={open}
                  className={`fi-case ${open ? 'fi-case--open' : 'fi-case--collapsed'}`}
                  onClick={() => toggleCase(c.id)}
                  onMouseEnter={() => setHover(rowHoverPayload(c))}
                  onMouseLeave={clearHover}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCase(c.id);
                    }
                  }}
                >
                  <div className="fi-case__summary">
                    <div className="fi-case__summary-main">
                      <div className="fi-case__top">
                        <span
                          className={`fi-sev fi-hover-target ${sevClass(c.severity)}`}
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHover(severityHoverPayload(c.severity));
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHover(rowHoverPayload(c));
                          }}
                        >
                          {c.severity}
                        </span>
                        <span
                          className="fi-status fi-hover-target"
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHover(statusHoverPayload(c));
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHover(rowHoverPayload(c));
                          }}
                        >
                          {c.status}
                        </span>
                      </div>
                      <h3 className="fi-case__title">{c.title}</h3>
                      <div className="fi-case__scheme-row">
                        <span
                          className="fi-scheme-tag fi-hover-target"
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHover(schemeHoverPayload(c.schemeTag));
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHover(rowHoverPayload(c));
                          }}
                        >
                          {c.schemeTag}
                        </span>
                      </div>
                      <div className="fi-case__districts">
                        {c.districts.map((name, i) => (
                          <span key={name}>
                            {i > 0 ? ' · ' : ''}
                            <span
                              className="fi-district-tag fi-hover-target"
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                const d = DISTRICT_HEAT.find((x) => x.name === name);
                                setHover(d ? districtHoverPayload(d) : districtHoverPayload({ name, intensity: 3, alerts: 30, claims: 90 }));
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                setHover(rowHoverPayload(c));
                              }}
                            >
                              {name}
                            </span>
                          </span>
                        ))}
                      </div>
                      {!open && (
                        <p className="fi-case__peek">
                          AI confidence {c.confidence}% · Exposure ₹{c.exposureCr} Cr · {c.linked.length} linked applications
                        </p>
                      )}
                    </div>
                    <span className="fi-case__chev material-symbols-outlined" aria-hidden>expand_more</span>
                  </div>
                  {open && (
                    <div className="fi-case__body" onClick={(e) => e.stopPropagation()}>
                      <p className="fi-case__narr">{c.narrative}</p>
                      {c.dealerTag ? (
                        <p className="fi-case__dealer-line">
                          <span className="fi-case__dealer-k">Dealer</span>
                          <span
                            className="fi-dealer-tag fi-hover-target"
                            onMouseEnter={() => setHover(dealerHoverPayload(c.dealerTag, c.schemeTag))}
                            onMouseLeave={() => setHover(rowHoverPayload(c))}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.dealerTag}
                          </span>
                        </p>
                      ) : null}
                      <div className="fi-case__why-label">Why flagged</div>
                      <ul className="fi-case__why">
                        {c.whyFlagged.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                      <div className="fi-case__foot">
                        <span>AI confidence: <strong>{c.confidence}%</strong></span>
                        <span>Exposure: <strong>₹{c.exposureCr} Cr</strong></span>
                      </div>
                      <div className="fi-case__linked-mini" aria-label="Linked applications summary">
                        <div className="fi-case__linked-mini-head">Linked applications ({c.linked.length})</div>
                        <ul className="fi-case__linked-mini-list">
                          {c.linked.map((row) => (
                            <li key={`${c.id}-${row.farmer}-${row.match}`}>
                              <span className="fi-case__linked-name">{row.farmer}</span>
                              <span className="fi-case__linked-meta">{row.scheme} · {row.district}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <aside className="fi-rail fi-rail--intel" aria-label="Intelligence sidebar">
            <div className="fi-rail__stack fi-rail__stack--float">
              <section
                className={`fi-intel-card fi-intel-card--hero ${hoverPayload ? 'fi-intel-card--hero-live' : 'fi-intel-card--hero-idle'}`}
                aria-labelledby="fi-hover-title"
              >
                <h2 id="fi-hover-title" className="fi-intel-card__title fi-intel-card__title--hero">Hover analytics</h2>
                <div className="fi-hero-analytics" key={hoverPayload?.key ?? 'idle'}>
                  {!hoverPayload ? (
                    <div className="fi-hero-analytics__idle">
                      <p className="fi-hero-analytics__placeholder">
                        Hover over a district, fraud tag, scheme, or dealer to view analytics.
                      </p>
                      <div className="fi-hero-analytics__idle-bars" aria-hidden>
                        <div className="fi-hero-microbar fi-hero-microbar--ghost"><span /></div>
                        <div className="fi-hero-microbar fi-hero-microbar--ghost"><span /></div>
                        <div className="fi-hero-activity" />
                      </div>
                    </div>
                  ) : (
                    <div className="fi-hero-analytics__live">
                      <p className="fi-hero-analytics__eyebrow">Hovering</p>
                      <p className="fi-hero-analytics__headline">{hoverPayload.titleUpper}</p>
                      <dl className="fi-hero-analytics__dl">
                        {hoverPayload.rows.map((r) => (
                          <div key={r.label} className="fi-hero-analytics__row">
                            <dt>{r.label}</dt>
                            <dd>{r.value}</dd>
                          </div>
                        ))}
                      </dl>
                      {hoverPayload.zone ? (
                        <div className="fi-hero-analytics__zone">
                          <span className="fi-hero-analytics__zone-k">Highest duplication zone</span>
                          <span className="fi-hero-analytics__zone-v">{hoverPayload.zone}</span>
                        </div>
                      ) : null}
                      <div className="fi-hero-analytics__foot">
                        <div>
                          <span className="fi-hero-analytics__foot-k">Exposure linked</span>
                          <span className="fi-hero-analytics__foot-v">{hoverPayload.exposure}</span>
                        </div>
                        <div>
                          <span className="fi-hero-analytics__foot-k">Most active period</span>
                          <span className="fi-hero-analytics__foot-v">{hoverPayload.period}</span>
                        </div>
                      </div>
                      <div className="fi-hero-bars" aria-hidden>
                        {hoverPayload.bars.map((b) => (
                          <div key={b.label} className="fi-hero-bar">
                            <div className="fi-hero-bar__top">
                              <span className="fi-hero-bar__label">{b.label}</span>
                              <span className="fi-hero-bar__pct">{b.pct}%</span>
                            </div>
                            <div className="fi-hero-bar__track">
                              <span className="fi-hero-bar__fill" style={{ width: `${b.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="fi-intel-card fi-intel-card--insight" aria-labelledby="fi-insight-title">
                <h2 id="fi-insight-title" className="fi-intel-card__title">AI insight</h2>
                <p className="fi-intel-card__lead">
                  <strong className="fi-intel-card__pct">84%</strong>
                  {' '}
                  <span className="fi-intel-card__lead-muted">of high-risk alerts are linked to:</span>
                </p>
                <ul className="fi-intel-bullets">
                  <li>PMFBY soyabean claims</li>
                  <li>repeated survey clusters</li>
                  <li>invoice reuse patterns</li>
                </ul>
              </section>

              <section className="fi-intel-card fi-intel-card--trend" aria-labelledby="fi-trend-title">
                <h2 id="fi-trend-title" className="fi-intel-card__title">Fraud trend</h2>
                <ul className="fi-trend-list">
                  {TREND_ROWS.map((row) => (
                    <li key={row.label} className="fi-trend-row">
                      <div className="fi-trend-row__label">
                        <span className="fi-trend-row__name">{row.label}</span>
                        <span className="fi-trend-row__arrow" aria-hidden>{trendArrow(row.dir)}</span>
                      </div>
                      <div className="fi-trend-row__bar" aria-hidden>
                        <span className="fi-trend-row__fill" style={{ width: `${Math.round(row.strength * 100)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="fi-trend-spark" aria-hidden>
                  <svg className="fi-trend-spark__svg" viewBox="0 0 120 28" preserveAspectRatio="none">
                    <polyline
                      className="fi-trend-spark__line"
                      fill="none"
                      strokeWidth="1.5"
                      points="0,22 18,18 36,20 54,12 72,14 90,8 108,10 120,6"
                    />
                  </svg>
                  <span className="fi-trend-spark__cap">7d composite trend</span>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DivisionCrossDistrictFraud;
