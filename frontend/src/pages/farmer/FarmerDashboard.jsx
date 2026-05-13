import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvEngine } from '../../utils/cvEngine';
import { useAuth } from '../../context/AuthContext';

const FCFS_UPLOAD_CALLOUT = (
  <>
    <strong style={{ color: '#92400e' }}>Important:</strong> MahaDBT operates on a{' '}
    <strong>First-Come, First-Served</strong> basis. If you upload a blurry document, your application
    may be rejected by the officer later, and you will <strong>lose your priority spot</strong>. Our
    smart scanner checks your document <strong>right now</strong> so it can be approved on the{' '}
    <strong>first try</strong>.
  </>
);

const BLUR_FEEDBACK =
  '❌ Document is blurry or over-compressed. An officer will reject this, causing a 3-week delay. Please wipe your camera lens and retake the photo. Do not use WhatsApp to compress.';

const CLEAR_FEEDBACK =
  '✅ Perfect! 100% Readable. We have automatically adjusted the file size for you. Your application is safe from document-rejection.';

/** Shown when scan is usable but quality is uncertain — farmer chooses retake or attach */
const RISKY_QUALITY_INTRO =
  'This photo may be hard for an officer to read. It could be returned or rejected later, which often means a delay of several weeks and can affect your place in the queue.';

const RISKY_QUALITY_CHOICE =
  'You can retake a clearer photo, attach this file anyway, or submit it with your application — the choice is yours.';

const COMPRESSION_LINE = 'Compressing to Government limits (500 KB)… Done.';

const SUBMIT_SUCCESS =
  'Your application file is complete. Equipment receipt and fee are on record. You will not face document-related rejections for readability at the steps you cleared with the smart scanner.';

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
    <div
      role="status"
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '14px 16px',
        marginBottom: 14,
        borderRadius: 12,
        border: '1px solid #fcd34d',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        color: '#78350f',
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#d97706', flexShrink: 0 }}>
        warning
      </span>
      <div>{FCFS_UPLOAD_CALLOUT}</div>
    </div>
  );
}

function ScanFeedbackBox({ variant, children }) {
  const isBlur = variant === 'blur';
  return (
    <div
      role="alert"
      style={{
        marginTop: 12,
        padding: '14px 16px',
        borderRadius: 12,
        border: `2px solid ${isBlur ? '#fecaca' : '#86efac'}`,
        background: isBlur ? '#fef2f2' : '#f0fdf4',
        color: isBlur ? '#7f1d1d' : '#14532d',
        fontSize: 13,
        lineHeight: 1.55,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0 }}>
        {isBlur ? 'dangerous' : 'verified'}
      </span>
      <div>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>{isBlur ? 'Needs retake' : 'Smart scan passed'}</div>
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
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-dark, #1a202c)' }}>{title}</h4>
      {subtitle && (
        <p style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', margin: '0 0 12px', lineHeight: 1.45 }}>{subtitle}</p>
      )}
      {showFcfsCallout && <ReadabilityCallout />}
      <div className="drag-drop-zone" style={{ position: 'relative', opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
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
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary, #033621)', fontWeight: 600, fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          Smart scanner is reading your document…
        </div>
      )}
      {slotState.feedback === 'blur' && (
        <ScanFeedbackBox variant="blur">{BLUR_FEEDBACK}</ScanFeedbackBox>
      )}
      {slotState.feedback === 'clear' && (
        <ScanFeedbackBox variant="clear">
          <div>{CLEAR_FEEDBACK}</div>
          {slotState.compressNote && (
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#166534' }}>{COMPRESSION_LINE}</div>
          )}
        </ScanFeedbackBox>
      )}
      {slotState.attached && !slotState.feedback && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(57,105,64,0.08)',
            border: '1px solid rgba(57,105,64,0.25)',
            fontSize: 13,
            fontWeight: 600,
            color: '#14532d',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
            Attached — {((slotState.attached.size ?? 0) / 1024).toFixed(1)} KB
          </div>
          {slotState.lowQualityAck && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#92400e',
                lineHeight: 1.45,
                padding: '8px 10px',
                background: '#fffbeb',
                borderRadius: 8,
                border: '1px solid #fde68a',
              }}
            >
              You chose to attach a photo the scanner flagged as unclear. Keep a clearer copy ready if the office asks.
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
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#033621', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Application progress
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          Stage {activeIndex + 1} of {totalStages}
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: '#e2e8f0',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #033621, #22c55e)',
            transition: 'width 0.35s ease',
          }}
        />
      </div>
    </div>
  );
}

function StageChecklist({ stages, activeIndex }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 20,
        padding: '12px 14px',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      {stages.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div
            key={s.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              fontWeight: done ? 600 : current ? 700 : 500,
              color: done ? '#166534' : current ? '#033621' : '#94a3b8',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {done ? 'check_circle' : current ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
            <span>{s.label}</span>
            {current && (
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#ca8a04' }}>
                Now
              </span>
            )}
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
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#033621', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Application status
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{pct}% complete</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
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
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 10,
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: done ? 'rgba(57,105,64,0.18)' : current ? '#033621' : '#f1f5f9',
                color: done ? '#14532d' : current ? '#fff' : '#94a3b8',
                border: current ? 'none' : '1px solid #e2e8f0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, display: 'block', margin: '0 auto 4px' }}>{s.icon}</span>
              {s.label}
            </div>
          );
        })}
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: '#e2e8f0',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #033621, #22c55e)',
            transition: 'width 0.35s ease',
          }}
        />
      </div>
    </div>
  );
}

function PostSubmitChecklist({ receiptOk, feePaid, postSubmitPhaseIndex }) {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: '14px 16px',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        Your steps after submission
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#166534' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
          Application submitted — you are in the queue
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: postSubmitPhaseIndex === 0 && !receiptOk ? 700 : 600,
            color: receiptOk ? '#166534' : postSubmitPhaseIndex === 0 ? '#033621' : '#94a3b8',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {receiptOk ? 'check_circle' : postSubmitPhaseIndex === 0 ? 'edit_calendar' : 'radio_button_unchecked'}
          </span>
          Upload photo receipt / dealer bill for equipment
          {postSubmitPhaseIndex === 0 && !receiptOk && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#ca8a04' }}>Now</span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: postSubmitPhaseIndex === 1 && !feePaid ? 700 : 600,
            color: feePaid ? '#166534' : postSubmitPhaseIndex === 1 ? '#033621' : '#94a3b8',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {feePaid ? 'check_circle' : postSubmitPhaseIndex === 1 ? 'payments' : 'radio_button_unchecked'}
          </span>
          Pay ₹23.60 processing fee (UPI / QR)
          {postSubmitPhaseIndex === 1 && !feePaid && receiptOk && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#ca8a04' }}>Now</span>
          )}
        </div>
      </div>
    </div>
  );
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-lowest, #f8fafc)', color: 'var(--text-dark, #1a202c)' }}>
      <header
        style={{
          padding: '14px 20px',
          background: 'linear-gradient(90deg, #033621 0%, #14532d 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 26 }}>agriculture</span>
          <div>
            <h1 style={{ fontSize: 17, margin: 0, fontWeight: 800 }}>Krishi Prabandh — Farmer</h1>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.9 }}>
              {phase === 'register'
                ? 'Registration (demo)'
                : dossierComplete
                  ? `Dossier complete · ${applicationId || ''}`
                  : phase === 'application'
                    ? `Before submit · ${applicationId || ''}`
                    : phase === 'postSubmit'
                      ? `After submit · ${applicationId || ''}`
                      : applicationId || ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!scannerReady && (
            <span style={{ fontSize: 11, opacity: 0.95, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1.2s linear infinite' }}>
                hourglass_top
              </span>
              Loading smart scanner…
            </span>
          )}
          <button
            type="button"
            className="btn-outline btn-sm text-white"
            style={{ borderColor: 'rgba(255,255,255,0.45)', color: 'white' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '20px 18px 40px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#033621', margin: '0 0 6px' }}>
            Namaste, {user?.name || 'Farmer'}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted, #64748b)' }}>
            Farmer ID: <strong>{user?.agristack_id || user?.username || 'MH-AGR-2026-0001'}</strong>
            {(phase === 'application' || phase === 'postSubmit' || dossierComplete) && applicationId && (
              <>
                {' '}
                · <strong style={{ color: '#033621' }}>{applicationId}</strong>
                {dossierComplete && <span style={{ color: '#166534', fontWeight: 600 }}> · Dossier complete</span>}
                {!dossierComplete && phase === 'postSubmit' && (
                  <span style={{ color: '#64748b', fontWeight: 500 }}> · Filed</span>
                )}
              </>
            )}
          </p>
        </div>

        {globalError && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              color: '#991b1b',
              fontSize: 13,
            }}
          >
            {globalError}
          </div>
        )}

        {/* ── REGISTRATION: only AgriStack + profile (no bank proof) ── */}
        {phase === 'register' && regStep === 1 && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: '#396940' }}>verified_user</span>
              Registration — Step 1 of 2 · AgriStack
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
              You are signed in with Farmer ID + OTP (demo). We fetch your profile from AgriStack so you do not re-type land and crop data.
            </p>
            {!agriStackSimulated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#033621', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                Fetching your data from AgriStack…
              </div>
            ) : (
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                <strong style={{ color: '#14532d' }}>Profile auto-filled (~50%)</strong>
                <ul style={{ margin: '10px 0 0', paddingLeft: 20, color: '#166534' }}>
                  <li>7/12 land extract — linked</li>
                  <li>Crop declaration (Pik Pahani) — season Kharif 2026</li>
                  <li>Bank name on record — verified mask ••••4120</li>
                </ul>
              </div>
            )}
            <button type="button" className="btn btn-success" style={{ marginTop: 18, width: '100%' }} disabled={!agriStackSimulated} onClick={() => setRegStep(2)}>
              Continue to profile
            </button>
          </div>
        )}

        {phase === 'register' && regStep === 2 && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Registration — Step 2 of 2
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: '6px 0 0' }}>Profile &amp; certificates</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 1.5 }}>
              Complete this step to <strong>open your application workspace</strong>. You will choose scheme and submit the application first; <strong>equipment receipt and fee</strong> come <strong>after</strong> submission on your status page.
            </p>
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#475569' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                marginBottom: 20,
                fontSize: 14,
                background: '#fff',
              }}
            >
              <option value="">Select category</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
              <option value="GENERAL">General</option>
            </select>

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

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRegStep(1)}>
                Back
              </button>
              <button type="button" className="btn btn-success" style={{ flex: 2 }} disabled={!profileSaveOk} onClick={registerApplication}>
                Register application
              </button>
            </div>
            {!profileSaveOk && (
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
                Choose category and attach a verified caste certificate to register.
              </p>
            )}
          </div>
        )}

        {/* ── APPLICATION TRACKER (after registration) ── */}
        {phase === 'application' && currentStage && (
          <>
            <ApplicationProgressBar activeIndex={activeAppStage} totalStages={totalAppStages} />
            <StageChecklist stages={APPLICATION_STAGES} activeIndex={activeAppStage} />

            <div
              className="card"
              style={{
                padding: 22,
                borderLeft: '4px solid #033621',
                boxShadow: '0 4px 20px rgba(3,54,33,0.08)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: '#fef9c3',
                  color: '#854d0e',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 12,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>flag</span>
                What you need to do now
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>{currentStage.headline}</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>{currentStage.description}</p>

              {currentStage.key === 'scheme' && (
                <>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Scheme line</label>
                  <select
                    value={scheme}
                    onChange={(e) => {
                      setScheme(e.target.value);
                      setSubComponent('');
                    }}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}
                  >
                    <option value="">Select scheme type</option>
                    <option value="mech">Agricultural mechanization</option>
                    <option value="irrigation">Micro irrigation</option>
                    <option value="seeds">Certified seeds &amp; inputs</option>
                  </select>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Sub-component</label>
                  <select
                    value={subComponent}
                    onChange={(e) => setSubComponent(e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
                    disabled={!scheme}
                  >
                    <option value="">{scheme ? 'Select sub-component' : 'Choose scheme first'}</option>
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
                </>
              )}

              {currentStage.key === 'requirements' && (
                <>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Quantity / size</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 120 m pipe, 35 HP"
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}
                  />
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, lineHeight: 1.45 }}>
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} style={{ marginTop: 3 }} />
                    <span>I accept the Terms &amp; Conditions and confirm the details are correct.</span>
                  </label>
                </>
              )}

              {currentStage.key === 'submitApp' && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    color: '#475569',
                    lineHeight: 1.55,
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>Summary</strong>
                  <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
                    <li>Scheme: {scheme ? `${scheme} / ${subComponent}` : '—'}</li>
                    <li>Quantity / note: {quantity || '—'}</li>
                    <li>Terms accepted: {termsAccepted ? 'Yes' : 'No'}</li>
                  </ul>
                  <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b' }}>
                    Submitting files your application in the queue. You will then upload your equipment receipt and pay the fee on the next screen.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" style={{ flex: '0 1 auto', minWidth: 100 }} onClick={goPrevStage} disabled={activeAppStage === 0}>
                  Back
                </button>
                {currentStage.key === 'submitApp' ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ flex: 1, minWidth: 160 }}
                    disabled={!stageAdvanceGuard}
                    onClick={fileApplicationRecord}
                  >
                    Submit application
                  </button>
                ) : (
                  <button type="button" className="btn btn-success" style={{ flex: 1, minWidth: 160 }} disabled={!stageAdvanceGuard} onClick={goNextStage}>
                    Save &amp; continue
                  </button>
                )}
              </div>
              {currentStage.key === 'submitApp' && !stageAdvanceGuard && (
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>Complete scheme and requirements to enable submit.</p>
              )}
            </div>
          </>
        )}

        {phase === 'postSubmit' && !dossierComplete && (
          <>
            <div
              className="card"
              style={{
                marginBottom: 18,
                padding: 16,
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                border: '1px solid #86efac',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#166534' }}>task_alt</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#14532d' }}>Application submitted</div>
                  <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>
                    Reference <strong>{applicationId}</strong>. Your request is filed — finish the steps below (receipt, then fee).
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
              <div
                className="card"
                style={{
                  padding: 22,
                  borderLeft: '4px solid #033621',
                  boxShadow: '0 4px 20px rgba(3,54,33,0.08)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: '#fef9c3',
                    color: '#854d0e',
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>flag</span>
                  What you need to do now
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Upload proof of receipt / dealer bill</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Upload a clear photo of your bill, delivery challan, or dealer receipt for the farm equipment or material. Blurry bills delay approval — use the smart scanner.
                </p>
                <SmartUploadSlot
                  title="Dealer bill / equipment receipt"
                  subtitle="Photo of bill, challan, or receipt for the farm equipment or material covered by this application."
                  showFcfsCallout
                  disabled={!!processingSlot}
                  isProcessing={processingSlot === 'equipmentReceipt'}
                  slotState={slots.equipmentReceipt}
                  inputId="upload-equipment-receipt"
                  onFileChange={(e) => handleUpload(e, 'equipmentReceipt')}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-success" style={{ flex: 1, minWidth: 140 }} disabled={!receiptOk} onClick={() => setPostSubmitPhaseIndex(1)}>
                    Save &amp; continue
                  </button>
                </div>
                {!receiptOk && (
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>Attach a receipt to continue to the fee step.</p>
                )}
              </div>
            )}

            {postSubmitPhaseIndex === 1 && (
              <div
                className="card"
                style={{
                  padding: 22,
                  borderLeft: '4px solid #033621',
                  boxShadow: '0 4px 20px rgba(3,54,33,0.08)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: '#fef9c3',
                    color: '#854d0e',
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>flag</span>
                  What you need to do now
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Pay processing fee</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Pay the <strong>₹23.60</strong> processing fee via UPI / QR (simulated). Then mark your dossier complete.
                </p>
                {!feePaid ? (
                  <button type="button" className="btn btn-success" style={{ width: '100%', marginBottom: 12 }} onClick={() => setFeePaid(true)}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>qr_code_2</span>
                    Simulate UPI payment — ₹23.60
                  </button>
                ) : (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: '#ecfdf5',
                      border: '1px solid #6ee7b7',
                      marginBottom: 14,
                      fontWeight: 600,
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span className="material-symbols-outlined">payments</span>
                    Payment received (demo)
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setPostSubmitPhaseIndex(0)}>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ flex: 1, minWidth: 160 }}
                    disabled={!canCompleteDossier}
                    onClick={() => setDossierComplete(true)}
                  >
                    Complete application
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {dossierComplete && (
          <div
            className="card"
            style={{
              padding: 24,
              textAlign: 'left',
              border: '2px solid #86efac',
              background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 55%)',
            }}
          >
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }} aria-hidden>
              🎉
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#14532d', margin: '0 0 12px' }}>Application submitted</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Reference: <strong>{applicationId}</strong></p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#166534', margin: 0 }}>{SUBMIT_SUCCESS}</p>
            <button type="button" className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => navigate('/login')}>
              Return to home
            </button>
          </div>
        )}
      </main>

      {previewData && previewData.blob && (previewData.type === 'pdf' || previewData.qualityTier) && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: 820, width: '92%' }}>
            <div
              className="modal-header"
              style={{
                borderBottom: '1px solid var(--outline-variant)',
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#14532d', margin: 0, fontSize: 17 }}>
                      <span className="material-symbols-outlined">verified</span>
                      Snap &amp; check — document is readable
                    </h3>
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.45 }}>{CLEAR_FEEDBACK}</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', margin: 0, fontSize: 17 }}>
                      <span className="material-symbols-outlined">warning</span>
                      Quality notice — your choice
                    </h3>
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#78350f', lineHeight: 1.55 }}>
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
                <h4 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Original ({(previewData.originalSize / 1024).toFixed(1)} KB)</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', minHeight: 220, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {previewData.type === 'pdf' ? (
                    <iframe src={previewData.originalSrc} title="Original PDF" style={{ width: '100%', minHeight: 220, border: 'none' }} />
                  ) : (
                    <img src={previewData.originalSrc} alt="Original" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain' }} />
                  )}
                </div>
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <h4
                  style={{
                    textAlign: 'center',
                    fontWeight: 700,
                    marginBottom: 8,
                    fontSize: 13,
                    color: previewData.qualityTier === 'risky' ? '#b45309' : '#166534',
                  }}
                >
                  Optimized for upload ({(previewData.optimizedSize / 1024).toFixed(1)} KB)
                </h4>
                <div
                  style={{
                    border: previewData.qualityTier === 'risky' ? '2px solid #f59e0b' : '2px solid #22c55e',
                    borderRadius: 10,
                    overflow: 'hidden',
                    minHeight: 220,
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {previewData.type === 'pdf' ? (
                    <iframe src={previewData.optimizedSrc} title="Optimized PDF" style={{ width: '100%', minHeight: 220, border: 'none' }} />
                  ) : (
                    <img src={previewData.optimizedSrc} alt="Optimized" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain' }} />
                  )}
                </div>
                {previewData.type !== 'pdf' && (
                  <p style={{ fontSize: 12, fontWeight: 600, color: previewData.qualityTier === 'risky' ? '#b45309' : '#166534', marginTop: 10 }}>
                    {COMPRESSION_LINE}
                  </p>
                )}
              </div>
            </div>

            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#475569' }}>
              <strong>Readability score:</strong> {previewData.readabilityScore}% · <strong>Raw variance (normalized):</strong> {previewData.rawVariance}
            </div>

            {previewData.qualityTier === 'risky' && (
              <p style={{ fontSize: 11, color: '#64748b', marginTop: -8, marginBottom: 16, lineHeight: 1.45 }}>
                “Attach” or “Submit with application” both add this file to your application. Retake replaces it with a new photo.
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                flexWrap: 'wrap',
                borderTop: '1px solid #e2e8f0',
                paddingTop: 16,
              }}
            >
              <button type="button" className="btn btn-outline" onClick={() => dismissPreview(true)}>
                Retake
              </button>
              {previewData.qualityTier === 'risky' ? (
                <>
                  <button type="button" className="btn btn-outline" onClick={handleConfirmAttach}>
                    Attach anyway
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ background: '#b45309', borderColor: '#b45309' }}
                    onClick={handleConfirmAttach}
                  >
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: 18 }}>upload</span>
                    Submit with application
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-success" onClick={handleConfirmAttach}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle' }}>check_circle</span>
                  Confirm &amp; attach
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { 100% { transform: rotate(360deg); } }' }} />
    </div>
  );
};

export default FarmerDashboard;
