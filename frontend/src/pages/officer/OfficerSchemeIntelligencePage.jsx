import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerShell from '../../components/officer/OfficerShell';

const OfficerSchemeIntelligencePage = () => {
  const navigate = useNavigate();
  return (
    <OfficerShell
      title="Scheme intelligence"
      purpose="Uptake, bottlenecks, and leakage risk by scheme for your district context. Deep analytics live in the scheme monitoring workspace."
      attention="Tractor subsidy has the highest taluka-level document rejection rate this fortnight."
      nextAction="Pair scheme spikes with duplicate detection before opening new farmer camps."
    >
      <div className="op-card" style={{ marginBottom: 12 }}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--op-muted)' }}>
          <li>PM-KISAN: NPCI rejects +8% week-on-week in Malegaon cluster.</li>
          <li>PMFBY: geo-verification dwell time down after field push.</li>
          <li>Drip: invoice serial bursts still concentrated in two dealers.</li>
        </ul>
      </div>
      <button type="button" className="op-btn op-btn--primary" onClick={() => navigate('/survey')}>
        Open full scheme analytics
      </button>
    </OfficerShell>
  );
};

export default OfficerSchemeIntelligencePage;
