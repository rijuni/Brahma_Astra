import React, { useState } from 'react';
import {
  Terminal,
  AlertTriangle,
  Bug,
  CheckCircle2,
  GitBranch,
  Database,
  Globe,
  Rocket,
  Layers,
  BarChart3,
  Minimize2,
  Maximize2,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Bot,
  FolderTree
} from 'lucide-react';
import AstraShell from './AstraShell';
import ProjectExplorer from './components/ProjectExplorer';
import FileTree from './components/FileTree';
import CodeEditor from './components/CodeEditor';
import PatchReview from './components/PatchReview';
import AstraAssistant from './components/AstraAssistant';
import TerminalPanel from './components/TerminalPanel';
import TestRunnerPanel from './components/TestRunnerPanel';
import DebugPanel from './components/DebugPanel';
import GitPanel from './components/GitPanel';
import ApiClientPanel from './components/ApiClientPanel';
import DatabasePanel from './components/DatabasePanel';
import DeployPanel from './components/DeployPanel';
import PipelinesPanel from './components/PipelinesPanel';
import ProjectSummaryPanel from './components/ProjectSummaryPanel';
import TaskHistoryPanel from './components/TaskHistoryPanel';
import AstraSettingsPanel from './components/AstraSettingsPanel';
import Badge from '../../components/common/Badge';
import { ASTRA_SAMPLE_PROJECTS } from '../../config/astra-sample-projects';
import { astraService } from '../../services/astra/astra-service';
import { useToast } from '../../components/feedback/Toast';

export default function AstraWorkspace({ onBackToBrahma }) {
  const [projects, setProjects] = useState(ASTRA_SAMPLE_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(ASTRA_SAMPLE_PROJECTS[0].id);
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Editor Tabs & Files
  const [openFiles, setOpenFiles] = useState(activeProject.files.slice(0, 3));
  const [activeFilePath, setActiveFilePath] = useState(activeProject.files[0]?.path || '');
  const [dirtyFilePaths, setDirtyFilePaths] = useState(new Set());

  // Active navigation view on activity bar
  const [activeNav, setActiveNav] = useState('workspace');

  // Bottom dock active panel & subtab
  const [dockPanel, setDockPanel] = useState('terminal');
  const [terminalSubTab, setTerminalSubTab] = useState('terminal'); // 'terminal' | 'problems' | 'output' | 'debug_console'
  const [dockState, setDockState] = useState('standard'); // 'minimized' | 'standard' | 'maximized'

  // Panel collapsibility states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  // AI Task & Patch state
  const [activeTask, setActiveTask] = useState(null);
  const [patchProposal, setPatchProposal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingPatch, setIsApplyingPatch] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [isZenMode, setIsZenMode] = useState(false);
  const { addToast } = useToast();

  // Keyboard shortcuts: Ctrl+B (Zen), Ctrl+E (Explorer), Ctrl+J (Assistant), Ctrl+` (Dock)
  React.useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsAssistantOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setDockState((prev) => (prev === 'minimized' ? 'standard' : 'minimized'));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeFile = openFiles.find((f) => f.path === activeFilePath) || openFiles[0];

  // Project selection handler
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    const target = projects.find((p) => p.id === projectId);
    if (target && target.files.length > 0) {
      setOpenFiles(target.files.slice(0, 3));
      setActiveFilePath(target.files[0].path);
      setDirtyFilePaths(new Set());
    }
  };

  // Create new project
  const handleCreateProject = (newProj) => {
    const created = {
      id: `p-${Date.now()}`,
      name: newProj.name,
      description: newProj.description,
      path: `/projects/${newProj.name.toLowerCase().replace(/\\s+/g, '-')}`,
      techStack: ['Python', 'FastAPI', 'React'],
      status: 'active',
      stats: { files: 1, commits: 1, lastUpdated: 'Just now' },
      files: [
        {
          path: 'app.py',
          name: 'app.py',
          language: 'python',
          content: `# ${newProj.name}\\nprint("Initialized ASTRA project")\\n`
        }
      ]
    };
    setProjects((prev) => [created, ...prev]);
    handleSelectProject(created.id);
  };

  // Open / select a file tab
  const handleOpenFile = (file) => {
    const exists = openFiles.find((f) => f.path === file.path);
    if (!exists) {
      setOpenFiles((prev) => [...prev, file]);
    }
    setActiveFilePath(file.path);
  };

  // Close tab
  const handleCloseTab = (filePath) => {
    const remaining = openFiles.filter((f) => f.path !== filePath);
    setOpenFiles(remaining);
    if (activeFilePath === filePath && remaining.length > 0) {
      setActiveFilePath(remaining[remaining.length - 1].path);
    }
  };

  // Close all tabs
  const handleCloseAllTabs = () => {
    setOpenFiles([]);
    setActiveFilePath('');
  };

  // Close other tabs
  const handleCloseOtherTabs = (filePath) => {
    const keep = openFiles.filter((f) => f.path === filePath);
    setOpenFiles(keep);
    setActiveFilePath(filePath);
  };

  // Modify file content in memory
  const handleFileChange = (filePath, newContent) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.path === filePath ? { ...f, content: newContent } : f))
    );
    setDirtyFilePaths((prev) => new Set(prev).add(filePath));
  };

  // Save active file
  const handleSaveFile = (filePath) => {
    setDirtyFilePaths((prev) => {
      const next = new Set(prev);
      next.delete(filePath);
      return next;
    });
  };

  // Run active file in sandboxed terminal
  const handleRunFile = (file) => {
    setDockPanel('terminal');
    addToast(`Dispatching "${file.name}" to ASTRA execution boundary...`, 'info');
  };

  // Add new file to active project
  const handleAddFile = (fileName) => {
    const cleanName = fileName.replace(/^\/+/, '');
    const newFile = {
      path: cleanName,
      name: cleanName.split('/').pop() || cleanName,
      language: cleanName.split('.').pop() || 'plaintext',
      content: `// New file: ${cleanName}\n`
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, files: [newFile, ...p.files] } : p
      )
    );
    handleOpenFile(newFile);
  };

  // Delete project
  const handleDeleteProject = (projectId) => {
    if (projects.length <= 1) {
      addToast('Cannot delete the only project workspace', 'warning');
      return;
    }
    const target = projects.find((p) => p.id === projectId);
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    if (activeProjectId === projectId) {
      handleSelectProject(remaining[0].id);
    }
    addToast(`Deleted project "${target?.name || projectId}"`, 'info');
  };

  // Duplicate project
  const handleDuplicateProject = (projectId) => {
    const orig = projects.find((p) => p.id === projectId);
    if (!orig) return;
    const duplicated = {
      ...orig,
      id: `p-${Date.now()}`,
      name: `${orig.name} (Copy)`,
      path: `${orig.path}-copy`,
      stats: { ...orig.stats, lastUpdated: 'Just now' },
      files: (orig.files || []).map((f) => ({ ...f }))
    };
    setProjects((prev) => [duplicated, ...prev]);
    handleSelectProject(duplicated.id);
    addToast(`Duplicated "${orig.name}"`, 'success');
  };

  // Delete file from active project
  const handleDeleteFile = (filePath) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, files: p.files.filter((f) => f.path !== filePath) }
          : p
      )
    );
    handleCloseTab(filePath);
    addToast(`Deleted file "${filePath}"`, 'info');
  };

  // Rename file in active project
  const handleRenameFile = (oldPath, newPath) => {
    if (!newPath || oldPath === newPath) return;
    const cleanNew = newPath.replace(/^\/+/, '');
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              files: p.files.map((f) =>
                f.path === oldPath
                  ? { ...f, path: cleanNew, name: cleanNew.split('/').pop() || cleanNew }
                  : f
              )
            }
          : p
      )
    );
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.path === oldPath
          ? { ...f, path: cleanNew, name: cleanNew.split('/').pop() || cleanNew }
          : f
      )
    );
    if (activeFilePath === oldPath) {
      setActiveFilePath(cleanNew);
    }
    addToast(`Renamed to "${cleanNew}"`, 'success');
  };

  // Submit coding task to ASTRA Assistant & backend
  const handleGenerateTask = async ({ instruction, taskType, targetFile }) => {
    setIsGenerating(true);
    addToast('ASTRA Assistant analyzing task...', 'info');

    try {
      const created = await astraService.createCodingTask(
        activeProject.id,
        instruction,
        `Task: ${instruction.slice(0, 30)}`
      );

      setActiveTask(created);
      if (created.patchProposal) {
        setPatchProposal(created.patchProposal);
      } else {
        // Poll for patch proposal
        setTimeout(async () => {
          const polled = await astraService.getCodingTask(created.id);
          if (polled?.patchProposal) {
            setPatchProposal(polled.patchProposal);
          }
        }, 1000);
      }

      setTaskHistory((prev) => [
        {
          id: created.id,
          title: created.title,
          instruction: created.instruction,
          status: 'proposed',
          timestamp: 'Just now'
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve & apply patch
  const handleApprovePatch = async () => {
    setIsApplyingPatch(true);
    try {
      if (activeTask?.id) {
        await astraService.approveCodingTask(activeTask.id);
      }

      // If patch modifies active file, apply changes
      if (patchProposal?.files) {
        for (const f of patchProposal.files) {
          if (f.content && activeFile && f.file_path === activeFile.path) {
            handleFileChange(activeFile.path, activeFile.content + '\\n' + f.content);
          }
        }
      }

      addToast('Patch approved & applied successfully!', 'success');
      setPatchProposal(null);
      if (activeTask) setActiveTask((prev) => ({ ...prev, status: 'approved' }));
    } catch (err) {
      addToast(`Approval failed: ${err.message}`, 'error');
    } finally {
      setIsApplyingPatch(false);
    }
  };

  // Reject patch
  const handleRejectPatch = async () => {
    try {
      if (activeTask?.id) {
        await astraService.cancelCodingTask(activeTask.id);
      }
      addToast('Patch proposal rejected.', 'info');
      setPatchProposal(null);
      if (activeTask) setActiveTask((prev) => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Render bottom dock panel based on active dockTab
  const renderBottomDock = () => {
    switch (dockPanel) {
      case 'terminal':
        return (
          <TerminalPanel
            hideHeader={true}
            activeTab={terminalSubTab}
            onSelectTab={setTerminalSubTab}
          />
        );
      case 'debug':
        return <DebugPanel />;
      case 'testing':
        return <TestRunnerPanel />;
      case 'deploy':
        return <DeployPanel />;
      case 'pipelines':
        return <PipelinesPanel />;
      case 'database':
        return <DatabasePanel />;
      case 'git':
        return <GitPanel />;
      case 'api_client':
        return <ApiClientPanel />;
      case 'summary':
        return <ProjectSummaryPanel project={activeProject} />;
      default:
        return (
          <TerminalPanel
            hideHeader={true}
            activeTab={terminalSubTab}
            onSelectTab={setTerminalSubTab}
          />
        );
    }
  };

  // Dedicated single-tool fullscreen views for specific activity bar items
  if (activeNav === 'terminal') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><TerminalPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'database') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><DatabasePanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'deploy') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><DeployPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'testing') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><TestRunnerPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'history') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><TaskHistoryPanel tasks={taskHistory} onRestoreTask={(t) => setActiveTask(t)} /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'git') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><GitPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'api_client') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><ApiClientPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'debug') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><DebugPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'pipelines') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><PipelinesPanel /></div>
      </AstraShell>
    );
  }

  if (activeNav === 'assistant') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <AstraAssistant
            activeFile={activeFile}
            activeProject={activeProject}
            onGenerateTask={handleGenerateTask}
            isGenerating={isGenerating}
            activeTask={activeTask}
          />
        </div>
      </AstraShell>
    );
  }

  if (activeNav === 'settings') {
    return (
      <AstraShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToBrahma={onBackToBrahma}>
        <div className="p-4 h-full"><AstraSettingsPanel /></div>
      </AstraShell>
    );
  }

  // Full IDE Multi-Pane Workspace
  return (
    <AstraShell
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      activeProject={activeProject}
      activeFile={activeFile}
      onBackToBrahma={onBackToBrahma}
      isZenMode={isZenMode}
      onToggleZenMode={() => setIsZenMode((p) => !p)}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
      isAssistantOpen={isAssistantOpen}
      onToggleAssistant={() => setIsAssistantOpen((p) => !p)}
    >
      <div
        className="flex h-full"
        style={{
          padding: 'var(--astra-canvas-padding, 10px)',
          gap: 'var(--astra-canvas-gap, 10px)',
          overflow: 'hidden',
          minHeight: 0,
          flex: 1
        }}
      >
        {/* Left Secondary Rail (Projects + File Tree) - hidden in Zen Mode or when collapsed */}
        {!isZenMode && isSidebarOpen && (
          <div
            className="astra-luminous-panel flex flex-col"
            style={{
              width: 'var(--astra-sidebar-width, 240px)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: 0,
              transition: 'width 0.2s ease'
            }}
          >
            {/* Sub-tab Switcher: Projects vs File Explorer + Collapse button */}
            <div
              className="flex items-center"
              style={{
                height: '38px',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(11, 15, 26, 0.7)'
              }}
            >
              <button
                onClick={() => setActiveNav('workspace')}
                className="glass-btn-ghost flex-1 py-1.5 body-small flex items-center justify-center gap-1.5"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: activeNav === 'workspace' ? 'var(--brand-gold)' : 'var(--text-muted)',
                  borderBottom: activeNav === 'workspace' ? '2px solid var(--brand-gold)' : 'none',
                  background: activeNav === 'workspace' ? 'rgba(246, 200, 122, 0.05)' : 'transparent'
                }}
              >
                Files
              </button>
              <button
                onClick={() => setActiveNav('projects_rail')}
                className="glass-btn-ghost flex-1 py-1.5 body-small flex items-center justify-center gap-1.5"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: activeNav === 'projects_rail' ? 'var(--brand-gold)' : 'var(--text-muted)',
                  borderBottom: activeNav === 'projects_rail' ? '2px solid var(--brand-gold)' : 'none',
                  background: activeNav === 'projects_rail' ? 'rgba(246, 200, 122, 0.05)' : 'transparent'
                }}
              >
                Projects
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white px-2"
                style={{ height: '100%', borderLeft: '1px solid rgba(255, 255, 255, 0.05)' }}
                title="Collapse Explorer (Ctrl+E)"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeNav === 'projects_rail' ? (
                <ProjectExplorer
                  projects={projects}
                  activeProjectId={activeProjectId}
                  onSelectProject={handleSelectProject}
                  onCreateProject={handleCreateProject}
                  onDeleteProject={handleDeleteProject}
                  onDuplicateProject={handleDuplicateProject}
                />
              ) : (
                <FileTree
                  files={activeProject.files}
                  activeFilePath={activeFilePath}
                  onSelectFile={handleOpenFile}
                  onAddFile={handleAddFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                  dirtyFilePaths={dirtyFilePaths}
                  onCollapse={() => setIsSidebarOpen(false)}
                />
              )}
            </div>
          </div>
        )}

        {/* Center Main Work Area (Editor + Patch Review + Bottom Docks) */}
        <div className="flex flex-col flex-1 gap-2.5 overflow-hidden" style={{ minHeight: 0, minWidth: 0 }}>
          {/* Top Half: Code Editor or Patch Review */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
            {patchProposal ? (
              <PatchReview
                patchProposal={patchProposal}
                onApprove={handleApprovePatch}
                onReject={handleRejectPatch}
                isApplying={isApplyingPatch}
              />
            ) : (
              <CodeEditor
                openFiles={openFiles}
                activeFile={activeFile}
                onSelectTab={handleOpenFile}
                onCloseTab={handleCloseTab}
                onCloseAllTabs={handleCloseAllTabs}
                onCloseOtherTabs={handleCloseOtherTabs}
                onFileChange={handleFileChange}
                onSaveFile={handleSaveFile}
                onRunFile={handleRunFile}
                dirtyFilePaths={dirtyFilePaths}
              />
            )}
          </div>

          {/* Bottom Half: Unified Single-Tier Dock Panels (Reclaims 38px vertical height) */}
          <div
            className="astra-luminous-panel flex flex-col"
            style={{
              height:
                dockState === 'minimized'
                  ? '38px'
                  : dockState === 'maximized'
                  ? '58vh'
                  : 'var(--astra-dock-height, 260px)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: 0,
              transition: 'height 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Unified Single Dock Switcher & Diagnostics Tab Bar */}
            <div
              className="flex items-center justify-between px-2.5 overflow-x-auto"
              style={{
                height: '38px',
                background: 'rgba(7, 10, 24, 0.75)',
                borderBottom: dockState === 'minimized' ? 'none' : '1px solid var(--glass-border)',
                flexShrink: 0
              }}
            >
              {/* Left: Unified Diagnostic & Tool Tabs */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'terminal', subId: 'terminal', label: 'Terminal', icon: Terminal },
                  { id: 'terminal', subId: 'problems', label: 'Problems (3)', icon: AlertTriangle },
                  { id: 'terminal', subId: 'output', label: 'Output', icon: Terminal },
                  { id: 'terminal', subId: 'debug_console', label: 'Debug Console', icon: Bug }
                ].map((item) => {
                  const isActive =
                    dockPanel === 'terminal' && terminalSubTab === item.subId && dockState !== 'minimized';
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.subId}
                      onClick={() => {
                        setDockPanel('terminal');
                        setTerminalSubTab(item.subId);
                        if (dockState === 'minimized') setDockState('standard');
                      }}
                      className="glass-btn-ghost flex items-center gap-1.5"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: '5px',
                        color: isActive ? 'var(--brand-gold)' : 'var(--text-muted)',
                        background: isActive ? 'rgba(139, 92, 246, 0.22)' : 'transparent',
                        border: isActive ? '1px solid var(--glass-border-violet)' : '1px solid transparent'
                      }}
                    >
                      <Icon size={12} color={isActive ? 'var(--brand-gold)' : 'currentColor'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Subtle Group Divider */}
                <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

                {[
                  { id: 'testing', label: 'Testing', icon: CheckCircle2 },
                  { id: 'git', label: 'Git', icon: GitBranch },
                  { id: 'database', label: 'Database', icon: Database },
                  { id: 'api_client', label: 'API Client', icon: Globe },
                  { id: 'deploy', label: 'Deploy', icon: Rocket },
                  { id: 'pipelines', label: 'Pipelines', icon: Layers },
                  { id: 'summary', label: 'Summary', icon: BarChart3 }
                ].map((item) => {
                  const isActive = dockPanel === item.id && dockState !== 'minimized';
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setDockPanel(item.id);
                        if (dockState === 'minimized') setDockState('standard');
                      }}
                      className="glass-btn-ghost flex items-center gap-1.5"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: '5px',
                        color: isActive ? 'var(--brand-gold)' : 'var(--text-muted)',
                        background: isActive ? 'rgba(139, 92, 246, 0.22)' : 'transparent',
                        border: isActive ? '1px solid var(--glass-border-violet)' : '1px solid transparent'
                      }}
                    >
                      <Icon size={12} color={isActive ? 'var(--brand-gold)' : 'currentColor'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Security Badge & Window Expand/Minimize Controls */}
              <div className="flex items-center gap-2">
                <Badge variant="cyan" style={{ padding: '3px 8px', fontSize: '10.5px' }}>
                  Execution: Disabled (Safe Boundary)
                </Badge>

                {/* Minimize / Expand Toggle */}
                <button
                  onClick={() => setDockState((prev) => (prev === 'minimized' ? 'standard' : 'minimized'))}
                  className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
                  style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                  title={dockState === 'minimized' ? 'Expand Dock (Ctrl+`)' : 'Minimize Dock (Ctrl+`)'}
                >
                  {dockState === 'minimized' ? <ChevronUp size={13} /> : <Minus size={13} />}
                </button>

                {/* Maximize / Restore Toggle */}
                <button
                  onClick={() => setDockState((prev) => (prev === 'maximized' ? 'standard' : 'maximized'))}
                  className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
                  style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                  title={dockState === 'maximized' ? 'Restore Dock Height' : 'Maximize Dock'}
                >
                  {dockState === 'maximized' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
            </div>

            {/* Dock Panel Body (Hidden when minimized for maximum editor space) */}
            {dockState !== 'minimized' && (
              <div className="flex-1 overflow-hidden p-2" style={{ minHeight: 0 }}>
                {renderBottomDock()}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Pane: Astra Assistant AI Panel - hidden in Zen Mode or when collapsed */}
        {!isZenMode && isAssistantOpen && (
          <div
            className="astra-luminous-panel flex flex-col"
            style={{
              width: 'var(--astra-assistant-width, 365px)',
              borderRadius: 'var(--radius-lg)',
              flexShrink: 0,
              overflow: 'hidden',
              minHeight: 0,
              transition: 'width 0.2s ease'
            }}
          >
            <AstraAssistant
              activeFile={activeFile}
              activeProject={activeProject}
              onGenerateTask={handleGenerateTask}
              isGenerating={isGenerating}
              activeTask={activeTask}
              onClose={() => setIsAssistantOpen(false)}
            />
          </div>
        )}
      </div>
    </AstraShell>
  );
}
