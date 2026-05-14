import React from 'react';
import '../district/district.css';
import '../state/state-dashboard.css';

export const TEXT_PRIMARY = '#1a1c1a';
export const TEXT_MUTED = '#717972';

/** Presentational KPI tile — matches StateDashboard markup/classes. */
export const DivisionKpiCard = ({
  icon,
  label,
  value,
  unit,
  sub,
  subIcon,
  subColor = '#717972',
  progress,
  children,
  onClick,
  /** When true, do not prefix value with ₹ (counts, days, % as primary figure). */
  noCurrency,
}) => (
  <div
    onClick={onClick}
    className={`state-dashboard__kpi${onClick ? ' state-dashboard__kpi--clickable' : ''}`}
  >
    <div className="state-dashboard__kpi-head">
      <div className="state-dashboard__kpi-icon-wrap">
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#5c6560' }}>{icon}</span>
      </div>
      <span className="state-dashboard__kpi-label">{label}</span>
    </div>
    {children ? (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>{children}</div>
    ) : (
      <>
        <div className="state-dashboard__kpi-value-row">
          <span className="state-dashboard__kpi-value">
            {noCurrency || (value && value.startsWith('₹')) ? value : `₹${value}`}
          </span>
          {unit && <span className="state-dashboard__kpi-unit">{unit}</span>}
        </div>
        {progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 6, background: '#eceee9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#396940', borderRadius: 99, width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
          </div>
        )}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, fontWeight: 600, marginTop: 'auto', paddingTop: 12, color: subColor, lineHeight: 1.45 }}>
            {subIcon && <span className="material-symbols-outlined" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{subIcon}</span>}
            <span style={{ minWidth: 0 }}>{sub}</span>
          </div>
        )}
      </>
    )}
  </div>
);

export const DivisionPanelSection = ({ title, subtitle, badge, children, bodyClassName }) => (
  <div className="state-dashboard__panel">
    <div className="state-dashboard__panel-head">
      <div style={{ minWidth: 0 }}>
        <h3 className="state-dashboard__panel-title">{title}</h3>
        {subtitle && <p className="state-dashboard__panel-sub">{subtitle}</p>}
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ba1a1a', background: 'rgba(255,218,214,0.45)', padding: '5px 10px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>{badge}</span>
      )}
    </div>
    <div className={bodyClassName || undefined}>{children}</div>
  </div>
);

export const DivisionFrictionRow = ({ label, pct, color }) => (
  <div className="state-dashboard__friction-row">
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 500, color: TEXT_PRIMARY, flex: 1, minWidth: 0, lineHeight: 1.45 }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums', paddingLeft: 4 }}>{pct}%</span>
  </div>
);

export const STATUS_CHIP = {
  Leading: { color: '#1b5e20', bg: 'rgba(186,240,188,0.45)' },
  'On track': { color: '#1b5e20', bg: 'rgba(186,240,188,0.30)' },
  Watch: { color: '#c47200', bg: 'rgba(255,224,178,0.45)' },
  Lagging: { color: '#ba1a1a', bg: 'rgba(255,218,214,0.45)' },
  Stable: { color: '#1b5e20', bg: 'rgba(186,240,188,0.28)' },
  Moderate: { color: '#c47200', bg: 'rgba(255,224,178,0.35)' },
  Critical: { color: '#c62828', bg: 'rgba(255,218,214,0.5)' },
  Overloaded: { color: '#b71c1c', bg: 'rgba(255,218,214,0.55)' },
};
