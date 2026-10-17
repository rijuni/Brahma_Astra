import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    border: '1px solid transparent'
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '15px' },
    icon: { padding: '8px', borderRadius: 'var(--radius-md)' }
  }[size] || { padding: '10px 18px', fontSize: '14px' };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--brand-violet)',
      color: '#FFFFFF',
      boxShadow: '0 2px 12px rgba(139, 92, 246, 0.35)'
    },
    secondary: {
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    gold: {
      backgroundColor: 'var(--brand-gold)',
      color: '#0B0F1A',
      fontWeight: 600,
      boxShadow: '0 2px 14px rgba(246, 200, 122, 0.3)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)'
    },
    danger: {
      backgroundColor: 'var(--status-error)',
      color: '#FFFFFF'
    },
    astra: {
      backgroundColor: 'var(--astra-violet)',
      color: '#FFFFFF',
      boxShadow: '0 2px 14px rgba(139, 92, 246, 0.4)'
    }
  }[variant] || {};

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles }}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite'
          }}
        />
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}
