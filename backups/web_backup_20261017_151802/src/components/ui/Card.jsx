import React from 'react';

export function Card({
  children,
  className = '',
  hoverable = false,
  glow = null, // 'gold' | 'violet' | 'cyan' | 'blue'
  style = {},
  onClick,
  ...props
}) {
  const glowBorder = {
    gold: 'rgba(246, 200, 122, 0.4)',
    violet: 'rgba(139, 92, 246, 0.4)',
    cyan: 'rgba(6, 182, 212, 0.4)',
    blue: 'rgba(56, 189, 248, 0.4)'
  }[glow];

  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--card-padding)',
        backgroundColor: 'var(--surface-card)',
        border: `1px solid ${glowBorder || 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: glow ? `var(--shadow-glow-${glow})` : 'var(--shadow-card)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-normal)',
        ...style
      }}
      className={`glass-card ${hoverable ? 'hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
