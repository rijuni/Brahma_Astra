import React from 'react';

export function Badge({
  children,
  variant = 'muted', // 'gold' | 'violet' | 'cyan' | 'blue' | 'success' | 'warning' | 'error' | 'muted'
  icon: Icon,
  className = '',
  style = {}
}) {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
