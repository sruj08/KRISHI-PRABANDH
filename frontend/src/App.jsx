import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ToastContainer from './components/ui/Toast';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import AdvancedTools from './pages/AdvancedTools';
import CapturePhoto from './pages/CapturePhoto';
import ConfirmVerification from './pages/ConfirmVerification';
import FraudAlerts from './pages/FraudAlerts';
import SelectTask from './pages/SelectTask';
import VisitPlanner from './pages/VisitPlanner';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/advanced-tools" element={<AdvancedTools />} />
          <Route path="/capture-photo" element={<CapturePhoto />} />
          <Route path="/confirm-verification" element={<ConfirmVerification />} />
          <Route path="/fraud-alerts" element={<FraudAlerts />} />
          <Route path="/select-task" element={<SelectTask />} />
          <Route path="/visit-planner" element={<VisitPlanner />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
