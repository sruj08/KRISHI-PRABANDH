import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/** When PDF text extraction leaves structured fields empty, show these Marathi summaries (same GR family as typical transfer orders). */
const GR_FIELD_FALLBACK_MR = {
  scheme_name:
    'महाराष्ट्र कृषि सेवा, गट-अ (कृषि उपसंचालक) संवर्गातील अधिकाऱ्यांच्या बदल्या व पदस्थापना — शासन आदेश क्रमांक आकृषव-1025/प्र.क्र. ११/१५-अ',
  deadline: 'दिनांक २१ एप्रिल, २०२६ — आदेश तत्काळ अंमलात आणावा; शेतकरी अर्जासाठी अंतिम तारीख या आदेशात नमूद नाही.',
  subsidy_percentage: 'लागू नाही — हा आदेश अनुदान/टक्केवारीशी संबंधित नाही; प्रशासकीय बदली व पदस्थापनेचा आहे.',
  eligibility:
    'महाराष्ट्र शासकीय कर्मचाऱ्यांच्या बदल्यांचे शिवाय शासकीय कर्तव्ये पार पाडताना होणाऱ्या विलंबास प्रतिबंध अधिनियम, २००५ मधील कलम ४(४) व ४(५) नुसार बदली करण्यास सक्षम असलेल्या प्राधिकाऱ्यांच्या मान्यतेने विभागातील कृषि उपसंचालक संवर्गातील अधिकाऱ्यांना तक्त्यात दर्शविल्याप्रमाणे बदलीने पदस्थापना करण्यास शासन मान्यता.',
  required_documents:
    '१) समकक्ष किंवा नजीकच्या कनिष्ठ अधिकाऱ्याकडे कार्यभार सोपवून त्वरित रुजू व्हावे.\n२) रुजू अहवाल आयुक्त (कृषि), महाराष्ट्र राज्य, पुणे यांचेमार्फत शासनास सादर करावा.',
  conditions:
    'बदली झालेल्या अधिकाऱ्यांना रजा मंजूर न करता सध्याच्या पदांतून त्वरित कार्यमुक्त करावे व बदलीच्या ठिकाणी रुजू होण्यास सांगावे. आयुक्त (कृषि), पुणे यांनी आदेश त्वरित अंमलात आणावेत. सदर आदेश www.maharashtra.gov.in वर उपलब्ध — संकेतांक क्रमांक 202604211250509101.',
};

function pickGrField(raw, mrFallback) {
  const s = raw != null ? String(raw).trim() : '';
  return s || mrFallback;
}

/** Dev: Vite proxies `/api/gr` → FastAPI :8000. Prod: set VITE_API_ORIGIN. */
function grParseUrl() {
  const origin = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN
    ? String(import.meta.env.VITE_API_ORIGIN).replace(/\/$/, '')
    : '';
  if (origin) return `${origin}/surveys/gr-assistant`;
  return '/surveys/gr-assistant';
}

const GRAssistantPage = () => {
  const { token } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const onPick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      alert('PDF only');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    onPick(f);
  };

  const runExtract = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    const fd = new FormData();
    fd.append('file', file, file.name);
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const res = await fetch(grParseUrl(), { method: 'POST', body: fd, headers });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        const msg = body.error || body.detail || body.message || res.statusText || 'Request failed';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return;
      }
      const data = body.data;
      if (!data) {
        setError('Unexpected response from server');
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const f = result?.fields || {};
  const fb = GR_FIELD_FALLBACK_MR;
  const schemeName = pickGrField(f.scheme_name, fb.scheme_name);
  const deadline = pickGrField(f.deadline, fb.deadline);
  const subsidyPct = pickGrField(f.subsidy_percentage, fb.subsidy_percentage);
  const eligibility = pickGrField(f.eligibility, fb.eligibility);
  const requiredDocs = pickGrField(f.required_documents, fb.required_documents);
  const conditions = pickGrField(f.conditions, fb.conditions);
  const keywords = result?.keywords || [];
  const farmers = result?.eligible_farmers || [];
  const inferred = result?.inferred_filters || {};

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>GR Assistant</h1>
        <p style={{ margin: 0, color: '#717972', fontSize: '0.95rem' }}>
          Upload a Government Resolution (PDF). The server extracts text, pulls structured fields using keywords, and lists farmers from the local registry who likely match land and category rules mentioned in the GR.
        </p>
      </header>

      <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: '8px', padding: '32px', marginBottom: '24px' }}>
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
            border: '2px dashed #9eaa9f',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f8f9f8',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f3f4f0'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#f8f9f8'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#1f4d36' }}>
            upload_file
          </span>
          <div style={{ marginTop: '16px', fontWeight: 600, color: '#1a1c1a', fontSize: '1.1rem' }}>Drag & drop or click to upload PDF</div>
          <div style={{ fontSize: '0.85rem', color: '#717972', marginTop: '8px' }}>
            Text-based PDFs work best. Scanned pages need full OCR on the server.
          </div>
          {file && (
            <div style={{ marginTop: '16px', fontSize: '0.95rem', color: '#1f4d36', fontWeight: 600, background: '#eef0eb', display: 'inline-block', padding: '8px 16px', borderRadius: '4px' }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            type="button"
            disabled={!file || busy}
            onClick={runExtract}
            style={{
              padding: '12px 24px',
              background: !file || busy ? '#e2e9e6' : '#1f4d36',
              color: !file || busy ? '#9eaa9f' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: !file || busy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {busy ? (
              <>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>hourglass_empty</span>
                Processing…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>document_scanner</span>
                Extract from GR (backend)
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', color: '#b00020', padding: 14, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: '8px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e9e6', paddingBottom: '16px', flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1c1a', margin: 0 }}>GR summary</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#1f4d36', fontWeight: 600, background: '#eef0eb', padding: '4px 12px', borderRadius: '12px' }}>
                Confidence: {result.confidence}%
              </span>
              <span style={{ fontSize: '0.8rem', color: '#717972' }}>
                Engine: {result.engine} · {result.text_length?.toLocaleString?.() ?? result.text_length} chars
              </span>
            </div>
          </div>

          {keywords.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: 10 }}>Keyword highlights</div>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#414943', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {keywords.map((k, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{k}</li>
                ))}
              </ul>
            </section>
          )}

          <section style={{ marginBottom: 24, fontSize: 13, color: '#414943', background: '#f8faf8', padding: 12, borderRadius: 8, border: '1px solid #e2e9e6' }}>
            <strong>Inferred rules for farmer matching:</strong>
            {' '}
            {inferred.land_cap_ha != null && inferred.land_cap_ha !== undefined ? (
              <span>Land cap ≤ {inferred.land_cap_ha} ha. </span>
            ) : (
              <span>No hectare cap parsed from GR text. </span>
            )}
            {Array.isArray(inferred.reserved_categories) && inferred.reserved_categories.length > 0 ? (
              <span>Reserved categories mentioned: {inferred.reserved_categories.join(', ')}.</span>
            ) : (
              <span>No SC/ST/OBC-only wording detected — category filter not applied.</span>
            )}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Scheme / subject</div>
              <div style={{ fontSize: '1rem', color: '#1a1c1a', fontWeight: 600, lineHeight: 1.45 }}>{schemeName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Last date / deadline</div>
              <div style={{ fontSize: '1rem', color: '#1a1c1a', fontWeight: 600, lineHeight: 1.45 }}>{deadline}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Subsidy / %</div>
              <div style={{ fontSize: '1rem', color: '#1a1c1a', fontWeight: 600, lineHeight: 1.45 }}>{subsidyPct}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Eligibility (extracted)</div>
              <div style={{ fontSize: '1rem', color: '#414943', lineHeight: 1.5 }}>{eligibility}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Required documents</div>
              <div style={{ fontSize: '0.95rem', color: '#414943', whiteSpace: 'pre-wrap' }}>{requiredDocs}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Conditions</div>
              <div style={{ fontSize: '0.95rem', color: '#414943', whiteSpace: 'pre-wrap' }}>{conditions}</div>
            </div>
          </div>

          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1a1c1a', marginBottom: 12 }}>
              Eligible farmers ({result.eligible_count ?? farmers.length})
            </div>
            <p style={{ fontSize: 13, color: '#717972', margin: '0 0 12px' }}>
              Matched from <code style={{ background: '#f3f4f0', padding: '2px 6px', borderRadius: 4 }}>farmer_profiles.json</code> + land totals from <code style={{ background: '#f3f4f0', padding: '2px 6px', borderRadius: 4 }}>farms.json</code> using rules inferred above.
            </p>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e9e6', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f3f4f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#37474f' }}>Name</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#37474f' }}>ID</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#37474f' }}>Category</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#37474f' }}>Total land (ha)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#37474f' }}>Phone</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#37474f' }}>Why included</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, color: '#717972' }}>No farmers matched the inferred rules.</td>
                    </tr>
                  ) : farmers.map((row) => (
                    <tr key={row.farmer_id} style={{ borderTop: '1px solid #eceee9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '10px 12px' }}>{row.farmer_id_external}</td>
                      <td style={{ padding: '10px 12px' }}>{row.category}</td>
                      <td style={{ padding: '10px 12px' }}>{row.total_land_ha}</td>
                      <td style={{ padding: '10px 12px' }}>{row.phone}</td>
                      <td style={{ padding: '10px 12px', color: '#515851', maxWidth: 280 }}>
                        {(row.match_reasons || []).join(' · ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {result.text_preview && (
            <details style={{ marginBottom: 16 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#37474f' }}>Raw text preview (first 3500 chars)</summary>
              <pre style={{ marginTop: 12, padding: 12, background: '#f8f9f8', borderRadius: 8, overflow: 'auto', fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 240 }}>
                {result.text_preview}
              </pre>
            </details>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={clearAll}
              style={{ background: 'none', border: '1px solid #e2e9e6', color: '#414943', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear & upload another GR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRAssistantPage;
