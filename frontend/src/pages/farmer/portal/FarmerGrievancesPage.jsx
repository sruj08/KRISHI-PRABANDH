import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { GRIEVANCES } from '../../../mock/farmerDashboardMock';
import { Btn, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerGrievancesPage() {
  const { t } = useLanguage();

  return (
    <FarmerPageShell
      title={t('Grievance center')}
      subtitle={t('Raise, track, and escalate issues related to schemes, land records, or payments.')}
    >
      <div className="flex flex-wrap gap-2">
        <Btn>{t('Raise complaint')}</Btn>
        <Btn variant="ghost">{t('Track grievance')}</Btn>
        <Btn variant="ghost">{t('Upload proof')}</Btn>
        <Btn variant="ghost">{t('Helpdesk ticket')}</Btn>
      </div>

      {GRIEVANCES.length === 0 ? (
        <FpCard className="py-12 text-center text-[0.875rem]" style={{ color: fp.muted }}>
          {t('No grievances filed.')}
        </FpCard>
      ) : (
        <div className="space-y-3">
          {GRIEVANCES.map((g) => (
            <FpCard key={g.id} className="!bg-[#fafbfb]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-[0.6875rem]" style={{ color: fp.muted }}>{g.id}</p>
                  <p className="mt-1 font-bold" style={{ color: fp.text }}>{g.subject}</p>
                  <p className="mt-1 text-[0.8125rem]" style={{ color: fp.muted }}>
                    {t('Raised on')} {g.raisedOn} · {t('Escalation')}: {g.escalation}
                  </p>
                </div>
                <span className="fp-chip fp-chip-warn shrink-0 self-start text-[0.6875rem]">{g.status}</span>
              </div>
            </FpCard>
          ))}
        </div>
      )}
    </FarmerPageShell>
  );
}
