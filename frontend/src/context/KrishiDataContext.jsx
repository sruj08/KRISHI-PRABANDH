import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';

const KrishiDataContext = createContext(null);

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const STATUS_ROT = ['excellent', 'good', 'warning', 'critical'];

const EMPTY = {
  officers: [],
  mandals: [],
  sahayaks: [],
  villages: [],
  stats: {},
  datasetSummary: [],
  surveyEvidence: [],
  surveyApprovals: [],
  auditLogs: [],
  weatherAnalytics: [],
  satelliteAnalytics: [],
  compensationPayments: [],
  agristackFarmers: [],
};

function buildMatrixRow(s, mandalName, villageNamesInCircle, idx) {
  const raw = String(s.mobile || '919999999999').replace(/\D/g, '');
  const whatsapp = raw.length >= 10 ? (raw.startsWith('91') ? raw : `91${raw}`) : '919999999999';
  return {
    id: s.sahayak_id,
    name: s.name,
    status: STATUS_ROT[idx % 4],
    verifications_week: 8 + (idx * 11) % 32,
    avg_days: 2 + (idx % 8),
    overdue_15d: (idx * 3) % 12,
    circle: mandalName,
    villages: villageNamesInCircle.length
      ? villageNamesInCircle
      : [`${mandalName} catchment`],
    trend: [2, 4, 3, 5, 6, 4, 7].map((x, i) => x + ((idx + i) % 5)),
    total_pending: 5 + (idx * 7) % 40,
    last_field_visit: '12 May 2026',
    whatsapp,
  };
}

export function KrishiDataProvider({ children }) {
  const [dataset, setDataset] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}data/krishiDataset.json`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setDataset(d);
          setLoadError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e?.message || String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const villages = dataset?.villages ?? EMPTY.villages;

  const officersById = useMemo(() => {
    const m = {};
    if (!dataset?.officers) return m;
    for (const o of dataset.officers) {
      m[String(o.user_id)] = o;
    }
    return m;
  }, [dataset]);

  const getReportingChain = useCallback(
    (userId) => {
      const chain = [];
      let id = userId != null ? String(userId) : null;
      const seen = new Set();
      while (id && !seen.has(id)) {
        seen.add(id);
        const o = officersById[id];
        if (!o) break;
        chain.push(o);
        const next = o.reports_to_user_id;
        id = next != null && next !== '' ? String(next) : null;
      }
      return chain;
    },
    [officersById],
  );

  const pickOfficerForUiRole = useCallback(
    (uiRole) => {
      if (!dataset?.officers) return null;
      const map = {
        state: 'state',
        division: 'division',
        district: 'district',
        tao: 'tao',
        cao: 'cao',
        officer: 'officer',
        farmer: 'farmer',
      };
      const appRole = map[uiRole];
      if (!appRole) return null;
      return dataset.officers.find((o) => o.appRole === appRole) || null;
    },
    [dataset],
  );

  const loginPayloadFromOfficer = useCallback(
    (o, uiRole) => {
      if (!o || !dataset) return null;
      const base = (o.name || 'U').replace(/_/g, ' ');
      const mandal = dataset.mandals.find(
        (m) => Number(m.circle_id) === Number(o.circle_id),
      );
      const div = dataset.divisions.find(
        (d) => Number(d.division_id) === Number(o.division_id),
      );
      const dist = dataset.districts.find(
        (d) => Number(d.district_id) === Number(o.district_id),
      );
      return {
        role: uiRole,
        user_id: num(o.user_id),
        name: o.label || base,
        username: (base.split(/\s+/)[0] || 'user').slice(0, 24),
        email: o.email,
        mobile: o.mobile,
        district_id: o.district_id != null ? num(o.district_id) : null,
        district_name: dist?.name || mandal?.district_name || null,
        taluka_id: o.taluka_id != null ? num(o.taluka_id) : null,
        taluka_name: mandal?.taluka_name || null,
        circle_id: o.circle_id != null ? num(o.circle_id) : null,
        division_id: o.division_id != null ? num(o.division_id) : null,
        division_name: div?.name || mandal?.division_name || null,
        state_id: o.state_id != null ? num(o.state_id) : 1,
        appRole: o.appRole,
        village_id: o.village_id != null ? num(o.village_id) : null,
      };
    },
    [dataset],
  );

  const buildSahayakMatrixForMandal = useCallback(
    (mandal) => {
      if (!mandal || !dataset) return [];
      const mid = mandal.mandal_id;
      const circleId = mandal.circle_id;
      const vill = villages
        .filter((v) => num(v.circle_id) === num(circleId))
        .map((v) => v.name);
      let pool = dataset.sahayaks.filter((s) => s.mandal_id === mid);
      if (!pool.length && mandal.taluka_id != null) {
        pool = dataset.sahayaks.filter(
          (s) => num(s.taluka_id) === num(mandal.taluka_id),
        );
      }
      if (!pool.length) pool = [...dataset.sahayaks];
      return pool.map((s, idx) =>
        buildMatrixRow(s, mandal.name, vill, idx),
      );
    },
    [dataset, villages],
  );

  const value = useMemo(
    () => ({
      dataset,
      datasetLoading: !dataset && !loadError,
      datasetError: loadError,
      datasetSummary: dataset?.datasetSummary ?? EMPTY.datasetSummary,
      officers: dataset?.officers ?? EMPTY.officers,
      mandals: dataset?.mandals ?? EMPTY.mandals,
      sahayaks: dataset?.sahayaks ?? EMPTY.sahayaks,
      villages,
      stats: dataset?.stats ?? EMPTY.stats,
      surveyEvidence: dataset?.surveyEvidence ?? EMPTY.surveyEvidence,
      surveyApprovals: dataset?.surveyApprovals ?? EMPTY.surveyApprovals,
      auditLogs: dataset?.auditLogs ?? EMPTY.auditLogs,
      weatherAnalytics: dataset?.weatherAnalytics ?? EMPTY.weatherAnalytics,
      satelliteAnalytics: dataset?.satelliteAnalytics ?? EMPTY.satelliteAnalytics,
      compensationPayments: dataset?.compensationPayments ?? EMPTY.compensationPayments,
      agristackFarmers: dataset?.agristackFarmers ?? EMPTY.agristackFarmers,
      getReportingChain,
      pickOfficerForUiRole,
      loginPayloadFromOfficer,
      buildSahayakMatrixForMandal,
    }),
    [
      dataset,
      loadError,
      villages,
      getReportingChain,
      pickOfficerForUiRole,
      loginPayloadFromOfficer,
      buildSahayakMatrixForMandal,
    ],
  );

  if (loadError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui',
          background: '#f3f4f0',
        }}
      >
        <p style={{ fontWeight: 700, color: '#1a1c1a', marginBottom: 8 }}>
          Could not load dataset
        </p>
        <p style={{ color: '#717972', fontSize: 14, marginBottom: 16 }}>{loadError}</p>
        <p style={{ fontSize: 12, color: '#717972' }}>
          Run <code style={{ background: '#e8ebe8', padding: '2px 6px' }}>npm run gen:data</code> from{' '}
          <code style={{ background: '#e8ebe8', padding: '2px 6px' }}>frontend</code> then refresh.
        </p>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f0',
          color: '#396940',
          fontFamily: 'system-ui',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span className="material-symbols-outlined" style={{ marginRight: 10, fontSize: 22 }}>
          hourglass_top
        </span>
        Loading Krishi dataset…
      </div>
    );
  }

  return (
    <KrishiDataContext.Provider value={value}>
      {children}
    </KrishiDataContext.Provider>
  );
}

export const useKrishiData = () => {
  const ctx = useContext(KrishiDataContext);
  if (!ctx) {
    throw new Error('useKrishiData must be used within KrishiDataProvider');
  }
  return ctx;
};
