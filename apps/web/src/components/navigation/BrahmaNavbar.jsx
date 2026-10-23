import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../feedback/Toast';

export default function BrahmaNavbar({ onOpenSearch, isSidebarCollapsed, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
    addToast(`Theme switched to ${isDark ? 'Ethereal Light' : 'Cosmic Dark'}`, 'info');
  };

  return (
    <header
      className="glass-panel flex items-center justify-between"
      style={{
        height: 'var(--header-height)',
        padding: '0 24px',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50
      }}
    >
      {/* Left: Sidebar Toggle + Global Search Trigger */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="glass-btn-ghost flex items-center justify-center"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.04)',
              cursor: 'pointer',
              color: 'var(--brand-gold-light)',
              padding: 0
            }}
            title={isSidebarCollapsed ? "Show Sidebar (Ctrl+B)" : "Hide Sidebar (Ctrl+B)"}
          >
            <Menu size={18} />
          </button>
        )}

        <div
          onClick={onOpenSearch}
          className="glass-input flex items-center gap-3 cursor-pointer"
          style={{
            maxWidth: '380px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer'
          }}
          role="button"
          tabIndex={0}
        >
        <Search size={16} color="var(--text-muted)" />
        <span className="body-regular text-muted" style={{ fontSize: '13px' }}>
          Search anything in BRAHMA...
        </span>
        <kbd
          className="code-inline"
          style={{ marginLeft: 'auto', fontSize: '11px', padding: '1px 6px' }}
        >
          Ctrl K
        </kbd>
      </div>
    </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleTheme}
          className="glass-btn-ghost flex items-center justify-center"
          style={{ width: '38px', height: '38px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }}
          title={isDark ? "Switch to Ethereal Light theme" : "Switch to Cosmic Dark theme"}
        >
          {isDark ? <Sun size={18} color="var(--brand-gold)" /> : <Moon size={18} color="var(--brand-violet)" />}
        </button>

        <button
          onClick={() => addToast('No unread notifications at this time.', 'info')}
          className="glass-btn-ghost"
          style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', position: 'relative' }}
          title="Notifications"
        >
          <Bell size={18} color="var(--text-secondary)" />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-cyan)'
            }}
          />
        </button>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="glass-btn-secondary flex items-center gap-2"
            style={{
              padding: '5px 12px 5px 6px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-violet) 0%, var(--brand-gold) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px',
                color: '#0B0F1A'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <span className="body-regular" style={{ fontSize: '13px', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email || 'Amlan'}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div
              className="glass-card animate-entrance"
              style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '200px',
                padding: '8px',
                zIndex: 100,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)'
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '4px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{user?.name || 'User'}</div>
                <div className="body-small text-muted" style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  addToast('Logged out of BRAHMA successfully', 'info');
                }}
                className="glass-btn-ghost flex items-center gap-2 w-full text-left"
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', color: 'var(--status-error)' }}
              >
                <LogOut size={14} />
                <span style={{ fontSize: '13px' }}>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
