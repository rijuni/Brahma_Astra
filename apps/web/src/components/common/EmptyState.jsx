import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`}
      style={{
        padding: '48px 24px',
        border: '1px dashed var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid var(--glass-border-violet)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--brand-violet-light)'
          }}
        >
          <Icon size={24} />
        </div>
      )}
      <h3 className="card-title" style={{ marginBottom: '6px' }}>{title}</h3>
      {description && (
        <p className="body-small text-muted" style={{ maxWidth: '360px', marginBottom: actionLabel ? '18px' : 0 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
