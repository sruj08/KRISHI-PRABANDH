import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { LAND_PARCELS } from '../../../mock/farmerDashboardMock';
import { Btn, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerLandPage() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(null);

  return (
    <FarmerPageShell
      title={t('Land records')}
      subtitle={t('7/12 extracts, ownership, irrigation, and crop declaration - as on government records (demo data).')}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.875rem] leading-relaxed" style={{ color: fp.muted }}>
          {t('Malegaon / Barshi - soybean parcels and joint holding examples.')}
        </p>
        <Btn variant="ghost" className="shrink-0">
          <span className="material-symbols-outlined text-[18px]">add_link</span>
          {t('Link New Land')}
        </Btn>
      </div>

      <div className="space-y-3">
        {LAND_PARCELS.map((row) => {
          const open = expanded === row.id;
          return (
            <FpCard key={row.id} className="fp-card--flush overflow-hidden shadow-sm">
              <button
                type="button"
                className="flex w-full flex-wrap items-center gap-3 p-4 text-left transition-colors hover:bg-[#fafbfb]"
                onClick={() => setExpanded(open ? null : row.id)}
              >
                <span className="material-symbols-outlined shrink-0" style={{ color: fp.muted }}>
                  {open ? 'expand_less' : 'expand_more'}
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="font-bold" style={{ color: fp.text }}>
                    {t('Survey No.')} {row.surveyNo}
                  </p>
                  <p className="mt-0.5 text-[0.75rem]" style={{ color: fp.muted }}>
                    {row.village} · {row.areaHa} ha
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`fp-chip text-[0.625rem] ${
                      row.irrigationTag === 'irrigated' ? 'fp-chip-ok' : 'fp-chip fp-chip-info'
                    }`}
                  >
                    {row.irrigation}
                  </span>
                  {row.ownershipTags?.includes('joint') && (
                    <span className="fp-chip fp-chip-info text-[0.625rem]">{t('Joint Ownership')}</span>
                  )}
                  {row.ownershipTags?.includes('verified') && (
                    <span className="fp-chip fp-chip-ok text-[0.625rem]">{t('Verified')}</span>
                  )}
                </div>
              </button>
              {open && (
                <div className="border-t border-[#e4e8ec] bg-white px-4 pb-4 pt-0">
                  <div className="grid gap-2 py-4 text-[0.8125rem] sm:grid-cols-2">
                    <p>
                      <span style={{ color: fp.muted }}>{t('Ownership')}:</span>{' '}
                      <span className="font-semibold" style={{ color: fp.text }}>{row.ownership}</span>
                    </p>
                    <p>
                      <span style={{ color: fp.muted }}>{t('Crop declared')}:</span>{' '}
                      <span className="font-semibold" style={{ color: fp.text }}>{row.cropDeclared}</span>
                    </p>
                    <p>
                      <span style={{ color: fp.muted }}>{t('Season')}:</span>{' '}
                      <span className="font-semibold" style={{ color: fp.text }}>{row.season}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('View 7/12')}</Btn>
                    <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Download Extract')}</Btn>
                    <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Raise Correction Request')}</Btn>
                  </div>
                </div>
              )}
            </FpCard>
          );
        })}
      </div>
    </FarmerPageShell>
  );
}
