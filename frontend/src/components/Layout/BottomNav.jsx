import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './BottomNav.css';

const BottomNav = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { to: '/officer',       icon: 'home',         label: 'Home',         end: true },
    { to: '/officer/field', icon: 'agriculture',   label: 'Field'  },
    { to: '/applications',  icon: 'assignment',    label: 'Apply'  },
    { to: '/gram-sabha',    icon: 'diversity_3',   label: 'Sabha'  },
    { to: '/reports',       icon: 'more_horiz',    label: 'More'   },
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
