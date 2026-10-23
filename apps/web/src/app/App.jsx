import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../features/auth/AuthPage';
import BrahmaShell from '../components/layout/BrahmaShell';
import HomeDashboard from '../features/dashboard/HomeDashboard';
import ChatWorkspace from '../features/chat/ChatWorkspace';
import ProjectsWorkspace from '../features/projects/ProjectsWorkspace';
import FilesWorkspace from '../features/files/FilesWorkspace';
import SettingsWorkspace from '../features/settings/SettingsWorkspace';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { Search } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [initialChatPrompt, setInitialChatPrompt] = useState('');

  // Handle Ctrl+K shortcut for search
  React.useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartChat = (prompt) => {
    setInitialChatPrompt(prompt);
    setCurrentRoute('chat');
  };

  const searchItems = [
    { id: 'dashboard', title: 'Home Dashboard', subtitle: 'Overview, recent activity & intelligence status', route: 'dashboard', badge: 'Dashboard' },
    { id: 'chat', title: 'AI Conversations & Chat', subtitle: 'Deep research, code synthesis & reasoning', route: 'chat', badge: 'Chat' },
    { id: 'projects', title: 'Projects & Workflows', subtitle: 'Manage collaborative workspaces and tasks', route: 'projects', badge: 'Projects' },
    { id: 'files', title: 'Document & File Workspace', subtitle: 'Staging, inspection & document management', route: 'files', badge: 'Files' },
    { id: 'settings', title: 'Settings & Profile', subtitle: 'Appearance themes, account & system diagnostics', route: 'settings', badge: 'Settings' }
  ];

  const filteredSearchItems = searchItems.filter((item) => {
    if (!globalSearchTerm.trim()) return true;
    const term = globalSearchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.subtitle.toLowerCase().includes(term) ||
      item.badge.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="cosmic-canvas flex items-center justify-center" style={{ minHeight: '100vh', width: '100vw' }}>
        <LoadingSpinner size={44} label="Initializing BRAHMA Intelligence..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <HomeDashboard onNavigate={setCurrentRoute} onStartChat={handleStartChat} />;
      case 'chat':
        return (
          <ChatWorkspace
            initialPrompt={initialChatPrompt}
            onResetInitialPrompt={() => setInitialChatPrompt('')}
          />
        );
      case 'projects':
        return <ProjectsWorkspace onNavigate={setCurrentRoute} />;
      case 'files':
        return <FilesWorkspace />;
      case 'settings':
        return <SettingsWorkspace />;
      default:
        return <HomeDashboard onNavigate={setCurrentRoute} onStartChat={handleStartChat} />;
    }
  };

  return (
    <BrahmaShell
      currentRoute={currentRoute}
      onNavigate={setCurrentRoute}
      onOpenSearch={() => setIsSearchOpen(true)}
    >
      {renderContent()}

      {/* Global Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => { setIsSearchOpen(false); setGlobalSearchTerm(''); }}
        title="Global Search"
        maxWidth="580px"
      >
        <Input
          icon={Search}
          placeholder="Search conversations, projects, files, or tools..."
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          autoFocus
        />

        <div className="flex flex-col gap-2" style={{ marginTop: '16px' }}>
          <span className="body-small text-muted">
            {globalSearchTerm.trim() ? `RESULTS (${filteredSearchItems.length})` : 'QUICK NAVIGATION'}
          </span>
          {filteredSearchItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }} className="body-small">
              No matching pages or tools found for "{globalSearchTerm}".
            </div>
          ) : (
            filteredSearchItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentRoute(item.route);
                  setIsSearchOpen(false);
                  setGlobalSearchTerm('');
                }}
                className="glass-btn-ghost flex items-center justify-between w-full p-2"
                style={{ borderRadius: 'var(--radius-sm)', textAlign: 'left', padding: '8px 12px' }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>{item.title}</div>
                  <div className="body-small text-muted" style={{ fontSize: '11px' }}>{item.subtitle}</div>
                </div>
                <kbd className="code-inline" style={{ fontSize: '11px' }}>{item.badge}</kbd>
              </button>
            ))
          )}
        </div>
      </Modal>
    </BrahmaShell>
  );
}
