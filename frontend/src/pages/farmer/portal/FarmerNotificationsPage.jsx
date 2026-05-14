import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { NOTIFICATIONS } from '../../../mock/farmerDashboardMock';
import { FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerNotificationsPage() {
  const { t } = useLanguage();

  return (
    <FarmerPageShell
      title={t('Notifications')}
      subtitle={t('Application updates, document verification, payments, deadlines, and corrections.')}
    >
      <div className="space-y-2.5">
        {NOTIFICATIONS.map((n) => (
          <FpCard
            key={n.id}
            className={`!p-4 ${n.priority === 'high' ? '!border-amber-200 !bg-amber-50/80' : ''}`}
          >
            <div className="flex justify-between gap-3">
              <p className="font-bold leading-snug text-[0.875rem]" style={{ color: fp.text }}>{n.title}</p>
              {n.unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1F5E3B]" /> : null}
            </div>
            <p className="mt-2 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>{n.body}</p>
            <p className="mt-2 text-[0.6875rem]" style={{ color: '#9aa19c' }}>{n.time}</p>
          </FpCard>
        ))}
      </div>
    </FarmerPageShell>
  );
}
