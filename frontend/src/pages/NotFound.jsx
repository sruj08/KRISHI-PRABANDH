import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full bg-[#f8faf9]" style={{ fontFamily: 'var(--font-body)', minHeight: '80vh' }}>
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-[#e2e8f0] max-w-md w-full">
        <span className="material-symbols-outlined text-[#a0aec0] mb-4" style={{ fontSize: '64px' }}>
          location_off
        </span>
        <h2 className="text-2xl font-bold text-[#1a202c] mb-2 tracking-tight">System Module Not Found</h2>
        <p className="text-[#718096] text-sm mb-6">
          The requested path does not exist or you do not have the required clearance to access this sector of the KrishiNetra intelligence platform.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#033621] text-white rounded-xl font-semibold hover:bg-[#022b1a] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span>
          Return to Command Center
        </button>
      </div>
    </div>
  );
};

export default NotFound;