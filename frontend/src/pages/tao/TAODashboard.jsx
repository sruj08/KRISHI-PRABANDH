import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_TAO_STATS, MOCK_APPLICATIONS, MOCK_GRIEVANCES } from '../../utils/taoMockData';
import TAOMap from './components/TAOMap';
import CAOMatrix from './components/CAOMatrix';
import TAOAnomalyModal from './components/TAOAnomalyModal';

const TAODashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [selectedAppId, setSelectedAppId] = useState(null);
  const selectedApp = MOCK_APPLICATIONS.find(app => app.id === selectedAppId);

  return (
    <div className="min-h-full bg-[#f3f4f0] animate-fade-in">
      {selectedApp && (
        <TAOAnomalyModal
          application={selectedApp}
          onClose={() => setSelectedAppId(null)}
        />
      )}

      {/* Main Content Area */}
      <div className="p-6 flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Card 1: Files Processed */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '24px', minHeight: '144px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>folder_open</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Files Processed</span>
            </div>
            <div>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">1,402</span>
            </div>
            <div className="mt-auto pt-2">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">YTD 2024-25</p>
            </div>
          </div>
          
          {/* Card 2: Pending Audits */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '24px', minHeight: '144px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>pending_actions</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Pending Audits</span>
            </div>
            <div>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">84</span>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2" style={{ width: '100%' }}>
              <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">Target: &lt; 50</span>
              <div className="flex-1 bg-surface-variant h-1 rounded-full overflow-hidden ml-1">
                <div className="bg-primary h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-data-tabular font-medium flex-shrink-0">12%</span>
            </div>
          </div>
          
          {/* Card 3: Geo-Verification Status */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '24px', minHeight: '144px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>satellite_alt</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Geo-Verification</span>
            </div>
            <div>
              <span className="font-display-lg text-[28px] font-bold text-primary leading-none tracking-tight">Active</span>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
              <span className="text-[11px] text-on-surface-variant font-body-main font-medium truncate">Telemetry stable</span>
            </div>
          </div>
          
          {/* Card 4: Leakage Prevented */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '24px', minHeight: '144px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>shield_locked</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Leakage Prevented</span>
            </div>
            <div>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight flex items-baseline gap-1">₹42.5<span className="text-lg">L</span></span>
            </div>
            <div className="mt-auto pt-2 flex items-center min-w-0">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium leading-tight truncate">Across all schemes</p>
            </div>
          </div>
          
          {/* Card 5: Fraud Alerts */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '24px', minHeight: '144px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-label-caps text-[10px] text-error tracking-wider uppercase font-semibold truncate">Fraud Alerts</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display-lg text-[32px] font-bold text-error leading-none tracking-tight">12</span>
              <span className="text-[13px] font-bold text-error mb-1">High</span>
            </div>
            <div className="mt-auto pt-2 flex items-center min-w-0">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium leading-tight truncate">9 batches pending</p>
            </div>
          </div>
          
          {/* Card 6: Verification Queue */}
          <div className="bg-white rounded-[16px] flex flex-col shadow-sm border border-[#e2e3df] relative overflow-hidden" style={{ padding: '24px', minHeight: '144px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>queue</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold truncate">Verification Queue</span>
            </div>
            <div>
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none tracking-tight">315</span>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
              <span className="text-[11px] text-on-surface-variant font-body-main font-medium truncate">Next pass in 2h</span>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ marginTop: '8px' }}>
          {/* Left Column (Spans 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
            {/* Map Container */}
            <div className="bg-white rounded-[16px] overflow-hidden flex flex-col border border-[#e2e3df] shadow-sm min-w-0">
              <div className="flex justify-between items-center z-10 border-b border-[#e2e3df]" style={{ padding: '22px 24px' }}>
                <div className="min-w-0">
                  <h2 className="font-section-header font-bold text-base text-on-background tracking-tight truncate">Haveli Taluka — Geo Verification Map</h2>
                  <p className="font-body-main text-xs text-on-surface-variant mt-0.5 font-medium truncate">Live spatial analytics and field officer telemetry</p>
                </div>
                <button className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 border border-outline-variant rounded bg-white hover:bg-surface-container-lowest transition-colors text-[11px] font-semibold text-on-background ml-4">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span> Layers
                </button>
              </div>
              <div className="relative h-[480px] bg-[#f0f3f2] w-full">
                <TAOMap />
                
                {/* Floating Map Legend / Controls */}
                <div className="absolute bottom-6 right-6 bg-white rounded-xl p-4 shadow-md border border-outline-variant/30 w-56 z-10">
                  <h4 className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 font-semibold">GIS OVERLAYS</h4>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="text-xs font-medium text-on-background truncate">Mandal Boundaries</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="text-xs font-medium text-on-background truncate">Pending Inspections</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="text-xs font-medium text-on-background truncate">Fraud Hotspots</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div className="w-4 h-4 rounded border border-outline-variant bg-white flex-shrink-0"></div>
                      <span className="text-xs font-medium text-on-background truncate">Field Officers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white rounded-[16px] overflow-hidden border border-[#e2e3df] shadow-sm flex flex-col min-w-0">
              <div className="border-b border-[#e2e3df]" style={{ padding: '22px 24px' }}>
                <h3 className="font-section-header font-bold text-base text-on-background tracking-tight truncate">Circle Agriculture Officer Performance</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-container-lowest border-b border-[#e2e3df]">
                      <th className="py-4 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase whitespace-nowrap text-left">OFFICER NAME</th>
                      <th className="py-4 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase whitespace-nowrap text-left">CIRCLE</th>
                      <th className="py-4 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase whitespace-nowrap text-left">PENDING FILES</th>
                      <th className="py-4 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase whitespace-nowrap text-left">FRAUD ALERTS</th>
                      <th className="py-4 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase whitespace-nowrap text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-main text-sm">
                    <tr className="border-b border-[#e2e3df] hover:bg-surface-container-lowest transition-colors">
                      <td className="py-5 px-6 font-medium text-on-background whitespace-nowrap text-left">Ramesh Patil</td>
                      <td className="py-5 px-6 text-on-surface-variant whitespace-nowrap text-left">Wagholi</td>
                      <td className="py-5 px-6 font-bold text-on-background whitespace-nowrap text-left">42</td>
                      <td className="py-5 px-6 whitespace-nowrap text-left">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-error bg-error-container">3 High</span>
                      </td>
                      <td className="py-5 px-6 text-right whitespace-nowrap">
                        <button className="text-primary hover:underline font-bold text-[13px]">Review</button>
                      </td>
                    </tr>
                    <tr className="border-b border-[#e2e3df] bg-[#fafafa] hover:bg-surface-container-lowest transition-colors">
                      <td className="py-5 px-6 font-medium text-on-background whitespace-nowrap text-left">Sunita Deshmukh</td>
                      <td className="py-5 px-6 text-on-surface-variant whitespace-nowrap text-left">Khed Shivapur</td>
                      <td className="py-5 px-6 font-bold text-on-background whitespace-nowrap text-left">15</td>
                      <td className="py-5 px-6 whitespace-nowrap text-left">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-[#444742] bg-[#f3f4f0]">0</span>
                      </td>
                      <td className="py-5 px-6 text-right whitespace-nowrap">
                        <button className="text-primary hover:underline font-bold text-[13px]">Review</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors border-b border-transparent">
                      <td className="py-5 px-6 font-medium text-on-background whitespace-nowrap text-left">Vijay More</td>
                      <td className="py-5 px-6 text-on-surface-variant whitespace-nowrap text-left">Loni Kalbhor</td>
                      <td className="py-5 px-6 font-bold text-on-background whitespace-nowrap text-left">52</td>
                      <td className="py-5 px-6 whitespace-nowrap text-left">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-error bg-error-container">6 High</span>
                      </td>
                      <td className="py-5 px-6 text-right whitespace-nowrap">
                        <button className="text-primary hover:underline font-bold text-[13px]">Review</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
            {/* Fraud Pulse Widget */}
            <div className="bg-white rounded-[16px] border border-[#e2e3df] shadow-sm flex flex-col min-w-0" style={{ padding: '24px' }}>
              <div className="mb-5">
                <h3 className="font-bold text-[15px] text-[#1a1c19] tracking-tight mb-1 truncate">Fraud &amp; Anomaly Pulse</h3>
                <p className="text-[12px] text-[#444742] font-medium truncate">System flagged inconsistencies</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="w-2 h-2 rounded-full bg-[#ba1a1a] flex-shrink-0"></div>
                  <span className="text-[13px] font-medium text-[#444742] flex-1 min-w-0 truncate">Duplicate 7/12 Extracts</span>
                  <span className="text-[13px] font-bold text-[#ba1a1a] flex-shrink-0 ml-2">18%</span>
                </div>
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="w-2 h-2 rounded-full bg-[#d97706] flex-shrink-0"></div>
                  <span className="text-[13px] font-medium text-[#444742] flex-1 min-w-0 truncate">Aadhar Name Mismatch</span>
                  <span className="text-[13px] font-bold text-[#d97706] flex-shrink-0 ml-2">24%</span>
                </div>
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="w-2 h-2 rounded-full bg-[#717972] flex-shrink-0"></div>
                  <span className="text-[13px] font-medium text-[#444742] flex-1 min-w-0 truncate">Geo-fencing Breaches</span>
                  <span className="text-[13px] font-bold text-[#717972] flex-shrink-0 ml-2">5%</span>
                </div>
              </div>
            </div>

            {/* Recommendations Widget */}
            <div className="bg-white rounded-[16px] border border-[#e2e3df] shadow-sm flex flex-col min-w-0" style={{ padding: '24px' }}>
              <div className="mb-5">
                <h3 className="font-bold text-[15px] text-[#1a1c19] tracking-tight mb-1 truncate">Audit Recommendations</h3>
                <p className="text-[12px] text-[#444742] font-medium truncate">AI-driven actionable insights</p>
              </div>

              <div className="bg-[#f0f3f2] p-4 rounded-xl border border-transparent">
                <p className="font-bold text-[13px] text-[#1a1c19] mb-2 leading-snug">Initiate immediate audit in Loni Kalbhor.</p>
                <p className="text-[12px] text-[#444742] leading-relaxed">
                  High volume of pending files (89) combined with 7 fraud alerts requires intervention. Re-assign 2 field officers.
                </p>
              </div>
            </div>

            {/* Grievance Section Widget */}
            <div className="bg-white rounded-[16px] flex-1 flex flex-col border border-[#e2e3df] shadow-sm min-w-0" style={{ padding: '24px' }}>
              <div className="flex justify-between items-center mb-5 border-b border-[#e2e3df] pb-4">
                <div className="min-w-0 pr-3">
                  <h3 className="font-bold text-[15px] text-[#1a1c19] tracking-tight truncate">Grievance Routing</h3>
                  <p className="text-[12px] text-[#444742] mt-1 truncate">Farmer dispute escalation</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a] flex-shrink-0 whitespace-nowrap">
                  Action Req
                </span>
              </div>

              <div className="flex-1 flex flex-col pt-1">
                {/* Ticket Card */}
                {MOCK_GRIEVANCES.slice(0, 1).map(g => (
                  <div key={g.id} className="flex flex-col mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-bold text-[#717972]">ID: {g.id}</span>
                      <span className="text-[12px] font-bold text-[#ba1a1a]">High Priority</span>
                    </div>
                    <p className="text-[13px] text-[#1a1c19] italic mb-3 font-medium leading-relaxed">"{g.text}"</p>
                    <div className="bg-white p-3 rounded-lg border border-[#e2e3df]">
                      <span className="text-[10px] font-bold text-[#033621] uppercase tracking-wider block mb-1">AI Translation</span>
                      <p className="text-[12px] text-[#444742] leading-relaxed font-medium">
                        "{g.translated}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TAODashboard;
