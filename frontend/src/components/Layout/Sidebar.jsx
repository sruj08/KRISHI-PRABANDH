import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { t, toggleLanguage, lang } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const overviewLinks = [
    { to: '/',           icon: 'map',                 label: 'Command Map' },
  ];

  const moduleLinks = [
    { to: '/survey',     icon: 'analytics',           label: 'Survey Analytics' },
    { to: '/geo',        icon: 'location_on',         label: 'Geo Verification' },
    { to: '/applications', icon: 'checklist',         label: 'Application Queue' },
    { to: '/fraud-alerts',icon: 'policy',             label: 'Fraud Monitoring' },
    { to: '/grievances', icon: 'priority_high',       label: 'Grievance Routing' },
    { to: '/ledger',     icon: 'payments',            label: 'Compensation Status' },
    { to: '/audit-logs', icon: 'history',             label: 'Audit Logs' },
  ];

  const systemLinks = [
    { to: '/roles',      icon: 'badge',               label: 'User Roles' },
    { to: '/settings',   icon: 'settings',            label: 'System Controls' },
  ];

  return (
    <aside className={`sidebar flex flex-col h-screen sticky top-0 py-8 bg-white w-[260px] shrink-0 z-40 border-r border-surface-variant ${isOpen ? 'open' : ''}`}>
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 mb-8">
        <span className="material-symbols-outlined text-primary-container" style={{ fontSize: '28px' }}>public</span>
        <h2 className="font-headline-md text-on-background text-[20px] leading-tight m-0">
          KrishiNetra - {user?.role === 'district' ? 'DAO' : (user?.role?.toUpperCase() || 'OFFICER')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {/* Overview Section */}
        <div className="mb-8">
          <h3 className="font-label-caps text-xs text-on-surface-variant mb-4 px-4 tracking-[0.1em]">OVERVIEW</h3>
          {overviewLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-150 font-body-main text-[15px] ${
                  isActive 
                    ? 'text-primary-container bg-surface-container-low' 
                    : 'text-on-background hover:bg-surface-container-lowest'
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]" style={{ color: 'inherit' }}>{link.icon}</span>
              {t(link.label)}
            </NavLink>
          ))}
        </div>

        {/* Modules Section */}
        <div>
          <h3 className="font-label-caps text-xs text-on-surface-variant mb-4 px-4 tracking-[0.1em]">MODULES</h3>
          <nav className="space-y-2">
            {moduleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-150 font-body-main text-[15px] ${
                    isActive 
                      ? 'text-primary-container bg-surface-container-low' 
                      : 'text-on-background hover:bg-surface-container-lowest'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`}>{link.icon}</span>
                    {t(link.label)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-4 mt-auto pt-6 space-y-2 border-t border-surface-variant bg-white">
        {systemLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="flex items-center gap-4 px-4 py-3 text-on-background hover:bg-surface-container-lowest rounded-lg transition-all duration-150 font-body-main text-[15px]"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">{link.icon}</span>
            {t(link.label)}
          </NavLink>
        ))}

        <div className="flex justify-between items-center px-4 py-3 mt-4">
          <span className="font-data-tabular text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            {t("Language")}
          </span>
          <button
            className="px-3 py-1 text-[10px] font-bold uppercase bg-surface-container text-on-background rounded border border-outline-variant hover:bg-surface-container-high transition-colors"
            onClick={toggleLanguage}
          >
            {lang === 'en' ? 'मराठी' : 'English'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all duration-150 font-body-main text-[15px] font-medium"
        >
          <span className="material-symbols-outlined text-[22px]">power_settings_new</span>
          System Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
