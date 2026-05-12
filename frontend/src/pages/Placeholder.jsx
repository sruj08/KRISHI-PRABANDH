import React, { useState } from 'react';

const Placeholder = ({ title, icon = 'dashboard', sections = [], tabs = [] }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-full overflow-y-auto bg-[#f0f3f2] p-6 animate-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>
            {icon}
          </span>
          <h1 className="text-[24px] font-bold text-on-background tracking-tight leading-none">{title}</h1>
        </div>
        <p className="text-on-surface-variant mt-2.5 text-[11px] font-bold uppercase tracking-widest leading-none">
          KrishiNetra Intelligence System • Module Active
        </p>

        {tabs.length > 0 && (
          <div className="flex gap-6 mt-6 -mb-[17px]">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`pb-3 px-1 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === idx
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Workspace (Left 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="bg-white rounded-[16px] border border-outline-variant shadow-sm flex flex-col overflow-hidden min-w-0">
              <div className="border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest" style={{ padding: '18px 24px', minHeight: '60px' }}>
                <h2 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest m-0 leading-none">
                  {sec.title}
                </h2>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">filter_list</span>
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Type: Table */}
                {sec.type === 'table' && (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-surface-container-lowest border-b border-outline-variant">
                          <th className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider whitespace-nowrap" style={{ padding: '14px 24px' }}>ID</th>
                          <th className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider whitespace-nowrap" style={{ padding: '14px 24px' }}>Village</th>
                          <th className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider whitespace-nowrap" style={{ padding: '14px 24px' }}>Status</th>
                          <th className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider whitespace-nowrap text-right" style={{ padding: '14px 24px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((row, i, arr) => (
                          <tr key={row} className={`hover:bg-surface-container-lowest transition-colors ${i !== arr.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                            <td className="text-[13px] font-semibold text-on-background whitespace-nowrap" style={{ padding: '18px 24px' }}>REF-{Math.floor(1000 + Math.random() * 9000)}</td>
                            <td className="text-[13px] text-on-surface-variant whitespace-nowrap" style={{ padding: '18px 24px' }}>{['Shirpur', 'Karjat', 'Wakad'][row-1]}</td>
                            <td className="whitespace-nowrap" style={{ padding: '18px 24px' }}>
                              <span className="px-2 py-0.5 bg-primary-container text-primary text-[11px] rounded font-bold uppercase tracking-wide">Verified</span>
                            </td>
                            <td className="text-right whitespace-nowrap" style={{ padding: '18px 24px' }}>
                              <button className="text-primary text-[13px] font-bold hover:underline">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Type: Cards */}
                {sec.type === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ padding: '22px 24px' }}>
                    {[1, 2].map(card => (
                      <div key={card} className="bg-white rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between" style={{ padding: '20px' }}>
                        <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-3 leading-none">Metric {card}</div>
                        <div className="text-[28px] font-bold text-on-background leading-none mb-3">{(Math.random() * 100).toFixed(1)}%</div>
                        <div className="text-[11px] text-primary font-semibold flex items-center leading-none">
                          <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +2.4% vs last week
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Type: List */}
                {sec.type === 'list' && (
                  <div className="flex flex-col gap-3" style={{ padding: '22px 24px' }}>
                    {[1, 2, 3].map(item => (
                      <div key={item} className="flex items-center justify-between bg-white rounded-lg border border-outline-variant shadow-sm" style={{ padding: '14px 18px' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">description</span>
                          <span className="text-[13px] font-medium text-on-background truncate">Document_Analysis_{item}.pdf</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider whitespace-nowrap ml-4">Today, 10:45 AM</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar Widget (Right 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[16px] border border-outline-variant shadow-sm flex flex-col min-w-0 overflow-hidden">
            <div className="border-b border-outline-variant bg-surface-container-lowest" style={{ padding: '18px 22px', minHeight: '60px' }}>
              <h2 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest m-0 leading-none">
                System Context
              </h2>
            </div>
            <div className="flex flex-col gap-4" style={{ padding: '22px' }}>
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <span className="text-[12px] text-on-surface-variant font-medium">Data Sync</span>
                <span className="text-[12px] font-bold text-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Online
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <span className="text-[12px] text-on-surface-variant font-medium">Last Update</span>
                <span className="text-[12px] font-semibold text-on-background">2 mins ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-on-surface-variant font-medium">Access Level</span>
                <span className="text-[12px] font-semibold text-on-background">District Officer</span>
              </div>
            </div>
          </div>

          <div className="bg-[#fffbeb] rounded-[16px] border border-[#fde047] flex flex-col shadow-sm min-w-0 overflow-hidden">
            <div className="border-b border-[#fde047] bg-[#fef3c7] flex items-center gap-2" style={{ padding: '18px 22px', minHeight: '60px' }}>
              <span className="material-symbols-outlined text-[#b45309] text-[18px]">warning</span>
              <h2 className="text-[12px] font-bold text-[#b45309] uppercase tracking-widest m-0 leading-none">
                Active Alerts
              </h2>
            </div>
            <div style={{ padding: '22px' }}>
              <p className="text-[13px] text-[#92400e] leading-snug m-0">
                No critical anomalies detected in current operational sector.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Placeholder;