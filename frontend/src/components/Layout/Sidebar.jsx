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

  const navLinks = [
    { to: '/', icon: 'home_work', label: 'Dashboard' },
    { to: '/applications', icon: 'assignment_turned_in', label: 'Applications' },
    { to: '/visit-planner', icon: 'calendar_today', label: 'Planner' },
    { to: '/fraud-alerts', icon: 'report_problem', label: 'Alerts', badge: 2 },
    { to: '/advanced-tools', icon: 'construction', label: 'Advanced Tools' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="officer-profile">
          <div className="officer-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="officer-info">
            <h3 className="officer-name">{user?.name || t("Sahayak Krushi Adhikari Ramesh Patil")}</h3>
            <p className="officer-id">{user?.id || t("ID: AGRI-9920")}</p>
            <p className="officer-region">{user?.region || t("Region: North Sector")}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="link-text">{t(link.label)}</span>
            {link.badge && <span className="sidebar-badge">{link.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="language-toggle">
          <span className="lang-label">{t("Language")}</span>
          <button className="btn-outline btn-sm lang-toggle-btn" onClick={toggleLanguage}>
            {lang === 'en' ? 'मराठी' : 'English'}
          </button>
        </div>
        <a href="#" className="sidebar-link logout-link" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span className="link-text">{t("Logout")}</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
