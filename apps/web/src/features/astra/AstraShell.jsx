import React from 'react';
import {
  FolderTree,
  Code2,
  Terminal,
  Bug,
  CheckCircle2,
  Rocket,
  Database,
  History,
  Settings,
  Bot,
  ArrowLeft,
  LayoutGrid,
  GitBranch,
  Globe,
  Layers,
  Search,
  Maximize2
} from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function AstraShell({
  activeNav,
  onSelectNav,
  activeProject,
  activeFile,
  onBackToBrahma,
  onToggleZenMode,
  isZenMode,
  children
}) {
  const topNavItems = [
    { id: 'workspace', label: 'Full Workspace', icon: LayoutGrid },
    { id: 'files', label: 'Explorer & Files', icon: FolderTree },
    { id: 'editor', label: 'Code Editor', icon: Code2 },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'git', label: 'Git & Version Control', icon: GitBranch },
    { id: 'database', label: 'Database & SQL', icon: Database },
    { id: 'api_client', label: 'API Client & REST', icon: Globe },
    { id: 'terminal', label: 'Terminal & Run', icon: Terminal },
    { id: 'debug', label: 'Run & Debug', icon: Bug },
    { id: 'testing', label: 'Test Runner', icon: CheckCircle2 },
    { id: 'deploy', label: 'Deployment', icon: Rocket },
    { id: 'pipelines', label: 'CI/CD Pipelines', icon: Layers },
    { id: 'history', label: 'Task History', icon: History }
  ];

  return (
    <div
      className="galaxy-canvas flex"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }}
    >
      {/* Activity Bar (Leftmost Glass Strip) */}
      <nav className="astra-activity-bar" aria-label="ASTRA Activity Bar">
        <div className="flex flex-col items-center">
          {/* ASTRA Brand Icon */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid var(--glass-border-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              cursor: 'pointer'
            }}
            onClick={() => onSelectNav('workspace')}
            title="ASTRA Studio"
          >
            <img src="/brand/astra-mark.svg" alt="ASTRA" style={{ width: '24px', height: '24px' }} />
          </div>

          {/* Navigation Items */}
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`astra-activity-btn ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={19} />
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: Settings & Return to BRAHMA */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onSelectNav('settings')}
            className={`astra-activity-btn ${activeNav === 'settings' ? 'active' : ''}`}
            title="ASTRA Preferences"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={onBackToBrahma}
            className="astra-activity-btn"
            style={{ color: 'var(--brand-gold)' }}
            title="Return to BRAHMA Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1" style={{ overflow: 'hidden' }}>
        {/* Top Header Glass Bar */}
        <header
          className="glass-panel flex items-center justify-between"
          style={{
            height: '46px',
            padding: '0 18px',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid var(--glass-border)',
            flexShrink: 0
          }}
        >
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-gold-light)', letterSpacing: '0.04em' }}>
              ASTRA
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {activeProject?.name || 'Workspace'}
            </span>
            {activeFile && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span className="code-inline" style={{ fontSize: '12px' }}>
                  {activeFile.name}
                </span>
              </>
            )}
          </div>

          {/* Service & Sandbox Status Disclosures */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="status-live-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
              <span className="body-small text-muted" style={{ fontSize: '11px' }}>
                ASTRA Engine :8002
              </span>
            </div>

            <Badge variant="cyan">Sandboxed Runner :8003</Badge>

            {onToggleZenMode && (
              <button
                onClick={onToggleZenMode}
                className="glass-btn-ghost body-small flex items-center gap-1"
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '11px',
                  color: isZenMode ? 'var(--brand-gold)' : 'var(--text-muted)'
                }}
                title={isZenMode ? 'Exit Zen Mode (Ctrl+B)' : 'Zen Editor Mode (Ctrl+B)'}
              >
                <Maximize2 size={12} />
                <span>{isZenMode ? 'Exit Zen' : 'Zen'}</span>
              </button>
            )}

            <button
              onClick={onBackToBrahma}
              className="glass-btn-ghost body-small flex items-center gap-1"
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}
            >
              <ArrowLeft size={12} />
              <span>BRAHMA Home</span>
            </button>
          </div>
        </header>

        {/* Content Region */}
        <main className="flex-1" style={{ overflow: 'hidden', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
