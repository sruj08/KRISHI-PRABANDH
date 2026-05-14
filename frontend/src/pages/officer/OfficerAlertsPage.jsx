import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerShell from '../../components/officer/OfficerShell';
import { ALERTS_FEED } from '../../mock/officer-operations';

const OfficerAlertsPage = () => {
  const navigate = useNavigate();

  return (
    <OfficerShell
      title="Alerts & risk queue"
      purpose="Cross-cutting risk signals that need triage before they become backlog. Open an alert to jump to the owning workflow."
      attention={`${ALERTS_FEED.filter((a) => a.severity === 'high').length} high-priority signals in the last 24 hours.`}
      nextAction="Start with duplicate identity alerts — they block DBT and compensation releases."
    >
      <div className="op-card">
        <div className="op-section-head">
          <h2>Live alert feed</h2>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALERTS_FEED.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="op-card op-card--hover"
                style={{ width: '100%', textAlign: 'left', padding: '14px 16px', display: 'block' }}
                onClick={() => navigate(a.path)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      width: 4,
                      alignSelf: 'stretch',
                      borderRadius: 99,
                      background: a.severity === 'high' ? 'var(--op-red)' : 'var(--op-amber)',
                    }}
                  />
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--op-text)' }}>{a.title}</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--op-muted)', paddingLeft: 14 }}>{a.detail}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </OfficerShell>
  );
};

export default OfficerAlertsPage;
