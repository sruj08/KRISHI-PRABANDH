export const MOCK_TAO_STATS = {
  processed: 450,
  leakagePrevented: "12.5",
  pendingManualAudit: 12
};

export const MOCK_APPLICATIONS = [
  {
    id: "APP-2026-901",
    farmerName: "Baburao Kadam",
    scheme: "Tractor Subsidy",
    riskScore: 92, // High risk
    riskCategory: "High Risk",
    anomalyType: "Duplicate 7/12 Detected",
    details: {
      alert: "[AI Alert: Survey No. 45/2 recently used by 'Suresh Kadam' for Rotavator Subsidy]",
      location: "Shirur",
      amount: "₹1,25,000"
    }
  },
  {
    id: "APP-2026-902",
    farmerName: "Anand Pawar",
    scheme: "Drip Irrigation",
    riskScore: 88, // High risk
    riskCategory: "High Risk",
    anomalyType: "Invoice Date Mismatch",
    details: {
      alert: "[AI Alert: Invoice Date (10-Apr-2026) predates Scheme Approval Date (15-Apr-2026)]",
      location: "Baramati",
      amount: "₹45,000"
    }
  },
  {
    id: "APP-2026-903",
    farmerName: "Vikas More",
    scheme: "Harvester Subsidy",
    riskScore: 85, // High risk
    riskCategory: "High Risk",
    anomalyType: "GPS Media Mismatch",
    details: {
      alert: "[AI Alert: Photo GPS coordinates do not match AgriStack plot boundary. Distance diff: 45km]",
      location: "Indapur",
      amount: "₹2,50,000",
      mediaMismatch: true
    }
  },
  {
    id: "APP-2026-904",
    farmerName: "Ramesh Shinde",
    scheme: "Sprinkler Set",
    riskScore: 12, // Low risk
    riskCategory: "Low Risk",
    anomalyType: null,
    details: {
      location: "Daund",
      amount: "₹25,000"
    }
  },
  {
    id: "APP-2026-905",
    farmerName: "Sunil Patil",
    scheme: "Electric Pump",
    riskScore: 8, // Low risk
    riskCategory: "Low Risk",
    anomalyType: null,
    details: {
      location: "Purandar",
      amount: "₹15,000"
    }
  }
];

export const MOCK_GRIEVANCES = [
  {
    id: "GRV-001",
    farmerName: "Tukaram Bhise",
    category: "Financial Hardship",
    sentiment: "Critical",
    text: "माझ्या अनुदानाची रक्कम अजूनही जमा झालेली नाही. पेरणीची वेळ निघून जात आहे.",
    translated: "My subsidy amount is still not credited. The sowing season is passing by.",
    date: "2026-05-07"
  },
  {
    id: "GRV-002",
    farmerName: "Kishor Jadhav",
    category: "Data Correction",
    sentiment: "Normal",
    text: "माझ्या अर्जात बँक खात्याचा क्रमांक चुकीचा नोंदवला गेला आहे.",
    translated: "My bank account number was entered incorrectly in the application.",
    date: "2026-05-08"
  }
];
