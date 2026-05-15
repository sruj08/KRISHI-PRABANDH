import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, ShieldCheck, Sun, Tractor, Warehouse } from 'lucide-react';
import { fp } from '../farmerPortalUi';

export function SchemeIcon({ iconKey, className }) {
  const cn = className || 'fsm-scheme-card__icon-svg';
  if (iconKey === 'tractor') return <Tractor className={cn} aria-hidden />;
  if (iconKey === 'sun') return <Sun className={cn} aria-hidden />;
  if (iconKey === 'poly') return <Warehouse className={cn} aria-hidden />;
  if (iconKey === 'shield') return <ShieldCheck className={cn} aria-hidden />;
  return <Droplets className={cn} aria-hidden />;
}

function statusPillStyle(status) {
  switch (status) {
    case 'Eligible':
      return { bg: fp.primarySoft, fg: fp.primary, ring: '#c5d9cc' };
    case 'Applied':
      return { bg: '#eff6ff', fg: '#1e40af', ring: '#bfdbfe' };
    case 'Under Verification':
      return { bg: '#fffbeb', fg: '#b45309', ring: '#fde68a' };
    case 'Rejected':
      return { bg: '#fef2f2', fg: '#b91c1c', ring: '#fecaca' };
    case 'Approved':
      return { bg: '#ecfdf5', fg: '#047857', ring: '#a7f3d0' };
    default:
      return { bg: '#f4f4f5', fg: '#52525b', ring: '#e4e4e7' };
  }
}

/**
 * Government-style scheme tile — list view only (logic stays in parent).
 */
export default function SchemeCard({ scheme, canApply, onApply, onDetails }) {
  const st = statusPillStyle(scheme.portalStatus);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fsm-scheme-card-wrap"
    >
      <div className="fp-card fp-scheme-card fsm-scheme-card">
        <div className="fsm-scheme-card__head">
          <div className="fsm-scheme-card__icon" aria-hidden>
            <SchemeIcon iconKey={scheme.iconKey} />
          </div>
          <div className="fsm-scheme-card__titles">
            <p className="fsm-scheme-card__dept">{scheme.dept}</p>
            <h3 className="fsm-scheme-card__name">{scheme.name}</h3>
          </div>
          <span
            className="fsm-scheme-card__pill"
            style={{
              background: st.bg,
              color: st.fg,
              boxShadow: `inset 0 0 0 1px ${st.ring}`,
            }}
          >
            {scheme.portalStatus}
          </span>
        </div>

        <div className="fsm-scheme-card__meta">
          <div className="fsm-scheme-card__meta-cell">
            <p className="fsm-scheme-card__meta-label">Subsidy</p>
            <p className="fsm-scheme-card__meta-value fsm-scheme-card__meta-value--accent">
              {scheme.subsidyAmount || scheme.subsidy}
            </p>
          </div>
          <div className="fsm-scheme-card__meta-cell">
            <p className="fsm-scheme-card__meta-label">Deadline</p>
            <p className="fsm-scheme-card__meta-value">{scheme.deadline}</p>
          </div>
        </div>

        <div className="fsm-scheme-card__actions">
          {canApply ? (
            <button type="button" className="fp-btn fp-btn--primary fsm-scheme-card__btn" onClick={() => onApply(scheme)}>
              Apply
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="fp-btn fsm-scheme-card__btn fsm-scheme-card__btn--disabled"
            >
              Apply
            </button>
          )}
          <button type="button" className="fp-btn fp-btn--ghost fsm-scheme-card__btn" onClick={() => onDetails(scheme)}>
            Know more
          </button>
        </div>
      </div>
    </motion.article>
  );
}
