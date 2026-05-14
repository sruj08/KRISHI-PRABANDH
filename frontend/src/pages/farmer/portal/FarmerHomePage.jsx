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
        <FpCard className="fp-home-hero">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
            <div className="min-w-0 flex-1 space-y-4">
              <p className="fp-heading text-[clamp(1.2rem,3.5vw,1.45rem)] font-bold leading-snug" style={{ color: fp.text }}>
                {t('Namaskar')}, {displayName}{' '}
                <span className="font-normal" style={{ color: fp.muted }}>
                  👋
                </span>
              </p>
              <div className="fp-meta text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                <span>
                  <span className="font-semibold" style={{ color: fp.text }}>{t('Farmer ID')}</span>
                  {' '}
                  <span className="font-mono text-[0.75rem] tabular-nums">{profile.farmerId}</span>
                </span>
                <span>
                  {profile.village}, {profile.taluka}
                </span>
                <span>
                  {t('Last login')}: {profile.lastLogin}
                </span>
              </div>
              <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="fp-search-field min-w-0 flex-1">
                  <span className="material-symbols-outlined shrink-0 text-[20px]" style={{ color: fp.muted }}>
                    search
                  </span>
                  <input type="search" placeholder={t('Search schemes, applications, documents…')} />
                </div>
                <Btn variant="ghost" className="w-full shrink-0 sm:w-auto sm:min-w-[7.5rem]">
                  <span className="material-symbols-outlined text-[18px]">headset_mic</span>
                  {t('Support')}
                </Btn>
              </div>
            </div>
            <div className="fp-hero-actions fp-hero-actions--split shrink-0 self-start">
              <Link to="/farmer/notifications" className="fp-icon-btn relative" aria-label={t('Notifications')}>
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#b91c1c]" />
              </Link>
              <button type="button" className="fp-icon-btn fp-icon-btn--wide" onClick={cycleLanguage} aria-label={t('Language')}>
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

        <div className="fp-chip-row" aria-label={t('Verification status')}>
          {PROFILE_STATUS_CHIPS.map((c) => (
            <StatusChip
              key={c.id}
              label={t(c.label)}
              state={c.state === 'ok' ? 'ok' : c.state === 'warn' ? 'warn' : 'info'}
            />
          ))}
        </div>

        {incomplete && (
          <div className="fp-banner" role="status">
            <div className="flex min-w-0 gap-3">
              <span className="material-symbols-outlined shrink-0 text-amber-600 text-[1.5rem]">info</span>
              <div className="min-w-0">
                <p className="m-0 text-[0.9rem] font-bold leading-snug" style={{ color: fp.text }}>
                  {t('Complete your profile to apply for schemes.')}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                  {t('A few details and documents are still pending. Continue registration when convenient.')}
                </p>
              </div>
            </div>
            <Btn className="w-full shrink-0 sm:w-auto" onClick={openRegistration}>
              {t('Continue Registration')}
            </Btn>
          </div>
        )}

        <div className="fp-stat-grid">
          <FpCard className="fp-stat-card">
            <p className="m-0 text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: fp.muted }}>
              {t('Profile')}
            </p>
            <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <ProfileCompletionRing pct={profile.profileCompletionPct} compact />
              <div className="min-w-0 flex-1 text-center text-[0.8125rem] sm:text-left" style={{ color: fp.muted }}>
                <Link to="/farmer/profile" className="font-bold text-[#1F5E3B] no-underline hover:underline">
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
            <div className="fp-stat-link">
              <Link to="/farmer/land" className="text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                {t('Open land records')}
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

        <div className="fp-grid-2">
          <FpCard>
            <h2 className="fp-heading m-0 text-[1rem] font-bold" style={{ color: fp.text }}>
              {t('Pending for you')}
            </h2>
            <ul className="m-0 mt-4 list-none space-y-3 p-0">
              <li className="flex gap-3 rounded-xl border border-[#e4e8ec] bg-[#fafbfb] px-3 py-3 sm:px-4">
                <span className="material-symbols-outlined shrink-0 text-amber-600">agriculture</span>
                <div className="min-w-0">
                  <p className="m-0 font-semibold" style={{ color: fp.text }}>{t('Crop declaration')}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                    {t('One parcel needs an updated crop entry for Kharif.')}
                  </p>
                  <Link to="/farmer/land" className="mt-2 inline-block text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                    {t('Go to land records')}
                  </Link>
                </div>
              </li>
              <li className="flex gap-3 rounded-xl border border-[#e4e8ec] bg-[#fafbfb] px-3 py-3 sm:px-4">
                <span className="material-symbols-outlined shrink-0 text-[#1e5a8a]">description</span>
                <div className="min-w-0">
                  <p className="m-0 font-semibold" style={{ color: fp.text }}>
                    {t('Documents need attention')} ({pendingDocs})
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                    {t('PAN and Crop Declaration are pending or rejected.')}
                  </p>
                  <Link to="/farmer/documents" className="mt-2 inline-block text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                    {t('Open document center')}
                  </Link>
                </div>
              </li>
              <li className="flex gap-3 rounded-xl border border-[#e4e8ec] bg-[#fafbfb] px-3 py-3 sm:px-4">
                <span className="material-symbols-outlined shrink-0 text-[#1F5E3B]">payments</span>
                <div className="min-w-0">
                  <p className="m-0 font-semibold" style={{ color: fp.text }}>{t('DBT checks')}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                    {t('Resolve Aadhaar / bank mapping issues to avoid payment delays.')}
                  </p>
                  <Link to="/farmer/payments" className="mt-2 inline-block text-[0.8125rem] font-bold text-[#1F5E3B] no-underline hover:underline">
                    {t('Review payments')}
                  </Link>
                </div>
              </li>
            </ul>
          </FpCard>

          <FpCard>
            <div className="flex items-start justify-between gap-3">
              <h2 className="fp-heading m-0 text-[1rem] font-bold" style={{ color: fp.text }}>
                {t('Latest updates')}
              </h2>
              <Link to="/farmer/notifications" className="shrink-0 text-[0.75rem] font-bold text-[#1e5a8a] no-underline hover:underline">
                {t('View all')}
              </Link>
            </div>
            <ul className="m-0 mt-4 list-none space-y-2 p-0">
              {NOTIFICATIONS.slice(0, 3).map((n) => (
                <li
                  key={n.id}
                  className="rounded-xl border border-[#e4e8ec] px-3 py-2.5 text-[0.8125rem] sm:px-4"
                  style={{ background: n.priority === 'high' ? '#fffbeb' : '#fafbfb' }}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold leading-snug" style={{ color: fp.text }}>{n.title}</span>
                    {n.unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1F5E3B]" /> : null}
                  </div>
                  <p className="m-0 mt-1 leading-relaxed" style={{ color: fp.muted }}>{n.body}</p>
                  <p className="m-0 mt-1 text-[0.6875rem]" style={{ color: '#9aa19c' }}>{n.time}</p>
                </li>
              ))}
            </ul>
          </FpCard>
        </div>

        <section className="min-w-0">
          <h2 className="fp-heading m-0 mb-3 text-[0.95rem] font-bold" style={{ color: fp.text }}>
            {t('Quick actions')}
          </h2>
          <div className="fp-qa-grid">
            {[
              { to: '/farmer/schemes', icon: 'post_add', label: t('Apply for Scheme') },
              { to: '/farmer/documents', icon: 'upload_file', label: t('Upload Documents') },
              { to: '/farmer/applications', icon: 'timeline', label: t('Track Application') },
              { to: '/farmer/payments', icon: 'receipt_long', label: t('Download Receipts') },
              { to: '/farmer/grievances', icon: 'support_agent', label: t('Raise Grievance') },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="fp-qa-tile">
                <span className="material-symbols-outlined text-[#1F5E3B] text-[1.35rem]">{q.icon}</span>
                <span className="mt-2 max-w-[9rem] text-[0.6875rem] font-bold leading-tight" style={{ color: fp.text }}>
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
