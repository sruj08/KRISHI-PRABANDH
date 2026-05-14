import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { SCHEME_TABS, SCHEMES } from '../../../mock/farmerDashboardMock';
import { Btn, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerSchemesPage() {
  const { t } = useLanguage();
  const [schemeTab, setSchemeTab] = useState('eligible');

  const rows = SCHEMES[schemeTab] || [];

  return (
    <FarmerPageShell
      title={t('Schemes')}
      subtitle={t('Eligible lines, deadlines, and subsidy caps — apply or track from one place (demo).')}
    >
      <div className="flex gap-1 overflow-x-auto border-b border-[#e4e8ec] pb-2">
        {SCHEME_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSchemeTab(tab)}
            className={`shrink-0 rounded-lg px-3 py-2 text-[0.75rem] font-bold capitalize ${
              schemeTab === tab ? 'bg-[#EAF5EE] text-[#1F5E3B]' : 'text-[#5c6560] hover:bg-[#f7f8fa]'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <FpCard className="py-14 text-center">
          <span className="material-symbols-outlined text-[2.5rem] text-[#c5cbc7]">inventory_2</span>
          <p className="fp-heading mt-3 text-[1rem] font-bold" style={{ color: fp.text }}>
            {t('No schemes in this tab yet.')}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[0.875rem]" style={{ color: fp.muted }}>
            {t('Explore eligible schemes to get started.')}
          </p>
          <Btn className="mt-5" onClick={() => setSchemeTab('eligible')}>
            {t('Explore Eligible Schemes')}
          </Btn>
        </FpCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((s) => (
            <FpCard key={s.id} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: fp.primarySoft, color: fp.primary }}
                >
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold leading-snug" style={{ color: fp.text }}>{s.name}</p>
                  <p className="text-[0.6875rem]" style={{ color: fp.muted }}>{s.dept}</p>
                </div>
              </div>
              <p className="text-[0.8125rem] font-semibold text-[#1F5E3B]">{s.subsidy}</p>
              <div className="flex flex-wrap gap-2 text-[0.6875rem]">
                <span className="fp-chip fp-chip-info">{s.eligibility}</span>
                <span className="fp-chip fp-chip-warn">
                  {t('Deadline')}: {s.deadline}
                </span>
              </div>
              <p className="text-[0.8125rem]" style={{ color: fp.muted }}>
                <span className="font-semibold" style={{ color: fp.text }}>{t('Stage')}:</span> {s.stage}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Btn className="py-2 text-[0.75rem]">{t('Apply')}</Btn>
                <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('View Details')}</Btn>
                <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Download GR')}</Btn>
              </div>
            </FpCard>
          ))}
        </div>
      )}
    </FarmerPageShell>
  );
}
