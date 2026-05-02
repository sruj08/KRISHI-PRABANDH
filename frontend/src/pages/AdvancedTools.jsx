import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/useToast.jsx';
import CircularGauge from '../components/ui/CircularGauge';
import FarmerCard from '../components/ui/FarmerCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdvancedTools = () => {
  const { t, lang } = useLanguage();
  const { addToast } = useToast();
  
  const [grSummary, setGrSummary] = useState(null);
  const [frictionModalOpen, setFrictionModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    setGrSummary({
      scheme: 'New Scheme',
      quota: '35% for ST Women Farmers',
      eligibility: '< 1 Hectare',
      risk: 'High-risk drought zone'
    });
    addToast('GR Parsed Successfully', 'success');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFrictionModal = (farmerName) => {
    setSelectedFarmer(farmerName);
    setSelectedTags([]);
    setFrictionModalOpen(true);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const submitFriction = () => {
    if (selectedTags.length === 0) {
      addToast('Please select at least one reason', 'warning');
      return;
    }
    setFrictionModalOpen(false);
    addToast(`Friction logged for ${selectedFarmer}`, 'success');
  };

  const chartData = {
    labels: ['Margin Money', 'Missing 7/12', 'No Bank Account', 'Land Dispute'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#0055A4', '#FF9933', '#2D6A4F', '#ba1a1a'],
      borderWidth: 0,
    }]
  };

  const position = [18.5204, 73.8567]; // Pune

  return (
    <div className="flex-col gap-6 animate-fade-in mb-8">
      
      {/* 1. District Impact Pulse */}
      <section>
        <h2 className="section-title">{t("District Impact Pulse", lang)}</h2>
        <div className="glass-panel" style={{ display: 'flex', overflowX: 'auto', gap: 'var(--sp-6)', paddingBottom: 'var(--sp-2)' }}>
          <CircularGauge value={85} label="Equity Index" subtext="SC/ST/Women Funds" color="var(--primary)" />
          <CircularGauge value={92} label="Purified Queue" subtext="AI Scrutinized" color="var(--success)" />
          <CircularGauge value={4250000} label="Wealth Delivered" subtext="Subsidies this Month" isCurrency />
        </div>
      </section>

      {/* 2. Smart GR Parser */}
      <section>
        <h2 className="section-title">{t("Smart GR Parser", lang)}</h2>
        {!grSummary ? (
          <div className="drag-drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
            <span className="material-symbols-outlined drag-icon">upload_file</span>
            <p>{t("Drag & Drop new GR here", lang)}</p>
            <span>{t("or click to browse", lang)}</span>
          </div>
        ) : (
          <div className="gr-summary-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="fw-bold text-md text-success-dark">{t("New Scheme", lang)}: ST Women Tractor Subsidy</h3>
              <button className="btn-icon" onClick={() => setGrSummary(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <ul className="gr-detail-list">
              <li className="gr-detail-item">
                <span className="material-symbols-outlined">pie_chart</span>
                <div>
                  <strong>{t("Reserved Quota:", lang)}</strong> {t("35% for ST Women Farmers", lang)}
                </div>
              </li>
              <li className="gr-detail-item">
                <span className="material-symbols-outlined">rule</span>
                <div>
                  <strong>{t("Eligibility:", lang)}</strong> {t("< 1 Hectare", lang)}
                </div>
              </li>
              <li className="gr-detail-item">
                <span className="material-symbols-outlined">warning</span>
                <div>
                  <strong>{t("Risk Profile:", lang)}</strong> {t("High-risk drought zone", lang)}
                </div>
              </li>
            </ul>
            <Button variant="primary" fullWidth className="mt-4" icon="radar">
              {t("Scan Village for Eligible Beneficiaries", lang)}
            </Button>
          </div>
        )}
      </section>

      {/* 3. Proactive Inclusion Radar */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="section-title" style={{ margin: 0 }}>{t("Proactive Inclusion Radar", lang)}</h2>
          <Button variant="outline" size="sm" icon="notifications">
            {t("Mass Notify", lang)}
          </Button>
        </div>
        <div className="flex-col gap-3">
          <FarmerCard name="Sumanbai Pawar" gat="45/2" caste="ST (Women)" onLogFriction={() => openFrictionModal("Sumanbai Pawar")} />
          <FarmerCard name="Raju Bhil" gat="112" caste="ST" onLogFriction={() => openFrictionModal("Raju Bhil")} />
          <FarmerCard name="Kondiba Munde" gat="89" caste="SC" onLogFriction={() => openFrictionModal("Kondiba Munde")} />
        </div>
      </section>

      {/* 4. Geo-Verified Field Ops */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="section-title" style={{ margin: 0 }}>{t("Geo-Verified Field Ops", lang)}</h2>
          <span className="badge badge-verified">{t("Smart Audit", lang)}</span>
        </div>
        <div className="leaflet-map-container" style={{ position: 'relative' }}>
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup>Farm Location</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="map-action-panel mt-3">
          <h3>{t("Select a farm pin", lang)}</h3>
          <p>{t("Complete Verification", lang)}</p>
          <Button variant="primary" fullWidth disabled>
            {t("Complete Verification", lang)} (Locked)
          </Button>
        </div>
      </section>

      {/* 5. Policy Friction Analytics */}
      <section>
        <h2 className="section-title">{t("Policy Friction Analytics", lang)}</h2>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="badge badge-grey">{t("District Level", lang)}</span>
          </div>
          <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
          <div className="insight-box mt-4">
            <span className="material-symbols-outlined">lightbulb</span>
            <div>
              <strong>{t("Insight:", lang)}</strong> 70% of ST farmers in Shirur are not applying because they lack 'Margin Money'.
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal isOpen={frictionModalOpen} onClose={() => setFrictionModalOpen(false)} title={`${t("Log Friction", lang)}`}>
        <p className="text-sm text-muted mb-4">
          {t("Why is this farmer unable to participate?", lang)} ({selectedFarmer})
        </p>
        <div className="friction-tags">
          {['Margin Money Too High', 'Missing 7/12', 'No Bank Account', 'Family Land Dispute'].map(tag => (
            <span 
              key={tag} 
              className={`friction-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {t(tag, lang)}
            </span>
          ))}
        </div>
        <Button variant="primary" fullWidth onClick={submitFriction}>
          {t("Submit Friction Log", lang)}
        </Button>
      </Modal>

    </div>
  );
};

export default AdvancedTools;
