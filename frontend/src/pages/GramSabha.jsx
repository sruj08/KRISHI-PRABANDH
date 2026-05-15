import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
const VILLAGES_LIST = ['Shirur', 'Pabal', 'Wagholi', 'Lohegaon', 'Kharadi', 'Kesnand'];
const SESSION_TYPES = [
  'Drip Irrigation Awareness Sabha',
  'PM-KUSUM Solar Pump Yojana',
  'Crop Insurance (PMFBY) Guidance',
  'Seed Subsidy Registration',
  'Soil Health Card Distribution',
  'Women Farmer Empowerment Camp',
];

const INTAKE_NUMBER = '020-2794-8800';
const CATEGORY_COLORS = {
  'Open': { bg: '#e8f0fb', color: '#0055A4' },
  'OBC':  { bg: '#fff3e0', color: '#e07800' },
  'SC':   { bg: '#fce4ec', color: '#c62828' },
  'ST':   { bg: '#e8f5e9', color: '#2e7d32' },
};

const GramSabha = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // setup | live | report
  const [village, setVillage] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [intake, setIntake] = useState('qr');
  const [attendees, setAttendees] = useState([]);
  const [manualEmail, setManualEmail] = useState('');
  const [manualMsg, setManualMsg] = useState('');
  const [sessionTime] = useState(new Date());

  const addFarmer = (farmer, method) => {
    setAttendees(prev => {
      if (prev.find(a => a.email === farmer.email)) return prev;
      return [...prev, {
        ...farmer,
        method,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }];
    });
  };

  const handleManualLookup = () => {
    const email = manualEmail.trim();
    if (!email) return;
    const local = email.split('@')[0] || 'farmer';
    const name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    addFarmer(
      {
        name,
        email,
        category: 'Open',
        village: village || '-',
      },
      'manual',
    );
    setManualEmail('');
    setManualMsg(`✅ Added ${name} (demo - no database)`);
    setTimeout(() => setManualMsg(''), 4000);
  };

  // Demographics
  const demog = attendees.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});
  const marginalised = (demog['SC'] || 0) + (demog['ST'] || 0);
  const margPct = attendees.length ? Math.round((marginalised / attendees.length) * 100) : 0;

  const handlePrint = () => window.print();

  // QR URL (mock session URL)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`https://krishiprabandh.maha.gov.in/attend?v=${encodeURIComponent(village)}&s=${Date.now()}`)}`;

  if (step === 'setup') return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-lowest)' }}>
      <header style={{ padding: 'var(--sp-4)', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold' }}>{t('Gram Sabha Attendance', lang)}</h1>
          <p style={{ fontSize: '12px', opacity: 0.85, margin: 0 }}>{t('Digital Muster - Dual Intake System', lang)}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/officer')}>{t('← Back', lang)}</button>
      </header>
      <main style={{ padding: 'var(--sp-6)', maxWidth: '520px', margin: '0 auto' }}>
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: 'var(--sp-5)', color: 'var(--success-dark)' }}>
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 8 }}>groups</span>
            {t('Setup New Session', lang)}
          </h2>
          <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
            <label className="form-label">{t('Village / Gram Panchayat', lang)}</label>
            <select className="form-select" value={village} onChange={e => setVillage(e.target.value)}>
              <option value="">{t('Select village...', lang)}</option>
              {VILLAGES_LIST.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
            <label className="form-label">{t('Session Type', lang)}</label>
            <select className="form-select" value={sessionType} onChange={e => setSessionType(e.target.value)}>
              <option value="">{t('Select session...', lang)}</option>
              {SESSION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
            <label className="form-label">{t('Primary Intake Method', lang)}</label>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
              {['qr', 'both'].map(m => (
                <div key={m} onClick={() => setIntake(m)}
                  style={{ flex: 1, padding: 'var(--sp-3)', border: `2px solid ${intake === m ? 'var(--primary)' : 'var(--outline-variant)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', backgroundColor: intake === m ? 'var(--primary-light)' : 'white', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: intake === m ? 'var(--primary)' : 'var(--text-muted)', fontSize: '28px', display: 'block', marginBottom: 4 }}>
                    {m === 'qr' ? 'qr_code_2' : 'call'}
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: intake === m ? 'var(--primary)' : 'var(--text-dark)' }}>
                    {m === 'qr' ? t('QR Code Only', lang) : t('QR + Missed Call', lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-success btn-full" disabled={!village || !sessionType}
            onClick={() => setStep('live')} style={{ height: '52px', fontSize: '16px' }}>
            <span className="material-symbols-outlined">play_circle</span>
            {t('Start Gram Sabha', lang)}
          </button>
        </div>
      </main>
    </div>
  );

  if (step === 'live') return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-lowest)' }}>
      <header style={{ padding: 'var(--sp-3) var(--sp-5)', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '17px', margin: 0, fontWeight: 'bold' }}>{sessionType}</h1>
          <p style={{ fontSize: '12px', opacity: 0.85, margin: 0 }}>
            📍 {village} &nbsp;·&nbsp; {sessionTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          <span className="badge badge-verified" style={{ fontSize: '14px', padding: '6px 14px' }}>{attendees.length} {t('Attendees', lang)}</span>
          <button className="btn btn-error btn-sm" onClick={() => setStep('report')}>
            <span className="material-symbols-outlined">stop_circle</span>
            {t('End Session', lang)}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 'var(--sp-5)', padding: 'var(--sp-5)', minHeight: 'calc(100vh - 66px)' }}>
        {/* Left: Intake Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* QR Code Card */}
          <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>qr_code_2</span>
              <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--primary)' }}>{t('Intake A - Smartphone Users', lang)}</h3>
            </div>
            <img src={qrUrl} alt="Attendance QR Code"
              style={{ width: '220px', height: '220px', borderRadius: 'var(--radius)', border: '4px solid var(--primary-light)', margin: '0 auto' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--sp-3)' }}>
              {t('Farmers scan to auto-register via WhatsApp Bot', lang)}
            </p>
          </div>

          {/* Missed Call Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--amber)', padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--accent)' }}>phone_callback</span>
              <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--accent-dark)' }}>{t('Intake B - Feature Phones', lang)}</h3>
            </div>
            <div style={{ backgroundColor: 'var(--amber-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-3)', textAlign: 'center', margin: '0 0 var(--sp-3)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>{t('No Smartphone? Give a missed call to', lang)}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--on-amber)', letterSpacing: '1px' }}>{INTAKE_NUMBER}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{t('Zero cost • Auto-logged by Caller ID', lang)}</div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {t('Call drops automatically. Backend matches Caller ID to AgriStack farmer profile.', lang)}
            </p>
          </div>

          {/* Manual Entry */}
          <div className="card" style={{ padding: 'var(--sp-4)' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_search</span>
              {t('Manual Lookup', lang)}
            </h3>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <input className="form-input" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                placeholder={t('Enter farmer email...', lang)} style={{ flex: 1, padding: '10px 12px' }} />
              <button className="btn btn-primary" onClick={handleManualLookup}>
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
            {manualMsg && (
              <p style={{ fontSize: '12px', marginTop: 'var(--sp-2)', color: manualMsg.startsWith('✅') ? 'var(--success)' : 'var(--amber)', fontWeight: 600 }}>
                {manualMsg}
              </p>
            )}
          </div>
        </div>

        {/* Right: Live Attendance List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px' }}>{t('Live Attendance Roll', lang)}</h3>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              {Object.entries(demog).map(([cat, count]) => (
                <span key={cat} style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 'bold', backgroundColor: CATEGORY_COLORS[cat]?.bg, color: CATEGORY_COLORS[cat]?.color }}>
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>
          {attendees.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>groups</span>
              <p>{t('Waiting for farmers to join...', lang)}</p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {[...attendees].reverse().map((a, i) => (
                <div key={a.email || a.id} style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: i === 0 ? 'slideUp 0.3s ease' : 'none', backgroundColor: i === 0 ? 'var(--primary-light)' : 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: CATEGORY_COLORS[a.category]?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: CATEGORY_COLORS[a.category]?.color, flexShrink: 0 }}>
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{a.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {a.id} · {a.scheme}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 'bold', backgroundColor: CATEGORY_COLORS[a.category]?.bg, color: CATEGORY_COLORS[a.category]?.color }}>
                      {a.category}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{a.method === 'Missed Call' ? 'call' : 'qr_code'}</span>
                      {a.method} · {a.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Report step
  const qrCount = attendees.filter(a => a.method === 'QR Scan').length;
  const callCount = attendees.filter(a => a.method === 'Missed Call').length;
  const alertNeeded = margPct < 20 && attendees.length >= 10;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-lowest)' }}>
      <header className="no-print" style={{ padding: 'var(--sp-3) var(--sp-5)', backgroundColor: 'var(--success-dark)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '17px', margin: 0, fontWeight: 'bold' }}>{t('Session Complete - Report Generated', lang)}</h1>
          <p style={{ fontSize: '12px', opacity: 0.85, margin: 0 }}>{attendees.length} {t('verified attendees', lang)} · {village}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/officer')}>{t('← Dashboard', lang)}</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <span className="material-symbols-outlined">print</span>
            {t('Print / Download PDF', lang)}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'var(--sp-6)' }}>
        {/* Governance Alert */}
        {alertNeeded && (
          <div className="no-print" style={{ backgroundColor: '#fff3e0', border: '1px solid var(--amber)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--amber)', fontSize: '28px', flexShrink: 0 }}>warning</span>
            <div>
              <strong style={{ color: 'var(--on-amber)', display: 'block', marginBottom: 4 }}>{t('⚠️ Governance Intelligence Alert', lang)}</strong>
              <span style={{ fontSize: '14px', color: 'var(--text-dark)' }}>
                {t('Your session in', lang)} <strong>{village}</strong> {t('had', lang)} <strong>{attendees.length}</strong> {t('attendees, but only', lang)} <strong>{margPct}%</strong> {t('were SC/ST', lang)} ({marginalised} {t('persons', lang)}).
                {t('Government mandate requires 20% marginalized community outreach. Please schedule a targeted session for this circle.', lang)}
              </span>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
          {[
            { label: t('Total Attendees', lang), value: attendees.length, icon: 'groups', color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: t('QR Scan', lang), value: qrCount, icon: 'qr_code', color: 'var(--success)', bg: 'var(--success-light)' },
            { label: t('Missed Call', lang), value: callCount, icon: 'call', color: 'var(--accent-dark)', bg: 'var(--accent-light)' },
            { label: t('SC/ST Coverage', lang), value: `${margPct}%`, icon: 'diversity_3', color: margPct >= 20 ? 'var(--success)' : 'var(--error)', bg: margPct >= 20 ? 'var(--success-light)' : 'var(--error-light)' },
          ].map((k, i) => (
            <div key={i} style={{ backgroundColor: 'white', border: '1px solid var(--outline-variant)', borderLeft: `4px solid ${k.color}`, borderRadius: 'var(--radius)', padding: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', boxShadow: 'var(--shadow-sm)' }}>
              <span className="material-symbols-outlined" style={{ color: k.color, fontSize: '28px', backgroundColor: k.bg, padding: '8px', borderRadius: '50%' }}>{k.icon}</span>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: k.color, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* --- OFFICIAL DOCUMENT (Printable) --- */}
        <div className="card" style={{ padding: 'var(--sp-8)', border: '2px solid var(--outline-variant)' }} id="printable-report">
          {/* Official Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--text-dark)', paddingBottom: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>महाराष्ट्र शासन - कृषी विभाग</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-dark)' }}>{t('Government of Maharashtra - Agriculture Department', lang)}</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary)', marginTop: 8 }}>{t('Digital Gram Sabha Attendance Register', lang)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{t('System Generated · No Physical Signature Required · AgriStack Verified', lang)}</div>
          </div>

          {/* Session Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3) var(--sp-6)', marginBottom: 'var(--sp-6)', padding: 'var(--sp-4)', backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius)' }}>
            {[
              [t('Date', lang), sessionTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
              [t('Time', lang), sessionTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })],
              [t('Location', lang), t('Gram Panchayat Office', lang) + `, ${village}`],
              [t('Officer', lang), t('Krishi Sahayak Ramesh Patil', lang)],
              [t('Session', lang), sessionType],
              [t('Mandate No.', lang), `KP/GS/${new Date().getFullYear()}/${String(Math.floor(Math.random()*9000)+1000)}`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: 'var(--sp-2)', fontSize: '13px', borderBottom: '1px dashed var(--outline-variant)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>{label}:</span>
                <strong style={{ color: 'var(--text-dark)' }}>{val}</strong>
              </div>
            ))}
          </div>

          {/* Attendance Table */}
          <h3 style={{ fontSize: '15px', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined">checklist</span>
            {t('Verified Attendees', lang)} ({attendees.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                {[t('#', lang), t('Farmer Name', lang), t('MahaDBT ID', lang), t('Category', lang), t('Scheme', lang), t('Method', lang), t('Time', lang)].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendees.map((a, i) => (
                <tr key={a.email || a.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : 'var(--surface-low)', borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{a.name}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{a.id}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '11px', fontWeight: 'bold', backgroundColor: CATEGORY_COLORS[a.category]?.bg, color: CATEGORY_COLORS[a.category]?.color }}>
                      {a.category}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>{a.scheme}</td>
                  <td style={{ padding: '8px 10px', fontSize: '12px' }}>{a.method}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ marginTop: 'var(--sp-8)', paddingTop: 'var(--sp-4)', borderTop: '2px solid var(--text-dark)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div>{t('Generated', lang)}: {new Date().toLocaleString('en-IN')} · Krishi Prabandh v2.0</div>
            <div>{t('SC/ST Coverage', lang)}: {margPct}% · {t('QR', lang)}: {qrCount} · {t('Missed Call', lang)}: {callCount}</div>
            <div>{t('Digitally Verified · AgriStack Reference', lang)}: KP-{Date.now().toString().slice(-8)}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          header { display: none !important; }
          body { background: white !important; }
          #printable-report { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  );
};

export default GramSabha;
