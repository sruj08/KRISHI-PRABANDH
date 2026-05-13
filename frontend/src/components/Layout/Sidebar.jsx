import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, isDark = false }) => {
  const { t, cycleLanguage, lang, langLabels } = useLanguage();
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
          id: 'state_command',
          label: 'STATE COMMAND',
          items: [
            { to: '/state/dashboard', icon: 'public', label: 'State Dashboard' },
            { to: '/state/map', icon: 'map', label: 'Maharashtra Live Map' },
          ]
        },
        {
          id: 'governance',
          label: 'GOVERNANCE',
          items: [
            { to: '/state/schemes', icon: 'account_tree', label: 'Schemes' },
            { to: '/state/fund-monitoring', icon: 'account_balance_wallet', label: 'Fund Monitoring' },
            { to: '/state/approvals', icon: 'check_circle', label: 'Approvals' },
          ]
        },
        {
          id: 'intelligence',
          label: 'INTELLIGENCE',
          items: [
            { to: '/state/fraud', icon: 'shield_locked', label: 'Fraud Network' },
            { to: '/state/insights', icon: 'lightbulb', label: 'AI Insights' },
            { to: '/state/disaster', icon: 'warning', label: 'Disaster Watch' },
          ]
        },
        {
          id: 'reports',
          label: 'REPORTS',
          items: [
            { to: '/state/analytics', icon: 'bar_chart', label: 'Analytics' },
            { to: '/state/audit', icon: 'history', label: 'Audit Logs' },
          ]
        },
        {
          id: 'system',
          label: 'SYSTEM',
          items: [
            { to: '/state/users', icon: 'manage_accounts', label: 'User Control' },
            { to: '/state/settings', icon: 'settings', label: 'Settings' },
          ]
        }
      ];
    }

    if (role === 'division') {
      return [
        {
          id: 'div_overview',
          label: 'DIVISION OVERVIEW',
          items: [
            { to: '/division/dashboard', icon: 'dashboard', label: 'Overview' },
            { to: '/division/map', icon: 'map', label: 'Geo Command Map' },
          ]
        },
        {
          id: 'dist_ops',
          label: 'DISTRICT OPERATIONS',
          items: [
            { to: '/division/district-perf', icon: 'leaderboard', label: 'District Performance' },
            { to: '/division/resources', icon: 'engineering', label: 'Resource Allocation' },
          ]
        },
        {
          id: 'alerts_fraud',
          label: 'ALERTS & FRAUD',
          items: [
            { to: '/division/fraud', icon: 'share_location', label: 'Cross-District Fraud' },
            { to: '/division/escalations', icon: 'priority_high', label: 'Escalations' },
          ]
        },
        {
          id: 'field_intel',
          label: 'FIELD INTELLIGENCE',
          items: [
            { to: '/division/crop-stress', icon: 'eco', label: 'Crop Stress' },
            { to: '/division/survey-monitoring', icon: 'verified', label: 'Survey Monitoring' },
          ]
        },
        {
          id: 'div_reports',
          label: 'REPORTS',
          items: [
            { to: '/division/analytics', icon: 'summarize', label: 'Division Analytics' },
          ]
        }
      ];
    }

    if (role === 'cao') {
      return [
        {
          id: 'dao_overview',
          label: 'OVERVIEW',
          items: [
            { to: '/cao', icon: 'dashboard', label: 'Dashboard' },
            { to: '/map', icon: 'map', label: 'Command Map' },
          ],
        },
        {
          id: 'dao_modules',
          label: 'MODULES',
          items: [
            { to: '/survey', icon: 'bar_chart', label: 'Scheme Analytics' },
            { to: '/geo', icon: 'eco', label: 'Crop Health / NDVI' },
            { to: '/applications', icon: 'account_balance', label: 'PFMS Monitoring' },
            { to: '/grievances', icon: 'priority_high', label: 'Grievance Escalation' },
            { to: '/audit-logs', icon: 'history', label: 'Audit Logs' },
          ],
        },
      ];
    }

    if (role === 'tao') {
      return [
        {
          id: 'tao_nav',
          label: 'MODULES',
          items: [
            { to: '/tao', icon: 'dashboard', label: 'Dashboard' },
            { to: '/tao/pending-applications', icon: 'pending_actions', label: 'Pending Applications' },
            { to: '/tao/ai-flagged-cases', icon: 'flag', label: 'AI Flagged Cases' },
            { to: '/tao/field-verification-requests', icon: 'assignment_turned_in', label: 'Field Verification Requests' },
            { to: '/survey', icon: 'bar_chart', label: 'Scheme Analytics' },
          ],
        },
      ];
    }

    if (role === 'district') {
      return [
        {
          id: 'dao_nav',
          label: 'MODULES',
          items: [
            { to: '/dao', icon: 'dashboard', label: 'Dashboard' },
            { to: '/dao/district-analytics', icon: 'analytics', label: 'District Analytics' },
            { to: '/dao/taluka-comparison', icon: 'compare', label: 'Taluka Comparison' },
            { to: '/dao/fraud-trends', icon: 'trending_up', label: 'Fraud Trends' },
            { to: '/survey', icon: 'bar_chart', label: 'Scheme Monitoring' },
          ],
        },
      ];
    }

    // Default: Krishi Sahayak (Officer)
    return [
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
  };

  const menuSections = getMenuSections(user?.role);

  // Auto-expand section on mount based on active route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = menuSections.find(sec =>
      sec.items.some(item => {
        if (item.to === '/') {
          return (
            currentPath === '/' ||
            currentPath === '/officer' ||
            currentPath.startsWith('/officer/')
          );
        }
        return currentPath.startsWith(item.to);
      })
    );
    if (activeSection) {
      setExpandedSection(activeSection.id);
    }
  }, [location.pathname, user?.role]);

  return (
    <aside className={`sidebar flex flex-col shrink-0 z-40 ${isOpen ? 'open' : ''} bg-white border-[#E2E9E6] border-r`}>

      {/* ── Nav links ── */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="flex flex-col gap-1">
          {menuSections.map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className="sidebar-section-container">
                <button
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
                        end={link.to === '/' || link.to === '/tao' || link.to === '/dao' || link.to === '/cao' || link.to === '/farmer'}
                        className={({ isActive }) => {
                          let active = isActive;
                          if (
                            link.to === '/' &&
                            (user?.role === 'officer' || user?.role === 'mandal_officer') &&
                            (location.pathname === '/officer' || location.pathname.startsWith('/officer/'))
                          ) {
                            active = true;
                          }
                          return `sidebar-link ${active ? 'sidebar-link--active' : ''}`;
                        }}
                      >
                        {({ isActive }) => {
                          let active = isActive;
                          if (
                            link.to === '/' &&
                            (user?.role === 'officer' || user?.role === 'mandal_officer') &&
                            (location.pathname === '/officer' || location.pathname.startsWith('/officer/'))
                          ) {
                            active = true;
                          }
                          return (
                          <>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18, color: active ? '#1f4d36' : '#717972', flexShrink: 0 }}
                            >
                              {link.icon}
                            </span>
                            <span className="sidebar-link-label">{t(link.label)}</span>
                          </>
                          );
                        }}
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
        <NavLink to="/roles" className="sidebar-link">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972', flexShrink: 0 }}>badge</span>
          <span className="sidebar-link-label">{t('User Roles')}</span>
        </NavLink>
        <NavLink to="/settings" className="sidebar-link">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#717972', flexShrink: 0 }}>settings</span>
          <span className="sidebar-link-label">{t('System Controls')}</span>
        </NavLink>

        <div className={`sidebar-lang-row ${isDark ? 'border-[#1f2924]' : ''}`}>
          <span className={`sidebar-lang-label ${isDark ? 'text-gray-400' : ''}`}>{t('Language')}</span>
          <button type="button" className={`sidebar-lang-btn ${isDark ? 'bg-[#111814] border-[#1f2924] text-gray-300 hover:bg-[#1a241d]' : ''}`} onClick={cycleLanguage}>
            {langLabels[lang] || lang}
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
