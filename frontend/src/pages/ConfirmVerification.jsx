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
    addToast("Verification submitted successfully", "success");
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
            <h2 className="text-lg fw-bold mb-1">Ramesh D. Kumar</h2>
            <p className="text-sm text-muted">ID: FM-88291</p>
          </div>
          <span className="badge badge-verified">Eligible</span>
        </div>
        
        <div className="divider" />
        
        <div className="flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Scheme</span>
            <span className="fw-bold">Tractor Subsidy</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Location</span>
            <span className="fw-bold">Gat No. 104/2, North Sector</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Land Area</span>
            <span className="fw-bold">1.2 Hectares</span>
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
              Geo-Tagged
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
        <label className="form-label">{t("Add Notes", lang)} (Optional)</label>
        <textarea 
          className="form-textarea" 
          placeholder="Enter any field observations..."
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
