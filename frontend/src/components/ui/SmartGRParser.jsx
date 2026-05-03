import React, { useState, useRef } from 'react';

const API_BASE = 'http://localhost:8000';

// ─── Relevance badge helper ───────────────────────────────────────────────────
function RelevanceBadge({ relevance }) {
  if (relevance === 'लागू आहे' || relevance === 'Applicable') {
    return (
      <span className="badge badge-verified" style={{ fontSize: 13 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span>
        {relevance}
      </span>
    );
  }
  if (relevance === 'लागू नाही' || relevance === 'Not Applicable') {
    return (
      <span className="badge badge-grey" style={{ fontSize: 13 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>block</span>
        {relevance}
      </span>
    );
  }
  return (
    <span className="badge badge-pending" style={{ fontSize: 13 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>help</span>
      {relevance}
    </span>
  );
}

// ─── Relevance panel ──────────────────────────────────────────────────────────
function RelevancePanel({ data, lang }) {
  const isApplicable = data.relevance === 'लागू आहे' || data.relevance === 'Applicable';
  const isNotApplicable = data.relevance === 'लागू नाही' || data.relevance === 'Not Applicable';

  const panelStyle = isApplicable
    ? { background: 'var(--success-light)', border: '1.5px solid var(--success-medium)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)' }
    : isNotApplicable
    ? { background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)', opacity: 0.8 }
    : { background: 'var(--amber-light)', border: '1.5px solid var(--amber)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)' };

  const iconName = isApplicable ? 'task_alt' : isNotApplicable ? 'block' : 'help_outline';
  const iconColor = isApplicable ? 'var(--success)' : isNotApplicable ? 'var(--text-muted)' : 'var(--accent-dark)';

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
        <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 22 }}>{iconName}</span>
        <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)' }}>
          {lang === 'marathi' ? 'सध्याच्या अर्जांशी संबंधितता' : 'Relevance to Current Applications'}
        </strong>
        <RelevanceBadge relevance={data.relevance} />
      </div>

      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', margin: '0 0 var(--sp-2) 0' }}>
        {data.reason}
      </p>

      {isApplicable && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
          background: 'var(--success)', color: '#fff',
          borderRadius: 'var(--radius-sm)', padding: '6px 12px',
          fontSize: 'var(--font-size-sm)', fontWeight: 700,
          width: 'fit-content'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>people</span>
          {lang === 'marathi'
            ? `${data.matched_applications} अर्जांशी जुळते`
            : `Matches ${data.matched_applications} application${data.matched_applications !== 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value, iconColor = 'var(--success)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--surface-variant)' }}>
      <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)', lineHeight: 1.6 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SmartGRParser = () => {
  const [file, setFile]           = useState(null);
  const [grResult, setGrResult]   = useState(null);
  const [lang, setLang]           = useState('marathi');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [dragging, setDragging]   = useState(false);
  const fileInputRef              = useRef(null);

  // ── File selection helpers ──
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('केवळ PDF फाइल स्वीकार केली जाते. / Only PDF files are accepted.');
      return;
    }
    setError(null);
    setGrResult(null);
    setFile(selectedFile);
  };

  const onInputChange = (e) => handleFileSelect(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  // ── API call ──
  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setGrResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/gr/parse`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || `Server error ${res.status}`);
      }

      setGrResult(json.data);
      setLang('marathi'); // always default to Marathi on new result
    } catch (err) {
      setError(err.message || 'GR पार्स करता आला नाही. पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setGrResult(null);
    setError(null);
    setLang('mr');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Derived display data ──
  // lang is 'marathi' or 'english' — matches the API response keys directly
  const data = grResult ? grResult[lang] : null;
  const typeIconMap = {
    Administrative: 'admin_panel_settings',
    Subsidy: 'payments',
    Scheme: 'volunteer_activism',
    Unknown: 'help_outline',
    'Administrative Order': 'admin_panel_settings',
    'Subsidy Scheme': 'payments',
    'Government Scheme': 'volunteer_activism',
    'Unknown / Unclassified': 'help_outline',
  };
  const typeColorMap = {
    Administrative: 'var(--text-muted)',
    Subsidy: 'var(--success)',
    Scheme: 'var(--primary)',
    Unknown: 'var(--error)',
    'Administrative Order': 'var(--text-muted)',
    'Subsidy Scheme': 'var(--success)',
    'Government Scheme': 'var(--primary)',
    'Unknown / Unclassified': 'var(--error)',
  };

  return (
    <div>
      {/* ── Upload / Drop Zone ── */}
      {!grResult && (
        <>
          <div
            className={`drag-drop-zone${dragging ? ' drag-over' : ''}`}
            style={dragging ? { borderColor: 'var(--primary)', background: 'var(--primary-light)' } : {}}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="GR PDF upload zone"
          >
            <span className="material-symbols-outlined drag-icon">
              {file ? 'picture_as_pdf' : 'upload_file'}
            </span>

            {file ? (
              <>
                <p style={{ color: 'var(--primary)', marginBottom: 4 }}>{file.name}</p>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </>
            ) : (
              <>
                <p>GR PDF येथे ड्रॅग करा / Drag &amp; Drop GR PDF here</p>
                <span>किंवा ब्राउझ करा / or click to browse</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={onInputChange}
            id="gr-file-input"
          />

          {/* Error message */}
          {error && (
            <div style={{
              background: 'var(--error-light)', border: '1px solid var(--error)',
              borderRadius: 'var(--radius)', padding: 'var(--sp-3) var(--sp-4)',
              fontSize: 'var(--font-size-sm)', color: 'var(--error-dark)',
              display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
              marginTop: 'var(--sp-3)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            {file && !loading && (
              <>
                <button
                  className="btn btn-primary btn-touch"
                  style={{ flex: 1 }}
                  onClick={handleParse}
                  id="gr-parse-btn"
                >
                  <span className="material-symbols-outlined">document_scanner</span>
                  GR पार्स करा / Parse GR
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleReset}
                  id="gr-reset-btn"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </>
            )}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'var(--sp-3)', padding: 'var(--sp-8) 0',
            }}>
              <div style={{
                width: 44, height: 44,
                border: '4px solid var(--surface-variant)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
                GR विश्लेषण होत आहे… / Analysing GR…
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Result Panel ── */}
      {grResult && data && (
        <div className="gr-summary-card" style={{ animation: 'slideUp 0.35s ease' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: typeColorMap[data.type] ? `${typeColorMap[data.type]}18` : 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ color: typeColorMap[data.type] || 'var(--primary)', fontSize: 24 }}>
                  {typeIconMap[data.type] || 'description'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {lang === 'mr' ? 'GR प्रकार' : 'GR Type'}
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-dark)' }}>
                  {data.type}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
              {/* Language toggle */}
              <div style={{ display: 'flex', border: '1.5px solid var(--outline-variant)',
                borderRadius: 'var(--radius-full)', overflow: 'hidden'
              }}>
                <button
                  id="gr-lang-mr"
                  onClick={() => setLang('marathi')}
                  style={{
                    padding: '5px 12px', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                    border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
                    background: lang === 'marathi' ? 'var(--primary)' : 'transparent',
                    color: lang === 'marathi' ? '#fff' : 'var(--text-muted)',
                  }}
                >मराठी</button>
                <button
                  id="gr-lang-en"
                  onClick={() => setLang('english')}
                  style={{
                    padding: '5px 12px', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                    border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
                    background: lang === 'english' ? 'var(--primary)' : 'transparent',
                    color: lang === 'english' ? '#fff' : 'var(--text-muted)',
                  }}
                >English</button>
              </div>

              {/* Close / parse another */}
              <button className="btn-icon" onClick={handleReset} id="gr-close-btn" title="Parse another GR">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Detail rows */}
          <ul className="gr-detail-list" style={{ marginBottom: 'var(--sp-4)' }}>
            <DetailRow
              icon="summarize"
              label={lang === 'marathi' ? 'सारांश' : 'Summary'}
              value={data.summary}
              iconColor="var(--primary)"
            />
            <DetailRow
              icon="trending_up"
              label={lang === 'marathi' ? 'परिणाम' : 'Impact'}
              value={data.impact}
              iconColor="var(--success)"
            />
            <DetailRow
              icon="play_arrow"
              label={lang === 'marathi' ? 'कारवाई' : 'Recommended Action'}
              value={data.action}
              iconColor="var(--accent)"
            />
          </ul>

          {/* Relevance section – MANDATORY */}
          <div style={{ marginBottom: 'var(--sp-3)' }}>
            <RelevancePanel data={data} lang={lang} />
          </div>

          {/* Parse another button */}
          <button
            className="btn btn-outline btn-full"
            onClick={handleReset}
            id="gr-parse-another-btn"
            style={{ marginTop: 'var(--sp-2)' }}
          >
            <span className="material-symbols-outlined">refresh</span>
            {lang === 'marathi' ? 'दुसरा GR अपलोड करा' : 'Upload Another GR'}
          </button>
        </div>
      )}

      {/* Spinner keyframes injected inline once */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SmartGRParser;
