import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../shared/api/client';

const HierarchyContext = createContext(null);

const STORAGE_KEY = 'krishiHierarchy';

export const HierarchyProvider = ({ children }) => {
  const [mandals, setMandals] = useState([]);
  const [sahayaks, setSahayaks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentMandal, setCurrentMandalState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.mandal || null; }
    catch { return null; }
  });
  const [currentSahayak, setCurrentSahayakState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.sahayak || null; }
    catch { return null; }
  });

  // Persist selections
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mandal: currentMandal,
      sahayak: currentSahayak,
    }));
  }, [currentMandal, currentSahayak]);

  // Load mandals + sahayaks on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          apiFetch('/mandals'),
          apiFetch('/sahayaks'),
        ]);
        setMandals(mRes?.data || []);
        setSahayaks(sRes?.data || []);
      } catch {
        // API offline — hierarchy still works, just no data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setCurrentMandal = useCallback((mandal) => {
    setCurrentMandalState(mandal);
    // Reset sahayak when mandal changes
    setCurrentSahayakState(null);
  }, []);

  const setCurrentSahayak = useCallback((sahayak) => {
    setCurrentSahayakState(sahayak);
  }, []);

  // Sahayaks filtered by currently selected mandal
  const filteredSahayaks = currentMandal
    ? sahayaks.filter(s => s.mandal_id === currentMandal.mandal_id)
    : sahayaks;

  return (
    <HierarchyContext.Provider value={{
      mandals,
      sahayaks,
      filteredSahayaks,
      currentMandal,
      currentSahayak,
      setCurrentMandal,
      setCurrentSahayak,
      loading,
    }}>
      {children}
    </HierarchyContext.Provider>
  );
};

export const useHierarchy = () => {
  const ctx = useContext(HierarchyContext);
  if (!ctx) throw new Error('useHierarchy must be used within HierarchyProvider');
  return ctx;
};
