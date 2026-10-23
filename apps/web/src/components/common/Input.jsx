import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  rightElement,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full" style={{ marginBottom: props.wrapperMargin || '10px' }}>
      {label && (
        <label htmlFor={inputId} className="body-small" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`glass-input ${className}`}
          style={{
            paddingLeft: Icon ? '38px' : '14px',
            paddingRight: rightElement ? '42px' : '14px',
            borderColor: error ? 'var(--status-error)' : undefined
          }}
          {...props}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className="body-small" style={{ color: 'var(--status-error)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
