import React from 'react';

export default function Card({
  children,
  variant = 'default',
  hover = true,
  shimmer = true,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const variantClass = {
    default: '',
    gold: 'glass-card-gold',
    cyan: 'glass-card-cyan'
  }[variant] || '';

  const interactiveClass = onClick || hover ? 'glass-card-interactive' : '';
  const shimmerClass = shimmer ? 'glass-shimmer' : '';

  return (
    <div
      onClick={onClick}
      className={`glass-card ${variantClass} ${interactiveClass} ${shimmerClass} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '20px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
