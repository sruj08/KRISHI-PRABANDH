import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ToastContainer from './components/ui/Toast';
import { useAuth } from './context/AuthContext';
import { HierarchyProvider } from './context/HierarchyContext';

import Applications from './pages/Applications';
import CapturePhoto from './pages/CapturePhoto';
import ConfirmVerification from './pages/ConfirmVerification';
import FraudAlerts from './pages/FraudAlerts';
import SelectTask from './pages/SelectTask';
import LandingPage from './pages/gate/LandingPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import SurveyOperationsDashboard from './features/survey_operations/SurveyOperationsDashboard';
import MandalDashboard from './pages/officer/MandalDashboard';
import CAODashboard from './pages/cao/CAODashboard';
import TAODashboard from './pages/tao/TAODashboard';
import DistrictDashboard from './pages/district/DistrictDashboard';
import AdvancedTools from './pages/AdvancedTools';
import VisitPlanner from './pages/VisitPlanner';
import Placeholder from './pages/Placeholder';
import NotFound from './pages/NotFound';
import SahayakDashboard from './pages/officer/SahayakDashboard';
import GramSabha from './pages/GramSabha';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'farmer') return <Navigate to="/farmer" replace />;
  if (user?.role === 'cao')    return <Navigate to="/cao" replace />;
  if (user?.role === 'tao')    return <Navigate to="/tao" replace />;
  if (user?.role === 'district') return <Navigate to="/district" replace />;
  return <Navigate to="/officer" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer />
      <HierarchyProvider>
        <Routes>
          <Route path="/gate" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LandingPage />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/cao" element={<CAODashboard />} />
            <Route path="/district" element={<DistrictDashboard />} />
            <Route path="/officer" element={<SahayakDashboard />} />
            <Route path="/survey" element={<SurveyOperationsDashboard />} />
            <Route path="/tao" element={<TAODashboard />} />
            <Route path="/mandal" element={<MandalDashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/capture-photo" element={<CapturePhoto />} />
            <Route path="/confirm-verification" element={<ConfirmVerification />} />
            <Route path="/fraud-alerts" element={<FraudAlerts />} />
            <Route path="/select-task" element={<SelectTask />} />
            <Route path="/advanced-tools" element={<AdvancedTools />} />
            <Route path="/visit-planner" element={<VisitPlanner />} />
            <Route path="/gram-sabha" element={<GramSabha />} />

            {/* Placeholder Routes for Sidebar Items */}
            <Route path="/map" element={<Placeholder title="Village Map" icon="map" sections={[{ title: 'Live Field Operations', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} />} />
            <Route path="/farmers" element={<Placeholder title="Farmer Registry" icon="groups" sections={[{ title: 'Registered Farmers', type: 'table' }, { title: 'Registration Analytics', type: 'cards' }]} />} />
            
            <Route path="/verification" element={
              <Placeholder 
                title="Field Verification" 
                icon="verified_user" 
                tabs={['Visits', 'Geo-tagged Photos', 'AI Verification', 'Pending Checks']}
                sections={[{ title: 'Scheduled Visits', type: 'table' }, { title: 'Coverage Metrics', type: 'cards' }]} 
              />
            } />
            <Route path="/damage" element={
              <Placeholder 
                title="Damage Reports" 
                icon="warning" 
                tabs={['Drought', 'Flood', 'Pest', 'Compensation']}
                sections={[{ title: 'Severity Reports', type: 'cards' }, { title: 'Affected Regions', type: 'table' }]} 
              />
            } />
            <Route path="/applications" element={
              <Placeholder 
                title="Applications" 
                icon="article" 
                tabs={['Pending', 'Approved', 'Rejected', 'Payment Status']}
                sections={[{ title: 'Disbursement Status', type: 'cards' }, { title: 'Recent Queries', type: 'table' }]} 
              />
            } />
            <Route path="/eligibility" element={<Placeholder title="Eligible Farmers" icon="fact_check" sections={[{ title: 'Eligibility Rules Engine', type: 'cards' }, { title: 'Pending Review', type: 'table' }]} />} />
            <Route path="/health" element={<Placeholder title="Crop Health" icon="eco" sections={[{ title: 'NDVI Indices', type: 'cards' }, { title: 'High Stress Zones', type: 'table' }]} />} />
            <Route path="/alerts" element={
              <Placeholder 
                title="Alerts & Rainfall" 
                icon="notifications_active" 
                tabs={['Anomalies', 'Deficit Warnings', 'Station Data']}
                sections={[{ title: 'Critical Alerts', type: 'list' }, { title: 'Rainfall Metrics', type: 'cards' }]} 
              />
            } />
            <Route path="/grievances" element={<Placeholder title="Grievances" icon="gavel" sections={[{ title: 'Open Tickets', type: 'table' }, { title: 'Resolution Metrics', type: 'cards' }]} />} />
            <Route path="/reports" element={<Placeholder title="Reports" icon="description" tabs={['Village Reports', 'Audit Logs', 'SOPs']} sections={[{ title: 'Generated Reports', type: 'list' }, { title: 'System Logs', type: 'table' }]} />} />
            <Route path="/settings" element={<Placeholder title="Settings" icon="settings" sections={[{ title: 'System Configuration', type: 'cards' }]} />} />
            
            {/* 404 Route within Protected Layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Fallback route for unauthenticated users at root */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HierarchyProvider>
    </BrowserRouter>
  );
};

export default App;
