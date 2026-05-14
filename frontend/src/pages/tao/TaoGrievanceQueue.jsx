import React, { useState } from 'react';
import { getGrievancesByTaluka } from '../../utils/aiGrievanceEngine';

export default function TaoGrievanceQueue() {
  const [grievances] = useState(getGrievancesByTaluka('Purandar')); // Mocking Purandar taluka

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Actionable Grievance Queue</h1>
        <p className="text-slate-500">Taluka: Purandar • Displaying complaints assigned to your jurisdiction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold">Pending Beyond SLA</div>
          <div className="text-3xl font-bold text-red-600">{grievances.filter(g => g.isSlaBreached).length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold">Fraud Linked (AI Flagged)</div>
          <div className="text-3xl font-bold text-amber-600">{grievances.filter(g => g.fraudScore > 0.7).length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold">Today's New</div>
          <div className="text-3xl font-bold text-blue-600">{grievances.filter(g => g.daysPending === 0).length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold">Resolved (30d)</div>
          <div className="text-3xl font-bold text-green-600">42</div>
        </div>
      </div>

      <div className="space-y-4">
        {grievances.map(g => (
          <div key={g.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${
            g.aiInsights.severity === 'Critical' ? 'border-red-500' : 
            g.aiInsights.severity === 'High' ? 'border-amber-500' : 
            'border-slate-300'
          }`}>
            <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{g.id}</span>
                  <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{g.scheme}</span>
                  {g.isSlaBreached && <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded">SLA BREACHED</span>}
                  {g.fraudScore > 0.7 && <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> FRAUD LINKED</span>}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800">{g.grievanceType}</h3>
                
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{g.farmerName}</span> • {g.village} • Khata: {g.khataNumber} • Mobile: {g.mobile}
                </div>
                
                <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-100">
                  "{g.description}"
                </p>

                {g.linkedTickets.length > 0 && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 p-3 rounded flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">device_hub</span>
                    <div>
                      <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">AI Clustering Detected</div>
                      <div className="text-sm text-amber-700">This complaint is linked to {g.linkedTickets.length} other tickets from the same IP/Device. Possible organized fraud.</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Take Action</div>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition-colors">
                  Investigate Case
                </button>
                <button className="w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-bold rounded shadow-sm transition-colors">
                  Request Field Survey
                </button>
                <button className="w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-bold rounded shadow-sm transition-colors">
                  Escalate to DAO
                </button>
              </div>
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50 p-3 px-5 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
              <div>Submitted: {new Date(g.submittedAt).toLocaleDateString()} ({g.daysPending} days ago)</div>
              <div>AI Target SLA: {g.aiInsights.slaDays} Days</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
