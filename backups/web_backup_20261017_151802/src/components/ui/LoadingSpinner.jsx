import React from 'react';

export function LoadingSpinner({
  size = 'md',
  message = null,
  color = 'gold' // 'gold' | 'violet' | 'cyan' | 'blue'
}) {
  const pixelSize = { sm: 24, md: 40, lg: 64 }[size] || 40;
  const strokeColor = {
    gold: 'var(--brand-gold)',
    violet: 'var(--brand-violet)',
    cyan: 'var(--brand-cyan)',
    blue: 'var(--astra-electric-blue)'
  }[color] || 'var(--brand-gold)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '24px'
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          position: 'relative'
        }}
      >
        <svg
          viewBox="0 0 50 50"
          style={{
            width: '100%',
            height: '100%',
            animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
          }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="var(--border-default)"
            strokeWidth="3.5"
            opacity="0.3"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray="80"
            strokeDashoffset="60"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {message && (
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {message}
        </span>
      )}
    </div>
  );
}
