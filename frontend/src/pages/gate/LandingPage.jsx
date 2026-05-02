import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../utils/mockData';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (role) => {
    login(MOCK_USERS[role]);
    if (role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/officer');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-lowest)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-6)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
        <div style={{ margin: '0 auto var(--sp-4)', width: '96px', height: '96px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '48px' }}>agriculture</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: 'var(--sp-2)' }}>Krishi Prabandh</h1>
        <p style={{ color: 'var(--text-muted)' }}>Government of Maharashtra Agriculture Portal</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%', maxWidth: '380px' }}>
        <button 
          className="btn btn-success btn-lg btn-full"
          onClick={() => handleLogin('farmer')}
          style={{ height: '64px', fontSize: '18px' }}
        >
          <span className="material-symbols-outlined">psychiatry</span>
          Enter as Farmer (Ramdas)
        </button>

        <button 
          className="btn btn-primary btn-lg btn-full"
          onClick={() => handleLogin('officer')}
          style={{ height: '64px', fontSize: '18px' }}
        >
          <span className="material-symbols-outlined">badge</span>
          Enter as Krishi Sahayak
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
