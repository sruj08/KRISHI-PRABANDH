import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './MobileHeader.css';

const MobileHeader = ({ onMenuClick }) => {
  const { t } = useLanguage();

  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        <button 
          className="menu-button" 
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="mobile-header-title">{t("AgriField Gov")}</h1>
      </div>
      
      <div className="mobile-header-right">
        <button className="profile-button" aria-label="Profile">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
