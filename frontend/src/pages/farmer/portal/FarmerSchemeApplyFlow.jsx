import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronLeft, FileText, Loader2, Upload, X } from 'lucide-react';
import { processFarmerDocument, quickSharpnessScan, validateFarmerUploadFile } from '../../../lib/farmerDocumentPipeline';
import { useToast } from '../../../hooks/useToast.jsx';
import { fp } from './farmerPortalUi';
import './farmer-schemes-module.css';

const STEP_DEF = [
  { id: 1, label: 'Scheme details' },
  { id: 2, label: 'Upload document' },
  { id: 3, label: 'Verification' },
  { id: 4, label: 'Submit' },
];

const MAX_UPLOAD_BYTES = 1024 * 1024;

function stageLabel(stage) {
  const map = {
    checking: 'Checking document clarity…',
    skipped_optimisation: 'Within 1 MB — keeping your file as-is…',
    reading: 'Reading file…',
    analyzing: 'Analysing format…',
    rasterizing_pdf: 'Rendering PDF pages…',
    enhancing: 'Enhancing readability…',
    compressing: 'Compressing output…',
    ocr: 'Running OCR validation…',
    validating: 'Checking document quality…',
    finalizing: 'Finalising…',
  };
  return map[stage] || 'Processing…';
}

function generateAppRef() {
  const n = String(Math.floor(10000 + Math.random() * 90000));
  return `MH-KP-2026-${n}`;
}

/* ── Approval score ──────────────────────────────────────── */
function computeApprovalScore(result, blurPreCheck) {
  let score = result.readabilityScore ?? 50;
  if (blurPreCheck?.severity === 'severe') score -= 28;
  else if (blurPreCheck?.severity === 'warn') score -= 12;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function approvalBand(score) {
  if (score >= 80) return { label: 'High — likely to be approved',   color: '#15803d', bg: '#f0fdf4', ring: '#86efac' };
  if (score >= 60) return { label: 'Good — minor review possible',    color: '#1d4ed8', bg: '#eff6ff', ring: '#93c5fd' };
  if (score >= 40) return { label: 'Moderate — officer may query',    color: '#b45309', bg: '#fffbeb', ring: '#fcd34d' };
  return               { label: 'Low — document likely to be rejected', color: '#b91c1c', bg: '#fef2f2', ring: '#fca5a5' };
}

function ApprovalScoreCard({ result, blurPreCheck }) {
  const score = computeApprovalScore(result, blurPreCheck);
  const band  = approvalBand(score);
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="fsm-approval-card flex items-center gap-4 rounded-xl border px-4 py-3.5"
      style={{ background: band.bg, borderColor: band.ring }}
    >
      {/* Arc gauge */}
      <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90 block">
          <circle cx="28" cy="28" r="22" fill="none" stroke="#eceee9" strokeWidth="6" />
          <circle
            cx="28" cy="28" r="22"
            fill="none"
            stroke={band.color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-[0.75rem] font-bold tabular-nums" style={{ color: band.color }}>
            {score}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="m-0 text-[0.6875rem] font-bold uppercase tracking-wide text-[#5c6560]">
          Approval likelihood
        </p>
        <p className="m-0 mt-0.5 text-[0.875rem] font-bold leading-snug" style={{ color: band.color }}>
          {band.label}
        </p>
        <p className="m-0 mt-1 text-[0.75rem] leading-relaxed text-[#5c6560]">
          Based on clarity, OCR confidence ({Math.round(result.ocrConfidence ?? 0)}%), and document readability.
        </p>
      </div>
    </div>
  );
}

function revokeResultPreviewUrls(result) {
  if (!result?.pages) return;
  result.pages.forEach((p) => {
    if (p.beforeUrl?.startsWith('blob:')) URL.revokeObjectURL(p.beforeUrl);
    if (p.afterUrl?.startsWith('blob:')) URL.revokeObjectURL(p.afterUrl);
  });
}

export default function FarmerSchemeApplyFlow({ scheme, onClose, onSubmitted }) {
  const schemeDoc = scheme.requiredDocs?.[0];
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [confirmEligible, setConfirmEligible] = useState(false);
  const [declaration, setDeclaration] = useState(false);
  const [upload, setUpload] = useState(null);
  const [mergedFields, setMergedFields] = useState({
    farmerName: '',
    surveyNumber: '',
    aadhaarLast4: '',
    bankAccountName: '',
    invoiceNumber: '',
    village: '',
    landDetails: '',
  });
  const [submitRef, setSubmitRef] = useState(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [blurAcknowledged, setBlurAcknowledged] = useState(false);
  const cameraRef = useRef(null);

  const blurIsActive = useMemo(
    () =>
      upload?.status === 'done' &&
      upload.blurPreCheck?.severity &&
      upload.blurPreCheck.severity !== 'ok' &&
      !blurAcknowledged,
    [upload, blurAcknowledged],
  );

  const runPipeline = useCallback(
    async (file) => {
      if (!schemeDoc) return;
      const v = validateFarmerUploadFile(file);
      if (v) {
        setUpload({ status: 'error', error: v, progress: null, file: null, result: null, blurPreCheck: null });
        return;
      }
      if (schemeDoc.imagesOnly && !file.type.startsWith('image/')) {
        setUpload({ status: 'error', error: 'Please upload a clear photo (JPG/PNG).', progress: null, file: null, result: null, blurPreCheck: null });
        return;
      }
      if (schemeDoc.pdfOnly && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setUpload({ status: 'error', error: 'This slot requires a PDF.', progress: null, file: null, result: null, blurPreCheck: null });
        return;
      }
      setUpload((prev) => {
        if (prev?.result) revokeResultPreviewUrls(prev.result);
        return {
          status: 'processing',
          file,
          error: null,
          result: null,
          blurPreCheck: null,
          progress: { stage: 'checking', pct: 4 },
        };
      });
      try {
        let blurPreCheck = {
          severity: 'ok',
          headline: '',
          detail: '',
          laplacianVariance: 0,
        };
        try {
          blurPreCheck = await quickSharpnessScan(file);
          setUpload((u) => (u?.status === 'processing' ? { ...u, blurPreCheck, progress: { stage: 'reading', pct: 10 } } : u));
        } catch {
          /* ignore pre-scan failure */
        }
        const result = await processFarmerDocument(file, {
          maxBytes: MAX_UPLOAD_BYTES,
          maxPdfPages: 20,
          onProgress: ({ stage, pct }) => {
            setUpload((u) => (u?.status === 'processing' ? { ...u, progress: { stage, pct } } : u));
          },
        });
        setUpload((u) =>
          u?.status === 'processing'
            ? {
                status: result.ok ? 'done' : 'rejected',
                file,
                result,
                blurPreCheck,
                progress: null,
                error: null,
              }
            : u,
        );
        if (result.ok && result.extractedFields) {
          setMergedFields((prev) => {
            const next = { ...prev };
            for (const [k, val] of Object.entries(result.extractedFields)) {
              if (!val) continue;
              if (!next[k] || String(val).trim().length > String(next[k]).trim().length) next[k] = String(val).trim();
            }
            return next;
          });
        }
        if (!result.ok) {
          addToast('Low readability score — document may get rejected. You can re-upload or proceed.', 'warning', 6000);
        }
      } catch (e) {
        setUpload((u) =>
          u?.status === 'processing'
            ? { status: 'error', error: e?.message || 'Processing failed', progress: null, file: u.file, result: null, blurPreCheck: u.blurPreCheck }
            : u,
        );
        addToast(e?.message || 'Processing failed', 'error', 5000);
      }
    },
    [addToast, schemeDoc],
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      const f = acceptedFiles?.[0];
      if (!f || !schemeDoc) return;
      runPipeline(f);
    },
    [schemeDoc, runPipeline],
  );

  const acceptForDoc = (doc) => {
    if (!doc) return undefined;
    if (doc.pdfOnly) return { 'application/pdf': ['.pdf'] };
    if (doc.imagesOnly) return { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };
    return { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] };
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: schemeDoc ? acceptForDoc(schemeDoc) : undefined,
    maxFiles: 1,
    multiple: false,
    noClick: true,
  });

  const docReady = upload?.status === 'done';
  const pages = upload?.result?.pages || [];
  const curPage = pages[pageIdx] || pages[0];
  const fileOverLimit = !!(upload?.file && upload.file.size > MAX_UPLOAD_BYTES);

  const clearUpload = useCallback(() => {
    setUpload((prev) => {
      if (prev?.result) revokeResultPreviewUrls(prev.result);
      return null;
    });
    setPageIdx(0);
    setBlurAcknowledged(false);
  }, []);

  const handleSubmit = () => {
    if (!declaration) {
      addToast('Please accept the declaration to submit.', 'error', 4000);
      return;
    }
    const ref = generateAppRef();
    setSubmitRef(ref);
    setStep(4);
    onSubmitted?.(scheme.id, ref);
    addToast(`Application submitted. Reference: ${ref}`, 'success', 5500);
  };

  const downloadGr = () => {
    const body = `Government Resolution (Demo)\nScheme: ${scheme.name}\nReference: ${submitRef || 'N/A'}\nGenerated from Krishi Prabandh Farmer Portal.`;
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GR-${scheme.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!schemeDoc) {
    return null;
  }

  /* ─── render ─────────────────────────────────────── */
  return (
    <motion.div
      className="fsm-flow fixed inset-0 z-[5000] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fp-apply-title"
    >
      {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
      <header className="fsm-flow__header shrink-0">
        <div className="fsm-flow__header-row border-b border-[#eceee9]">
          <div className="fsm-flow__title-block">
            <p className="fsm-flow__kicker">MahaDBT Portal</p>
            <h1 id="fp-apply-title" className="fsm-flow__title">
              {scheme.name}
            </h1>
          </div>
          <nav className="fsm-flow__steps-desktop" aria-label="Application steps">
            {STEP_DEF.map((s, i) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  {i > 0 ? <span className="fsm-flow__step-sep" aria-hidden>›</span> : null}
                  <span
                    className="fsm-flow__step-chip"
                    style={
                      active
                        ? { background: fp.primary, color: '#fff' }
                        : done
                          ? { background: fp.primarySoft, color: fp.primary }
                          : { background: '#f3f4f0', color: '#717972' }
                    }
                  >
                    {done ? <CheckCircle className="h-3 w-3 shrink-0" aria-hidden /> : null}
                    {s.label}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
          <button type="button" onClick={onClose} aria-label="Close" className="fsm-flow__close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="fsm-flow__steps-mobile" aria-label="Application steps">
          {STEP_DEF.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <React.Fragment key={s.id}>
                {i > 0 ? <span className="fsm-flow__step-sep" aria-hidden>›</span> : null}
                <span
                  className="fsm-flow__step-chip"
                  style={
                    active
                      ? { background: fp.primary, color: '#fff' }
                      : done
                        ? { background: fp.primarySoft, color: fp.primary }
                        : { background: '#f3f4f0', color: '#717972' }
                  }
                >
                  {done ? <CheckCircle className="h-2.5 w-2.5 shrink-0" aria-hidden /> : null}
                  {s.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
        <div className="fsm-flow__subrow">
          <p className="fsm-flow__dept">{scheme.dept}</p>
        </div>
      </header>

      {/* ═══ BODY ══════════════════════════════════════════════════════ */}
      <div className="fsm-flow__body min-h-0 flex-1 overflow-hidden">
        <aside className="fsm-rail shrink-0">
          <div className="fsm-rail__inner">

            {/* ── Step 1 sidebar ── */}
            {step === 1 && (<>
              <div>
                <p className="fsm-rail__heading">Scheme summary</p>
                <div className="fsm-rail-card">
                  <div className="fsm-rail-card__row">
                    <p className="fsm-rail-card__label">Subsidy</p>
                    <p className="fsm-rail-card__value">{scheme.subsidy}</p>
                  </div>
                  <div className="fsm-rail-card__row">
                    <p className="fsm-rail-card__label">Deadline</p>
                    <p className="fsm-rail-card__value">{scheme.deadline}</p>
                  </div>
                  <div className="fsm-rail-card__row">
                    <p className="fsm-rail-card__label">File limit</p>
                    <p className="fsm-rail-card__value" style={{ fontWeight: 500, fontSize: '0.8125rem', color: '#5c6560' }}>
                      ≤ 1 MB kept as-is; larger files compressed.
                    </p>
                  </div>
                </div>
              </div>
              <label className="fsm-rail-check">
                <input type="checkbox" className="h-4 w-4 shrink-0" style={{ accentColor: fp.primary }}
                  checked={confirmEligible} onChange={(e) => setConfirmEligible(e.target.checked)} />
                <span>
                  I confirm I am eligible and these scheme details are correct for my landholding.
                </span>
              </label>
              <button
                type="button" disabled={!confirmEligible}
                className="fsm-rail__btn fsm-rail__btn--primary"
                style={{ background: confirmEligible ? fp.primary : undefined }}
                onClick={() => setStep(2)}
              >Continue to upload</button>
            </>)}

            {/* ── Step 2–3 sidebar ── */}
            {step >= 2 && step <= 3 && (<>
              <div>
                <p className="fsm-rail__heading">Document</p>
                <div className={`fsm-rail-doc ${
                  upload?.status === 'done' ? 'fsm-rail-doc--ok'
                  : upload?.status === 'rejected' ? 'fsm-rail-doc--warn'
                  : upload?.status === 'error' ? 'fsm-rail-doc--err'
                  : ''
                }`}>
                  <span className="material-symbols-outlined shrink-0 text-[1.25rem]" style={{ color: fp.primary }}>description</span>
                  <div className="fsm-rail-doc__text">
                    <p className="fsm-rail-doc__title">Supporting document</p>
                    <p className="fsm-rail-doc__sub">PDF · JPG · PNG</p>
                  </div>
                  {upload?.status === 'processing' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#1e5a8a]" aria-hidden />}
                  {upload?.status === 'done' && <CheckCircle className="h-4 w-4 shrink-0 text-[#16a34a]" aria-hidden />}
                  {upload?.status === 'rejected' && <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />}
                  {upload?.status === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-[#b91c1c]" aria-hidden />}
                </div>
              </div>
              <div className="fsm-rail-progress">
                <div className="fsm-rail-progress__top">
                  <span>Checklist</span>
                  <span style={{ color: docReady ? fp.primary : undefined }}>{docReady ? '1 / 1' : '0 / 1'}</span>
                </div>
                <div className="fsm-rail-progress__bar">
                  <div className="fsm-rail-progress__fill" style={{ width: docReady ? '100%' : '0%' }} />
                </div>
              </div>
              {step === 2 && (
                <div className="fsm-rail__stack">
                  <button type="button"
                    className="fsm-rail__btn fsm-rail__btn--ghost"
                    onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Back
                  </button>
                  <button type="button" disabled={!docReady}
                    className="fsm-rail__btn fsm-rail__btn--primary"
                    style={{ background: docReady ? fp.primary : undefined }}
                    onClick={() => { if (!docReady) { addToast('Upload your document first.', 'error', 3500); return; } setStep(3); }}>
                    Continue to verification
                  </button>
                </div>
              )}
              {step === 3 && (
                <button type="button"
                  className="fsm-rail__btn fsm-rail__btn--ghost"
                  onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4" aria-hidden /> Back to upload
                </button>
              )}
            </>)}

            {/* ── Step 4 sidebar ── */}
            {step === 4 && (<>
              <p className="fsm-rail__heading" style={{ color: '#16a34a' }}>Application lodged</p>
              <p className="m-0 text-sm leading-relaxed" style={{ color: '#5c6560' }}>Tracked under Applications.</p>
              <button type="button"
                className="fsm-rail__btn fsm-rail__btn--ghost"
                onClick={downloadGr}>Download GR (demo)</button>
              <button type="button"
                className="fsm-rail__btn fsm-rail__btn--primary"
                style={{ background: fp.primary }} onClick={onClose}>Return to schemes</button>
            </>)}

          </div>
        </aside>

        <section className="fsm-stage min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="fsm-stage__inner"
                >
                  <div className="fsm-panel">
                    <h2 className="fsm-panel__title">Scheme details</h2>
                    <p className="fsm-panel__lead">{scheme.description}</p>
                    <p className="fsm-panel__subtitle">Eligibility</p>
                    <p className="fsm-panel__lead" style={{ marginTop: '0.375rem' }}>{scheme.eligibilityCriteria}</p>
                  </div>
                </motion.div>
              )}

              {step === 2 && schemeDoc && (
                <motion.div key="s2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fsm-stage__inner fsm-stage__inner--wide flex min-w-0 flex-col gap-5">

                  <div
                    {...getRootProps()}
                    className={`fsm-upload${isDragActive ? ' fsm-upload--active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <input
                      ref={cameraRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) runPipeline(f);
                      }}
                    />

                    <div className="fsm-upload__head border-b border-[#eceee9]">
                      <div className="fsm-upload__head-icon">
                        <span className="material-symbols-outlined text-[1.35rem]" style={{ color: fp.primary }}>description</span>
                      </div>
                      <div className="fsm-upload__head-text">
                        <h2 className="fsm-upload__head-title">Supporting document</h2>
                        <p className="fsm-upload__head-desc">
                          PDF, JPG, or PNG · max 80 MB · files ≤ 1 MB kept as-is
                        </p>
                      </div>
                    </div>

                    <div className="fsm-upload__drop">
                      <div className="fsm-upload__drop-icon">
                        <Upload className="h-7 w-7" style={{ color: fp.primary }} aria-hidden />
                      </div>
                      <p className="fsm-upload__drop-title">
                        {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                      </p>
                      <p className="fsm-upload__drop-hint">Or use the buttons below to browse from files or capture with camera.</p>
                    </div>

                    {upload?.progress ? (
                      <div className="fsm-upload__progress">
                        <p className="fsm-upload__progress-label">{stageLabel(upload.progress.stage)}</p>
                        <div className="fsm-upload__progress-track">
                          <div
                            className="fsm-upload__progress-fill"
                            style={{ width: `${upload.progress.pct}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="fsm-upload__actions">
                      <button
                        type="button"
                        className="fsm-upload__action-primary"
                        onClick={open}
                      >
                        <Upload className="h-4 w-4 shrink-0" aria-hidden />
                        Choose file
                      </button>
                      {!schemeDoc.pdfOnly ? (
                        <button
                          type="button"
                          className="fsm-upload__action-secondary"
                          onClick={() => cameraRef.current?.click()}
                        >
                          <span className="material-symbols-outlined text-[1.15rem] shrink-0">photo_camera</span>
                          Use camera
                        </button>
                      ) : null}
                    </div>

                    {upload?.file ? (
                      <div className="fsm-upload__remove">
                        <button type="button" onClick={clearUpload}>
                          Remove and re-upload
                        </button>
                      </div>
                    ) : null}

                    <div className="fsm-upload__spacer" />
                  </div>

                  {/* ── Processing spinner ── */}
                  {upload?.status === 'processing' && (
                    <div className="space-y-3">
                      {upload.blurPreCheck && upload.blurPreCheck.severity !== 'ok' ? (
                        <div className={`flex gap-3 rounded-xl border px-4 py-4 text-[0.8125rem] leading-snug ${
                          upload.blurPreCheck.severity === 'severe'
                            ? 'border-red-200 bg-red-50 text-red-950'
                            : 'border-amber-200 bg-amber-50 text-amber-950'
                        }`}>
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: upload.blurPreCheck.severity === 'severe' ? '#b91c1c' : '#b45309' }} />
                          <div>
                            <p className="m-0 font-bold">{upload.blurPreCheck.headline}</p>
                            <p className="m-0 mt-1.5">{upload.blurPreCheck.detail}</p>
                            <p className="m-0 mt-2 text-[0.75rem] font-semibold opacity-90">
                              {fileOverLimit
                                ? 'We are still optimising so the file fits the official 1 MB limit — please wait.'
                                : 'Your file is already within the 1 MB limit — we keep it as uploaded while we finish OCR and checks.'}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#eceee9] bg-white py-7 text-sm font-semibold text-[#5c6560]">
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: fp.primary }} />
                        {stageLabel(upload.progress?.stage || 'reading')}
                      </div>
                    </div>
                  )}

                  {/* ── Error banner ── */}
                  {upload?.error && upload.status === 'error' && (
                    <div className="flex gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fee2e2]">
                        <AlertCircle className="h-5 w-5 text-[#b91c1c]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[0.8125rem] font-bold text-[#7f1d1d]">Document not accepted</p>
                        <p className="m-0 mt-0.5 text-[0.78rem] leading-relaxed text-[#991b1b]">{upload.error}</p>
                      </div>
                    </div>
                  )}

                  {/* ── Rejected (low readability) banner ── */}
                  {upload?.status === 'rejected' && upload.result && (
                    <div className="overflow-hidden rounded-xl border border-[#fecaca] bg-[#fef2f2]">
                      <div className="flex gap-3 px-4 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fee2e2]">
                          <AlertCircle className="h-5 w-5 text-[#b91c1c]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-[0.8125rem] font-bold text-[#7f1d1d]">Very low readability score — may get rejected</p>
                          <p className="m-0 mt-1 text-[0.78rem] leading-relaxed text-[#991b1b]">
                            {upload.result.rejectReason || 'The document appears too blurry or unclear for OCR to read confidently. A clearer copy will improve your chances.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 border-t border-[#fecaca] bg-[#fff5f5] px-4 py-3">
                        <button
                          type="button"
                          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#fecaca] bg-white text-[0.8rem] font-bold text-[#b91c1c] transition hover:bg-[#fef2f2]"
                          onClick={clearUpload}
                        >
                          <span className="material-symbols-outlined text-[0.9rem]">upload</span>
                          Re-upload a clearer copy
                        </button>
                        <button
                          type="button"
                          className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[#fecaca] bg-[#fee2e2] text-[0.8rem] font-bold text-[#7f1d1d] transition hover:bg-[#fecaca]"
                          onClick={() => setUpload((u) => u ? { ...u, status: 'done' } : u)}
                        >
                          Proceed anyway
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Done state ── */}
                  {upload?.status === 'done' && upload.result && (
                    <div className="space-y-3">

                      {/* Blur action banner */}
                      {blurIsActive ? (
                        <div className={`overflow-hidden rounded-xl border ${
                          upload.blurPreCheck.severity === 'severe' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                        }`}>
                          <div className="flex gap-3 px-4 py-4">
                            <AlertCircle
                              className="mt-0.5 h-5 w-5 shrink-0"
                              style={{ color: upload.blurPreCheck.severity === 'severe' ? '#b91c1c' : '#b45309' }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="m-0 text-[0.875rem] font-bold leading-snug"
                                style={{ color: upload.blurPreCheck.severity === 'severe' ? '#7f1d1d' : '#78350f' }}>
                                {upload.blurPreCheck.severity === 'severe'
                                  ? 'This document may get rejected due to blur'
                                  : 'This document may be queried — slight blur detected'}
                              </p>
                              <p className="m-0 mt-1 text-[0.8125rem] leading-relaxed"
                                style={{ color: upload.blurPreCheck.severity === 'severe' ? '#991b1b' : '#92400e' }}>
                                {upload.blurPreCheck.detail}
                              </p>
                            </div>
                          </div>
                          <div className={`flex gap-2 border-t px-4 py-3 ${
                            upload.blurPreCheck.severity === 'severe' ? 'border-red-200 bg-[#fff5f5]' : 'border-amber-200 bg-amber-100/60'
                          }`}>
                            <button
                              type="button"
                              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg text-[0.8125rem] font-bold text-white transition hover:opacity-90"
                              style={{ background: upload.blurPreCheck.severity === 'severe' ? '#b91c1c' : '#b45309' }}
                              onClick={clearUpload}
                            >
                              <span className="material-symbols-outlined text-[1rem]">upload</span>
                              Re-upload a clearer copy
                            </button>
                            <button
                              type="button"
                              className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[#eceee9] bg-white text-[0.8125rem] font-bold text-[#374151] transition hover:bg-[#eef0ec]"
                              onClick={() => setBlurAcknowledged(true)}
                            >
                              Continue with this document
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Approval score */}
                      <ApprovalScoreCard result={upload.result} blurPreCheck={upload.blurPreCheck} />

                      {/* Document preview card */}
                      <div className="fsm-preview">
                        <div className="fsm-preview__head">
                          <div className="min-w-0">
                            <p className="m-0 text-[0.8125rem] font-bold text-[#1a1c1a]">Document preview</p>
                            <p className="m-0 mt-0.5 text-[0.72rem] text-[#5c6560]">
                              {upload.result.passedAsIs
                                ? 'Kept as uploaded — already within 1 MB portal limit'
                                : 'Enhanced & compressed for portal submission'}
                            </p>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-bold whitespace-nowrap"
                            style={{
                              background: upload.result.passedAsIs ? fp.primarySoft : '#eff6ff',
                              color: upload.result.passedAsIs ? fp.primary : '#1e40af',
                            }}
                          >
                            {upload.result.passedAsIs
                              ? `${upload.result.originalSizeLabel} · unchanged`
                              : `${upload.result.originalSizeLabel} → ${upload.result.optimizedSizeLabel}`}
                          </span>
                        </div>

                        {pages.length > 1 ? (
                          <div className="flex gap-1.5 overflow-x-auto border-b border-[#eceee9] px-4 py-2.5">
                            {pages.map((pg, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPageIdx(i)}
                                className={`h-11 w-9 shrink-0 overflow-hidden rounded-lg border-2 transition ${pageIdx === i ? 'border-[#1F5E3B]' : 'border-transparent hover:border-[#c5d9cc]'}`}
                              >
                                <img src={pg.afterUrl} alt="" className="h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div className="fsm-preview__img-wrap">
                          <img
                            src={(curPage && curPage.afterUrl) || upload.result.optimizedPreviewUrl}
                            alt="Processed document preview"
                            className="fsm-preview__img"
                          />
                        </div>

                        <div className="border-t border-[#eceee9] px-4 py-3 text-center text-[0.75rem] leading-relaxed text-[#5c6560]">
                          {upload.result.passedAsIs
                            ? 'OCR and quality checks completed on your original file — no re-compression applied.'
                            : `Contrast improved · ${upload.result.compressionPct > 0 ? `−${upload.result.compressionPct}% smaller · ` : ''}sized for portal rules.`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Navigation row ── */}
                  <div className="fsm-submit-row">
                    <button
                      type="button"
                      className="fsm-submit-row__back"
                      onClick={() => setStep(1)}
                    >
                      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!docReady}
                      className="fsm-submit-row__next"
                      style={{ background: docReady ? fp.primary : undefined }}
                      onClick={() => {
                        if (!docReady) { addToast('Upload your document first.', 'error', 3500); return; }
                        setStep(3);
                      }}
                    >
                      Continue to verification
                    </button>
                  </div>

                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fsm-stage__inner">
                  <div className="fsm-panel">
                    <h2 className="fsm-panel__title">Detected information</h2>
                    <p className="fsm-panel__lead">Confirm or correct values extracted from your documents.</p>
                    <div className="fsm-form-grid">
                      {[
                        ['farmerName', 'Farmer name'],
                        ['aadhaarLast4', 'Aadhaar last 4 digits'],
                      ].map(([key, label]) => (
                        <label key={key} className="fsm-field">
                          <span className="fsm-field__label">{label}</span>
                          <input
                            className="fsm-field__input"
                            value={mergedFields[key] || ''}
                            onChange={(e) => setMergedFields((m) => ({ ...m, [key]: e.target.value }))}
                          />
                        </label>
                      ))}
                    </div>
                    <label className="fsm-declaration">
                      <input type="checkbox" className="h-4 w-4 shrink-0" style={{ accentColor: fp.primary }} checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} />
                      <span>I declare that the information is true to the best of my knowledge.</span>
                    </label>
                    <button
                      type="button"
                      disabled={!declaration}
                      className="fsm-panel__submit"
                      style={{ background: declaration ? fp.primary : undefined }}
                      onClick={handleSubmit}
                    >
                      Submit application
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="fsm-stage__inner">
                  <div className="fsm-panel fsm-success-card">
                    <CheckCircle className="mx-auto h-16 w-16 text-[#1F5E3B]" strokeWidth={1.25} aria-hidden />
                    <p className="m-0 mt-4 text-lg font-bold text-[#1a1c1a]">Submitted successfully</p>
                    <p className="fsm-success__ref">{submitRef}</p>
                    <p className="fsm-success__note">You will receive SMS updates when the status changes.</p>
                    <FileText className="mx-auto mt-6 h-8 w-8 text-[#c5cbc7]" aria-hidden />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

      </div>{/* body flex row */}
    </motion.div>
  );
}
