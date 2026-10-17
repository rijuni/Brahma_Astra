import React, { useState } from 'react';
import {
  Home,
  MessageSquare,
  BookOpen,
  FileText,
  Image as ImageIcon,
  FolderKanban,
  Disc,
  Sparkles,
  Rocket,
  Settings,
  Search,
  Bell,
  Sun,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Crown,
  Activity
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

export function BrahmaShell({ children }) {
  const { currentRoute, navigate } = useNavigation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'memory', label: 'Memory', icon: Disc },
    { id: 'agents', label: 'Agents', icon: Sparkles },
    { id: 'astra-launcher', label: 'Astra', icon: Rocket, special: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'AN');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        position: 'relative'
      }}
    >
      {/* Desktop Persistent Sidebar */}
      <aside
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          transition: 'width var(--transition-normal)',
          flexShrink: 0
        }}
        className="brahma-sidebar"
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0 12px' : '0 20px',
            borderBottom: '1px solid var(--border-default)'
          }}
        >
          <div
            onClick={() => navigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
          >
            <img
              src="/brand/brahma-mark.svg"
              alt="BRAHMA Sacred Mark"
              style={{ width: '36px', height: '36px', flexShrink: 0 }}
            />
            {!isCollapsed && (
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 800,
                    fontSize: '18px',
                    letterSpacing: '0.08em',
                    color: 'var(--brand-gold)'
                  }}
                >
                  BRAHMA
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '9px',
                    letterSpacing: '0.06em',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase'
                  }}
                >
                  Your Intelligence Core
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Re-expand button when collapsed */}
        {isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <button
              onClick={() => setIsCollapsed(false)}
              style={{
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <Menu size={18} />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '12px 8px' : '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
          aria-label="Main Navigation"
        >
          {navItems.map(item => {
            const isActive = currentRoute === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isCollapsed ? '12px' : '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive
                    ? 'var(--brand-violet)'
                    : item.special
                    ? 'rgba(56, 189, 248, 0.08)'
                    : 'transparent',
                  color: isActive
                    ? '#FFFFFF'
                    : item.special
                    ? 'var(--astra-electric-blue)'
                    : 'var(--text-secondary)',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  boxShadow: isActive ? '0 2px 12px rgba(139, 92, 246, 0.4)' : 'none'
                }}
                title={item.label}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.special && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      color: 'var(--astra-electric-blue)',
                      fontWeight: 700
                    }}
                  >
                    IDE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: User Card */}
        <div
          style={{
            padding: isCollapsed ? '12px' : '16px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {!isCollapsed && (
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(30, 27, 61, 0.8), rgba(17, 24, 39, 0.9))',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(246, 200, 122, 0.15)',
                  color: 'var(--brand-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Crown size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Upgrade to Ultra
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Get maximum power &amp; context
                </div>
              </div>
            </div>
          )}

          {/* User Profile Snippet */}
          <div
            onClick={() => {
              if (!user) {
                navigate('login');
              } else {
                setShowUserMenu(!showUserMenu);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              position: 'relative',
              backgroundColor: 'rgba(17, 24, 39, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: user ? 'var(--brand-violet)' : 'rgba(48, 56, 77, 0.6)',
                  color: user ? '#FFFFFF' : 'var(--brand-gold)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: user ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
                }}
              >
                {user ? userInitials : 'AN'}
              </div>
              {!isCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {user ? (user.name || user.email) : 'Amlan Nanda'}
                  </div>
                  <div style={{ fontSize: '11px', color: user ? 'var(--brand-gold)' : 'var(--text-secondary)' }}>
                    {user ? `${user.role || 'user'} • Pro Plan` : 'Sign In to Sync'}
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown size={14} color="var(--text-secondary)" />}

            {/* Dropdown Logout Menu */}
            {showUserMenu && user && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: '8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-card)',
                  padding: '6px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)', marginBottom: '4px' }}>
                  {user.email}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'var(--status-error)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'rgba(11, 15, 26, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--section-padding)',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)'
            }}
            className="mobile-hamburger"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Central Search Bar */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              placeholder="Search anything... (Ctrl + K)"
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Header Right Utilities matching approved reference */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('chat')}
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(48, 56, 77, 0.2)',
                transition: 'color var(--transition-fast)'
              }}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={18} />
            </button>

            <button
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(48, 56, 77, 0.2)',
                transition: 'color var(--transition-fast)'
              }}
              title="Appearance"
              aria-label="Change appearance"
            >
              <Sun size={18} />
            </button>

            <button
              onClick={() => navigate('settings')}
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(48, 56, 77, 0.2)',
                transition: 'color var(--transition-fast)'
              }}
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>

            {/* User Profile Avatar with dropdown chevron matching reference */}
            <div
              onClick={() => {
                if (!user) navigate('login');
                else setShowUserMenu(!showUserMenu);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              title="Account Profile"
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-violet)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  position: 'relative'
                }}
              >
                {userInitials}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-success)',
                    border: '1.5px solid var(--bg-base)'
                  }}
                  title="Backend Connected"
                />
              </div>
              <ChevronDown size={14} color="var(--text-secondary)" />
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main style={{ flex: 1, padding: 'var(--section-padding)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
