import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const { isOpen, closeSidebar, toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <div className={`flex flex-col min-h-screen ${user?.role === 'state' ? 'bg-[#0a0f0d] text-white' : 'bg-[#f3f4f0]'}`}>

      {/* ── Global Top Header ── */}
      <header
        className={`h-16 flex items-center px-6 gap-4 sticky top-0 shrink-0 ${user?.role === 'state' ? 'bg-[#111814] border-b border-[#1f2924]' : 'bg-white border-b border-[#e2e9e6]'}`}
        style={{
          boxShadow: user?.role === 'state' ? 'none' : '0 1px 2px rgba(20, 40, 30, 0.025)',
          zIndex: 1100,
        }}
      >
        {/* Mobile hamburger */}
        <button
          className={`icon-btn-soft md:hidden ${user?.role === 'state' ? 'text-gray-300' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[22px]" style={{ color: user?.role === 'state' ? '#4ade80' : '#1f4d36' }}>public</span>
          <span className={`font-bold text-[15px] tracking-tight ${user?.role === 'state' ? 'text-white' : 'text-[#1a1c1a]'}`}>
            KrishiNetra - {
              user?.role === 'state' ? 'STATE COMMAND' :
              user?.role === 'division' ? 'DIVISION' :
              user?.role === 'district' ? 'DAO' :
              (user?.role?.toUpperCase() || 'OFFICER')
            }
          </span>
        </div>

        <div className="flex-1" />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-[13px] font-medium" style={{ color: '#717972' }}>
          {user?.role === 'state' ? (
            <span>Maharashtra State Command</span>
          ) : user?.role === 'division' ? (
            <>
              <span>Pune Division</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>Maharashtra State</span>
            </>
          ) : (
            <>
              <span>Pune District</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>Maharashtra State</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>{user?.role === 'district' ? 'District Superintending Agriculture Officer' : 'Agriculture Officer'}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-4">
          <button className="icon-btn-soft" aria-label="Notifications">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="icon-btn-soft" aria-label="Settings">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold select-none"
            style={{
              background: 'linear-gradient(135deg, #2d6b48 0%, #1f4d36 100%)',
              boxShadow: '0 1px 2px rgba(20, 40, 30, 0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
              marginLeft: '6px',
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'D'}
          </div>
        </div>
      </header>

      {/* ── Body row: Sidebar + main ── */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            style={{ zIndex: 1040 }}
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar — uses the existing Sidebar.jsx component */}
        <Sidebar isOpen={isOpen} />

        {/* Main content scrolls independently */}
        <main className="flex-1 min-w-0 overflow-y-auto md:pb-0 pb-16">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
