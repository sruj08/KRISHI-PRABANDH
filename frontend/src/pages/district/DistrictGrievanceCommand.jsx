import React, { useState } from 'react';
import { getEscalatedGrievances, getFraudLinkedGrievances } from '../../utils/aiGrievanceEngine';

export default function DistrictGrievanceCommand() {
  const [escalatedGrievances] = useState(getEscalatedGrievances().filter(g => g.district === 'Pune' && g.escalationLevel === 1));
  const [fraudGrievances] = useState(getFraudLinkedGrievances().filter(g => g.district === 'Pune'));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600">admin_panel_settings</span>
          District Grievance Command
        </h1>
        <p className="text-slate-500 mt-1">Pune District • Escalations, SLA Breaches, and AI Fraud Alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Taluka Performance Matrix</h2>
          <div className="space-y-3">
            {[
              { name: 'Purandar', pending: 12, breached: 4, efficiency: 88 },
              { name: 'Baramati', pending: 8, breached: 1, efficiency: 95 },
              { name: 'Shirur', pending: 24, breached: 9, efficiency: 72 },
              { name: 'Haveli', pending: 15, breached: 3, efficiency: 85 }
            ].map(t => (
              <div key={t.name} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                <div className="w-32 font-bold text-slate-700">{t.name}</div>
                <div className="flex-1 px-4">
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${t.efficiency > 90 ? 'bg-green-500' : t.efficiency > 80 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${t.efficiency}%` }}></div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm">
                  <span className="font-bold text-slate-800">{t.efficiency}%</span> <span className="text-slate-400">SLA</span>
                </div>
                <div className="w-24 text-right text-sm text-red-500 font-bold">
                  {t.breached > 0 ? `${t.breached} Esc` : 'Clean'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-2">warning</span>
          <div className="text-4xl font-bold text-red-600 mb-1">{fraudGrievances.length}</div>
          <div className="text-red-800 font-bold">AI Fraud Clusters Detected</div>
          <p className="text-xs text-red-600 mt-2">Multiple grievances linked to identical bank/Aadhaar nodes. Requires immediate vigilance action.</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-600">notifications_active</span>
        Active DAO Escalations ({escalatedGrievances.length})
      </h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Ticket</th>
              <th className="p-4">Taluka</th>
              <th className="p-4">Farmer / Subject</th>
              <th className="p-4">Days Overdue</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {escalatedGrievances.map(g => (
              <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-mono text-xs">{g.id}</td>
                <td className="p-4 font-bold text-slate-700">{g.taluka}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-800">{g.farmerName}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[250px]">{g.grievanceType}</div>
                </td>
                <td className="p-4">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">+{g.daysPending - g.aiInsights.slaDays} Days</span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 font-bold hover:underline text-xs uppercase">Takeover Case</button>
                </td>
              </tr>
            ))}
            {escalatedGrievances.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No active escalations for DAO review.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
