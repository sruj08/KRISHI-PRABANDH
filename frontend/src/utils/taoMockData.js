/** Demo fixtures for Taluka Agriculture Officer dashboard (offline / design parity). */

export const MOCK_TAO_STATS = {
  filesProcessedYtd: 1402,
  circlesMonitored: 12,
};

export const MOCK_APPLICATIONS = [
  {
    id: 'APP-2025-884',
    farmerName: 'Baburao Kadam',
    scheme: 'PM-KISAN',
    anomalyType: 'Duplicate 7/12 Detected',
    riskScore: 88,
    details: {
      alert: 'Same survey number appears on an earlier approved application for a different beneficiary name.',
    },
  },
  {
    id: 'APP-2025-412',
    farmerName: 'Suresh Kadam',
    scheme: 'PM-KISAN',
    anomalyType: null,
    riskScore: 12,
    details: { alert: '' },
  },
];

export const MOCK_GRIEVANCES = [
  {
    id: 'GRV-2025-0192',
    text: 'माझ्या शेतातील नुकसानाचा पत्ता चुकीचा दाखवला आहे.',
    translated: 'The assessment shows incorrect plot boundaries for my hail damage claim.',
  },
];
