import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../components/officer/officer-shell.css';
import {
  OFFICER_PROFILE,
  APPLICATION_REVIEW,
  PRIORITY_QUEUE,
} from '../../mock/officer-operations';

const urgencyColor = (u) => {
  if (u === 'critical') return '#ba1a1a';
  if (u === 'high') return '#c2410c';
  if (u === 'medium') return '#a16207';
  return '#1f4d36';
};

const SahayakDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const pendingCount = APPLICATION_REVIEW.length + PRIORITY_QUEUE.length;

  return (
    <div className="op-page" style={{ padding: '24px 32px' }}>
      {/* TOP SECTION */}
      <header style={{ marginBottom: 32, borderBottom: '1px solid #e2e9e6', paddingBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a1c1a', margin: '0 0 8px' }}>
          Welcome back, {user?.name || OFFICER_PROFILE.shortName}
        </h1>
        <div style={{ display: 'flex', gap: 16, color: '#717972', fontSize: '0.95rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
            {user?.taluka_name || OFFICER_PROFILE.taluka} Taluka
          </span>
          <span>&bull;</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
            {today}
          </span>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <div style={{ background: '#f3f4f0', padding: '12px 16px', borderRadius: 8, fontSize: '0.95rem', color: '#1a1c1a' }}>
            <strong>{pendingCount}</strong> pending items require your review today.
          </div>
          <div style={{ background: '#fff0ef', padding: '12px 16px', borderRadius: 8, fontSize: '0.95rem', color: '#ba1a1a' }}>
            <strong>2</strong> applications flagged by AI for Aadhaar mismatch.
          </div>
        </div>
      </header>

      {/* MAIN SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* TODAY'S PENDING WORK */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#414943', margin: '0 0 16px', letterSpacing: '0.03em' }}>
              TODAY'S PENDING WORK
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PRIORITY_QUEUE.slice(0, 4).map((task) => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', border: '1px solid #e2e9e6', borderRadius: 8, background: '#fff'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: urgencyColor(task.urgency) }} />
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1a1c1a' }}>{task.title}</h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#717972', paddingLeft: 16 }}>{task.detail}</p>
                  </div>
                  <button
                    onClick={() => navigate(task.path)}
                    style={{
                      padding: '8px 16px', background: '#f3f4f0', border: 'none', borderRadius: 6,
                      fontSize: '0.85rem', fontWeight: 600, color: '#1f4d36', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    {task.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT APPLICATIONS */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#414943', margin: '0 0 16px', letterSpacing: '0.03em' }}>
              RECENT APPLICATIONS
            </h2>
            <div style={{ border: '1px solid #e2e9e6', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f8f9f8', color: '#717972', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Farmer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Village</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Scheme</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {APPLICATION_REVIEW.map((app, idx) => (
                    <tr key={app.id} style={{ borderTop: idx > 0 ? '1px solid #e2e9e6' : 'none' }}>
                      <td style={{ padding: '16px', fontWeight: 500, color: '#1a1c1a' }}>{app.farmer}</td>
                      <td style={{ padding: '16px', color: '#414943' }}>{app.village}</td>
                      <td style={{ padding: '16px', color: '#414943' }}>{app.scheme}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                          background: app.priority === 'HIGH' ? '#fff0ef' : '#f3f4f0',
                          color: app.priority === 'HIGH' ? '#ba1a1a' : '#414943'
                        }}>
                          {app.stage}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => navigate('/officer/pending-surveys')}
                          style={{ color: '#1f4d36', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* QUICK ACTIONS */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#414943', margin: '0 0 16px', letterSpacing: '0.03em' }}>
              QUICK ACTIONS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => navigate('/officer/pending-surveys')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px', width: '100%',
                  background: '#1f4d36', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                  textAlign: 'left', fontWeight: 600, fontSize: '0.95rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>pending_actions</span>
                Start Survey Review
              </button>
              
              <button 
                onClick={() => navigate('/officer/ai-verification')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px', width: '100%',
                  background: '#fff', color: '#1f4d36', border: '1px solid #1f4d36', borderRadius: 8, cursor: 'pointer',
                  textAlign: 'left', fontWeight: 600, fontSize: '0.95rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>smart_toy</span>
                Open AI Verification
              </button>

              <button 
                onClick={() => navigate('/officer/farmer-registry')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px', width: '100%',
                  background: '#f3f4f0', color: '#1a1c1a', border: '1px solid #e2e9e6', borderRadius: 8, cursor: 'pointer',
                  textAlign: 'left', fontWeight: 600, fontSize: '0.95rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
                Search Farmer
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default SahayakDashboard;
