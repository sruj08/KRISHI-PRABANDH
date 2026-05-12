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
    { to: '/', icon: 'map', label: 'Command Map' },
  ];

  const moduleLinks = [
    { to: '/survey',       icon: 'bar_chart',       label: 'Scheme Analytics' },
    { to: '/geo',          icon: 'eco',             label: 'Crop Health / NDVI' },
    { to: '/applications', icon: 'account_balance', label: 'PFMS Monitoring' },
    { to: '/grievances',   icon: 'priority_high',   label: 'Grievance Escalation' },
    { to: '/audit-logs',   icon: 'history',         label: 'Audit Logs' },
  ];

  return (
    <aside className={`sidebar flex flex-col bg-white border-r border-[#E2E9E6] shrink-0 z-40 ${isOpen ? 'open' : ''}`}>

      {/* ── Nav links ── */}
      <div className="flex-1 overflow-y-auto py-5 px-3">

        {/* Overview */}
        <p className="sidebar-section-label">Overview</p>
        {overviewLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, color: isActive ? '#033621' : '#717972', flexShrink: 0 }}
                >
                  {link.icon}
                </span>
                <span className="sidebar-link-label">{t(link.label)}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Modules */}
        <p className="sidebar-section-label" style={{ marginTop: 20 }}>Modules</p>
        <nav className="flex flex-col gap-0.5">
          {moduleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: isActive ? '#033621' : '#717972', flexShrink: 0 }}
                  >
                    {link.icon}
                  </span>
                  <span className="sidebar-link-label">{t(link.label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <NavLink
          to="/roles"
          className="sidebar-link"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972', flexShrink: 0 }}>badge</span>
          <span className="sidebar-link-label">{t('User Roles')}</span>
        </NavLink>
        <NavLink
          to="/settings"
          className="sidebar-link"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972', flexShrink: 0 }}>settings</span>
          <span className="sidebar-link-label">{t('System Controls')}</span>
        </NavLink>

        <div className="sidebar-lang-row">
          <span className="sidebar-lang-label">{t('Language')}</span>
          <button className="sidebar-lang-btn" onClick={toggleLanguage}>
            {lang === 'en' ? 'मराठी' : 'EN'}
          </button>
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>power_settings_new</span>
          <span className="sidebar-link-label">System Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
