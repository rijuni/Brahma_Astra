import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Copy,
  Check,
  Search,
  Replace,
  Lock,
  Unlock,
  FileCode,
  Save,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Globe,
  Sliders,
  Maximize2
} from 'lucide-react';
import { ASTRA_LANGUAGES, getLanguageForFile } from '../../../config/astra-languages';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { useToast } from '../../../components/feedback/Toast';

// Lightweight, zero-dependency cosmic token colorizer for code syntax
function highlightLine(line) {
  if (!line) return <span>&nbsp;</span>;

  const commentMatch = line.match(/^(\s*)(#.*|\/\/.*)$/);
  if (commentMatch) {
    return (
      <>
        <span>{commentMatch[1]}</span>
        <span className="tok-comment">{commentMatch[2]}</span>
      </>
    );
  }

  const tokenRegex = /(#.*$|\/\/.*$)|(".*?"|'.*?'|`.*?`)|(@[a-zA-Z0-9_\.]+)|(\b(?:from|import|as|def|class|return|async|await|if|elif|else|for|while|try|except|finally|raise|with|in|is|not|and|or|const|let|var|function|export|default|type|interface)\b)|(\b(?:int|str|float|bool|list|dict|set|tuple|Optional|List|Dict|Any|Promise|Array|Object|String|Number|Boolean)\b)|(\b[A-Z][a-zA-Z0-9_]*\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\())|(\b(?:True|False|None|true|false|null|undefined|\d+(?:\.\d+)?)\b)/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.slice(lastIndex, match.index));
    }

    const [full, comment, str, decorator, keyword, builtin, cls, fn, num] = match;

    if (comment) {
      elements.push(<span key={match.index} className="tok-comment">{comment}</span>);
    } else if (str) {
      elements.push(<span key={match.index} className="tok-str">{str}</span>);
    } else if (decorator) {
      elements.push(<span key={match.index} className="tok-decorator">{decorator}</span>);
    } else if (keyword) {
      elements.push(<span key={match.index} className="tok-keyword">{keyword}</span>);
    } else if (builtin) {
      elements.push(<span key={match.index} className="tok-builtin">{builtin}</span>);
    } else if (fn) {
      elements.push(<span key={match.index} className="tok-fn">{fn}</span>);
    } else if (cls) {
      elements.push(<span key={match.index} className="tok-cls">{cls}</span>);
    } else if (num) {
      elements.push(<span key={match.index} className="tok-num">{num}</span>);
    } else {
      elements.push(full);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }

  return elements.length > 0 ? elements : <span>{line}</span>;
}

export default function CodeEditor({
  openFiles = [],
  activeFile,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onCloseOtherTabs,
  onFileChange,
  onSaveFile,
  onRunFile,
  dirtyFilePaths = new Set()
}) {
  const [copied, setCopied] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isGoToLineOpen, setIsGoToLineOpen] = useState(false);
  const [goToLineInput, setGoToLineInput] = useState('');
  const [isLangSwitcherOpen, setIsLangSwitcherOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [overrideLang, setOverrideLang] = useState(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const syntaxLayerRef = useRef(null);
  const { addToast } = useToast();

  const handleScroll = (e) => {
    const top = e.target.scrollTop;
    const left = e.target.scrollLeft;
    if (gutterRef.current) gutterRef.current.scrollTop = top;
    if (syntaxLayerRef.current) {
      syntaxLayerRef.current.scrollTop = top;
      syntaxLayerRef.current.scrollLeft = left;
    }
  };

  const detectedLang = activeFile ? getLanguageForFile(activeFile.name) : null;
  const currentLang = overrideLang || detectedLang;

  // Handle Ctrl+S, Ctrl+F, Ctrl+H, Ctrl+G shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (activeFile && onSaveFile) {
          onSaveFile(activeFile.path);
          addToast(`Saved ${activeFile.name}`, 'success');
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsFindOpen(true);
        setIsReplaceMode(false);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsFindOpen(true);
        setIsReplaceMode(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setIsGoToLineOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, onSaveFile, addToast]);

  // Reset override lang when active file changes
  useEffect(() => {
    setOverrideLang(null);
  }, [activeFile?.path]);

  const handleCopyCode = async () => {
    if (!activeFile?.content) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Code copied to clipboard', 'info');
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleTextareaChange = (e) => {
    if (isReadOnly) return;
    const newContent = e.target.value;
    if (activeFile && onFileChange) {
      onFileChange(activeFile.path, newContent);
    }
  };

  const updateCursorPosition = (e) => {
    const text = e.target.value.substring(0, e.target.selectionStart);
    const lines = text.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const handleReplaceOne = () => {
    if (!findQuery || !activeFile) return;
    const content = activeFile.content || '';
    const idx = content.toLowerCase().indexOf(findQuery.toLowerCase());
    if (idx !== -1) {
      const updated = content.substring(0, idx) + replaceQuery + content.substring(idx + findQuery.length);
      onFileChange(activeFile.path, updated);
      addToast('Replaced 1 occurrence', 'info');
    } else {
      addToast('Match not found', 'warning');
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery || !activeFile) return;
    const content = activeFile.content || '';
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      const updated = content.replace(regex, replaceQuery);
      onFileChange(activeFile.path, updated);
      addToast(`Replaced all ${count} occurrences`, 'success');
    } else {
      addToast('No matches to replace', 'info');
    }
  };

  const handleGoToLineSubmit = (e) => {
    e.preventDefault();
    const lineNum = parseInt(goToLineInput, 10);
    const lines = (activeFile?.content || '').split('\n');
    if (isNaN(lineNum) || lineNum < 1 || lineNum > lines.length) {
      addToast(`Please enter a valid line between 1 and ${lines.length}`, 'warning');
      return;
    }
    // Calculate character offset for lineNum
    let offset = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      offset += lines[i].length + 1;
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(offset, offset);
      setCursorPos({ line: lineNum, col: 1 });
    }
    setIsGoToLineOpen(false);
    setGoToLineInput('');
  };

  const fileLines = (activeFile?.content || '').split('\n');
  const lineCount = Math.max(fileLines.length, 1);

  // Compute find matches
  const matchCount = findQuery.trim()
    ? (activeFile?.content || '').toLowerCase().split(findQuery.toLowerCase()).length - 1
    : 0;

  if (!activeFile) {
    return (
      <div className="astra-editor-container flex items-center justify-center text-center p-8">
        <div className="flex flex-col items-center">
          <FileCode size={40} color="var(--brand-violet)" style={{ marginBottom: '14px', opacity: 0.6 }} />
          <h3 className="card-title" style={{ fontSize: '16px', marginBottom: '6px' }}>
            No File Open
          </h3>
          <p className="body-small text-muted" style={{ maxWidth: '340px' }}>
            Select a file from the explorer on the left or create a new file to begin editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="astra-editor-container flex flex-col h-full">
      {/* Editor Tab Bar */}
      <div className="astra-editor-tabs flex items-center justify-between">
        <div className="flex items-center overflow-x-auto flex-1">
          {openFiles.map((file) => {
            const isActive = file.path === activeFile.path;
            const isDirty = dirtyFilePaths.has(file.path);
            const lang = getLanguageForFile(file.name);

            return (
              <div
                key={file.path}
                onClick={() => onSelectTab(file)}
                className={`astra-editor-tab ${isActive ? 'active' : ''}`}
              >
                <span style={{ color: lang.iconColor, fontSize: '12px' }}>●</span>
                <span style={{ fontWeight: 500 }}>{file.name}</span>
                {isDirty && (
                  <span style={{ color: 'var(--brand-gold)', fontSize: '14px' }}>●</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.path);
                  }}
                  className="glass-btn-ghost flex items-center justify-center"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    marginLeft: '4px'
                  }}
                  title="Close tab"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tab Options & Toolbar Controls */}
        <div className="flex items-center gap-2 px-3">
          {openFiles.length > 1 && (
            <div className="flex items-center gap-1.5 mr-2 border-r border-white/10 pr-3">
              <button
                onClick={() => onCloseOtherTabs && onCloseOtherTabs(activeFile.path)}
                className="glass-btn-ghost text-muted hover:text-white"
                style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '5px', fontWeight: 500 }}
                title="Close other tabs"
              >
                Close Others
              </button>
              <button
                onClick={() => onCloseAllTabs && onCloseAllTabs()}
                className="glass-btn-ghost text-muted hover:text-white"
                style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '5px', fontWeight: 500 }}
                title="Close all open tabs"
              >
                Close All
              </button>
            </div>
          )}

          <button
            onClick={() => onRunFile && onRunFile(activeFile)}
            className="glass-btn flex items-center justify-center gap-1.5"
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--status-success)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.15)'
            }}
            title="Execute file in sandboxed runner"
          >
            <Play size={13} fill="currentColor" />
            <span>Run</span>
          </button>

          <button
            onClick={() => {
              if (onSaveFile) onSaveFile(activeFile.path);
              addToast(`Saved ${activeFile.name}`, 'success');
            }}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            title="Save (Ctrl+S)"
          >
            <Save size={15} color="var(--brand-gold)" />
          </button>

          <button
            onClick={() => {
              setIsFindOpen(true);
              setIsReplaceMode(!isReplaceMode);
            }}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            title="Find & Replace (Ctrl+H)"
          >
            <Replace size={15} color={isFindOpen && isReplaceMode ? 'var(--brand-gold)' : 'var(--text-muted)'} />
          </button>

          <button
            onClick={() => {
              setIsFindOpen((prev) => !prev);
              setIsReplaceMode(false);
            }}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            title="Find in file (Ctrl+F)"
          >
            <Search size={15} color={isFindOpen && !isReplaceMode ? 'var(--brand-cyan)' : 'var(--text-muted)'} />
          </button>

          <button
            onClick={() => setIsReadOnly((prev) => !prev)}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            title={isReadOnly ? 'Read-only locked' : 'Editable'}
          >
            {isReadOnly ? <Lock size={15} color="var(--status-error)" /> : <Unlock size={15} color="var(--text-muted)" />}
          </button>

          <button
            onClick={handleCopyCode}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            title="Copy code"
          >
            {copied ? <Check size={15} color="var(--status-success)" /> : <Copy size={15} color="var(--text-muted)" />}
          </button>
        </div>
      </div>

      {/* Find & Replace Overlay */}
      {isFindOpen && (
        <div
          className="flex flex-col gap-2 px-4 py-2.5 animate-entrance"
          style={{
            background: 'rgba(23, 20, 50, 0.95)',
            borderBottom: '1px solid var(--glass-border-violet)',
            fontSize: '12px'
          }}
        >
          {/* Find row */}
          <div className="flex items-center gap-2.5">
            <Search size={14} color="var(--brand-cyan)" />
            <input
              type="text"
              placeholder="Find in file..."
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              autoFocus
              className="glass-input"
              style={{
                height: '30px',
                padding: '4px 10px',
                fontSize: '12px',
                width: '220px',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <span className="text-muted" style={{ fontSize: '10px' }}>
              {findQuery ? `${matchCount} matches` : 'Type query'}
            </span>

            <button
              onClick={() => setIsReplaceMode(!isReplaceMode)}
              className="glass-btn-ghost body-small text-muted"
              style={{ padding: '2px 6px', fontSize: '10px', marginLeft: 'auto' }}
            >
              {isReplaceMode ? 'Hide Replace' : 'Toggle Replace'}
            </button>

            <button
              onClick={() => setIsFindOpen(false)}
              className="glass-btn-ghost"
              style={{ padding: '2px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={12} />
            </button>
          </div>

          {/* Replace row */}
          {isReplaceMode && (
            <div className="flex items-center gap-2 mt-1">
              <Replace size={12} color="var(--brand-gold)" />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="glass-input"
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  width: '200px',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <button
                onClick={handleReplaceOne}
                className="glass-btn-ghost"
                style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)'
                }}
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                className="glass-btn-ghost"
                style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  borderRadius: '3px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--brand-gold)'
                }}
              >
                Replace All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Go To Line Prompt */}
      {isGoToLineOpen && (
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid var(--glass-border-cyan)'
          }}
        >
          <span className="text-muted" style={{ fontSize: '11px' }}>
            Go to Line (1-{lineCount}):
          </span>
          <form onSubmit={handleGoToLineSubmit} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={lineCount}
              value={goToLineInput}
              onChange={(e) => setGoToLineInput(e.target.value)}
              autoFocus
              className="glass-input"
              style={{
                width: '70px',
                padding: '2px 6px',
                fontSize: '11px',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <Button variant="ghost" size="small" type="submit">
              Jump
            </Button>
            <Button variant="ghost" size="small" type="button" onClick={() => setIsGoToLineOpen(false)}>
              <X size={11} />
            </Button>
          </form>
        </div>
      )}

      {/* Editor Workspace Area */}
      <div className="flex flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="astra-line-number flex flex-col py-3 select-none overflow-hidden"
          style={{
            background: 'rgba(7, 10, 24, 0.65)',
            borderRight: '1px solid var(--glass-border)',
            fontFamily: 'var(--font-code)',
            fontSize: '13px',
            lineHeight: '22px'
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '22px',
                color: cursorPos.line === i + 1 ? 'var(--brand-gold)' : 'rgba(255, 255, 255, 0.25)',
                fontWeight: cursorPos.line === i + 1 ? 600 : 400
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Editor Surface: Syntax Highlight Layer + Editable Transparent Textarea */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlight Layer */}
          <div
            ref={syntaxLayerRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 pointer-events-none select-none overflow-hidden"
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: '13px',
              lineHeight: '22px',
              tabSize: 2,
              whiteSpace: 'pre',
              color: '#E2E8F0'
            }}
          >
            {fileLines.map((line, idx) => (
              <div key={idx} style={{ height: '22px', minHeight: '22px' }}>
                {highlightLine(line)}
              </div>
            ))}
          </div>

          {/* Textarea Code Input Surface */}
          <textarea
            ref={textareaRef}
            value={activeFile.content || ''}
            onChange={handleTextareaChange}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onScroll={handleScroll}
            readOnly={isReadOnly}
            spellCheck={false}
            className="absolute inset-0 p-3 outline-none border-none resize-none overflow-auto"
            style={{
              background: 'transparent',
              fontFamily: 'var(--font-code)',
              fontSize: '13px',
              lineHeight: '22px',
              color: 'transparent',
              caretColor: 'var(--brand-gold)',
              tabSize: 2,
              whiteSpace: 'pre',
              zIndex: 1
            }}
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div
        className="flex items-center justify-between px-4 py-1"
        style={{
          height: '32px',
          background: 'rgba(11, 15, 26, 0.7)',
          borderTop: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsGoToLineOpen(true)}
            className="hover:text-white transition-colors cursor-pointer font-medium"
            title="Click or Ctrl+G to jump to line"
          >
            Ln {cursorPos.line}, Col {cursorPos.col}
          </button>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>{lineCount} lines</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLangSwitcherOpen(true)}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="Click to switch language mode"
          >
            <span style={{ color: currentLang?.iconColor || 'var(--brand-cyan)' }}>●</span>
            <span style={{ fontWeight: 500 }}>
              {currentLang?.name || 'Plaintext'}
            </span>
          </button>
          {isReadOnly && <span style={{ color: 'var(--status-error)', fontWeight: 600 }}>[Read-Only]</span>}
        </div>
      </div>

      {/* Language Switcher Modal */}
      <Modal
        isOpen={isLangSwitcherOpen}
        onClose={() => setIsLangSwitcherOpen(false)}
        title="Select Language Mode"
        maxWidth="460px"
      >
        <div className="flex flex-col gap-3">
          <div className="glass-input flex items-center gap-2" style={{ padding: '6px 8px' }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search languages..."
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              autoFocus
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                width: '100%'
              }}
            />
          </div>

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
            {ASTRA_LANGUAGES.filter((l) =>
              l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
              l.id.toLowerCase().includes(langSearch.toLowerCase())
            ).map((lang) => {
              const isSelected = currentLang?.id === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    setOverrideLang(lang);
                    setIsLangSwitcherOpen(false);
                    addToast(`Set language to ${lang.name}`, 'info');
                  }}
                  className="flex items-center justify-between p-2 rounded text-left transition-all hover:bg-white/5"
                  style={{
                    background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    border: isSelected ? '1px solid var(--brand-violet)' : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: lang.iconColor, fontSize: '13px' }}>●</span>
                    <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 400, color: 'var(--text-primary)' }}>
                      {lang.name}
                    </span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>
                      ({lang.extensions.join(', ')})
                    </span>
                  </div>
                  {isSelected && <Check size={13} color="var(--brand-gold)" />}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
