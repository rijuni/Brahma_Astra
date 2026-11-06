import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  ShieldAlert,
  Trash2,
  Play,
  AlertCircle,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import Badge from '../../../components/common/Badge';
import { edithRunnerService } from '../../../services/edith/edith-runner-service';
import { useToast } from '../../../components/feedback/Toast';

export default function TerminalPanel({
  activeTab: externalTab,
  onSelectTab: externalSetTab,
  hideHeader = false
} = {}) {
  const [internalTab, setInternalTab] = useState('terminal'); // 'terminal' | 'problems' | 'output' | 'debug_console'
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const setActiveTab = externalSetTab || setInternalTab;
  const [inputCmd, setInputCmd] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState(['help', 'status', 'test']);
  const [logHistory, setLogHistory] = useState([
    'EDITH terminal preview',
    'Commands entered here are not executed on the host.',
    'Use the configured service health panels for live status.'
  ]);

  const [diagnostics, setDiagnostics] = useState([
    { id: 1, type: 'warning', file: 'src/app.py', line: 12, msg: 'Unused import `HTTPException` from fastapi' },
    { id: 2, type: 'info', file: 'src/controllers/user.js', line: 45, msg: 'Missing JSDoc comment for exported function' },
    { id: 3, type: 'warning', file: 'config/settings.py', line: 28, msg: 'Sample diagnostic: secret key uses a development fallback' }
  ]);

  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logHistory, activeTab]);

  const handleCommandSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim();
    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setLogHistory([]);
      setInputCmd('');
      return;
    }

    setLogHistory((prev) => [...prev, `preview> ${cmd}`]);
    setInputCmd('');

    const output = await edithRunnerService.runSafeCommand(cmd);
    setLogHistory((prev) => [...prev, output]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIdx);
        setInputCmd(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setInputCmd(commandHistory[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCmd('');
      }
    }
  };

  const handleExportLogs = () => {
    const text = logHistory.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edith-terminal-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addToast('Exported terminal logs', 'info');
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Terminal Tab Bar (shown when standalone, hidden in unified dock) */}
      {!hideHeader && (
        <div
          className="flex items-center justify-between px-3 py-1"
          style={{
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(11, 15, 26, 0.6)'
          }}
        >
          <div className="flex items-center gap-1">
            {[
              { id: 'terminal', label: 'Terminal' },
              { id: 'problems', label: `Problems (${diagnostics.length})` },
              { id: 'output', label: 'Output' },
              { id: 'debug_console', label: 'Debug Console' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="glass-btn-ghost capitalize"
                style={{
                  padding: '6px 14px',
                  fontSize: '15px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.25) 0%, rgba(2, 132, 199, 0.2) 100%)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Host Guard & Controls */}
          <div className="flex items-center gap-2.5">
            <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '12px' }}>Execution: Disabled (Safe Boundary)</Badge>
            <button
              onClick={handleExportLogs}
              className="glass-btn-ghost flex items-center justify-center"
              style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--text-muted)' }}
              title="Export terminal log"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setLogHistory([])}
              className="glass-btn-ghost flex items-center justify-center"
              style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--text-muted)' }}
              title="Clear terminal"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Body */}
      {activeTab === 'terminal' && (
        <>
          {/* Terminal Output Stream (16px JetBrains Mono) */}
          <div
            ref={terminalBodyRef}
            className="edith-terminal-body flex-1 overflow-y-auto p-4"
            style={{ fontFamily: 'var(--font-code)', fontSize: '16px', lineHeight: '1.55', background: 'var(--edith-surface-terminal, #060A14)' }}
          >
            {logHistory.map((line, idx) => {
              let lineStyle = { whiteSpace: 'pre-wrap', marginBottom: '4px', lineHeight: '1.55' };
              if (line.includes('INFO:')) lineStyle.color = '#38BDF8';
              else if (line.includes('ERROR:') || line.includes('[BLOCKED]') || line.includes('Prohibited')) lineStyle.color = '#F87171';
              else if (line.includes('PASS') || line.includes('200 OK') || line.includes('complete')) lineStyle.color = '#34D399';
              else if (line.startsWith('(venv)')) lineStyle.color = '#38BDF8';
              else lineStyle.color = '#E2E8F0';

              return (
                <div key={idx} style={lineStyle}>
                  {line}
                </div>
              );
            })}
          </div>

          {/* Terminal Input Prompt (16px JetBrains Mono) */}
          <form
            onSubmit={handleCommandSubmit}
            className="flex items-center gap-3 px-4"
            style={{
              height: '42px',
              background: '#060A14',
              borderTop: '1px solid rgba(56, 189, 248, 0.18)',
              fontFamily: 'var(--font-code)',
              fontSize: '16px'
            }}
          >
            <span style={{ color: '#00D2FF', fontWeight: 500, fontSize: '16px' }}>preview&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type 'help', 'status', 'health', 'build', 'test'..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F8FAFC',
                fontFamily: 'var(--font-code)',
                fontSize: '16px'
              }}
            />
          </form>
        </>
      )}

      {activeTab === 'problems' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
              WORKSPACE DIAGNOSTICS
            </span>
            <span className="text-muted" style={{ fontSize: '13px' }}>
              0 Errors, 2 Warnings, 1 Info
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {diagnostics.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-3 rounded"
                style={{
                  background: d.type === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                  border: d.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  {d.type === 'warning' ? (
                    <AlertTriangle size={16} color="var(--brand-gold)" />
                  ) : (
                    <Info size={16} color="var(--brand-cyan)" />
                  )}
                  <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{d.msg}</span>
                </div>
                <span className="code-inline" style={{ fontSize: '13.5px' }}>
                  {d.file}:{d.line}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'output' && (
        <div className="flex-1 overflow-y-auto p-4 font-mono text-muted" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div>[EDITH Background Daemon] Initialized local event listeners.</div>
          <div>[EDITH Sandboxed File Watcher] Monitoring 4 active project files.</div>
          <div>[Prisma SQLite Engine] dev.db connection pool healthy.</div>
        </div>
      )}

      {activeTab === 'debug_console' && (
        <div className="flex-1 overflow-y-auto p-4 font-mono" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div className="text-muted mb-2">EDITH Debug Console (REPL) - Evaluate expressions in active execution boundary:</div>
          <div style={{ color: 'var(--brand-cyan)' }}>&gt; process.env.NODE_ENV</div>
          <div style={{ color: '#34D399', marginBottom: '8px' }}>"development"</div>
          <div style={{ color: 'var(--brand-cyan)' }}>&gt; edith.activeWorkspace.status</div>
          <div style={{ color: '#34D399' }}>"ready"</div>
        </div>
      )}
    </div>
  );
}
