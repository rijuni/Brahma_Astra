import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        background: 'rgba(7, 10, 24, 0.85)',
        border: '1px solid var(--glass-border)',
        overflow: 'hidden',
        margin: '12px 0'
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid var(--glass-border)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-code)'
        }}
      >
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="glass-btn-ghost flex items-center gap-1"
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        style={{
          padding: '14px',
          margin: 0,
          fontFamily: 'var(--font-code)',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#E2E8F0',
          overflowX: 'auto'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
