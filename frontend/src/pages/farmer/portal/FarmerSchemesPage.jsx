import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { useToast } from '../../../hooks/useToast.jsx';
import { useLanguage } from '../../../context/LanguageContext';
import { Btn, FarmerPageShell, FpCard } from './farmerPortalUi';
import FarmerSchemeApplyFlow from './FarmerSchemeApplyFlow';
import SchemeCard from './schemes/SchemeCard';
import './farmer-schemes-module.css';

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
        <div className="fsm-schemes-page">
          <div className="fsm-filter-shell">
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
          </div>

          {filtered.length === 0 ? (
            <FpCard className="fsm-empty">
              <FileText className="mx-auto h-10 w-10" style={{ color: '#c5cbc7' }} aria-hidden />
              <p className="fsm-empty__title">No schemes in this view</p>
              <p className="fsm-empty__text">Try another status tab to see applications.</p>
            </FpCard>
          ) : (
            <div className="fsm-scheme-grid">
              {filtered.map((s) => (
                <SchemeCard
                  key={s.id}
                  scheme={s}
                  canApply={s.portalStatus === 'Eligible'}
                  onApply={setApplyScheme}
                  onDetails={setDetailsScheme}
                />
              ))}
            </div>
          )}
        </div>
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
              className="fp-modal-panel fsm-modal-panel relative max-h-[90vh] w-full overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="fsm-modal-panel__head">
                <div className="min-w-0">
                  <h2 className="fsm-modal-panel__title">{detailsScheme.name}</h2>
                  <p className="fsm-modal-panel__sub">{detailsScheme.dept}</p>
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
              <div className="fsm-modal-panel__body">
                <p className="fsm-modal-panel__section-title">Description</p>
                <p>{detailsScheme.description}</p>
                <p className="fsm-modal-panel__section-title">Eligibility</p>
                <p>{detailsScheme.eligibilityCriteria}</p>
              </div>
              <div className="fsm-modal-panel__foot">
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
