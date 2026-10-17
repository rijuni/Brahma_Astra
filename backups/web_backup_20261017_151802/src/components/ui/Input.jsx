import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    id,
    type = 'text',
    className = '',
    style = {},
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: error ? 'var(--status-error)' : 'var(--text-secondary)'
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          backgroundColor: 'rgba(17, 24, 39, 0.75)',
          border: `1px solid ${error ? 'var(--status-error)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
        }}
      >
        {Icon && (
          <span
            style={{
              paddingLeft: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          style={{
            width: '100%',
            padding: Icon ? '10px 12px 10px 8px' : '10px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
          className={className}
          {...props}
        />
        {rightElement && (
          <span style={{ paddingRight: '12px', display: 'flex', alignItems: 'center' }}>
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--status-error)' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});
