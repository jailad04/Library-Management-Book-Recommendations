import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../features/ui/uiSlice';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const toasts = useSelector(state => state.ui.toasts);
  const dispatch = useDispatch();

  return (
    <aside
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(removeToast(toast.id))} />
      ))}
    </aside>
  );
};

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 size={18} color="var(--color-success)" />,
    warning: <AlertTriangle size={18} color="var(--color-warning)" />,
    danger: <AlertCircle size={18} color="var(--color-danger)" />,
    info: <Info size={18} color="var(--primary-500)" />
  };

  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {icons[toast.type] || icons.info}
      </div>
      <div style={{ flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastContainer;
