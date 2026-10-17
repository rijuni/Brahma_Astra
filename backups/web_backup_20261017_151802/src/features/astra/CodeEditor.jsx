import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Search,
  Copy,
  Check,
  Lock,
  Unlock,
  FileCode,
  AlertCircle
} from 'lucide-react';

export function CodeEditor({
  openTabs,
  activeTabPath,
  onSelectTab,
  onCloseTab,
  onUpdateContent,
  onSaveFile
}) {
  const activeFile = openTabs.find(tab => tab.path === activeTabPath);
  const [copied, setCopied] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef(null);

  // Keyboard shortcut listener (Ctrl+S for save, Ctrl+F for find)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeFile && onSaveFile) {
          onSaveFile(activeFile.path);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFind(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, onSaveFile]);

  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard?.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextareaChange = (e) => {
    if (isReadOnly || !activeFile) return;
    onUpdateContent(activeFile.path, e.target.value);
  };

  const handleCursorMovement = (e) => {
    const text = e.target.value.substring(0, e.target.selectionStart);
    const lines = text.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onUpdateContent(activeFile.path, newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  if (!activeFile) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--astra-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--astra-muted)',
          fontSize: '13px'
        }}
      >
        <FileCode size={36} style={{ color: 'var(--astra-border)' }} />
        <p style={{ margin: 0 }}>Select a file from the explorer to begin editing</p>
        <span style={{ fontSize: '11px', color: 'rgba(167, 174, 194, 0.6)' }}>
          Press <strong>Ctrl+S</strong> to save changes • <strong>Ctrl+F</strong> to find
        </span>
      </div>
    );
  }

  const lines = activeFile.content.split('\n');
  const lineCount = lines.length;

  // Calculate find matches
  const matchCount = findQuery
    ? (activeFile.content.match(new RegExp(escapeRegExp(findQuery), 'gi')) || []).length
    : 0;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--astra-bg)',
        overflow: 'hidden'
      }}
    >
      {/* ── Editor Tabs Bar ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--astra-surface)',
          borderBottom: '1px solid var(--astra-border)',
          overflowX: 'auto',
          flexShrink: 0
        }}
      >
        {openTabs.map(tab => {
          const isActive = tab.path === activeTabPath;
          const fileName = tab.path.split('/').pop();

          return (
            <div
              key={tab.path}
              onClick={() => onSelectTab(tab.path)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRight: '1px solid var(--astra-border)',
                borderBottom: isActive ? '2px solid var(--astra-electric-blue)' : '2px solid transparent',
                backgroundColor: isActive ? 'var(--astra-panel)' : 'transparent',
                color: isActive ? 'var(--astra-text)' : 'var(--astra-muted)',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{fileName}</span>

              {tab.dirty ? (
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--astra-gold)'
                  }}
                  title="Unsaved changes"
                />
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.path);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--astra-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Close tab"
                  aria-label={`Close ${fileName}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Editor Context Toolbar ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          borderBottom: '1px solid var(--astra-border)',
          backgroundColor: 'var(--astra-panel)',
          fontSize: '11px',
          color: 'var(--astra-muted)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-code)', color: 'var(--astra-electric-blue)' }}>
            {activeFile.path}
          </span>
          {activeFile.dirty && (
            <span style={{ color: 'var(--astra-gold)', fontWeight: 600 }}>[Modified]</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowFind(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: showFind ? 'var(--astra-electric-blue)' : 'var(--astra-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
            title="Toggle find (Ctrl+F)"
          >
            <Search size={13} />
            <span>Find</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? 'var(--status-success)' : 'var(--astra-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
            title="Copy code"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReadOnly(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: isReadOnly ? 'var(--astra-gold)' : 'var(--astra-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
            title="Toggle read-only"
          >
            {isReadOnly ? <Lock size={13} /> : <Unlock size={13} />}
            <span>{isReadOnly ? 'Locked' : 'Editable'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveFile(activeFile.path)}
            disabled={!activeFile.dirty}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: activeFile.dirty ? 'var(--astra-violet)' : 'rgba(255, 255, 255, 0.05)',
              color: activeFile.dirty ? '#FFFFFF' : 'var(--astra-muted)',
              border: 'none',
              cursor: activeFile.dirty ? 'pointer' : 'default',
              fontSize: '11px',
              fontWeight: 600
            }}
            title="Save file (Ctrl+S)"
          >
            <Save size={12} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* ── Search Bar Overlay (Ctrl+F) ─────────────────────────────── */}
      {showFind && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'rgba(13, 20, 40, 0.95)',
            borderBottom: '1px solid var(--astra-border)',
            flexShrink: 0
          }}
        >
          <Search size={14} style={{ color: 'var(--astra-muted)' }} />
          <input
            type="text"
            placeholder="Find in document..."
            value={findQuery}
            onChange={e => setFindQuery(e.target.value)}
            autoFocus
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontFamily: 'var(--font-code)',
              backgroundColor: 'var(--astra-bg)',
              border: '1px solid var(--astra-border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--astra-text)',
              outline: 'none',
              width: '200px'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--astra-muted)' }}>
            {findQuery ? `${matchCount} match${matchCount === 1 ? '' : 'es'}` : ''}
          </span>
          <button
            type="button"
            onClick={() => setShowFind(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--astra-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Code Gutter & Textarea ──────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#070A18'
        }}
      >
        {/* Line Numbers Gutter */}
        <div
          style={{
            width: '44px',
            backgroundColor: '#070A18',
            borderRight: '1px solid rgba(38, 54, 87, 0.5)',
            padding: '12px 6px',
            textAlign: 'right',
            userSelect: 'none',
            fontSize: '12px',
            fontFamily: 'var(--font-code)',
            lineHeight: '1.6',
            color: 'rgba(167, 174, 194, 0.4)',
            overflow: 'hidden'
          }}
        >
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={activeFile.content}
          onChange={handleTextareaChange}
          onSelect={handleCursorMovement}
          onKeyUp={handleCursorMovement}
          onClick={handleCursorMovement}
          onKeyDown={handleTabKey}
          readOnly={isReadOnly}
          spellCheck={false}
          style={{
            flex: 1,
            backgroundColor: '#070A18',
            border: 'none',
            color: '#F7F7FB',
            fontFamily: 'var(--font-code)',
            fontSize: '13px',
            lineHeight: '1.6',
            padding: '12px 14px',
            outline: 'none',
            resize: 'none',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
            overflowY: 'auto'
          }}
        />
      </div>

      {/* ── Editor Status Bar ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 14px',
          borderTop: '1px solid var(--astra-border)',
          backgroundColor: 'var(--astra-surface)',
          fontSize: '11px',
          fontFamily: 'var(--font-code)',
          color: 'var(--astra-muted)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{lineCount} lines</span>
          <span>{activeFile.content.length} chars</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span style={{ color: 'var(--astra-cyan)' }}>
            {activeFile.path.split('.').pop()?.toUpperCase() || 'TEXT'}
          </span>
        </div>
      </div>
    </div>
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
