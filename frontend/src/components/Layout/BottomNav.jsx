import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './BottomNav.css';

const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/officer', icon: 'home', label: 'Home', end: true },
    { to: '/officer/application-review', icon: 'assignment', label: 'Queue' },
    { to: '/officer/field-verification', icon: 'agriculture', label: 'Field' },
    { to: '/officer/alerts', icon: 'notifications_active', label: 'Alerts' },
    { to: '/officer/settings', icon: 'settings', label: 'More' },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <div className="bottom-nav-icon-wrapper">
            <span className="material-symbols-outlined">{item.icon}</span>
          </div>
          <span className="bottom-nav-label">{t(item.label)}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
