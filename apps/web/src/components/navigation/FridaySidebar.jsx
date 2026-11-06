import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  FileText,
  Settings,
  Code2,
  Activity,
  Sun,
  Moon,
  Bell,
  LogOut,
  PanelLeftClose
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../feedback/Toast';
import FridayArcReactor from '../brand/FridayArcReactor';
import EdithArcReactor from '../brand/EdithArcReactor';

export default function FridaySidebar({
  currentRoute,
  onNavigate,
  isHidden,
  onToggleHideout
}) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const handleToggleTheme = () => {
    toggleTheme();
    addToast(`Theme switched to ${isDark ? 'Ethereal Light' : 'Cosmic Dark'}`, 'info');
  };

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
        width: 'var(--sidebar-width)',
        height: '100vh',
        flexShrink: 0,
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: '1px solid rgba(246, 200, 122, 0.22)',
        boxShadow: '6px 0 28px rgba(0, 0, 0, 0.65)',
        transform: isHidden ? 'translateX(-100%)' : 'translateX(0)',
        visibility: isHidden ? 'hidden' : 'visible',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s ease',
        zIndex: 80,
        padding: '20px 14px 16px',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Brand Header with Animated Arc Reactor & Hideout Close Button */}
        <div
          className="flex items-center justify-between"
          style={{
            marginBottom: '24px',
            padding: '2px 4px 6px',
            borderBottom: '1px solid rgba(246, 200, 122, 0.15)'
          }}
        >
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
            title="FRIDAY Cockpit Dashboard"
          >
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FridayArcReactor size={34} />
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Michroma', 'Syncopate', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF3D6 24%, #F6C87A 58%, #D49A3E 82%, #9B6717 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 12px rgba(246, 200, 122, 0.35))'
                }}
              >
                FRIDAY
              </span>
              <span style={{ fontSize: '8px', letterSpacing: '0.16em', color: 'var(--brand-gold-light)', opacity: 0.9, textTransform: 'uppercase', fontWeight: 600 }}>
                PERSONAL AI PLATFORM
              </span>
            </div>
          </div>

          {/* Hideout Close Button */}
          {onToggleHideout && (
            <button
              type="button"
              onClick={onToggleHideout}
              className="glass-btn-ghost flex items-center justify-center"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: '1px solid rgba(246, 200, 122, 0.2)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                padding: 0
              }}
              title="Hide sidebar to hideout (Ctrl+B)"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5" style={{ marginBottom: '16px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            const isEdith = item.id === 'astra';

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`friday-sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  padding: '10px 14px',
                  justifyContent: 'flex-start',
                  width: '100%',
                  ...(isEdith && isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.55)',
                        boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)'
                      }
                    : {})
                }}
              >
                {isEdith ? (
                  <EdithArcReactor size={20} showHud={false} animated={isActive} />
                ) : (
                  <Icon
                    size={18}
                    color={isActive ? '#FAD982' : 'currentColor'}
                    style={{
                      flexShrink: 0,
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(246, 200, 122, 0.6))' : 'none'
                    }}
                  />
                )}
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
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Telemetry + Controls Strip + User Profile */}
      <div className="flex flex-col gap-3" style={{ marginTop: 'auto', paddingTop: '16px' }}>
        {/* Service health summary */}
        <div className="friday-sidebar-telemetry flex flex-col gap-1.5" style={{ padding: '10px 12px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity size={12} color="var(--brand-gold-light)" />
              <span
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  fontSize: '8.5px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--brand-gold-light)',
                  textTransform: 'uppercase'
                }}
              >
                SERVICE HEALTH
              </span>
            </div>
          </div>

          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.68)', lineHeight: 1.5 }}>
            Open Settings to check live service connectivity.
          </div>
        </div>

        {/* Absorbed Utilities Strip: Theme Toggle + Notifications Bell + Hideout */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="glass-btn-ghost flex items-center justify-center gap-1.5"
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '10px',
              border: '1px solid rgba(246, 200, 122, 0.22)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: isDark ? '#FAD982' : '#A78BFA',
              cursor: 'pointer',
              fontSize: '11.5px',
              fontWeight: 600
            }}
            title={isDark ? "Switch to Ethereal Light theme" : "Switch to Cosmic Dark theme"}
          >
            {isDark ? <Sun size={15} color="#FAD982" /> : <Moon size={15} color="#A78BFA" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => addToast('No unread notifications at this time.', 'info')}
            className="glass-btn-ghost flex items-center justify-center gap-1.5"
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '10px',
              border: '1px solid rgba(246, 200, 122, 0.22)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              position: 'relative',
              fontSize: '11.5px',
              fontWeight: 600
            }}
            title="Notifications"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={15} />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-3px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#22D3EE',
                  boxShadow: '0 0 6px #22D3EE'
                }}
              />
            </div>
            <span>Alerts</span>
          </button>

          {/* Hideout Action Button */}
          {onToggleHideout && (
            <button
              type="button"
              onClick={onToggleHideout}
              className="glass-btn-ghost flex items-center justify-center"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid rgba(246, 200, 122, 0.22)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--brand-gold-light)',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0
              }}
              title="Hide sidebar to hideout (Ctrl+B)"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>

        {/* User Profile Pill Card with Avatar & Sign Out */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(246, 200, 122, 0.25)',
            borderRadius: '14px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-violet) 0%, var(--brand-gold) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                color: '#0B0F1A',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(246, 200, 122, 0.35)'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.name || 'Amlan Nanda'}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.55)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.email || 'Lead Developer'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              addToast('Logged out of FRIDAY successfully', 'info');
            }}
            className="glass-btn-ghost flex items-center justify-center"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
