import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../hooks/useToast.jsx';
import { postGrAssistant } from '../../features/surveys/api';

const MAX_BYTES = 10 * 1024 * 1024;

function parseDeadlineForUrgency(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== 'string') return false;
  const d = Date.parse(deadlineStr.replace(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/, (_, a, b, c) => `${c.length === 2 ? `20${c}` : c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`));
  if (Number.isNaN(d)) return false;
  const days = (d - Date.now()) / 86400000;
  return days >= 0 && days <= 7;
}

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

const GRAssistantPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [result, setResult] = useState(null);

  const deadlineUrgent = useMemo(() => parseDeadlineForUrgency(result?.deadline), [result]);

  const onPick = useCallback(
    (f) => {
      if (!f) return;
      if (f.type !== 'application/pdf') {
        addToast(t('PDF only'), 'error');
        return;
      }
      if (f.size > MAX_BYTES) {
        addToast(t('Max file size 10 MB'), 'error');
        return;
      }
      setFile(f);
      setResult(null);
    },
    [addToast, t],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      onPick(f);
    },
    [onPick],
  );

  const runExtract = async () => {
    if (!file) return;
    setBusy(true);
    setApiOnline(true);
    try {
      const data = await postGrAssistant(file);
      setResult(data);
    } catch (e) {
      console.error(e);
      setApiOnline(false);
      addToast(t('Could not process GR. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const infoRows = [
    { key: 'scheme_name', label: t('Scheme Name') },
    { key: 'eligibility', label: t('Eligibility') },
    { key: 'deadline', label: t('Last Date') },
    { key: 'subsidy_percentage', label: t('Subsidy') },
    { key: 'required_documents', label: t('Required Documents'), multiline: true },
    { key: 'conditions', label: t('Important Conditions'), multiline: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)', animation: 'fadeIn 0.4s ease' }}>
      <OfficerHeader centerTitle={t('Assigned: 5 Villages')} centerSubtitle={t('Sahayak Krushi Adhikari Ramesh Patil')} apiOnline={apiOnline} />

      <div>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>
          {t('GR Assistant — Government Resolution Summarizer')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          {t('Upload a GR PDF to get AI-generated highlights in simple language')}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          style={{
            border: '2px dashed var(--outline-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--sp-8)',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(3,54,33,0.02)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--primary)' }}>
            upload_file
          </span>
          <div style={{ marginTop: 'var(--sp-3)', fontWeight: 600 }}>{t('Drag & drop or click to upload')}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
            {t('Accepts: PDF only · Max 10 MB')}
          </div>
          {file && (
            <div style={{ marginTop: 'var(--sp-4)', fontFamily: 'var(--font-data)', fontSize: 'var(--font-size-sm)' }}>
              <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div style={{ marginTop: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" disabled={!file || busy} onClick={runExtract}>
            {busy ? (
              <>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                  hourglass_top
                </span>
                {t('Processing…')}
              </>
            ) : (
              t('Extract & Summarize GR')
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="glass-panel" style={{ padding: 'var(--sp-6)' }}>
          <h3 className="section-title" style={{ marginTop: 0 }}>{t('GR Summary')}</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'var(--sp-4)',
              marginTop: 'var(--sp-4)',
            }}
          >
            {infoRows.map((row) => {
              const raw = result[row.key];
              const val = raw != null && String(raw).trim() !== '' ? String(raw) : t('Not found');
              const urgent = row.key === 'deadline' && deadlineUrgent;
              return (
                <div key={row.key} className="card" style={{ padding: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {row.label}
                  </div>
                  {row.multiline ? (
                    <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: urgent ? 'var(--error)' : 'var(--text-dark)', fontSize: 'var(--font-size-sm)' }}>
                      {val === t('Not found') ? (
                        <li style={{ color: 'var(--text-muted)', listStyle: 'none', marginLeft: '-18px' }}>{val}</li>
                      ) : (
                        val.split(/\n+/).filter(Boolean).map((line) => <li key={line}>{line}</li>)
                      )}
                    </ul>
                  ) : (
                    <div style={{ marginTop: '8px', fontSize: 'var(--font-size-sm)', color: urgent ? 'var(--error)' : 'var(--text-dark)', fontWeight: 600 }}>
                      {val}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {t('OCR Confidence')}: {result.confidence != null ? `${Number(result.confidence).toFixed(0)}%` : '—'}
          </div>
          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--sp-4)', color: 'var(--primary)' }} onClick={clearAll}>
            {t('Clear & Upload Another GR')}
          </button>
        </div>
      )}
    </div>
  );
};

export default GRAssistantPage;
