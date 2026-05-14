import React, { useState } from 'react';

const OfficerSettingsTabsPage = () => {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    sms: true,
    email: false,
    push: true
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>Settings</h1>
        <p style={{ margin: 0, color: '#717972', fontSize: '0.95rem' }}>Manage your account preferences and notification settings.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Profile Section */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1c1a', marginBottom: 16, borderBottom: '1px solid #e2e9e6', paddingBottom: 8 }}>Profile Information</h2>
          <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: 8, padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#717972', marginBottom: 8 }}>Full Name</label>
              <input type="text" disabled value="Ramesh Patil" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e9e6', borderRadius: 6, background: '#f8f9f8', color: '#414943' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#717972', marginBottom: 8 }}>Role</label>
              <input type="text" disabled value="Taluka Agriculture Officer (TAO)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e9e6', borderRadius: 6, background: '#f8f9f8', color: '#414943' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#717972', marginBottom: 8 }}>Jurisdiction</label>
              <input type="text" disabled value="Baramati Taluka, Pune" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e9e6', borderRadius: 6, background: '#f8f9f8', color: '#414943' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#717972', marginBottom: 8 }}>Contact Number</label>
              <input type="text" disabled value="+91 98765 43210" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e9e6', borderRadius: 6, background: '#f8f9f8', color: '#414943' }} />
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1c1a', marginBottom: 16, borderBottom: '1px solid #e2e9e6', paddingBottom: 8 }}>Application Preferences</h2>
          <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#717972', marginBottom: 8 }}>System Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ width: '100%', maxWidth: '300px', padding: '10px 12px', border: '1px solid #e2e9e6', borderRadius: 6, background: '#fff', color: '#1a1c1a' }}
              >
                <option value="en">English</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1c1a', marginBottom: 16, borderBottom: '1px solid #e2e9e6', paddingBottom: 8 }}>Notification Settings</h2>
          <div style={{ background: '#fff', border: '1px solid #e2e9e6', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.push} 
                onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#1f4d36' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#1a1c1a', fontSize: '0.95rem' }}>In-App Alerts</div>
                <div style={{ fontSize: '0.85rem', color: '#717972' }}>Receive real-time alerts for high-risk flags and pending approvals within the portal.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.sms} 
                onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#1f4d36' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#1a1c1a', fontSize: '0.95rem' }}>SMS Notifications</div>
                <div style={{ fontSize: '0.85rem', color: '#717972' }}>Receive urgent escalations from DAO directly to your registered mobile number.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.email} 
                onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#1f4d36' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#1a1c1a', fontSize: '0.95rem' }}>Email Reports</div>
                <div style={{ fontSize: '0.85rem', color: '#717972' }}>Receive weekly digests of your taluka's operational metrics.</div>
              </div>
            </label>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button style={{ padding: '12px 24px', background: '#1f4d36', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default OfficerSettingsTabsPage;
