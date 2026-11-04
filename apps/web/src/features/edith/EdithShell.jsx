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
      <div className="flex flex-col flex-1" style={{ width: 'calc(100vw - 56px)', height: '100vh', overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
        {/* Top Header Glass Bar */}
        <header
          className="glass-panel flex items-center justify-between"
          style={{
            width: '100%',
            height: 'var(--astra-header-height, 56px)',
            padding: '0 20px',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid rgba(56, 189, 248, 0.22)',
            flexShrink: 0
          }}
        >
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <EdithArcReactor size={26} showHud={false} animated={false} />
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--edith-cyan, #00D2FF)', letterSpacing: '0.12em', fontFamily: "'Michroma', sans-serif" }}>
                EDITH
              </span>
            </div>
            <span style={{ color: 'rgba(56, 189, 248, 0.4)', fontSize: '15px' }}>/</span>
            <span style={{ fontSize: '15.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
              {activeProject?.name || 'Workspace'}
            </span>
            {activeFile && (
              <>
                <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>/</span>
                <span className="code-inline" style={{ fontSize: '15px', padding: '4px 10px' }}>
                  {activeFile.name}
                </span>
              </>
            )}
          </div>

          {/* Service & Sandbox Status Disclosures */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <span className="status-live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-cyan)' }} />
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--brand-cyan)' }} title="EDITH Engine :8002">
                EDITH Engine :8002
              </span>
            </div>

            <Badge variant="cyan" style={{ padding: '5px 12px', fontSize: '13.5px' }}>Sandboxed Runner :8003</Badge>

            {/* Panel Visibility Toggles */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="glass-btn-ghost flex items-center gap-2"
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isSidebarOpen ? '#38BDF8' : 'var(--text-muted)',
                  background: isSidebarOpen ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                  border: isSidebarOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent'
                }}
                title={isSidebarOpen ? 'Collapse Explorer (Ctrl+E)' : 'Expand Explorer (Ctrl+E)'}
              >
                <FolderTree size={16} />
                <span>Explorer</span>
              </button>
            )}

            {onToggleAssistant && (
              <button
                onClick={onToggleAssistant}
                className="glass-btn-ghost flex items-center gap-2"
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isAssistantOpen ? '#7DD3FC' : 'var(--text-muted)',
                  background: isAssistantOpen ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                  border: isAssistantOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent'
                }}
                title={isAssistantOpen ? 'Hide AI Assistant (Ctrl+J)' : 'Show AI Assistant (Ctrl+J)'}
              >
                <Bot size={16} />
                <span>AI Assistant</span>
              </button>
            )}

            {onToggleZenMode && (
              <button
                onClick={onToggleZenMode}
                className="glass-btn-ghost flex items-center gap-2"
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isZenMode ? '#00D2FF' : 'var(--text-secondary)',
                  background: isZenMode ? 'rgba(0, 210, 255, 0.14)' : 'transparent',
                  border: isZenMode ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid transparent'
                }}
                title={isZenMode ? 'Exit Zen Mode (Ctrl+B)' : 'Zen Editor Mode (Ctrl+B)'}
              >
                <Maximize2 size={15} />
                <span>{isZenMode ? 'Exit Zen' : 'Zen'}</span>
              </button>
            )}

            <button
              onClick={onBackToFriday}
              className="glass-btn-ghost flex items-center gap-2"
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--brand-gold-light)',
                border: '1px solid rgba(246, 200, 122, 0.25)',
                background: 'rgba(246, 200, 122, 0.06)'
              }}
              title="Return to FRIDAY Dashboard"
            >
              <ArrowLeft size={15} />
              <span>FRIDAY Home</span>
            </button>
          </div>
        </header>

        {/* Content Region */}
        <main className="flex-1 flex flex-col" style={{ width: '100%', height: 'calc(100vh - 56px)', minHeight: 0, minWidth: 0, overflow: 'hidden', position: 'relative', margin: 0, padding: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
