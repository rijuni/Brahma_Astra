import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  className = '',
  icon: Icon
}) {
  const variantClass = {
    default: 'badge',
    gold: 'badge badge-gold',
    violet: 'badge badge-violet',
    cyan: 'badge badge-cyan'
  }[variant] || 'badge';

  return (
    <span className={`${variantClass} ${className}`}>
      {Icon && <Icon size={12} style={{ marginRight: '4px' }} />}
      {children}
    </span>
  );
}
