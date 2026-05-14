import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { DOCUMENTS } from '../../../mock/farmerDashboardMock';
import { DocStatusPill, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerDocumentsPage() {
  const { t } = useLanguage();

  return (
    <FarmerPageShell
      title={t('Document center')}
      subtitle={t('DigiLocker-style vault — upload, replace, and track verification for each proof (demo).')}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {DOCUMENTS.map((d) => (
          <FpCard key={d.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="material-symbols-outlined text-[#1F5E3B]">{d.icon}</span>
              <DocStatusPill status={d.status} />
            </div>
            <p className="font-bold leading-snug text-[0.8125rem] sm:text-[0.875rem]" style={{ color: fp.text }}>{d.title}</p>
            <p className="text-[0.6875rem]" style={{ color: fp.muted }}>{d.type}</p>
            <p className="text-[0.6875rem]" style={{ color: '#9aa19c' }}>
              {t('Uploaded')}: {d.uploadedAt}
            </p>
            <div className="mt-auto flex flex-wrap gap-x-1.5 gap-y-0.5 pt-2 text-[0.6875rem] font-bold text-[#1e5a8a]">
              <button type="button" className="hover:underline">{t('Upload')}</button>
              <span className="text-[#e4e8ec]">|</span>
              <button type="button" className="hover:underline">{t('Preview')}</button>
              <span className="text-[#e4e8ec]">|</span>
              <button type="button" className="hover:underline">{t('Replace')}</button>
              <span className="text-[#e4e8ec]">|</span>
              <button type="button" className="hover:underline">{t('Download')}</button>
            </div>
          </FpCard>
        ))}
      </div>
    </FarmerPageShell>
  );
}
