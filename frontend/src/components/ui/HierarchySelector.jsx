import React, { useState } from 'react';
import { useHierarchy } from '../../context/HierarchyContext';

const HierarchySelector = () => {
  const {
    mandals, filteredSahayaks,
    currentMandal, currentSahayak,
    setCurrentMandal, setCurrentSahayak,
  } = useHierarchy();

  const [open, setOpen] = useState(false);

  const scopeLabel = currentSahayak
    ? currentSahayak.name
    : currentMandal
      ? currentMandal.name
      : 'All Data';

  const scopeColor = currentSahayak ? '#0055A4' : currentMandal ? '#2e7d32' : '#666';
  const scopeBg   = currentSahayak ? '#e3f2fd' : currentMandal ? '#e8f5e9' : '#f5f5f5';
  const scopeIcon = currentSahayak ? 'badge'    : currentMandal ? 'location_city' : 'public';

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger chip */}
      <button
        id="hierarchy-selector-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: scopeBg, color: scopeColor,
          border: `1px solid ${scopeColor}33`, borderRadius: '20px',
          padding: '5px 12px', fontSize: '12px', fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
        aria-label="Select Mandal / Sahayak scope"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{scopeIcon}</span>
        {scopeLabel}
        <span className="material-symbols-outlined" style={{ fontSize: '14px', marginLeft: '2px' }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div
            id="hierarchy-selector-panel"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '260px', background: 'var(--surface, #fff)',
              border: '1px solid var(--outline-variant, #e0e0e0)',
              borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 50, overflow: 'hidden',
            }}
          >
            {/* Mandal section */}
            <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--outline-variant, #e0e0e0)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Your Mandal
              </div>
              {/* All option */}
              <button
                onClick={() => { setCurrentMandal(null); setCurrentSahayak(null); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', borderRadius: '8px', border: 'none',
                  background: !currentMandal ? '#e8f5e9' : 'transparent',
                  color: !currentMandal ? '#2e7d32' : 'inherit',
                  fontWeight: !currentMandal ? 700 : 400,
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                🌐 All Mandals (Unscoped)
              </button>
              {mandals.map(m => (
                <button
                  key={m.mandal_id}
                  onClick={() => { setCurrentMandal(m); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', textAlign: 'left',
                    padding: '7px 10px', borderRadius: '8px', border: 'none',
                    background: currentMandal?.mandal_id === m.mandal_id ? '#e8f5e9' : 'transparent',
                    color: currentMandal?.mandal_id === m.mandal_id ? '#2e7d32' : 'inherit',
                    fontWeight: currentMandal?.mandal_id === m.mandal_id ? 700 : 400,
                    cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2e7d32' }}>location_city</span>
                  {m.name}
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#888' }}>{m.taluka}</span>
                </button>
              ))}
            </div>

            {/* Sahayak section — only shown when mandal selected */}
            {currentMandal && (
              <div style={{ padding: '8px 16px 12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Sahayak in {currentMandal.name}
                </div>
                <button
                  onClick={() => { setCurrentSahayak(null); setOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 10px', borderRadius: '8px', border: 'none',
                    background: !currentSahayak ? '#e3f2fd' : 'transparent',
                    color: !currentSahayak ? '#0055A4' : 'inherit',
                    fontWeight: !currentSahayak ? 700 : 400,
                    cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  📊 Mandal View (All Sahayaks)
                </button>
                {filteredSahayaks.map(s => (
                  <button
                    key={s.sahayak_id}
                    onClick={() => { setCurrentSahayak(s); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', textAlign: 'left',
                      padding: '7px 10px', borderRadius: '8px', border: 'none',
                      background: currentSahayak?.sahayak_id === s.sahayak_id ? '#e3f2fd' : 'transparent',
                      color: currentSahayak?.sahayak_id === s.sahayak_id ? '#0055A4' : 'inherit',
                      fontWeight: currentSahayak?.sahayak_id === s.sahayak_id ? 700 : 400,
                      cursor: 'pointer', fontSize: '13px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0055A4' }}>badge</span>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HierarchySelector;
