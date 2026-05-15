import React, { useState } from 'react';

// Muted enterprise palette - soft tints with subtle 1px borders.
// All status tokens share the same shape so badges, avatars, and
// rank pills compose into one cohesive design system.
const STATUS_META = {
  excellent: {
    fg: '#1f4d36', bg: '#e8f0ea', border: 'rgba(31, 77, 54, 0.18)',
    avatarFg: '#1f4d36', avatarBg: '#e8f0ea',
    icon: 'star', label: 'Excellent',
  },
  good: {
    fg: '#1f4d36', bg: '#eef3ef', border: 'rgba(31, 77, 54, 0.14)',
    avatarFg: '#1f4d36', avatarBg: '#eef3ef',
    icon: 'check', label: 'On Track',
  },
  warning: {
    fg: '#b45309', bg: '#fff4e6', border: 'rgba(180, 83, 9, 0.18)',
    avatarFg: '#b45309', avatarBg: '#fff4e6',
    icon: 'priority_high', label: 'Warning',
  },
  critical: {
    fg: '#ba1a1a', bg: '#fff0ee', border: 'rgba(186, 26, 26, 0.18)',
    avatarFg: '#ba1a1a', avatarBg: '#fff0ee',
    icon: 'priority_high', label: 'Critical',
  },
};

// Tonal rank chips - first place gets a subtle gold tint, others sit neutral.
const RANK_META = [
  { fg: '#7a5310', bg: '#fdf4dc', border: 'rgba(122, 83, 16, 0.16)' },
  { fg: '#5f676b', bg: '#f3f4f0', border: 'rgba(20, 40, 30, 0.08)' },
  { fg: '#5f676b', bg: '#f3f4f0', border: 'rgba(20, 40, 30, 0.08)' },
];

const MiniBar = ({ values }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-bar-wrap">
      {values.map((v, i) => {
        const pct = v / max;
        return (
          <div key={i} className="mini-bar-col">
            <div className="mini-bar-fill" style={{ height: `${pct * 28}px`, opacity: 0.4 + pct * 0.55 }} />
          </div>
        );
      })}
    </div>
  );
};

const SahayakMatrix = ({ sahayaks }) => {
  const [selected, setSelected] = useState(null);
  const sorted = [...sahayaks].sort((a, b) => b.verifications_week - a.verifications_week);

  return (
    <div className="sahayak-wrap">
      {sorted.map((s, rank) => {
        const meta = STATUS_META[s.status];
        const rankMeta = RANK_META[rank] || RANK_META[2];
        const isSelected = selected === s.id;
        const avgNumClass =
          s.avg_days > 7 ? 'sahayak-stat-num sahayak-stat-num--danger'
          : s.avg_days > 5 ? 'sahayak-stat-num sahayak-stat-num--warning'
          : 'sahayak-stat-num';
        const overdueNumClass =
          s.overdue_15d > 10 ? 'sahayak-stat-num sahayak-stat-num--danger'
          : s.overdue_15d > 3 ? 'sahayak-stat-num sahayak-stat-num--warning'
          : 'sahayak-stat-num';

        return (
          <div key={s.id}
            className={`sahayak-card ${isSelected ? 'sahayak-card--open' : ''}`}>

            <div className="sahayak-header" onClick={() => setSelected(isSelected ? null : s.id)}>
              {/* Rank chip */}
              <div className="sahayak-rank" style={{ background: rankMeta.bg, color: rankMeta.fg, border: `1px solid ${rankMeta.border}` }}>
                {rank + 1}
              </div>

              {/* Avatar */}
              <div className="sahayak-avatar" style={{ background: meta.avatarBg, color: meta.avatarFg, border: `1px solid ${meta.border}` }}>
                {s.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Info */}
              <div className="sahayak-info">
                <div className="sahayak-name">
                  {s.name}
                  <span className="sahayak-status-badge" style={{ background: meta.bg, color: meta.fg, border: `1px solid ${meta.border}` }}>
                    <span className="material-symbols-outlined">{meta.icon}</span>
                    {meta.label}
                  </span>
                </div>
                <div className="sahayak-sub">Circle {s.circle} · {s.villages.length} villages</div>
              </div>

              {/* Stats */}
              <div className="sahayak-stats">
                <div className="sahayak-stat-block">
                  <span className="sahayak-stat-num">{s.verifications_week}</span>
                  <span className="sahayak-stat-lbl">Verifications</span>
                </div>
                <div className="sahayak-stat-block">
                  <span className={avgNumClass}>{s.avg_days}d</span>
                  <span className="sahayak-stat-lbl">Avg Time</span>
                </div>
                <div className="sahayak-stat-block">
                  <span className={overdueNumClass}>{s.overdue_15d}</span>
                  <span className="sahayak-stat-lbl">Overdue</span>
                </div>
                <MiniBar values={s.trend} />
              </div>

              <span className="material-symbols-outlined sahayak-chevron">
                {isSelected ? 'expand_less' : 'expand_more'}
              </span>
            </div>

            {isSelected && (
              <div className="sahayak-detail">
                {/* Alert for critical/warning */}
                {(s.status === 'critical' || s.status === 'warning') && (
                  <div className="sahayak-alert" style={{ background: meta.bg, borderColor: meta.color }}>
                    <span className="material-symbols-outlined" style={{ color: meta.color }}>notifications_active</span>
                    <span>
                      {s.status === 'critical'
                        ? `⚠️ ${s.name} has ${s.overdue_15d} files overdue over 15 days and only ${s.verifications_week} verifications this week. Immediate action required.`
                        : `${s.name} is falling behind. Avg turnaround ${s.avg_days} days exceeds the 5-day SLA.`}
                    </span>
                  </div>
                )}
                <div className="sahayak-detail-grid">
                  <div><span>Assigned Villages</span><strong>{s.villages.slice(0, 4).join(', ')}{s.villages.length > 4 ? `… +${s.villages.length - 4}` : ''}</strong></div>
                  <div><span>Total Pending</span><strong>{s.total_pending}</strong></div>
                  <div><span>Last Field Visit</span><strong>{s.last_field_visit}</strong></div>
                  <div><span>Employee ID</span><strong>{s.id}</strong></div>
                </div>
                <div className="sahayak-actions">
                  <a className="sahayak-btn whatsapp" href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined">chat</span>
                    WhatsApp Alert
                  </a>
                  <button className="sahayak-btn call">
                    <span className="material-symbols-outlined">call</span>
                    Call Now
                  </button>
                  <button className="sahayak-btn view">
                    <span className="material-symbols-outlined">open_in_new</span>
                    View Files
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SahayakMatrix;
