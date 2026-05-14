import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { APPLICATION_WORKFLOWS } from '../../../mock/farmerDashboardMock';
import { AppStatusPill, Btn, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerApplicationsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const apps = APPLICATION_WORKFLOWS;

  if (apps.length === 0) {
    return (
      <FarmerPageShell title={t('Application tracking')} subtitle={t('Track every stage from submission to payment.')}>
        <FpCard className="py-14 text-center">
          <p className="fp-heading text-[1rem] font-bold" style={{ color: fp.text }}>{t('No applications yet.')}</p>
          <p className="mx-auto mt-2 max-w-md text-[0.875rem]" style={{ color: fp.muted }}>
            {t('When you apply for a scheme, your file and officer stages will appear here.')}
          </p>
          <Btn className="mt-5" onClick={() => navigate('/farmer/schemes')}>
            {t('Explore Eligible Schemes')}
          </Btn>
        </FpCard>
      </FarmerPageShell>
    );
  }

  return (
    <FarmerPageShell
      title={t('Application tracking')}
      subtitle={t('Submitted → Scrutiny → Taluka → DAO → Payment → Completed (demo workflow).')}
    >
      <div className="space-y-5">
        {apps.map((app) => (
          <FpCard key={app.id} className="!bg-[#fafbfb]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[0.6875rem]" style={{ color: fp.muted }}>{app.id}</p>
                <p className="fp-heading mt-1 text-[1rem] font-bold" style={{ color: fp.text }}>{app.schemeName}</p>
                <p className="mt-1 text-[0.8125rem]" style={{ color: fp.muted }}>
                  {t('Submitted')}: {app.submittedAt} · {t('Officer stage')}: {app.officerStage}
                </p>
              </div>
              <AppStatusPill status={app.status} label={app.statusLabel} />
            </div>

            <div className="mt-5 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-0">
                {app.timeline.map((step, idx) => (
                  <React.Fragment key={step.key}>
                    <div className="flex w-[96px] shrink-0 flex-col items-center sm:w-[104px]">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.875rem] ${
                          step.done
                            ? 'bg-[#1F5E3B] text-white'
                            : step.current
                              ? 'bg-[#eff6ff] text-[#1e5a8a] ring-2 ring-[#1e5a8a]'
                              : 'bg-[#e4e8ec] text-[#9aa19c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[1rem]">
                          {step.done ? 'check' : step.current ? 'schedule' : 'radio_button_unchecked'}
                        </span>
                      </span>
                      <p className="mt-2 text-center text-[0.625rem] font-semibold leading-tight sm:text-[0.6875rem]" style={{ color: fp.text }}>
                        {step.label}
                      </p>
                    </div>
                    {idx < app.timeline.length - 1 && (
                      <div
                        className="mt-4 h-0.5 w-4 shrink-0 self-start sm:w-6"
                        style={{ background: step.done ? fp.primary : '#e4e8ec' }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e4e8ec] pt-4">
              <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('View Application')}</Btn>
              <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Edit / Reapply')}</Btn>
              <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Upload Pending Docs')}</Btn>
              <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Download Receipt')}</Btn>
              <Btn variant="ghost" className="py-2 text-[0.75rem]">{t('Track Progress')}</Btn>
            </div>
          </FpCard>
        ))}
      </div>
    </FarmerPageShell>
  );
}
