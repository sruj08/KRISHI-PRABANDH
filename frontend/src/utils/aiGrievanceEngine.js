// frontend/src/utils/aiGrievanceEngine.js
import rawGrievances from '../data/grievances/grievances.seed.json';

// Simulated AI routing and classification rules
const SCHEME_KEYWORDS = {
  'PM-KISAN': ['pm kisan', 'pm-kisan', 'kisan samman', '2000'],
  'Crop Insurance (PMFBY)': ['insurance', 'pmfby', 'claim', 'premium', 'crop loss'],
  'Disaster Compensation (State)': ['compensation', 'disaster', 'flood', 'drought', 'panchanama'],
  'Farm Mechanization': ['tractor', 'rotavator', 'implement', 'subsidy'],
  'Micro-irrigation': ['drip', 'sprinkler', 'irrigation', 'pipe']
};

const SEVERITY_RULES = [
  { trigger: ['fraud', 'fake', 'bribe', 'scam', 'demand money', 'dealer issue'], score: 'Critical' },
  { trigger: ['dead', 'suicide', 'medical', 'hospital', 'urgent'], score: 'Critical' },
  { trigger: ['waiting for 6 months', 'multiple times', 'rejected again'], score: 'High' },
  { trigger: ['delay', 'pending', 'not received', 'account mismatch'], score: 'Medium' },
  { trigger: ['how to', 'query', 'status check', 'where is'], score: 'Low' }
];

const ESCALATION_SLA = {
  'Critical': 2, // days
  'High': 5,
  'Medium': 15,
  'Low': 30
};

/**
 * Mocks an AI text analysis on a grievance description.
 */
export const analyzeGrievanceText = (text) => {
  const lowerText = text.toLowerCase();
  
  // Detect Scheme
  let detectedScheme = 'General Agri Admin';
  for (const [scheme, keywords] of Object.entries(SCHEME_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      detectedScheme = scheme;
      break;
    }
  }

  // Detect Severity & Category
  let severity = 'Low';
  let category = 'Administrative Query';
  let fraudFlag = false;

  for (const rule of SEVERITY_RULES) {
    if (rule.trigger.some(kw => lowerText.includes(kw))) {
      severity = rule.score;
      if (rule.score === 'Critical' && lowerText.includes('fraud') || lowerText.includes('fake') || lowerText.includes('bribe')) {
         category = 'Suspected Fraud';
         fraudFlag = true;
      } else if (rule.score === 'Critical') {
         category = 'Urgent Escalation';
      } else if (lowerText.includes('delay') || lowerText.includes('pending')) {
         category = 'Payment/Process Delay';
      } else if (lowerText.includes('mismatch')) {
         category = 'Data Discrepancy';
      }
      break;
    }
  }

  // Mock assigning to Officer level
  let routeTo = 'TAO (Taluka Agriculture Officer)';
  if (fraudFlag || severity === 'Critical') routeTo = 'District Vigilance Officer';
  if (category === 'Data Discrepancy') routeTo = 'Circle Officer / Sahayak';

  return {
    detectedScheme,
    severity,
    category,
    fraudFlag,
    routeTo,
    slaDays: ESCALATION_SLA[severity]
  };
};

/**
 * Enhances raw grievances with AI-injected metadata for the dashboards
 */
export const getEnhancedGrievances = () => {
  return rawGrievances.map(g => {
    // Generate predictable but varied AI metadata based on the seed description
    const analysis = analyzeGrievanceText(g.description + ' ' + g.grievanceType);
    
    // Simulate timeline based on submittedAt
    const submittedDate = new Date(g.submittedAt);
    const now = new Date();
    const daysSince = Math.floor((now - submittedDate) / (1000 * 60 * 60 * 24));
    
    let currentStatus = g.status;
    let isSlaBreached = daysSince > analysis.slaDays;
    
    // Mock Fraud Links if Critical
    let linkedTickets = [];
    let fraudScore = 0.1;
    if (analysis.fraudFlag) {
      fraudScore = 0.85 + (Math.random() * 0.1); // 0.85-0.95
      linkedTickets = [ `GRV-2026-${Math.floor(1000 + Math.random() * 2000)}`, `GRV-2026-${Math.floor(1000 + Math.random() * 2000)}` ];
    }

    // Auto-escalation mock
    let escalationLevel = g.escalationLevel || 0;
    if (isSlaBreached && currentStatus !== 'Resolved' && currentStatus !== 'Closed') {
      escalationLevel = daysSince > (analysis.slaDays * 2) ? 2 : 1; 
      if (escalationLevel === 1) currentStatus = 'Escalated to DAO';
      if (escalationLevel === 2) currentStatus = 'Escalated to State';
    }

    return {
      ...g,
      aiInsights: analysis,
      fraudScore,
      linkedTickets,
      isSlaBreached,
      daysPending: daysSince,
      derivedStatus: currentStatus,
      escalationLevel
    };
  });
};

export const getGrievancesByTaluka = (talukaName) => {
  return getEnhancedGrievances().filter(g => g.taluka === talukaName);
};

export const getGrievancesByDistrict = (districtName) => {
  return getEnhancedGrievances().filter(g => g.district === districtName);
};

export const getEscalatedGrievances = () => {
  return getEnhancedGrievances().filter(g => g.escalationLevel > 0);
};

export const getFraudLinkedGrievances = () => {
  return getEnhancedGrievances().filter(g => g.fraudScore > 0.7);
};

export const getFarmerGrievances = (farmerId) => {
  return getEnhancedGrievances().filter(g => g.farmerId === farmerId);
};
