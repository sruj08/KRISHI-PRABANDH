import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './BottomNav.css';

const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: 'home_work', label: 'Home' },
    { to: '/applications', icon: 'assignment_turned_in', label: 'Apps' },
    { to: '/visit-planner', icon: 'calendar_today', label: 'Planner' },
    { to: '/fraud-alerts', icon: 'report_problem', label: 'Alerts', badge: true },
    { to: '/advanced-tools', icon: 'construction', label: 'Tools' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon-wrapper">
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.badge && <span className="bottom-nav-badge"></span>}
          </div>
          <span className="bottom-nav-label">{t(item.label)}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
