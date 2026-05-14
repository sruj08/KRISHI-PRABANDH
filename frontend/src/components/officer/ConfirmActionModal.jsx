import React from 'react';
import './officer-shell.css';

const ConfirmActionModal = ({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="op-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="op-modal"
        role="dialog"
        aria-modal
        aria-labelledby="op-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 id="op-modal-title">{title}</h4>
        {body && <p>{body}</p>}
        <div className="op-modal__actions">
          <button type="button" className="op-btn op-btn--ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`op-btn ${variant === 'danger' ? 'op-btn--danger' : 'op-btn--primary'}`}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
