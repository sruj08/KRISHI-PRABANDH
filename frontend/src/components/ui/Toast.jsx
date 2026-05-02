import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../hooks/useToast.jsx';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span className="material-symbols-outlined">
            {iconMap[toast.type] || iconMap.info}
          </span>
          {toast.message}
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', background: 'transparent', color: 'inherit', marginLeft: '8px' }}
            onClick={() => removeToast(toast.id)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
