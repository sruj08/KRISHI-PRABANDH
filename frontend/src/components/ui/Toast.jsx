import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../hooks/useToast.jsx';
import { useLanguage } from '../../context/LanguageContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();
  const { t } = useLanguage();

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  if (toasts.length === 0) return null;

  const defaultToasts = toasts.filter((toast) => toast.align !== 'top-right');
  const topRightToasts = toasts.filter((toast) => toast.align === 'top-right');

  const renderToast = (toast) => (
    <div key={toast.id} className={`toast ${toast.type}`}>
      <span className="material-symbols-outlined">
        {iconMap[toast.type] || iconMap.info}
      </span>
      {toast.message}
      <button
        type="button"
        className="btn-icon"
        style={{ width: '24px', height: '24px', background: 'transparent', color: 'inherit', marginLeft: '8px' }}
        onClick={() => removeToast(toast.id)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
      </button>
    </div>
  );

  return createPortal(
    <>
      {defaultToasts.length > 0 ? (
        <div className="toast-container">{defaultToasts.map(renderToast)}</div>
      ) : null}
      {topRightToasts.length > 0 ? (
        <div className="toast-container toast-container--top-right">{topRightToasts.map(renderToast)}</div>
      ) : null}
    </>,
    document.body
  );
};

export default ToastContainer;
