import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast.jsx';

const API_BASE = 'http://localhost:8000';

const Login = () => {
  const { t, toggleLanguage, lang } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!officerId || !password) {
      addToast("Please enter credentials", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: officerId, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data?.message || "Login failed", "error");
        return;
      }
      login(data.data.user || data.data, data.data?.access_token);
      navigate('/');
    } catch (err) {
      addToast("Cannot reach server", "error");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Left Branding Panel */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, #033621 0%, #1f4d36 50%, #214f38 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--sp-16)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--sp-6)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#a0d2b3', fontSize: '40px' }}>
              admin_panel_settings
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '28px', fontWeight: 700, color: '#ffffff',
            margin: '0 0 var(--sp-2)',
          }}>
            {t("Secure Government Officer Portal", lang)}
          </h2>
          <p style={{
            fontFamily: 'var(--font-data)',
            fontSize: '11px', fontWeight: 700, color: '#a0d2b3',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            Maharashtra State Agriculture Department
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 'var(--sp-8)',
        backgroundColor: 'var(--surface)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-8)' }}>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-dark)', margin: 0,
            }}>
              {t("Officer Login", lang)}
            </h3>
            <button
              onClick={toggleLanguage}
              style={{
                padding: '4px 12px', fontSize: '11px', fontWeight: 700,
                background: 'var(--surface-container)', color: 'var(--text-dark)',
                borderRadius: 'var(--radius)', border: '1px solid var(--outline-card)',
                cursor: 'pointer',
              }}
            >
              {lang === 'en' ? 'मराठी' : 'English'}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            <div className="form-group">
              <label className="form-label">{t("Officer ID", lang)}</label>
              <div className="form-input-with-icon">
                <span className="material-symbols-outlined input-icon">badge</span>
                <input 
                  type="text" className="form-input" placeholder="e.g. AGRI-9920" 
                  value={officerId} onChange={(e) => setOfficerId(e.target.value)} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("Password / OTP", lang)}</label>
              <div className="form-input-with-icon">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input 
                  type="password" className="form-input" placeholder="••••••••" 
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth icon="login" size="lg">
              {t("Authenticate & Access", lang)}
            </Button>
          </form>

          <p style={{
            marginTop: 'var(--sp-10)', textAlign: 'center',
            fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--text-muted)',
          }}>
            Maharashtra State Agriculture Department © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
