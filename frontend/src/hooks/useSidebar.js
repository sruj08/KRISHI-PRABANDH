import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  }, [location.pathname, closeSidebar]);

  return { isOpen, openSidebar, closeSidebar, toggleSidebar };
};
