import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Droplets,
  FileText,
  Sun,
  Tractor,
  Upload,
  X,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast.jsx';
import { useLanguage } from '../../../context/LanguageContext';
import { FarmerPageShell } from './farmerPortalUi';

const PRIMARY = '#2D6A4F';
const PRIMARY_SOFT = '#E8F1EC';
const PAGE_BG = '#F3F4F6';

const MAX_BYTES = 2 * 1024 * 1024;

const TABS = [
  { key: 'eligible', label: 'Eligible' },
  { key: 'applied', label: 'Applied' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'recommended', label: 'Recommended' },
];

function buildInitialSchemes() {
  return [
    {
      id: 'S1',
      name: 'Micro Irrigation (Drip)',
      dept: 'Agriculture Dept.',
      subsidy: 'Up to ₹1,25,000 / ha',
      deadline: '30 Jun 2026',
      stage: 'Not applied',
      appliedViaPortal: false,
      iconKey: 'droplets',
      description:
        'Subsidy support for drip irrigation systems on cultivated land as per MahaDBT norms. Covers material and installation subject to technical approval and bill verification.',
      eligibilityCriteria:
        'Farmer must hold valid 7/12 land record in Maharashtra, minimum 0.2 ha under cultivation, and no duplicate subsidy for the same plot in the last five years. Priority for water-stress blocks.',
      requiredDocs: [
        {
          id: 's1d1',
          label: '7/12 Satbara Extract (Land Record)',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        {
          id: 's1d2',
          label: 'Supplier Invoice / Purchase Bill',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        {
          id: 's1d3',
          label: 'Geo-Tagged Installation Photo (with GPS coordinates visible)',
          hint: 'JPG/PNG, max 2MB',
          required: true,
          pdfOnly: false,
          imagesOnly: true,
        },
        {
          id: 's1d4',
          label: 'Panchanama Report (signed by Talathi/Patwari)',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        {
          id: 's1d5',
          label: 'Bank Passbook / Cancelled Cheque',
          hint: 'JPG/PNG, max 2MB',
          required: true,
          pdfOnly: false,
        },
      ],
    },
    {
      id: 'S2',
      name: 'Farm Mechanization',
      dept: 'Agriculture Dept.',
      subsidy: '40% on equipment',
      deadline: '15 Jul 2026',
      stage: 'Document check pending',
      appliedViaPortal: false,
      iconKey: 'tractor',
      description:
        'Capital subsidy on purchase of tractors, power tillers, and approved farm machinery through registered dealers under the State Agriculture Mechanization Programme.',
      eligibilityCriteria:
        'Applicant must be an individual farmer or FPO member with land records matching subsidy norms. Equipment must be new, invoiced by an authorized dealer, and inspected where mandatory.',
      requiredDocs: [
        { id: 's2d1', label: '7/12 Satbara Extract (Land Record)', hint: 'JPG/PNG/PDF, max 2MB', required: true, pdfOnly: false },
        {
          id: 's2d2',
          label: 'Equipment Purchase Invoice from Registered Dealer',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        {
          id: 's2d3',
          label: 'Inspection Report (Central Govt. recognized body)',
          hint: 'PDF, max 2MB',
          required: true,
          pdfOnly: true,
        },
        {
          id: 's2d4',
          label: 'Geo-Tagged Photo of Equipment on Farm',
          hint: 'JPG/PNG, max 2MB',
          required: true,
          pdfOnly: false,
          imagesOnly: true,
        },
        {
          id: 's2d5',
          label: 'Self-Declaration / Prior Consent Letter',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        { id: 's2d6', label: 'Bank Passbook / Cancelled Cheque', hint: 'JPG/PNG, max 2MB', required: true, pdfOnly: false },
      ],
    },
    {
      id: 'S3',
      name: 'Solar Agricultural Pump',
      dept: 'Energy Dept.',
      subsidy: 'Up to 90% (capped)',
      deadline: '20 Aug 2026',
      stage: 'Not applied',
      appliedViaPortal: false,
      iconKey: 'sun',
      description:
        'Financial assistance for solar-powered agricultural pumps connected to grid or off-grid systems as per MSEDCL-approved vendor list and energy department circulars.',
      eligibilityCriteria:
        'Farmer should have valid Aadhaar seeding for DBT, active agricultural pump connection where replacement is permitted, and compliance with DISCOM technical standards.',
      requiredDocs: [
        { id: 's3d1', label: '7/12 Satbara Extract (Land Record)', hint: 'JPG/PNG/PDF, max 2MB', required: true, pdfOnly: false },
        {
          id: 's3d2',
          label: 'Purchase Invoice / Bill from MSEDCL-approved vendor',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        {
          id: 's3d3',
          label: 'Geo-Tagged Photo of Installed Solar Pump',
          hint: 'JPG/PNG, max 2MB',
          required: true,
          pdfOnly: false,
          imagesOnly: true,
        },
        {
          id: 's3d4',
          label: 'Panchanama / Site Inspection Report',
          hint: 'JPG/PNG/PDF, max 2MB',
          required: true,
          pdfOnly: false,
        },
        { id: 's3d5', label: 'Aadhaar Card (self-attested)', hint: 'JPG/PNG, max 2MB', required: true, pdfOnly: false, imagesOnly: true },
        { id: 's3d6', label: 'Bank Passbook / Cancelled Cheque', hint: 'JPG/PNG, max 2MB', required: true, pdfOnly: false },
      ],
    },
  ];
}

function SchemeIcon({ iconKey, className }) {
  const cn = className || 'h-5 w-5';
  if (iconKey === 'tractor') return <Tractor className={cn} aria-hidden />;
  if (iconKey === 'sun') return <Sun className={cn} aria-hidden />;
  return <Droplets className={cn} aria-hidden />;
}

function acceptAttr(doc) {
  if (doc.pdfOnly) return '.pdf,application/pdf';
  if (doc.imagesOnly) return 'image/jpeg,image/png,.jpg,.jpeg,.png';
  return 'image/jpeg,image/png,.jpg,.jpeg,.png,.pdf,application/pdf';
}

function validateFile(file, doc) {
  if (!file) return 'No file selected';
  if (file.size > MAX_BYTES) return 'File size exceeds 2MB limit';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = file.type || '';
  if (doc.pdfOnly) {
    if (mime !== 'application/pdf' && ext !== 'pdf') return 'Please upload a PDF file';
    return null;
  }
  if (doc.imagesOnly) {
    const okMime = mime.startsWith('image/');
    const okExt = ['jpg', 'jpeg', 'png'].includes(ext);
    if (!okMime && !okExt) return 'Please upload a JPG or PNG image';
    return null;
  }
  const okMime = mime.startsWith('image/') || mime === 'application/pdf';
  const okExt = ['jpg', 'jpeg', 'png', 'pdf'].includes(ext);
  if (!okMime && !okExt) return 'Please upload JPG, PNG, or PDF';
  return null;
}

function generateAppRef() {
  const n = String(Math.floor(10000 + Math.random() * 90000));
  return `MH-AGR-2026-${n}`;
}

export default function FarmerSchemesPage() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [schemes, setSchemes] = useState(buildInitialSchemes);
  const [tab, setTab] = useState('eligible');
  const [detailsScheme, setDetailsScheme] = useState(null);
  const [apply, setApply] = useState(null);
  const inputRefs = useRef({});

  const setInputRef = (docId) => (el) => {
    if (el) inputRefs.current[docId] = el;
    else delete inputRefs.current[docId];
  };

  const filteredSchemes = useMemo(() => {
    if (tab === 'eligible') return schemes.filter((s) => !s.appliedViaPortal);
    if (tab === 'applied') return schemes.filter((s) => s.appliedViaPortal);
    return [];
  }, [schemes, tab]);

  const revokeUploads = useCallback((uploadMap) => {
    Object.values(uploadMap || {}).forEach((u) => {
      if (u?.preview) URL.revokeObjectURL(u.preview);
    });
  }, []);

  const closeApply = useCallback(() => {
    setApply((prev) => {
      if (prev?.uploads) revokeUploads(prev.uploads);
      return null;
    });
  }, [revokeUploads]);

  const openApply = (scheme) => {
    setApply({
      scheme,
      step: 1,
      confirmEligible: false,
      declaration: false,
      uploads: {},
      ref: null,
    });
  };

  const updateUpload = (schemeId, docId, patch) => {
    setApply((prev) => {
      if (!prev || prev.scheme.id !== schemeId) return prev;
      const cur = prev.uploads[docId];
      if (cur?.preview && patch.preview !== cur.preview) URL.revokeObjectURL(cur.preview);
      return {
        ...prev,
        uploads: { ...prev.uploads, [docId]: { ...cur, ...patch } },
      };
    });
  };

  const onPickFile = (schemeId, doc, fileList) => {
    const file = fileList?.[0];
    const input = inputRefs.current[doc.id];
    if (input) input.value = '';
    if (!file) return;
    const err = validateFile(file, doc);
    if (err) {
      updateUpload(schemeId, doc.id, { file: null, preview: null, error: err });
      return;
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    updateUpload(schemeId, doc.id, { file, preview, error: null });
  };

  const removeFile = (schemeId, docId) => {
    setApply((prev) => {
      if (!prev || prev.scheme.id !== schemeId) return prev;
      const cur = prev.uploads[docId];
      if (cur?.preview) URL.revokeObjectURL(cur.preview);
      const next = { ...prev.uploads };
      delete next[docId];
      return { ...prev, uploads: next };
    });
  };

  const uploadProgress = useMemo(() => {
    if (!apply?.scheme) return { done: 0, total: 0 };
    const docs = apply.scheme.requiredDocs;
    const done = docs.filter((d) => apply.uploads[d.id]?.file && !apply.uploads[d.id]?.error).length;
    return { done, total: docs.length };
  }, [apply]);

  const allDocsOk =
    apply &&
    apply.scheme.requiredDocs.every((d) => {
      const u = apply.uploads[d.id];
      return u?.file && !u.error;
    });

  const handleSubmitApplication = () => {
    if (!apply || !allDocsOk || !apply.declaration) {
      addToast('Please upload all required documents and accept the declaration.', 'error', 4500);
      return;
    }
    const ref = generateAppRef();
    setApply((a) => (a ? { ...a, step: 'success', ref } : a));
    addToast(`Application submitted! Ref: ${ref}`, 'success', 6000, { align: 'top-right' });
  };

  const finishSuccessClose = () => {
    if (!apply?.scheme || !apply.ref) {
      closeApply();
      return;
    }
    const sid = apply.scheme.id;
    setSchemes((prev) =>
      prev.map((s) =>
        s.id === sid
          ? {
              ...s,
              appliedViaPortal: true,
              stage: 'Application submitted – Under Review',
            }
          : s,
      ),
    );
    closeApply();
    setTab('applied');
  };

  const handleDownloadGr = () => {
    addToast('GR document downloading...', 'success', 2800);
  };

  return (
    <>
      <div className="min-h-0 flex-1" style={{ background: PAGE_BG }}>
        <FarmerPageShell
          title={t('Schemes')}
          subtitle={t('Eligible lines, deadlines, and subsidy caps - apply or track from one place (demo).')}
        >
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[0.75rem] font-bold transition-colors sm:px-4 sm:text-[0.8125rem] ${
                  tab === key ? 'text-white shadow-sm' : 'bg-white/80 text-neutral-600 hover:bg-white'
                }`}
                style={tab === key ? { background: PRIMARY } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredSchemes.length === 0 ? (
            <div
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-14 text-center shadow-sm sm:px-8"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <FileText className="mx-auto h-10 w-10 text-neutral-300" aria-hidden />
              <p className="mt-4 text-base font-bold text-neutral-800">No schemes in this tab yet.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">Explore eligible schemes to get started.</p>
              <button
                type="button"
                className="mt-6 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ background: PRIMARY }}
                onClick={() => setTab('eligible')}
              >
                Explore Eligible Schemes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredSchemes.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  <div className="flex gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                      style={{ background: PRIMARY_SOFT, color: PRIMARY }}
                    >
                      <SchemeIcon iconKey={s.iconKey} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold leading-snug text-neutral-900 sm:text-[1.02rem]">{s.name}</p>
                      <p className="text-[0.6875rem] text-neutral-500 sm:text-xs">{s.dept}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold sm:text-[0.9375rem]" style={{ color: PRIMARY }}>
                    {s.subsidy}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[0.65rem] font-bold sm:text-[0.6875rem]"
                      style={
                        s.appliedViaPortal
                          ? { background: '#e0e7ff', color: '#3730a3' }
                          : { background: '#dbeafe', color: '#1e40af' }
                      }
                    >
                      {s.appliedViaPortal ? 'Applied' : 'Eligible'}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[0.65rem] font-bold text-amber-900 ring-1 ring-inset ring-amber-200/80 sm:text-[0.6875rem]">
                      Deadline: {s.deadline}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-900">Stage:</span> {s.stage}
                  </p>
                  <div className="mt-auto flex w-full flex-col gap-2.5 border-t border-neutral-100 pt-4 sm:flex-row sm:items-stretch sm:gap-3">
                    {s.appliedViaPortal ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-bold text-neutral-500"
                      >
                        Applied ✓
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-[0.97] sm:min-w-0"
                          style={{ background: PRIMARY, boxShadow: '0 2px 8px rgba(45,106,79,0.35)' }}
                          onClick={() => openApply(s)}
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-neutral-800 shadow-sm ring-1 ring-inset ring-neutral-300 transition hover:bg-neutral-50 sm:min-w-0"
                          onClick={() => setDetailsScheme(s)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#2D6A4F] shadow-sm ring-2 ring-inset ring-[#2D6A4F] transition hover:bg-[#f4faf7] sm:min-w-0"
                          onClick={handleDownloadGr}
                        >
                          Download GR
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FarmerPageShell>
      </div>

      {detailsScheme && (
        <div className="fixed inset-0 z-[2200] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => setDetailsScheme(null)}
          />
          <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <h2 className="pr-2 text-base font-bold text-neutral-900">{detailsScheme.name}</h2>
              <button type="button" className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100" onClick={() => setDetailsScheme(null)}>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="max-h-[calc(85vh-52px)] overflow-y-auto p-4 text-sm leading-relaxed text-neutral-600">
              <p className="m-0 font-bold text-neutral-800">Description</p>
              <p className="mt-2">{detailsScheme.description}</p>
              <p className="mb-2 mt-4 font-bold text-neutral-800">Eligibility criteria</p>
              <p className="m-0">{detailsScheme.eligibilityCriteria}</p>
            </div>
            <div className="flex justify-end border-t border-neutral-200 px-4 py-3">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: PRIMARY }}
                onClick={() => setDetailsScheme(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {apply && (
        <div className="fixed inset-0 z-[2300] flex justify-end">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={closeApply} />
          <div
            className="relative flex h-full w-full max-w-full flex-col border-l border-neutral-200 bg-[#fafafa] shadow-2xl sm:max-w-lg"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-3 py-3 sm:px-4">
              <div className="min-w-0 pr-2">
                <p className="truncate text-sm font-bold text-neutral-900 sm:text-base">{apply.scheme.name}</p>
                <p className="text-[0.6875rem] text-neutral-500">MahaDBT-style application (demo)</p>
              </div>
              <button type="button" className="shrink-0 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100" onClick={closeApply}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {apply.step !== 'success' ? (
              <>
                <div className="shrink-0 border-b border-neutral-200 bg-white px-3 py-3 sm:px-4">
                  <div className="flex items-center justify-between gap-0.5 text-[0.6rem] font-bold sm:gap-1 sm:text-[0.7rem]">
                    {[1, 2, 3].map((n) => {
                      const active = apply.step === n;
                      const done = apply.step > n;
                      return (
                        <React.Fragment key={n}>
                          {n > 1 ? (
                            <ChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-neutral-300 sm:h-3.5 sm:w-3.5" aria-hidden />
                          ) : null}
                          <div
                            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg py-2 ${
                              active ? 'text-white' : done ? '' : 'bg-neutral-100 text-neutral-500'
                            }`}
                            style={
                              active
                                ? { background: PRIMARY }
                                : done
                                  ? { background: PRIMARY_SOFT, color: PRIMARY }
                                  : {}
                            }
                          >
                            {done ? <CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                            <span className="truncate">{n === 1 ? 'Confirm' : n === 2 ? 'Upload' : 'Submit'}</span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-center text-[0.65rem] font-semibold text-neutral-500">
                    Step {apply.step} of 3: {apply.step === 1 ? 'Confirm Details' : apply.step === 2 ? 'Upload Documents' : 'Submit'}
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
                  {apply.step === 1 && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
                        <Row k="Scheme" v={apply.scheme.name} />
                        <Row k="Department" v={apply.scheme.dept} />
                        <Row k="Subsidy" v={apply.scheme.subsidy} />
                        <Row k="Deadline" v={apply.scheme.deadline} last />
                      </div>
                      <label className="flex cursor-pointer gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#2D6A4F]"
                          checked={apply.confirmEligible}
                          onChange={(e) => setApply((a) => (a ? { ...a, confirmEligible: e.target.checked } : a))}
                        />
                        <span className="text-sm text-neutral-700">I confirm I am eligible and the details are correct</span>
                      </label>
                      <button
                        type="button"
                        disabled={!apply.confirmEligible}
                        className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                        style={{ background: apply.confirmEligible ? PRIMARY : undefined }}
                        onClick={() => setApply((a) => (a ? { ...a, step: 2 } : a))}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {apply.step === 2 && (
                    <div className="space-y-4">
                      {apply.scheme.requiredDocs.map((doc) => {
                        const u = apply.uploads[doc.id];
                        const hasFile = !!(u?.file && !u.error);
                        return (
                          <div
                            key={doc.id}
                            className={`rounded-xl border-2 border-dashed bg-white p-3 transition-colors sm:p-4 ${
                              hasFile ? 'border-emerald-500/80' : 'border-neutral-200'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-neutral-900">
                                  {doc.required ? <span className="text-red-600">* </span> : null}
                                  {doc.label}
                                </p>
                                <p className="mt-0.5 text-[0.6875rem] text-neutral-500">{doc.hint}</p>
                              </div>
                              <input
                                ref={setInputRef(doc.id)}
                                type="file"
                                className="sr-only"
                                accept={acceptAttr(doc)}
                                onChange={(e) => onPickFile(apply.scheme.id, doc, e.target.files)}
                              />
                              {!hasFile ? (
                                <button
                                  type="button"
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] font-bold"
                                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                                  onClick={() => inputRefs.current[doc.id]?.click()}
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                  Upload
                                </button>
                              ) : (
                                <div className="flex shrink-0 items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-emerald-600" aria-hidden />
                                  <button
                                    type="button"
                                    className="text-[0.6875rem] font-bold text-red-600 underline"
                                    onClick={() => removeFile(apply.scheme.id, doc.id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                            {u?.error ? (
                              <p className="mt-2 flex items-center gap-1 text-[0.6875rem] font-semibold text-red-600">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {u.error}
                              </p>
                            ) : null}
                            {hasFile && u.preview ? (
                              <div className="mt-3">
                                <img src={u.preview} alt="" className="h-20 w-auto max-w-full rounded-lg border border-neutral-200 object-cover" />
                              </div>
                            ) : null}
                            {hasFile && !u.preview ? (
                              <p className="mt-3 flex items-center gap-1 text-[0.6875rem] font-medium text-neutral-600">
                                <FileText className="h-4 w-4 shrink-0" />
                                {u.file.name}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                      <div className="rounded-xl bg-neutral-200/80 px-3 py-2">
                        <div className="mb-1 flex justify-between text-[0.6875rem] font-bold text-neutral-700">
                          <span>Progress</span>
                          <span>
                            {uploadProgress.done} of {uploadProgress.total} documents uploaded
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-300">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${uploadProgress.total ? (100 * uploadProgress.done) / uploadProgress.total : 0}%`,
                              background: PRIMARY,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700"
                          onClick={() => setApply((a) => (a ? { ...a, step: 1 } : a))}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          disabled={!allDocsOk}
                          className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                          style={{ background: allDocsOk ? PRIMARY : undefined }}
                          onClick={() => {
                            if (!allDocsOk) {
                              addToast('Upload all required documents before continuing.', 'error', 4000);
                              return;
                            }
                            setApply((a) => (a ? { ...a, step: 3 } : a));
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {apply.step === 3 && (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-sm">
                        <table className="w-full text-left">
                          <tbody>
                            <tr className="border-b border-neutral-100">
                              <th className="px-3 py-2 font-semibold text-neutral-600">Scheme</th>
                              <td className="px-3 py-2 text-neutral-900">{apply.scheme.name}</td>
                            </tr>
                            <tr className="border-b border-neutral-100">
                              <th className="px-3 py-2 font-semibold text-neutral-600">Documents</th>
                              <td className="px-3 py-2 text-neutral-900">{uploadProgress.done} uploaded</td>
                            </tr>
                            <tr>
                              <th className="px-3 py-2 font-semibold text-neutral-600">Deadline</th>
                              <td className="px-3 py-2 text-neutral-900">{apply.scheme.deadline}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-700">
                        I hereby declare that all information and documents submitted are true and correct to the best of my knowledge. I
                        understand that any false information may lead to rejection of my application.
                      </p>
                      <label className="flex cursor-pointer gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#2D6A4F]"
                          checked={apply.declaration}
                          onChange={(e) => setApply((a) => (a ? { ...a, declaration: e.target.checked } : a))}
                        />
                        <span className="text-sm text-neutral-700">I accept the declaration above</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700"
                          onClick={() => setApply((a) => (a ? { ...a, step: 2 } : a))}
                        >
                          Back
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={!apply.declaration}
                        className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                        style={{ background: apply.declaration ? PRIMARY : undefined }}
                        onClick={handleSubmitApplication}
                      >
                        Submit Application
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-600" strokeWidth={1.5} aria-hidden />
                <p className="mt-4 text-lg font-bold text-neutral-900">Application Submitted Successfully!</p>
                <p className="mt-2 font-mono text-sm font-semibold" style={{ color: PRIMARY }}>
                  {apply.ref}
                </p>
                <p className="mt-3 max-w-xs text-sm text-neutral-600">
                  Your application is under review. You will receive SMS updates.
                </p>
                <button
                  type="button"
                  className="mt-8 w-full max-w-xs rounded-xl py-3 text-sm font-bold text-white"
                  style={{ background: PRIMARY }}
                  onClick={finishSuccessClose}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Row({ k, v, last }) {
  return (
    <div className={`flex justify-between gap-3 py-2 text-neutral-800 ${last ? '' : 'border-b border-neutral-100'}`}>
      <span className="text-neutral-500">{k}</span>
      <span className="max-w-[60%] text-right font-medium">{v}</span>
    </div>
  );
}
