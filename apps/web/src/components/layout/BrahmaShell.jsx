import React, { useState, useEffect } from 'react';
import BrahmaSidebar from '../navigation/BrahmaSidebar';
import BrahmaNavbar from '../navigation/BrahmaNavbar';
import ErrorBoundary from '../common/ErrorBoundary';

export default function BrahmaShell({
  children,
  currentRoute,
  onNavigate,
  onOpenSearch
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar hide/unhide
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sidebarWidth = isSidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)';

  return (
    <div
      className="cosmic-canvas"
      style={{
        height: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex'
      }}
    >
      {/* 1. Stationary Left Sidebar: Locked to Viewport with position fixed from top: 0 to bottom: 0 */}
      <BrahmaSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Content Area: Offset by sidebar width, fills remaining width and height */}
      <div
        style={{
          marginLeft: sidebarWidth,
          height: '100vh',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Sticky Top Header: Stays locked at the top */}
        <BrahmaNavbar
          onOpenSearch={onOpenSearch}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Scrollable Main Body: ONLY this container scrolls */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 32px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
