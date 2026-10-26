import React, { useState } from 'react';
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

  // Bottom dock active panel
  const [dockPanel, setDockPanel] = useState('terminal');

  // AI Task & Patch state
  const [activeTask, setActiveTask] = useState(null);
  const [patchProposal, setPatchProposal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingPatch, setIsApplyingPatch] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [isZenMode, setIsZenMode] = useState(false);
  const { addToast } = useToast();

  // Ctrl+B shortcut to toggle Zen Mode
  React.useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
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
        return <TerminalPanel />;
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
        return <TerminalPanel />;
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
    >
      <div
        className="flex h-full"
        style={{
          padding: 'var(--astra-canvas-padding, 12px)',
          gap: 'var(--astra-canvas-gap, 12px)',
          overflow: 'hidden',
          minHeight: 0,
          flex: 1
        }}
      >
        {/* Left Secondary Rail (Projects + File Tree) - hidden in Zen Mode */}
        {!isZenMode && (
          <div
            className="glass-panel flex flex-col"
            style={{
              width: 'var(--astra-sidebar-width, 290px)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: 0
            }}
          >
          {/* Sub-tab Switcher: Projects vs File Explorer */}
          <div className="flex" style={{ height: '40px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(11, 15, 26, 0.5)' }}>
            <button
              onClick={() => setActiveNav('workspace')}
              className="glass-btn-ghost flex-1 py-2 body-small flex items-center justify-center gap-1.5"
              style={{
                fontSize: '12.5px',
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
              className="glass-btn-ghost flex-1 py-2 body-small flex items-center justify-center gap-1.5"
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: activeNav === 'projects_rail' ? 'var(--brand-gold)' : 'var(--text-muted)',
                borderBottom: activeNav === 'projects_rail' ? '2px solid var(--brand-gold)' : 'none',
                background: activeNav === 'projects_rail' ? 'rgba(246, 200, 122, 0.05)' : 'transparent'
              }}
            >
              Projects
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
              />
            )}
          </div>
        </div>
      )}

      {/* Center Main Work Area (Editor + Patch Review + Bottom Docks) */}
        <div className="flex flex-col flex-1 gap-3 overflow-hidden" style={{ minHeight: 0, minWidth: 0 }}>
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

          {/* Bottom Half: Tabbed Dock Panels (Terminal, Tests, Debug, Deploy, Database, Git, API) */}
          <div
            className="glass-panel flex flex-col"
            style={{
              height: 'var(--astra-dock-height, 260px)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: 0
            }}
          >
            {/* Dock Switcher Tab Bar */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto"
              style={{
                background: 'rgba(11, 15, 26, 0.7)',
                borderBottom: '1px solid var(--glass-border)',
                flexShrink: 0
              }}
            >
              {[
                { id: 'terminal', label: 'Terminal' },
                { id: 'testing', label: 'Testing' },
                { id: 'debug', label: 'Run & Debug' },
                { id: 'deploy', label: 'Deployment' },
                { id: 'database', label: 'Database' },
                { id: 'git', label: 'Git' },
                { id: 'api_client', label: 'API Client' },
                { id: 'summary', label: 'Project Summary' }
              ].map((dock) => (
                <button
                  key={dock.id}
                  onClick={() => setDockPanel(dock.id)}
                  className="glass-btn-ghost body-small"
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    color: dockPanel === dock.id ? 'var(--brand-gold)' : 'var(--text-secondary)',
                    background: dockPanel === dock.id ? 'rgba(139, 92, 246, 0.22)' : 'transparent',
                    border: dockPanel === dock.id ? '1px solid var(--glass-border-violet)' : '1px solid transparent'
                  }}
                >
                  {dock.label}
                </button>
              ))}
            </div>

            {/* Dock Panel Body */}
            <div className="flex-1 overflow-hidden p-2">
              {renderBottomDock()}
            </div>
          </div>
        </div>

        {/* Right Side Pane: Astra Assistant AI Panel - hidden in Zen Mode */}
        {!isZenMode && (
          <div
            style={{
              width: 'var(--astra-assistant-width, 360px)',
              flexShrink: 0,
              overflow: 'hidden',
              minHeight: 0
            }}
          >
            <AstraAssistant
              activeFile={activeFile}
              activeProject={activeProject}
              onGenerateTask={handleGenerateTask}
              isGenerating={isGenerating}
              activeTask={activeTask}
            />
          </div>
        )}
      </div>
    </AstraShell>
  );
}
