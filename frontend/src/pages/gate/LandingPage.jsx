import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast.jsx';
import './LandingPage.css';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';
import { useLanguage } from '../../context/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const { pickOfficerForUiRole, loginPayloadFromOfficer } = useKrishiData();

  const [selectedRole, setSelectedRole] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnterDashboard = (e) => {
    e.preventDefault();
    if (!selectedRole) {
      addToast(t('Please select a role'), 'error');
      return;
    }
    const officer = pickOfficerForUiRole(selectedRole);
    const payload = loginPayloadFromOfficer(officer, selectedRole);
    if (!payload) {
      addToast(t('No CSV officer found for this role'), 'error');
      return;
    }
    login(payload);
    if (selectedRole === 'state') navigate('/state/dashboard');
    else if (selectedRole === 'division') navigate('/division/dashboard');
    else if (selectedRole === 'farmer') navigate('/farmer');
    else if (selectedRole === 'cao') navigate('/cao');
    else if (selectedRole === 'tao') navigate('/tao');
    else if (selectedRole === 'district') navigate('/dao');
    else navigate('/officer');
  };

  const roles = [
    { id: 'farmer',   title: t('Farmer / Field Initiator') },
    { id: 'officer',  title: t('Krushi Sahayak (Field Officer)') },
    { id: 'cao',      title: t('Mandal Krushi Adhikari (CAO)') },
    { id: 'tao',      title: t('Taluka Agriculture Officer (TAO)') },
    { id: 'district', title: t('District Authority (DAO)') },
    { id: 'division', title: t('Divisional Joint Director (DJDA)') },
    { id: 'state',    title: t('Commissioner of Agriculture (State)') },
  ];

  const selectedLabel = roles.find(r => r.id === selectedRole)?.title;

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-body)',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
    }}>
      {/* ── Left Panel: Branding (Stitch Style) ── */}
      <section className="brand" style={{ flex: '0 0 60%', height: '100%' }}>
        <svg aria-hidden="true" className="lines" preserveAspectRatio="none" viewBox="0 0 600 800">
          <path d="M0,180 C150,140 280,260 420,200 S600,260 600,260"></path>
          <path d="M0,420 C140,380 260,500 400,460 S600,520 600,500"></path>
          <path d="M0,640 C160,600 300,720 440,680 S600,720 600,720"></path>
        </svg>
        <span aria-hidden="true" className="pin p1"></span>
        <span aria-hidden="true" className="pin p2"></span>
        <span aria-hidden="true" className="pin p3"></span>

        <div className="brand-top">
          <div aria-hidden="true" className="seal">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>public</span>
          </div>
          <div>
            <div className="brand-eyebrow">{t('Krishi Prabandh')}</div>
            <div className="brand-org">{t('Gov. Maharashtra · Agriculture Dept.')}</div>
          </div>
        </div>

        <div className="brand-hero">
          <div className="eyebrow-tag">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>agriculture</span>
            {t('Agricultural Intelligence Platform')}
          </div>
          <h1 style={{ whiteSpace: 'pre-line' }}>{t('Krishi\nPrabandh')}</h1>
          <p className="sub">{t('Government of Maharashtra · Department of Agriculture')}</p>
          <div className="divider"></div>
          <p className="tag">{t('Superhuman Vision. Millisecond Decisions.')}</p>
          
          <div aria-hidden="true" className="telemetry">
            <div className="tchip">
              <div className="label">{t('Telemetry')}</div>
              <div className="value">{t('Active')}</div>
              <div className="delta"><span className="pulse-dot"></span>{t(' 36 talukas online')}</div>
            </div>
            <div className="tchip">
              <div className="label">{t('Files Verified · YTD')}</div>
              <div className="value">{t('1,402')}</div>
              <div className="delta">{t('+12% vs last quarter')}</div>
            </div>
            <div className="tchip">
              <div className="label">{t('Leakage Prevented')}</div>
              <div className="value">{t('₹42.5L')}</div>
              <div className="delta">{t('Across all schemes')}</div>
            </div>
          </div>
        </div>

        <div className="brand-foot">
          <div>{t('© 2026 Government of Maharashtra')}<span className="dot"></span>{t('v3.2.1')}</div>
          <div>{t('Secured · ISO 27001 · MeitY Empanelled')}</div>
        </div>
      </section>

      {/* ── Right Panel: Login ── */}
      <div style={{
        flex: '0 0 40%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--sp-8)',
        backgroundColor: '#ffffff',
        height: '100%',
        overflowY: 'auto',
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '440px',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid #edf2f7',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '22px',
              fontWeight: 700,
              color: '#1a202c',
              margin: '0',
            }}>
              {t('Choose role')}
            </h2>
          </div>

          <form onSubmit={handleEnterDashboard} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Role Selection */}
            <div>
              <label className="rp-label">{t('SELECT USER ROLE')}</label>
              <div className="rp-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className={`rp-trigger ${dropdownOpen ? 'open' : ''} ${selectedRole ? 'selected' : ''}`}
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <span>{selectedLabel || t('Choose your role')}</span>
                  <span className={`material-symbols-outlined rp-chevron ${dropdownOpen ? 'rotated' : ''}`}>
                    expand_more
                  </span>
                </button>
                {dropdownOpen && (
                  <ul className="rp-menu" role="listbox">
                    {roles.map((role) => (
                      <li
                        key={role.id}
                        role="option"
                        aria-selected={selectedRole === role.id}
                        className={`rp-option ${selectedRole === role.id ? 'active' : ''}`}
                        onClick={() => { setSelectedRole(role.id); setDropdownOpen(false); }}
                      >
                        <span className="rp-option-text">{role.title}</span>
                        {selectedRole === role.id && (
                          <span className="material-symbols-outlined rp-check">check</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#033621',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 200ms',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#022b1a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#033621'}
            >
              {t('Open dashboard')} <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
            {t('Government of Maharashtra - Department of Agriculture')}
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '13px', color: '#718096' }}>
            <span style={{ cursor: 'pointer' }}>{t('Privacy Policy')}</span>
            <span style={{ cursor: 'pointer' }}>{t('Help / Support')}</span>
            <span style={{ cursor: 'pointer' }}>{t('Technical Manual')}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '16px' }}>
            {t('© 2024 Krishi Prabandh DAO System v2.4.0')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
