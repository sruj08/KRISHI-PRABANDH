import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useKrishiData } from './KrishiDataContext';

const HierarchyContext = createContext(null);

const STORAGE_KEY = 'krishiHierarchy';

export const HierarchyProvider = ({ children }) => {
  const { user } = useAuth();
  const { mandals: allMandals, sahayaks: allSahayaks } = useKrishiData();

  const [loading] = useState(false);

  const [currentMandal, setCurrentMandalState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.mandal || null;
    } catch {
      return null;
    }
  });
  const [currentSahayak, setCurrentSahayakState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.sahayak || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mandal: currentMandal,
        sahayak: currentSahayak,
      }),
    );
  }, [currentMandal, currentSahayak]);

  /** When the signed-in user changes, scope mandal to their district / circle when applicable */
  useEffect(() => {
    if (!user?.user_id) return;
    const r = user.role;
    if (r === 'state' || r === 'division') return;

    if (user.circle_id) {
      const m = allMandals.find(
        (x) => Number(x.circle_id) === Number(user.circle_id),
      );
      if (m) {
        setCurrentMandalState((prev) => prev || m);
        return;
      }
    }
    if (user.district_id) {
      const m = allMandals.find(
        (x) => Number(x.district_id) === Number(user.district_id),
      );
      if (m) setCurrentMandalState((prev) => prev || m);
    }
  }, [user?.user_id, user?.role, user?.district_id, user?.circle_id, allMandals]);

  const setCurrentMandal = useCallback((mandal) => {
    setCurrentMandalState(mandal);
    setCurrentSahayakState(null);
  }, []);

  const setCurrentSahayak = useCallback((sahayak) => {
    setCurrentSahayakState(sahayak);
  }, []);

  const filteredSahayaks = currentMandal
    ? allSahayaks.filter((s) => s.mandal_id === currentMandal.mandal_id)
    : allSahayaks;

  return (
    <HierarchyContext.Provider
      value={{
        mandals: allMandals,
        sahayaks: allSahayaks,
        filteredSahayaks,
        currentMandal,
        currentSahayak,
        setCurrentMandal,
        setCurrentSahayak,
        loading,
      }}
    >
      {children}
    </HierarchyContext.Provider>
  );
};

export const useHierarchy = () => {
  const ctx = useContext(HierarchyContext);
  if (!ctx) {
    throw new Error('useHierarchy must be used within HierarchyProvider');
  }
  return ctx;
};
