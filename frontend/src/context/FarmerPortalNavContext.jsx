import React, { createContext, useCallback, useContext, useMemo } from 'react';

const FarmerPortalNavContext = createContext(null);

export function FarmerPortalNavProvider({ children }) {
  const scrollTo = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const value = useMemo(() => ({ scrollTo }), [scrollTo]);

  return (
    <FarmerPortalNavContext.Provider value={value}>
      {children}
    </FarmerPortalNavContext.Provider>
  );
}

export function useFarmerPortalNav() {
  const ctx = useContext(FarmerPortalNavContext);
  if (!ctx) {
    return { scrollTo: () => {} };
  }
  return ctx;
}
