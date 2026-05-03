import React, { useState } from 'react';

const STATUS_META = {
  excellent: { color: '#0055A4', bg: '#e8f0fb', icon: 'star',        label: 'Excellent' },
  good:      { color: '#2D6A4F', bg: '#ebf7f1', icon: 'thumb_up',    label: 'On Track'  },
  warning:   { color: '#e07800', bg: '#fff3e0', icon: 'warning',     label: 'Warning'   },
  critical:  { color: '#ba1a1a', bg: '#ffdad6', icon: 'priority_high',label: 'Critical' },
};

const MiniBar = ({ values }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-bar-wrap">
      {values.map((v, i) => (
        <div key={i} className="mini-bar-col">
          <div className="mini-bar-fill" style={{ height: `${(v / max) * 32}px` }} />
        </div>
      ))}
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
        const isSelected = selected === s.id;

        return (
          <div key={s.id}
            className={`sahayak-card ${isSelected ? 'sahayak-card--open' : ''}`}
            style={{ borderLeft: `4px solid ${meta.color}` }}>

            <div className="sahayak-header" onClick={() => setSelected(isSelected ? null : s.id)}>
              {/* Rank badge */}
              <div className="sahayak-rank" style={{ background: rank === 0 ? '#FFB703' : '#e0e4da', color: rank === 0 ? '#281900' : '#40493d' }}>
                #{rank + 1}
              </div>

              {/* Avatar */}
              <div className="sahayak-avatar" style={{ background: meta.bg, color: meta.color }}>
                {s.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Info */}
              <div className="sahayak-info">
                <div className="sahayak-name">
                  {s.name}
                  <span className="sahayak-status-badge" style={{ background: meta.bg, color: meta.color }}>
                    <span className="material-symbols-outlined">{meta.icon}</span>
                    {meta.label}
                  </span>
                </div>
                <div className="sahayak-sub">Circle {s.circle} · {s.villages.length} villages</div>
              </div>

              {/* Stats */}
              <div className="sahayak-stats">
                <div className="sahayak-stat-block">
                  <span className="sahayak-stat-num" style={{ color: meta.color }}>{s.verifications_week}</span>
                  <span className="sahayak-stat-lbl">verifications</span>
                </div>
                <div className="sahayak-stat-block">
                  <span className="sahayak-stat-num" style={{ color: s.avg_days > 7 ? '#ba1a1a' : '#2D6A4F' }}>
                    {s.avg_days}d
                  </span>
                  <span className="sahayak-stat-lbl">avg time</span>
                </div>
                <div className="sahayak-stat-block">
                  <span className="sahayak-stat-num" style={{ color: s.overdue_15d > 10 ? '#ba1a1a' : '#40493d' }}>
                    {s.overdue_15d}
                  </span>
                  <span className="sahayak-stat-lbl">overdue</span>
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
