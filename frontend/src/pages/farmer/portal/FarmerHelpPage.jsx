import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerHelpPage() {
  const { t } = useLanguage();

  return (
    <FarmerPageShell
      title={t('Help center')}
      subtitle={t('Scheme rules, CSC support, and Taluka Agriculture Office contacts (demo).')}
    >
      <FpCard>
        <p className="text-[0.875rem] leading-relaxed" style={{ color: fp.muted }}>
          {t('For scheme rules, required documents, and CSC support, use the toll-free helpline or visit your Taluka Agriculture Office.')}
        </p>
        <p className="fp-heading mt-5 text-[1.0625rem] font-bold" style={{ color: fp.primary }}>
          1800-XXX-XXXX · {t('7 AM – 9 PM')}
        </p>
      </FpCard>
    </FarmerPageShell>
  );
}
