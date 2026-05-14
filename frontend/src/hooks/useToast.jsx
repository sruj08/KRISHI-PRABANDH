import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3000, opts = {}) => {
    const id = Date.now();
    const align = opts && typeof opts === 'object' && opts.align === 'top-right' ? 'top-right' : 'default';
    setToasts((prev) => [...prev, { id, message, type, align }]);

    const d = typeof duration === 'number' ? duration : 3000;
    if (d) {
      setTimeout(() => {
        removeToast(id);
      }, d);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
