import React, { useState } from 'react';
import { getFraudLinkedGrievances, getEnhancedGrievances } from '../../utils/aiGrievanceEngine';

export default function StateGrievanceIntelligence() {
  const [allGrievances] = useState(getEnhancedGrievances());
  const [fraudGrievances] = useState(getFraudLinkedGrievances());

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-300">
      <div className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">query_stats</span>
            State Grievance Intelligence
          </h1>
          <p className="text-slate-500 mt-1">Maharashtra Command Center • Statewide Fraud & Escalation Monitoring</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider">Total Active</div>
            <div className="text-xl font-bold text-white">{allGrievances.length}</div>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider">State Escalations</div>
            <div className="text-xl font-bold text-amber-500">{allGrievances.filter(g => g.escalationLevel === 2).length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">policy</span>
            Scheme-wise Complaint Spikes
          </h2>
          <div className="space-y-4">
            {[
              { scheme: 'Crop Insurance (PMFBY)', count: allGrievances.filter(g => g.scheme.includes('PMFBY')).length, trend: '+14%' },
              { scheme: 'Disaster Compensation', count: allGrievances.filter(g => g.scheme.includes('Disaster')).length, trend: '+8%' },
              { scheme: 'PM-KISAN', count: allGrievances.filter(g => g.scheme.includes('KISAN')).length, trend: '-2%' }
            ].map(s => (
              <div key={s.scheme} className="flex justify-between items-center">
                <div className="font-bold text-slate-200">{s.scheme}</div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-400">{s.count} Complaints</div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${s.trend.startsWith('+') ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                    {s.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-red-900/50 shadow-sm">
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">troubleshoot</span>
            AI Anomaly & Fraud Clusters
          </h2>
          <div className="space-y-3">
            {fraudGrievances.slice(0, 3).map((g, i) => (
              <div key={g.id} className="bg-slate-900/50 p-3 rounded border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-amber-500 mb-1">Cluster Detected: {g.district} District</div>
                  <div className="text-xs text-slate-400">"{g.description.substring(0, 80)}..."</div>
                </div>
                <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs px-3 py-1.5 rounded font-bold transition-colors">
                  Investigate
                </button>
              </div>
            ))}
            {fraudGrievances.length === 0 && (
              <div className="text-slate-500 text-sm italic py-4 text-center">No major fraud clusters detected currently.</div>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-purple-400">gavel</span>
        State Level Escalations (L3)
      </h2>
      
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500 border-b border-slate-700">
            <tr>
              <th className="p-4">Ticket</th>
              <th className="p-4">District / Taluka</th>
              <th className="p-4">Farmer / Scheme</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Intervention</th>
            </tr>
          </thead>
          <tbody>
            {allGrievances.filter(g => g.escalationLevel === 2).map(g => (
              <tr key={g.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4 font-mono text-xs">{g.id}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{g.district}</div>
                  <div className="text-xs text-slate-500">{g.taluka}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-300">{g.farmerName}</div>
                  <div className="text-xs text-blue-400">{g.scheme}</div>
                </td>
                <td className="p-4">
                  <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs font-bold border border-purple-800/50">L3 Escalation</span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-400 font-bold hover:text-white text-xs uppercase transition-colors">Review Case</button>
                </td>
              </tr>
            ))}
            {allGrievances.filter(g => g.escalationLevel === 2).length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No L3 escalations currently pending.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
