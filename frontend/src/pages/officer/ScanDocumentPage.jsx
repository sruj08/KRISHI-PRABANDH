import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../hooks/useToast.jsx';
import { postSurveyEvidence } from '../../features/surveys/api';

function OfficerHeader({ centerTitle, centerSubtitle, apiOnline }) {
  return (
    <header
      className="cao-header"
      style={{
        marginLeft: '-var(--sp-6)',
        marginRight: '-var(--sp-6)',
        marginTop: '-var(--sp-6)',
        marginBottom: 'var(--sp-6)',
      }}
    >
      <div className="cao-header-left">
        <div className="logo-text">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginRight: '8px', fontSize: '24px' }}>
            public
          </span>
          Krishi Prabandh - Sahayak
        </div>
      </div>
      <div className="cao-header-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', gap: '16px' }}>
        <span>{centerTitle}</span>
        {centerSubtitle ? (
          <>
            <span style={{ color: 'var(--outline-card)' }}>•</span>
            <span>{centerSubtitle}</span>
          </>
        ) : null}
      </div>
      <div className="cao-header-right">
        <span className="badge badge-verified" style={{ fontSize: '11px', marginRight: '8px' }}>
          {apiOnline ? 'API Live' : 'Offline Mode'}
        </span>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>notifications</span>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>settings</span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'var(--text-dark)',
            cursor: 'pointer',
          }}
        >
          S
        </div>
      </div>
    </header>
  );
}

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'satbara', label: 'Satbara (7/12 Extract)' },
  { value: 'bank_passbook', label: 'Bank Passbook' },
  { value: 'bhade_khat', label: 'Bhade Khat (Lease Agreement)' },
  { value: 'equipment_invoice', label: 'Equipment Invoice' },
];

const FIELD_KEYS = {
  aadhaar: ['name', 'dob', 'aadhaar_number', 'gender'],
  satbara: ['survey_number', 'khata_number', 'farmer_name', 'village_name', 'crop_info', 'land_area'],
  bank_passbook: ['account_number', 'ifsc', 'account_holder_name', 'bank_name'],
  bhade_khat: ['tenant_name', 'owner_name', 'survey_number', 'lease_duration', 'signature_detected'],
  equipment_invoice: ['dealer_name', 'gst_number', 'invoice_amount', 'equipment_type', 'invoice_date'],
};

const FIELD_LABELS = {
  name: 'Farmer Name',
  dob: 'Date of Birth',
  aadhaar_number: 'Aadhaar Number',
  gender: 'Gender',
  survey_number: 'Survey Number',
  khata_number: 'Khata Number',
  farmer_name: 'Farmer Name',
  village_name: 'Village',
  crop_info: 'Crop',
  land_area: 'Land Area',
  account_number: 'Account Number',
  ifsc: 'IFSC',
  account_holder_name: 'Account Holder',
  bank_name: 'Bank Name',
  tenant_name: 'Tenant Name',
  owner_name: 'Owner Name',
  lease_duration: 'Lease Duration',
  signature_detected: 'Signature Detected',
  dealer_name: 'Dealer Name',
  gst_number: 'GST Number',
  invoice_amount: 'Invoice Amount',
  equipment_type: 'Equipment Type',
  invoice_date: 'Invoice Date',
};

const ScanDocumentPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const [docType, setDocType] = useState('aadhaar');
  const [surveyId, setSurveyId] = useState(() => searchParams.get('survey_id') || '');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [extracted, setExtracted] = useState(null);

  const keys = useMemo(() => FIELD_KEYS[docType] || [], [docType]);

  const onFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    setExtracted(null);
  }, []);

  const runExtract = async () => {
    if (!file || !surveyId.trim()) {
      addToast(t('Survey ID is required to extract and save.'), 'error');
      return;
    }
    setBusy(true);
    setApiOnline(true);
    try {
      const data = await postSurveyEvidence(surveyId.trim(), file, docType);
      setExtracted(data?.extracted_fields || {});
    } catch (e) {
      console.error(e);
      setApiOnline(false);
      addToast(e.message || t('Extraction failed. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const displayVal = (k) => {
    const v = extracted?.[k];
    if (v == null || String(v).trim() === '') return { text: t('— Not detected'), muted: true };
    return { text: String(v), muted: false };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)', animation: 'fadeIn 0.4s ease' }}>
      <OfficerHeader centerTitle={t('Assigned: 5 Villages')} centerSubtitle={t('Sahayak Krushi Adhikari Ramesh Patil')} apiOnline={apiOnline} />

      <div>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>{t('Scan Document')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          {t('Instantly extract farmer details from field documents')}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)', fontSize: 'var(--font-size-sm)' }}>{t('Step 1 — Select Document Type')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {DOC_TYPES.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`btn btn-sm ${docType === d.value ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-lg)' }}
              onClick={() => { setDocType(d.value); setExtracted(null); }}
            >
              {t(d.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)', fontSize: 'var(--font-size-sm)' }}>{t('Survey ID (required)')}</div>
        <input
          className="card"
          value={surveyId}
          onChange={(e) => setSurveyId(e.target.value)}
          placeholder="e.g. UUID from application / survey"
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '10px 12px',
            border: '1px solid var(--outline-card)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-data)',
            fontSize: 'var(--font-size-sm)',
          }}
        />
      </div>

      <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)', fontSize: 'var(--font-size-sm)' }}>{t('Step 2 — Upload or Capture')}</div>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>folder</span>
            {t('Upload File')}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => cameraRef.current?.click()}>
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>photo_camera</span>
            {t('Use Camera')}
          </button>
        </div>
        {file && (
          <div style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            {file.name}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)', fontSize: 'var(--font-size-sm)' }}>{t('Step 3 — Extract')}</div>
        <button type="button" className="btn btn-primary" disabled={!file || busy || !surveyId.trim()} onClick={runExtract}>
          {busy ? (
            <>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>hourglass_top</span>
              {t('Processing…')}
            </>
          ) : (
            t('Extract Details')
          )}
        </button>
      </div>

      {extracted && (
        <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
          <h3 className="section-title" style={{ marginTop: 0 }}>{t('Extracted Information')}</h3>
          <div className="card" style={{ marginTop: 'var(--sp-4)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ background: 'rgba(3,54,33,0.06)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700 }}>{t('Field Name')}</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700 }}>{t('Value')}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const { text, muted } = displayVal(k);
                  return (
                    <tr key={k} style={{ borderTop: '1px solid var(--outline-card)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{t(FIELD_LABELS[k] || k)}</td>
                      <td style={{ padding: '10px 12px', color: muted ? 'var(--text-muted)' : 'var(--text-dark)' }}>{text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <button type="button" className="btn btn-primary" onClick={() => addToast(t('Linked to application (demo).'), 'success')}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>check</span>
              {t('Confirm & Save to Application')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => { setExtracted(null); setFile(null); if (fileRef.current) fileRef.current.value = ''; if (cameraRef.current) cameraRef.current.value = ''; }}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>refresh</span>
              {t('Re-scan Document')}
            </button>
            <button type="button" className="btn btn-outline" style={{ color: 'var(--error)' }} onClick={() => { setExtracted(null); setFile(null); }}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>close</span>
              {t('Discard')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanDocumentPage;
