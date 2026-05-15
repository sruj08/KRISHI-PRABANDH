import React, { useState } from 'react';
import { OCR_EXTRACTION_DEMO, DUPLICATE_DETECTION } from '../../mock/officer-operations';

const AIVerificationPage = () => {
  const [selectedCase, setSelectedCase] = useState(0);

  // Mock data for AI Verification
  const cases = [
    {
      id: 'AI-4490',
      farmer: 'Popat Shinde',
      scheme: 'Tractor subsidy',
      village: 'Khadki Mal',
      confidence: 'High Risk',
      ocr: OCR_EXTRACTION_DEMO,
      duplicates: [DUPLICATE_DETECTION[0]],
      suggestedAction: 'Reject / Escalate to DAO. Invoice PDF hash is a 100% match with an existing application in Solapur district.',
      docType: 'Invoice PDF'
    },
    {
      id: 'AI-4491',
      farmer: 'Sunita Jadhav',
      scheme: 'PM-KISAN',
      village: 'Madha',
      confidence: 'Needs Review',
      ocr: [],
      duplicates: [DUPLICATE_DETECTION[1]],
      suggestedAction: 'Verify mobile number ownership. Mobile number and Aadhaar tail match an existing record.',
      docType: 'Aadhaar / Bank Passbook'
    },
    {
      id: 'AI-4492',
      farmer: 'Srujan Ganesh Satav',
      scheme: 'Farmer Registry',
      village: 'Uruli-dewachi',
      confidence: 'High Risk',
      ocr: [
        { field: 'Aadhaar Number', value: '4274 2817 5419', confidence: 99 },
        { field: 'Name', value: 'Srujan Ganesh Satav', confidence: 95 },
        { field: 'DOB', value: '17/08/2006', confidence: 98 },
      ],
      duplicates: [
        { match: 'Aadhaar Number 4274 2817 5419', districts: 'Pune, Satara', similarity: 100 }
      ],
      suggestedAction: 'Reject Application. This Aadhaar number has already been registered in Satara district for PM-KISAN benefits.',
      docType: 'Aadhaar Card',
      imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Aadhaar_Logo.svg/512px-Aadhaar_Logo.svg.png' // Placeholder for the actual image
    }
  ];

  const currentCase = cases[selectedCase];

  const getConfidenceColor = (conf) => {
    if (conf === 'High Risk') return { bg: '#fff0ef', text: '#ba1a1a', border: '#f9dcdb' };
    if (conf === 'Needs Review') return { bg: '#fff8e6', text: '#a16207', border: '#fdecc8' };
    return { bg: '#f3f4f0', text: '#1f4d36', border: '#e2e9e6' };
  };

  const confStyle = getConfidenceColor(currentCase?.confidence);

  return (
    <div style={{ padding: '24px 32px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>AI Verification</h1>
        <p style={{ margin: 0, color: '#717972', fontSize: '0.95rem' }}>Review documents and AI-flagged anomalies.</p>
      </header>

      {/* CASE SELECTOR (Simple Tabs) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #e2e9e6', paddingBottom: 16 }}>
        {cases.map((c, idx) => (
          <button 
            key={c.id}
            onClick={() => setSelectedCase(idx)}
            style={{
              padding: '8px 16px', background: selectedCase === idx ? '#1f4d36' : '#f3f4f0',
              color: selectedCase === idx ? '#fff' : '#414943', border: 'none', borderRadius: 6,
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            {c.id}: {c.farmer}
          </button>
        ))}
      </div>

      {currentCase ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* LEFT/MAIN: Document Preview & Extracted Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Document Preview Placeholder */}
              <div style={{ border: '1px solid #e2e9e6', borderRadius: 8, background: '#f8f9f8', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e9e6', fontWeight: 600, fontSize: '0.9rem', color: '#414943' }}>
                  Document: {currentCase.docType}
                </div>
                <div style={{ flex: 1, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9eaa9f', overflow: 'hidden' }}>
                  {currentCase.imgUrl ? (
                    <img src={currentCase.imgUrl} alt={currentCase.docType} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>plagiarism</span>
                  )}
                </div>
              </div>

              {/* OCR Extracted Fields */}
              <div style={{ border: '1px solid #e2e9e6', borderRadius: 8, background: '#fff' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e9e6', fontWeight: 600, fontSize: '0.9rem', color: '#414943' }}>
                  OCR Extracted Fields
                </div>
                <div style={{ padding: 16 }}>
                  {currentCase.ocr.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                      <tbody>
                        {currentCase.ocr.map((o, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f0' }}>
                            <td style={{ padding: '8px 0', color: '#717972' }}>{o.field}</td>
                            <td style={{ padding: '8px 0', fontWeight: 600 }}>{o.value}</td>
                            <td style={{ padding: '8px 0', textAlign: 'right', color: o.confidence > 90 ? '#1f4d36' : '#a16207' }}>
                              {o.confidence}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ color: '#9eaa9f', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No OCR data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Duplicate Detection Result */}
            <div style={{ border: '1px solid #e2e9e6', borderRadius: 8, background: '#fff' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e9e6', fontWeight: 600, fontSize: '0.9rem', color: '#414943' }}>
                Duplicate Detection Result
              </div>
              <div style={{ padding: 16 }}>
                {currentCase.duplicates.length > 0 ? (
                  currentCase.duplicates.map((dup, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fff0ef', border: '1px solid #f9dcdb', borderRadius: 6, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#ba1a1a', marginBottom: 4 }}>Match Found: {dup.match}</div>
                        <div style={{ fontSize: '0.85rem', color: '#ba1a1a' }}>Found in districts: {dup.districts}</div>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ba1a1a' }}>{dup.similarity}%</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#1f4d36', fontWeight: 600 }}>No duplicates found.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Confidence & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Confidence Indicator */}
            <div style={{ background: confStyle.bg, border: `1px solid ${confStyle.border}`, borderRadius: 8, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: confStyle.text, marginBottom: 8, fontWeight: 700 }}>AI Confidence</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: confStyle.text }}>{currentCase.confidence}</div>
            </div>

            {/* Suggested Action */}
            <div style={{ background: '#f8f9f8', border: '1px solid #e2e9e6', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#717972', marginBottom: 8 }}>SUGGESTED ACTION</div>
              <div style={{ fontSize: '0.95rem', color: '#1a1c1a', lineHeight: 1.5 }}>
                {currentCase.suggestedAction}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
              <button style={{ padding: '14px', background: '#fff', border: '1px solid #ba1a1a', color: '#ba1a1a', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                Reject Application
              </button>
              <button style={{ padding: '14px', background: '#f3f4f0', border: '1px solid #e2e9e6', color: '#414943', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                Require Manual Inspection
              </button>
              <button style={{ padding: '14px', background: '#1f4d36', border: 'none', color: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                Approve Verification
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AIVerificationPage;