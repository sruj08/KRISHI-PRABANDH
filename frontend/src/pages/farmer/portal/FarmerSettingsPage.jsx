import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerSettingsPage() {
  const { t, cycleLanguage, currentLabel } = useLanguage();

  return (
    <FarmerPageShell
      title={t('Settings')}
      subtitle={t('Language and account preferences for the farmer portal (demo).')}
    >
      <FpCard className="fp-card--flush divide-y divide-[#e4e8ec]">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-[#fafbfb] sm:px-5"
          onClick={cycleLanguage}
        >
          <div>
            <p className="font-bold text-[0.875rem]" style={{ color: fp.text }}>{t('Language')}</p>
            <p className="mt-0.5 text-[0.8125rem]" style={{ color: fp.muted }}>{t('Switch interface language')}</p>
          </div>
          <span className="flex items-center gap-1 text-[0.8125rem] font-bold text-[#1F5E3B]">
            <span className="material-symbols-outlined text-[1.125rem]">translate</span>
            {currentLabel}
          </span>
        </button>
        <div className="px-4 py-4 sm:px-5">
          <p className="font-bold text-[0.875rem]" style={{ color: fp.text }}>{t('Notifications')}</p>
          <p className="mt-0.5 text-[0.8125rem]" style={{ color: fp.muted }}>
            {t('SMS and push preferences can be configured when connected to live services.')}
          </p>
        </div>
      </FpCard>
    </FarmerPageShell>
  );
}
