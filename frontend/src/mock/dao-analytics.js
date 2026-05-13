/** District governance intelligence — mock aggregates (no live services). */

export const mockTalukaData = [
  { taluka: 'Barshi', total: 142, approved: 87, flagged: 38, fraud_rate: 26.7, pending: 24, intensity: 'high' },
  { taluka: 'Madha', total: 98, approved: 73, flagged: 19, fraud_rate: 19.4, pending: 11, intensity: 'medium' },
  { taluka: 'Pandharpur', total: 203, approved: 167, flagged: 28, fraud_rate: 13.8, pending: 18, intensity: 'medium' },
  { taluka: 'Sangola', total: 176, approved: 155, flagged: 14, fraud_rate: 7.9, pending: 9, intensity: 'low' },
  { taluka: 'Mohol', total: 134, approved: 122, flagged: 8, fraud_rate: 5.9, pending: 6, intensity: 'low' },
];

export const mockFraudTrends = [
  { month: 'Jan 2026', high_risk: 14, invoice: 6, bhade_khat: 3, bank: 5 },
  { month: 'Feb 2026', high_risk: 18, invoice: 8, bhade_khat: 4, bank: 6 },
  { month: 'Mar 2026', high_risk: 21, invoice: 9, bhade_khat: 5, bank: 7 },
  { month: 'Apr 2026', high_risk: 19, invoice: 7, bhade_khat: 6, bank: 6 },
  { month: 'May 2026', high_risk: 24, invoice: 11, bhade_khat: 7, bank: 6 },
];

export const mockInsightsFeed = [
  { severity: 'critical', time: '2 hrs ago', text: 'Barshi taluka showing 340% spike in invoice fraud this week.' },
  { severity: 'medium', time: '5 hrs ago', text: 'Repeated stamp paper serial MH-2024-00123 detected in Madha.' },
  { severity: 'low', time: 'Yesterday', text: 'Pandharpur fraud rate dropped 8% after field audits.' },
  { severity: 'critical', time: '2 days ago', text: '3 dealers flagged for abnormal quotations in drip irrigation scheme.' },
  { severity: 'medium', time: '3 days ago', text: 'Bank account mismatch cluster detected in Sangola.' },
];

export const mockEscalationQueue = [
  {
    id: 'ESC-001',
    severity: 'critical',
    description: 'Organized dealer fraud — same dealer in 14 applications across 3 villages.',
    taluka: 'Barshi',
  },
  {
    id: 'ESC-002',
    severity: 'critical',
    description: 'Stamp paper serial MH-2024-00123 reused in 6 Bhade Khat applications.',
    taluka: 'Madha',
  },
  {
    id: 'ESC-003',
    severity: 'high',
    description: 'Crop geo-tag clustering — 12 applications share near-identical GPS.',
    taluka: 'Pandharpur',
  },
];

export const mockFraudSummaryMetrics = [
  {
    key: 'high_risk',
    title: 'High Risk Applications',
    value: 24,
    trendLabel: '↑ 4 vs last month',
    trendUpIsBad: true,
  },
  {
    key: 'invoice',
    title: 'Invoice Fraud Cases',
    value: 11,
    trendLabel: '↑ 2 vs last month',
    trendUpIsBad: true,
  },
  {
    key: 'bank',
    title: 'Bank Verify Failures',
    value: 18,
    trendLabel: '↓ 3 vs last month',
    trendUpIsBad: false,
  },
  {
    key: 'escalated',
    title: 'Escalated This Month',
    value: 3,
    trendLabel: '→ Same',
    trendNeutral: true,
  },
];

export const mockRiskDistribution = {
  safe_pct: 68,
  review_pct: 21,
  high_pct: 11,
  total_applications: 753,
};

export const mockFraudTypeBars = [
  { label: 'Invoice Fraud', pct: 38 },
  { label: 'Bank Mismatch', pct: 24 },
  { label: 'Bhade Khat Fraud', pct: 19 },
  { label: 'Geo-tag Issues', pct: 12 },
  { label: 'Satbara Mismatch', pct: 7 },
];

export const mockSchemeLeakage = [
  { scheme: 'Drip Irrigation Subsidy', applications: 248, fraud_rate: 24.2, avg_risk: 58, highlight: false },
  { scheme: 'Soybean Seed Subsidy', applications: 186, fraud_rate: 11.8, avg_risk: 31, highlight: false },
  { scheme: 'PM Kisan Equipment Grant', applications: 142, fraud_rate: 19.7, avg_risk: 47, highlight: false },
  { scheme: 'Solar Pump Subsidy', applications: 98, fraud_rate: 8.2, avg_risk: 22, highlight: false },
  { scheme: 'Bhade Khat Scheme', applications: 79, fraud_rate: 31.6, avg_risk: 71, highlight: true },
];

export const mockTalukaComparisonRows = [
  { taluka: 'Barshi', total: 142, approval_rate: 61, fraud_rate: 26.7, pending: 24, fraud_emoji: '🔴' },
  { taluka: 'Madha', total: 98, approval_rate: 74, fraud_rate: 19.4, pending: 11, fraud_emoji: '🟡' },
  { taluka: 'Pandharpur', total: 203, approval_rate: 82, fraud_rate: 13.8, pending: 18, fraud_emoji: '🟡' },
  { taluka: 'Sangola', total: 176, approval_rate: 88, fraud_rate: 7.9, pending: 9, fraud_emoji: '🟢' },
  { taluka: 'Mohol', total: 134, approval_rate: 91, fraud_rate: 5.9, pending: 6, fraud_emoji: '🟢' },
];

export const mockTalukaDetailByName = {
  Barshi: {
    top_fraud_types: 'Invoice Fraud (41%), Bhade Khat (31%), Bank (28%)',
    flagged_scheme: 'Drip Irrigation Subsidy',
    tao_review_days: '2.4',
    officer: 'TAO Rajesh Kumar',
    officer_pending: 14,
  },
  Madha: {
    top_fraud_types: 'Bhade Khat (36%), Invoice (28%), Bank (22%)',
    flagged_scheme: 'Bhade Khat Scheme',
    tao_review_days: '1.9',
    officer: 'TAO Amit Jadhav',
    officer_pending: 9,
  },
  Pandharpur: {
    top_fraud_types: 'Invoice (33%), Geo-tag (27%), Bank (21%)',
    flagged_scheme: 'Soybean Seed Subsidy',
    tao_review_days: '1.1',
    officer: 'TAO Priya Deshmukh',
    officer_pending: 6,
  },
  Sangola: {
    top_fraud_types: 'Bank (34%), Invoice (29%), Satbara (18%)',
    flagged_scheme: 'PM Kisan Equipment Grant',
    tao_review_days: '0.9',
    officer: 'TAO Suresh Patil',
    officer_pending: 4,
  },
  Mohol: {
    top_fraud_types: 'Invoice (31%), Satbara (26%), Bank (19%)',
    flagged_scheme: 'Solar Pump Subsidy',
    tao_review_days: '1.3',
    officer: 'TAO Nitin Kulkarni',
    officer_pending: 5,
  },
};

export const mockOfficerPerformance = [
  { name: 'Rajesh Kumar', taluka: 'Barshi', pending: 14, avg_review_days: '2.4', efficiency: 'Medium', efficiency_tone: 'amber' },
  { name: 'Priya Deshmukh', taluka: 'Pandharpur', pending: 6, avg_review_days: '1.1', efficiency: 'High', efficiency_tone: 'green' },
  { name: 'Amit Jadhav', taluka: 'Madha', pending: 9, avg_review_days: '1.8', efficiency: 'High', efficiency_tone: 'green' },
  { name: 'Suresh Patil', taluka: 'Sangola', pending: 4, avg_review_days: '0.9', efficiency: 'High', efficiency_tone: 'green' },
];

export const mockFraudTrendSummaryCards = [
  { title: 'This Month', line1: '24 high-risk cases', line2: '↑ up from 18', trendUp: true, trendBad: true },
  { title: 'Highest Risk Type', line1: 'Invoice Fraud', line2: '38% of all fraud', trendUp: false, trendBad: true },
  { title: 'Escalated Cases', line1: '3 cases', line2: 'Awaiting DAO review', trendUp: false, trendBad: false },
];

export const mockSuspiciousPatterns = [
  {
    severity: 'CRITICAL',
    tone: 'red',
    title: 'Organized subsidy fraud suspected in Barshi.',
    body: 'Same dealer appearing in 14 applications across 3 villages.',
    cta: 'View Investigation Summary',
  },
  {
    severity: 'HIGH',
    tone: 'red',
    title: 'Repeated stamp paper serial MH-2024-00123.',
    body: 'Used in 6 different Bhade Khat applications.',
    cta: 'View Pattern',
  },
  {
    severity: 'MEDIUM',
    tone: 'amber',
    title: 'Crop geo-tag clustering detected in Pandharpur.',
    body: '12 applications share near-identical GPS coordinates.',
    cta: 'View Cluster',
  },
  {
    severity: 'MEDIUM',
    tone: 'amber',
    title: 'Bank mismatch spike in Madha.',
    body: '9 inactive accounts in drip irrigation scheme applications.',
    cta: 'View Report',
  },
];
