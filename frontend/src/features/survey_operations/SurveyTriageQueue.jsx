import React, { useState, useEffect } from 'react';
import DenseTable from '../../shared/components/DenseTable';

/**
 * SurveyTriageQueue
 * Operational dashboard for handling incoming field surveys.
 */
const SurveyTriageQueue = ({ onSelectSurvey }) => {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setClaims([
        { id: 'APP-1029', farmer: 'Ramesh Patil', location: '18.52°N, 73.85°E', risk: 'CRITICAL', date: '2023-10-12', confidence: 94 },
        { id: 'APP-1030', farmer: 'Suresh Jadhav', location: '18.53°N, 73.84°E', risk: 'ELEVATED', date: '2023-10-12', confidence: 78 },
        { id: 'APP-1031', farmer: 'Anita Deshmukh', location: '18.51°N, 73.86°E', risk: 'LOW', date: '2023-10-11', confidence: 88 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const headers = ['Claim ID', 'Farmer', 'Geo-Coord', 'Risk/Priority', 'Submission Date', 'AI Confidence'];
  
  const formattedData = claims.map(c => [
    <span className="font-mono text-primary font-bold flex items-center gap-2">
      <span className="material-symbols-outlined text-[14px]">my_location</span>
      {c.id}
    </span>,
    <span className="text-gray-900 font-semibold">{c.farmer}</span>,
    <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{c.location}</span>,
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
      c.risk === 'CRITICAL' ? 'bg-error text-white border-error-dark' :
      c.risk === 'ELEVATED' ? 'bg-amber text-white border-amber-dark' : 'bg-success text-white border-success-dark'
    }`}>
      {c.risk}
    </span>,
    <span className="text-gray-600 text-sm">{c.date}</span>,
    <span className="font-mono font-bold text-gray-900">{c.confidence}%</span>
  ]);

  return (
    <div className="flex flex-col h-full bg-surface font-body">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-300 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-300">
            <span className="material-symbols-outlined text-gray-700">satellite_alt</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-widest uppercase">Triage Queue</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-mono flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              Live Satellite Sync
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-50 transition-none shadow-sm">
            Filter Data
          </button>
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-primary-dark border border-primary-dark transition-none shadow-sm">
            Auto-Assign Batch
          </button>
        </div>
      </div>
      
      {/* Table Area */}
      <div className="p-6 flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-mono text-sm gap-4">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">radar</span>
            [ SYNCING LIVE SATELLITE DATA ]
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            <DenseTable 
              headers={headers} 
              data={formattedData} 
              onRowClick={(row) => onSelectSurvey && onSelectSurvey(claims.find(c => c.id === row[0].props.children[1]))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyTriageQueue;
