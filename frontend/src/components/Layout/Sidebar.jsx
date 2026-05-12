import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { t, toggleLanguage, lang } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial expanded section based on current path
  const [expandedSection, setExpandedSection] = useState('overview');

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const menuSections = [
    {
      id: 'overview',
      label: 'OVERVIEW',
      items: [
        { to: '/', icon: 'dashboard', label: 'Dashboard' },
        { to: '/map', icon: 'map', label: 'Village Map' },
      ]
    },
    {
      id: 'field_work',
      label: 'FIELD WORK',
      items: [
        { to: '/farmers', icon: 'groups', label: 'Farmer Registry' },
        { to: '/verification', icon: 'verified_user', label: 'Field Verification' },
        { to: '/damage', icon: 'warning', label: 'Damage Reports' },
      ]
    },
    {
      id: 'schemes',
      label: 'SCHEMES',
      items: [
        { to: '/applications', icon: 'article', label: 'Applications' },
        { to: '/eligibility', icon: 'fact_check', label: 'Eligible Farmers' },
      ]
    },
    {
      id: 'insights',
      label: 'INSIGHTS',
      items: [
        { to: '/health', icon: 'eco', label: 'Crop Health' },
        { to: '/alerts', icon: 'notifications_active', label: 'Alerts & Rainfall' },
      ]
    },
    {
      id: 'community',
      label: 'COMMUNITY',
      items: [
        { to: '/gram-sabha', icon: 'diversity_3', label: 'Gram Sabha' },
        { to: '/grievances', icon: 'gavel', label: 'Grievances' },
      ]
    },
    {
      id: 'more',
      label: 'MORE',
      items: [
        { to: '/reports', icon: 'description', label: 'Reports' },
        { to: '/settings', icon: 'settings', label: 'Settings' },
      ]
    }
  ];

  // Auto-expand section on mount based on active route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = menuSections.find(sec => 
      sec.items.some(item => {
        if (item.to === '/') return currentPath === '/';
        return currentPath.startsWith(item.to);
      })
    );
    if (activeSection) {
      setExpandedSection(activeSection.id);
    }
  }, [location.pathname]);

  return (
    <aside className={`sidebar flex flex-col bg-white border-r border-[#E2E9E6] shrink-0 z-40 ${isOpen ? 'open' : ''}`}>

      {/* ── Nav links ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col" style={{ gap: '16px' }}>
        
        {menuSections.map((section) => {
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="sidebar-section-container">
              <button 
                className="sidebar-section-header w-full" 
                onClick={() => toggleSection(section.id)}
                aria-expanded={isExpanded}
              >
                <span className="sidebar-section-label">{t(section.label)}</span>
                <span className={`material-symbols-outlined sidebar-section-icon ${isExpanded ? 'expanded' : ''}`}>
                  expand_more
                </span>
              </button>

              <div className={`sidebar-section-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="sidebar-section-content-inner">
                  {section.items.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 20, color: isActive ? '#033621' : '#717972', flexShrink: 0 }}
                          >
                            {link.icon}
                          </span>
                          <span className="sidebar-link-label">{t(link.label)}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-lang-row">
          <span className="sidebar-lang-label">{t('Language')}</span>
          <button className="sidebar-lang-btn" onClick={toggleLanguage}>
            {lang === 'en' ? 'मराठी' : 'EN'}
          </button>
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>power_settings_new</span>
          <span className="sidebar-link-label">System Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
