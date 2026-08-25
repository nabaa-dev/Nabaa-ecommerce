import { useEffect } from 'react';
import { CheckCircleIcon, AlertCircleIcon, XIcon } from '../Icons';
import './ToastContainer.css';

function Toast({ toast, onRemove }) {
  return (
    <div
      className={`toast toast--${toast.type}`}
      role="alert"
    >
      <span className="toast__icon">
        {toast.type === 'success' ? (
          <CheckCircleIcon size={18} />
        ) : (
          <AlertCircleIcon size={18} />
        )}
      </span>
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" aria-label="Close" onClick={() => onRemove(toast.id)}>
        <XIcon size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
