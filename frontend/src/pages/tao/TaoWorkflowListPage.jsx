import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast.jsx';
import { useLanguage } from '../../context/LanguageContext';
import {
  mockBulkSafeApplications,
  BULK_SAFE_APPROVE_TOTAL,
  mockPendingApplications,
} from '../../mock/tao-flagged-cases';
import './tao.css';

const CARD = {
  background: '#fff',
  border: '1px solid #e2e3df',
  borderRadius: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
};

const PANEL = '#e2e3df';
const TEXT = '#1a1c1a';
const MUTED = '#717972';
const GREEN = '#396940';
const AMBER = '#b45309';

function PendingDocumentPreviewModal({ preview, onClose }) {
  const { t } = useLanguage();
  const title = typeof preview === 'string' ? preview : preview?.title || 'Document';
  const src = typeof preview === 'object' && preview?.src ? preview.src : null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1260,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          overflow: 'auto',
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
        {src ? (
          <img src={src} alt="" style={{ width: '100%', height: 'auto', borderRadius: 12, border: `1px solid ${PANEL}` }} />
        ) : (
          <div
            style={{
              minHeight: 200,
              background: '#eceeeb',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              fontSize: 13,
              fontWeight: 600,
              padding: 24,
              border: `1px dashed ${PANEL}`,
            }}
          >
            {t('Preview unavailable in demo')}
          </div>
        )}
      </div>
    </div>
  );
}

function PendingReviewDocumentCard({ doc, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(doc)}
      style={{
        textAlign: 'left',
        border: `1px solid ${PANEL}`,
        borderRadius: 10,
        padding: 10,
        background: '#fff',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: doc.thumb ? '72px 1fr' : '40px 1fr',
        gap: 10,
        alignItems: 'start',
      }}
    >
      {doc.thumb ? (
        <img src={doc.thumb} alt="" style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 6, border: `1px solid ${PANEL}` }} />
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: MUTED, marginTop: 4 }}>description</span>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{doc.name}</div>
        <div style={{ fontSize: 10, color: GREEN, fontWeight: 600, lineHeight: 1.35 }}>{doc.ocrLine || '—'}</div>
        <div style={{ fontSize: 10, color: doc.verifyWarn ? AMBER : MUTED, fontWeight: 700, marginTop: 4 }}>{doc.verifyLine || '—'}</div>
      </div>
    </button>
  );
}

function DetailKV({ k, v }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, fontSize: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f0' }}>
      <span style={{ color: MUTED, fontWeight: 700 }}>{k}</span>
      <span style={{ color: TEXT, fontWeight: 600 }}>{v || '—'}</span>
    </div>
  );
}

function PendingApplicationDetailModal({ row, onClose }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const d = row?.detail;
  if (!d) return null;
  const docStatusColor = (s) => (s === 'Verified' ? GREEN : s === 'Manual check' ? AMBER : MUTED);

  const openDocPreview = (doc) => {
    if (doc.thumb) setPreviewDoc({ title: doc.name, src: doc.thumb });
    else setPreviewDoc(doc.name);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1240,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            overflow: 'auto',
            background: '#fff',
            borderRadius: 12,
            border: `1px solid ${PANEL}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${PANEL}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>Application {d.applicationId}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: MUTED }}>{d.queueStatus}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(57,105,64,0.12)',
                color: '#396940',
                border: '1px solid rgba(57,105,64,0.25)',
              }}
            >
              AI confidence {row.aiConfidence}%
            </span>
            <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>APPLICANT</div>
          <div style={{ marginBottom: 16 }}>
            <DetailKV k="Farmer name" v={d.farmerName} />
            <DetailKV k="Father / spouse" v={d.fatherName} />
            <DetailKV k="Gender" v={d.gender} />
            <DetailKV k="Date of birth" v={d.dob} />
            <DetailKV k="Mobile" v={d.mobile} />
            <DetailKV k="Email" v={d.email} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>LOCATION</div>
          <div style={{ marginBottom: 16 }}>
            <DetailKV k="Village" v={d.village} />
            <DetailKV k="Taluka" v={d.taluka} />
            <DetailKV k="District" v={d.district} />
            <DetailKV k="PIN" v={d.pincode} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>SCHEME & LAND</div>
          <div style={{ marginBottom: 16 }}>
            <DetailKV k="Scheme" v={d.scheme} />
            <DetailKV k="Component" v={d.component} />
            <DetailKV k="Financial year" v={d.financialYear} />
            <DetailKV k="Survey no." v={d.surveyNo} />
            <DetailKV k="Land area (ha)" v={d.landAreaHa} />
            <DetailKV k="Crop declared" v={d.cropDeclared} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>BANK</div>
          <div style={{ marginBottom: 16 }}>
            <DetailKV k="Bank" v={d.bankName} />
            <DetailKV k="Branch" v={d.branch} />
            <DetailKV k="Account" v={d.accountMasked} />
            <DetailKV k="IFSC" v={d.ifsc} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>SUBMISSION</div>
          <div style={{ marginBottom: 16 }}>
            <DetailKV k="Submitted" v={d.submittedAt} />
            <DetailKV k="Last updated" v={d.lastUpdated} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>UPLOADED DOCUMENTS</div>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: MUTED, lineHeight: 1.45 }}>
            Sample scans from the upload queue — click a card to enlarge (demo).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
            {(d.documents || []).map((doc) => (
              <PendingReviewDocumentCard key={doc.name} doc={doc} onOpen={openDocPreview} />
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 8 }}>DOCUMENT STATUS (SUMMARY)</div>
          <div style={{ border: `1px solid ${PANEL}`, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#f3f4f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>Document</th>
                  <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>Status</th>
                  <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>AI match</th>
                </tr>
              </thead>
              <tbody>
                {(d.documents || []).map((doc) => (
                  <tr key={doc.name} style={{ borderTop: `1px solid ${PANEL}` }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: TEXT }}>{doc.name}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: docStatusColor(doc.status) }}>{doc.status}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{doc.aiPct != null ? `${doc.aiPct}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: 12, background: '#fafbf9', borderRadius: 8, border: `1px solid ${PANEL}`, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, marginBottom: 6 }}>AI SUMMARY</div>
            <p style={{ margin: 0, fontSize: 12, color: TEXT, lineHeight: 1.55 }}>{d.aiSummary}</p>
          </div>

          <div style={{ padding: 12, background: '#fff', borderRadius: 8, border: `1px solid ${PANEL}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, marginBottom: 6 }}>KRUSHI SAHAYAK REMARKS</div>
            <p style={{ margin: 0, fontSize: 12, color: TEXT, lineHeight: 1.55 }}>{d.sahayakRemarks}</p>
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
      {previewDoc ? <PendingDocumentPreviewModal preview={previewDoc} onClose={() => setPreviewDoc(null)} /> : null}
    </>
  );
}

function PendingBulkApproveModal({ onClose, onApproveAll }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1250,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          background: '#fff',
          borderRadius: 12,
          border: `1px solid ${PANEL}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          padding: '18px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>AI Verified Applications</h2>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 11, color: MUTED, lineHeight: 1.45 }}>Low risk · OCR passed · No duplicate detection</p>
        <div style={{ overflowX: 'auto', border: `1px solid ${PANEL}`, borderRadius: 8, maxHeight: 280 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#f3f4f0', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>Farmer name</th>
                <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>Scheme</th>
                <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>AI confidence</th>
                <th style={{ padding: '8px 10px', fontWeight: 800, color: MUTED }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockBulkSafeApplications.map((row) => (
                <tr key={row.id} style={{ borderTop: `1px solid ${PANEL}` }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: TEXT }}>{row.farmer_name}</td>
                  <td style={{ padding: '8px 10px', color: MUTED }}>{row.scheme}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.confidence}%</td>
                  <td style={{ padding: '8px 10px', color: '#396940', fontSize: 10, lineHeight: 1.4 }}>
                    {row.statusLines.map((s) => (
                      <div key={s}>✓ {s}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${PANEL}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{BULK_SAFE_APPROVE_TOTAL} applications eligible for approval</span>
          <button
            type="button"
            className="btn btn-success"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}
            onClick={onApproveAll}
          >
            APPROVE ALL VERIFIED
          </button>
        </div>
      </div>
    </div>
  );
}

const TaoWorkflowListPage = ({ title, subtitle, rows, emptyHint, bulkApprove, onApplicationSelect }) => {
  const { addToast } = useToast();
  const { t } = useLanguage();

  return (
    <div className="tao-dash-root" style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          ...CARD,
          padding: '22px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>{title}</h1>
          {subtitle && (
            <p style={{ fontSize: 11, color: '#717972', margin: '8px 0 0', lineHeight: 1.45 }}>{subtitle}</p>
          )}
        </div>
        {bulkApprove ? (
          <button
            type="button"
            className="btn btn-success"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={bulkApprove.onOpen}
          >
            Mass Approve Safe Applications
          </button>
        ) : null}
      </div>
      <div style={{ ...CARD, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f0', fontSize: 12, fontWeight: 700, color: '#1a1c1a' }}>
          {t('Queue (demo)')}
        </div>
        <div style={{ padding: 0 }}>
          {rows.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => {
                if (onApplicationSelect) onApplicationSelect(r);
                else addToast(`Queued item ${r.id} — detail view coming soon.`, 'success', 2800);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 20px',
                border: 'none',
                borderBottom: '1px solid #f3f4f0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#717972', marginTop: 4 }}>{r.meta}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {typeof r.aiConfidence === 'number' ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'rgba(57,105,64,0.1)',
                      color: '#396940',
                      border: '1px solid rgba(57,105,64,0.2)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    AI {r.aiConfidence}%
                  </span>
                ) : null}
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#717972' }}>chevron_right</span>
              </div>
            </button>
          ))}
        </div>
        {bulkApprove && rows.length > 0 ? (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #f3f4f0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              background: '#fafbf9',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{BULK_SAFE_APPROVE_TOTAL} applications eligible for approval</span>
            <button
              type="button"
              className="btn btn-success"
              style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}
              onClick={bulkApprove.onOpen}
            >
              APPROVE ALL VERIFIED
            </button>
          </div>
        ) : null}
        {emptyHint && (
          <div style={{ padding: '16px 20px', fontSize: 11, color: '#717972', background: '#fafafa' }}>{emptyHint}</div>
        )}
      </div>
    </div>
  );
};

export function TaoPendingApplicationsPage() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const handleBulkApproveAll = () => {
    setBulkOpen(false);
    addToast(
      `✓ ${BULK_SAFE_APPROVE_TOTAL} applications approved successfully. Estimated manual work saved: 4.7 hours.`,
      'success',
      5200,
    );
  };

  return (
    <>
      {bulkOpen && (
        <PendingBulkApproveModal onClose={() => setBulkOpen(false)} onApproveAll={handleBulkApproveAll} />
      )}
      {selectedApplication?.detail && (
        <PendingApplicationDetailModal row={selectedApplication} onClose={() => setSelectedApplication(null)} />
      )}
      <TaoWorkflowListPage
        title={t('Pending Applications')}
        subtitle={t('Applications awaiting taluka-level clearance. Open an item to continue the standard review workflow.')}
        bulkApprove={{ onOpen: () => setBulkOpen(true) }}
        onApplicationSelect={setSelectedApplication}
        rows={mockPendingApplications}
      />
    </>
  );
}

export function TaoFieldVerificationPage() {
  const { t } = useLanguage();
  return (
    <TaoWorkflowListPage
      title={t('Field Verification Requests')}
      subtitle={t('TAO-coordinated field visits requested from circle teams. Assignments are illustrative only.')}
      rows={[
        { id: 'F-12', label: 'Visit — Loni Kalbhor cluster', meta: 'Due 16 May 2026 · High backlog' },
        { id: 'F-13', label: 'Re-verify — Barshi dealer yard', meta: 'Due 18 May 2026 · Evidence pack attached' },
        { id: 'F-14', label: 'Spot check — Sangola warehouse', meta: 'Due 20 May 2026 · Standard rotation' },
      ]}
    />
  );
}

export default TaoWorkflowListPage;
