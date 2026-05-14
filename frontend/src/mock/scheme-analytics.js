/** Mock data for Scheme Analytics — Baramati Taluka (Pune) · Kharif 2025 · revenue circle aggregates. */

export const SEASON = 'Kharif 2025';
export const DISTRICT = 'Pune';
export const TALUKA = 'Baramati';

/**
 * Seven revenue circles of Baramati taluka.
 * Each row is circle-level analytics (not taluka-wise).
 */
export const CIRCLE_DATA = [
  {
    circle: 'Baramati (City/Rural)',
    coverage:
      'Covers the main municipal council area and surrounding outskirts like Jalochi and Barhanpur.',
    applications: 2850,
    approved: 2210,
    pending: 512,
    rejected: 128,
    compensation: 5.2,
    rainfall: 72,
    fraudFlags: 38,
    villages: 24,
    farmers: 2210,
    mainCrop: 'Sugarcane',
    paymentFailures: 48,
    topVillages: ['Baramati', 'Jalochi', 'Barhanpur', 'Nimbhore', 'Katphal'],
  },
  {
    circle: 'Malegaon',
    coverage:
      'A major industrial and educational circle, including Malegaon Bk and Malegaon Kh.',
    applications: 2180,
    approved: 1710,
    pending: 398,
    rejected: 72,
    compensation: 3.9,
    rainfall: 68,
    fraudFlags: 29,
    villages: 18,
    farmers: 1710,
    mainCrop: 'Sugarcane / Vegetables',
    paymentFailures: 34,
    topVillages: ['Malegaon Bk', 'Malegaon Kh', 'Rui', 'Khadki', 'Koregaon'],
  },
  {
    circle: 'Supe',
    coverage:
      'Serves the western part of the taluka, including Jalgaon Supe and surrounding rural areas.',
    applications: 1240,
    approved: 956,
    pending: 228,
    rejected: 56,
    compensation: 2.4,
    rainfall: 64,
    fraudFlags: 14,
    villages: 22,
    farmers: 956,
    mainCrop: 'Jowar / Cotton',
    paymentFailures: 19,
    topVillages: ['Jalgaon Supe', 'Supa', 'Pisavare', 'Khadakwasla', 'Kati'],
  },
  {
    circle: 'Morgaon',
    coverage:
      'Centred around the religious hub of Morgaon, covering villages like Loni Bhapkar.',
    applications: 1010,
    approved: 798,
    pending: 176,
    rejected: 36,
    compensation: 2.1,
    rainfall: 70,
    fraudFlags: 11,
    villages: 16,
    farmers: 798,
    mainCrop: 'Sugarcane',
    paymentFailures: 15,
    topVillages: ['Morgaon', 'Loni Bhapkar', 'Ralegan', 'Nira', 'Belsar'],
  },
  {
    circle: 'Pandare',
    coverage:
      'Manages the central agricultural belt, including Pandare and nearby settlements.',
    applications: 1460,
    approved: 1142,
    pending: 268,
    rejected: 50,
    compensation: 2.8,
    rainfall: 66,
    fraudFlags: 18,
    villages: 20,
    farmers: 1142,
    mainCrop: 'Onion / Vegetables',
    paymentFailures: 22,
    topVillages: ['Pandare', 'Nimbut', 'Khadki', 'Wadgaon', 'Kothale'],
  },
  {
    circle: 'Vadgaon Nimbalkar',
    coverage:
      'One of the oldest revenue circles, covering Vadgaon Nimbalkar and Korhale Bk.',
    applications: 1320,
    approved: 1044,
    pending: 234,
    rejected: 42,
    compensation: 2.6,
    rainfall: 71,
    fraudFlags: 16,
    villages: 14,
    farmers: 1044,
    mainCrop: 'Sugarcane / Maize',
    paymentFailures: 18,
    topVillages: ['Vadgaon Nimbalkar', 'Korhale Bk', 'Korhale Kh', 'Undawadi', 'Khadki'],
  },
  {
    circle: 'Loni Bhapkar / Shirsuphal',
    coverage:
      'Often grouped or serving the north-eastern boundaries, including Shirsuphal and Katphal.',
    applications: 920,
    approved: 702,
    pending: 178,
    rejected: 40,
    compensation: 1.7,
    rainfall: 62,
    fraudFlags: 9,
    villages: 12,
    farmers: 702,
    mainCrop: 'Bajra / Pulses',
    paymentFailures: 12,
    topVillages: ['Shirsuphal', 'Katphal', 'Loni Bhapkar', 'Kamshet', 'Sonde'],
  },
];

export const PAYMENT_DATA = [
  { status: 'Success', count: 8562, color: '#396940' },
  { status: 'Aadhaar Failure', count: 298, color: '#ba1a1a' },
  { status: 'Bank Mapping Issue', count: 186, color: '#b45309' },
  { status: 'Pending Transfer', count: 742, color: '#717972' },
];

export const MONTHLY_TREND = [
  { month: 'Nov', claims: 720 },
  { month: 'Dec', claims: 1080 },
  { month: 'Jan', claims: 1620 },
  { month: 'Feb', claims: 1890 },
  { month: 'Mar', claims: 1740 },
  { month: 'Apr', claims: 1280 },
  { month: 'May', claims: 860 },
];

export const AI_ALERTS = [
  { id: 1, severity: 'high', text: 'Duplicate survey number cluster in Baramati (City/Rural) — 4 applications.', time: '2 hrs ago' },
  { id: 2, severity: 'high', text: 'Same bank account used in 3 claims in Malegaon circle.', time: '5 hrs ago' },
  { id: 3, severity: 'medium', text: 'High claim volume from a single village in Pandare circle.', time: 'Yesterday' },
  { id: 4, severity: 'medium', text: 'Repeated Aadhaar failure pattern in Loni Bhapkar / Shirsuphal.', time: '2 days ago' },
  { id: 5, severity: 'low', text: 'Normal rainfall but elevated compensation requests in Supe circle.', time: '3 days ago' },
];

export const RAINFALL_INSIGHTS = [
  { circle: 'Loni Bhapkar / Shirsuphal', rainfall: 62, note: 'Lowest rainfall in taluka — stress on bajra and pulses', crop: 'Bajra / Pulses', claims: 178, tone: 'warn' },
  { circle: 'Pandare', rainfall: 66, note: 'Central belt; onion claims elevated vs prior season', crop: 'Onion / Vegetables', claims: 268, tone: 'warn' },
  { circle: 'Baramati (City/Rural)', rainfall: 72, note: 'Highest rainfall band; sugarcane approvals steady', crop: 'Sugarcane', claims: 512, tone: 'info' },
  { circle: 'Morgaon', rainfall: 70, note: 'Near-normal monsoon; religious-fair season footfall claims monitored', crop: 'Sugarcane', claims: 176, tone: 'info' },
];

export const SCHEMES = ['All Schemes', 'PM Fasal Bima Yojana', 'Drip Irrigation', 'Sugarcane Development', 'Equipment Grant', 'Farm Pond'];
export const CROPS = ['All Crops', 'Sugarcane', 'Onion', 'Cotton', 'Jowar', 'Bajra', 'Maize', 'Vegetables'];
