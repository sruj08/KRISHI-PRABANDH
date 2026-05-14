import React, { useState } from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import { SOP_ITEMS } from '../../mock/officer-operations';

const OfficerSopPage = () => {
  const [q, setQ] = useState('');
  const filtered = SOP_ITEMS.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <OfficerShell
      title="SOP recommendations"
      purpose="Standard operating procedures distilled for taluka officers: what to check, in what order, and when to escalate."
      attention="Bookmarked SOPs sync to your device for offline field use (demo)."
      nextAction="Review tractor subsidy SOP before today’s dealer-heavy queue."
    >
      <input
        className="op-card"
        placeholder="Search SOP titles…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', fontSize: '0.9375rem', border: '1px solid var(--op-border)', borderRadius: 12, marginBottom: 14 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((s) => (
          <div key={s.id} className="op-card op-card--hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong>{s.title}</strong>
              {s.bookmarked && <span className="material-symbols-outlined" style={{ color: 'var(--op-amber)', fontSize: 20 }}>bookmark</span>}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'var(--op-muted)' }}>{s.summary}</p>
          </div>
        ))}
      </div>
    </OfficerShell>
  );
};

export default OfficerSopPage;
