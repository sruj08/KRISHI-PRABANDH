import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './FarmerPortalLayout.css';

const NAV_ITEMS = [
  { to: '/farmer', labelKey: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/farmer/profile', labelKey: 'Profile', icon: 'person' },
  { to: '/farmer/schemes', labelKey: 'Schemes', icon: 'account_balance' },
  { to: '/farmer/applications', labelKey: 'Applications', icon: 'assignment' },
  { to: '/farmer/grievances', labelKey: 'Grievances', icon: 'support_agent' },
  { to: '/farmer/settings', labelKey: 'Settings', icon: 'settings' },
];

const BOTTOM_TABS = [
  { to: '/farmer', labelKey: 'Home', icon: 'home', end: true },
  { to: '/farmer/schemes', labelKey: 'Schemes', icon: 'account_balance' },
  { to: '/farmer/applications', labelKey: 'Apps', icon: 'assignment' },
  { to: '/farmer/grievances', labelKey: 'Support', icon: 'support_agent' },
  { to: '/farmer/profile', labelKey: 'Profile', icon: 'person' },
];

const ROUTE_TITLES = [
  { match: /^\/farmer\/?$/, titleKey: 'Home' },
  { match: /^\/farmer\/profile/, titleKey: 'Profile' },
  { match: /^\/farmer\/schemes/, titleKey: 'Schemes' },
  { match: /^\/farmer\/applications/, titleKey: 'Applications' },
  { match: /^\/farmer\/grievances/, titleKey: 'Grievances' },
  { match: /^\/farmer\/settings/, titleKey: 'Settings' },
];

function navClass(isActive) {
  return `fp-nav-btn ${isActive ? 'fp-nav-active' : ''}`;
}

export default function FarmerPortalLayout() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabletCollapsed, setTabletCollapsed] = useState(false);

  const mobileTitle = useMemo(() => {
    const row = ROUTE_TITLES.find((r) => r.match.test(location.pathname));
    return row ? t(row.titleKey) : t('Farmer services');
  }, [location.pathname, t]);

  return (
    <div className="farmer-portal-root">
      <div
        className={`fp-sidebar-backdrop ${drawerOpen ? 'fp-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className="farmer-portal-shell">
        <aside
          className={`fp-sidebar ${drawerOpen ? 'fp-sidebar-drawer-open' : ''} ${tabletCollapsed ? 'fp-sidebar-collapsed' : ''}`}
        >
          <div className="fp-sidebar-brand">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-[22px]" style={{ color: 'var(--fp-primary)' }}>
                  verified
                </span>
                <div className="fp-sidebar-brand-text min-w-0">
                  <div className="fp-heading truncate text-[13px] font-bold leading-tight">Krishi Prabandh</div>
                  <div className="truncate text-[10px] text-[var(--fp-muted)]">{t('Farmer services')}</div>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn-soft hidden h-8 w-8 shrink-0 md:flex lg:hidden"
                aria-label={tabletCollapsed ? t('Expand sidebar') : t('Collapse sidebar')}
                onClick={() => setTabletCollapsed((c) => !c)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {tabletCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
            </div>
          </div>
          <div className="fp-sidebar-scroll">
            <div className="fp-nav-group-label">{t('Menu')}</div>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) => navClass(isActive)}
              >
                <span className="material-symbols-outlined shrink-0">{item.icon}</span>
                <span className="fp-nav-label truncate">{t(item.labelKey)}</span>
              </NavLink>
            ))}
            <button type="button" className="fp-nav-btn fp-nav-logout" onClick={() => logout()}>
              <span className="material-symbols-outlined">logout</span>
              <span className="fp-nav-label">{t('Logout')}</span>
            </button>
          </div>
          <div className="fp-sidebar-footer">
            <div className="fp-helpline fp-helpline--compact">
              <span className="fp-helpline-label">{t('Helpline (toll-free)')}</span>
              <strong className="fp-helpline-number">1800-XXX-XXXX</strong>
            </div>
          </div>
        </aside>

        <div className="fp-main-col">
          <div className="fp-mobile-top">
            <button
              type="button"
              className="icon-btn-soft"
              aria-label={t('Open menu')}
              onClick={() => setDrawerOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="fp-heading min-w-0 truncate text-[15px] font-bold" style={{ color: 'var(--fp-primary)' }}>
              {mobileTitle}
            </span>
          </div>
          <div className="fp-main-inner">
            <Outlet />
          </div>
        </div>
      </div>

      <nav className="fp-bottom-nav md:hidden" aria-label={t('Primary')}>
        {BOTTOM_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) => (isActive ? 'fp-bnav-active' : '')}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {t(tab.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
