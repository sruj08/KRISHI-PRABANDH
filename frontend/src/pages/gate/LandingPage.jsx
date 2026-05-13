import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast.jsx';
import './LandingPage.css';
import { useAuth } from '../../context/AuthContext';
import { useKrishiData } from '../../context/KrishiDataContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const { pickOfficerForUiRole, loginPayloadFromOfficer } = useKrishiData();

  const [selectedRole, setSelectedRole] = useState('');

  const handleEnterDashboard = (e) => {
    e.preventDefault();
    if (!selectedRole) {
      addToast('Please select a role', 'error');
      return;
    }
    const officer = pickOfficerForUiRole(selectedRole);
    const payload = loginPayloadFromOfficer(officer, selectedRole);
    if (!payload) {
      addToast('No CSV officer found for this role', 'error');
      return;
    }
    login(payload);
    if (selectedRole === 'state') navigate('/state/dashboard');
    else if (selectedRole === 'division') navigate('/division/dashboard');
    else if (selectedRole === 'farmer') navigate('/farmer');
    else if (selectedRole === 'cao') navigate('/cao');
    else if (selectedRole === 'tao') navigate('/tao');
    else if (selectedRole === 'district') navigate('/district');
    else navigate('/officer');
  };

  const roles = [
    { id: 'farmer',   title: 'Farmer / Field Initiator' },
    { id: 'officer',  title: 'Krushi Sahayak (Field Officer)' },
    { id: 'cao',      title: 'Mandal Krushi Adhikari (CAO)' },
    { id: 'tao',      title: 'Taluka Agriculture Officer (TAO)' },
    { id: 'district', title: 'District Authority (DAO)' },
    { id: 'division', title: 'Divisional Joint Director (DJDA)' },
    { id: 'state',    title: 'Commissioner of Agriculture (State)' },
  ];

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
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>public</span>
          </div>
          <div>
            <div className="brand-eyebrow">Krishi Prabandh</div>
            <div className="brand-org">Government of Maharashtra · Department of Agriculture</div>
          </div>
        </div>

        <div className="brand-hero">
          <h1>Krishi Prabandh</h1>
          <p className="sub">AGRICULTURAL ADMINISTRATION PLATFORM</p>
          <p className="tag">Superhuman Vision. Millisecond Decisions.</p>
          
          <div aria-hidden="true" className="telemetry">
            <div className="tchip">
              <div className="label">Telemetry</div>
              <div className="value">Active</div>
              <div className="delta"><span className="pulse-dot"></span> 36 talukas online</div>
            </div>
            <div className="tchip">
              <div className="label">Files Verified · YTD</div>
              <div className="value">1,402</div>
              <div className="delta">+12% vs last quarter</div>
            </div>
            <div className="tchip">
              <div className="label">Leakage Prevented</div>
              <div className="value">₹42.5L</div>
              <div className="delta">Across all schemes</div>
            </div>
          </div>
        </div>

        <div className="brand-foot">
          <div>© 2026 Government of Maharashtra<span className="dot"></span>v3.2.1</div>
          <div>Secured · ISO 27001 · MeitY Empanelled</div>
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
              margin: '0 0 8px',
            }}>
              Choose role
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#718096',
              margin: 0,
            }}>
              Demo mode: pick a role to open the matching dashboard. No server or sign-in required.
            </p>
          </div>

          <form onSubmit={handleEnterDashboard} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Role Selection */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#4a5568',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                SELECT USER ROLE
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    fontSize: '15px',
                    color: selectedRole ? '#1a202c' : '#718096',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="" disabled>Choose your role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.title}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#718096',
                  fontSize: '20px',
                }}>
                  expand_more
                </span>
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
              Open dashboard <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid #bbf7d0',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>science</span>
              Offline demo — data is illustrative only
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
            Government of Maharashtra - Department of Agriculture
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '13px', color: '#718096' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Help / Support</span>
            <span style={{ cursor: 'pointer' }}>Technical Manual</span>
          </div>
          <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '16px' }}>
            © 2024 Krishi Prabandh DAO System v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
