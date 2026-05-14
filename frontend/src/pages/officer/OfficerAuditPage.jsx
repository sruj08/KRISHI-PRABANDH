import React from 'react';
import OfficerShell from '../../components/officer/OfficerShell';
import { AUDIT_LOGS } from '../../mock/officer-operations';

const OfficerAuditPage = () => (
  <OfficerShell
    title="Audit logs"
    purpose="Immutable record of officer and system actions for this taluka account — use during inquiries and reconciliation."
    attention="No gaps detected in the last 7 days of demo data."
    nextAction="Export weekly before DAO reconciliation (demo: view only)."
  >
    <div className="op-table-wrap">
      <table className="op-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {AUDIT_LOGS.map((r) => (
            <tr key={r.id}>
              <td>{r.time}</td>
              <td>{r.actor}</td>
              <td>{r.action}</td>
              <td>{r.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </OfficerShell>
);

export default OfficerAuditPage;
