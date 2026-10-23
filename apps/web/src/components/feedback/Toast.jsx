import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
          maxWidth: '380px'
        }}
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: { icon: CheckCircle2, color: 'var(--status-success)', border: 'rgba(34, 197, 94, 0.4)' },
            error: { icon: AlertCircle, color: 'var(--status-error)', border: 'rgba(239, 68, 68, 0.4)' },
            info: { icon: Info, color: 'var(--brand-cyan)', border: 'rgba(6, 182, 212, 0.4)' }
          }[toast.type] || { icon: Info, color: 'var(--brand-cyan)', border: 'rgba(6, 182, 212, 0.4)' };

          const Icon = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className="glass-card animate-entrance"
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderColor: typeConfig.border,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
              }}
            >
              <Icon size={18} color={typeConfig.color} style={{ flexShrink: 0 }} />
              <span className="body-regular" style={{ color: 'var(--text-primary)', flex: 1 }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { addToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
