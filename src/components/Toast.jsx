import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

/**
 * Toast Item Component
 * Renders a single toast message that auto-dismisses after a delay.
 */
function ToastItem({ toast, onRemove }) {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before the duration ends (3.5s)
    const hideTimer = setTimeout(() => {
      setIsHiding(true);
    }, 3200);

    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, 3500);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✓';
      case 'error': return '✗';
      default: return 'ℹ';
    }
  };

  return (
    <div className={`toast ${toast.type} ${isHiding ? 'hiding' : ''}`} role="alert">
      <span className="toast-icon">{getIcon()}</span>
      <div className="toast-content">{toast.message}</div>
      <button 
        className="toast-close" 
        onClick={() => {
          setIsHiding(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 * Holds and animates floating notifications.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.toasts - Active notifications
 * @param {function} props.onRemoveToast - Dismiss handler
 */
export default function Toast({ toasts, onRemoveToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  );
}
