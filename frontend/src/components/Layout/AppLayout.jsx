import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const AppLayout = () => {
  const { isOpen, closeSidebar, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { t, cycleLanguage, currentLabel } = useLanguage();

  const isSahayak = !user?.role || user.role === 'officer' || user.role === 'mandal_officer';
  const showBottomNav = !['farmer', 'state', 'division'].includes(user?.role);

  const roleLabel =
    user?.role === 'state' ? 'STATE COMMAND'
    : user?.role === 'division' ? 'DIVISION'
    : user?.role === 'district' ? 'DAO'
    : user?.role === 'tao' ? 'TAO'
    : user?.role === 'cao' ? 'CAO'
    : user?.role === 'farmer' ? 'FARMER'
    : 'OFFICER';

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f0]">

      {/* ── Global Top Header ── */}
      <header
        className="flex items-center px-4 gap-3 sticky top-0 shrink-0 bg-white border-b border-[#e2e9e6]"
        style={{
          height: '60px',
          boxShadow: '0 1px 2px rgba(20,40,30,0.025)',
          zIndex: 1100,
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* Hamburger — always visible */}
        <button
          className="icon-btn-soft"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          id="sidebar-toggle-btn"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#1f4d36' }}>public</span>
          <span className="font-bold text-[14px] tracking-tight text-[#1a1c1a]">
            {t('Krishi Prabandh')}{' '}
            <span className="hidden sm:inline" style={{ color: '#717972', fontWeight: 500 }}>·</span>{' '}
            <span className="hidden sm:inline" style={{ color: '#1f4d36' }}>{t(roleLabel)}</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* Desktop breadcrumb */}
        <div className="hidden lg:flex items-center gap-1.5 text-[12px] font-medium" style={{ color: '#9aa19c' }}>
          {user?.role === 'farmer' ? (
            <span>{t('MahaDBT · Farmer services')}</span>
          ) : user?.role === 'state' ? (
            <span>{t('Maharashtra State Command')}</span>
          ) : user?.role === 'division' ? (
            <span>{user?.division_name || t('Division')} · {t('Maharashtra State')}</span>
          ) : (
            <span>
              {user?.district_name || t('District')}
              {user?.taluka_name ? ` · ${user.taluka_name}` : ''}
            </span>
          )}
        </div>

        {/* Actions — simplified for Sahayak */}
        <div className="flex items-center gap-1 ml-2">
          {/* Language toggle — desktop only for Sahayak, always for others */}
          {!isSahayak && (
            <button
              className="icon-btn-soft text-[11px] font-bold px-2"
              onClick={cycleLanguage}
              aria-label="Switch language"
            >
              <span className="material-symbols-outlined text-[18px]">translate</span>
              <span className="hidden sm:inline ml-0.5">{currentLabel}</span>
            </button>
          )}

          {/* Notifications */}
          <button className="icon-btn-soft relative" aria-label={t('Notifications')} id="notif-btn">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {/* notification dot */}
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ba1a1a', border: '1.5px solid white',
            }} />
          </button>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold select-none ml-1"
            style={{
              background: 'linear-gradient(135deg, #2d6b48 0%, #1f4d36 100%)',
              boxShadow: '0 1px 2px rgba(20,40,30,0.18)',
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'K'}
          </div>
        </div>
      </header>

      {/* ── Body row ── */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile/Tablet backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30"
            style={{ zIndex: 1150 }}
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <Sidebar isOpen={isOpen} onClose={closeSidebar} />

        {/* Main content */}
        <main
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ paddingBottom: showBottomNav ? 'calc(56px + env(safe-area-inset-bottom))' : 0 }}
        >
          <Outlet />
        </main>
      </div>

      {/* Bottom nav */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
