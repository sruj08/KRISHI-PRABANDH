import React, { useRef, useState } from 'react';

const GRAssistantPage = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const onPick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      alert('PDF only');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    onPick(f);
  };

  const runExtract = () => {
    if (!file) return;
    setBusy(true);
    // Simulate AI extraction
    setTimeout(() => {
      setResult({
        scheme_name: 'PM-KISAN Update 2026',
        eligibility: 'All farmers with less than 2ha land.',
        deadline: '31/05/2026',
        subsidy_percentage: 'N/A',
        required_documents: 'Aadhaar Card\nBank Passbook\n7/12 Extract',
        conditions: 'Must have active bank account linked to Aadhaar.',
        confidence: 94
      });
      setBusy(false);
    }, 1500);
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>GR Assistant</h1>
        <p style={{ margin: 0, color: '#717972', fontSize: '0.95rem' }}>Upload Government Resolutions (PDF) to get AI-generated highlights in simple language.</p>
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
          onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f0'}
          onMouseOut={(e) => e.currentTarget.style.background = '#f8f9f8'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#1f4d36' }}>
            upload_file
          </span>
          <div style={{ marginTop: '16px', fontWeight: 600, color: '#1a1c1a', fontSize: '1.1rem' }}>Drag & drop or click to upload PDF</div>
          <div style={{ fontSize: '0.85rem', color: '#717972', marginTop: '8px' }}>
            Maximum file size: 10 MB
          </div>
          {file && (
            <div style={{ marginTop: '16px', fontSize: '0.95rem', color: '#1f4d36', fontWeight: 600, background: '#eef0eb', display: 'inline-block', padding: '8px 16px', borderRadius: '4px' }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <button 
            type="button" 
            disabled={!file || busy} 
            onClick={runExtract}
            style={{ 
              padding: '12px 24px', background: !file || busy ? '#e2e9e6' : '#1f4d36', 
              color: !file || busy ? '#9eaa9f' : '#fff', border: 'none', borderRadius: '6px', 
              fontWeight: 600, fontSize: '1rem', cursor: !file || busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {busy ? (
              <>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>hourglass_empty</span>
                Processing...
              </>
            ) : (
              'Extract Highlights'
            )}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: '8px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e9e6', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1c1a', margin: 0 }}>GR Summary</h2>
            <div style={{ fontSize: '0.85rem', color: '#1f4d36', fontWeight: 600, background: '#eef0eb', padding: '4px 12px', borderRadius: '12px' }}>
              OCR Confidence: {result.confidence}%
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Scheme Name</div>
              <div style={{ fontSize: '1rem', color: '#1a1c1a', fontWeight: 600 }}>{result.scheme_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Last Date</div>
              <div style={{ fontSize: '1rem', color: '#1a1c1a', fontWeight: 600 }}>{result.deadline}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Eligibility</div>
              <div style={{ fontSize: '1rem', color: '#414943' }}>{result.eligibility}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Required Documents</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#414943', fontSize: '1rem' }}>
                {result.required_documents.split('\n').map((doc, idx) => <li key={idx}>{doc}</li>)}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', marginBottom: '8px' }}>Important Conditions</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#414943', fontSize: '1rem' }}>
                {result.conditions.split('\n').map((cond, idx) => <li key={idx}>{cond}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button 
              onClick={clearAll}
              style={{ background: 'none', border: '1px solid #e2e9e6', color: '#414943', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear & Upload Another GR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRAssistantPage;
