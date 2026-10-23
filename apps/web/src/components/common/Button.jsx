import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  disabled,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = {
    primary: 'glass-btn-primary',
    gold: 'glass-btn-shiny-gold',
    'shiny-gold': 'glass-btn-shiny-gold',
    secondary: 'glass-btn-secondary',
    ghost: 'glass-btn-ghost'
  }[variant] || 'glass-btn-primary';

  const sizeStyle = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '9px 18px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '15px' }
  }[size] || {};

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`glass-btn ${variantClass} ${className}`}
      style={sizeStyle}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeLinecap="round" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </button>
  );
}
