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
        return <HomeDashboard onNavigate={setCurrentRoute} />;
      case 'chat':
        return <ChatWorkspace />;
      case 'projects':
        return <ProjectsWorkspace onNavigate={setCurrentRoute} />;
      case 'files':
        return <FilesWorkspace />;
      case 'settings':
        return <SettingsWorkspace />;
      default:
        return <HomeDashboard onNavigate={setCurrentRoute} />;
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
          <span className="body-small text-muted">QUICK NAVIGATION</span>
          <button
            onClick={() => { setCurrentRoute('dashboard'); setIsSearchOpen(false); }}
            className="glass-btn-ghost flex items-center justify-between w-full p-2"
            style={{ borderRadius: 'var(--radius-sm)', textAlign: 'left', padding: '8px 12px' }}
          >
            <span>Home Dashboard</span>
            <kbd className="code-inline" style={{ fontSize: '11px' }}>Dashboard</kbd>
          </button>
          <button
            onClick={() => { setCurrentRoute('chat'); setIsSearchOpen(false); }}
            className="glass-btn-ghost flex items-center justify-between w-full p-2"
            style={{ borderRadius: 'var(--radius-sm)', textAlign: 'left', padding: '8px 12px' }}
          >
            <span>AI Conversations & Chat</span>
            <kbd className="code-inline" style={{ fontSize: '11px' }}>Chat</kbd>
          </button>
          <button
            onClick={() => { setCurrentRoute('projects'); setIsSearchOpen(false); }}
            className="glass-btn-ghost flex items-center justify-between w-full p-2"
            style={{ borderRadius: 'var(--radius-sm)', textAlign: 'left', padding: '8px 12px' }}
          >
            <span>Projects & Workflows</span>
            <kbd className="code-inline" style={{ fontSize: '11px' }}>Projects</kbd>
          </button>
          <button
            onClick={() => { setCurrentRoute('files'); setIsSearchOpen(false); }}
            className="glass-btn-ghost flex items-center justify-between w-full p-2"
            style={{ borderRadius: 'var(--radius-sm)', textAlign: 'left', padding: '8px 12px' }}
          >
            <span>Document & File Workspace</span>
            <kbd className="code-inline" style={{ fontSize: '11px' }}>Files</kbd>
          </button>
        </div>
      </Modal>
    </BrahmaShell>
  );
}
