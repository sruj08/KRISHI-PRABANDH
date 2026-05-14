import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

/**
 * Tax invoice PDFs in `frontend/public/CrossDis-Sample` (basename sort order).
 */
const CROSS_DIS_TAX_INVOICES = [
  '/CrossDis-Sample/tax_invoice_akola.pdf',
  '/CrossDis-Sample/tax_invoice_kolha.pdf',
  '/CrossDis-Sample/tax_invoice_Sangli.pdf',
  '/CrossDis-Sample/tax_invoice_sola.pdf',
];

/**
 * Investigation cards — Maharashtra agri subsidy context only.
 */
const FRAUD_CASES = [
  {
    id: 'c1',
    severity: 'P1',
    schemeTag: 'Tractor Subsidy',
    dealerTag: 'Mahalakshmi Agro Barshi',
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
      { farmer: 'Mr. Mahesh Ram Gaikwad', scheme: 'Tractor Subsidy', district: 'Pune', match: 'Same chassis MH-19-TR-8841', taxInvoice: CROSS_DIS_TAX_INVOICES[0] },
      { farmer: 'Mr. Pravin Sachin Chavan', scheme: 'Tractor Subsidy', district: 'Satara', match: 'Same invoice PDF hash', taxInvoice: CROSS_DIS_TAX_INVOICES[1] },
      { farmer: 'Mr. Ramesh Sudeep Deshpande', scheme: 'Tractor Subsidy', district: 'Solapur', match: 'Dealer overlap · invoice reuse', taxInvoice: CROSS_DIS_TAX_INVOICES[2] },
      { farmer: 'Mr. Suresh Dnyandev Patil', scheme: 'Farm Mechanization', district: 'Solapur', match: 'RC area vs invoice mismatch', taxInvoice: CROSS_DIS_TAX_INVOICES[3] },
    ],
  },
  {
    id: 'c2',
    severity: 'P1',
    schemeTag: 'PM-KISAN',
    dealerTag: null,
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

const RISK_BAND = ['Low', 'Low–med', 'Medium', 'High', 'Critical'];

const districtCrispRows = (d) => [
  { label: 'AI alerts', value: String(d.alerts) },
  { label: 'Suspicious claims', value: String(d.claims) },
  { label: 'Risk band', value: RISK_BAND[d.intensity - 1] ?? '—' },
];

const schemeCrispRows = (scheme) => {
  const uptake = 65 + (scheme.length * 3) % 28;
  const pending = 120 + scheme.length * 7;
  return [
    { label: 'Scheme uptake', value: `${uptake}%` },
    { label: 'Pending files', value: String(pending) },
  ];
};

const severityCrispRows = (sev) => {
  const q = sev === 'P1' ? '38' : sev === 'P2' ? '52' : '19';
  return [
    { label: 'Open in queue', value: q },
    { label: 'Band', value: sev },
  ];
};

const statusCrispRows = (c) => [
  { label: 'Stage dwell (avg)', value: '1.8 d' },
  { label: 'DAO touchpoints', value: String(2 + (c.status.length % 4)) },
];

const dealerCrispRows = (dealer) => [
  { label: 'Linked cases (demo)', value: String(3 + (dealer.length % 5)) },
  { label: 'Invoice burst (7d)', value: String(4 + (dealer.length % 3)) },
];

const caseCrispRows = (c) => [
  { label: 'Confidence', value: `${c.confidence}%` },
  { label: 'Exposure', value: `₹${c.exposureCr} Cr` },
  { label: 'Linked files', value: String(c.linked.length) },
];

const kpiCrispRows = (k) => {
  if (k.key === 'high') {
    return [
      { label: 'Desk queue', value: '38' },
      { label: 'SLA risk', value: '12%' },
    ];
  }
  if (k.key === 'susp') {
    return [
      { label: 'Verified share', value: '61%' },
      { label: 'DAO backlog', value: '214' },
    ];
  }
  if (k.key === 'dist') {
    return [
      { label: 'Hot districts', value: '5' },
      { label: 'Cross-links', value: '27' },
    ];
  }
  return [
    { label: 'Recoverable (est.)', value: '₹1.1 Cr' },
    { label: 'Under review', value: '₹2.4 Cr' },
  ];
};

const TIP_BOX_W = 216;
const TIP_BOX_H = 148;

/** Place tooltip near pointer; flip when near viewport edges (fixed estimate size for clamp). */
const clampTipNearPointer = (clientX, clientY) => {
  const gap = 16;
  const edge = 10;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  let x = clientX + gap;
  let y = clientY + gap;
  if (x + TIP_BOX_W > vw - edge) x = clientX - TIP_BOX_W - gap;
  if (y + TIP_BOX_H > vh - edge) y = clientY - TIP_BOX_H - gap;
  x = Math.max(edge, Math.min(x, vw - TIP_BOX_W - edge));
  y = Math.max(edge, Math.min(y, vh - TIP_BOX_H - edge));
  return { x, y };
};

const trendArrow = (dir) => {
  if (dir === 'up2') return '↑↑';
  if (dir === 'up') return '↑';
  if (dir === 'down') return '↓';
  return '→';
};

const DivisionCrossDistrictFraud = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [tipBody, setTipBody] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const hideTipTimerRef = useRef(null);
  const tipMoveRafRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const heatSectionRef = useRef(null);
  const feedShellRef = useRef(null);

  const hideCrispTip = useCallback(() => {
    if (hideTipTimerRef.current) {
      window.clearTimeout(hideTipTimerRef.current);
    }
    hideTipTimerRef.current = window.setTimeout(() => {
      hideTipTimerRef.current = null;
      setTipBody(null);
    }, 80);
  }, []);

  const showCrispTip = useCallback((e, title, rows) => {
    if (hideTipTimerRef.current) {
      window.clearTimeout(hideTipTimerRef.current);
      hideTipTimerRef.current = null;
    }
    const cx = e.clientX;
    const cy = e.clientY;
    lastPointerRef.current = { x: cx, y: cy };
    setTipBody({
      key: `${title}-${performance.now()}`,
      title,
      rows,
    });
    setTipPos(clampTipNearPointer(cx, cy));
  }, []);

  useEffect(() => {
    if (!tipBody) return undefined;
    const onMove = (ev) => {
      lastPointerRef.current = { x: ev.clientX, y: ev.clientY };
      if (tipMoveRafRef.current) return;
      tipMoveRafRef.current = window.requestAnimationFrame(() => {
        tipMoveRafRef.current = null;
        const { x, y } = lastPointerRef.current;
        setTipPos(clampTipNearPointer(x, y));
      });
    };
    const onReclamp = () => {
      const { x, y } = lastPointerRef.current;
      setTipPos(clampTipNearPointer(x, y));
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', onReclamp, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onReclamp);
      if (tipMoveRafRef.current) {
        window.cancelAnimationFrame(tipMoveRafRef.current);
        tipMoveRafRef.current = null;
      }
    };
  }, [tipBody]);

  useEffect(() => {
    if (!tipBody) return undefined;
    const onScroll = () => setTipBody(null);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [tipBody]);

  /** Sticky intel rail: `top` = max(header band, bottom of district strip). */
  useEffect(() => {
    const heat = heatSectionRef.current;
    const shell = feedShellRef.current;
    if (!heat || !shell) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const minTopPx = 6 * remPx;
      const heatBottom = heat.getBoundingClientRect().bottom;
      const topPx = Math.max(minTopPx, Math.ceil(heatBottom + 8));
      shell.style.setProperty('--fi-hover-sticky-top', `${topPx}px`);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(heat);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      shell.style.removeProperty('--fi-hover-sticky-top');
    };
  }, []);

  const toggleCase = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(
    () => () => {
      if (hideTipTimerRef.current) window.clearTimeout(hideTipTimerRef.current);
    },
    [],
  );

  return (
    <div className="fi-page fi-page--fraud-cloud">
      {tipBody
        ? createPortal(
            <div
              key={tipBody.key}
              className="fi-crisp-tip"
              style={{ transform: `translate3d(${tipPos.x}px, ${tipPos.y}px, 0)` }}
              role="tooltip"
            >
              <div className="fi-crisp-tip__inner">
                <div className="fi-crisp-tip__title">{tipBody.title}</div>
                {tipBody.rows.map((row) => (
                  <React.Fragment key={row.label}>
                    <span className="fi-crisp-tip__k">{row.label}</span>
                    <span className="fi-crisp-tip__v">{row.value}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
      <div className="fi-inner fi-inner--split fi-inner--fraud-wide">
        <h1 className="fi-title">AI Cross-District Fraud Intelligence</h1>
        <p className="fi-sub">
          AI-detected linked subsidy anomalies across Maharashtra districts.
        </p>

        <div className="fi-kpis" role="list">
          {KPI_CARDS.map((k) => (
            <div
              key={k.key}
              className="fi-kpi"
              role="listitem"
              onMouseEnter={(e) => showCrispTip(e, k.label, kpiCrispRows(k))}
              onMouseLeave={hideCrispTip}
            >
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

        <section ref={heatSectionRef} className="fi-heat" aria-labelledby="fi-heat-title">
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
                className="fi-heat__cell fi-heat__cell--tip"
                data-intensity={d.intensity}
                onMouseEnter={(e) => showCrispTip(e, d.name, districtCrispRows(d))}
                onMouseLeave={hideCrispTip}
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

        <div ref={feedShellRef} className="fi-feed-shell">
          <div className="fi-feed fi-feed--full">
            <p className="fi-feed__kicker">Investigation queue</p>
            <p className="fi-feed__hint">Click a row to expand. Hover KPIs, districts, tags, or the summary for desk metrics (follows pointer).</p>
            {FRAUD_CASES.map((c) => {
              const open = expandedId === c.id;
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  data-expanded={open}
                  className={`fi-case fi-case--${c.severity.toLowerCase()} ${open ? 'fi-case--open' : ''}`}
                  onClick={() => toggleCase(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCase(c.id);
                    }
                  }}
                >
                  {/* ── collapsed + open header row ── */}
                  <div
                    className="fi-case__row"
                    onMouseEnter={(e) => showCrispTip(e, 'File summary', caseCrispRows(c))}
                    onMouseLeave={hideCrispTip}
                  >
                    <div className="fi-case__row-main">
                      {/* top meta line */}
                      <div className="fi-case__topline">
                        <span
                          className="fi-case__scheme-text"
                          onMouseEnter={(e) => { e.stopPropagation(); showCrispTip(e, c.schemeTag, schemeCrispRows(c.schemeTag)); }}
                          onMouseLeave={(e) => { e.stopPropagation(); hideCrispTip(); }}
                        >
                          {c.schemeTag}
                        </span>
                        <span className="fi-case__topline-dot" aria-hidden />
                        <span
                          className="fi-case__status-text"
                          onMouseEnter={(e) => { e.stopPropagation(); showCrispTip(e, c.status, statusCrispRows(c)); }}
                          onMouseLeave={(e) => { e.stopPropagation(); hideCrispTip(); }}
                        >
                          {c.status}
                        </span>
                      </div>

                      {/* title */}
                      <h3 className="fi-case__title">{c.title}</h3>

                      {/* districts */}
                      <p className="fi-case__district-line">
                        {c.districts.map((name, i) => (
                          <React.Fragment key={name}>
                            {i > 0 && <span className="fi-case__dist-sep" aria-hidden>·</span>}
                            <span
                              className="fi-case__dist-name"
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                const d = DISTRICT_HEAT.find((x) => x.name === name);
                                showCrispTip(e, name, d ? districtCrispRows(d) : [{ label: 'Claims', value: '90' }]);
                              }}
                              onMouseLeave={(e) => { e.stopPropagation(); hideCrispTip(); }}
                            >
                              {name}
                            </span>
                          </React.Fragment>
                        ))}
                      </p>

                      {/* collapsed metrics strip */}
                      {!open && (
                        <div className="fi-case__metrics">
                          <span className="fi-case__metric">
                            <span className="fi-case__metric-k">Confidence</span>
                            <span className="fi-case__metric-v">{c.confidence}%</span>
                          </span>
                          <span className="fi-case__metric-rule" aria-hidden />
                          <span className="fi-case__metric">
                            <span className="fi-case__metric-k">Exposure</span>
                            <span className="fi-case__metric-v">₹{c.exposureCr} Cr</span>
                          </span>
                          <span className="fi-case__metric-rule" aria-hidden />
                          <span className="fi-case__metric">
                            <span className="fi-case__metric-k">Linked</span>
                            <span className="fi-case__metric-v">{c.linked.length}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="fi-case__chev material-symbols-outlined" aria-hidden>
                      {open ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>

                  {/* ── expanded body ── */}
                  {open && (
                    <div className="fi-case__body" onClick={(e) => e.stopPropagation()}>
                      <p className="fi-case__narr">{c.narrative}</p>

                      {c.dealerTag && (
                        <p className="fi-case__dealer-row">
                          <span className="fi-case__dealer-k">Dealer on record</span>
                          <span
                            className="fi-case__dealer-v"
                            onMouseEnter={(e) => { e.stopPropagation(); showCrispTip(e, c.dealerTag, dealerCrispRows(c.dealerTag)); }}
                            onMouseLeave={(e) => { e.stopPropagation(); hideCrispTip(); }}
                          >
                            {c.dealerTag}
                          </span>
                        </p>
                      )}

                      {/* flagged observations */}
                      <div className="fi-case__obs-head">Observations</div>
                      <ul className="fi-case__obs">
                        {c.whyFlagged.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>

                      {/* metrics */}
                      <div className="fi-case__stats">
                        <div className="fi-case__stat">
                          <span className="fi-case__stat-k">Confidence</span>
                          <strong className="fi-case__stat-v">{c.confidence}%</strong>
                        </div>
                        <div className="fi-case__stat">
                          <span className="fi-case__stat-k">Estimated exposure</span>
                          <strong className="fi-case__stat-v">₹{c.exposureCr} Cr</strong>
                        </div>
                        <div className="fi-case__stat">
                          <span className="fi-case__stat-k">Linked applications</span>
                          <strong className="fi-case__stat-v">{c.linked.length}</strong>
                        </div>
                      </div>
                      {/* linked applications */}
                      <div className="fi-case__linked" aria-label="Linked applications">
                        <div className="fi-case__linked-head">
                          <span>Applicant</span>
                          <span>Scheme</span>
                          <span>District</span>
                          <span>Invoice</span>
                        </div>
                        {c.linked.map((row) => (
                          <div key={`${c.id}-${row.farmer}-${row.match ?? row.district}`} className="fi-case__linked-row">
                            <span className="fi-case__linked-name">{row.farmer}</span>
                            <span className="fi-case__linked-scheme">{row.scheme}</span>
                            <span className="fi-case__linked-district">{row.district}</span>
                            <span className="fi-case__linked-inv">
                              {row.taxInvoice ? (
                                <a
                                  className="fi-case__linked-pdf"
                                  href={row.taxInvoice}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(ev) => ev.stopPropagation()}
                                >
                                  <span className="material-symbols-outlined fi-case__linked-pdf-icon" aria-hidden>description</span>
                                  PDF
                                </a>
                              ) : (
                                <span className="fi-case__linked-inv-dash" aria-hidden>—</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="fi-feed-rail">
          <aside className="fi-hover-cloud" aria-label="Division intelligence">
            <div className="fi-hover-cloud__panel">
              <div className="fi-rail__stack fi-rail__stack--float">
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
          </div>
          </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisionCrossDistrictFraud;
