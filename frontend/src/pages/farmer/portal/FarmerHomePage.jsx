import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useFarmerRegistration } from '../../../context/FarmerRegistrationContext';
import {
  APPLICATION_WORKFLOWS,
  DOCUMENTS,
  FARMER_PROFILE,
  NOTIFICATIONS,
  PROFILE_STATUS_CHIPS,
  SCHEMES,
} from '../../../mock/farmerDashboardMock';
import { Btn, FpCard, fp, ProfileCompletionRing, StatusChip } from './farmerPortalUi';

export default function FarmerHomePage() {
  const { user } = useAuth();
  const { t, cycleLanguage, currentLabel } = useLanguage();
  const { openRegistration } = useFarmerRegistration();

  const profile = FARMER_PROFILE;
  const displayName = user?.username || profile.fullName;
  const incomplete = profile.profileCompletionPct < 100;
  const pendingDocs = DOCUMENTS.filter((d) => d.status === 'pending' || d.status === 'rejected').length;
  const activeApps = APPLICATION_WORKFLOWS.length;
  const eligibleCount = SCHEMES.eligible?.length ?? 0;
  const landParcels = 3;

  return (
    <div className="fp-page">
      <div className="fp-stack">

        {/* ── Hero card ── */}
        <FpCard className="fp-home-hero">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
            <div className="min-w-0 flex-1 space-y-4">
              <p
                className="fp-heading text-[clamp(1.2rem,3vw,1.4rem)] font-bold leading-snug"
                style={{ color: fp.text }}
              >
                {t('Namaskar')}, {displayName}{' '}
                <span className="font-normal" style={{ color: fp.muted }}>👋</span>
              </p>

              <div className="fp-meta text-[0.8125rem]" style={{ color: fp.muted }}>
                <span>
                  <span className="font-semibold" style={{ color: fp.text }}>{t('Farmer ID')}</span>{' '}
                  <span className="font-mono text-[0.75rem] tabular-nums">{profile.farmerId}</span>
                </span>
                <span>{profile.village}, {profile.taluka}</span>
                <span>{t('Last login')}: {profile.lastLogin}</span>
              </div>

              <div className="flex w-full max-w-lg flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="fp-search-field min-w-0 flex-1">
                  <span
                    className="material-symbols-outlined shrink-0 text-[20px]"
                    style={{ color: fp.muted }}
                  >
                    search
                  </span>
                  <input
                    type="search"
                    placeholder={t('Search schemes, applications, documents…')}
                  />
                </div>
                <Link
                  to="/farmer/grievances"
                  className="fp-btn fp-btn--ghost shrink-0 no-underline"
                >
                  <span className="material-symbols-outlined text-[18px]">headset_mic</span>
                  {t('Support')}
                </Link>
              </div>
            </div>

            {/* Right: actions cluster */}
            <div className="fp-hero-actions fp-hero-actions--split shrink-0 self-start">
              <Link
                to="/farmer/applications"
                className="fp-icon-btn relative"
                aria-label={t('Applications')}
              >
                <span className="material-symbols-outlined text-[22px]">assignment</span>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#1F5E3B]" />
              </Link>
              <button
                type="button"
                className="fp-icon-btn fp-icon-btn--wide"
                onClick={cycleLanguage}
                aria-label={t('Language')}
                data-notranslate
              >
                <span className="material-symbols-outlined text-[20px]">translate</span>
                <span className="hidden text-[0.7rem] font-bold sm:inline">{currentLabel}</span>
              </button>
              <Link
                to="/farmer/profile"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white no-underline shadow-sm transition-opacity hover:opacity-90"
                style={{ background: fp.primary }}
              >
                {displayName?.[0]?.toUpperCase() || 'F'}
              </Link>
            </div>
          </div>
        </FpCard>

        {/* ── Status chips ── */}
        <div className="fp-chip-row" aria-label={t('Verification status')}>
          {PROFILE_STATUS_CHIPS.map((c) => (
            <StatusChip
              key={c.id}
              label={t(c.label)}
              state={c.state === 'ok' ? 'ok' : c.state === 'warn' ? 'warn' : 'info'}
            />
          ))}
        </div>

        {/* ── Profile completion banner ── */}
        {incomplete && (
          <div className="fp-banner" role="status">
            <div className="flex min-w-0 gap-3">
              <span className="material-symbols-outlined shrink-0 text-[1.375rem] text-amber-600">
                info
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[0.875rem] font-bold leading-snug" style={{ color: fp.text }}>
                  {t('Complete your profile to apply for schemes.')}
                </p>
                <p className="m-0 mt-1.5 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                  {t('A few details and documents are still pending. Continue registration when convenient.')}
                </p>
              </div>
            </div>
            <Btn className="w-full shrink-0 sm:w-auto" onClick={openRegistration}>
              {t('Continue Registration')}
            </Btn>
          </div>
        )}

        {/* ── Stat tiles ── */}
        <div className="fp-stat-grid">
          <FpCard className="fp-stat-card">
            <p className="m-0 text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: fp.muted }}>
              {t('Profile')}
            </p>
            <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
              <ProfileCompletionRing pct={profile.profileCompletionPct} compact />
              <div className="min-w-0 flex-1 text-center sm:text-left" style={{ color: fp.muted }}>
                <Link to="/farmer/profile" className="text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                  {t('View profile')}
                </Link>
              </div>
            </div>
          </FpCard>

          <FpCard className="fp-stat-card">
            <p className="m-0 text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: fp.muted }}>
              {t('Land parcels')}
            </p>
            <p className="fp-heading fp-stat-value m-0 text-[1.75rem] font-bold leading-none" style={{ color: fp.text }}>
              {landParcels}
            </p>
            <p className="m-0 mt-1 text-[0.7rem] leading-snug" style={{ color: fp.muted }}>
              {t('Land parcels on record')}
            </p>
            <div className="fp-stat-link">
              <Link to="/farmer/schemes" className="text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                {t('Browse schemes')}
              </Link>
            </div>
          </FpCard>

          <FpCard className="fp-stat-card">
            <p className="m-0 text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: fp.muted }}>
              {t('Active applications')}
            </p>
            <p className="fp-heading fp-stat-value m-0 text-[1.75rem] font-bold leading-none" style={{ color: fp.text }}>
              {activeApps}
            </p>
            <div className="fp-stat-link">
              <Link to="/farmer/applications" className="text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                {t('Track progress')}
              </Link>
            </div>
          </FpCard>

          <FpCard className="fp-stat-card">
            <p className="m-0 text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: fp.muted }}>
              {t('Eligible schemes')}
            </p>
            <p className="fp-heading fp-stat-value m-0 text-[1.75rem] font-bold leading-none" style={{ color: fp.text }}>
              {eligibleCount}
            </p>
            <div className="fp-stat-link">
              <Link to="/farmer/schemes" className="text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                {t('Browse schemes')}
              </Link>
            </div>
          </FpCard>
        </div>

        {/* ── Pending + Updates twin panels ── */}
        <div className="fp-grid-2 fp-dashboard-twin">

          {/* Pending for you */}
          <FpCard>
            <div className="fp-panel-head">
              <h2 className="fp-heading">{t('Pending for you')}</h2>
            </div>
            <ul className="fp-pending-list">
              <li className="fp-pending-row">
                <div className="fp-pending-row__icon" aria-hidden>
                  <span className="material-symbols-outlined text-amber-600">agriculture</span>
                </div>
                <div className="fp-pending-row__body">
                  <p className="fp-pending-row__title">{t('Crop declaration')}</p>
                  <p className="fp-pending-row__desc">
                    {t('One parcel needs an updated crop entry for Kharif.')}
                  </p>
                  <Link to="/farmer/applications" className="fp-pending-row__link">
                    {t('Open applications')}
                  </Link>
                </div>
              </li>

              <li className="fp-pending-row">
                <div className="fp-pending-row__icon" aria-hidden>
                  <span className="material-symbols-outlined" style={{ color: fp.info }}>description</span>
                </div>
                <div className="fp-pending-row__body">
                  <p className="fp-pending-row__title">
                    {t('Documents need attention')} ({pendingDocs})
                  </p>
                  <p className="fp-pending-row__desc">
                    {t('PAN and Crop Declaration are pending or rejected.')}
                  </p>
                  <Link to="/farmer/schemes" className="fp-pending-row__link">
                    {t('Upload in scheme apply flow')}
                  </Link>
                </div>
              </li>

              <li className="fp-pending-row">
                <div className="fp-pending-row__icon" aria-hidden>
                  <span className="material-symbols-outlined" style={{ color: fp.primary }}>payments</span>
                </div>
                <div className="fp-pending-row__body">
                  <p className="fp-pending-row__title">{t('DBT checks')}</p>
                  <p className="fp-pending-row__desc">
                    {t('Resolve Aadhaar / bank mapping issues to avoid payment delays.')}
                  </p>
                  <Link to="/farmer/applications" className="fp-pending-row__link">
                    {t('Review applications')}
                  </Link>
                </div>
              </li>
            </ul>
          </FpCard>

          {/* Latest updates */}
          <FpCard>
            <div className="fp-panel-head">
              <h2 className="fp-heading">{t('Latest updates')}</h2>
              <Link to="/farmer/applications">{t('View all')}</Link>
            </div>
            <ul className="fp-updates-list">
              {NOTIFICATIONS.slice(0, 3).map((n) => (
                <li
                  key={n.id}
                  className="fp-update-row"
                  style={{ background: n.priority === 'high' ? '#fffbeb' : '#fafbfb' }}
                >
                  <div className="fp-update-row__main">
                    <p className="fp-update-row__title">{n.title}</p>
                    <p className="fp-update-row__body">{n.body}</p>
                    <p className="fp-update-row__time">{n.time}</p>
                  </div>
                  {n.unread ? (
                    <span className="fp-update-row__dot" aria-label={t('Unread')} />
                  ) : null}
                </li>
              ))}
            </ul>
          </FpCard>
        </div>

        {/* ── Quick actions ── */}
        <section className="min-w-0">
          <h2
            className="fp-heading m-0 mb-3 text-[0.9375rem] font-bold"
            style={{ color: fp.text }}
          >
            {t('Quick actions')}
          </h2>
          <div className="fp-qa-grid">
            {[
              { to: '/farmer/schemes',      icon: 'post_add',     label: t('Apply for Scheme') },
              { to: '/farmer/schemes',      icon: 'upload_file',  label: t('Upload documents') },
              { to: '/farmer/applications', icon: 'timeline',     label: t('Track Application') },
              { to: '/farmer/applications', icon: 'receipt_long', label: t('Application status') },
              { to: '/farmer/grievances',   icon: 'support_agent',label: t('Raise Grievance') },
            ].map((q) => (
              <Link key={q.label} to={q.to} className="fp-qa-tile">
                <span
                  className="material-symbols-outlined text-[1.35rem]"
                  style={{ color: fp.primary }}
                >
                  {q.icon}
                </span>
                <span
                  className="mt-2 max-w-[8rem] text-[0.6875rem] font-bold leading-tight"
                  style={{ color: fp.text }}
                >
                  {q.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
