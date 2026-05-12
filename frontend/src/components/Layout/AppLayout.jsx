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
    <div className="flex flex-col min-h-screen bg-[#f3f4f0]">

      {/* ── Global Top Header ── */}
      <header className="h-16 bg-white border-b border-[#E2E9E6] flex items-center px-6 gap-4 sticky top-0 z-50 shrink-0">
        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f3f4f0] transition text-[#414943]"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[22px] text-[#033621]">public</span>
          <span className="font-bold text-[15px] text-[#1a1c1a] tracking-tight">
            KrishiNetra - {user?.role === 'district' ? 'DAO' : (user?.role?.toUpperCase() || 'OFFICER')}
          </span>
        </div>

        <div className="flex-1" />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-[13px] text-[#717972] font-medium">
          <span>Pune District</span>
          <span className="text-[#c0c9c1]">•</span>
          <span>Maharashtra State</span>
          <span className="text-[#c0c9c1]">•</span>
          <span>District Superintending Agriculture Officer</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f3f4f0] transition text-[#717972]">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f3f4f0] transition text-[#717972]">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1f4d36] flex items-center justify-center text-white text-[12px] font-bold select-none">
            {user?.username?.[0]?.toUpperCase() || 'D'}
          </div>
        </div>
      </header>

      {/* ── Body row: Sidebar + main ── */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
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
