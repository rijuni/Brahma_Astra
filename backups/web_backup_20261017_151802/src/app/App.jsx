import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { BrahmaShell } from '../components/layout/BrahmaShell';
import { AstraShell } from '../components/layout/AstraShell';
import { AuthPage } from '../features/auth/AuthPage';
import { HomeDashboard } from '../features/home/HomeDashboard';
import { ChatWorkspace } from '../features/chat/ChatWorkspace';
import { ResearchWorkspace } from '../features/research/ResearchWorkspace';
import { DocumentsWorkspace } from '../features/documents/DocumentsWorkspace';
import { ImagesWorkspace } from '../features/images/ImagesWorkspace';
import { ProjectsWorkspace } from '../features/projects/ProjectsWorkspace';
import { MemoryWorkspace } from '../features/memory/MemoryWorkspace';
import { AgentsWorkspace } from '../features/agents/AgentsWorkspace';
import { SettingsWorkspace } from '../features/settings/SettingsWorkspace';
import { AstraLauncher } from '../features/astra/AstraLauncher';
import { AstraWorkspace } from '../features/astra/AstraWorkspace';

export function App() {
  const { currentRoute, navigate, isAstra } = useNavigation();
  const { user } = useAuth();

  // Authentication Routes (Fullscreen Cosmic Auth Experience)
  if (currentRoute === 'login') {
    return <AuthPage initialMode="login" />;
  }

  if (currentRoute === 'signup' || currentRoute === 'register') {
    return <AuthPage initialMode="signup" />;
  }

  // ASTRA Dedicated Coding Workspace Shell (Target of ASTRA Launcher)
  if (isAstra) {
    return (
      <AstraShell>
        <AstraWorkspace />
      </AstraShell>
    );
  }

  // Route Content Renderer within BRAHMA Persistent Shell
  function renderScreenContent() {
    switch (currentRoute) {
      case 'home':
        return <HomeDashboard />;
      case 'chat':
        return <ChatWorkspace />;
      case 'research':
        return <ResearchWorkspace />;
      case 'documents':
        return <DocumentsWorkspace />;
      case 'images':
        return <ImagesWorkspace />;
      case 'projects':
        return <ProjectsWorkspace />;
      case 'memory':
        return <MemoryWorkspace />;
      case 'agents':
        return <AgentsWorkspace />;
      case 'settings':
        return <SettingsWorkspace />;
      case 'astra-launcher':
        return <AstraLauncher />;
      default:
        return <HomeDashboard />;
    }
  }

  return (
    <BrahmaShell>
      {renderScreenContent()}
    </BrahmaShell>
  );
}
