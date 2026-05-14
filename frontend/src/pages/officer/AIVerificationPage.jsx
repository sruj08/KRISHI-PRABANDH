import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../hooks/useToast.jsx';
import { fetchFlaggedEvidence } from '../../features/surveys/api';
import { fetchKyc } from '../../shared/api/services';
import usePolling from '../../hooks/usePolling';

function OfficerHeader({ centerTitle, centerSubtitle, apiOnline }) {
  return (
    <header
      className="cao-header"
      style={{
        marginLeft: '-var(--sp-6)',
        marginRight: '-var(--sp-6)',
        marginTop: '-var(--sp-6)',
        marginBottom: 'var(--sp-6)',
      }}
    >
      <div className="cao-header-left">
        <div className="logo-text">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginRight: '8px', fontSize: '24px' }}>
            public
          </span>
          Krishi Prabandh - Sahayak
        </div>
      </div>
      <div className="cao-header-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', gap: '16px' }}>
        <span>{centerTitle}</span>
        {centerSubtitle ? (
          <>
            <span style={{ color: 'var(--outline-card)' }}>•</span>
            <span>{centerSubtitle}</span>
          </>
        ) : null}
      </div>
      <div className="cao-header-right">
        <span className="badge badge-verified" style={{ fontSize: '11px', marginRight: '8px' }}>
          {apiOnline ? 'API Live' : 'Offline Mode'}
        </span>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>notifications</span>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>settings</span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'var(--text-dark)',
            cursor: 'pointer',
          }}
        >
          S
        </div>
      </div>
    </header>
  );
}

function riskBadge(score) {
  const n = Number(score) || 0;
  if (n <= 20) return { label: 'SAFE', bg: 'rgba(57,105,64,0.12)', color: 'var(--success)' };
  if (n <= 50) return { label: 'REVIEW', bg: 'rgba(180,83,9,0.12)', color: '#B45309' };
  return { label: 'HIGH RISK', bg: 'rgba(186,26,26,0.12)', color: 'var(--error)' };
}

const AIVerificationPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [kycRecords, setKycRecords] = useState([]);
  const [kycView, setKycView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setApiOnline(true);
    try {
      const [rows, kyc] = await Promise.all([
        fetchFlaggedEvidence(true),
        fetchKyc().catch(() => []),
      ]);
      setItems(rows);
      setKycRecords(Array.isArray(kyc) ? kyc : kyc.results || kyc.kyc || []);
    } catch (e) {
      console.error(e);
      setApiOnline(false);
      setItems([]);
      addToast(t('Could not load verification list.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    load();
  }, [load]);

  usePolling(load, 5000);

  const filtered = useMemo(() => {
    let list = items;
    if (riskFilter === 'high') list = list.filter((x) => Number(x.risk_score) > 50);
    else if (riskFilter === 'review') list = list.filter((x) => {
      const s = Number(x.risk_score);
      return s > 20 && s <= 50;
    });
    else if (riskFilter === 'safe') list = list.filter((x) => Number(x.risk_score) <= 20);
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter((x) => {
        const name = String(x.farmer_name || '').toLowerCase();
        const sn = String(x.survey_number || '').toLowerCase();
        return name.includes(qq) || sn.includes(qq);
      });
    }
    return list;
  }, [items, riskFilter, q]);

  const kycFiltered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return kycRecords;
    return kycRecords.filter((r) => {
      const id = String(r.farmerId || r.farmer_id || '').toLowerCase();
      return id.includes(qq);
    });
  }, [kycRecords, q]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)', animation: 'fadeIn 0.4s ease' }}>
      <OfficerHeader centerTitle={t('Assigned: 5 Villages')} centerSubtitle={t('Sahayak Krushi Adhikari Ramesh Patil')} apiOnline={apiOnline} />

      <div>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>{t('AI Verification Status')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          {t('Applications flagged for review in your villages')}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--sp-5)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${!kycView ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setKycView(false)}
            style={{ fontWeight: 700 }}
          >
            {t('AI Verification')}
          </button>
          <button
            className={`btn btn-sm ${kycView ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setKycView(true)}
            style={{ fontWeight: 700 }}
          >
            {t('KYC Records')} {kycRecords.length > 0 && `(${kycRecords.length})`}
          </button>
        </div>
        {!kycView && (
          <select
            className="card"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-card)', fontSize: 'var(--font-size-sm)' }}
          >
            <option value="all">{t('All Risk Levels')}</option>
            <option value="high">{t('High Risk')}</option>
            <option value="review">{t('Needs Review')}</option>
            <option value="safe">{t('Safe')}</option>
          </select>
        )}
        <input
          className="card"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={kycView ? t('Search farmer ID...') : t('Search farmer or survey number')}
          style={{
            flex: '1 1 220px',
            minWidth: '200px',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--outline-card)',
            fontSize: 'var(--font-size-sm)',
          }}
        />
      </div>

      {kycView ? (
        <>
          {kycFiltered.length === 0 && (
            <div className="glass-panel" style={{ padding: 'var(--sp-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.35 }}>verified_user</span>
              <p style={{ marginTop: 'var(--sp-3)', fontWeight: 600 }}>{t('No KYC records found.')}</p>
            </div>
          )}
          {kycFiltered.map((rec, idx) => {
            const status = rec.status || rec.kycStatus || 'PENDING';
            const verified = status === 'VERIFIED';
            return (
              <div key={rec.farmerId || rec.farmer_id || idx} className="card" style={{ padding: 'var(--sp-4) var(--sp-5)', borderLeft: `4px solid ${verified ? 'var(--success)' : 'var(--error)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--text-dark)' }}>{rec.farmerId || rec.farmer_id || '—'}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                      {rec.farmerName || rec.farmer_name || ''}
                    </div>
                    {rec.documentType || rec.document_type && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                        {t('Document')}: {rec.documentType || rec.document_type}
                      </div>
                    )}
                  </div>
                  <span className="badge" style={{ background: verified ? '#e8f5e9' : '#ffebee', color: verified ? '#2e7d32' : '#c62828', fontWeight: 800 }}>
                    {status}
                  </span>
                </div>
                {(rec.verifiedAt || rec.verified_at) && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 8 }}>
                    {t('Verified')}: {rec.verifiedAt || rec.verified_at}
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <>
          {loading && (
            <div className="text-center text-muted p-6" style={{ fontFamily: 'var(--font-data)' }}>
              {t('Loading…')}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="glass-panel" style={{ padding: 'var(--sp-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.35 }}>shield</span>
              <p style={{ marginTop: 'var(--sp-3)', fontWeight: 600 }}>{t('No flagged cases in your villages')}</p>
            </div>
          )}

          {!loading && filtered.map((row) => {
            const badge = riskBadge(row.risk_score);
            const expanded = openId === row.evidence_id;
            const checks = Array.isArray(row.verification_checks) ? row.verification_checks : [];
            return (
              <div key={row.evidence_id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${badge.color}` }}>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : row.evidence_id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--sp-4) var(--sp-5)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--text-dark)' }}>{row.farmer_name}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                        {t('Scheme')}: {row.scheme}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
                        {t('Village')}: {row.village} • {t('Survey')}: {row.survey_number}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 6 }}>
                        {t('AI Status')}: {row.verification_summary || t('Review Needed')} {expanded ? '▲' : '▼'}
                      </div>
                    </div>
                    <span className="badge" style={{ background: badge.bg, color: badge.color, fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {badge.label} {Number(row.risk_score) > 50 ? '🔴' : ''}
                    </span>
                  </div>
                </button>
                {expanded && (
                  <div style={{ padding: '0 var(--sp-5) var(--sp-5)', borderTop: '1px solid var(--outline-card)' }}>
                    <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {checks.length === 0 && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{t('No verification checks returned.')}</div>
                      )}
                      {checks.map((c, idx) => (
                        <div key={idx} style={{ fontSize: 'var(--font-size-sm)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: c.passed ? 'var(--success)' : 'var(--error)', fontWeight: 800 }}>{c.passed ? '✓' : '✗'}</span>
                          <div>
                            <strong>{c.check_name}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                              {c.passed ? (c.expected || t('OK')) : `${c.check_name} → ${c.found || t('Issue')}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 'var(--sp-4)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                      {t('Fraud Score')}: {Number(row.risk_score) || 0}/100
                    </div>
                    <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => addToast(t('Field visit requested (demo).'), 'success')}>
                        {t('Request Field Visit')}
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => addToast(t('Escalated to TAO (demo).'), 'success')}>
                        {t('Escalate to TAO')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default AIVerificationPage;