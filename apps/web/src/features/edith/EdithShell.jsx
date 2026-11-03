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
import EdithArcReactor from '../../components/brand/EdithArcReactor';

export default function EdithShell({
  activeNav,
  onSelectNav,
  activeProject,
  activeFile,
  onBackToFriday,
  onToggleZenMode,
  isZenMode,
  isSidebarOpen = true,
  onToggleSidebar,
  isAssistantOpen = true,
  onToggleAssistant,
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
      className="edith-canvas flex"
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
      <nav className="astra-activity-bar" aria-label="EDITH Activity Bar" style={{ background: 'rgba(6, 12, 24, 0.75)', borderRight: '1px solid rgba(56, 189, 248, 0.22)' }}>
        <div
          className="flex flex-col items-center w-full px-1 overflow-y-auto flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* EDITH Brand Icon */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, rgba(2, 132, 199, 0.12) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)'
            }}
            onClick={() => onSelectNav('workspace')}
            title="EDITH Studio Workspace"
          >
            <EdithArcReactor size={28} showHud={false} animated={true} />
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

        {/* Bottom Actions: Settings & Return to FRIDAY */}
        <div className="flex flex-col items-center w-full px-1 flex-shrink-0" style={{ paddingTop: '8px' }}>
          <button
            onClick={() => onSelectNav('settings')}
            className={`astra-activity-btn ${activeNav === 'settings' ? 'active' : ''}`}
            title="EDITH Preferences & Settings"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={onBackToFriday}
            className="astra-activity-btn"
            style={{ color: 'var(--brand-gold)' }}
            title="Return to FRIDAY Dashboard"
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
            <div className="flex items-center gap-2">
              <EdithArcReactor size={22} showHud={false} animated={false} />
              <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--edith-cyan, #00D2FF)', letterSpacing: '0.12em', fontFamily: "'Michroma', sans-serif" }}>
                EDITH
              </span>
            </div>
            <span style={{ color: 'rgba(56, 189, 248, 0.4)', fontSize: '13px' }}>/</span>
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
            <div className="flex items-center gap-2 px-2.5 py-1 rounded" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <span className="status-live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-cyan)' }} />
              <span className="body-small" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--brand-cyan)' }} title="EDITH Engine :8002">
                EDITH Engine :8002
              </span>
            </div>

            <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '11.5px' }}>Sandboxed Runner :8003</Badge>

            {/* Panel Visibility Toggles */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="glass-btn-ghost flex items-center gap-1.5"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: isSidebarOpen ? 'var(--brand-gold)' : 'var(--text-muted)',
                  background: isSidebarOpen ? 'rgba(246, 200, 122, 0.12)' : 'transparent',
                  border: isSidebarOpen ? '1px solid rgba(246, 200, 122, 0.35)' : '1px solid transparent'
                }}
                title={isSidebarOpen ? 'Collapse Explorer (Ctrl+E)' : 'Expand Explorer (Ctrl+E)'}
              >
                <FolderTree size={14} />
                <span>Explorer</span>
              </button>
            )}

            {onToggleAssistant && (
              <button
                onClick={onToggleAssistant}
                className="glass-btn-ghost flex items-center gap-1.5"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: isAssistantOpen ? 'var(--brand-violet-light)' : 'var(--text-muted)',
                  background: isAssistantOpen ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                  border: isAssistantOpen ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid transparent'
                }}
                title={isAssistantOpen ? 'Hide AI Assistant (Ctrl+J)' : 'Show AI Assistant (Ctrl+J)'}
              >
                <Bot size={14} />
                <span>AI Assistant</span>
              </button>
            )}

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
              onClick={onBackToFriday}
              className="glass-btn-ghost flex items-center gap-1.5"
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--brand-gold-light)',
                border: '1px solid rgba(246, 200, 122, 0.25)',
                background: 'rgba(246, 200, 122, 0.06)'
              }}
              title="Return to FRIDAY Dashboard"
            >
              <ArrowLeft size={13} />
              <span>FRIDAY Home</span>
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
