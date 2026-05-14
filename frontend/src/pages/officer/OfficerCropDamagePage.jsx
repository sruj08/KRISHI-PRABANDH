import React from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import { DAMAGE_CLUSTERS, HIGH_RISK_CLAIMS } from '../../mock/officer-operations';

const OfficerCropDamagePage = () => (
  <OfficerShell
    title="Crop damage reports"
    purpose="Disaster lens for your taluka: severity, exposure, and verification progress. Jump into geo-tagged panchanama when AI raises integrity issues."
    attention="Hailstorm pocket east of Supa still below 30% verification coverage."
    nextAction="Clear hailstorm panchanama queue before compensation auto-batch on Friday."
  >
    <div className="op-card" style={{ marginBottom: 18, borderLeft: '4px solid var(--op-amber)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
        <div><span className="op-purpose-card__k">Drought severity</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Moderate (taluka index 0.62)</div></div>
        <div><span className="op-purpose-card__k">Rainfall anomaly</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>−18% vs LPA</div></div>
        <div><span className="op-purpose-card__k">Villages affected</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>14</div></div>
        <div><span className="op-purpose-card__k">Exposure (est.)</span><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹2.4 Cr</div></div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
      {DAMAGE_CLUSTERS.map((d) => (
        <div key={d.type} className="op-card op-card--hover">
          <p className="op-purpose-card__k">{d.type}</p>
          <strong style={{ fontSize: '1.05rem' }}>{d.severity}</strong>
          <p style={{ fontSize: '0.8125rem', color: 'var(--op-muted)', margin: '8px 0' }}>{d.acres.toLocaleString()} ha · est. ₹{d.exposureCr} Cr</p>
          <div style={{ fontSize: '0.75rem', color: 'var(--op-soft)' }}>Verification {d.progress}%</div>
        </div>
      ))}
    </div>

    <div className="op-grid-2">
      <div className="op-card">
        <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Geo-tagged panchanama viewer</h2>
        <div className="op-map-placeholder">Map + imagery bundle (demo)</div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--op-muted)' }}>Crop loss %, GPS, and AI anomaly overlays load here in production.</p>
      </div>
      <div className="op-card">
        <h2 style={{ fontSize: '1rem', marginTop: 0 }}>High risk claims</h2>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
          {HIGH_RISK_CLAIMS.map((h) => (
            <li key={h.id}><strong>{h.issue}</strong> — {h.farmer}, {h.village}</li>
          ))}
        </ul>
      </div>
    </div>
  </OfficerShell>
);

export default OfficerCropDamagePage;
