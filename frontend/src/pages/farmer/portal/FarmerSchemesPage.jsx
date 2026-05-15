import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Droplets, FileText, ShieldCheck, Sun, Tractor, Warehouse, X } from 'lucide-react';
import { useToast } from '../../../hooks/useToast.jsx';
import { useLanguage } from '../../../context/LanguageContext';
import { Btn, FarmerPageShell, FpCard, fp } from './farmerPortalUi';
import FarmerSchemeApplyFlow from './FarmerSchemeApplyFlow';

const STATUS_TABS = [
  { key: 'Eligible', label: 'Eligible' },
  { key: 'Applied', label: 'Applied' },
  { key: 'Under Verification', label: 'Under verification' },
  { key: 'Rejected', label: 'Rejected' },
  { key: 'Approved', label: 'Approved' },
];

function buildInitialSchemes() {
  const singleDoc = {
    id: 'scheme-doc',
    label: 'Supporting document (one file)',
    hint: 'PDF, JPG, or PNG — max 80 MB upload. Blur is checked first. If your file is already under 1 MB it is kept as-is; larger files are compressed for the portal.',
    required: true,
    pdfOnly: false,
  };

  return [
    {
      id: 'drip',
      name: 'Drip Irrigation (Micro Irrigation)',
      dept: 'Agriculture Department, GoM',
      subsidy: 'Up to ₹1,25,000 / ha',
      subsidyAmount: '₹1,25,000 / ha',
      deadline: '30 Jun 2026',
      portalStatus: 'Eligible',
      iconKey: 'droplets',
      description:
        'Central–State converged assistance for drip / sprinkler systems on notified crops. Beneficiary contribution and technical sanction apply as per MahaDBT circulars.',
      eligibilityCriteria:
        'Maharashtra land record (7/12), minimum cultivated area norms, no duplicate subsidy on the same plot in the last five years, and compliance with water-use audit where applicable.',
      requiredDocs: [singleDoc],
    },
    {
      id: 'solar',
      name: 'Solar Agricultural Pump',
      dept: 'Energy Department, GoM',
      subsidy: 'Up to 90% (capped)',
      subsidyAmount: '90% (capped)',
      deadline: '20 Aug 2026',
      portalStatus: 'Under Verification',
      iconKey: 'sun',
      description:
        'Capital subsidy for replacement of conventional pumps with grid-compliant solar pumps through empanelled vendors and DISCOM technical clearance.',
      eligibilityCriteria:
        'Active agricultural pump, valid Aadhaar seeding for DBT, land record match, and vendor bill from approved list.',
      requiredDocs: [singleDoc],
    },
    {
      id: 'mech',
      name: 'Farm Mechanization',
      dept: 'Agriculture Department, GoM',
      subsidy: '40% on notified equipment',
      subsidyAmount: '40% subsidy',
      deadline: '15 Jul 2026',
      portalStatus: 'Applied',
      iconKey: 'tractor',
      description:
        'Subsidy on purchase of tractors, power tillers, and custom-hiring centre equipment through registered dealers with inspection where mandated.',
      eligibilityCriteria:
        'Individual farmer or FPO member with matching land records; new equipment only; invoice from authorized dealer.',
      requiredDocs: [singleDoc],
    },
    {
      id: 'poly',
      name: 'Polyhouse / Protected Cultivation',
      dept: 'Horticulture, GoM',
      subsidy: 'Up to 50% (project capped)',
      subsidyAmount: '50% (capped)',
      deadline: '05 Sep 2026',
      portalStatus: 'Approved',
      iconKey: 'poly',
      description:
        'Assistance for poly-shade nets, walk-in tunnels, and micro-irrigation integration for horticulture clusters under state horticulture mission.',
      eligibilityCriteria:
        'Cluster proximity norms, horticulture crop plan, bankable project report, and geo-tagged site readiness certificate.',
      requiredDocs: [singleDoc],
    },
    {
      id: 'pmfby',
      name: 'Crop Insurance (PMFBY / State)',
      dept: 'Agriculture Insurance, GoM',
      subsidy: 'Premium subsidy as per season',
      subsidyAmount: 'Premium support',
      deadline: '31 Jul 2026',
      portalStatus: 'Rejected',
      iconKey: 'shield',
      description:
        'Seasonal crop insurance enrolment with premium support for notified crops and risk periods as per RWBCIS guidelines.',
      eligibilityCriteria:
        'Crop declaration within window, valid land parcel linkage, and premium payment confirmation through CSC / bank channel.',
      requiredDocs: [singleDoc],
    },
  ];
}

function SchemeIcon({ iconKey, className }) {
  const cn = className || 'h-5 w-5';
  if (iconKey === 'tractor') return <Tractor className={cn} aria-hidden />;
  if (iconKey === 'sun') return <Sun className={cn} aria-hidden />;
  if (iconKey === 'poly') return <Warehouse className={cn} aria-hidden />;
  if (iconKey === 'shield') return <ShieldCheck className={cn} aria-hidden />;
  return <Droplets className={cn} aria-hidden />;
}

function statusPillStyle(status) {
  switch (status) {
    case 'Eligible':
      return { bg: fp.primarySoft, fg: fp.primary, ring: '#c5d9cc' };
    case 'Applied':
      return { bg: '#eff6ff', fg: '#1e40af', ring: '#bfdbfe' };
    case 'Under Verification':
      return { bg: '#fffbeb', fg: '#b45309', ring: '#fde68a' };
    case 'Rejected':
      return { bg: '#fef2f2', fg: '#b91c1c', ring: '#fecaca' };
    case 'Approved':
      return { bg: '#ecfdf5', fg: '#047857', ring: '#a7f3d0' };
    default:
      return { bg: '#f4f4f5', fg: '#52525b', ring: '#e4e4e7' };
  }
}

export default function FarmerSchemesPage() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [schemes, setSchemes] = useState(buildInitialSchemes);
  const [tab, setTab] = useState('Eligible');
  const [detailsScheme, setDetailsScheme] = useState(null);
  const [applyScheme, setApplyScheme] = useState(null);

  const filtered = useMemo(() => schemes.filter((s) => s.portalStatus === tab), [schemes, tab]);

  const handleApplySubmitted = useCallback((schemeId) => {
    setSchemes((prev) =>
      prev.map((s) => (s.id === schemeId ? { ...s, portalStatus: 'Applied' } : s)),
    );
    setTab('Applied');
  }, []);

  const downloadGr = (scheme) => {
    const body = `Government Resolution (Demo)\nScheme: ${scheme.name}\nDepartment: ${scheme.dept}\nIssued for: Krishi Prabandh Farmer Portal demo\n`;
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GR-${scheme.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('GR file downloaded.', 'success', 2800);
  };

  return (
    <>
      <FarmerPageShell
        title={t('Schemes')}
        subtitle={t('Government subsidy schemes — apply with guided uploads, validation, and tracking (live demo).')}
      >
        <div className="fp-filter-tabs" role="tablist" aria-label={t('Filter by status')}>
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`fp-filter-tab ${tab === key ? 'fp-filter-tab--active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <FpCard className="py-12 text-center sm:py-14">
            <FileText className="mx-auto h-10 w-10" style={{ color: '#c5cbc7' }} aria-hidden />
            <p className="fp-heading mt-4 text-base font-bold" style={{ color: fp.text }}>
              No schemes in this view
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: fp.muted }}>
              Try another status tab to see applications.
            </p>
          </FpCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {filtered.map((s) => {
              const st = statusPillStyle(s.portalStatus);
              const canApply = s.portalStatus === 'Eligible';
              return (
                <motion.article
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FpCard className="fp-scheme-card">
                    {/* ── Header: circular icon + dept above title + status pill ── */}
                    <div className="flex items-start gap-3 p-4 sm:p-5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: fp.primarySoft,
                          color: fp.primary,
                          boxShadow: `0 0 0 3px rgba(31,94,59,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
                        }}
                      >
                        <SchemeIcon iconKey={s.iconKey} className="h-[1.1rem] w-[1.1rem]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[0.6rem] font-semibold uppercase tracking-widest" style={{ color: fp.muted }}>
                          {s.dept}
                        </p>
                        <h3 className="fp-heading m-0 mt-0.5 text-[0.9375rem] font-bold leading-snug" style={{ color: fp.text }}>
                          {s.name}
                        </h3>
                      </div>
                      {/* Status pill — top-right */}
                      <span
                        className="ml-1 shrink-0 self-start rounded-full px-2.5 py-[3px] text-[0.6rem] font-bold"
                        style={{
                          background: st.bg,
                          color: st.fg,
                          boxShadow: `inset 0 0 0 1px ${st.ring}`,
                        }}
                      >
                        {s.portalStatus}
                      </span>
                    </div>

                    {/* ── 2-col details: subsidy | deadline ── */}
                    <div
                      className="grid grid-cols-2"
                      style={{ borderTop: `1px solid ${fp.divider}`, borderBottom: `1px solid ${fp.divider}` }}
                    >
                      <div className="px-4 py-3" style={{ borderRight: `1px solid ${fp.divider}` }}>
                        <p className="m-0 text-[0.625rem] font-bold uppercase" style={{ letterSpacing: '0.07em', color: fp.muted }}>
                          Subsidy
                        </p>
                        <p className="m-0 mt-0.5 text-[0.9375rem] font-bold tabular-nums leading-snug" style={{ color: fp.primary, letterSpacing: '-0.01em' }}>
                          {s.subsidyAmount || s.subsidy}
                        </p>
                      </div>
                      <div className="px-4 py-3">
                        <p className="m-0 text-[0.625rem] font-bold uppercase" style={{ letterSpacing: '0.07em', color: fp.muted }}>
                          Deadline
                        </p>
                        <p className="m-0 mt-0.5 text-[0.875rem] font-bold leading-snug" style={{ color: fp.text, letterSpacing: '-0.01em' }}>
                          {s.deadline}
                        </p>
                      </div>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="grid grid-cols-2 gap-2 p-4 sm:p-5">
                      {canApply ? (
                        <button
                          type="button"
                          className="fp-btn fp-btn--primary min-h-[40px] text-[0.8125rem]"
                          onClick={() => setApplyScheme(s)}
                        >
                          Apply
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="fp-btn min-h-[40px] cursor-not-allowed text-[0.8125rem] font-semibold"
                          style={{ border: `1px solid ${fp.divider}`, background: '#f3f4f0', color: '#9aa19c' }}
                        >
                          Apply
                        </button>
                      )}
                      <button
                        type="button"
                        className="fp-btn fp-btn--ghost min-h-[40px] text-[0.8125rem]"
                        onClick={() => setDetailsScheme(s)}
                      >
                        Know more info
                      </button>
                    </div>
                  </FpCard>
                </motion.article>
              );
            })}
          </div>
        )}
      </FarmerPageShell>

      <AnimatePresence>
        {detailsScheme ? (
          <motion.div
            className="fixed inset-0 z-[4800] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="absolute inset-0" aria-label="Close" onClick={() => setDetailsScheme(null)} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="fp-modal-panel relative max-h-[90vh] w-full max-w-lg overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between gap-3 border-b px-4 py-3.5 sm:px-5 sm:py-4" style={{ borderColor: fp.border }}>
                <div className="min-w-0">
                  <h2 className="fp-heading m-0 text-[1.0625rem] font-bold" style={{ color: fp.text }}>
                    {detailsScheme.name}
                  </h2>
                  <p className="m-0 mt-1 text-[0.8125rem]" style={{ color: fp.muted }}>
                    {detailsScheme.dept}
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn-soft shrink-0"
                  aria-label={t('Close')}
                  onClick={() => setDetailsScheme(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-4 py-4 text-[0.875rem] leading-relaxed sm:px-5" style={{ color: fp.muted }}>
                <p className="m-0 font-bold" style={{ color: fp.text }}>
                  Description
                </p>
                <p className="m-0 mt-2">{detailsScheme.description}</p>
                <p className="m-0 mt-4 font-bold" style={{ color: fp.text }}>
                  Eligibility
                </p>
                <p className="m-0 mt-2">{detailsScheme.eligibilityCriteria}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t px-4 py-3 sm:px-5" style={{ borderColor: fp.border }}>
                <Btn variant="ghost" onClick={() => downloadGr(detailsScheme)}>
                  {t('Download GR')}
                </Btn>
                <Btn variant="ghost" onClick={() => setDetailsScheme(null)}>
                  {t('Close')}
                </Btn>
                {detailsScheme.portalStatus === 'Eligible' ? (
                  <Btn
                    onClick={() => {
                      setDetailsScheme(null);
                      setApplyScheme(detailsScheme);
                    }}
                  >
                    {t('Start application')}
                  </Btn>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {applyScheme ? (
          <FarmerSchemeApplyFlow scheme={applyScheme} onClose={() => setApplyScheme(null)} onSubmitted={handleApplySubmitted} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
