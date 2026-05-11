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
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in w-full">
      {selectedApp && (
        <TAOAnomalyModal 
          application={selectedApp} 
          onClose={() => setSelectedAppId(null)} 
        />
      )}

      {/* Top App Bar (Full Width, Pulled out of padding) */}
      <header className="bg-white border-b border-surface-variant px-8 py-4 -mt-8 -mx-8 mb-8 flex items-center justify-between sticky top-0 z-50">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 font-body-main text-[13px] text-on-surface-variant">
          <a className="hover:text-primary transition-colors" href="#">Haveli Taluka</a>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <a className="hover:text-primary transition-colors" href="#">Pune District</a>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <a className="hover:text-primary transition-colors" href="#">Maharashtra State</a>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-medium">Taluka Agriculture Officer</span>
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-sm text-on-surface-variant ml-2 border border-outline-variant">
            D
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto w-full">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
          {/* Card 1: Files Processed */}
          <div className="bg-white rounded-xl p-5 flex flex-col min-h-[140px] border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>folder_open</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Files Processed</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-display-lg text-[28px] font-bold text-on-background leading-none">1,402</span>
            </div>
            <div className="mt-3">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">YTD 2024-25</p>
            </div>
          </div>
          
          {/* Card 2: Pending Audits */}
          <div className="bg-white rounded-xl p-5 flex flex-col min-h-[140px] border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>pending_actions</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Pending Audits</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-display-lg text-[28px] font-bold text-on-background leading-none">84</span>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-surface-variant h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-data-tabular font-medium">12%</span>
              </div>
            </div>
            <div className="mt-2">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium">Target: &lt; 50</p>
            </div>
          </div>
          
          {/* Card 3: Geo-Verification Status */}
          <div className="bg-white rounded-xl p-5 flex flex-col min-h-[140px] border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>satellite_alt</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Geo-Verification Status</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-display-lg text-[28px] font-bold text-primary leading-none">Active</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-[11px] text-on-surface-variant font-body-main font-medium">Telemetry stable</span>
            </div>
          </div>
          
          {/* Card 4: Leakage Prevented */}
          <div className="bg-white rounded-xl p-5 flex flex-col min-h-[140px] border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>shield_locked</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Leakage Prevented</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-display-lg text-[28px] font-bold text-on-background leading-none">₹42.5 <span className="text-lg">L</span></span>
            </div>
            <div className="mt-3 flex items-center">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium leading-tight w-full">Across all<br/>schemes</p>
            </div>
          </div>
          
          {/* Card 5: Fraud Alerts */}
          <div className="bg-white rounded-xl p-5 flex flex-col min-h-[140px] border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Fraud Alerts</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-display-lg text-[28px] font-bold text-error leading-none mb-1">12</span>
              <div className="flex items-center gap-1 text-error text-[10px] font-medium bg-error-container/50 w-fit px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
                <span>High Priority</span>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <p className="font-body-main text-[11px] text-on-surface-variant font-medium leading-tight w-full">9 batches<br/>pending</p>
            </div>
          </div>
          
          {/* Card 6: Verification Queue */}
          <div className="bg-white rounded-xl p-5 flex flex-col min-h-[140px] border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>queue</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Verification Queue</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-display-lg text-[28px] font-bold text-on-background leading-none">315</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-[11px] text-on-surface-variant font-body-main font-medium">Next pass in 2h</span>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Spans 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Map Container */}
            <div className="bg-white rounded-xl overflow-hidden flex flex-col border border-outline-variant/30 shadow-sm">
              <div className="px-6 py-5 flex justify-between items-center z-10">
                <div>
                  <h2 className="font-section-header font-bold text-base text-on-background tracking-tight">Haveli Taluka — Geo Verification Map</h2>
                  <p className="font-body-main text-xs text-on-surface-variant mt-0.5 font-medium">Live spatial analytics and field officer telemetry</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-outline-variant rounded bg-white hover:bg-surface-container-lowest transition-colors text-[11px] font-semibold text-on-background">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span> Layers
                </button>
              </div>
              <div className="relative h-[480px] bg-[#f0f3f2]">
                <TAOMap />
                
                {/* Floating Map Legend / Controls */}
                <div className="absolute bottom-6 right-6 bg-white rounded-lg p-4 shadow-md border border-outline-variant/30 w-56 z-10">
                  <h4 className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 font-semibold">GIS OVERLAYS</h4>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="text-xs font-medium text-on-background">Mandal Boundaries</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="text-xs font-medium text-on-background">Pending Inspections</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="text-xs font-medium text-on-background">Fraud Hotspots</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 rounded border border-outline-variant bg-white"></div>
                      <span className="text-xs font-medium text-on-background">Field Officers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm mb-6">
              <div className="px-6 py-5">
                <h3 className="font-section-header font-bold text-base text-on-background tracking-tight">Circle Agriculture Officer Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-y border-outline-variant/30">
                      <th className="py-2.5 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">OFFICER NAME</th>
                      <th className="py-2.5 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">CIRCLE</th>
                      <th className="py-2.5 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">PENDING FILES</th>
                      <th className="py-2.5 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">FRAUD ALERTS</th>
                      <th className="py-2.5 px-6 font-label-caps text-[10px] font-bold tracking-wider text-on-surface-variant uppercase text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-main text-xs">
                    <tr className="border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3.5 px-6 font-medium text-on-background">Ramesh Patil</td>
                      <td className="py-3.5 px-6 font-medium text-on-surface-variant">Wagholi</td>
                      <td className="py-3.5 px-6 font-medium text-on-background">42</td>
                      <td className="py-3.5 px-6"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-error-container/50 text-error">3 High</span></td>
                      <td className="py-3.5 px-6 text-right">
                        <button className="text-primary hover:underline font-semibold text-xs">Review</button>
                      </td>
                    </tr>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-lowest/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-on-background">Sunita Deshmukh</td>
                      <td className="py-3.5 px-6 font-medium text-on-surface-variant">Khed Shivapur</td>
                      <td className="py-3.5 px-6 font-medium text-on-background">15</td>
                      <td className="py-3.5 px-6"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary-container/50 text-secondary">0</span></td>
                      <td className="py-3.5 px-6 text-right">
                        <button className="text-primary hover:underline font-semibold text-xs">Review</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3.5 px-6 font-medium text-on-background">Vijay More</td>
                      <td className="py-3.5 px-6 font-medium text-on-surface-variant">Loni Kalbhor</td>
                      <td className="py-3.5 px-6 font-medium text-on-background">52</td>
                      <td className="py-3.5 px-6"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-error-container/50 text-error">6 High</span></td>
                      <td className="py-3.5 px-6 text-right">
                        <button className="text-primary hover:underline font-semibold text-xs">Review</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Spans 1 col) */}
          <div className="flex flex-col gap-6">
            {/* Fraud Pulse Widget */}
            <div className="bg-white rounded-xl p-6 border border-outline-variant/30 shadow-sm">
              <h3 className="font-section-header font-bold text-base text-on-background tracking-tight mb-0.5">Fraud &amp; Anomaly Pulse</h3>
              <p className="font-body-main text-xs text-on-surface-variant mb-5 font-medium">System flagged inconsistencies</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                    <span className="font-body-main text-xs font-medium text-on-background">Duplicate 7/12 Extracts</span>
                  </div>
                  <span className="font-data-tabular text-xs font-bold text-error">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div>
                    <span className="font-body-main text-xs font-medium text-on-background">Aadhar Name Mismatch</span>
                  </div>
                  <span className="font-data-tabular text-xs font-bold text-[#b45309]">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                    <span className="font-body-main text-xs font-medium text-on-background">Geo-fencing Breaches</span>
                  </div>
                  <span className="font-data-tabular text-xs font-bold text-on-background">5%</span>
                </div>
              </div>
            </div>

            {/* Recommendations Widget */}
            <div className="bg-white rounded-xl p-6 border border-outline-variant/30 shadow-sm">
              <h3 className="font-section-header font-bold text-base text-on-background tracking-tight mb-0.5">Audit Recommendations</h3>
              <p className="font-body-main text-xs text-on-surface-variant mb-5 font-medium">AI-driven actionable insights</p>
              
              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="font-body-main font-semibold text-xs text-on-background mb-2">Initiate immediate audit in Loni Kalbhor.</p>
                <p className="font-body-main text-xs text-on-surface-variant leading-relaxed">
                  High volume of pending files (89) combined with 7 fraud alerts requires intervention. Re-assign 2 field officers.
                </p>
              </div>
            </div>

            {/* Grievance Section Widget */}
            <div className="bg-white rounded-xl p-6 flex-1 flex flex-col border border-outline-variant/30 shadow-sm">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-section-header font-bold text-base text-on-background tracking-tight">Grievance</h3>
                  <h3 className="font-section-header font-bold text-base text-on-background tracking-tight">Routing</h3>
                </div>
                <span className="inline-flex items-center px-3 py-1.5 rounded text-[10px] font-semibold bg-error-container/50 text-error text-center flex-col justify-center leading-tight">
                  Action<br/>Required
                </span>
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Ticket Card */}
                {MOCK_GRIEVANCES.slice(0, 1).map(g => (
                  <div key={g.id} className="bg-surface-container-low rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-data-tabular text-[10px] font-semibold text-on-surface-variant">ID: {g.id}</span>
                      <span className="font-data-tabular text-[10px] font-bold text-error">High.</span>
                    </div>
                    <p className="font-body-main text-xs text-on-background italic mb-3 font-medium leading-relaxed">"{g.text}"</p>
                    <p className="font-body-main text-xs text-on-surface-variant mb-4 leading-relaxed font-medium">
                      AI Translation: "{g.translated}"
                    </p>
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
