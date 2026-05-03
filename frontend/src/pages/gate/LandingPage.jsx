import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../utils/mockData';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (role) => {
    login(MOCK_USERS[role]);
    if (role === 'farmer') navigate('/farmer');
    else if (role === 'cao') navigate('/cao');
    else navigate('/officer');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d1117 0%, #161b22 60%, #1a2332 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ margin: '0 auto 16px', width: '80px', height: '80px', background: 'linear-gradient(135deg,#2D6A4F,#40916c)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(64,145,108,0.4)' }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '44px' }}>agriculture</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e6edf3', marginBottom: '6px', letterSpacing: '-0.5px' }}>Krishi Prabandh</h1>
        <p style={{ color: '#8b949e', fontSize: '13px' }}>Government of Maharashtra — Agriculture Intelligence Portal</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
        <button onClick={() => handleLogin('farmer')}
          style={{ height: '60px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg,#2D6A4F,#52b788)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(45,106,79,0.3)' }}>
          <span className="material-symbols-outlined">person</span>
          Enter as Farmer (Ramdas Kamble)
        </button>

        <button onClick={() => handleLogin('officer')}
          style={{ height: '60px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg,#0055A4,#1976d2)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,85,164,0.3)' }}>
          <span className="material-symbols-outlined">badge</span>
          Enter as Krishi Sahayak (Field Officer)
        </button>

        <button onClick={() => handleLogin('cao')}
          style={{ height: '70px', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg,#1a0a2e,#4a1272,#6a1b9a)', color: '#fff', border: '1px solid rgba(142,36,170,0.6)', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 30px rgba(142,36,170,0.4)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dashboard</span>
          <div style={{ textAlign: 'left' }}>
            <div>CAO Intelligence Dashboard</div>
            <div style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Mandal Krushi Adhikari — Rajendra Kulkarni</div>
          </div>
          <span style={{ marginLeft: 'auto', background: '#ff6b6b', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px' }}>HACKATHON 🚀</span>
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#6e7681', marginTop: '8px' }}>
          Demo Mode — No login credentials required
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
