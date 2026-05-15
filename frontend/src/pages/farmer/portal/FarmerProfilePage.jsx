import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { FARMER_PROFILE } from '../../../mock/farmerDashboardMock';
import { Btn, FarmerPageShell, FpCard, fp, ProfileCompletionRing } from './farmerPortalUi';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: 'person' },
  { id: 'address', label: 'Address', icon: 'home_pin' },
  { id: 'bank', label: 'Bank Details', icon: 'account_balance' },
  { id: 'aadhaar', label: 'Aadhaar / eKYC', icon: 'verified_user' },
  { id: 'land', label: 'Land Records', icon: 'map' },
  { id: 'family', label: 'Family Details', icon: 'groups' },
  { id: 'uploads', label: 'Uploaded Documents', icon: 'folder_open' },
];

export default function FarmerProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('personal');

  const profile = FARMER_PROFILE;
  const displayName = user?.username || profile.fullName;

  const modalBody = useMemo(() => {
    switch (tab) {
      case 'personal':
        return t('Personal details as per Aadhaar and farmer registry. Update through CSC or a verified channel.');
      case 'address':
        return profile.address;
      case 'bank':
        return t('Bank account ending ****3210 - NPCI Aadhaar mapping status is shown under Payments.');
      case 'aadhaar':
        return `${profile.maskedAadhaar} - ${t('eKYC completed on record.')}`;
      case 'land':
        return t('Survey numbers and extracts are managed under Land Records.');
      case 'family':
        return t('Nominee and family members as declared for PM-Kisan / insurance.');
      case 'uploads':
        return t('See Document center for file-level verification status.');
      default:
        return '';
    }
  }, [tab, profile, t]);

  return (
    <>
      <FarmerPageShell
        title={t('Profile')}
        subtitle={t('Manage your identity, contact details, and verification status for scheme applications.')}
      >
        <FpCard>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 gap-4">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold md:h-24 md:w-24"
                style={{ background: fp.primarySoft, color: fp.primary }}
              >
                {displayName?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 space-y-1.5 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>
                <p className="fp-heading text-[1.125rem] font-bold" style={{ color: fp.text }}>{displayName}</p>
                <p>{profile.maskedAadhaar}</p>
                <p>{profile.mobile}</p>
                <p style={{ color: fp.text }}>{profile.address}</p>
                <p className="text-[0.75rem]">
                  <span className="font-semibold">{t('Category')}:</span> {profile.category}
                  {' · '}
                  <span className="font-semibold">{t('Landholding')}:</span> {profile.landholdingType}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row md:flex-col md:items-end">
              <ProfileCompletionRing pct={profile.profileCompletionPct} />
              <div className="flex flex-wrap justify-center gap-2 md:justify-end">
                <Btn variant="ghost">{t('Edit Profile')}</Btn>
                <Btn variant="secondary">{t('Download Farmer ID')}</Btn>
                <Btn onClick={() => setShowModal(true)}>{t('View Full Profile')}</Btn>
              </div>
            </div>
          </div>
        </FpCard>
      </FarmerPageShell>

      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label={t('Close')} onClick={() => setShowModal(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#e4e8ec] px-4 py-3 sm:px-5">
              <h2 className="fp-heading text-[1.0625rem] font-bold">{t('Full profile')}</h2>
              <button type="button" className="icon-btn-soft" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex shrink-0 gap-0 overflow-x-auto border-b border-[#e4e8ec] px-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTab(s.id)}
                  className={`shrink-0 border-b-2 px-2.5 py-2.5 text-[0.6875rem] font-bold sm:text-[0.75rem] ${
                    tab === s.id ? 'border-[#1F5E3B] text-[#1F5E3B]' : 'border-transparent text-[#5c6560]'
                  }`}
                >
                  {t(s.label)}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[0.875rem] leading-relaxed" style={{ color: fp.muted }}>
              {modalBody}
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-[#e4e8ec] px-4 py-3">
              <Btn variant="ghost" onClick={() => setShowModal(false)}>{t('Close')}</Btn>
              <Btn onClick={() => setShowModal(false)}>{t('Save (demo)')}</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
