import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DESKTOP_MIN = 1024;

const initialOpen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= DESKTOP_MIN;
};

export const useSidebar = () => {
  /** Desktop: true = rail visible; false = collapsed. Mobile/tablet: true = drawer open. */
  const [isOpen, setIsOpen] = useState(initialOpen);
  const location = useLocation();

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  // Close drawer on route change (small screens only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < DESKTOP_MIN) {
      closeSidebar();
    }
  }, [location.pathname, closeSidebar]);

  return { isOpen, openSidebar, closeSidebar, toggleSidebar };
};
