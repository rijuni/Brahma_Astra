import React from 'react';

export default function LoadingSpinner({
  size = 32,
  label = 'Loading...',
  variant = 'gold'
}) {
  const strokeColor = variant === 'gold' ? 'var(--brand-gold)' : 'var(--brand-violet)';

  return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '24px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        style={{ animation: 'spin 1.2s linear infinite' }}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3.5"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeDasharray="60 40"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="body-small text-muted">{label}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
