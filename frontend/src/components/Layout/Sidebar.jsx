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

  const getMenuSections = (role) => {
    if (role === 'state') {
      return [
        {
          id: 'state_command',
          label: 'STATE COMMAND',
          items: [
            { to: '/state/dashboard', icon: 'public', label: 'State Dashboard' },
            { to: '/state/map', icon: 'map', label: 'Maharashtra Map' },
          ]
        },
        {
          id: 'scheme_gov',
          label: 'SCHEME GOVERNANCE',
          items: [
            { to: '/state/schemes', icon: 'account_tree', label: 'Active Schemes' },
            { to: '/state/new-scheme', icon: 'add_box', label: 'New Scheme Creation' },
            { to: '/state/lottery', icon: 'casino', label: 'Beneficiary Lottery' },
          ]
        },
        {
          id: 'budget_pfms',
          label: 'BUDGET & PFMS',
          items: [
            { to: '/state/budget', icon: 'account_balance_wallet', label: 'Budget Allocation' },
            { to: '/state/pfms', icon: 'account_balance', label: 'PFMS Monitoring' },
            { to: '/state/utilization', icon: 'pie_chart', label: 'Utilization Analytics' },
          ]
        },
        {
          id: 'ai_intelligence',
          label: 'AI INTELLIGENCE',
          items: [
            { to: '/state/fraud', icon: 'shield_locked', label: 'Fraud Prevention' },
            { to: '/state/friction', icon: 'timeline', label: 'Policy Friction' },
            { to: '/state/risk', icon: 'warning', label: 'AI Risk Signals' },
          ]
        },
        {
          id: 'disaster',
          label: 'DISASTER MONITORING',
          items: [
            { to: '/state/drought', icon: 'wb_sunny', label: 'Drought Heatmap' },
            { to: '/state/flood', icon: 'flood', label: 'Flood Monitoring' },
            { to: '/state/crop-failure', icon: 'compost', label: 'Crop Failure Alerts' },
          ]
        },
        {
          id: 'reports',
          label: 'REPORTS',
          items: [
            { to: '/state/reports', icon: 'summarize', label: 'State Reports' },
            { to: '/state/division-perf', icon: 'leaderboard', label: 'Division Performance' },
            { to: '/state/export', icon: 'file_download', label: 'Export Center' },
          ]
        },
        {
          id: 'system',
          label: 'SYSTEM',
          items: [
            { to: '/state/users', icon: 'manage_accounts', label: 'User Governance' },
            { to: '/state/audit', icon: 'history', label: 'Audit Trails' },
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
            { to: '/division/dashboard', icon: 'dashboard_customize', label: 'Division Dashboard' },
            { to: '/division/map', icon: 'map', label: 'Division Map' },
          ]
        },
        {
          id: 'dist_ops',
          label: 'DISTRICT OPERATIONS',
          items: [
            { to: '/division/district-matrix', icon: 'table_chart', label: 'District Matrix' },
            { to: '/division/pendency', icon: 'pending_actions', label: 'Pendency Monitoring' },
            { to: '/division/officer-perf', icon: 'bar_chart', label: 'Officer Performance' },
          ]
        },
        {
          id: 'fraud_alerts',
          label: 'FRAUD & ALERTS',
          items: [
            { to: '/division/cross-fraud', icon: 'share_location', label: 'Cross-District Fraud' },
            { to: '/division/ai-red-flags', icon: 'flag', label: 'AI Red Flags' },
            { to: '/division/escalations', icon: 'priority_high', label: 'Escalations' },
          ]
        },
        {
          id: 'resource',
          label: 'RESOURCE MANAGEMENT',
          items: [
            { to: '/division/staff', icon: 'engineering', label: 'Staff Deployment' },
            { to: '/division/task-redist', icon: 'move_up', label: 'Task Redistribution' },
            { to: '/division/emergency', icon: 'local_hospital', label: 'Emergency Assignments' },
          ]
        },
        {
          id: 'field_intel',
          label: 'FIELD INTELLIGENCE',
          items: [
            { to: '/division/rainfall', icon: 'rainy', label: 'Rainfall Monitoring' },
            { to: '/division/crop-distress', icon: 'eco', label: 'Crop Distress' },
            { to: '/division/verification-trends', icon: 'trending_up', label: 'Verification Trends' },
          ]
        },
        {
          id: 'div_reports',
          label: 'REPORTS',
          items: [
            { to: '/division/reports', icon: 'summarize', label: 'Division Reports' },
            { to: '/division/comparison', icon: 'compare_arrows', label: 'District Comparison' },
          ]
        },
        {
          id: 'div_settings',
          label: 'SETTINGS',
          items: [
            { to: '/division/settings', icon: 'settings', label: 'Division Controls' },
          ]
        }
      ];
    }

    if (role === 'district' || role === 'tao' || role === 'cao') {
      return [
        {
          id: 'dao_overview',
          label: 'OVERVIEW',
          items: [
            { to: `/${role === 'district' ? 'district' : role}`, icon: 'dashboard', label: 'Dashboard' },
            { to: '/map', icon: 'map', label: 'Command Map' },
          ]
        },
        {
          id: 'dao_modules',
          label: 'MODULES',
          items: [
            { to: '/survey',       icon: 'bar_chart',       label: 'Scheme Analytics' },
            { to: '/geo',          icon: 'eco',             label: 'Crop Health / NDVI' },
            { to: '/applications', icon: 'account_balance', label: 'PFMS Monitoring' },
            { to: '/grievances',   icon: 'priority_high',   label: 'Grievance Escalation' },
            { to: '/audit-logs',   icon: 'history',         label: 'Audit Logs' },
          ]
        }
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
        if (item.to === '/') return currentPath === '/';
        return currentPath.startsWith(item.to);
      })
    );
    if (activeSection) {
      setExpandedSection(activeSection.id);
    }
  }, [location.pathname]);

  const isDark = user?.role === 'state';

  return (
    <aside className={`sidebar flex flex-col shrink-0 z-40 ${isOpen ? 'open' : ''} ${isDark ? 'bg-[#0a0f0d] border-[#1f2924]' : 'bg-white border-[#E2E9E6]'} border-r`}>

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
                  <p className={`sidebar-section-label ${isDark ? 'text-gray-400' : ''}`}>{t(section.label)}</p>
                  <span className={`material-symbols-outlined sidebar-section-icon ${isExpanded ? 'expanded' : ''} ${isDark ? 'text-gray-500' : ''}`}>
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
                          `sidebar-link ${isActive ? 'sidebar-link--active' : ''} ${isDark ? (isActive ? 'bg-[#111814] text-[#4ade80]' : 'text-gray-300 hover:bg-[#111814] hover:text-white') : ''}`
                        }
                        style={isDark ? { background: 'transparent' } : {}}
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18, color: isDark ? (isActive ? '#4ade80' : '#9ca3af') : (isActive ? '#1f4d36' : '#717972'), flexShrink: 0 }}
                            >
                              {link.icon}
                            </span>
                            <span className={`sidebar-link-label ${isDark && isActive ? 'text-[#4ade80]' : ''}`}>{t(link.label)}</span>
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
      <div className={`sidebar-footer ${isDark ? 'border-[#1f2924]' : ''}`}>
        <NavLink
          to="/roles"
          className={`sidebar-link ${isDark ? 'text-gray-300 hover:bg-[#111814] hover:text-white' : ''}`}
          style={isDark ? { background: 'transparent' } : {}}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: isDark ? '#9ca3af' : '#717972', flexShrink: 0 }}>badge</span>
          <span className="sidebar-link-label">{t('User Roles')}</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={`sidebar-link ${isDark ? 'text-gray-300 hover:bg-[#111814] hover:text-white' : ''}`}
          style={isDark ? { background: 'transparent' } : {}}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: isDark ? '#9ca3af' : '#717972', flexShrink: 0 }}>settings</span>
          <span className="sidebar-link-label">{t('System Controls')}</span>
        </NavLink>

        <div className={`sidebar-lang-row ${isDark ? 'border-[#1f2924]' : ''}`}>
          <span className={`sidebar-lang-label ${isDark ? 'text-gray-400' : ''}`}>{t('Language')}</span>
          <button className={`sidebar-lang-btn ${isDark ? 'bg-[#111814] border-[#1f2924] text-gray-300 hover:bg-[#1a241d]' : ''}`} onClick={toggleLanguage}>
            {lang === 'en' ? 'मराठी' : 'EN'}
          </button>
        </div>

        <button onClick={handleLogout} className={`sidebar-logout-btn ${isDark ? 'text-gray-300 hover:bg-[#2a1114] hover:text-red-400' : ''}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>power_settings_new</span>
          <span className="sidebar-link-label">System Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
