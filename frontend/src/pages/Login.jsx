import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';

const Login = () => {
  const { t, toggleLanguage, lang } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login logic
    login({
      id: officerId || 'AGRI-9920',
      name: 'Sahayak Krushi Adhikari Ramesh Patil',
      region: 'North Sector'
    });
    navigate('/');
  };

  return (
    <div className="flex-col" style={{ minHeight: '100vh', backgroundColor: 'var(--primary)', color: 'white' }}>
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-lg fw-bold" style={{ margin: 0, color: 'white' }}>{t("AgriField Gov", lang)}</h1>
        <button 
          className="btn-outline btn-sm text-white border-white" 
          style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
          onClick={toggleLanguage}
        >
          {lang === 'en' ? 'मराठी' : 'English'}
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-6">
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
          <div 
            style={{ 
              width: '80px', height: '80px', 
              background: 'white', 
              borderRadius: '50%', 
              margin: '0 auto var(--sp-4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>
              admin_panel_settings
            </span>
          </div>
          <h2 className="text-xl fw-bold" style={{ color: 'white' }}>{t("Secure Government Officer Portal", lang)}</h2>
        </div>

        <div className="card w-full max-w-sm" style={{ padding: 'var(--sp-8)' }}>
          <form onSubmit={handleSubmit} className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label">{t("Officer ID", lang)}</label>
              <div className="form-input-with-icon">
                <span className="material-symbols-outlined input-icon">badge</span>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. AGRI-9920" 
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">{t("Password / OTP", lang)}</label>
              <div className="form-input-with-icon">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth icon="login" size="lg">
              {t("Authenticate & Access", lang)}
            </Button>
          </form>
        </div>
      </main>

      <footer className="p-4 text-center text-sm" style={{ opacity: 0.8 }}>
        Maharashtra State Agriculture Department © 2024
      </footer>
    </div>
  );
};

export default Login;
