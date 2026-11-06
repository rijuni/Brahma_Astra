import React, { useState, useEffect } from 'react';
import FridaySidebar from '../navigation/FridaySidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import { Menu } from 'lucide-react';

export default function FridayShell({
  children,
  currentRoute,
  onNavigate
}) {
  const [isCompact, setIsCompact] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => window.matchMedia('(max-width: 760px)').matches);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const handleChange = (event) => {
      setIsCompact(event.matches);
      setIsSidebarHidden(event.matches);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const handleNavigate = (route) => {
    onNavigate(route);
    if (isCompact) setIsSidebarHidden(true);
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar hideout mode
  useEffect(() => {
    function handleKeyDown(e) {
      const target = e.target;
      const isEditing = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarHidden((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="cosmic-canvas"
      style={{
        height: '100dvh',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex'
      }}
    >
      {/* 1. Stationary Left Sidebar: Slides in/out of Hideout Mode */}
      <FridaySidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        isHidden={isSidebarHidden}
        onToggleHideout={() => setIsSidebarHidden((prev) => !prev)}
      />

      {isCompact && !isSidebarHidden && (
        <button
          type="button"
          className="friday-sidebar-scrim"
          aria-label="Close navigation menu"
          onClick={() => setIsSidebarHidden(true)}
        />
      )}

      {/* 2. Main Content Area: Fits full screen, auto-expands to 100vw when sidebar is in hideout */}
      <div
        className="friday-shell-content"
        style={{
          marginLeft: isSidebarHidden ? 0 : 'var(--sidebar-width)',
          height: '100dvh',
          width: isSidebarHidden ? '100vw' : 'calc(100vw - var(--sidebar-width))',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Minimal Strip when Sidebar is in Hideout: Clean dedicated row so NOTHING overlaps dashboard or chat */}
        {isSidebarHidden && (
          <div
            className="flex items-center justify-between"
            style={{
              height: '42px',
              padding: '0 20px',
              flexShrink: 0,
              borderBottom: '1px solid rgba(246, 200, 122, 0.12)',
              background: 'rgba(6, 8, 18, 0.85)',
              backdropFilter: 'blur(16px)',
              boxSizing: 'border-box',
              zIndex: 30
            }}
          >
            <button
              type="button"
              onClick={() => setIsSidebarHidden(false)}
              className="glass-btn-ghost flex items-center justify-center"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: '1px solid rgba(246, 200, 122, 0.3)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#FAD982',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease'
              }}
              title="Open Sidebar (Ctrl+B)"
            >
              <Menu size={16} />
            </button>
          </div>
        )}

        {/* Scrollable Main Screen Body: Fit-to-screen Edge-to-Edge */}
        <main
          style={{
            flex: 1,
              height: isSidebarHidden ? 'calc(100dvh - 42px)' : '100dvh',
            width: '100%',
            overflowY: currentRoute === 'chat' ? 'hidden' : 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            className="friday-shell-page"
            style={{
              width: '100%',
              height: currentRoute === 'chat' ? '100%' : 'auto',
              minHeight: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              padding: currentRoute === 'chat' ? '16px 20px' : '20px 24px'
            }}
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
