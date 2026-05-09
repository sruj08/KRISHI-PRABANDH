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
    else if (role === 'tao') navigate('/tao');
    else if (role === 'district') navigate('/district');
    else navigate('/survey');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-body">
      
      {/* Branding Header */}
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 w-16 h-16 bg-primary flex items-center justify-center rounded-sm">
          <span className="material-symbols-outlined text-white text-3xl">radar</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-widest uppercase mb-2">
          Krishi-Prabandh
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">
          Govt. of Maharashtra — Geo-Spatial Intelligence Node
        </p>
      </div>

      {/* Login Options Container */}
      <div className="w-full max-w-md flex flex-col gap-4">
        
        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 border-b border-gray-300 pb-2">
          Secure Access Portal
        </div>

        {[
          { id: 'farmer', icon: 'person', title: 'Field Initiator', sub: 'Role: Farmer (R. Kamble)' },
          { id: 'officer', icon: 'badge', title: 'Survey Operator', sub: 'Role: Krishi Sahayak (Field Officer)' },
          { id: 'cao', icon: 'admin_panel_settings', title: 'Command Level 2', sub: 'Role: Mandal Adhikari (CAO)' },
          { id: 'tao', icon: 'account_balance', title: 'Taluka Command', sub: 'Role: Taluka Agriculture Officer (TAO)' },
          { id: 'district', icon: 'language', title: 'Executive Command', sub: 'Role: District Authority (DAO)' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleLogin(btn.id)}
            className="w-full bg-white border border-gray-300 p-4 flex items-center gap-4 hover:border-primary hover:bg-primary/5 transition-none rounded-sm group text-left shadow-sm"
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${btn.id === 'officer' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white'}`}>
              <span className="material-symbols-outlined">{btn.icon}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 uppercase tracking-wider">{btn.title}</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">{btn.sub}</div>
            </div>
          </button>
        ))}

        <div className="mt-8 text-center text-[10px] font-mono text-gray-500 border-t border-gray-300 pt-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          SYSTEM STATUS: ONLINE • UNCLASSIFIED OPERATIONS ONLY
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
