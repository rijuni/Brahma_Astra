import React, { useId } from 'react';

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
  const generatedId = useId();
  const inputSlug = label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'input';
  const resolvedInputId = id || `${inputSlug}-${generatedId.replace(/:/g, '')}`;
  const errorId = `${resolvedInputId}-error`;

  return (
    <div className="flex flex-col gap-1 w-full" style={{ marginBottom: wrapperMargin || '10px' }}>
      {label && (
        <label htmlFor={resolvedInputId} className="body-small" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '12px', ...labelStyle }}>
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
          id={resolvedInputId}
          type={type}
          className={`glass-input ${className}`}
          {...props}
          aria-invalid={error ? 'true' : props['aria-invalid']}
          aria-describedby={[props['aria-describedby'], error ? errorId : null].filter(Boolean).join(' ') || undefined}
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
        <span id={errorId} className="body-small" role="alert" style={{ color: 'var(--status-error)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
