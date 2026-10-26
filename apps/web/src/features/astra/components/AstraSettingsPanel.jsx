import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Keyboard,
  Sliders,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Server,
  Zap,
  Globe
} from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { useToast } from '../../../components/feedback/Toast';

export default function AstraSettingsPanel() {
  const [tabSize, setTabSize] = useState('2');
  const [fontSize, setFontSize] = useState('13');
  const [wordWrap, setWordWrap] = useState('on');
  const [theme, setTheme] = useState('cosmic-dark');

  const [serviceStatus, setServiceStatus] = useState({
    api: { name: 'Node.js Application API (:3000)', status: 'checking', latency: '...' },
    brahma: { name: 'FRIDAY Core FastAPI (:8001)', status: 'checking', latency: '...' },
    astraEngine: { name: 'EDITH Engine FastAPI (:8002)', status: 'checking', latency: '...' },
    astraRunner: { name: 'EDITH Runner Execution Boundary (:8003)', status: 'checking', latency: '...' }
  });
  const [isCheckingServices, setIsCheckingServices] = useState(false);

  const { addToast } = useToast();

  const pingAllServices = async () => {
    setIsCheckingServices(true);
    const checkService = async (url) => {
      const start = performance.now();
      try {
        const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(2000) });
        const latency = `${Math.round(performance.now() - start)}ms`;
        return { status: res.ok ? 'online' : 'error', latency };
      } catch {
        return { status: 'offline', latency: 'unreachable' };
      }
    };

    const [apiRes, brahmaRes, engineRes, runnerRes] = await Promise.all([
      checkService('http://localhost:3000/health/live'),
      checkService('http://localhost:8001/health/live'),
      checkService('http://localhost:8002/health/live'),
      checkService('http://localhost:8003/health/live')
    ]);

    setServiceStatus({
      api: { name: 'Node.js Application API (:3000)', ...apiRes },
      brahma: { name: 'FRIDAY Core FastAPI (:8001)', ...brahmaRes },
      astraEngine: { name: 'EDITH Engine FastAPI (:8002)', ...engineRes },
      astraRunner: { name: 'EDITH Runner Execution Boundary (:8003)', ...runnerRes }
    });
    setIsCheckingServices(false);
  };

  useEffect(() => {
    pingAllServices();
  }, []);

  const shortcuts = [
    { key: 'Ctrl + B', desc: 'Toggle Zen Mode (hide explorer & assistant rails)' },
    { key: 'Ctrl + S', desc: 'Save current active file' },
    { key: 'Ctrl + F', desc: 'Find in active file' },
    { key: 'Ctrl + H', desc: 'Find & Replace overlay' },
    { key: 'Ctrl + G', desc: 'Jump to specific line number' },
    { key: 'Enter', desc: 'Send prompt in assistant composer' },
    { key: 'Shift + Enter', desc: 'Insert newline in assistant composer' },
    { key: 'F5 / F10', desc: 'Start Debugger / Step Over' }
  ];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3.5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2.5">
          <Settings size={17} color="var(--brand-gold)" />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>EDITH Studio Settings & System Health</span>
        </div>
        <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '11.5px' }}>STUDIO ENVIRONMENT</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {/* Left: Preferences & Keybindings */}
        <div className="flex flex-col gap-4">
          {/* Preferences */}
          <div>
            <span className="body-small text-muted" style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              EDITOR & THEME PREFERENCES
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-muted" style={{ fontSize: '11px', fontWeight: 500 }}>Tab Size</span>
                <select value={tabSize} onChange={(e) => setTabSize(e.target.value)} className="glass-input" style={{ height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}>
                  <option value="2" style={{ background: '#0B0F1A' }}>2 spaces</option>
                  <option value="4" style={{ background: '#0B0F1A' }}>4 spaces</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-muted" style={{ fontSize: '11px', fontWeight: 500 }}>Font Size</span>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="glass-input" style={{ height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}>
                  <option value="12" style={{ background: '#0B0F1A' }}>12 px</option>
                  <option value="13" style={{ background: '#0B0F1A' }}>13 px</option>
                  <option value="14" style={{ background: '#0B0F1A' }}>14 px</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-muted" style={{ fontSize: '11px', fontWeight: 500 }}>Theme</span>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="glass-input" style={{ height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}>
                  <option value="cosmic-dark" style={{ background: '#0B0F1A' }}>Cosmic Dark (Default)</option>
                  <option value="obsidian" style={{ background: '#0B0F1A' }}>Obsidian Glass</option>
                </select>
              </div>
            </div>
          </div>

          {/* Keybindings Cheat Sheet */}
          <div>
            <span className="body-small text-muted" style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              KEYBOARD SHORTCUTS
            </span>
            <div className="flex flex-col gap-1.5">
              {shortcuts.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 px-3 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)', fontSize: '12px' }}>
                  <kbd className="code-inline" style={{ fontSize: '11px', color: 'var(--brand-gold)', padding: '2px 7px' }}>{s.key}</kbd>
                  <span className="body-small text-secondary" style={{ fontSize: '11.5px' }}>{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Microservice Live Ping Monitor & Reality Matrix */}
        <div className="flex flex-col gap-3.5">
          {/* Microservice Health Monitor */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="body-small text-muted" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                INTEGRATION STATUS MATRIX & LIVE PING MONITOR
              </span>
              <button
                onClick={pingAllServices}
                disabled={isCheckingServices}
                className="glass-btn-ghost flex items-center gap-1.5 text-muted hover:text-white"
                style={{ fontSize: '11.5px', height: '28px', padding: '0 10px', borderRadius: '6px' }}
                title="Ping all background microservices"
              >
                <RefreshCw size={12} className={isCheckingServices ? 'animate-spin' : ''} /> Ping All
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {Object.entries(serviceStatus).map(([key, s]) => {
                const isOnline = s.status === 'online';
                const isChecking = s.status === 'checking';

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded"
                    style={{
                      background: 'rgba(7, 10, 24, 0.4)',
                      border: isOnline ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--glass-border)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: isOnline ? 'var(--status-success)' : isChecking ? 'var(--brand-gold)' : 'var(--status-error)',
                          boxShadow: isOnline ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                        }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{s.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted" style={{ fontSize: '10px' }}>{s.latency}</span>
                      <Badge variant={isOnline ? 'cyan' : isChecking ? 'gold' : 'error'} size="small">
                        {isOnline ? 'ONLINE' : isChecking ? 'PINGING' : 'OFFLINE'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reality Matrix & Security Disclosures */}
          <div className="p-2.5 rounded bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={12} color="var(--brand-gold)" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-gold)' }}>
                System Architecture Disclosures
              </span>
            </div>
            <div className="text-muted flex flex-col gap-1" style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div>• <strong>Real Live Endpoints:</strong> Application API (:3000), FRIDAY (:8001), EDITH Engine (:8002).</div>
              <div>• <strong>Sandboxed Boundary:</strong> EDITH Runner (:8003) execution mode is strictly "disabled" for host safety.</div>
              <div>• <strong>Local Database:</strong> SQLite dev.db via Prisma client. Zero external cloud dependencies required.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
