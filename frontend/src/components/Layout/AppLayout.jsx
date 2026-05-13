import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const { isOpen, closeSidebar, toggleSidebar } = useSidebar();
  const { user } = useAuth();

  const headerRoleSuffix =
    user?.role === 'farmer'
      ? 'FARMER'
      : user?.role === 'state'
        ? 'STATE OFFICER'
        : user?.role === 'division'
          ? 'DIVISIONAL OFFICER'
          : user?.role === 'district'
            ? 'DAO'
            : user?.role === 'tao'
              ? 'TAO'
              : user?.role === 'cao'
                ? 'CAO'
                : user?.role?.toUpperCase() || 'OFFICER';

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f0]">

      {/* ── Global Top Header ── */}
      <header
        className="h-16 flex items-center px-6 gap-4 sticky top-0 shrink-0 bg-white border-b border-[#e2e9e6]"
        style={{
          boxShadow: '0 1px 2px rgba(20, 40, 30, 0.025)',
          zIndex: 1100,
        }}
      >
        {/* Mobile hamburger */}
        <button
          className="icon-btn-soft md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[22px]" style={{ color: '#1f4d36' }}>public</span>
          <span className="font-bold text-[15px] tracking-tight text-[#1a1c1a]">
            Krishi Prabandh - {headerRoleSuffix}
          </span>
        </div>

        <div className="flex-1" />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-[13px] font-medium" style={{ color: '#717972' }}>
          {user?.role === 'farmer' ? (
            <span>MahaDBT · Farmer services</span>
          ) : user?.role === 'state' ? (
            <span>Maharashtra State Command</span>
          ) : user?.role === 'division' ? (
            <>
              <span>{user?.division_name || 'Division'}</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>Maharashtra State</span>
            </>
          ) : (
            <>
              <span>{user?.district_name || 'District'}</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>{user?.division_name || 'Division'}</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>Maharashtra State</span>
              <span style={{ color: '#c0c9c1' }}>•</span>
              <span>{user?.role === 'district' ? 'District Superintending Agriculture Officer' : user?.role === 'tao' ? (user?.taluka_name || 'Taluka Agriculture Officer') : user?.role === 'cao' ? (user?.taluka_name ? `${user.taluka_name} (CAO scope)` : 'Circle / Mandal Supervisor') : 'Agriculture Officer'}</span>
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
        <main
          className={`flex-1 min-w-0 overflow-y-auto ${['farmer', 'state', 'division'].includes(user?.role) ? 'pb-0' : 'md:pb-0 pb-16'}`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav — officer / Sahayak flows only */}
      {!['farmer', 'state', 'division'].includes(user?.role) && <BottomNav />}
    </div>
  );
};

export default AppLayout;
