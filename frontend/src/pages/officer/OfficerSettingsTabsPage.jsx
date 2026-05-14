import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OfficerShell from '../../components/officer/OfficerShell';

const TABS = [
  { id: 'prefs', label: 'User preferences' },
  { id: 'notif', label: 'Notification rules' },
  { id: 'ai', label: 'AI thresholds' },
  { id: 'verify', label: 'Verification rules' },
  { id: 'lang', label: 'Language' },
  { id: 'sync', label: 'Device sync' },
];

const OfficerSettingsTabsPage = () => {
  const [tab, setTab] = useState('prefs');

  return (
    <OfficerShell
      title="Settings"
      purpose="Configure how you work in Krishi Prabandh: alerts, AI sensitivity, verification defaults, and device behaviour."
      attention="AI thresholds affect auto-routing — changes apply after nightly model refresh (demo)."
      nextAction="Confirm notification rules so DAO escalations reach you on SMS during field hours."
    >
      <div className="op-hero__chips" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`op-chip ${tab === t.id ? 'op-chip--on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="op-card">
        {tab === 'prefs' && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>Default landing: Command center · compact tables · show risk colours.</p>}
        {tab === 'notif' && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>SMS for DAO escalation · in-app for AI flags · quiet hours 22:00–06:00.</p>}
        {tab === 'ai' && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>Duplicate similarity cut-off 88% · OCR low-confidence routed to manual.</p>}
        {tab === 'verify' && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>Require GPS snapshot for PMFBY · allow officer override with remark.</p>}
        {tab === 'lang' && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>Marathi (default) · English for GR assistant replies.</p>}
        {tab === 'sync' && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--op-muted)' }}>Last sync 09:04 · 2 devices pending photo upload.</p>}
      </div>
      <p style={{ marginTop: 14, fontSize: '0.8125rem' }}>
        <Link className="op-link" to="/officer/audit-logs">View audit logs</Link>
      </p>
    </OfficerShell>
  );
};

export default OfficerSettingsTabsPage;
