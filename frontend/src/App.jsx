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
import TaoAIFlaggedCases from './pages/tao/TaoAIFlaggedCases';
import { TaoPendingApplicationsPage, TaoFieldVerificationPage } from './pages/tao/TaoWorkflowListPage';
import DistrictDashboard from './pages/district/DistrictDashboard';
import DistrictAnalytics from './pages/district/DistrictAnalytics';
import TalukaComparison from './pages/district/TalukaComparison';
import FraudTrends from './pages/district/FraudTrends';
import DivisionDashboard from './pages/division/DivisionDashboard';
import StateDashboard from './pages/state/StateDashboard';
import AdvancedTools from './pages/AdvancedTools';
import VisitPlanner from './pages/VisitPlanner';
import Placeholder from './pages/Placeholder';
import NotFound from './pages/NotFound';
import SahayakDashboard from './pages/officer/SahayakDashboard';
import GRAssistantPage from './pages/officer/GRAssistantPage';
import ScanDocumentPage from './pages/officer/ScanDocumentPage';
import AIVerificationPage from './pages/officer/AIVerificationPage';
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
  if (user?.role === 'district') return <Navigate to="/dao" replace />;
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
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/cao" element={<CAODashboard />} />
            <Route path="/district" element={<Navigate to="/dao" replace />} />
            <Route path="/dao" element={<DistrictDashboard />} />
            <Route path="/dao/district-analytics" element={<DistrictAnalytics />} />
            <Route path="/dao/taluka-comparison" element={<TalukaComparison />} />
            <Route path="/dao/fraud-trends" element={<FraudTrends />} />
            <Route path="/tao" element={<TAODashboard />} />
            <Route path="/tao/pending-applications" element={<TaoPendingApplicationsPage />} />
            <Route path="/tao/ai-flagged-cases" element={<TaoAIFlaggedCases />} />
            <Route path="/tao/field-verification-requests" element={<TaoFieldVerificationPage />} />
            <Route path="/officer" element={<SahayakDashboard />} />
            <Route path="/officer/gr-assistant" element={<GRAssistantPage />} />
            <Route path="/officer/scan-document" element={<ScanDocumentPage />} />
            <Route path="/officer/ai-verification" element={<AIVerificationPage />} />
            <Route path="/officer/eligibility" element={<Placeholder title="Eligible Farmers" icon="fact_check" tabs={['All','Pending','Approved','Rejected','KYC']} sections={[{ title: 'Eligibility Rules Engine', type: 'cards' }, { title: 'Pending Review', type: 'table' }]} />} />
            <Route path="/officer/field-verification" element={<Placeholder title="Field Verification" icon="verified_user" tabs={['Visits','Geo-tagged Photos','Pending Checks']} sections={[{ title: 'Scheduled Visits', type: 'table' }, { title: 'Coverage Metrics', type: 'cards' }]} />} />
            {/* Legacy redirects */}
            <Route path="/advanced-tools" element={<Navigate to="/officer/eligibility" replace />} />
            <Route path="/eligibility" element={<Navigate to="/officer/eligibility" replace />} />
            <Route path="/verification" element={<Navigate to="/officer/field-verification" replace />} />
            <Route path="/survey" element={<SurveyOperationsDashboard />} />
            <Route path="/mandal" element={<MandalDashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/capture-photo" element={<CapturePhoto />} />
            <Route path="/confirm-verification" element={<ConfirmVerification />} />
            <Route path="/fraud-alerts" element={<FraudAlerts />} />
            <Route path="/select-task" element={<SelectTask />} />
            <Route path="/visit-planner" element={<VisitPlanner />} />
            <Route path="/gram-sabha" element={<GramSabha />} />

            {/* State & Division Executive Command Centers — same UX as DAO/TAO */}
            <Route path="/state/dashboard" element={<StateDashboard />} />
            <Route path="/division/dashboard" element={<DivisionDashboard />} />

            {/* State Official Sidebar Routes */}
            <Route path="/state/map" element={<Placeholder title="Maharashtra Live Map" icon="map" sections={[{ title: 'Live Operations', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/schemes" element={<Placeholder title="Schemes" icon="account_tree" sections={[{ title: 'Scheme Performance', type: 'cards' }, { title: 'Scheme Registry', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/fund-monitoring" element={<Placeholder title="Fund Monitoring" icon="account_balance_wallet" sections={[{ title: 'Fund Utilization', type: 'cards' }, { title: 'Distribution', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/approvals" element={<Placeholder title="Approvals" icon="check_circle" sections={[{ title: 'Pending Clearance', type: 'cards' }, { title: 'Approval Queue', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/fraud" element={<Placeholder title="Fraud Network" icon="shield_locked" sections={[{ title: 'AI Fraud Savings', type: 'cards' }, { title: 'Detected Rings', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/insights" element={<Placeholder title="AI Insights" icon="lightbulb" sections={[{ title: 'System Recommendations', type: 'list' }, { title: 'Anomaly Flags', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/disaster" element={<Placeholder title="Disaster Watch" icon="warning" sections={[{ title: 'Disaster Escalations', type: 'cards' }, { title: 'Affected Regions', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/analytics" element={<Placeholder title="Analytics" icon="bar_chart" sections={[{ title: 'Statewide Metrics', type: 'cards' }, { title: 'Division Performance', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/audit" element={<Placeholder title="Audit Logs" icon="history" sections={[{ title: 'System Logs', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/users" element={<Placeholder title="User Control" icon="manage_accounts" sections={[{ title: 'Active Staff', type: 'cards' }, { title: 'System Access', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/settings" element={<Placeholder title="Settings" icon="settings" sections={[{ title: 'Global Configuration', type: 'cards' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />

            {/* Divisional Officer Sidebar Routes */}
            <Route path="/division/map" element={<Placeholder title="Geo Command Map" icon="map" sections={[{ title: 'Division Overview', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/district-perf" element={<Placeholder title="District Performance" icon="leaderboard" sections={[{ title: 'District Comparisons', type: 'cards' }, { title: 'Matrix View', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/resources" element={<Placeholder title="Resource Allocation" icon="engineering" sections={[{ title: 'Workload Balance', type: 'cards' }, { title: 'Staff Allocations', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/fraud" element={<Placeholder title="Cross-District Fraud" icon="share_location" sections={[{ title: 'Fraud Rings Detected', type: 'cards' }, { title: 'Cross-Border Alerts', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/escalations" element={<Placeholder title="Escalations" icon="priority_high" sections={[{ title: 'Escalated Issues', type: 'cards' }, { title: 'Action Required', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/crop-stress" element={<Placeholder title="Crop Stress" icon="eco" sections={[{ title: 'Distress Signals', type: 'cards' }, { title: 'Affected Areas', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/survey-monitoring" element={<Placeholder title="Survey Monitoring" icon="verified" sections={[{ title: 'Verification Speed', type: 'cards' }, { title: 'Weekly Trends', type: 'table' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/division/analytics" element={<Placeholder title="Division Analytics" icon="summarize" sections={[{ title: 'Coverage Stats', type: 'cards' }, { title: 'Generated Reports', type: 'list' }]} rightPanels={['Cross-District Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />

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
