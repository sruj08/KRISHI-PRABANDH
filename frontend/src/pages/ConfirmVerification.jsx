import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/useToast.jsx';
import Button from '../components/ui/Button';

const ConfirmVerification = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    addToast(t("Verification submitted successfully", lang), "success");
    navigate('/');
  };

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      
      {/* Progress Indicator */}
      <div className="step-indicator">
        <span className="material-symbols-outlined">check_circle</span>
        Step 3 of 3: {t("Confirm Details", lang)}
      </div>

      {/* Farmer Card */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg fw-bold mb-1">{t("Ramesh D. Kumar", lang)}</h2>
            <p className="text-sm text-muted">{t("ID: FM-88291", lang)}</p>
          </div>
          <span className="badge badge-verified">{t("Eligible", lang)}</span>
        </div>
        
        <div className="divider" />
        
        <div className="flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">{t("Scheme", lang)}</span>
            <span className="fw-bold">{t("Tractor Subsidy", lang)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">{t("Location", lang)}</span>
            <span className="fw-bold">{t("Gat No. 104/2, North Sector", lang)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">{t("Land Area", lang)}</span>
            <span className="fw-bold">{t("1.2 Hectares", lang)}</span>
          </div>
        </div>
      </div>

      {/* Map Thumbnail & Media */}
      <div className="card p-0" style={{ overflow: 'hidden' }}>
        <div style={{ height: '120px', backgroundColor: '#e0e0e0', position: 'relative' }}>
          {/* Placeholder for static map image */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-variant)' }}>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '32px' }}>satellite</span>
          </div>
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span className="badge badge-verified" style={{ backgroundColor: 'rgba(235, 247, 241, 0.9)' }}>
              {t("Geo-Tagged", lang)}
            </span>
          </div>
        </div>
        <div className="p-4 flex gap-3">
          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined text-muted">image</span>
          </div>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined text-muted">description</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label className="form-label">{t("Add Notes", lang)} {t("(Optional)", lang)}</label>
        <textarea 
          className="form-textarea" 
          placeholder={t("Enter any field observations...", lang)}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* Submit */}
      <Button variant="success" size="lg" fullWidth icon="check_circle" onClick={handleSubmit}>
        {t("SUBMIT VERIFICATION", lang)}
      </Button>

    </div>
  );
};

export default ConfirmVerification;
