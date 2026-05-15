import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geoAsset } from '../../../utils/geoAsset';
import { buildMandalHeatmapClippedToTaluka } from '../../../utils/taoMandalHeatmap';

/** Baramati Assembly Constituency boundary - outer fence; mandals are Voronoi-clipped inside this ring. */
const GEO_URL = geoAsset('geo/baramati-ac.json');

/** Choropleth fill from 0 (low load) → 1 (high load), never outside taluka geometry. */
const heatFillColor = (t) => {
  const h = Math.max(0, Math.min(1, t));
  if (h < 0.36) return '#2e7d32';
  if (h < 0.68) return '#f57c00';
  return '#c62828';
};

const heatFillOpacity = (t) => {
  const h = Math.max(0, Math.min(1, t));
  return 0.14 + h * 0.5;
};

const getStatusColor = (status) => {
  if (status === 'Clear') return '#2e7d32';
  if (status === 'Warning') return '#f57c00';
  if (status === 'Critical') return '#d32f2f';
  return '#1976d2';
};

/**
 * Fits the map to a Leaflet bounds object and locks the view so the
 * TAO can zoom IN to inspect mandals but cannot zoom OUT past the
 * taluka nor pan into neighbouring talukas.
 */
function FitTaluka({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds || !bounds.isValid()) return;
    map.setMinZoom(0);
    map.setMaxBounds(null);
    map.fitBounds(bounds, { padding: [20, 20], animate: false });
    const fitZoom = map.getZoom();
    map.setMinZoom(fitZoom);
    map.setMaxBounds(bounds.pad(0.05));
    map.options.maxBoundsViscosity = 1.0;
  }, [bounds, map]);
  return null;
}

const MANDAL_HOVER = {
  color: '#1a1c1a',
  weight: 2,
  opacity: 0.85,
  fillOpacity: 0.55,
};

function MandalBoundariesLayer({ mandalGeo, onSelectMandal }) {
  const gjRef = useRef(null);

  const styleFn = useCallback((feature) => {
    const p = feature?.properties || {};
    const heat = typeof p.heat === 'number' ? p.heat : typeof p.intensity === 'number' ? p.intensity : 0.2;
    return {
      color: '#5c6560',
      weight: 1,
      opacity: 0.55,
      fillColor: heatFillColor(heat),
      fillOpacity: heatFillOpacity(heat),
    };
  }, []);

  const bindLayer = useCallback((feature, layer) => {
    const p = feature?.properties;
    if (!p || p.kind !== 'mandal') return;
    const heat = typeof p.heat === 'number' ? p.heat : 0;
    const fill = heatFillColor(heat);
    const pct = Math.round(heat * 100);
    /* Compact panel - same structure as district taluka tooltip (readable, solid white). */
    const html = `
      <div style="min-width:172px;line-height:1.45;position:relative;padding-right:14px">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#222">${p.name} Mandal</div>
        <div style="font-size:11px;color:#222">Load index: <b>${pct}%</b></div>
        <div style="font-size:11px;color:#222">Pending files: <b>${p.pending ?? 0}</b></div>
        <div style="font-size:11px;color:#222">Fraud alerts: <b>${p.fraudAlerts ?? 0}</b></div>
        <span style="position:absolute;right:6px;bottom:2px;width:8px;height:8px;border-radius:50%;background:${fill};display:inline-block" aria-hidden="true"></span>
      </div>`;
    layer.bindTooltip(html, {
      sticky: false,
      direction: 'auto',
      opacity: 1,
      className: 'tao-mandal-tooltip district-taluka-tooltip',
    });
    layer.on({
      click: () => {
        onSelectMandal?.({
          id: p.id,
          name: p.name,
          marathi: p.marathi,
          caoName: p.caoName || '-',
          status: p.status || 'Clear',
          pending: p.pending ?? 0,
          fraudAlerts: p.fraudAlerts ?? 0,
          description: p.description,
          heat: heat,
        });
      },
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle({ ...MANDAL_HOVER, fillColor: heatFillColor(heat) });
        lyr.bringToFront();
      },
      mouseout: (e) => {
        const lyr = e.target;
        const f = lyr?.feature;
        if (f) lyr.setStyle(styleFn(f));
        else {
          const ref = gjRef.current;
          if (ref && typeof ref.resetStyle === 'function') ref.resetStyle(lyr);
        }
      },
    });
  }, [onSelectMandal, styleFn]);

  if (!mandalGeo?.features?.length) return null;

  return (
    <GeoJSON
      ref={gjRef}
      data={mandalGeo}
      style={styleFn}
      onEachFeature={bindLayer}
    />
  );
}

const TAOMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => { if (!cancelled) setGeoData(j); })
      .catch((e) => { if (!cancelled) setLoadErr(e.message || 'Failed to load Baramati AC boundary'); });
    return () => { cancelled = true; };
  }, []);

  /**
   * Outer fence for fit / mask: explicit `kind: taluka` features (legacy Haveli file),
   * or the whole collection when using AC GeoJSON (e.g. baramati-ac.json) with no `kind`.
   */
  const boundaryGeo = useMemo(() => {
    if (!geoData?.features?.length) return null;
    const talukaOnly = geoData.features.filter((f) => f?.properties?.kind === 'taluka');
    if (talukaOnly.length) {
      return { type: 'FeatureCollection', features: talukaOnly };
    }
    return geoData;
  }, [geoData]);

  /**
   * Mandal polygons: use `kind: mandal` from GeoJSON when present (e.g. Haveli demo file),
   * otherwise build Voronoi cells from seed points and **clip strictly** to the outer boundary
   * so heat never spills outside the taluka / AC fence.
   */
  const mandalGeo = useMemo(() => {
    if (!boundaryGeo?.features?.length) return null;
    const fileMandals = (geoData?.features || []).filter((f) => f?.properties?.kind === 'mandal');
    if (fileMandals.length) {
      return { type: 'FeatureCollection', features: fileMandals };
    }
    const outer = boundaryGeo.features[0];
    return buildMandalHeatmapClippedToTaluka(outer);
  }, [boundaryGeo, geoData]);

  /** Fence outline + bounds derived from boundary features. */
  const boundaryBounds = useMemo(() => {
    if (!boundaryGeo?.features?.length) return null;
    const gj = L.geoJSON(boundaryGeo);
    const b = gj.getBounds();
    return b.isValid() ? b : null;
  }, [boundaryGeo]);

  /** World-sized polygon with the area cut out as a hole. */
  const focusMaskGeo = useMemo(() => {
    if (!boundaryGeo?.features?.length) return null;
    const holes = [];
    for (const f of boundaryGeo.features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === 'Polygon') holes.push(g.coordinates[0]);
      else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) holes.push(poly[0]);
    }
    if (!holes.length) return null;
    return {
      type: 'Feature',
      properties: { kind: 'focus-mask' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
          ...holes,
        ],
      },
    };
  }, [boundaryGeo]);

  const styleBoundaryFence = useCallback(() => ({
    color: '#003978',
    weight: 3,
    fillColor: '#0055A4',
    fillOpacity: 0.04,
    dashArray: '8 5',
    interactive: false,
  }), []);

  /** Initial center inside Baramati AC; FitTaluka snaps to GeoJSON bounds. */
  const center = [18.22, 74.35];

  return (
    <div className="card tao-map-root" style={{ padding: '0', overflow: 'hidden', border: 'none', borderRadius: 0, background: 'transparent', display: 'flex', flexDirection: 'column', width: '100%', minHeight: 480 }}>
      <div style={{ padding: '18px 28px', background: '#fff', borderBottom: '1px solid #e2e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', minHeight: '70px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 className="fw-bold m-0" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3 }}>Baramati taluka - mandal load map</h3>
          <p className="text-sm text-muted m-0" style={{ marginTop: '5px', fontSize: '11.5px', lineHeight: 1.4 }}>Voronoi mandal cells clipped to the published boundary · choropleth by pending + fraud</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, alignItems: 'center' }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 14, height: 8, borderRadius: 2, background: 'linear-gradient(90deg,#2e7d32,#f57c00,#c62828)', display: 'inline-block', flexShrink: 0 }}></span> Load index
           </div>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2e7d32', display: 'inline-block', flexShrink: 0 }}></span> Low
           </div>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f57c00', display: 'inline-block', flexShrink: 0 }}></span> Mid
           </div>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', lineHeight: 1 }}>
             <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#c62828', display: 'inline-block', flexShrink: 0 }}></span> High
           </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 440, minHeight: 360, position: 'relative' }}>
        {loadErr && (
          <div style={{ padding: '24px', color: 'var(--error)', fontSize: '13px' }}>{loadErr}</div>
        )}
        {!geoData && !loadErr && (
          <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px', minHeight: 200 }}>Loading Baramati AC boundary…</div>
        )}
        {geoData && boundaryGeo?.features?.length > 0 && (
          <MapContainer
            center={center}
            zoom={11}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap
            />

            {/* Focus spotlight: dim + soft-blur everything outside the taluka */}
            <Pane name="talukaFocusMask" className="geo-focus-mask-pane" style={{ zIndex: 350, pointerEvents: 'none' }}>
              {focusMaskGeo && (
                <GeoJSON
                  data={focusMaskGeo}
                  style={() => ({
                    stroke: false,
                    color: 'transparent',
                    weight: 0,
                    fillColor: '#0b1416',
                    fillOpacity: 0.55,
                    interactive: false,
                  })}
                />
              )}
            </Pane>

            <FitTaluka bounds={boundaryBounds} />

            <Pane name="taoMandalHeat" style={{ zIndex: 380 }}>
              {mandalGeo?.features?.length > 0 && (
                <MandalBoundariesLayer mandalGeo={mandalGeo} onSelectMandal={setSelectedPoint} />
              )}
            </Pane>

            {/* Outer dashed AC / taluka fence - drawn above heat cells */}
            <GeoJSON data={boundaryGeo} style={styleBoundaryFence} />
          </MapContainer>
        )}

        {/* Info Panel Overlay - z-index 2000 so it sits above any leaflet
            pane (capped at 500 by the global rule). */}
        {selectedPoint && (
          <div style={{
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 2000,
            background: 'var(--surface)', padding: '16px', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '250px',
            borderLeft: `4px solid ${typeof selectedPoint.heat === 'number' ? heatFillColor(selectedPoint.heat) : getStatusColor(selectedPoint.status)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <h4 className="fw-bold m-0 text-sm">{selectedPoint.name}</h4>
               <button onClick={() => setSelectedPoint(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                 <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
               </button>
            </div>
            <div className="text-xs text-muted mt-1 mb-3">MANDAL REGION • {selectedPoint.id}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div><span className="text-muted">CAO:</span> <strong>{selectedPoint.caoName}</strong></div>
              <div><span className="text-muted">Status:</span> <strong>{selectedPoint.status}</strong></div>
              {typeof selectedPoint.heat === 'number' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="text-muted">Load index:</span>{' '}
                  <strong style={{ color: heatFillColor(selectedPoint.heat) }}>{Math.round(selectedPoint.heat * 100)}%</strong>
                </div>
              )}
              <div><span className="text-muted">Pending:</span> <strong>{selectedPoint.pending}</strong></div>
              <div><span className="text-muted">Fraud Alerts:</span> <strong style={{ color: selectedPoint.fraudAlerts > 0 ? '#d32f2f' : '#2e7d32' }}>{selectedPoint.fraudAlerts}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TAOMap;
