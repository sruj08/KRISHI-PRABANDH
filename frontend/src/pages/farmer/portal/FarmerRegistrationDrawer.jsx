import React, { Suspense, lazy } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFarmerRegistration } from '../../../context/FarmerRegistrationContext';

const FarmerRegistrationLegacy = lazy(() => import('../FarmerRegistrationLegacy'));

export default function FarmerRegistrationDrawer() {
  const { t } = useLanguage();
  const { open, closeRegistration } = useFarmerRegistration();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('Close registration')}
        onClick={closeRegistration}
      />
      <div
        className="relative flex h-full w-full max-w-[560px] flex-col border-l border-[#e4e8ec] bg-[#f7f8fa] shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e4e8ec] bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0 pr-2">
            <p className="fp-heading text-[1rem] font-bold leading-tight" style={{ color: '#1a1f1c' }}>
              {t('Continue registration')}
            </p>
            <p className="mt-1 text-[0.75rem] leading-snug" style={{ color: '#5c6560' }}>
              {t('Complete steps here — your dashboard stays open behind this panel.')}
            </p>
          </div>
          <button type="button" className="icon-btn-soft shrink-0" onClick={closeRegistration}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <Suspense
            fallback={(
              <div className="flex items-center justify-center py-16 text-[0.8125rem]" style={{ color: '#5c6560' }}>
                {t('Loading…')}
              </div>
            )}
          >
            <FarmerRegistrationLegacy />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
