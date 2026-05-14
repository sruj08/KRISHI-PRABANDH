import React from 'react';

export const fp = {
  primary: '#1F5E3B',
  primarySoft: '#EAF5EE',
  bg: '#F7F8FA',
  border: '#e4e8ec',
  text: '#1a1f1c',
  muted: '#5c6560',
  info: '#1e5a8a',
  amber: '#b45309',
  red: '#b91c1c',
};

export function FarmerPageShell({ title, subtitle, children }) {
  return (
    <div className="fp-page">
      <header className="fp-page-head">
        <h1 className="fp-heading fp-page-title">{title}</h1>
        {subtitle ? <p className="fp-page-subtitle">{subtitle}</p> : null}
      </header>
      <div className="fp-page-body">{children}</div>
    </div>
  );
}

const btnVariantClass = {
  primary: 'fp-btn fp-btn--primary',
  ghost: 'fp-btn fp-btn--ghost',
  secondary: 'fp-btn fp-btn--secondary',
};

export function Btn({ children, variant = 'primary', className = '', ...rest }) {
  return (
    <button type="button" className={`${btnVariantClass[variant] || btnVariantClass.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function StatusChip({ label, state }) {
  const cls =
    state === 'ok' ? 'fp-chip fp-chip-ok'
    : state === 'warn' ? 'fp-chip fp-chip-warn'
    : state === 'err' ? 'fp-chip fp-chip-err'
    : 'fp-chip fp-chip-info';
  return (
    <span className={cls}>
      {state === 'ok' && <span className="material-symbols-outlined fp-chip-ic">check_circle</span>}
      {state === 'warn' && <span className="material-symbols-outlined fp-chip-ic">warning</span>}
      {label}
    </span>
  );
}

export function DocStatusPill({ status }) {
  const map = {
    verified: { label: 'Verified', className: 'fp-chip fp-chip-ok' },
    pending: { label: 'Pending Review', className: 'fp-chip fp-chip-warn' },
    rejected: { label: 'Rejected', className: 'fp-chip fp-chip-err' },
    expired: { label: 'Expired', className: 'fp-chip fp-chip-err' },
  };
  const x = map[status] || map.pending;
  return <span className={x.className}>{x.label}</span>;
}

export function AppStatusPill({ status, label }) {
  const map = {
    pending: { className: 'fp-chip fp-chip-warn' },
    approved: { className: 'fp-chip fp-chip-ok' },
    rejected: { className: 'fp-chip fp-chip-err' },
    review: { className: 'fp-chip fp-chip-info' },
  };
  const x = map[status] || map.review;
  return <span className={x.className}>{label}</span>;
}

export function PaymentStatus({ status }) {
  const labels = {
    credited: 'Credited',
    processing: 'Processing',
    failed: 'Failed',
    awaiting: 'Awaiting Verification',
  };
  const cls =
    status === 'credited' ? 'fp-pay fp-pay--ok'
    : status === 'failed' ? 'fp-pay fp-pay--err'
    : 'fp-pay fp-pay--pending';
  return <span className={cls}>{labels[status] || status}</span>;
}

export function ProfileCompletionRing({ pct, compact = false }) {
  const size = compact ? 88 : 120;
  const r = compact ? 36 : 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div
      className={`fp-completion-ring relative flex flex-col items-center justify-center shrink-0 ${compact ? 'fp-completion-ring--compact' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e4e8ec" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={fp.primary}
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="fp-heading text-[clamp(1rem,4vw,1.375rem)] font-bold" style={{ color: fp.text }}>
          {pct}%
        </span>
        <span className="text-[0.625rem] font-semibold uppercase tracking-wide" style={{ color: fp.muted }}>
          Complete
        </span>
      </div>
    </div>
  );
}

export function FpCard({ className = '', children }) {
  return <div className={['fp-card', className].filter(Boolean).join(' ')}>{children}</div>;
}
