import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PAYMENT_FAILURES, PAYMENTS } from '../../../mock/farmerDashboardMock';
import { Btn, FarmerPageShell, FpCard, fp, PaymentStatus } from './farmerPortalUi';

export default function FarmerPaymentsPage() {
  const { t } = useLanguage();

  return (
    <FarmerPageShell
      title={t('Payments & subsidy status')}
      subtitle={t('DBT credits, processing states, and common hold reasons (demo).')}
    >
      <div className="overflow-x-auto rounded-xl border border-[#e4e8ec] bg-white">
        <table className="w-full min-w-[520px] text-left text-[0.75rem] sm:text-[0.8125rem]">
          <thead className="border-b border-[#e4e8ec] bg-[#f7f8fa] font-bold" style={{ color: fp.muted }}>
            <tr>
              <th className="p-3 sm:p-3.5">{t('Scheme')}</th>
              <th className="p-3 sm:p-3.5">{t('Amount')}</th>
              <th className="p-3 sm:p-3.5">{t('Transaction ID')}</th>
              <th className="p-3 sm:p-3.5">{t('Status')}</th>
              <th className="p-3 sm:p-3.5">{t('Date')}</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.id} className="border-b border-[#e4e8ec] last:border-0">
                <td className="p-3 font-semibold sm:p-3.5" style={{ color: fp.text }}>{p.scheme}</td>
                <td className="p-3 sm:p-3.5">{p.amount}</td>
                <td className="p-3 font-mono text-[0.6875rem] sm:p-3.5">{p.txnId}</td>
                <td className="p-3 sm:p-3.5">
                  <PaymentStatus status={p.status} />
                </td>
                <td className="p-3 sm:p-3.5" style={{ color: fp.muted }}>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="fp-heading mb-3 text-[0.9375rem] font-bold" style={{ color: fp.text }}>
          {t('Payment issues (examples)')}
        </h3>
        <div className="space-y-3">
          {PAYMENT_FAILURES.map((f) => (
            <FpCard
              key={f.id}
              className="!border-red-100 !bg-[#fef2f2] !p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-[0.875rem] text-[#991b1b]">{f.title}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: fp.muted }}>{f.detail}</p>
                  <p className="mt-1 font-mono text-[0.625rem]" style={{ color: '#9aa19c' }}>{f.code}</p>
                </div>
                <Btn variant="ghost" className="shrink-0 border-red-200 text-[#b91c1c]">
                  {t('Fix Issue')}
                </Btn>
              </div>
            </FpCard>
          ))}
        </div>
      </div>
    </FarmerPageShell>
  );
}
