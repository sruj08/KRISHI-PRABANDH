import React, { useEffect, useState } from 'react';
import { t } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

const CircularGauge = ({ value, label, subtext, color, isCurrency = false }) => {
  const { lang } = useLanguage();
  const [offset, setOffset] = useState(251.2); // Circumference of r=40
  
  useEffect(() => {
    // Animate progress on mount
    const timer = setTimeout(() => {
      const newOffset = 251.2 - (251.2 * (value > 100 ? 100 : value) / 100);
      setOffset(newOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-4">
      {isCurrency ? (
        <div className="ticker-box">
          <span className="currency">₹</span>
          <span>{value.toLocaleString('en-IN')}</span>
        </div>
      ) : (
        <div className="circular-progress">
          <svg viewBox="0 0 100 100">
            <circle className="bg-track" cx="50" cy="50" r="40" />
            <circle 
              className="progress-track" 
              cx="50" cy="50" r="40" 
              strokeDasharray="251.2" 
              strokeDashoffset={offset}
              stroke={color}
            />
          </svg>
          <div className="gauge-value">
            {value}<span>%</span>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-sm fw-bold mb-1" style={{ margin: 0 }}>{t(label, lang)}</h3>
        <p className="text-xs text-muted" style={{ margin: 0 }}>{t(subtext, lang)}</p>
      </div>
    </div>
  );
};

export default CircularGauge;
