import React, { useMemo, useState } from 'react';
import { useToast } from '../../hooks/useToast.jsx';
import { useLanguage } from '../../context/LanguageContext';
import { mockFlaggedCases, countCasesByFilter, filterCases } from '../../mock/tao-flagged-cases';
import './tao.css';

const PANEL = '#e2e3df';
const MUTED = '#717972';
const TEXT = '#1a1c1a';
const GREEN = '#396940';
const AMBER = '#b45309';
const RED = '#ba1a1a';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'high_risk', label: 'High Risk' },
  { id: 'invoice_fraud', label: 'Invoice Fraud' },
  { id: 'bhade_khat', label: 'Bhade Khat Fraud' },
  { id: 'geo_tag', label: 'Geo-tag Issues' },
  { id: 'bank_issues', label: 'Bank Issues' },
];

function riskBand(score) {
  if (score <= 20) return { fill: GREEN, label: 'SAFE' };
  if (score <= 50) return { fill: AMBER, label: 'NEEDS REVIEW' };
  return { fill: RED, label: 'HIGH RISK' };
}

function VerificationChip({ chip }) {
  const { t } = useLanguage();
  const failed = chip.status === 'failed';
  const passed = chip.status === 'passed';
  const unknown = chip.status === 'unknown';
  const critical = chip.critical && failed;
  const bg = passed ? 'rgba(57,105,64,0.12)' : unknown ? 'rgba(113,121,114,0.14)' : critical ? 'rgba(186,26,26,0.12)' : 'rgba(180,83,9,0.12)';
  const color = passed ? GREEN : unknown ? MUTED : critical ? RED : AMBER;
  const icon = passed ? 'check' : unknown ? 'help' : critical ? 'warning' : 'priority_high';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 8,
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
      {t(chip.label)}
    </span>
  );
}

function RiskBar({ score }) {
  const { t } = useLanguage();
  const band = riskBand(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, whiteSpace: 'nowrap' }}>{t('Risk score')}</span>
      <div style={{ flex: 1, height: 8, background: '#f0f0ec', borderRadius: 99, overflow: 'hidden', minWidth: 80 }}>
        <div style={{ width: `${score}%`, height: '100%', background: band.fill, borderRadius: 99, transition: 'width 0.2s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{score}/100</span>
      <span style={{ fontSize: 10, fontWeight: 800, color: band.fill, letterSpacing: '0.04em' }}>{t(band.label)}</span>
    </div>
  );
}

function DocThumb({ label, onClick }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${PANEL}`,
        background: '#fafafa',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: MUTED }}>description</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{t(label)}</span>
    </button>
  );
}

function RowKV({ k, v, strong }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f0' }}>
      <span style={{ color: MUTED, fontWeight: 600 }}>{k}</span>
      <span style={{ color: TEXT, fontWeight: strong ? 700 : 600, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function ResultLine({ label, value, state }) {
  const { t } = useLanguage();
  const color = state === 'yes' ? GREEN : state === 'no' ? RED : MUTED;
  const sym = state === 'yes' ? t('✓ YES') : state === 'no' ? t('✗ NO') : t('? UNVERIFIED');
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f0' }}>
      <span style={{ color: MUTED, fontWeight: 600 }}>{t(label)}</span>
      <span style={{ color, fontWeight: 800 }}>{value ? t(value) : sym}</span>
    </div>
  );
}

function MiddlePanel({ c }) {
  const { t } = useLanguage();
  const f = c.extracted_fields || {};
  const base = (
    <>
      <RowKV k={t('Farmer name')} v={f.farmer_name || c.farmer_name} />
      <RowKV k={t('Survey no.')} v={f.survey_number || c.survey_number} />
      <RowKV k={t('Village')} v={f.village || c.village} />
      <RowKV k={t('Bank account')} v={f.bank_account || '—'} />
      <RowKV k={t('IFSC')} v={f.ifsc || '—'} />
      <RowKV k={t('Invoice amount')} v={f.invoice_amount || '—'} />
      <RowKV k={t('GST no.')} v={f.gst_number || c.gst_number || '—'} />
    </>
  );

  if (c.fraud_type === 'duplicate_invoice') {
    return (
      <>
        {base}
        <div style={{ marginTop: 12, padding: 12, background: '#fff4e6', borderRadius: 10, border: '1px solid rgba(180,83,9,0.25)', fontSize: 11, color: '#5c3d0a', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{t('Invoice detail')}</div>
          <div>{t('Invoice #:')} {c.invoice_number}</div>
          <div>{t('Dealer:')} {c.dealer_name}</div>
          <div>{t('GST:')} {c.gst_number}</div>
          <div>{t('Amount:')} {c.invoice_amount_value}</div>
          <div style={{ marginTop: 8, fontWeight: 800, color: RED }}>{t('⚠ DUPLICATE ALERT:')} {t(c.duplicate_alert_text)}</div>
        </div>
      </>
    );
  }

  if (c.fraud_type === 'bhade_khat' && c.bhade_khat) {
    const b = c.bhade_khat;
    return (
      <>
        {base}
        <div style={{ marginTop: 12, padding: 12, background: '#fff4e6', borderRadius: 10, border: '1px solid rgba(180,83,9,0.25)', fontSize: 11, color: '#5c3d0a', lineHeight: 1.55 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{t('Lease agreement detail')}</div>
          <div>{t('Tenant:')} {b.tenant}</div>
          <div>{t('Owner:')} {b.owner}</div>
          <div>{t('Survey:')} {b.survey}</div>
          <div>{t('Stamp serial:')} {b.stamp_serial}</div>
          <div style={{ marginTop: 8, fontWeight: 800, color: RED }}>{t('⚠ DUPLICATE:')} {t(b.duplicate_stamp_note)}</div>
        </div>
      </>
    );
  }

  if (c.fraud_type === 'geo_duplicate' && c.geo_duplicate) {
    const g = c.geo_duplicate;
    return (
      <>
        {base}
        <div style={{ marginTop: 12, padding: 12, background: '#fff4e6', borderRadius: 10, border: '1px solid rgba(180,83,9,0.25)', fontSize: 11, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 800, marginBottom: 6, color: '#5c3d0a' }}>{t('Field evidence')}</div>
          <div>{t('Image 1 GPS:')} {g.image1_gps}</div>
          <div>{t('Image 2 GPS:')} {g.image2_gps} {t('← SAME')}</div>
          <div>{t('Timestamp 1:')} {g.ts1}</div>
          <div>{t('Timestamp 2:')} {g.ts2} {t('← SAME')}</div>
          <div style={{ marginTop: 8, fontWeight: 800, color: RED }}>{t('⚠')} {t(g.same_as_app)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div style={{ height: 96, background: '#eceeeb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: MUTED, textAlign: 'center', padding: 8 }}>
            {t('Image A (placeholder)')}
          </div>
          <div style={{ height: 96, background: '#fde8e8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: RED, textAlign: 'center', padding: 8 }}>
            {t('Image B — DUPLICATE')}
          </div>
        </div>
      </>
    );
  }

  if (c.fraud_type === 'bank_inactive' && c.bank_inactive) {
    const b = c.bank_inactive;
    return (
      <>
        {base}
        <div style={{ marginTop: 12, padding: 12, background: '#fff4e6', borderRadius: 10, border: '1px solid rgba(180,83,9,0.25)', fontSize: 11, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{t('Bank detail')}</div>
          <div>{t('Account:')} {b.account}</div>
          <div>{t('IFSC:')} {b.ifsc}</div>
          <div>{t('Bank:')} {b.bank}</div>
          <div>{t('Account status:')} {t('⚠')} {b.status_label}</div>
          <div>{t('Last transaction:')} {b.last_transaction}</div>
        </div>
      </>
    );
  }

  if (c.fraud_type === 'suspicious_pricing' && c.suspicious_pricing) {
    const s = c.suspicious_pricing;
    return (
      <>
        {base}
        <div style={{ marginTop: 12, padding: 12, background: '#fff4e6', borderRadius: 10, border: '1px solid rgba(180,83,9,0.25)', fontSize: 11, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{t('Pricing analysis')}</div>
          <div>{t('Invoice amount:')} {s.invoice_amount}</div>
          <div>{t('Scheme average:')} {s.scheme_average}</div>
          <div>{t('Deviation:')} {s.deviation_pct} {t('above average')}</div>
          <div>{t('Dealer:')} {s.dealer}</div>
          <div style={{ marginTop: 8, fontWeight: 800, color: RED }}>{t('⚠ ABNORMAL AMOUNT:')} {t(s.abnormal_note)}</div>
        </div>
      </>
    );
  }

  if (c.fraud_type === 'satbara_mismatch' && c.satbara_mismatch) {
    const s = c.satbara_mismatch;
    return (
      <>
        {base}
        <div style={{ marginTop: 12, padding: 12, background: '#fff4e6', borderRadius: 10, border: '1px solid rgba(180,83,9,0.25)', fontSize: 11, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{t('Land record comparison')}</div>
          <div>{t('Satbara issue date:')} {s.satbara_issue_date} {t('← Outdated ( > 3 years)')}</div>
          <div>{t('Current owner (records):')} {s.current_owner}</div>
          <div>{t('Document owner:')} {s.document_owner}</div>
          <div style={{ marginTop: 8, fontWeight: 800, color: RED }}>{t('⚠ MUTATION MISMATCH:')} {t(s.mutation_note)}</div>
        </div>
      </>
    );
  }

  return <>{base}</>;
}

function RightPanel({ c }) {
  const { t } = useLanguage();
  const dupRef = c.duplicate_reference;
  if (c.fraud_type === 'duplicate_invoice') {
    return (
      <>
        <ResultLine label="Invoice duplicate" value={`✗ YES — ${dupRef ? `used in ${dupRef}` : 'linked'}`} state="no" />
        <ResultLine label="GST format" value="✓ VALID" state="yes" />
        <ResultLine label="Amount vs. norm" value="✗ FLAG — above avg ₹35k" state="no" />
        <ResultLine label="Fraud score" value={`${c.risk_score}/100`} state="no" />
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: TEXT }}>{t('Risk factors')}</div>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {(c.risk_factors || []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }
  if (c.fraud_type === 'bhade_khat') {
    return (
      <>
        <ResultLine label="Stamp serial unique" value="✗ NO — 3 applications" state="no" />
        <ResultLine label="Signature detected" value="✗ NOT FOUND" state="no" />
        <ResultLine label="Owner name match" value="✗ MISMATCH" state="no" />
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: TEXT }}>{t('Risk factors')}</div>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {(c.risk_factors || []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }
  if (c.fraud_type === 'geo_duplicate') {
    return (
      <>
        <ResultLine label="Unique geo-tag" value="✗ NO — duplicate" state="no" />
        <ResultLine label="Timestamp valid" value="✗ DUPLICATE TIME" state="no" />
        <ResultLine label="Crop area match" value="? UNVERIFIED" state="unknown" />
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: TEXT }}>{t('Risk factors')}</div>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {(c.risk_factors || []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }
  if (c.fraud_type === 'bank_inactive') {
    return (
      <>
        <ResultLine label="Account active" value="✗ INACTIVE" state="no" />
        <ResultLine label="IFSC valid" value="✓ YES" state="yes" />
        <ResultLine label="Name match" value="? UNVERIFIED" state="unknown" />
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: TEXT }}>{t('Risk factors')}</div>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {(c.risk_factors || []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }
  if (c.fraud_type === 'suspicious_pricing') {
    return (
      <>
        <ResultLine label="Amount within limit" value="✗ NO — ₹1,20,000 vs avg ₹35k" state="no" />
        <ResultLine label="Dealer verified" value="? NOT IN DATABASE" state="unknown" />
        <ResultLine label="GST valid" value="✓ YES" state="yes" />
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: TEXT }}>{t('Risk factors')}</div>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {(c.risk_factors || []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }
  if (c.fraud_type === 'satbara_mismatch') {
    return (
      <>
        <ResultLine label="Satbara current" value="✗ OUTDATED 2018" state="no" />
        <ResultLine label="Owner name match" value="✗ MISMATCH" state="no" />
        <ResultLine label="Mutation recorded" value="? UNKNOWN" state="unknown" />
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: TEXT }}>{t('Risk factors')}</div>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {(c.risk_factors || []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }
  return null;
}

function DocumentPreviewModal({ title, onClose }) {
  const { t } = useLanguage();
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 720,
          background: '#fff',
          borderRadius: 16,
          border: `1px solid ${PANEL}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</h2>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label={t('Close')}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div
          style={{
            minHeight: 280,
            background: '#eceeeb',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: MUTED,
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
            padding: 24,
            border: `1px dashed ${PANEL}`,
          }}
        >
          {t('Preview unavailable in demo')}
        </div>
      </div>
    </div>
  );
}

const TaoAIFlaggedCases = () => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const counts = useMemo(() => {
    const o = {};
    TABS.forEach((t) => {
      o[t.id] = countCasesByFilter(mockFlaggedCases, t.id);
    });
    return o;
  }, []);

  const visible = useMemo(() => filterCases(mockFlaggedCases, tab), [tab]);

  const recordAction = (name) => {
    addToast(`Action recorded: ${name}`, 'success', 3200);
  };

  return (
    <div className="tao-dash-root" style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {previewDoc && <DocumentPreviewModal title={previewDoc} onClose={() => setPreviewDoc(null)} />}

      <div style={{ background: '#fff', border: `1px solid ${PANEL}`, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>{t('Application Verification Layer')}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>
          {t('Flagged applications consolidated for taluka review. Use filters to focus the queue; expand a row for structured findings and recommended actions.')}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {TABS.map((tabItem) => {
          const active = tab === tabItem.id;
          const count = counts[tabItem.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(tabItem.id);
                setExpandedId(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                border: active ? `2px solid ${GREEN}` : `1px solid ${PANEL}`,
                background: active ? 'rgba(57,105,64,0.08)' : '#fff',
                color: active ? GREEN : TEXT,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t(tabItem.label)}
              <span
                style={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: 999,
                  background: active ? GREEN : '#f3f4f0',
                  color: active ? '#fff' : MUTED,
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map((c) => {
          const open = expandedId === c.id;
          return (
            <div
              key={c.id}
              style={{
                background: '#fff',
                border: `1px solid ${PANEL}`,
                borderRadius: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : c.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{c.farmer_name}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: RED, padding: '4px 10px', borderRadius: 8, letterSpacing: '0.06em' }}>
                        {t('HIGH RISK')}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
                      {t('Scheme:')} {c.scheme} · {t('Village:')} {c.village}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
                      {t('Survey:')} {c.survey_number} · {t('Submitted:')} {c.submitted}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                      {(c.verification_chips || []).map((ch, i) => (
                        <VerificationChip key={i} chip={ch} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, minWidth: 200 }}>
                    <RiskBar score={c.risk_score} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: GREEN, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {t('Review')}
                      <span className="material-symbols-outlined" style={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>expand_more</span>
                    </span>
                  </div>
                </div>
              </button>

              <div
                style={{
                  maxHeight: open ? 2000 : 0,
                  opacity: open ? 1 : 0,
                  transition: 'max-height 0.22s ease, opacity 0.18s ease',
                  overflow: 'hidden',
                  borderTop: open ? `1px solid ${PANEL}` : 'none',
                }}
              >
                <div style={{ padding: '18px 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{c.farmer_name}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: RED }}>
                      {t('HIGH RISK')} {c.risk_score}
                    </div>
                  </div>
                  <div className="tao-flagged-expand-grid" style={{ display: 'grid', gap: 14 }}>
                    <div style={{ border: `1px solid ${PANEL}`, borderRadius: 12, padding: 14, background: '#fafbf9', minHeight: 200 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 10 }}>{t('DOCUMENT PREVIEW')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(c.documents || ['Aadhaar', 'Satbara', 'Invoice']).map((d) => (
                          <DocThumb key={d} label={d} onClick={() => setPreviewDoc(d)} />
                        ))}
                      </div>
                      <p style={{ fontSize: 10, color: MUTED, marginTop: 12, lineHeight: 1.45 }}>
                        {t('Select a thumbnail to open a full-screen preview shell.')}
                      </p>
                    </div>
                    <div style={{ border: `1px solid ${PANEL}`, borderRadius: 12, padding: 14, background: '#fff', minHeight: 200 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 10 }}>{t('EXTRACTED DATA')}</div>
                      <MiddlePanel c={c} />
                    </div>
                    <div style={{ border: `1px solid ${PANEL}`, borderRadius: 12, padding: 14, background: '#fff', minHeight: 200 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 10 }}>{t('VERIFICATION RESULTS')}</div>
                      <RightPanel c={c} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${PANEL}` }}>
                    <button type="button" className="btn btn-success" onClick={() => recordAction('Approve')}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                      {t('Approve')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ borderColor: AMBER, color: AMBER }}
                      onClick={() => recordAction('Send for Review')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>forward</span>
                      {t('Send for Review')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ borderColor: RED, color: RED }}
                      onClick={() => recordAction('Reject')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>block</span>
                      {t('Reject')}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => recordAction('Request Field Visit')}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>travel_explore</span>
                      {t('Request Field Visit')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaoAIFlaggedCases;
