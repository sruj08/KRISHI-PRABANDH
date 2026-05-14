import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import FarmerRegistrationDrawer from '../pages/farmer/portal/FarmerRegistrationDrawer';

const FarmerRegistrationContext = createContext(null);

export function FarmerRegistrationProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openRegistration = useCallback(() => setOpen(true), []);
  const closeRegistration = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openRegistration, closeRegistration }),
    [open, openRegistration, closeRegistration],
  );

  return (
    <FarmerRegistrationContext.Provider value={value}>
      {children}
      <FarmerRegistrationDrawer />
    </FarmerRegistrationContext.Provider>
  );
}

export function useFarmerRegistration() {
  const ctx = useContext(FarmerRegistrationContext);
  if (!ctx) {
    return {
      open: false,
      openRegistration: () => {},
      closeRegistration: () => {},
    };
  }
  return ctx;
}
