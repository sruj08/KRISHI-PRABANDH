// Re-exporting from domain specific modules for backward compatibility

export { fetchApplications, fetchApplication, updateApplicationStatus, uploadPhoto } from '../features/applications/api';
export { fetchMandals, fetchMandalSahayaks, fetchMandalSummary } from '../features/mandals/api';
export { fetchSahayaks, fetchSahayakApplications, fetchSahayakSummary } from '../features/sahayaks/api';
export { fetchSummary, fetchPriorityList, fetchHighPriority, fetchEligibleFarmers, fetchFraudAlerts } from '../features/insights/api';
export { fetchLogs, postLog } from '../features/logs/api';
export { fetchVistarSessions, fetchVistarAnalytics, fetchVistarFraudAlerts, fetchMKAApplicationIntelligence } from '../features/mka/api';
export { parseGR } from '../features/gr_parser/api';
