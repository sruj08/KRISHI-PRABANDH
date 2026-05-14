import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerShell from '../../components/officer/OfficerShell';
import { DAILY_TASKS } from '../../mock/officer-operations';

const priorityDot = (p) => (p === 'HIGH' ? '#9a2828' : p === 'MEDIUM' ? '#a15c0a' : '#5f665b');

const OfficerDailyTasksPage = () => {
  const navigate = useNavigate();

  return (
    <OfficerShell
      title="Daily tasks"
      purpose="Your taluka work plan: scheduled verifications, field visits, and sign-offs. Tasks link straight into the right module."
      attention={`${DAILY_TASKS.filter((t) => t.priority === 'HIGH').length} high-priority items before 17:00.`}
      nextAction="Complete field visit prep first — GPS and photo bundles are time-sensitive."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAILY_TASKS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="op-card op-card--hover"
            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
            onClick={() => navigate(t.route)}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityDot(t.priority), flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650, color: 'var(--op-text)', fontSize: '0.9375rem' }}>{t.title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--op-muted)', marginTop: 2 }}>Due {t.time}</div>
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--op-soft)' }}>chevron_right</span>
          </button>
        ))}
      </div>
    </OfficerShell>
  );
};

export default OfficerDailyTasksPage;
