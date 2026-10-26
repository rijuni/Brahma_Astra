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
  // Ensure the window/document scroll is strictly locked to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

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
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }}
    >
      {/* Activity Bar (Leftmost Glass Strip) */}
      <nav className="astra-activity-bar" aria-label="ASTRA Activity Bar">
        <div
          className="flex flex-col items-center w-full px-1 overflow-y-auto flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* ASTRA Brand Icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(139, 92, 246, 0.22) 100%)',
              border: '1px solid var(--glass-border-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)'
            }}
            onClick={() => onSelectNav('workspace')}
            title="ASTRA Studio Workspace"
          >
            <img src="/brand/astra-mark.svg" alt="ASTRA" style={{ width: '24px', height: '24px' }} />
          </div>

          {/* Primary Workspace Navigation Group */}
          {topNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`astra-activity-btn ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}

          {/* Semantic Divider */}
          <div className="astra-activity-divider" />

          {/* DevTools Navigation Group */}
          {topNavItems.slice(4).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`astra-activity-btn ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: Settings & Return to BRAHMA */}
        <div className="flex flex-col items-center w-full px-1 flex-shrink-0" style={{ paddingTop: '8px' }}>
          <button
            onClick={() => onSelectNav('settings')}
            className={`astra-activity-btn ${activeNav === 'settings' ? 'active' : ''}`}
            title="ASTRA Preferences & Settings"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={onBackToBrahma}
            className="astra-activity-btn"
            style={{ color: 'var(--brand-gold)' }}
            title="Return to BRAHMA Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1" style={{ overflow: 'hidden', minHeight: 0 }}>
        {/* Top Header Glass Bar */}
        <header
          className="glass-panel flex items-center justify-between"
          style={{
            height: 'var(--astra-header-height)',
            padding: '0 22px',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid var(--glass-border)',
            flexShrink: 0
          }}
        >
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-gold)', letterSpacing: '0.05em' }}>
              ASTRA
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/</span>
            <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
              {activeProject?.name || 'Workspace'}
            </span>
            {activeFile && (
              <>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/</span>
                <span className="code-inline" style={{ fontSize: '12.5px', padding: '3px 8px' }}>
                  {activeFile.name}
                </span>
              </>
            )}
          </div>

          {/* Service & Sandbox Status Disclosures */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
              <span className="status-live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
              <span className="body-small text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>
                ASTRA Engine :8002
              </span>
            </div>

            <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '11.5px' }}>Sandboxed Runner :8003</Badge>

            {onToggleZenMode && (
              <button
                onClick={onToggleZenMode}
                className="glass-btn-ghost flex items-center gap-1.5"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: isZenMode ? 'var(--brand-gold)' : 'var(--text-secondary)'
                }}
                title={isZenMode ? 'Exit Zen Mode (Ctrl+B)' : 'Zen Editor Mode (Ctrl+B)'}
              >
                <Maximize2 size={13} />
                <span>{isZenMode ? 'Exit Zen' : 'Zen'}</span>
              </button>
            )}

            <button
              onClick={onBackToBrahma}
              className="glass-btn-ghost flex items-center gap-1.5"
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}
            >
              <ArrowLeft size={13} />
              <span>BRAHMA Home</span>
            </button>
          </div>
        </header>

        {/* Content Region */}
        <main className="flex-1" style={{ overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
