import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  rightElement,
  className = '',
  id,
  type = 'text',
  style = {},
  wrapperMargin,
  labelStyle,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full" style={{ marginBottom: wrapperMargin || '10px' }}>
      {label && (
        <label htmlFor={inputId} className="body-small" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '12px', ...labelStyle }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 2 }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`glass-input ${className}`}
          {...props}
          style={{
            ...style,
            paddingLeft: Icon ? '40px' : (style.paddingLeft || '14px'),
            paddingRight: rightElement ? '42px' : (style.paddingRight || '14px'),
            borderColor: error ? 'var(--status-error)' : style.borderColor
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', zIndex: 2 }}>
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
