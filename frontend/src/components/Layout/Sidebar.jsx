import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { t, cycleLanguage, lang, langLabels } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSahayak = !user?.role || user.role === 'officer' || user.role === 'mandal_officer';

  const [expandedSection, setExpandedSection] = useState('cmd');

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Auto-close drawer on mobile/tablet after navigation
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const getMenuSections = (role) => {
    if (role === 'farmer') {
      return [
        {
          id: 'farmer_modules',
          label: 'MODULES',
          items: [
            { to: '/farmer', icon: 'dashboard', label: 'Dashboard' },
            { to: '/gram-sabha', icon: 'diversity_3', label: 'Gram Sabha' },
            { to: '/settings', icon: 'settings', label: 'Settings' },
          ],
        },
      ];
    }

    if (role === 'state') {
      return [
        {
          id: 'state_governance',
          flat: true,
          label: 'GOVERNANCE',
          items: [
            { to: '/state/dashboard', icon: 'dashboard', label: 'Dashboard' },
            { to: '/state/schemes', icon: 'account_tree', label: 'Schemes' },
            { to: '/state/fund-monitoring', icon: 'account_balance_wallet', label: 'Fund Monitoring' },
            { to: '/state/approvals', icon: 'check_circle', label: 'Approvals' },
          ],
        },
        {
          id: 'state_intelligence',
          flat: true,
          label: 'INTELLIGENCE',
          items: [
            { to: '/state/divisional-analysis', icon: 'analytics', label: 'Divisional Analysis' },
            { to: '/state/grievances', icon: 'gavel', label: 'Grievance Intelligence' },
          ],
        },
      ];
    }

    if (role === 'division') {
      return [
        {
          id: 'div_overview',
          flat: true,
          label: 'DIVISIONAL OVERVIEW',
          items: [
            { to: '/division/dashboard', icon: 'dashboard', label: 'Overview', end: true },
          ],
        },
        {
          id: 'dist_ops',
          flat: true,
          label: 'DISTRICT OPERATIONS',
          items: [
            { to: '/division/district-perf', icon: 'leaderboard', label: 'District Performance' },
            { to: '/division/resources', icon: 'swap_horiz', label: 'Dynamic Resource Reallocation' },
          ],
        },
        {
          id: 'alerts_fraud',
          flat: true,
          label: 'ALERTS & FRAUD',
          items: [
            { to: '/division/fraud', icon: 'shield_locked', label: 'Cross-District Fraud' },
            { to: '/division/escalations', icon: 'priority_high', label: 'Escalations' },
            { to: '/state/grievances', icon: 'gavel', label: 'Grievances' },
          ],
        },
      ];
    }

    if (role === 'cao') {
      return [
        { id: 'dao_overview', label: 'OVERVIEW', items: [
          { to: '/cao', icon: 'dashboard', label: 'Dashboard' },
          { to: '/map', icon: 'map', label: 'Command Map' },
        ]},
        { id: 'dao_supervision', label: 'SUPERVISION', items: [
          { to: '/cao/sahayak-matrix', icon: 'leaderboard', label: 'Sahayak Matrix' },
          { to: '/cao/supervision', icon: 'visibility', label: 'Supervision' },
          { to: '/cao/shops', icon: 'storefront', label: 'Krushi Seva Kendra' },
        ]},
        { id: 'dao_modules', label: 'ANALYTICS', items: [
          { to: '/survey', icon: 'bar_chart', label: 'Scheme Analytics' },
          { to: '/geo', icon: 'eco', label: t('Crop stress (rain desk)') },
          { to: '/applications', icon: 'account_balance', label: 'PFMS Monitoring' },
          { to: '/dao/grievances', icon: 'priority_high', label: 'Grievance Command' },
          { to: '/audit-logs', icon: 'history', label: 'Audit Logs' },
        ]},
      ];
    }

    if (role === 'tao') {
      return [
        { id: 'tao_nav', label: 'MODULES', items: [
          { to: '/tao', icon: 'dashboard', label: 'Dashboard' },
          { to: '/tao/pending-applications', icon: 'pending_actions', label: 'Pending Applications' },
          { to: '/tao/ai-flagged-cases', icon: 'flag', label: 'AI Flagged Cases' },
          { to: '/tao/field-verification-requests', icon: 'assignment_turned_in', label: 'Field Verification' },
          { to: '/tao/grievances', icon: 'gavel', label: 'Grievance Queue' },
          { to: '/survey', icon: 'bar_chart', label: 'Scheme Analytics' },
        ]},
      ];
    }

    if (role === 'district') {
      return [
        { id: 'dao_nav', label: 'MODULES', items: [
          { to: '/dao', icon: 'dashboard', label: 'Dashboard' },
          { to: '/dao/district-analytics', icon: 'analytics', label: 'District Analytics' },
          { to: '/dao/taluka-comparison', icon: 'compare', label: 'Taluka Comparison' },
          { to: '/dao/fraud-trends', icon: 'trending_up', label: 'Fraud Trends' },
          { to: '/dao/grievances', icon: 'gavel', label: 'Grievance Command' },
          { to: '/survey', icon: 'bar_chart', label: 'Scheme Monitoring' },
        ]},
      ];
    }

    // ── Krishi Sahayak (Officer) - command-center IA (6 groups) ──
    return [
      {
        id: 'officer_workflow',
        flat: true,
        label: 'WORKFLOW',
        items: [
          { to: '/officer', icon: 'dashboard', label: 'Dashboard', end: true },
          { to: '/officer/pending-surveys', icon: 'pending_actions', label: 'Pending Surveys' },
          { to: '/officer/farmer-registry', icon: 'groups', label: 'Farmer Registry' },
          { to: '/officer/ai-verification', icon: 'smart_toy', label: 'AI Verification' },
          { to: '/officer/gr-assistant', icon: 'chat', label: 'GR Assistant' },
          { to: '/officer/settings', icon: 'settings', label: 'Settings' },
        ],
      }
    ];
  };

  const menuSections = useMemo(() => getMenuSections(user?.role), [user?.role]);

  // Auto-expand accordion section based on current path (flat groups stay fully open)
  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = menuSections.find(
      (sec) =>
        !sec.flat
        && sec.items.some((item) => {
          if (item.end) return currentPath === item.to;
          return currentPath.startsWith(item.to);
        }),
    );
    if (activeSection) setExpandedSection(activeSection.id);
  }, [location.pathname, menuSections]);

  return (
    <aside className={`sidebar flex flex-col z-40 ${isOpen ? 'open' : ''} bg-white${isSahayak ? ' sidebar--officer' : ''}`}>

      {/* Sidebar brand header (only visible on mobile/tablet overlay) */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#e2e9e6] lg:hidden shrink-0">
        <img
          src="/krishi-logo-128.webp"
          alt="Krishi Prabandh"
          width="26"
          height="26"
          style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }}
          loading="eager"
          decoding="async"
        />
        <span className="font-bold text-[13px] tracking-tight text-[#1a1c1a]">Krishi Prabandh</span>
        <button
          className="ml-auto icon-btn-soft"
          onClick={onClose}
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* ── Nav links ── */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <div className="sidebar-nav-stack">
          {menuSections.map((section) => {
            if (section.flat) {
              return (
                <div key={section.id} className="sidebar-flat-group">
                  <p className="sidebar-flat-group-title">{t(section.label)}</p>
                  <div className="sidebar-flat-group-links">
                    {section.items.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18, color: isActive ? '#1f4d36' : '#717972', flexShrink: 0 }}
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
              );
            }

            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className="sidebar-section-container">
                <button
                  type="button"
                  className="sidebar-section-header w-full"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isExpanded}
                >
                  <p className="sidebar-section-label">{t(section.label)}</p>
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
                        end={link.end}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18, color: isActive ? '#1f4d36' : '#717972', flexShrink: 0 }}
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
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-lang-row">
          <span className="sidebar-lang-label">{t('Language')}</span>
          <button
            type="button"
            className="sidebar-lang-btn"
            data-notranslate
            onClick={cycleLanguage}
          >
            {langLabels[lang] || lang}
          </button>
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>power_settings_new</span>
          <span className="sidebar-link-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
