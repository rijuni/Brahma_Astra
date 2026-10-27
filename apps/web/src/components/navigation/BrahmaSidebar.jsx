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
  Code2,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FridayArcReactor from '../brand/FridayArcReactor';

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
      className="friday-sidebar flex flex-col justify-between"
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
        borderRight: '1px solid rgba(246, 200, 122, 0.22)',
        boxShadow: '6px 0 28px rgba(0, 0, 0, 0.65)',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), padding 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 60,
        padding: isCollapsed ? '20px 10px' : '22px 14px',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Brand Header with Animated Arc Reactor */}
        <div
          className="flex items-center gap-3"
          style={{
            marginBottom: '28px',
            paddingLeft: isCollapsed ? '2px' : '6px',
            cursor: 'pointer'
          }}
          onClick={() => onNavigate('dashboard')}
          title="FRIDAY Cockpit Dashboard"
        >
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FridayArcReactor size={isCollapsed ? 32 : 36} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-entrance">
              <span
                style={{
                  fontFamily: "'Michroma', 'Syncopate', sans-serif",
                  fontWeight: 700,
                  fontSize: '17px',
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF3D6 24%, #F6C87A 58%, #D49A3E 82%, #9B6717 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 12px rgba(246, 200, 122, 0.35))'
                }}
              >
                FRIDAY
              </span>
              <span style={{ fontSize: '8.5px', letterSpacing: '0.16em', color: 'var(--brand-gold-light)', opacity: 0.9, textTransform: 'uppercase', fontWeight: 600 }}>
                PERSONAL AI PLATFORM
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`friday-sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  padding: isCollapsed ? '11px 0' : '11px 14px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={19}
                  color={isActive ? '#FAD982' : 'currentColor'}
                  style={{
                    flexShrink: 0,
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(246, 200, 122, 0.6))' : 'none'
                  }}
                />
                {!isCollapsed && (
                  <span
                    style={{
                      fontSize: '13.5px',
                      fontWeight: isActive ? 700 : 500,
                      marginLeft: '12px',
                      letterSpacing: isActive ? '0.02em' : 'normal',
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)'
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Stark HUD Telemetry Monitor & Collapse Toggle */}
      <div className="flex flex-col gap-3">
        {!isCollapsed ? (
          <div className="friday-sidebar-telemetry flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity size={13} color="var(--brand-gold-light)" />
                <span
                  style={{
                    fontFamily: "'Michroma', sans-serif",
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--brand-gold-light)',
                    textTransform: 'uppercase'
                  }}
                >
                  STARK TELEMETRY
                </span>
              </div>
              <span className="telemetry-beacon-online" />
            </div>

            <div className="flex items-center justify-between" style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.65)' }}>
              <span>ENCLAVE</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>ARMED // 99.98%</span>
            </div>

            <div className="friday-metric-track" style={{ height: '3px', marginTop: '2px' }}>
              <div className="friday-metric-fill" style={{ width: '92%' }} />
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{
              padding: '10px 0',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '10px',
              border: '1px solid rgba(246, 200, 122, 0.25)'
            }}
            title="Cockpit Telemetry: Active"
          >
            <span className="telemetry-beacon-online" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="glass-btn-secondary flex items-center justify-center w-full"
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'rgba(255, 255, 255, 0.7)'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <div className="flex items-center gap-1.5">
              <ChevronLeft size={15} />
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
