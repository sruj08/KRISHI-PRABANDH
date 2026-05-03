import React, { useState } from 'react';
import { FERTILIZER_SHOPS } from '../../../utils/caoMockData';
import { SAHAYAKS } from '../../../utils/caoMockData';

const getDaysSince = (dateStr) =>
  Math.floor((new Date() - new Date(dateStr)) / 86400000);

const getShopStatus = (days, complaints) => {
  if (days > 90 || complaints >= 4)
    return { label: 'Overdue', color: '#ba1a1a', bg: '#ffdad6', icon: 'warning' };
  if (days > 60 || complaints >= 2)
    return { label: 'Due Soon', color: '#e07800', bg: '#fff3e0', icon: 'schedule' };
  return { label: 'OK', color: '#2D6A4F', bg: '#ebf7f1', icon: 'check_circle' };
};

const ShopTracker = () => {
  const [selected, setSelected] = useState(null);
  const [assigningSahayak, setAssigningSahayak] = useState(null);
  const [assigned, setAssigned] = useState({});

  const shops = FERTILIZER_SHOPS.map(s => ({
    ...s,
    days: getDaysSince(s.last_inspected),
    status: getShopStatus(getDaysSince(s.last_inspected), s.stock_complaints),
  })).sort((a, b) => b.days - a.days);

  const handleAssign = (shopId, sahayakName) => {
    setAssigned(prev => ({ ...prev, [shopId]: sahayakName }));
    setAssigningSahayak(null);
    setSelected(null);
  };

  return (
    <div className="shop-tracker-wrap">
      {/* Summary bar */}
      <div className="shop-summary-bar">
        {[
          { label: 'Overdue (90d+)', count: shops.filter(s => s.days > 90).length, color: '#ba1a1a' },
          { label: 'Due Soon',       count: shops.filter(s => s.days > 60 && s.days <= 90).length, color: '#e07800' },
          { label: 'Compliant',      count: shops.filter(s => s.days <= 60).length, color: '#2D6A4F' },
        ].map((s, i) => (
          <div key={i} className="shop-summary-item" style={{ '--sc': s.color }}>
            <span className="shop-summary-count">{s.count}</span>
            <span className="shop-summary-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Shop list */}
      <div className="shop-list">
        {shops.map((shop) => (
          <div key={shop.id}
            className={`shop-row ${selected === shop.id ? 'shop-row--active' : ''}`}
            style={{ borderLeft: `4px solid ${shop.status.color}` }}
            onClick={() => setSelected(selected === shop.id ? null : shop.id)}>

            <div className="shop-row-main">
              <div className="shop-row-left">
                <div className="shop-icon-wrap" style={{ background: shop.status.bg }}>
                  <span className="material-symbols-outlined" style={{ color: shop.status.color }}>storefront</span>
                </div>
                <div>
                  <div className="shop-name">
                    {shop.name}
                    {shop.status.label !== 'OK' && (
                      <span className="shop-overdue-tag" style={{ background: shop.status.bg, color: shop.status.color }}>
                        <span className="material-symbols-outlined">{shop.status.icon}</span>
                        {shop.status.label}
                      </span>
                    )}
                  </div>
                  <div className="shop-meta">{shop.village} · {shop.owner}</div>
                </div>
              </div>
              <div className="shop-row-right">
                <div className="shop-days" style={{ color: shop.status.color }}>{shop.days}d</div>
                {shop.stock_complaints > 0 && (
                  <div className="shop-complaints">
                    <span className="material-symbols-outlined">report</span>
                    {shop.stock_complaints}
                  </div>
                )}
                {assigned[shop.id] && (
                  <span className="shop-assigned-tag">
                    <span className="material-symbols-outlined">assignment_ind</span>
                    {assigned[shop.id].split(' ')[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded detail */}
            {selected === shop.id && (
              <div className="shop-detail">
                <div className="shop-detail-grid">
                  <div><span>License</span><strong>{shop.license}</strong></div>
                  <div><span>Last Inspected</span><strong>{shop.last_inspected}</strong></div>
                  <div><span>Days Ago</span><strong style={{ color: shop.status.color }}>{shop.days} days</strong></div>
                  <div><span>Complaints</span><strong style={{ color: shop.stock_complaints > 2 ? '#ba1a1a' : '#2D6A4F' }}>{shop.stock_complaints}</strong></div>
                </div>

                {assigningSahayak === shop.id ? (
                  <div className="shop-assign-picker">
                    <div className="shop-assign-title">Assign Inspection to:</div>
                    {SAHAYAKS.map(s => (
                      <button key={s.id} className="shop-sahayak-btn" onClick={() => handleAssign(shop.id, s.name)}>
                        <span className="material-symbols-outlined">person</span>
                        {s.name} — Circle {s.circle}
                      </button>
                    ))}
                    <button className="shop-cancel-btn" onClick={() => setAssigningSahayak(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="shop-actions">
                    <button className="shop-assign-primary" onClick={(e) => { e.stopPropagation(); setAssigningSahayak(shop.id); }}>
                      <span className="material-symbols-outlined">assignment_ind</span>
                      Assign Sahayak Inspection
                    </button>
                    <button className="shop-whatsapp-btn">
                      <span className="material-symbols-outlined">chat</span>
                      Alert Owner
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopTracker;
