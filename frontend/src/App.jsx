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
          <Route path="/cao" element={<CAODashboard />} />
          <Route path="/district" element={<DistrictDashboard />} />
          
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardRouter />} />
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
            <Route path="/geo" element={<Placeholder title="Geo-Intelligence" />} />
            <Route path="/ledger" element={<Placeholder title="Compensation Ledger" />} />
            <Route path="/gram-sabha" element={<GramSabha />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HierarchyProvider>
    </BrowserRouter>
  );
};

export default App;
