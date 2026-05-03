/* =========================================================
   Mock MahaDBT Farmer Database — AgriStack Phone Registry
   ========================================================= */

export const MOCK_FARMER_DB = [
  { phone: '9876543210', name: 'Ramesh Patil',      id: 'MH-7788', village: 'Shirur',     category: 'OBC',  gender: 'Male',   scheme: 'PM-KUSUM' },
  { phone: '9876543211', name: 'Sunita Deshmukh',   id: 'MH-9921', village: 'Shirur',     category: 'Open', gender: 'Female', scheme: 'Drip Irrigation' },
  { phone: '9876543212', name: 'Bajrang Mane',      id: 'MH-4421', village: 'Shirur',     category: 'SC',   gender: 'Male',   scheme: 'Seed Subsidy' },
  { phone: '9876543213', name: 'Parvati Shinde',    id: 'MH-3312', village: 'Shirur',     category: 'ST',   gender: 'Female', scheme: 'PMFBY' },
  { phone: '9876543214', name: 'Vitthal Jadhav',    id: 'MH-6644', village: 'Shirur',     category: 'OBC',  gender: 'Male',   scheme: 'PM-KUSUM' },
  { phone: '9876543215', name: 'Kalavati Nimse',    id: 'MH-8812', village: 'Shirur',     category: 'SC',   gender: 'Female', scheme: 'Drip Irrigation' },
  { phone: '9876543216', name: 'Suresh Kamble',     id: 'MH-2201', village: 'Pabal',      category: 'SC',   gender: 'Male',   scheme: 'Tractor Subsidy' },
  { phone: '9876543217', name: 'Meena Gaikwad',     id: 'MH-5543', village: 'Shirur',     category: 'Open', gender: 'Female', scheme: 'Drip Irrigation' },
  { phone: '9876543218', name: 'Dnyaneshwar More',  id: 'MH-1123', village: 'Shirur',     category: 'OBC',  gender: 'Male',   scheme: 'Seed Subsidy' },
  { phone: '9876543219', name: 'Lalita Waghmare',   id: 'MH-7741', village: 'Shirur',     category: 'ST',   gender: 'Female', scheme: 'PMFBY' },
  { phone: '9876543220', name: 'Maruti Thorat',     id: 'MH-4490', village: 'Shirur',     category: 'Open', gender: 'Male',   scheme: 'PM-KUSUM' },
  { phone: '9876543221', name: 'Sangita Pawar',     id: 'MH-9934', village: 'Shirur',     category: 'OBC',  gender: 'Female', scheme: 'Drip Irrigation' },
  { phone: '9876543222', name: 'Bhagwan Kale',      id: 'MH-6671', village: 'Pabal',      category: 'Open', gender: 'Male',   scheme: 'Tractor Subsidy' },
  { phone: '9876543223', name: 'Rukhmini Dhoble',   id: 'MH-3381', village: 'Shirur',     category: 'SC',   gender: 'Female', scheme: 'Seed Subsidy' },
  { phone: '9876543224', name: 'Ganesh Bhosale',    id: 'MH-2256', village: 'Shirur',     category: 'OBC',  gender: 'Male',   scheme: 'Drip Irrigation' },
  { phone: '9876543225', name: 'Anjali Salve',      id: 'MH-8867', village: 'Shirur',     category: 'ST',   gender: 'Female', scheme: 'PMFBY' },
  { phone: '9876543226', name: 'Raghunath Tupe',    id: 'MH-5512', village: 'Shirur',     category: 'Open', gender: 'Male',   scheme: 'PM-KUSUM' },
  { phone: '9876543227', name: 'Nanda Borade',      id: 'MH-7723', village: 'Shirur',     category: 'OBC',  gender: 'Female', scheme: 'Seed Subsidy' },
  { phone: '9876543228', name: 'Pandurang Gore',    id: 'MH-1198', village: 'Pabal',      category: 'SC',   gender: 'Male',   scheme: 'Drip Irrigation' },
  { phone: '9876543229', name: 'Savita Kulkarni',   id: 'MH-4467', village: 'Shirur',     category: 'Open', gender: 'Female', scheme: 'PMFBY' },
];

export const VILLAGES_LIST = [
  'Shirur', 'Pabal', 'Nighoje', 'Koregaon Bhima', 'Pimpalgaon',
  'Yavat', 'Sanaswadi', 'Kesnand', 'Uruli Devachi', 'Charholi',
];

export const SESSION_TYPES = [
  'Drip Irrigation Awareness Sabha',
  'PM-KUSUM Solar Pump Yojana',
  'Crop Insurance (PMFBY) Guidance',
  'Seed Subsidy Registration',
  'Soil Health Card Distribution',
  'Women Farmer Empowerment Camp',
];

export const lookupPhone = (phone) => {
  const clean = phone.replace(/\D/g, '').slice(-10);
  return MOCK_FARMER_DB.find(f => f.phone === clean) || null;
};
