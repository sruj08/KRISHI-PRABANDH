/** Demo data for Taluka Agriculture Officer (TAO) dashboard routes. */

export const MOCK_TAO_STATS = {
  filesProcessedYtd: 1402,
  fraudPulseDuplicate712Pct: 18,
  grievancesOpen: 3,
  circlesMonitored: 12,
};

export const MOCK_APPLICATIONS = [
  {
    id: 'APP-2026-8841',
    farmerName: 'Baburao Kadam',
    scheme: 'PM-KISAN',
    anomalyType: 'Duplicate 7/12 Detected',
    riskScore: 94,
    details: {
      alert: 'Same survey number appears on an approved application in an adjacent circle.',
    },
  },
  {
    id: 'APP-2026-8842',
    farmerName: 'Sunita Jadhav',
    scheme: 'Micro Irrigation',
    anomalyType: null,
    riskScore: 12,
    details: { alert: 'Low risk - routine verification.' },
  },
];

export const MOCK_GRIEVANCES = [
  {
    id: 'GRV-PNE-2026-0142',
    text: 'नकाशात शेताची योग्य सीमा दिसत नाही.',
    translated: 'The damage assessment map shows the wrong plot boundary for my farm.',
  },
];
