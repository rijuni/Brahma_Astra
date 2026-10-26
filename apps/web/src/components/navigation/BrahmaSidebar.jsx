import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BrahmaSidebar({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse
}) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'astra', label: 'EDITH Studio', icon: Code2, isAstra: true },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className="glass-panel flex flex-col justify-between"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: '100vh',
        flexShrink: 0,
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: '1px solid var(--glass-border)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), padding 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 60,
        padding: isCollapsed ? '20px 10px' : '20px 16px',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center gap-3"
          style={{
            marginBottom: '28px',
            paddingLeft: isCollapsed ? '6px' : '8px',
            cursor: 'pointer'
          }}
          onClick={() => onNavigate('dashboard')}
        >
          <img
            src="/brand/friday-mark.svg"
            alt="FRIDAY"
            className="brahma-logo-gold"
            style={{ width: '36px', height: '36px', flexShrink: 0 }}
          />
          {!isCollapsed && (
            <div className="flex flex-col animate-entrance">
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: '18px',
                  letterSpacing: '0.08em',
                  background: 'var(--brahma-logo-gradient, linear-gradient(135deg, #FFE5A7 0%, #F6C87A 100%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                FRIDAY
              </span>
              <span className="body-small text-muted" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>
                PERSONAL AI PLATFORM
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`glass-btn ${isActive ? 'glass-btn-primary' : 'glass-btn-ghost'} flex items-center w-full`}
                style={{
                  padding: isCollapsed ? '10px 0' : '10px 14px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2px',
                  background: isActive
                    ? 'var(--nav-active-bg, linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.25) 100%))'
                    : 'transparent',
                  border: isActive ? '1px solid var(--glass-border-violet)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 16px var(--brand-violet-glow)' : 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  color={isActive ? 'var(--brand-gold)' : 'currentColor'}
                  style={{ flexShrink: 0 }}
                />
                {!isCollapsed && (
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, marginLeft: '12px' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Card & Collapse Toggle */}
      <div className="flex flex-col gap-3">
        {!isCollapsed && (
          <div
            className="glass-card flex items-center justify-between"
            style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-gold)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} color="var(--brand-gold)" />
              <div className="flex flex-col">
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-gold)' }}>
                  PRO PLAN
                </span>
                <span className="body-small text-muted" style={{ fontSize: '11px' }}>
                  Intelligence Active
                </span>
              </div>
            </div>
            <div
              className="status-live-pulse"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success)'
              }}
            />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="glass-btn-secondary flex items-center justify-center w-full"
          style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <div className="flex items-center gap-1">
              <ChevronLeft size={16} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
