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
import DivisionDashboard from './pages/division/DivisionDashboard';
import StateDashboard from './pages/state/StateDashboard';
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
  if (user?.role === 'state') return <Navigate to="/state/dashboard" replace />;
  if (user?.role === 'division') return <Navigate to="/division/dashboard" replace />;
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

            {/* State & Division Executive Command Centers — same UX as DAO/TAO */}
            <Route path="/state/dashboard" element={<StateDashboard />} />
            <Route path="/division/dashboard" element={<DivisionDashboard />} />

            {/* State Official Sidebar Routes */}
            <Route path="/state/map" element={<Placeholder isDark={true} title="Maharashtra Command Map" icon="map" sections={[{ title: 'Live Field Operations', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} />} />
            <Route path="/state/schemes" element={<Placeholder isDark={true} title="Active Schemes" icon="account_tree" sections={[{ title: 'Scheme Performance', type: 'cards' }, { title: 'Scheme Registry', type: 'table' }]} />} />
            <Route path="/state/new-scheme" element={<Placeholder isDark={true} title="New Scheme Creation" icon="add_box" sections={[{ title: 'Policy Engine', type: 'cards' }, { title: 'Draft Schemes', type: 'table' }]} />} />
            <Route path="/state/lottery" element={<Placeholder isDark={true} title="Beneficiary Lottery" icon="casino" sections={[{ title: 'Lottery Execution', type: 'cards' }, { title: 'Recent Results', type: 'table' }]} />} />
            <Route path="/state/budget" element={<Placeholder isDark={true} title="Budget Allocation" icon="account_balance_wallet" sections={[{ title: 'Statewide Budget', type: 'cards' }, { title: 'Fund Distribution', type: 'table' }]} />} />
            <Route path="/state/pfms" element={<Placeholder isDark={true} title="PFMS Monitoring" icon="account_balance" sections={[{ title: 'Disbursement Status', type: 'cards' }, { title: 'Failed Transactions', type: 'table' }]} />} />
            <Route path="/state/utilization" element={<Placeholder isDark={true} title="Utilization Analytics" icon="pie_chart" sections={[{ title: 'Fund Utilization %', type: 'cards' }, { title: 'District-wise Spending', type: 'table' }]} />} />
            <Route path="/state/fraud" element={<Placeholder isDark={true} title="Fraud Prevention Grid" icon="shield_locked" sections={[{ title: 'AI Fraud Savings', type: 'cards' }, { title: 'Detected Rings', type: 'table' }]} />} />
            <Route path="/state/friction" element={<Placeholder isDark={true} title="Policy Friction Feed" icon="timeline" sections={[{ title: 'Bottleneck Analysis', type: 'cards' }, { title: 'Friction Points', type: 'table' }]} />} />
            <Route path="/state/risk" element={<Placeholder isDark={true} title="AI Risk Signals" icon="warning" sections={[{ title: 'Risk Score Matrix', type: 'cards' }, { title: 'Critical Warnings', type: 'table' }]} />} />
            <Route path="/state/drought" element={<Placeholder isDark={true} title="Drought Heatmap" icon="wb_sunny" sections={[{ title: 'Drought Severity', type: 'cards' }, { title: 'Affected Regions', type: 'table' }]} />} />
            <Route path="/state/flood" element={<Placeholder isDark={true} title="Flood Monitoring" icon="flood" sections={[{ title: 'Flood Risk Levels', type: 'cards' }, { title: 'Inundation Zones', type: 'table' }]} />} />
            <Route path="/state/crop-failure" element={<Placeholder isDark={true} title="Crop Failure Alerts" icon="compost" sections={[{ title: 'Failure Predictions', type: 'cards' }, { title: 'Distress Zones', type: 'table' }]} />} />
            <Route path="/state/reports" element={<Placeholder isDark={true} title="State Reports" icon="summarize" sections={[{ title: 'Coverage Stats', type: 'cards' }, { title: 'Generated Reports', type: 'list' }]} />} />
            <Route path="/state/division-perf" element={<Placeholder isDark={true} title="Division Performance" icon="leaderboard" sections={[{ title: 'Division Rankings', type: 'cards' }, { title: 'Performance Matrix', type: 'table' }]} />} />
            <Route path="/state/export" element={<Placeholder isDark={true} title="Export Center" icon="file_download" sections={[{ title: 'Data Exports', type: 'list' }]} />} />
            <Route path="/state/users" element={<Placeholder isDark={true} title="User Governance" icon="manage_accounts" sections={[{ title: 'Active Staff', type: 'cards' }, { title: 'System Access', type: 'table' }]} />} />
            <Route path="/state/audit" element={<Placeholder isDark={true} title="Audit Trails" icon="history" sections={[{ title: 'System Logs', type: 'table' }]} />} />
            <Route path="/state/settings" element={<Placeholder isDark={true} title="Settings" icon="settings" sections={[{ title: 'Global Configuration', type: 'cards' }]} />} />

            {/* Divisional Officer Sidebar Routes */}
            <Route path="/division/map" element={<Placeholder title="Division Map" icon="map" sections={[{ title: 'Division Overview', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} />} />
            <Route path="/division/district-matrix" element={<Placeholder title="District Matrix" icon="table_chart" sections={[{ title: 'District Comparisons', type: 'cards' }, { title: 'Matrix View', type: 'table' }]} />} />
            <Route path="/division/pendency" element={<Placeholder title="Pendency Monitoring" icon="pending_actions" sections={[{ title: 'Backlog Metrics', type: 'cards' }, { title: 'Aged Files', type: 'table' }]} />} />
            <Route path="/division/officer-perf" element={<Placeholder title="Officer Performance" icon="bar_chart" sections={[{ title: 'Efficiency Scores', type: 'cards' }, { title: 'Staff Rankings', type: 'table' }]} />} />
            <Route path="/division/cross-fraud" element={<Placeholder title="Cross-District Fraud" icon="share_location" sections={[{ title: 'Fraud Rings Detected', type: 'cards' }, { title: 'Cross-Border Alerts', type: 'table' }]} />} />
            <Route path="/division/ai-red-flags" element={<Placeholder title="AI Red Flags" icon="flag" sections={[{ title: 'Critical Anomalies', type: 'cards' }, { title: 'Flagged Operations', type: 'table' }]} />} />
            <Route path="/division/escalations" element={<Placeholder title="Escalations" icon="priority_high" sections={[{ title: 'Escalated Issues', type: 'cards' }, { title: 'Action Required', type: 'table' }]} />} />
            <Route path="/division/staff" element={<Placeholder title="Staff Deployment" icon="engineering" sections={[{ title: 'Active Resources', type: 'cards' }, { title: 'Staff Allocations', type: 'table' }]} />} />
            <Route path="/division/task-redist" element={<Placeholder title="Task Redistribution" icon="move_up" sections={[{ title: 'Workload Balance', type: 'cards' }, { title: 'Reassignment Log', type: 'table' }]} />} />
            <Route path="/division/emergency" element={<Placeholder title="Emergency Assignments" icon="local_hospital" sections={[{ title: 'Active Emergencies', type: 'cards' }, { title: 'Deployed Units', type: 'table' }]} />} />
            <Route path="/division/rainfall" element={<Placeholder title="Rainfall Monitoring" icon="rainy" sections={[{ title: 'Rainfall Deficits', type: 'cards' }, { title: 'Station Data', type: 'table' }]} />} />
            <Route path="/division/crop-distress" element={<Placeholder title="Crop Distress" icon="eco" sections={[{ title: 'Distress Signals', type: 'cards' }, { title: 'Affected Areas', type: 'table' }]} />} />
            <Route path="/division/verification-trends" element={<Placeholder title="Verification Trends" icon="trending_up" sections={[{ title: 'Verification Speed', type: 'cards' }, { title: 'Weekly Trends', type: 'table' }]} />} />
            <Route path="/division/reports" element={<Placeholder title="Division Reports" icon="summarize" sections={[{ title: 'Coverage Stats', type: 'cards' }, { title: 'Generated Reports', type: 'list' }]} />} />
            <Route path="/division/comparison" element={<Placeholder title="District Comparison" icon="compare_arrows" sections={[{ title: 'Comparative Metrics', type: 'cards' }, { title: 'Data View', type: 'table' }]} />} />
            <Route path="/division/settings" element={<Placeholder title="Division Controls" icon="settings" sections={[{ title: 'Division Settings', type: 'cards' }]} />} />

            {/* Officer (Sahayak) Routes for Sidebar Items */}
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
