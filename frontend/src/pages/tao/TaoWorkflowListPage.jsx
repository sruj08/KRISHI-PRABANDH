import React from 'react';
import { useToast } from '../../hooks/useToast.jsx';
import './tao.css';

const CARD = {
  background: '#fff',
  border: '1px solid #e2e3df',
  borderRadius: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
};

const TaoWorkflowListPage = ({ title, subtitle, rows, emptyHint }) => {
  const { addToast } = useToast();

  return (
    <div className="tao-dash-root" style={{ minHeight: '100%', background: '#f3f4f0', padding: '24px 32px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...CARD, padding: '22px 24px' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1a1c1a', margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 11, color: '#717972', margin: '8px 0 0', lineHeight: 1.45 }}>{subtitle}</p>
        )}
      </div>
      <div style={{ ...CARD, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f0', fontSize: 12, fontWeight: 700, color: '#1a1c1a' }}>
          Queue (demo)
        </div>
        <div style={{ padding: 0 }}>
          {rows.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => addToast(`Queued item ${r.id} — detail view coming soon.`, 'success', 2800)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 20px',
                border: 'none',
                borderBottom: '1px solid #f3f4f0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1c1a' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#717972', marginTop: 4 }}>{r.meta}</div>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#717972' }}>chevron_right</span>
            </button>
          ))}
        </div>
        {emptyHint && (
          <div style={{ padding: '16px 20px', fontSize: 11, color: '#717972', background: '#fafafa' }}>{emptyHint}</div>
        )}
      </div>
    </div>
  );
};

export function TaoPendingApplicationsPage() {
  return (
    <TaoWorkflowListPage
      title="Pending Applications"
      subtitle="Applications awaiting taluka-level clearance. Open an item to continue the standard review workflow."
      rows={[
        { id: 'P-104', label: 'APL-2204 — Drip kit verification', meta: 'Submitted 11 May 2026 · Mohol' },
        { id: 'P-105', label: 'APL-2205 — Seed subsidy bundle', meta: 'Submitted 11 May 2026 · Barshi' },
        { id: 'P-106', label: 'APL-2206 — Equipment grant', meta: 'Submitted 10 May 2026 · Pandharpur' },
      ]}
    />
  );
}

export function TaoFieldVerificationPage() {
  return (
    <TaoWorkflowListPage
      title="Field Verification Requests"
      subtitle="TAO-coordinated field visits requested from circle teams. Assignments are illustrative only."
      rows={[
        { id: 'F-12', label: 'Visit — Loni Kalbhor cluster', meta: 'Due 16 May 2026 · High backlog' },
        { id: 'F-13', label: 'Re-verify — Barshi dealer yard', meta: 'Due 18 May 2026 · Evidence pack attached' },
        { id: 'F-14', label: 'Spot check — Sangola warehouse', meta: 'Due 20 May 2026 · Standard rotation' },
      ]}
    />
  );
}

export default TaoWorkflowListPage;
