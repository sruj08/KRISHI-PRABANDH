import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../components/officer/officer-shell.css';
import {
  OFFICER_PROFILE,
  OPERATIONAL_PULSE,
  PRIORITY_QUEUE,
  TALUKA_SNAPSHOT,
  AI_INSIGHTS,
  VILLAGE_HEAT,
  ACTIVITY_FEED,
} from '../../mock/officer-operations';

const urgencyBar = (u) => {
  if (u === 'critical') return '#9a2828';
  if (u === 'high') return '#c2410c';
  if (u === 'medium') return '#a16207';
  return '#5c6648';
};

const heatLabel = (s) => {
  if (s === 'stable') return 'Stable';
  if (s === 'watch') return 'Watch';
  return 'Anomaly-heavy';
};

const SahayakDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profile = useMemo(() => {
    const name = user?.name || OFFICER_PROFILE.displayName;
    const first = name.split(/\s+/)[0];
    const taluka = user?.taluka_name || OFFICER_PROFILE.taluka;
    const district = user?.district_name || OFFICER_PROFILE.district;
    return {
      greetingName: first,
      fullName: name,
      location: `${taluka} · ${district}`,
      status: OFFICER_PROFILE.operationalStatus,
      weather: OFFICER_PROFILE.weatherSnippet,
      pending: OFFICER_PROFILE.pendingWorkload,
    };
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="op-page">
      <div className="op-page__inner">
        <header className="op-hero" style={{ marginBottom: 20 }}>
          <div style={{ flex: '1 1 280px' }}>
            <h1 className="op-hero__title" style={{ marginBottom: 8 }}>
              {greeting}, {profile.greetingName}
            </h1>
            <p className="op-hero__meta" style={{ marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'text-bottom', marginRight: 4 }}>location_on</span>
              {profile.location}
            </p>
            <p className="op-hero__meta" style={{ marginBottom: 6 }}>{profile.status}</p>
            <p className="op-hero__meta" style={{ margin: 0 }}>{profile.weather}</p>
            <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', fontWeight: 650, color: 'var(--op-text)' }}>
              Today’s pending workload: <span style={{ color: 'var(--op-green)' }}>{profile.pending}</span> items across verification, field, and relief queues
            </p>
          </div>

          <aside className="op-card" style={{ flex: '0 1 280px', alignSelf: 'stretch' }}>
            <p className="op-purpose-card__k" style={{ marginBottom: 10 }}>Operational pulse</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {OPERATIONAL_PULSE.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => navigate(p.path)}
                  className="op-card--hover"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: '1px solid var(--op-border)',
                    borderRadius: 10,
                    background: '#fafbf8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: `3px solid ${
                      p.tone === 'red' ? 'var(--op-red)' : p.tone === 'amber' ? 'var(--op-amber)' : 'var(--op-green)'
                    }`,
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'var(--op-muted)', maxWidth: '62%' }}>{p.label}</span>
                  <strong style={{ fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>{p.value}</strong>
                </button>
              ))}
            </div>
          </aside>
        </header>

        <div className="op-grid-2" style={{ marginBottom: 22 }}>
          <section>
            <div className="op-section-head">
              <h2>Priority action queue</h2>
              <button type="button" className="op-link" onClick={() => navigate('/officer/daily-tasks')}>Daily tasks</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PRIORITY_QUEUE.map((item) => (
                <article
                  key={item.id}
                  className="op-card op-card--hover"
                  onClick={() => navigate(item.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                    <span style={{ width: 4, borderRadius: 99, background: urgencyBar(item.urgency), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.02rem', fontWeight: 650 }}>{item.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)', lineHeight: 1.45 }}>{item.detail}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 12 }}>
                        <button
                          type="button"
                          className="op-btn op-btn--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(item.path);
                          }}
                        >
                          {item.actionLabel}
                        </button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--op-soft)' }}>{item.timeLabel}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="op-section-head">
              <h2>Taluka snapshot</h2>
            </div>
            <div className="op-card" style={{ display: 'grid', gap: 12 }}>
              {[
                ['Active farmers', TALUKA_SNAPSHOT.activeFarmers.toLocaleString()],
                ['Applications this week', TALUKA_SNAPSHOT.applicationsThisWeek],
                ['Approved today', TALUKA_SNAPSHOT.approvedToday],
                ['Pending field visits', TALUKA_SNAPSHOT.pendingFieldVisits],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #eef0eb', paddingBottom: 8 }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--op-muted)' }}>{k}</span>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</strong>
                </div>
              ))}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--op-soft)' }}>High-risk villages</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {TALUKA_SNAPSHOT.highRiskVillages.map((v) => (
                    <button key={v} type="button" className="op-chip op-chip--on" onClick={() => navigate('/officer/alerts')}>{v}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="op-section-head" style={{ marginTop: 22 }}>
              <h2>Village risk heatmap</h2>
              <button type="button" className="op-link" onClick={() => navigate('/officer/geo-surveys')}>Surveys</button>
            </div>
            <div className="op-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {VILLAGE_HEAT.map((v) => (
                  <div
                    key={v.village}
                    className="op-card--hover"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--op-border)',
                      cursor: 'pointer',
                      background:
                        v.status === 'stable' ? 'rgba(31,77,54,0.06)' : v.status === 'watch' ? 'rgba(161,92,10,0.08)' : 'rgba(154,40,40,0.08)',
                    }}
                    onClick={() => navigate('/officer/crop-damage')}
                    role="presentation"
                  >
                    <div style={{ fontWeight: 650, fontSize: '0.875rem' }}>{v.village}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--op-muted)', marginTop: 4 }}>{heatLabel(v.status)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--op-soft)', marginTop: 2 }}>{v.cases} open signals</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="op-grid-2">
          <section className="op-card">
            <div className="op-section-head">
              <h2>Smart AI insights</h2>
              <button type="button" className="op-link" onClick={() => navigate('/officer/ai-verification')}>AI verification</button>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AI_INSIGHTS.map((ins) => (
                <li key={ins.id} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                  <button type="button" className="op-link" style={{ textAlign: 'left' }} onClick={() => navigate(ins.path)}>
                    {ins.text}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="op-card">
            <div className="op-section-head">
              <h2>Recent activity</h2>
              <button type="button" className="op-link" onClick={() => navigate('/officer/audit-logs')}>Audit log</button>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTIVITY_FEED.map((a) => (
                <li key={a.id} style={{ display: 'flex', gap: 10, fontSize: '0.875rem', borderBottom: '1px solid #eef0eb', paddingBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--op-soft)', minWidth: 52 }}>{a.time}</span>
                  <span style={{ color: 'var(--op-muted)' }}>{a.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SahayakDashboard;
