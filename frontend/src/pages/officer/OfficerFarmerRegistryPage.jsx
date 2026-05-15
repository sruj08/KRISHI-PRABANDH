import React, { useMemo, useState } from 'react';
import { FARMER_REGISTRY } from '../../mock/officer-operations';

const OfficerFarmerRegistryPage = () => {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    let list = FARMER_REGISTRY;
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (f) =>
          (f.name || '').toLowerCase().includes(s) ||
          (f.aadhaarLast4 || '').includes(s) ||
          (f.mobile || '').includes(s) ||
          (f.surveyNo || '').toLowerCase().includes(s) ||
          (f.village || '').toLowerCase().includes(s) ||
          (f.appId || '').toLowerCase().includes(s),
      );
    }
    return list;
  }, [q]);

  return (
    <div style={{ padding: '24px 32px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>Farmer Registry</h1>
        <p style={{ margin: 0, color: '#717972', fontSize: '0.95rem' }}>Search and review farmer profiles across your Taluka.</p>
      </header>

      <div style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: '600px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9eaa9f' }}>search</span>
          <input
            placeholder="Search by Name, Aadhaar, Mobile, Survey Number..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 16px 14px 48px', fontSize: '1rem', 
              border: '1px solid #e2e9e6', borderRadius: '8px', outline: 'none' 
            }}
          />
        </div>
      </div>

      <div style={{ border: '1px solid #e2e9e6', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: '#f8f9f8', color: '#717972', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Farmer</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Village</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Schemes</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Verification Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f, idx) => (
              <tr 
                key={f.id} 
                onClick={() => setSelected(f)}
                style={{ 
                  borderTop: idx > 0 ? '1px solid #e2e9e6' : 'none', 
                  cursor: 'pointer', transition: 'background 0.2s',
                  background: selected?.id === f.id ? '#f3f4f0' : 'transparent'
                }}
                onMouseOver={(e) => { if (selected?.id !== f.id) e.currentTarget.style.background = '#fcfdfc'; }}
                onMouseOut={(e) => { if (selected?.id !== f.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#1a1c1a' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#717972', marginTop: 4 }}>ID: {f.id}</div>
                </td>
                <td style={{ padding: '16px', color: '#414943' }}>{f.village}</td>
                <td style={{ padding: '16px', color: '#414943' }}>{f.schemes}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: (f.verification || '').includes('Pending') ? '#fff0ef' : '#eef0eb',
                    color: (f.verification || '').includes('Pending') ? '#ba1a1a' : '#414943'
                  }}>
                    {f.verification}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#9eaa9f' }}>
                  No farmers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1200, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelected(null)}>
          <aside 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '400px', background: '#fff', height: '100%', padding: '32px', 
              boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', overflowY: 'auto' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 4px' }}>{selected.name}</h2>
                <div style={{ color: '#717972', fontSize: '0.9rem' }}>{selected.village} &bull; {selected.id}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <span className="material-symbols-outlined" style={{ color: '#9eaa9f', fontSize: 24 }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Land Details</h3>
                <div style={{ background: '#f8f9f8', padding: '16px', borderRadius: '8px', fontSize: '0.95rem', color: '#1a1c1a', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#717972' }}>Total Area</span> <strong>{selected.landHa} ha</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#717972' }}>Survey Number</span> <strong>{selected.surveyNo}</strong></div>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Application History</h3>
                <div style={{ background: '#f8f9f8', padding: '16px', borderRadius: '8px', fontSize: '0.95rem', color: '#1a1c1a', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#717972' }}>Last App ID</span> <strong>{selected.appId}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#717972' }}>Active Schemes</span> <strong>{selected.schemes}</strong></div>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9eaa9f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Identity Documents</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#f8f9f8', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#1f4d36', marginBottom: 8 }}>badge</span>
                    <div style={{ fontSize: '0.85rem', color: '#414943', fontWeight: 600 }}>Aadhaar</div>
                    <div style={{ fontSize: '0.75rem', color: '#717972' }}>{selected.aadhaarLast4}</div>
                  </div>
                  <div style={{ background: '#f8f9f8', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#1f4d36', marginBottom: 8 }}>smartphone</span>
                    <div style={{ fontSize: '0.85rem', color: '#414943', fontWeight: 600 }}>Mobile</div>
                    <div style={{ fontSize: '0.75rem', color: '#717972' }}>{selected.mobile}</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div style={{ marginTop: '40px' }}>
              <button style={{ width: '100%', padding: '14px', background: '#1f4d36', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                Open Full Profile
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default OfficerFarmerRegistryPage;
