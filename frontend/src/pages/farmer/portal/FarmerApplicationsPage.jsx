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
      <FarmerPageShell
        title={t('Application tracking')}
        subtitle={t('Track every stage from submission to payment.')}
      >
        <FpCard className="py-14 text-center">
          <p className="fp-heading m-0 text-[1rem] font-bold" style={{ color: fp.text }}>
            {t('No applications yet.')}
          </p>
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
          <FpCard key={app.id}>

            {/* ── Card header ── */}
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p
                  className="m-0 font-mono text-[0.6875rem] leading-none"
                  style={{ color: fp.muted }}
                >
                  {app.id}
                </p>
                <p
                  className="fp-heading m-0 mt-1.5 text-[1rem] font-bold leading-snug"
                  style={{ color: fp.text }}
                >
                  {app.schemeName}
                </p>
                <p
                  className="m-0 mt-1.5 text-[0.8125rem] leading-relaxed"
                  style={{ color: fp.muted }}
                >
                  {t('Submitted')}: {app.submittedAt}
                  <span style={{ color: '#c5cbc7' }}> · </span>
                  {t('Officer stage')}: {app.officerStage}
                </p>
              </div>
              <div className="shrink-0 self-start">
                <AppStatusPill status={app.status} label={app.statusLabel} />
              </div>
            </div>

            {/* ── Stepper ── */}
            <div
              className="mt-6 overflow-x-auto"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div
                className="fp-app-stepper"
                role="list"
                aria-label={t('Application progress')}
              >
                {app.timeline.map((step, idx) => {
                  const isDone    = step.done;
                  const isCurrent = !step.done && step.current;

                  let circleClass = 'bg-[#e4e8ec] text-[#9aa19c]';
                  if (isDone)    circleClass = 'text-white';
                  if (isCurrent) circleClass = 'bg-[#eff6ff] text-[#1e5a8a] ring-2 ring-[#1e5a8a]';

                  const icon = isDone ? 'check'
                    : isCurrent ? 'schedule'
                    : 'radio_button_unchecked';

                  return (
                    <React.Fragment key={step.key}>
                      <div className="fp-app-step" role="listitem">
                        <span
                          className={`fp-app-step__circle ${circleClass}`}
                          style={isDone ? { background: fp.primary } : undefined}
                        >
                          <span className="material-symbols-outlined">{icon}</span>
                        </span>
                        <span className="fp-app-step__label">
                          {t(step.label)}
                        </span>
                      </div>

                      {idx < app.timeline.length - 1 ? (
                        <div className="fp-app-step__connector" aria-hidden>
                          <div
                            className="fp-app-step__connector-line"
                            style={{ background: isDone ? fp.primary : '#e4e8ec' }}
                          />
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="fp-app-actions">
              <Btn variant="ghost">{t('View Application')}</Btn>
              <Btn variant="ghost">{t('Edit / Reapply')}</Btn>
              <Btn variant="ghost">{t('Upload Pending Docs')}</Btn>
              <Btn variant="ghost">{t('Download Receipt')}</Btn>
              <Btn variant="ghost">{t('Track Progress')}</Btn>
            </div>

          </FpCard>
        ))}
      </div>
    </FarmerPageShell>
  );
}
