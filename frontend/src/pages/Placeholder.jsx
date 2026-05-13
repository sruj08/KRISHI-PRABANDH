import React, { useState } from 'react';

const Placeholder = ({ title, icon = 'dashboard', sections = [], tabs = [], isDark = false }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={`min-h-full overflow-y-auto p-6 animate-fade-in ${isDark ? 'bg-[#0a0f0d] text-white' : 'bg-[#f0f3f2]'}`} style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div className={`mb-6 pb-4 border-b ${isDark ? 'border-[#1f2924]' : 'border-outline-variant'}`}>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${isDark ? 'text-[#4ade80]' : 'text-primary'}`} style={{ fontSize: '28px' }}>
            {icon}
          </span>
          <h1 className={`text-[24px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-on-background'}`}>{title}</h1>
        </div>
        <p className={`mt-2.5 text-[11px] font-bold uppercase tracking-widest leading-none ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`}>
          Krishi Prabandh Intelligence System • Module Active
        </p>

        {tabs.length > 0 && (
          <div className="flex gap-6 mt-6 -mb-[17px]">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`pb-3 px-1 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === idx
                    ? (isDark ? 'border-[#4ade80] text-[#4ade80]' : 'border-primary text-primary')
                    : (isDark ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-on-surface-variant hover:text-on-surface')
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
            <div key={idx} className={`${isDark ? 'bg-[#111814] border-[#1f2924]' : 'bg-white border-outline-variant'} rounded-[16px] border shadow-sm flex flex-col overflow-hidden min-w-0`}>
              <div className={`border-b ${isDark ? 'border-[#1f2924] bg-[#0d1310]' : 'border-outline-variant bg-surface-container-lowest'} flex items-center justify-between`} style={{ padding: '18px 24px', minHeight: '60px' }}>
                <h2 className={`text-[12px] font-bold uppercase tracking-widest m-0 leading-none ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                  {sec.title}
                </h2>
                <span className={`material-symbols-outlined text-[18px] ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`}>filter_list</span>
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Type: Table */}
                {sec.type === 'table' && (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className={`border-b ${isDark ? 'bg-[#0d1310] border-[#1f2924]' : 'bg-surface-container-lowest border-outline-variant'}`}>
                          <th className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`} style={{ padding: '14px 24px' }}>ID</th>
                          <th className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`} style={{ padding: '14px 24px' }}>Village</th>
                          <th className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`} style={{ padding: '14px 24px' }}>Status</th>
                          <th className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap text-right ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`} style={{ padding: '14px 24px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((row, i, arr) => (
                          <tr key={row} className={`transition-colors ${isDark ? 'hover:bg-[#1a241d]' : 'hover:bg-surface-container-lowest'} ${i !== arr.length - 1 ? (isDark ? 'border-b border-[#1f2924]' : 'border-b border-outline-variant') : ''}`}>
                            <td className={`text-[13px] font-semibold whitespace-nowrap ${isDark ? 'text-gray-200' : 'text-on-background'}`} style={{ padding: '18px 24px' }}>REF-{Math.floor(1000 + Math.random() * 9000)}</td>
                            <td className={`text-[13px] whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`} style={{ padding: '18px 24px' }}>{['Shirpur', 'Karjat', 'Wakad'][row-1]}</td>
                            <td className="whitespace-nowrap" style={{ padding: '18px 24px' }}>
                              <span className={`px-2 py-0.5 text-[11px] rounded font-bold uppercase tracking-wide ${isDark ? 'bg-[#064e3b] text-[#4ade80]' : 'bg-primary-container text-primary'}`}>Verified</span>
                            </td>
                            <td className="text-right whitespace-nowrap" style={{ padding: '18px 24px' }}>
                              <button className={`text-[13px] font-bold hover:underline ${isDark ? 'text-[#4ade80]' : 'text-primary'}`}>View</button>
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
                      <div key={card} className={`rounded-xl border shadow-sm flex flex-col justify-between ${isDark ? 'bg-[#151f18] border-[#1f2924]' : 'bg-white border-outline-variant'}`} style={{ padding: '20px' }}>
                        <div className={`text-[10px] font-bold uppercase tracking-wider mb-3 leading-none ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`}>Metric {card}</div>
                        <div className={`text-[28px] font-bold leading-none mb-3 ${isDark ? 'text-white' : 'text-on-background'}`}>{(Math.random() * 100).toFixed(1)}%</div>
                        <div className={`text-[11px] font-semibold flex items-center leading-none ${isDark ? 'text-[#4ade80]' : 'text-primary'}`}>
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
                      <div key={item} className={`flex items-center justify-between rounded-lg border shadow-sm ${isDark ? 'bg-[#151f18] border-[#1f2924]' : 'bg-white border-outline-variant'}`} style={{ padding: '14px 18px' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`material-symbols-outlined text-[20px] ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`}>description</span>
                          <span className={`text-[13px] font-medium truncate ${isDark ? 'text-gray-300' : 'text-on-background'}`}>Document_Analysis_{item}.pdf</span>
                        </div>
                        <span className={`text-[11px] font-medium uppercase tracking-wider whitespace-nowrap ml-4 ${isDark ? 'text-gray-500' : 'text-on-surface-variant'}`}>Today, 10:45 AM</span>
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
          <div className={`${isDark ? 'bg-[#111814] border-[#1f2924]' : 'bg-white border-outline-variant'} rounded-[16px] border shadow-sm flex flex-col min-w-0 overflow-hidden`}>
            <div className={`border-b ${isDark ? 'border-[#1f2924] bg-[#0d1310]' : 'border-outline-variant bg-surface-container-lowest'}`} style={{ padding: '18px 22px', minHeight: '60px' }}>
              <h2 className={`text-[12px] font-bold uppercase tracking-widest m-0 leading-none ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                System Context
              </h2>
            </div>
            <div className="flex flex-col gap-4" style={{ padding: '22px' }}>
              <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-[#1f2924]' : 'border-outline-variant'}`}>
                <span className={`text-[12px] font-medium ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`}>Data Sync</span>
                <span className={`text-[12px] font-bold flex items-center gap-1.5 ${isDark ? 'text-[#4ade80]' : 'text-primary'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#4ade80]' : 'bg-primary'}`}></span> Online
                </span>
              </div>
              <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-[#1f2924]' : 'border-outline-variant'}`}>
                <span className={`text-[12px] font-medium ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`}>Last Update</span>
                <span className={`text-[12px] font-semibold ${isDark ? 'text-gray-200' : 'text-on-background'}`}>2 mins ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[12px] font-medium ${isDark ? 'text-gray-400' : 'text-on-surface-variant'}`}>Access Level</span>
                <span className={`text-[12px] font-semibold ${isDark ? 'text-gray-200' : 'text-on-background'}`}>{isDark ? 'Executive Command' : 'Operational Command'}</span>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-[#2a1114] border-[#4c1d22]' : 'bg-[#fffbeb] border-[#fde047]'} rounded-[16px] border flex flex-col shadow-sm min-w-0 overflow-hidden`}>
            <div className={`border-b flex items-center gap-2 ${isDark ? 'border-[#4c1d22] bg-[#3b151a]' : 'border-[#fde047] bg-[#fef3c7]'}`} style={{ padding: '18px 22px', minHeight: '60px' }}>
              <span className={`material-symbols-outlined text-[18px] ${isDark ? 'text-red-400' : 'text-[#b45309]'}`}>warning</span>
              <h2 className={`text-[12px] font-bold uppercase tracking-widest m-0 leading-none ${isDark ? 'text-red-400' : 'text-[#b45309]'}`}>
                Active Alerts
              </h2>
            </div>
            <div style={{ padding: '22px' }}>
              <p className={`text-[13px] leading-snug m-0 ${isDark ? 'text-red-300' : 'text-[#92400e]'}`}>
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