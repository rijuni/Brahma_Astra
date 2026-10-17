import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '12px 0',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        backgroundColor: '#070A18',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          borderBottom: '1px solid var(--border-default)',
          fontSize: '11px',
          fontFamily: 'var(--font-code)',
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ textTransform: 'lowercase', color: 'var(--astra-electric-blue)', fontWeight: 600 }}>
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: copied ? 'var(--status-success)' : 'var(--text-secondary)',
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(48, 56, 77, 0.4)',
            transition: 'all var(--transition-fast)'
          }}
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Content */}
      <pre
        style={{
          padding: '14px 16px',
          margin: 0,
          fontFamily: 'var(--font-code)',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#F7F7FB',
          overflowX: 'auto',
          whiteSpace: 'pre'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
