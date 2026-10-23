import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '520px'
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="glass-modal-backdrop" onClick={onClose}>
      <div
        className="glass-modal-content animate-entrance"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '18px' }}>
          <h2 id="modal-title" className="section-title" style={{ fontSize: '18px' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="glass-btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
            aria-label="Close modal"
          >
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
