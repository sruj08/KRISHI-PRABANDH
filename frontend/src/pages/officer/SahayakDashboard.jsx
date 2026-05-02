import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import StatCard from '../../components/ui/StatCard';
import TaskItem from '../../components/ui/TaskItem';
import CircularGauge from '../../components/ui/CircularGauge';
import { applicationsData } from '../../data/applications';

const Dashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex-col gap-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <section>
        <h2 className="text-xl fw-bold text-success-dark">
          {t("Good Morning, Sahayak Krushi Adhikari Ramesh Patil", lang)}
        </h2>
        <p className="text-muted mt-1">{t("Assigned: 5 Villages", lang)}</p>
      </section>

      {/* Quick Action Grid */}
      <section className="quick-action-grid">
        <div className="quick-action-btn" onClick={() => navigate('/capture-photo')}>
          <div className="quick-action-icon blue">
            <span className="material-symbols-outlined">add_a_photo</span>
          </div>
          <span className="quick-action-label">{t("Upload Photo", lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => navigate('/applications')}>
          <div className="quick-action-icon amber">
            <span className="material-symbols-outlined">post_add</span>
          </div>
          <span className="quick-action-label">{t("New App", lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => navigate('/advanced-tools')}>
          <div className="quick-action-icon green">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <span className="quick-action-label">{t("Eligible Farmers", lang)}</span>
        </div>
        <div className="quick-action-btn" onClick={() => navigate('/visit-planner')}>
          <div className="quick-action-icon rose">
            <span className="material-symbols-outlined">directions_car</span>
          </div>
          <span className="quick-action-label">{t("Today's Visits", lang)}</span>
        </div>
      </section>

      {/* Overview Stats */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t("Overview", lang)}</h3>
        </div>
        <div className="flex-col gap-3">
          <StatCard 
            icon="pending_actions" 
            label="Pending Apps" 
            count="12" 
            variant="amber" 
            onClick={() => navigate('/applications')}
          />
          <StatCard 
            icon="verified_user" 
            label="Verified Today" 
            count="5" 
            variant="success" 
          />
          <StatCard 
            icon="warning" 
            label="Fraud Alerts" 
            count="2" 
            variant="error" 
            onClick={() => navigate('/fraud-alerts')}
          />
        </div>
      </section>

      {/* District Impact Pulse Mini */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t("District Impact Pulse", lang)}</h3>
          <button className="btn btn-outline btn-sm text-primary" onClick={() => navigate('/advanced-tools')}>
            {t("Full View", lang)}
          </button>
        </div>
        <div className="glass-panel">
          <div style={{ display: 'flex', overflowX: 'auto', gap: 'var(--sp-6)', paddingBottom: 'var(--sp-2)' }}>
            <CircularGauge value={85} label="Equity Index" subtext="SC/ST/Women Funds" color="var(--primary)" />
            <CircularGauge value={92} label="Purified Queue" subtext="AI Scrutinized" color="var(--success)" />
            <CircularGauge value={4250000} label="Wealth Delivered" subtext="Subsidies this Month" isCurrency />
          </div>
        </div>
      </section>

      {/* Eligible Farmers (Simulated) */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ margin: 0 }}>{t("Eligible Farmers (Simulated)", lang)}</h3>
          <button className="text-primary fw-bold text-sm bg-transparent border-none" onClick={() => navigate('/advanced-tools')}>
            {t("View All", lang)}
          </button>
        </div>
        <div className="flex-col gap-2">
          {(() => {
            const eligibleApps = applicationsData.filter(app => app.status === 'Applied' || app.status === 'Under Scrutiny');
            const grouped = [];
            const seen = new Set();
            for (const app of eligibleApps) {
              if (!seen.has(app.farmer_id)) {
                seen.add(app.farmer_id);
                grouped.push(app);
              }
              if (grouped.length >= 8) break;
            }
            if (grouped.length === 0) {
              return <div className="text-center text-muted p-4">No eligible farmers found.</div>;
            }
            return grouped.map((app, index) => (
              <TaskItem 
                key={index}
                icon="person"
                title={app.farmer_id || "Unknown Farmer"}
                subtitle={`${app.component || 'Unknown Component'} • ${app.scheme_name || 'Unknown Scheme'}`}
                time={app.remarks || "No remarks"}
                iconColor="primary"
                onClick={() => navigate('/advanced-tools')}
              />
            ));
          })()}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
