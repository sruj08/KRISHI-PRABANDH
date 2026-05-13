/**
 * Merges repo CSV/ into frontend/public/data/krishiDataset.json (runtime fetch, not bundled).
 * Run from repo root: node scripts/build-krishi-dataset.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CSV_DIR = path.join(ROOT, 'CSV');
const OUT = path.join(ROOT, 'frontend', 'public', 'data', 'krishiDataset.json');

function parseCSV(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i++];
    if (inQuotes) {
      if (c === '"') {
        if (text[i] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell !== '')) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    headers.forEach((h, j) => {
      o[h] = r[j] !== undefined ? r[j].trim() : '';
    });
    return o;
  });
}

function read(name) {
  const p = path.join(CSV_DIR, name);
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
  return parseCSV(fs.readFileSync(p, 'utf8'));
}

function readOptional(name) {
  const p = path.join(CSV_DIR, name);
  if (!fs.existsSync(p)) return [];
  return parseCSV(fs.readFileSync(p, 'utf8'));
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function countBy(rows, key) {
  const o = {};
  for (const r of rows) {
    const k = String(r[key] ?? '');
    o[k] = (o[k] || 0) + 1;
  }
  return o;
}

function sumBy(rows, keyGroup, keyNum) {
  const o = {};
  for (const r of rows) {
    const k = String(r[keyGroup] ?? '');
    o[k] = (o[k] || 0) + num(r[keyNum]);
  }
  return o;
}

function main() {
  const states = read('states.csv');
  const divisions = read('divisions.csv');
  const districts = read('districts.csv');
  const talukas = read('talukas.csv');
  const circles = read('circles.csv');
  const villages = read('villages.csv');
  const schemes = read('schemes.csv');
  const users = read('users.csv');
  const farmerProfiles = read('farmer_profiles.csv');
  const farms = read('farms.csv');
  const surveys = read('surveys.csv');

  const talukaById = Object.fromEntries(talukas.map((t) => [String(t.taluka_id), t]));
  const districtById = Object.fromEntries(districts.map((d) => [String(d.district_id), d]));
  const divisionById = Object.fromEntries(divisions.map((d) => [String(d.division_id), d]));
  const circlesByTaluka = {};
  for (const c of circles) {
    const tid = String(c.taluka_id);
    if (!circlesByTaluka[tid]) circlesByTaluka[tid] = [];
    circlesByTaluka[tid].push(c);
  }
  for (const k of Object.keys(circlesByTaluka)) {
    circlesByTaluka[k].sort((a, b) => num(a.circle_id) - num(b.circle_id));
  }
  const villagesByCircle = {};
  for (const v of villages) {
    const cid = String(v.circle_id);
    if (!villagesByCircle[cid]) villagesByCircle[cid] = [];
    villagesByCircle[cid].push(v);
  }

  /** First circle id for taluka */
  function firstCircleIdForTaluka(talukaId) {
    const list = circlesByTaluka[String(talukaId)];
    return list?.length ? list[0].circle_id : null;
  }

  const stateUsers = users.filter((u) => u.role === 'STATE_AUTHORITY');
  const divUsers = users.filter((u) => u.role === 'DIVISIONAL_AUTHORITY');
  const distUsers = users.filter((u) => u.role === 'DISTRICT_AUTHORITY');
  const talukaUsers = users.filter((u) => u.role === 'TALUKA_AUTHORITY');
  const talathiUsers = users.filter((u) => u.role === 'TALATHI');
  const sahUsers = users.filter((u) => u.role === 'KRUSHI_SAHAYAK');
  const farmerUsers = users.filter((u) => u.role === 'FARMER');

  const officers = [];

  function pushOfficer(base, extra) {
    const { password: _p, ...rest } = base;
    officers.push({ ...rest, ...extra });
  }

  stateUsers.forEach((u, i) => {
    pushOfficer(u, {
      appRole: 'state',
      state_id: 1,
      division_id: null,
      district_id: null,
      taluka_id: null,
      circle_id: null,
      village_id: null,
      reports_to_user_id: null,
      label: u.name?.replace(/_/g, ' ') || `State ${i}`,
    });
  });

  divUsers.forEach((u, i) => {
    const division_id = (i % divisions.length) + 1;
    const head = stateUsers[i % stateUsers.length];
    pushOfficer(u, {
      appRole: 'division',
      state_id: 1,
      division_id,
      district_id: null,
      taluka_id: null,
      circle_id: null,
      village_id: null,
      reports_to_user_id: head ? num(head.user_id) : null,
      label: `${divisionById[String(division_id)]?.name || 'Division'} — ${u.name?.replace(/_/g, ' ')}`,
    });
  });

  distUsers.forEach((u, i) => {
    const district_id = (i % districts.length) + 1;
    const d = districtById[String(district_id)];
    const division_id = d ? num(d.division_id) : 1;
    const divBoss = divUsers.find((_, j) => ((j % divisions.length) + 1) === division_id) || divUsers[0];
    pushOfficer(u, {
      appRole: 'district',
      state_id: 1,
      division_id,
      district_id,
      taluka_id: null,
      circle_id: null,
      village_id: null,
      reports_to_user_id: divBoss ? num(divBoss.user_id) : null,
      label: `${d?.name || 'District'} DAO`,
    });
  });

  /** TAO: first 8 taluka authorities; CAO: remaining 7 — same taluka ladder, different appRole for UI */
  talukaUsers.forEach((u, i) => {
    const taluka_id = (i % talukas.length) + 1;
    const t = talukaById[String(taluka_id)];
    const d = t ? districtById[String(t.district_id)] : null;
    const division_id = d ? num(d.division_id) : 1;
    const distBoss = distUsers.find((_, j) => {
      const did = (j % districts.length) + 1;
      return did === num(t?.district_id);
    }) || distUsers[i % distUsers.length];
    const appRole = i < 8 ? 'tao' : 'cao';
    pushOfficer(u, {
      appRole,
      state_id: 1,
      division_id,
      district_id: t ? num(t.district_id) : null,
      taluka_id,
      circle_id: firstCircleIdForTaluka(taluka_id),
      village_id: null,
      reports_to_user_id: distBoss ? num(distBoss.user_id) : null,
      label: appRole === 'cao' ? `${t?.name || 'Taluka'} (Mandal / CAO)` : `${t?.name || 'Taluka'} (TAO)`,
    });
  });

  talathiUsers.forEach((u, i) => {
    const taluka_id = (i % talukas.length) + 1;
    const circlesInT = circlesByTaluka[String(taluka_id)] || [];
    const circle = circlesInT[i % Math.max(circlesInT.length, 1)] || circles[i % circles.length];
    const circle_id = circle ? num(circle.circle_id) : null;
    const vs = circle_id != null ? villagesByCircle[String(circle_id)] : [];
    const village_id = vs.length ? num(vs[0].village_id) : null;
    const t = talukaById[String(taluka_id)];
    const d = t ? districtById[String(t.district_id)] : null;
    const division_id = d ? num(d.division_id) : 1;
    const taoBoss = talukaUsers.find((_, j) => j === i % talukaUsers.length);
    pushOfficer(u, {
      appRole: 'talathi',
      state_id: 1,
      division_id,
      district_id: t ? num(t.district_id) : null,
      taluka_id,
      circle_id,
      village_id,
      reports_to_user_id: taoBoss ? num(taoBoss.user_id) : null,
      label: `Talathi — ${circle?.name || 'Circle'}`,
    });
  });

  sahUsers.forEach((u, i) => {
    const taluka_id = (i % talukas.length) + 1;
    const circlesInT = circlesByTaluka[String(taluka_id)] || [];
    const circle = circlesInT[0] || circles[i % circles.length];
    const circle_id = circle ? num(circle.circle_id) : i + 1;
    const t = talukaById[String(taluka_id)];
    const d = t ? districtById[String(t.district_id)] : null;
    const division_id = d ? num(d.division_id) : 1;
    const taoBoss = talukaUsers.find((_, j) => (j % talukas.length) + 1 === taluka_id) || talukaUsers[0];
    pushOfficer(u, {
      appRole: 'officer',
      state_id: 1,
      division_id,
      district_id: t ? num(t.district_id) : null,
      taluka_id,
      circle_id,
      village_id: null,
      reports_to_user_id: taoBoss ? num(taoBoss.user_id) : null,
      label: u.name?.replace(/_/g, ' ') || `Sahayak ${i}`,
    });
  });

  const profileByUserId = Object.fromEntries(
    farmerProfiles.map((p) => [String(p.user_id), p]),
  );

  farmerUsers.forEach((u) => {
    const p = profileByUserId[String(u.user_id)];
    const district_id = p ? num(p.district_id) : ((num(u.user_id) % districts.length) + 1);
    const taluka_id = p ? num(p.taluka_id) : null;
    const village_id = p ? num(p.village_id) : null;
    const d = districtById[String(district_id)];
    const division_id = d ? num(d.division_id) : 1;
    const sah = sahUsers[num(u.user_id) % sahUsers.length];
    pushOfficer(u, {
      appRole: 'farmer',
      state_id: 1,
      division_id,
      district_id,
      taluka_id,
      circle_id: taluka_id ? firstCircleIdForTaluka(taluka_id) : null,
      village_id,
      reports_to_user_id: sah ? num(sah.user_id) : null,
      label: u.name || 'Farmer',
    });
  });

  const mandals = circles.map((c) => {
    const t = talukaById[String(c.taluka_id)];
    const d = t ? districtById[String(t.district_id)] : null;
    const dv = d ? divisionById[String(d.division_id)] : null;
    const mandal_id = `C${String(c.circle_id).padStart(3, '0')}`;
    return {
      mandal_id,
      circle_id: num(c.circle_id),
      name: c.name,
      taluka_id: t ? num(t.taluka_id) : null,
      taluka_name: t?.name || '',
      taluka: t?.name || '',
      district_id: d ? num(d.district_id) : null,
      district_name: d?.name || '',
      district: d?.name || '',
      division_id: dv ? num(dv.division_id) : null,
      division_name: dv?.name || '',
      state_id: 1,
    };
  });

  const sahayaks = officers
    .filter((o) => o.appRole === 'officer')
    .map((o) => ({
      sahayak_id: `KS${o.user_id}`,
      mandal_id: `C${String(o.circle_id).padStart(3, '0')}`,
      circle_id: o.circle_id,
      user_id: num(o.user_id),
      name: o.label || o.name,
      email: o.email,
      mobile: o.mobile,
      taluka_id: o.taluka_id,
      district_id: o.district_id,
      reports_to_user_id: o.reports_to_user_id,
    }));

  const surveysByDistrict = {};
  const farmsLite = farms.map((f) => ({
    farm_id: num(f.farm_id),
    farmer_id: num(f.farmer_id),
    survey_number: f.survey_number,
    gat_number: f.gat_number,
    farm_area_hectare: num(f.farm_area_hectare),
    village_id: num(f.village_id),
    soil_type: f.soil_type,
    irrigation_type: f.irrigation_type,
  }));

  const villageToDistrict = {};
  for (const v of villages) {
    const c = circles.find((x) => String(x.circle_id) === String(v.circle_id));
    if (!c) continue;
    const t = talukaById[String(c.taluka_id)];
    if (t) villageToDistrict[String(v.village_id)] = num(t.district_id);
  }

  for (const s of surveys) {
    const f = farmsLite.find((x) => x.farm_id === num(s.farm_id));
    const vid = f?.village_id;
    const did = vid != null ? villageToDistrict[String(vid)] : null;
    if (did != null) {
      surveysByDistrict[did] = (surveysByDistrict[did] || 0) + 1;
    }
  }

  const surveysLite = surveys.map((s) => ({
    survey_id: num(s.survey_id),
    survey_reference: s.survey_reference,
    farmer_id: num(s.farmer_id),
    farm_id: num(s.farm_id),
    scheme_id: num(s.scheme_id),
    crop_name: s.crop_name,
    status: s.status,
    loss_percentage: num(s.loss_percentage),
    fraud_risk_score: num(s.fraud_risk_score),
    compensation_amount: num(s.compensation_amount),
  }));

  const surveyIdToDistrict = {};
  for (const s of surveys) {
    const f = farmsLite.find((x) => x.farm_id === num(s.farm_id));
    const vid = f?.village_id;
    const did = vid != null ? villageToDistrict[String(vid)] : null;
    if (did != null) surveyIdToDistrict[String(s.survey_id)] = did;
  }

  const surveyEvidenceRaw = read('survey_evidence.csv');
  const surveyEvidence = surveyEvidenceRaw.map((e) => ({
    evidence_id: num(e.evidence_id),
    survey_id: num(e.survey_id),
    file_type: e.file_type,
    file_url: (e.file_url || '').slice(0, 160),
    gps_lat: num(e.gps_lat),
    gps_lng: num(e.gps_lng),
    captured_at: e.captured_at,
    ai_analysis:
      (e.ai_analysis || '').length > 400
        ? `${(e.ai_analysis || '').slice(0, 400)}…`
        : e.ai_analysis || '',
  }));

  const surveyApprovalsRaw = read('survey_approvals.csv');
  const surveyApprovals = surveyApprovalsRaw.map((a) => ({
    approval_id: num(a.approval_id),
    survey_id: num(a.survey_id),
    approved_by: num(a.approved_by),
    role: a.role,
    approval_level: num(a.approval_level),
    status: a.status,
    remarks: (a.remarks || '').slice(0, 300),
    modified_loss_percentage: num(a.modified_loss_percentage),
  }));

  const auditLogsRaw = read('audit_logs.csv');
  const auditLogs = auditLogsRaw.map((a) => ({
    audit_id: num(a.audit_id),
    user_id: num(a.user_id),
    entity_name: a.entity_name,
    entity_id: num(a.entity_id),
    action_type: a.action_type,
  }));

  const weatherAnalyticsRaw = read('weather_analytics.csv');
  const weatherAnalytics = weatherAnalyticsRaw.map((w) => ({
    weather_id: num(w.weather_id),
    survey_id: num(w.survey_id),
    rainfall_mm: num(w.rainfall_mm),
    weather_source: w.weather_source,
    anomaly_score: num(w.anomaly_score),
    weather_metadata:
      (w.weather_metadata || '').length > 200
        ? `${(w.weather_metadata || '').slice(0, 200)}…`
        : w.weather_metadata || '',
  }));

  const satelliteAnalyticsRaw = read('satellite_analytics.csv');
  const satelliteAnalytics = satelliteAnalyticsRaw.map((s) => ({
    satellite_id: num(s.satellite_id),
    survey_id: num(s.survey_id),
    ndvi_before: num(s.ndvi_before),
    ndvi_after: num(s.ndvi_after),
    vegetation_loss: num(s.vegetation_loss),
    satellite_source: s.satellite_source,
  }));

  const compensationPaymentsRaw = read('compensation_payments.csv');
  const compensationPayments = compensationPaymentsRaw.map((p) => ({
    payment_id: num(p.payment_id),
    survey_id: num(p.survey_id),
    beneficiary_id: num(p.beneficiary_id),
    payment_reference: p.payment_reference,
    amount: num(p.amount),
    payment_status: p.payment_status,
  }));

  const evidenceCountByDistrict = {};
  for (const e of surveyEvidence) {
    const did = surveyIdToDistrict[String(e.survey_id)];
    if (did != null) {
      evidenceCountByDistrict[did] = (evidenceCountByDistrict[did] || 0) + 1;
    }
  }

  const paymentsAmountByStatus = sumBy(
    compensationPayments,
    'payment_status',
    'amount',
  );

  const farmerProfilesLite = farmerProfiles.map((p) => ({
    profile_id: num(p.profile_id),
    user_id: num(p.user_id),
    farmer_id_external: p.farmer_id_external,
    district_id: num(p.district_id),
    taluka_id: num(p.taluka_id),
    village_id: num(p.village_id),
    kyc_status: p.kyc_status,
  }));

  const districtNameToId = Object.fromEntries(
    districts.map((d) => [String(d.name || '').trim().toLowerCase(), num(d.district_id)]),
  );
  const talukasByDistrictId = {};
  for (const t of talukas) {
    const key = String(t.district_id);
    if (!talukasByDistrictId[key]) talukasByDistrictId[key] = [];
    talukasByDistrictId[key].push(t);
  }

  function resolveTalukaIdForAgristack(districtId, talukaLabel) {
    if (!districtId || !talukaLabel) return null;
    const list = talukasByDistrictId[String(districtId)] || [];
    const needle = String(talukaLabel).trim().toLowerCase().replace(/_/g, ' ');
    const token = needle.split(/\s+/)[0];
    const hit = list.find((t) => {
      const nm = String(t.name || '').toLowerCase();
      return nm.includes(needle) || nm.includes(token) || needle.includes(nm.split('_')[0]);
    });
    return hit ? num(hit.taluka_id) : null;
  }

  const agristackRaw = readOptional('agristack_mock_farmers.csv');
  const agristackFarmers = agristackRaw.map((row) => {
    const dname = String(row.district || '').trim().toLowerCase();
    const district_id = districtNameToId[dname] ?? null;
    const taluka_id = district_id
      ? resolveTalukaIdForAgristack(district_id, row.taluka)
      : null;
    return {
      farmer_id: row.farmer_id,
      username: row.username,
      full_name: row.full_name,
      gender: row.gender,
      age: num(row.age),
      category: row.category,
      mobile: row.mobile,
      district: row.district,
      district_id,
      taluka: row.taluka,
      taluka_id,
      village: row.village,
      pincode: row.pincode,
      land_holding_ha: num(row.land_holding_ha),
      primary_crop: row.primary_crop,
      secondary_crop: row.secondary_crop,
      registration_date: row.registration_date,
      status: row.status,
      soil_type: row.soil_type,
      irrigation_source: row.irrigation_source,
      source: 'agristack_mock',
    };
  });

  const agristackByDistrictName = {};
  for (const r of agristackFarmers) {
    const k = (r.district || 'Unknown').trim() || 'Unknown';
    agristackByDistrictName[k] = (agristackByDistrictName[k] || 0) + 1;
  }

  const datasetSummary = read('dataset_summary.csv');

  const dataset = {
    generatedAt: new Date().toISOString(),
    datasetSummary,
    states,
    divisions,
    districts,
    talukas,
    circles,
    villages,
    schemes,
    officers,
    mandals,
    sahayaks,
    farmerProfiles: farmerProfilesLite,
    agristackFarmers,
    farms: farmsLite,
    surveys: surveysLite,
    surveyEvidence,
    surveyApprovals,
    auditLogs,
    weatherAnalytics,
    satelliteAnalytics,
    compensationPayments,
    stats: {
      surveyCountByDistrict: surveysByDistrict,
      evidenceCountByDistrict,
      totalSurveys: surveys.length,
      totalFarms: farms.length,
      totalFarmers: farmerUsers.length,
      totalOfficers: officers.length,
      totalAgristackFarmers: agristackFarmers.length,
      agristackByDistrictName,
      totalSurveyEvidence: surveyEvidence.length,
      totalSurveyApprovals: surveyApprovals.length,
      totalAuditLogs: auditLogs.length,
      totalWeatherRows: weatherAnalytics.length,
      totalSatelliteRows: satelliteAnalytics.length,
      totalCompensationPayments: compensationPayments.length,
      approvalsByStatus: countBy(surveyApprovals, 'status'),
      auditByEntity: countBy(auditLogs, 'entity_name'),
      auditByAction: countBy(auditLogs, 'action_type'),
      paymentsByStatus: countBy(compensationPayments, 'payment_status'),
      paymentsAmountByStatus,
      weatherHighAnomalyCount: weatherAnalytics.filter((w) => w.anomaly_score >= 70)
        .length,
      satelliteAvgVegetationLoss:
        satelliteAnalytics.length > 0
          ? Math.round(
              (satelliteAnalytics.reduce(
                (a, s) => a + s.vegetation_loss,
                0,
              ) /
                satelliteAnalytics.length) *
                100,
            ) / 100
          : 0,
    },
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(dataset));
  const mb = (fs.statSync(OUT).size / (1024 * 1024)).toFixed(2);
  console.log(`Wrote ${OUT} (${mb} MB)`);
}

main();
