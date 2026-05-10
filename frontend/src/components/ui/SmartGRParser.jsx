import React, { useState, useRef } from 'react';

const API_BASE = 'http://localhost:8000';

// ─── Status badge color helper ────────────────────────────────────────────────
function statusStyle(status) {
  if (!status) return {};
  const s = status.toLowerCase();
  if (s === 'approved') return { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' };
  if (s === 'rejected') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
  if (s === 'under scrutiny') return { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
  return { background: 'var(--surface-variant)', color: 'var(--text-muted)', border: '1px solid var(--outline-variant)' };
}

// ─── Eligible Farmers Modal ───────────────────────────────────────────────────
function EligibleFarmersModal({ apps, components, lang, onClose }) {
  const title = lang === 'marathi' ? 'पात्र शेतकरी अर्ज' : 'Eligible Farmer Applications';
  const compLabel = lang === 'marathi' ? 'घटक' : 'Component';
  const schemeLabel = lang === 'marathi' ? 'योजना' : 'Scheme';
  const statusLabel = lang === 'marathi' ? 'स्थिती' : 'Status';
  const farmerLabel = lang === 'marathi' ? 'शेतकरी ID' : 'Farmer ID';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        width: '100%', maxWidth: 640, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--primary-light)',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-dark)' }}>{title}</div>
            {components.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {compLabel}: {components.join(', ')}
              </div>
            )}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              background: 'var(--primary)', color: '#fff', fontWeight: 700,
              borderRadius: 20, padding: '3px 12px', fontSize: 13,
            }}>{apps.length}</span>
            <button className="btn-icon" onClick={onClose} title="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* App list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px' }}>
          {apps.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
              {lang === 'marathi' ? 'कोणतेही अर्ज आढळले नाहीत' : 'No applications found'}
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-container)' }}>
                  {['#', farmerLabel, compLabel, schemeLabel, statusLabel].map(h => (
                    <th key={h} style={{
                      padding: '8px 10px', textAlign: 'left', fontWeight: 700,
                      color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase',
                      letterSpacing: '0.05em', borderBottom: '1px solid var(--outline-variant)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map((app, i) => (
                  <tr key={app.application_id || i} style={{
                    borderBottom: '1px solid var(--surface-variant)',
                    transition: 'background 120ms',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '9px 10px', color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: 'var(--text-dark)', fontFamily: 'monospace' }}>
                      {app.farmer_id || '—'}
                    </td>
                    <td style={{ padding: '9px 10px', color: 'var(--text-gray)' }}>{app.component || '—'}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text-gray)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.scheme_name || '—'}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{
                        ...statusStyle(app.status),
                        borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                      }}>{app.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--outline-variant)', textAlign: 'right' }}>
          <button className="btn btn-outline" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
            {lang === 'marathi' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Relevance badge helper ───────────────────────────────────────────────────
function RelevanceBadge({ relevance }) {
  if (relevance === 'लागू आहे' || relevance === 'Applicable')
    return <span className="badge badge-verified" style={{ fontSize: 13 }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span>{relevance}</span>;
  if (relevance === 'लागू नाही' || relevance === 'Not Applicable')
    return <span className="badge badge-grey" style={{ fontSize: 13 }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>block</span>{relevance}</span>;
  return <span className="badge badge-pending" style={{ fontSize: 13 }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>help</span>{relevance}</span>;
}

// ─── Relevance panel ──────────────────────────────────────────────────────────
function RelevancePanel({ data, lang, onShowFarmers }) {
  const isApplicable    = data.relevance === 'लागू आहे' || data.relevance === 'Applicable';
  const isNotApplicable = data.relevance === 'लागू नाही' || data.relevance === 'Not Applicable';

  const panelStyle = isApplicable
    ? { background: 'var(--success-light)', border: '1.5px solid var(--success-medium)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)' }
    : isNotApplicable
    ? { background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)', opacity: 0.8 }
    : { background: 'var(--amber-light)', border: '1.5px solid var(--amber)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)' };

  const iconName  = isApplicable ? 'task_alt' : isNotApplicable ? 'block' : 'help_outline';
  const iconColor = isApplicable ? 'var(--success)' : isNotApplicable ? 'var(--text-muted)' : 'var(--accent-dark)';

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)', flexWrap: 'wrap' }}>
        <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 22 }}>{iconName}</span>
        <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)' }}>
          {lang === 'marathi' ? 'सध्याच्या अर्जांशी संबंधितता' : 'Relevance to Current Applications'}
        </strong>
        <RelevanceBadge relevance={data.relevance} />
      </div>

      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', margin: '0 0 var(--sp-3) 0', lineHeight: 1.7 }}>
        {data.reason}
      </p>

      {/* Matched components chips */}
      {Array.isArray(data.matched_components) && data.matched_components.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--sp-3)' }}>
          {data.matched_components.map(comp => (
            <span key={comp} style={{
              background: 'var(--primary-light)', color: 'var(--primary)',
              border: '1px solid var(--primary)', borderRadius: 20,
              padding: '2px 10px', fontSize: 12, fontWeight: 600,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>category</span>
              {comp}
            </span>
          ))}
        </div>
      )}

      {isApplicable && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
            background: 'var(--success)', color: '#fff',
            borderRadius: 'var(--radius-sm)', padding: '6px 14px',
            fontSize: 'var(--font-size-sm)', fontWeight: 700,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>people</span>
            {lang === 'marathi'
              ? `${data.matched_applications} अर्जांशी जुळते`
              : `${data.matched_applications} matching application${data.matched_applications !== 1 ? 's' : ''}`}
          </div>

          {/* Eligible Farmers button */}
          {data.matched_applications > 0 && (
            <button
              id="gr-eligible-farmers-btn"
              onClick={onShowFarmers}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', color: 'var(--primary)',
                border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-sm)',
                padding: '6px 14px', fontSize: 'var(--font-size-sm)', fontWeight: 700,
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--primary)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>manage_accounts</span>
              {lang === 'marathi' ? 'पात्र शेतकरी पहा' : 'View Eligible Farmers'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value, iconColor = 'var(--success)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--surface-variant)' }}>
      <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)', lineHeight: 1.75 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Key Points section ───────────────────────────────────────────────────────
function KeyPointsSection({ points, lang }) {
  if (!Array.isArray(points) || points.length === 0) return null;
  return (
    <div style={{
      background: 'var(--primary-light)', border: '1.5px solid var(--primary)',
      borderRadius: 'var(--radius)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>format_list_bulleted</span>
        <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {lang === 'marathi' ? 'मुख्य मुद्दे' : 'Key Points'}
        </strong>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {points.map((pt, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, marginTop: 1,
            }}>{i + 1}</span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)', lineHeight: 1.65 }}>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SmartGRParser = () => {
  const [file, setFile]             = useState(null);
  const [grResult, setGrResult]     = useState(null);
  const [lang, setLang]             = useState('marathi');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const fileInputRef                = useRef(null);

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
  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFileSelect(e.dataTransfer.files[0]); };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setGrResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/gr/parse`, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || `Server error ${res.status}`);
      setGrResult(json.data);
      setLang('marathi');
    } catch (err) {
      setError(err.message || 'GR पार्स करता आला नाही. पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setGrResult(null); setError(null);
    setLang('marathi'); setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const data = grResult ? grResult[lang] : null;

  const typeIconMap = {
    Administrative: 'admin_panel_settings', Subsidy: 'payments',
    Scheme: 'volunteer_activism', Unknown: 'help_outline',
    'Administrative Order': 'admin_panel_settings', 'Subsidy Scheme': 'payments',
    'Government Scheme': 'volunteer_activism', 'Unknown / Unclassified': 'help_outline',
  };
  const typeColorMap = {
    Administrative: 'var(--text-muted)', Subsidy: 'var(--success)',
    Scheme: 'var(--primary)', Unknown: 'var(--error)',
    'Administrative Order': 'var(--text-muted)', 'Subsidy Scheme': 'var(--success)',
    'Government Scheme': 'var(--primary)', 'Unknown / Unclassified': 'var(--error)',
  };

  return (
    <div>
      {/* ── Upload / Drop Zone ── */}
      {!grResult && (
        <>
          <div
            className={`drag-drop-zone${dragging ? ' drag-over' : ''}`}
            style={dragging ? { borderColor: 'var(--primary)', background: 'var(--primary-light)' } : {}}
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="GR PDF upload zone"
          >
            <span className="material-symbols-outlined drag-icon">{file ? 'picture_as_pdf' : 'upload_file'}</span>
            {file ? (
              <>
                <p style={{ color: 'var(--primary)', marginBottom: 4 }}>{file.name}</p>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</span>
              </>
            ) : (
              <>
                <p>GR PDF येथे ड्रॅग करा / Drag &amp; Drop GR PDF here</p>
                <span>किंवा ब्राउझ करा / or click to browse</span>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept=".pdf"
            style={{ display: 'none' }} onChange={onInputChange} id="gr-file-input" />

          {error && (
            <div style={{
              background: 'var(--error-light)', border: '1px solid var(--error)',
              borderRadius: 'var(--radius)', padding: 'var(--sp-3) var(--sp-4)',
              fontSize: 'var(--font-size-sm)', color: 'var(--error-dark)',
              display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>{error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            {file && !loading && (
              <>
                <button className="btn btn-primary btn-touch" style={{ flex: 1 }} onClick={handleParse} id="gr-parse-btn">
                  <span className="material-symbols-outlined">document_scanner</span>GR पार्स करा / Parse GR
                </button>
                <button className="btn btn-secondary" onClick={handleReset} id="gr-reset-btn" title="Remove file">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </>
            )}
          </div>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-8) 0' }}>
              <div style={{ width: 44, height: 44, border: '4px solid var(--surface-variant)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>GR विश्लेषण होत आहे… / Analysing GR…</p>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ color: typeColorMap[data.type] || 'var(--primary)', fontSize: 24 }}>
                  {typeIconMap[data.type] || 'description'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>GR प्रकार / Type</div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-dark)' }}>{data.type}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
              <div style={{ display: 'flex', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <button id="gr-lang-mr" onClick={() => setLang('marathi')} style={{
                  padding: '5px 12px', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
                  background: lang === 'marathi' ? 'var(--primary)' : 'transparent',
                  color: lang === 'marathi' ? '#fff' : 'var(--text-muted)',
                }}>मराठी</button>
                <button id="gr-lang-en" onClick={() => setLang('english')} style={{
                  padding: '5px 12px', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
                  background: lang === 'english' ? 'var(--primary)' : 'transparent',
                  color: lang === 'english' ? '#fff' : 'var(--text-muted)',
                }}>English</button>
              </div>
              <button className="btn-icon" onClick={handleReset} id="gr-close-btn" title="Parse another GR">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Detail rows */}
          <ul className="gr-detail-list" style={{ marginBottom: 'var(--sp-4)' }}>
            <DetailRow icon="summarize" label={lang === 'marathi' ? 'सारांश' : 'Summary'} value={data.summary} iconColor="var(--primary)" />
            <DetailRow icon="trending_up" label={lang === 'marathi' ? 'परिणाम' : 'Impact'} value={data.impact} iconColor="var(--success)" />
            <DetailRow icon="play_arrow" label={lang === 'marathi' ? 'कारवाई' : 'Recommended Action'} value={data.action} iconColor="var(--accent)" />
          </ul>

          {/* Key Points */}
          <KeyPointsSection points={data.key_points} lang={lang} />

          {/* Relevance panel */}
          <div style={{ marginBottom: 'var(--sp-3)' }}>
            <RelevancePanel
              data={data}
              lang={lang}
              onShowFarmers={() => setShowModal(true)}
            />
          </div>

          <button className="btn btn-outline btn-full" onClick={handleReset} id="gr-parse-another-btn" style={{ marginTop: 'var(--sp-2)' }}>
            <span className="material-symbols-outlined">refresh</span>
            {lang === 'marathi' ? 'दुसरा GR अपलोड करा' : 'Upload Another GR'}
          </button>
        </div>
      )}

      {/* ── Eligible Farmers Modal ── */}
      {showModal && grResult && (
        <EligibleFarmersModal
          apps={grResult[lang]?.matched_apps_list || []}
          components={grResult[lang]?.matched_components || []}
          lang={lang}
          onClose={() => setShowModal(false)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SmartGRParser;
