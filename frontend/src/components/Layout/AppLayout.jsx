import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomNav from './BottomNav';
import { useSidebar } from '../../hooks/useSidebar';

const AppLayout = () => {
  const { isOpen, closeSidebar, toggleSidebar } = useSidebar();

  return (
    <div className="page-with-sidebar">
      {/* Mobile Backdrop */}
      <div 
        className={`modal-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeSidebar}
        style={{ zIndex: 39 }}
      />

      <Sidebar isOpen={isOpen} />
      
      <div className="main-content-area">
        <MobileHeader onMenuClick={toggleSidebar} />
        
        <main className="page-container">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
