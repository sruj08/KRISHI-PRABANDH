import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useHierarchy } from '../../context/HierarchyContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { t, toggleLanguage, lang } = useLanguage();
  const { user, logout } = useAuth();
  const { currentMandal, currentSahayak } = useHierarchy();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/',           icon: 'radar',                 label: 'Command Center' },
    { to: '/survey',     icon: 'satellite_alt',         label: 'Survey Operations', badge: 'LIVE' },
    { to: '/applications', icon: 'assignment_turned_in', label: 'Applications' },
    { to: '/visit-planner', icon: 'calendar_today',     label: 'Planner' },
    { to: '/fraud-alerts',  icon: 'report_problem',     label: 'Alerts', badge: 2 },
    { to: '/advanced-tools', icon: 'construction',      label: 'Advanced Tools' },
    { to: '/geo',        icon: 'map',                   label: 'Geo-Intelligence' },
    { to: '/ledger',     icon: 'account_balance',       label: 'Compensation Ledger' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} bg-white border-r border-gray-300 shadow-sm z-40 relative flex flex-col font-body`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-gray-900 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
          <div>
            <h3 className="text-gray-900 text-[13px] font-bold uppercase tracking-widest">{user?.name || 'OPERATOR_1'}</h3>
            <p className="text-gray-500 font-mono text-[10px] tracking-wider mt-0.5 flex items-center gap-1.5">
              ID: {user?.agristack_id || 'OP-X99'}
            </p>
            {currentMandal && (
              <p className="text-primary text-[10px] font-bold tracking-widest mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {currentMandal.name}
                {currentSahayak && ` › ${currentSahayak.name}`}
              </p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 custom-scrollbar">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `group flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-none border-l-4 ${
                isActive 
                  ? 'bg-primary/5 text-primary border-primary' 
                  : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-300'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
            <span className="flex-1">{t(link.label)}</span>
            {link.badge && (
              <span className="bg-error text-white text-[9px] px-1.5 py-0.5 rounded-sm">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">{t("Language")}</span>
          <button 
            className="px-2 py-1 text-[10px] font-bold uppercase bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors" 
            onClick={toggleLanguage}
          >
            {lang === 'en' ? 'मराठी' : 'English'}
          </button>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-error hover:bg-error/5 border-l-4 border-transparent transition-none w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          <span>SYSTEM LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

