import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFarmerPortalNav } from '../../context/FarmerPortalNavContext';
import './FarmerPortalLayout.css';

const MAIN_NAV = [
  { id: 'fp-home', label: 'Dashboard', icon: 'dashboard' },
  { id: 'fp-profile', label: 'Profile', icon: 'person' },
  { id: 'fp-land', label: 'Land Records', icon: 'map' },
  { id: 'fp-schemes', label: 'Schemes', icon: 'account_balance' },
  { id: 'fp-applications', label: 'Applications', icon: 'assignment' },
  { id: 'fp-payments', label: 'Payments', icon: 'payments' },
  { id: 'fp-documents', label: 'Documents', icon: 'folder_open' },
];

const SECONDARY_NAV = [
  { id: 'fp-notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'fp-grievances', label: 'Grievances', icon: 'support_agent' },
  { id: 'fp-help', label: 'Help Center', icon: 'help' },
  { id: 'fp-settings', label: 'Settings', icon: 'settings', route: '/settings' },
];

const BOTTOM_TABS = [
  { key: 'home', section: 'fp-home', label: 'Home', icon: 'home' },
  { key: 'schemes', section: 'fp-schemes', label: 'Schemes', icon: 'account_balance' },
  { key: 'applications', section: 'fp-applications', label: 'Apps', icon: 'assignment' },
  { key: 'documents', section: 'fp-documents', label: 'Docs', icon: 'folder_open' },
  { key: 'profile', section: 'fp-profile', label: 'Profile', icon: 'person' },
];

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`fp-nav-btn ${active ? 'fp-nav-active' : ''}`}
      onClick={onClick}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </button>
  );
}

export default function FarmerPortalLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { scrollTo } = useFarmerPortalNav();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('fp-home');
  const [mobileSection, setMobileSection] = useState('home');

  const go = (sectionId, options = {}) => {
    const { route } = options;
    if (route) {
      navigate(route);
      setDrawerOpen(false);
      return;
    }
    scrollTo(sectionId);
    setActiveNav(sectionId);
    setMobileSection(
      sectionId === 'fp-home' ? 'home'
        : sectionId === 'fp-schemes' ? 'schemes'
        : sectionId === 'fp-applications' ? 'applications'
        : sectionId === 'fp-documents' ? 'documents'
        : sectionId === 'fp-profile' ? 'profile'
        : mobileSection,
    );
    setDrawerOpen(false);
  };

  const bottomGo = (tab) => {
    scrollTo(tab.section);
    setActiveNav(tab.section);
    setMobileSection(tab.key);
  };

  return (
    <div className="farmer-portal-root">
      <div
        className={`fp-sidebar-backdrop ${drawerOpen ? 'fp-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className="farmer-portal-shell">
        <aside className={`fp-sidebar ${drawerOpen ? 'fp-sidebar-drawer-open' : ''}`}>
          <div className="fp-sidebar-brand">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--fp-primary)' }}>
                verified
              </span>
              <div>
                <div className="fp-heading font-bold text-[14px] leading-tight">Krishi Prabandh</div>
                <div className="text-[11px] text-[var(--fp-muted)]">Farmer services</div>
              </div>
            </div>
          </div>
          <div className="fp-sidebar-scroll">
            <div className="fp-nav-group-label">Main</div>
            {MAIN_NAV.map((item) => (
              <NavButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.id}
                onClick={() => go(item.id)}
              />
            ))}
            <div className="fp-nav-group-label">More</div>
            {SECONDARY_NAV.map((item) => (
              <NavButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.id}
                onClick={() => go(item.id, { route: item.route })}
              />
            ))}
          </div>
          <div className="fp-sidebar-footer">
            <div className="fp-helpline">
              <span>Helpline (toll-free)</span>
              <strong>1800-XXX-XXXX</strong>
            </div>
            <button
              type="button"
              className="fp-nav-btn w-full justify-center text-[var(--fp-red)]"
              onClick={() => logout()}
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </aside>

        <div className="fp-main-col">
          <div className="fp-mobile-top">
            <button
              type="button"
              className="icon-btn-soft"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="fp-heading font-bold text-[15px]" style={{ color: 'var(--fp-primary)' }}>
              Krishi Prabandh
            </span>
          </div>
          <div className="fp-main-inner">
            <Outlet />
          </div>
        </div>
      </div>

      <nav className="fp-bottom-nav md:hidden" aria-label="Primary">
        {BOTTOM_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={mobileSection === tab.key ? 'fp-bnav-active' : ''}
            onClick={() => bottomGo(tab)}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
