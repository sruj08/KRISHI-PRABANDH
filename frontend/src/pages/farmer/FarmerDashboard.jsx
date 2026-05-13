import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvEngine } from '../../utils/cvEngine';
import { useAuth } from '../../context/AuthContext';
import './farmer-dashboard.css';

const FCFS_UPLOAD_CALLOUT = (
  <>
    <strong style={{ color: '#4a4429' }}>Note:</strong> MahaDBT works on a first-come, first-served basis.
    Unclear documents are often returned, which moves you back in the queue. Use a steady photo or PDF
    and let the on-device check finish before you continue.
  </>
);

const BLUR_FEEDBACK =
  'This image is too soft or heavily compressed for reliable reading. Retake with good light, a clean lens, and avoid sending through chat apps that shrink files.';

const CLEAR_FEEDBACK =
  'Readability check passed. File size has been adjusted to stay within the usual upload limit for this portal.';

/** Shown when scan is usable but quality is uncertain — farmer chooses retake or attach */
const RISKY_QUALITY_INTRO =
  'This photo may be hard for an officer to read. It could be returned or rejected later, which often means a delay of several weeks and can affect your place in the queue.';

const RISKY_QUALITY_CHOICE =
  'You can retake a clearer photo, attach this file anyway, or submit it with your application — the choice is yours.';

const COMPRESSION_LINE = 'Compressing to Government limits (500 KB)… Done.';

const SUBMIT_SUCCESS =
  'Receipt and fee are on record. Your file is ready for office processing on readability checks you cleared at upload.';

/** Stages before filing the application record (no receipt yet) */
const APPLICATION_STAGES = [
  {
    key: 'scheme',
    label: 'Scheme type',
    headline: 'Choose your scheme & component',
    description:
      'Select the MahaDBT scheme line and the exact sub-component (e.g. drip irrigation, tractor). This decides subsidy rules for your case.',
  },
  {
    key: 'requirements',
    label: 'Requirements',
    headline: 'Quantity & declaration',
    description:
      'Enter the quantity or size you are claiming (pipe length, HP, area, etc.) and confirm you accept the Terms & Conditions.',
  },
  {
    key: 'submitApp',
    label: 'Submit application',
    headline: 'Submit your application',
    description:
      'File your application with scheme and declaration. After submission you will see your progress here — next you will upload the dealer / equipment receipt, then pay the processing fee.',
    isSubmitStep: true,
  },
];

/** After application is filed — sequential follow-up tasks */
const POST_SUBMIT_STEPS = [
  { key: 'filed', label: 'Application submitted', icon: 'check_circle' },
  { key: 'receipt', label: 'Upload equipment receipt', icon: 'document_scanner' },
  { key: 'fee', label: 'Pay processing fee', icon: 'payments' },
];

const initialSlotState = () => ({
  attached: null,
  feedback: null,
  compressNote: false,
  lowQualityAck: false,
});

function ReadabilityCallout() {
  return (
    <div className="farmer-dash-callout farmer-dash-callout--queue" role="status">
      <span className="material-symbols-outlined">info</span>
      <div>{FCFS_UPLOAD_CALLOUT}</div>
    </div>
  );
}

function ScanFeedbackBox({ variant, children }) {
  const isBlur = variant === 'blur';
  return (
    <div
      role="alert"
      className={`farmer-dash-scan-feedback ${isBlur ? 'farmer-dash-scan-feedback--error' : 'farmer-dash-scan-feedback--ok'}`}
    >
      <span className="material-symbols-outlined">{isBlur ? 'front_hand' : 'verified'}</span>
      <div>
        <div className="farmer-dash-scan-feedback-title">{isBlur ? 'Needs a clearer copy' : 'Check passed'}</div>
        {children}
      </div>
    </div>
  );
}

function SmartUploadSlot({
  title,
  subtitle,
  showFcfsCallout,
  disabled,
  isProcessing,
  slotState,
  inputId,
  onFileChange,
}) {
  return (
    <div className="farmer-dash-upload-block">
      <h4 className="farmer-dash-upload-title">{title}</h4>
      {subtitle && <p className="farmer-dash-upload-sub">{subtitle}</p>}
      {showFcfsCallout && <ReadabilityCallout />}
      <div
        className="drag-drop-zone farmer-dash-drag"
        style={{ position: 'relative', opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          disabled={disabled}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
        <span className="material-symbols-outlined drag-icon" style={{ color: 'var(--success, #2d6b48)' }}>
          document_scanner
        </span>
        <p style={{ margin: 'var(--sp-2) 0', fontWeight: 600 }}>Snap &amp; check — tap to upload or use camera</p>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max 500 KB after optimization · PDF accepted</span>
      </div>
      {isProcessing && (
        <div className="farmer-dash-processing">
          <span className="material-symbols-outlined farmer-dash-spin">progress_activity</span>
          Document check in progress…
        </div>
      )}
      {slotState.feedback === 'blur' && (
        <ScanFeedbackBox variant="blur">{BLUR_FEEDBACK}</ScanFeedbackBox>
      )}
      {slotState.feedback === 'clear' && (
        <ScanFeedbackBox variant="clear">
          <div>{CLEAR_FEEDBACK}</div>
          {slotState.compressNote && (
            <div className="farmer-dash-hint" style={{ marginTop: 10, fontWeight: 600, color: '#2d5a34' }}>
              {COMPRESSION_LINE}
            </div>
          )}
        </ScanFeedbackBox>
      )}
      {slotState.attached && !slotState.feedback && (
        <div className="farmer-dash-attached">
          <div className="farmer-dash-attached-row">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              check_circle
            </span>
            Attached — {((slotState.attached.size ?? 0) / 1024).toFixed(1)} KB
          </div>
          {slotState.lowQualityAck && (
            <div className="farmer-dash-attached-note">
              You attached a file that was flagged as marginal quality. Keep a clearer copy with you if the office requests it.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Progress through application stages (post-registration) */
function ApplicationProgressBar({ activeIndex, totalStages }) {
  const pct = Math.min(100, Math.round(((activeIndex + 1) / totalStages) * 100));
  return (
    <div className="farmer-dash-progress-wrap">
      <div className="farmer-dash-progress-head">
        <span className="farmer-dash-progress-label">Application progress</span>
        <span className="farmer-dash-progress-meta">
          Stage {activeIndex + 1} of {totalStages}
        </span>
      </div>
      <div className="farmer-dash-progress-track">
        <div className="farmer-dash-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StageChecklist({ stages, activeIndex }) {
  return (
    <div className="farmer-dash-checklist">
      {stages.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div
            key={s.key}
            className={`farmer-dash-checklist-row ${done ? 'farmer-dash-checklist-row--done' : ''} ${current ? 'farmer-dash-checklist-row--current' : ''}`}
          >
            <span className="material-symbols-outlined">
              {done ? 'check_circle' : current ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
            <span>{s.label}</span>
            {current && <span className="farmer-dash-now-badge">Current</span>}
          </div>
        );
      })}
    </div>
  );
}

function PostSubmitProgressBar({ receiptOk, feePaid, dossierComplete, postSubmitPhaseIndex }) {
  const pct = dossierComplete
    ? 100
    : Math.round(((1 + (receiptOk ? 1 : 0) + (feePaid ? 1 : 0)) / 3) * 100);
  return (
    <div className="farmer-dash-progress-wrap">
      <div className="farmer-dash-progress-head">
        <span className="farmer-dash-progress-label">Application status</span>
        <span className="farmer-dash-progress-meta">{pct}% complete</span>
      </div>
      <div className="farmer-dash-segments">
        {POST_SUBMIT_STEPS.map((s, i) => {
          const submittedMilestone = i === 0;
          const receiptStep = i === 1;
          const feeStep = i === 2;
          const done =
            dossierComplete
            || submittedMilestone
            || (receiptStep && receiptOk)
            || (feeStep && feePaid);
          const current =
            !dossierComplete
            && ((receiptStep && postSubmitPhaseIndex === 0 && !receiptOk)
              || (feeStep && postSubmitPhaseIndex === 1 && !feePaid && receiptOk));
          return (
            <div
              key={s.key}
              className={`farmer-dash-segment ${done ? 'farmer-dash-segment--done' : ''} ${current ? 'farmer-dash-segment--active' : ''}`}
            >
              <span className="material-symbols-outlined">{s.icon}</span>
              {s.label}
            </div>
          );
        })}
      </div>
      <div className="farmer-dash-progress-track">
        <div className="farmer-dash-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PostSubmitChecklist({ receiptOk, feePaid, postSubmitPhaseIndex }) {
  return (
    <div className="farmer-dash-post-steps">
      <div className="farmer-dash-post-steps-title">Steps after submission</div>
      <div className="farmer-dash-post-step farmer-dash-post-step--done">
        <span className="material-symbols-outlined">check_circle</span>
        Application filed — queue position recorded
      </div>
      <div
        className={`farmer-dash-post-step ${receiptOk ? 'farmer-dash-post-step--done' : postSubmitPhaseIndex === 0 ? 'farmer-dash-post-step--current' : 'farmer-dash-post-step--pending'}`}
      >
        <span className="material-symbols-outlined">
          {receiptOk ? 'check_circle' : postSubmitPhaseIndex === 0 ? 'edit_calendar' : 'radio_button_unchecked'}
        </span>
        Upload dealer bill / equipment receipt
        {postSubmitPhaseIndex === 0 && !receiptOk && <span className="farmer-dash-now-badge">Current</span>}
      </div>
      <div
        className={`farmer-dash-post-step ${feePaid ? 'farmer-dash-post-step--done' : postSubmitPhaseIndex === 1 ? 'farmer-dash-post-step--current' : 'farmer-dash-post-step--pending'}`}
      >
        <span className="material-symbols-outlined">
          {feePaid ? 'check_circle' : postSubmitPhaseIndex === 1 ? 'payments' : 'radio_button_unchecked'}
        </span>
        Pay ₹23.60 processing fee (UPI / QR)
        {postSubmitPhaseIndex === 1 && !feePaid && receiptOk && <span className="farmer-dash-now-badge">Current</span>}
      </div>
    </div>
  );
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /** 'register' = profile only; 'application' = staged dossier after registration */
  const [phase, setPhase] = useState('register');
  const [regStep, setRegStep] = useState(1);
  const [activeAppStage, setActiveAppStage] = useState(0);
  const [applicationId, setApplicationId] = useState(null);

  const [scannerReady, setScannerReady] = useState(typeof window !== 'undefined' && !!window.cvReady && !!window.cv);
  const [agriStackSimulated, setAgriStackSimulated] = useState(false);
  const [category, setCategory] = useState('');
  const [scheme, setScheme] = useState('');
  const [subComponent, setSubComponent] = useState('');
  const [quantity, setQuantity] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [feePaid, setFeePaid] = useState(false);

  const [slots, setSlots] = useState({
    caste: initialSlotState(),
    disability: initialSlotState(),
    equipmentReceipt: initialSlotState(),
  });

  const [processingSlot, setProcessingSlot] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [postSubmitPhaseIndex, setPostSubmitPhaseIndex] = useState(0);
  const [dossierComplete, setDossierComplete] = useState(false);

  const totalAppStages = APPLICATION_STAGES.length;

  const currentStage = APPLICATION_STAGES[activeAppStage];

  useEffect(() => {
    if (scannerReady) return;
    const t = setInterval(() => {
      if (window.cvReady && window.cv) {
        setScannerReady(true);
        clearInterval(t);
      }
    }, 400);
    return () => clearInterval(t);
  }, [scannerReady]);

  useEffect(() => {
    if (regStep !== 1 || agriStackSimulated) return;
    const timer = setTimeout(() => setAgriStackSimulated(true), 900);
    return () => clearTimeout(timer);
  }, [regStep, agriStackSimulated]);

  const setSlot = useCallback((key, patch) => {
    setSlots((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  const runPdfSim = useCallback(
    (file, slotKey) => {
      setProcessingSlot(slotKey);
      setGlobalError('');
      setSlot(slotKey, { feedback: null, compressNote: false });
      setTimeout(() => {
        setProcessingSlot(null);
        setPreviewTarget(slotKey);
        setPreviewData({
          type: 'pdf',
          qualityTier: 'clear',
          originalSrc: URL.createObjectURL(file),
          optimizedSrc: URL.createObjectURL(file),
          blob: file,
          originalSize: file.size,
          optimizedSize: file.size > 500 * 1024 ? 485.2 * 1024 : file.size,
          readabilityScore: 98,
          rawVariance: 'N/A (vector PDF)',
        });
        setSlot(slotKey, { feedback: 'clear', compressNote: true });
      }, 1200);
    },
    [setSlot],
  );

  const handleUpload = async (e, slotKey) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!scannerReady && file.type !== 'application/pdf') {
      setGlobalError('Smart scanner is still loading. Please wait a few seconds and try again, or upload a PDF for now.');
      return;
    }
    setGlobalError('');

    if (file.type === 'application/pdf') {
      runPdfSim(file, slotKey);
      return;
    }

    setProcessingSlot(slotKey);
    setSlot(slotKey, { feedback: null, compressNote: false, attached: null });

    const result = await cvEngine.process(file);
    setProcessingSlot(null);

    if (result.reason === 'OPENCV_NOT_READY') {
      setGlobalError('Smart scanner is still loading. Please wait a few seconds and try again.');
      return;
    }

    if (!result.blob) {
      setGlobalError('This file could not be prepared. Try another photo or a PDF.');
      return;
    }

    const tier = result.qualityTier === 'clear' ? 'clear' : 'risky';
    setPreviewTarget(slotKey);
    setPreviewData({
      type: 'image',
      qualityTier: tier,
      originalSrc: result.originalPreview,
      optimizedSrc: result.preview,
      blob: result.blob,
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      readabilityScore: result.readabilityScore,
      rawVariance: result.rawVariance,
    });
    if (tier === 'clear') {
      setSlot(slotKey, { feedback: 'clear', compressNote: true, attached: null, lowQualityAck: false });
    } else {
      setSlot(slotKey, { feedback: null, compressNote: false, attached: null, lowQualityAck: false });
    }
  };

  const handleConfirmAttach = () => {
    if (!previewData?.blob || !previewTarget) return;
    const blob = previewData.blob;
    const risky = previewData.qualityTier === 'risky';
    setSlot(previewTarget, {
      attached: blob,
      feedback: null,
      compressNote: false,
      lowQualityAck: risky,
    });
    setPreviewData(null);
    setPreviewTarget(null);
  };

  const dismissPreview = (clearSlotFeedback) => {
    if (clearSlotFeedback && previewTarget) {
      setSlot(previewTarget, { feedback: null, compressNote: false });
    }
    setPreviewData(null);
    setPreviewTarget(null);
  };

  const receiptOk = slots.equipmentReceipt.attached;
  const canCompleteDossier = receiptOk && feePaid;

  const profileSaveOk = category && slots.caste.attached;
  const requirementsOk = quantity.trim().length > 0 && termsAccepted;
  const schemeOk = scheme && subComponent;

  const registerApplication = () => {
    const id = `MH-MDBT-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000)).slice(0, 5)}`;
    setApplicationId(id);
    setPhase('application');
    setActiveAppStage(0);
    setGlobalError('');
  };

  const stageAdvanceGuard = useMemo(() => {
    if (!currentStage) return false;
    switch (currentStage.key) {
      case 'scheme':
        return schemeOk;
      case 'requirements':
        return requirementsOk;
      case 'submitApp':
        return schemeOk && requirementsOk;
      default:
        return false;
    }
  }, [currentStage, schemeOk, requirementsOk]);

  const fileApplicationRecord = () => {
    if (!schemeOk || !requirementsOk) return;
    setPhase('postSubmit');
    setPostSubmitPhaseIndex(0);
    setFeePaid(false);
  };

  const goNextStage = () => {
    if (activeAppStage >= totalAppStages - 1) return;
    if (!stageAdvanceGuard) return;
    setActiveAppStage((i) => Math.min(i + 1, totalAppStages - 1));
  };

  const goPrevStage = () => {
    setActiveAppStage((i) => Math.max(0, i - 1));
  };

  return (
    <div className="farmer-dash-root">
      {!scannerReady && (
        <div className="farmer-dash-sync-banner">
          <span className="material-symbols-outlined farmer-dash-spin">hourglass_top</span>
          Preparing document check…
        </div>
      )}

      <main className="farmer-dash-main">
        <header className="farmer-dash-page-head">
          <h1 className="farmer-dash-page-title">Namaste, {user?.name || 'Farmer'}</h1>
          <p className="farmer-dash-page-meta">
            Farmer ID: <strong>{user?.agristack_id || user?.username || 'MH-AGR-2026-0001'}</strong>
            {(phase === 'application' || phase === 'postSubmit' || dossierComplete) && applicationId && (
              <>
                {' '}
                · <span className="farmer-dash-ref">{applicationId}</span>
                {dossierComplete && <span> · Dossier complete</span>}
                {!dossierComplete && phase === 'postSubmit' && <span> · Filed</span>}
              </>
            )}
          </p>
        </header>

        {globalError && <div className="farmer-dash-alert farmer-dash-alert--error">{globalError}</div>}

        {/* ── REGISTRATION: only AgriStack + profile (no bank proof) ── */}
        {phase === 'register' && regStep === 1 && (
          <div className="farmer-dash-card">
            <div className="farmer-dash-card-head">
              <div className="farmer-dash-card-head-icon">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <span className="farmer-dash-eyebrow">Registration · Step 1 of 2</span>
                <h2 className="farmer-dash-card-title">AgriStack profile</h2>
                <p className="farmer-dash-card-lead">
                  You are signed in with Farmer ID and OTP. Land and crop references are pulled from AgriStack so you do not re-enter them here.
                </p>
              </div>
            </div>
            {!agriStackSimulated ? (
              <div className="farmer-dash-loading-row">
                <span className="material-symbols-outlined farmer-dash-spin">sync</span>
                Retrieving profile from AgriStack…
              </div>
            ) : (
              <div className="farmer-dash-info-panel">
                <strong>Profile pre-filled from registry</strong>
                <ul>
                  <li>7/12 land extract — linked</li>
                  <li>Crop declaration (Pik Pahani) — Kharif 2026</li>
                  <li>Bank on record — masked account ending 4120</li>
                </ul>
              </div>
            )}
            <div className="farmer-dash-actions" style={{ marginTop: 18 }}>
              <button type="button" className="btn btn-success" style={{ width: '100%' }} disabled={!agriStackSimulated} onClick={() => setRegStep(2)}>
                Continue to certificates
              </button>
            </div>
          </div>
        )}

        {phase === 'register' && regStep === 2 && (
          <div className="farmer-dash-card">
            <span className="farmer-dash-eyebrow">Registration · Step 2 of 2</span>
            <h2 className="farmer-dash-card-title" style={{ marginTop: 6 }}>
              Category and certificates
            </h2>
            <p className="farmer-dash-card-lead" style={{ marginBottom: 18 }}>
              Complete this step to open the application workspace. Scheme choice and filing come first; equipment receipt and fee are recorded after submission.
            </p>

            <div className="farmer-dash-field-group">
              <label className="farmer-dash-label" htmlFor="farmer-category">
                Category
              </label>
              <select
                id="farmer-category"
                className="farmer-dash-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <SmartUploadSlot
              title="Caste / category certificate"
              subtitle="Required for SC/ST/OBC. Smart scan protects your queue position."
              showFcfsCallout
              disabled={!!processingSlot}
              isProcessing={processingSlot === 'caste'}
              slotState={slots.caste}
              inputId="upload-caste"
              onFileChange={(e) => handleUpload(e, 'caste')}
            />

            <SmartUploadSlot
              title="Disability certificate (if applicable)"
              subtitle="Optional — same smart scan if you upload."
              showFcfsCallout={false}
              disabled={!!processingSlot}
              isProcessing={processingSlot === 'disability'}
              slotState={slots.disability}
              inputId="upload-disability"
              onFileChange={(e) => handleUpload(e, 'disability')}
            />

            <div className="farmer-dash-actions" style={{ marginTop: 8 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRegStep(1)}>
                Back
              </button>
              <button type="button" className="btn btn-success" style={{ flex: 2 }} disabled={!profileSaveOk} onClick={registerApplication}>
                Open application workspace
              </button>
            </div>
            {!profileSaveOk && (
              <p className="farmer-dash-hint farmer-dash-hint--center">Select category and attach a valid caste certificate where applicable.</p>
            )}
          </div>
        )}

        {/* ── APPLICATION TRACKER (after registration) ── */}
        {phase === 'application' && currentStage && (
          <>
            <ApplicationProgressBar activeIndex={activeAppStage} totalStages={totalAppStages} />
            <StageChecklist stages={APPLICATION_STAGES} activeIndex={activeAppStage} />

            <div className="farmer-dash-card">
              <div className="farmer-dash-card__top">
                <div className="farmer-dash-step-pill">
                  <span className="material-symbols-outlined">edit_note</span>
                  Current task
                </div>
                <h2 className="farmer-dash-stage-title">{currentStage.headline}</h2>
                <p className="farmer-dash-stage-desc">{currentStage.description}</p>
              </div>

              {currentStage.key === 'scheme' && (
                <>
                  <div className="farmer-dash-field-group">
                    <label className="farmer-dash-label" htmlFor="farmer-scheme-line">
                      Scheme line
                    </label>
                    <select
                      id="farmer-scheme-line"
                      className="farmer-dash-select"
                      value={scheme}
                      onChange={(e) => {
                        setScheme(e.target.value);
                        setSubComponent('');
                      }}
                    >
                      <option value="">Select scheme type</option>
                      <option value="mech">Agricultural mechanization</option>
                      <option value="irrigation">Micro irrigation</option>
                      <option value="seeds">Certified seeds &amp; inputs</option>
                    </select>
                  </div>
                  <div className="farmer-dash-field-group">
                    <label className="farmer-dash-label" htmlFor="farmer-subcomponent">
                      Sub-component
                    </label>
                    <select
                      id="farmer-subcomponent"
                      className="farmer-dash-select"
                      value={subComponent}
                      onChange={(e) => setSubComponent(e.target.value)}
                      disabled={!scheme}
                    >
                      <option value="">{scheme ? 'Select sub-component' : 'Choose scheme line first'}</option>
                      {scheme === 'mech' && (
                        <>
                          <option value="tractor">Tractor / power tiller</option>
                          <option value="thresher">Thresher</option>
                        </>
                      )}
                      {scheme === 'irrigation' && (
                        <>
                          <option value="drip">Drip irrigation</option>
                          <option value="sprinkler">Sprinkler system</option>
                        </>
                      )}
                      {scheme === 'seeds' && (
                        <>
                          <option value="hybrid">Hybrid seed kit</option>
                          <option value="biofert">Bio-fertilizer pack</option>
                        </>
                      )}
                    </select>
                  </div>
                </>
              )}

              {currentStage.key === 'requirements' && (
                <>
                  <div className="farmer-dash-field-group">
                    <label className="farmer-dash-label" htmlFor="farmer-quantity">
                      Quantity / size
                    </label>
                    <input
                      id="farmer-quantity"
                      type="text"
                      className="farmer-dash-input"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 120 m pipe, 35 HP"
                    />
                  </div>
                  <label className="farmer-dash-checkbox-row">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span>I accept the Terms &amp; Conditions and confirm the details are correct.</span>
                  </label>
                </>
              )}

              {currentStage.key === 'submitApp' && (
                <div className="farmer-dash-summary-box">
                  <strong>Summary</strong>
                  <ul>
                    <li>Scheme: {scheme ? `${scheme} / ${subComponent}` : '—'}</li>
                    <li>Quantity / note: {quantity || '—'}</li>
                    <li>Terms accepted: {termsAccepted ? 'Yes' : 'No'}</li>
                  </ul>
                  <p style={{ margin: '12px 0 0', fontSize: 12, color: '#717972' }}>
                    Submitting places the application in the queue. You will then upload the equipment receipt and pay the fee on the following screens.
                  </p>
                </div>
              )}

              <div className="farmer-dash-actions">
                <button type="button" className="btn btn-outline" style={{ minWidth: 100 }} onClick={goPrevStage} disabled={activeAppStage === 0}>
                  Back
                </button>
                {currentStage.key === 'submitApp' ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={!stageAdvanceGuard}
                    onClick={fileApplicationRecord}
                  >
                    Submit application
                  </button>
                ) : (
                  <button type="button" className="btn btn-success" disabled={!stageAdvanceGuard} onClick={goNextStage}>
                    Save &amp; continue
                  </button>
                )}
              </div>
              {currentStage.key === 'submitApp' && !stageAdvanceGuard && (
                <p className="farmer-dash-hint">Complete scheme and declaration to enable submit.</p>
              )}
            </div>
          </>
        )}

        {phase === 'postSubmit' && !dossierComplete && (
          <>
            <div className="farmer-dash-filed-banner">
              <div className="farmer-dash-filed-inner">
                <span className="material-symbols-outlined">task_alt</span>
                <div>
                  <div className="farmer-dash-filed-title">Application filed</div>
                  <div className="farmer-dash-filed-meta">
                    Reference <strong>{applicationId}</strong>. Complete receipt upload, then the processing fee.
                  </div>
                </div>
              </div>
            </div>

            <PostSubmitProgressBar
              receiptOk={receiptOk}
              feePaid={feePaid}
              dossierComplete={dossierComplete}
              postSubmitPhaseIndex={postSubmitPhaseIndex}
            />
            <PostSubmitChecklist receiptOk={receiptOk} feePaid={feePaid} postSubmitPhaseIndex={postSubmitPhaseIndex} />

            {postSubmitPhaseIndex === 0 && (
              <div className="farmer-dash-card">
                <div className="farmer-dash-card__top">
                  <div className="farmer-dash-step-pill">
                    <span className="material-symbols-outlined">receipt_long</span>
                    Current task
                  </div>
                  <h2 className="farmer-dash-stage-title">Upload dealer bill or equipment receipt</h2>
                  <p className="farmer-dash-stage-desc">
                    Upload a legible photo of the bill, delivery challan, or dealer receipt for the equipment or material covered by this application.
                  </p>
                </div>
                <SmartUploadSlot
                  title="Dealer bill / equipment receipt"
                  subtitle="Bill, challan, or receipt for the farm equipment or material under this application."
                  showFcfsCallout
                  disabled={!!processingSlot}
                  isProcessing={processingSlot === 'equipmentReceipt'}
                  slotState={slots.equipmentReceipt}
                  inputId="upload-equipment-receipt"
                  onFileChange={(e) => handleUpload(e, 'equipmentReceipt')}
                />
                <div className="farmer-dash-actions" style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-success" style={{ width: '100%' }} disabled={!receiptOk} onClick={() => setPostSubmitPhaseIndex(1)}>
                    Save &amp; continue
                  </button>
                </div>
                {!receiptOk && <p className="farmer-dash-hint">Attach a receipt to continue to the fee step.</p>}
              </div>
            )}

            {postSubmitPhaseIndex === 1 && (
              <div className="farmer-dash-card">
                <div className="farmer-dash-card__top">
                  <div className="farmer-dash-step-pill">
                    <span className="material-symbols-outlined">payments</span>
                    Current task
                  </div>
                  <h2 className="farmer-dash-stage-title">Processing fee</h2>
                  <p className="farmer-dash-stage-desc">
                    Pay the <strong>₹23.60</strong> processing fee via UPI or QR (simulated for this demo). Then mark the dossier complete.
                  </p>
                </div>
                {!feePaid ? (
                  <button type="button" className="btn btn-success" style={{ width: '100%', marginBottom: 12 }} onClick={() => setFeePaid(true)}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6, fontSize: 20 }}>
                      qr_code_2
                    </span>
                    Pay ₹23.60 (demo)
                  </button>
                ) : (
                  <div className="farmer-dash-paid-strip">
                    <span className="material-symbols-outlined">payments</span>
                    Payment recorded (demo)
                  </div>
                )}
                <div className="farmer-dash-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setPostSubmitPhaseIndex(0)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-success" disabled={!canCompleteDossier} onClick={() => setDossierComplete(true)}>
                    Complete application
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {dossierComplete && (
          <div className="farmer-dash-completion">
            <div className="farmer-dash-completion-icon">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h2 className="farmer-dash-completion-title">Application complete</h2>
            <p className="farmer-dash-completion-ref">
              Reference: <span className="farmer-dash-ref">{applicationId}</span>
            </p>
            <p className="farmer-dash-completion-body">{SUBMIT_SUCCESS}</p>
            <div className="farmer-dash-actions" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/login')}>
                Return to home
              </button>
            </div>
          </div>
        )}
      </main>

      {previewData && previewData.blob && (previewData.type === 'pdf' || previewData.qualityTier) && (
        <div className="modal-overlay active">
          <div className="modal-content farmer-dash-root" style={{ maxWidth: 820, width: '92%' }}>
            <div
              className="modal-header"
              style={{
                borderBottom: '1px solid #e2e3df',
                paddingBottom: 16,
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div>
                {previewData.type === 'pdf' || previewData.qualityTier === 'clear' ? (
                  <>
                    <h3 className="farmer-dash-modal-title farmer-dash-modal-title-ok">
                      <span className="material-symbols-outlined">verified</span>
                      Document check — acceptable
                    </h3>
                    <p className="farmer-dash-card-lead" style={{ marginTop: 8 }}>
                      {CLEAR_FEEDBACK}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="farmer-dash-modal-title farmer-dash-modal-title-warn">
                      <span className="material-symbols-outlined">warning</span>
                      Quality notice
                    </h3>
                    <p className="farmer-dash-card-lead" style={{ marginTop: 8, color: '#5c4a1f' }}>
                      {RISKY_QUALITY_INTRO} {RISKY_QUALITY_CHOICE}
                    </p>
                  </>
                )}
              </div>
              <button type="button" className="btn-icon" onClick={() => dismissPreview(true)} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: '1 1 280px' }}>
                <p className="farmer-dash-label" style={{ textAlign: 'center', marginBottom: 8 }}>
                  Original ({(previewData.originalSize / 1024).toFixed(1)} KB)
                </p>
                <div className="farmer-dash-modal-preview">
                  {previewData.type === 'pdf' ? (
                    <iframe src={previewData.originalSrc} title="Original PDF" style={{ width: '100%', minHeight: 220, border: 'none' }} />
                  ) : (
                    <img src={previewData.originalSrc} alt="Original" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain' }} />
                  )}
                </div>
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <p
                  className="farmer-dash-label"
                  style={{
                    textAlign: 'center',
                    marginBottom: 8,
                    color: previewData.qualityTier === 'risky' ? '#6b4f1d' : '#2d5a34',
                  }}
                >
                  Optimised for upload ({(previewData.optimizedSize / 1024).toFixed(1)} KB)
                </p>
                <div
                  className={`farmer-dash-modal-preview ${previewData.qualityTier === 'risky' ? 'farmer-dash-modal-preview--warn' : 'farmer-dash-modal-preview--ok'}`}
                >
                  {previewData.type === 'pdf' ? (
                    <iframe src={previewData.optimizedSrc} title="Optimized PDF" style={{ width: '100%', minHeight: 220, border: 'none' }} />
                  ) : (
                    <img src={previewData.optimizedSrc} alt="Optimized" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain' }} />
                  )}
                </div>
                {previewData.type !== 'pdf' && <p className="farmer-dash-hint" style={{ marginTop: 10, textAlign: 'center', fontWeight: 600 }}>{COMPRESSION_LINE}</p>}
              </div>
            </div>

            <div className="farmer-dash-modal-meta">
              <strong>Readability score:</strong> {previewData.readabilityScore}% · <strong>Variance (normalised):</strong> {previewData.rawVariance}
            </div>

            {previewData.qualityTier === 'risky' && (
              <p className="farmer-dash-hint" style={{ marginTop: -8, marginBottom: 16 }}>
                “Attach” or “Submit with application” both add this file. Retake replaces it with a new photo.
              </p>
            )}

            <div className="farmer-dash-modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => dismissPreview(true)}>
                Retake
              </button>
              {previewData.qualityTier === 'risky' ? (
                <>
                  <button type="button" className="btn btn-outline" onClick={handleConfirmAttach}>
                    Attach anyway
                  </button>
                  <button type="button" className="btn btn-success farmer-dash-btn-caution" onClick={handleConfirmAttach}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: 18 }}>
                      upload
                    </span>
                    Submit with application
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-success" onClick={handleConfirmAttach}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle' }}>
                    check_circle
                  </span>
                  Confirm &amp; attach
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
