const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('AgriStack_Mock_DB_Cleaned.xlsx');
const sheetName = '5_Scheme_Applications';

if (!workbook.Sheets[sheetName]) {
  console.log("Sheet not found!");
  process.exit(1);
}

const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

const parseDateStr = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.toString().trim().split('-');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
  }
  return new Date(dateStr);
};

const formatDate = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const y = dateObj.getUTCFullYear();
  return `${d}-${m}-${y}`;
};

// First pass: extract and parse dates, find max date
let maxTime = 0;
const parsedData = data.map(row => {
  const application_date = (row.Application_Date || '').toString().trim();
  const dateObj = parseDateStr(application_date);
  if (dateObj && !isNaN(dateObj.getTime())) {
    if (dateObj.getTime() > maxTime) maxTime = dateObj.getTime();
  }
  return {
    ...row,
    parsedDate: dateObj
  };
});

// Calculate shift (make maxTime = today)
const now = new Date().getTime();
const timeShift = maxTime > 0 ? now - maxTime : 0;

const normalizedData = parsedData.map(row => {
  let shiftedDateStr = '';
  if (row.parsedDate && !isNaN(row.parsedDate.getTime())) {
    const shiftedTime = row.parsedDate.getTime() + timeShift;
    shiftedDateStr = formatDate(new Date(shiftedTime));
  }

  return {
    application_id: (row.Application_ID || '').toString().trim(),
    farmer_id: (row.Farmer_ID || '').toString().trim(),
    scheme_name: (row.Scheme_Name || '').toString().trim(),
    scheme_category: (row.Scheme_Category || '').toString().trim(),
    component: (row.Component || '').toString().trim(),
    application_date: shiftedDateStr,
    status: (row.Status || '').toString().trim(),
    l1_officer_id: (row.L1_Officer_ID || '').toString().trim(),
    l2_officer_id: (row.L2_Officer_ID || '').toString().trim(),
    remarks: (row.Remarks || '').toString().trim(),
    rejection_reason: (row.Rejection_Reason || '').toString().trim()
  };
});

const fileContent = `export const applicationsData = ${JSON.stringify(normalizedData, null, 2)};\n`;

fs.mkdirSync('frontend/src/data', { recursive: true });
fs.writeFileSync('frontend/src/data/applications.js', fileContent);

console.log("Data extracted and dates shifted successfully. Length:", normalizedData.length);
