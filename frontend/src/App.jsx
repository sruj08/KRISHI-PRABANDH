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
import FarmerPortalLayout from './components/farmer/FarmerPortalLayout';
import { FarmerRegistrationProvider } from './context/FarmerRegistrationContext';
import FarmerHomePage from './pages/farmer/portal/FarmerHomePage';
import FarmerProfilePage from './pages/farmer/portal/FarmerProfilePage';
import FarmerLandPage from './pages/farmer/portal/FarmerLandPage';
import FarmerSchemesPage from './pages/farmer/portal/FarmerSchemesPage';
import FarmerApplicationsPage from './pages/farmer/portal/FarmerApplicationsPage';
import FarmerDocumentsPage from './pages/farmer/portal/FarmerDocumentsPage';
import FarmerPaymentsPage from './pages/farmer/portal/FarmerPaymentsPage';
import FarmerNotificationsPage from './pages/farmer/portal/FarmerNotificationsPage';
import FarmerGrievancesPage from './pages/farmer/portal/FarmerGrievancesPage';
import FarmerHelpPage from './pages/farmer/portal/FarmerHelpPage';
import FarmerSettingsPage from './pages/farmer/portal/FarmerSettingsPage';
import SurveyOperationsDashboard from './features/survey_operations/SurveyOperationsDashboard';
import SchemeAnalytics from './pages/scheme-analytics/SchemeAnalytics';
import MandalDashboard from './pages/officer/MandalDashboard';
import CAODashboard from './pages/cao/CAODashboard';
import TalukaPerformancePage from './pages/cao/TalukaPerformancePage';
import FieldOperationsPage from './pages/cao/FieldOperationsPage';
import RainCropStressDesk from './pages/cao/RainCropStressDesk';
import PMFBYMonitoringPage from './pages/cao/PMFBYMonitoringPage';
import GrievanceCommandPage from './pages/cao/GrievanceCommandPage';
import AuditLogsPage from './pages/cao/AuditLogsPage';
import SahayakMatrixPage from './pages/cao/SahayakMatrixPage';
import SupervisionPage from './pages/cao/SupervisionPage';
import ShopsPage from './pages/cao/ShopsPage';
import TAODashboard from './pages/tao/TAODashboard';
import TaoAIFlaggedCases from './pages/tao/TaoAIFlaggedCases';
import { TaoFieldVerificationPage } from './pages/tao/TaoWorkflowListPage';
import TaoGrievanceQueue from './pages/tao/TaoGrievanceQueue';
import DistrictDashboard from './pages/district/DistrictDashboard';
import DistrictAnalytics from './pages/district/DistrictAnalytics';
import TalukaComparison from './pages/district/TalukaComparison';
import FraudTrends from './pages/district/FraudTrends';
import DistrictGrievanceCommand from './pages/district/DistrictGrievanceCommand';
import DivisionDashboard from './pages/division/DivisionDashboard';
import DivisionDistrictPerformance from './pages/division/DivisionDistrictPerformance';
import DivisionDynamicResources from './pages/division/DivisionDynamicResources';
import DivisionCrossDistrictFraud from './pages/division/DivisionCrossDistrictFraud';
import DivisionEscalations from './pages/division/DivisionEscalations';
import StateDashboard from './pages/state/StateDashboard';
import DivisionalAnalysis from './pages/state/DivisionalAnalysis';
import StateGrievanceIntelligence from './pages/state/StateGrievanceIntelligence';
import StateApprovalsIntelligence from './pages/state/StateApprovalsIntelligence';
import SchemeIntelligencePage from './pages/state/SchemeIntelligencePage';
import FundMonitoring from './pages/state/FundMonitoring';
import VisitPlanner from './pages/VisitPlanner';
import Placeholder from './pages/Placeholder';
import NotFound from './pages/NotFound';
import SahayakDashboard from './pages/officer/SahayakDashboard';
import GRAssistantPage from './pages/officer/GRAssistantPage';
import AIVerificationPage from './pages/officer/AIVerificationPage';
import OfficerFarmerRegistryPage from './pages/officer/OfficerFarmerRegistryPage';
import OfficerPendingSurveysPage from './pages/officer/OfficerPendingSurveysPage';
import OfficerSettingsTabsPage from './pages/officer/OfficerSettingsTabsPage';
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
          <Route
            path="/farmer"
            element={(
              <ProtectedRoute>
                <FarmerRegistrationProvider>
                  <FarmerPortalLayout />
                </FarmerRegistrationProvider>
              </ProtectedRoute>
            )}
          >
            <Route index element={<FarmerHomePage />} />
            <Route path="profile" element={<FarmerProfilePage />} />
            <Route path="land" element={<FarmerLandPage />} />
            <Route path="schemes" element={<FarmerSchemesPage />} />
            <Route path="applications" element={<FarmerApplicationsPage />} />
            <Route path="documents" element={<FarmerDocumentsPage />} />
            <Route path="payments" element={<FarmerPaymentsPage />} />
            <Route path="notifications" element={<FarmerNotificationsPage />} />
            <Route path="grievances" element={<FarmerGrievancesPage />} />
            <Route path="help" element={<FarmerHelpPage />} />
            <Route path="settings" element={<FarmerSettingsPage />} />
            <Route path="*" element={<Navigate to="/farmer" replace />} />
          </Route>
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardRouter />} />
            {/* CAO Command Center — Barshi Circle, Solapur District */}
            <Route path="/cao" element={<CAODashboard />} />
            <Route path="/cao/taluka-performance" element={<TalukaPerformancePage />} />
            <Route path="/cao/field-operations" element={<FieldOperationsPage />} />
            <Route path="/cao/rain-crop-stress" element={<RainCropStressDesk />} />
            <Route path="/cao/pmfby" element={<PMFBYMonitoringPage />} />
            <Route path="/cao/grievances" element={<GrievanceCommandPage />} />
            <Route path="/cao/audit" element={<AuditLogsPage />} />
            {/* Legacy CAO routes — redirect to new structure */}
            <Route path="/cao/sahayak-matrix" element={<Navigate to="/cao/taluka-performance" replace />} />
            <Route path="/cao/supervision" element={<Navigate to="/cao/field-operations" replace />} />
            <Route path="/cao/shops" element={<Navigate to="/cao" replace />} />
            <Route path="/district" element={<Navigate to="/dao" replace />} />
            <Route path="/dao" element={<DistrictDashboard />} />
            <Route path="/dao/district-analytics" element={<DistrictAnalytics />} />
            <Route path="/dao/taluka-comparison" element={<TalukaComparison />} />
            <Route path="/dao/fraud-trends" element={<FraudTrends />} />
            <Route path="/dao/grievances" element={<DistrictGrievanceCommand />} />
            <Route path="/tao" element={<TAODashboard />} />
            <Route path="/tao/pending-applications" element={<Applications />} />
            <Route path="/tao/ai-flagged-cases" element={<TaoAIFlaggedCases />} />
            <Route path="/tao/field-verification-requests" element={<TaoFieldVerificationPage />} />
            <Route path="/tao/grievances" element={<TaoGrievanceQueue />} />
            <Route path="/officer" element={<SahayakDashboard />} />
            <Route path="/officer/pending-surveys" element={<OfficerPendingSurveysPage />} />
            <Route path="/officer/farmer-registry" element={<OfficerFarmerRegistryPage />} />
            <Route path="/officer/settings" element={<OfficerSettingsTabsPage />} />
            <Route path="/officer/gr-assistant" element={<GRAssistantPage />} />
            <Route path="/officer/ai-verification" element={<AIVerificationPage />} />
            {/* Legacy redirects */}
            <Route path="/verification" element={<Navigate to="/officer/ai-verification" replace />} />
            <Route path="/survey" element={<SchemeAnalytics />} />
            <Route path="/survey-ops" element={<SurveyOperationsDashboard />} />
            <Route path="/mandal" element={<MandalDashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/capture-photo" element={<CapturePhoto />} />
            <Route path="/confirm-verification" element={<ConfirmVerification />} />
            <Route path="/fraud-alerts" element={<FraudAlerts />} />
            <Route path="/select-task" element={<SelectTask />} />
            <Route path="/visit-planner" element={<VisitPlanner />} />
            <Route path="/gram-sabha" element={<GramSabha />} />

            {/* State & Division Executive Command Centers - same UX as DAO/TAO */}
            <Route path="/state/dashboard" element={<StateDashboard />} />
            {/* Divisional Officer - flat IA aligned with state command shell */}
            <Route path="/division/dashboard" element={<DivisionDashboard />} />
            <Route path="/division/district-perf" element={<DivisionDistrictPerformance />} />
            <Route path="/division/resources" element={<DivisionDynamicResources />} />
            <Route path="/division/fraud" element={<DivisionCrossDistrictFraud />} />
            <Route path="/division/escalations" element={<DivisionEscalations />} />
            <Route path="/division/map" element={<Navigate to="/division/district-perf" replace />} />
            <Route path="/division/crop-stress" element={<Navigate to="/division/dashboard" replace />} />
            <Route path="/division/survey-monitoring" element={<Navigate to="/division/dashboard" replace />} />
            <Route path="/division/analytics" element={<Navigate to="/division/dashboard" replace />} />
            <Route path="/state/map" element={<Placeholder title="Maharashtra Live Map" icon="map" sections={[{ title: 'Live Operations', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/schemes" element={<SchemeIntelligencePage />} />
            <Route path="/state/fund-monitoring" element={<FundMonitoring />} />
            <Route path="/state/approvals" element={<StateApprovalsIntelligence />} />
            <Route path="/state/fraud" element={<Navigate to="/state/grievances" replace />} />
            <Route path="/state/grievances" element={<StateGrievanceIntelligence />} />
            <Route path="/state/insights" element={<Navigate to="/state/divisional-analysis" replace />} />
            <Route path="/state/divisional-analysis" element={<DivisionalAnalysis />} />
            <Route path="/state/disaster" element={<Navigate to="/state/divisional-analysis" replace />} />
            <Route path="/state/analytics" element={<Placeholder title="Analytics" icon="bar_chart" sections={[{ title: 'Statewide Metrics', type: 'cards' }, { title: 'Division Performance', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/audit" element={<Placeholder title="Audit Logs" icon="history" sections={[{ title: 'System Logs', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/users" element={<Placeholder title="User Control" icon="manage_accounts" sections={[{ title: 'Active Staff', type: 'cards' }, { title: 'System Access', type: 'table' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />
            <Route path="/state/settings" element={<Placeholder title="Settings" icon="settings" sections={[{ title: 'Global Configuration', type: 'cards' }]} rightPanels={['Critical Alerts', 'AI Recommendations', 'Disaster Escalation']} />} />

            {/* State Official Sidebar Routes */}
            <Route path="/map" element={<Placeholder title="Village Map" icon="map" sections={[{ title: 'Live Field Operations', type: 'cards' }, { title: 'Active Sectors', type: 'table' }]} />} />
            <Route path="/farmers" element={<Navigate to="/officer/farmer-registry" replace />} />

            <Route path="/damage" element={<Navigate to="/officer/crop-damage" replace />} />
            <Route path="/health" element={<Placeholder title="Crop stress (rain desk)" icon="eco" sections={[{ title: 'Moisture / drought indices', type: 'cards' }, { title: 'High stress zones', type: 'table' }]} />} />
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
