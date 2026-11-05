import React, { useState, useEffect } from 'react';
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
import EdithShell from './EdithShell';
import ProjectExplorer from './components/ProjectExplorer';
import FileTree from './components/FileTree';
import CodeEditor from './components/CodeEditor';
import PatchReview from './components/PatchReview';
import EdithAssistant from './components/EdithAssistant';
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
import EdithSettingsPanel from './components/EdithSettingsPanel';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { EDITH_SAMPLE_PROJECTS } from '../../config/edith-sample-projects';
import { edithService } from '../../services/edith/edith-service';
import { edithFsService } from '../../services/edith/edith-fs-service';
import { useToast } from '../../components/feedback/Toast';

export default function EdithWorkspace({ onBackToFriday }) {
  const [projects, setProjects] = useState(EDITH_SAMPLE_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(EDITH_SAMPLE_PROJECTS[0].id);
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Editor Tabs & Files
  const [openFiles, setOpenFiles] = useState(activeProject.files.slice(0, 3));
  const [activeFilePath, setActiveFilePath] = useState(activeProject.files[0]?.path || '');
  const [dirtyFilePaths, setDirtyFilePaths] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedConfirmFile, setUnsavedConfirmFile] = useState(null);

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

  // Resizable panel dimensions (Calibrated for Large Typography)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('edith_sidebar_width');
    return saved ? parseInt(saved, 10) : 290;
  });
  const [assistantWidth, setAssistantWidth] = useState(() => {
    const saved = localStorage.getItem('edith_assistant_width');
    return saved ? parseInt(saved, 10) : 400;
  });
  const [dockHeight, setDockHeight] = useState(() => {
    const saved = localStorage.getItem('edith_dock_height');
    return saved ? parseInt(saved, 10) : 290;
  });

  // Resizing handlers
  const handleSidebarResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 220), 450);
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      localStorage.setItem('edith_sidebar_width', sidebarWidth.toString());
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAssistantResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = assistantWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.min(Math.max(startWidth + delta, 300), 520);
      setAssistantWidth(newWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      localStorage.setItem('edith_assistant_width', assistantWidth.toString());
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDockResizeStart = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = dockHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + delta, 160), 550);
      setDockHeight(newHeight);
      if (dockState === 'minimized') setDockState('standard');
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      localStorage.setItem('edith_dock_height', dockHeight.toString());
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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

  // Helper to flatten hierarchical tree into file list
  const flattenTreeNodes = (node, result = []) => {
    if (!node) return result;
    if (node.type === 'file') {
      result.push({
        path: node.path,
        name: node.name,
        size: node.size,
        extension: node.extension,
        updatedAt: node.updatedAt
      });
    } else if (Array.isArray(node.children)) {
      for (const child of node.children) {
        flattenTreeNodes(child, result);
      }
    }
    return result;
  };

  // Load live filesystem tree for active workspace
  const reloadWorkspaceTree = async (projId) => {
    if (!projId) return;
    try {
      const tree = await edithFsService.getFileTree(projId);
      if (tree) {
        const flat = flattenTreeNodes(tree);
        if (flat.length > 0) {
          setProjects((prev) =>
            prev.map((p) => (p.id === projId || p.projectId === projId ? { ...p, files: flat } : p))
          );
          return flat;
        }
      }
    } catch (err) {
      console.warn('Real filesystem tree lookup fallback:', err);
    }
    return null;
  };

  // Initialize workspaces on mount
  useEffect(() => {
    let mounted = true;
    async function initWorkspaceRoots() {
      try {
        const list = await edithFsService.getProjects();
        if (mounted && Array.isArray(list) && list.length > 0) {
          const remoteProjects = list.map((ws) => ({
            id: ws.projectId || ws.id,
            workspaceId: ws.id,
            name: ws.projectName || ws.name,
            rootPath: ws.rootPath,
            description: `Host Root: ${ws.rootPath}`,
            files: []
          }));
          setProjects(remoteProjects);
          setActiveProjectId(remoteProjects[0].id);
          const flat = await reloadWorkspaceTree(remoteProjects[0].id);
          if (flat && flat.length > 0 && mounted) {
            const preferred =
              flat.find((f) => /^(readme\.md|package\.json|src\/app|main\.)/i.test(f.name || f.path)) ||
              flat.find((f) => /\.(jsx?|tsx?|py|json|md|html|css)$/i.test(f.name || f.path)) ||
              flat[0];
            handleOpenFile(preferred);
          }
        } else {
          // Auto-register default workspace root for Friday-Edith
          try {
            const reg = await edithFsService.registerProject({
              name: 'Friday-Edith Workspace',
              rootPath: 'M:\\Friday-Edith'
            });
            if (mounted && reg) {
              const defaultProj = {
                id: reg.projectId || reg.id,
                workspaceId: reg.id,
                name: reg.projectName || reg.name,
                rootPath: reg.rootPath,
                description: `Host Root: ${reg.rootPath}`,
                files: []
              };
              setProjects([defaultProj]);
              setActiveProjectId(defaultProj.id);
              const flat = await reloadWorkspaceTree(defaultProj.id);
              if (flat && flat.length > 0 && mounted) {
                const preferred =
                  flat.find((f) => /^(readme\.md|package\.json|src\/app|main\.)/i.test(f.name || f.path)) ||
                  flat.find((f) => /\.(jsx?|tsx?|py|json|md|html|css)$/i.test(f.name || f.path)) ||
                  flat[0];
                handleOpenFile(preferred);
              }
            }
          } catch (autoErr) {
            console.warn('Auto-registering default root failed, using sample projects:', autoErr);
          }
        }
      } catch (err) {
        console.warn('Could not query real workspace projects:', err);
      }
    }

    initWorkspaceRoots();
    return () => { mounted = false; };
  }, []);

  // Project selection handler
  const handleSelectProject = async (projectId) => {
    setActiveProjectId(projectId);
    const flat = await reloadWorkspaceTree(projectId);
    const target = projects.find((p) => p.id === projectId);
    const availableFiles = (flat && flat.length > 0) ? flat : (target?.files || []);
    if (availableFiles.length > 0) {
      handleOpenFile(availableFiles[0]);
      setDirtyFilePaths(new Set());
    }
  };

  // Create new project
  const handleCreateProject = async (newProj) => {
    try {
      const reg = await edithFsService.registerProject({
        name: newProj.name,
        rootPath: newProj.rootPath || 'M:\\Friday-Edith'
      });
      const created = {
        id: reg.projectId || reg.id,
        name: reg.name,
        rootPath: reg.rootPath,
        description: `Host Root: ${reg.rootPath}`,
        files: []
      };
      setProjects((prev) => [created, ...prev]);
      handleSelectProject(created.id);
      addToast(`Registered workspace "${created.name}"`, 'success');
    } catch (err) {
      addToast(`Failed to register workspace: ${err.message}`, 'error');
    }
  };

  // Open / select a file tab with live disk read
  const handleOpenFile = async (file) => {
    const exists = openFiles.find((f) => f.path === file.path);
    if (!exists) {
      let fileWithContent = { ...file };
      if (fileWithContent.content === undefined) {
        try {
          const res = await edithFsService.readFile(activeProjectId, file.path);
          fileWithContent.content = res.content;
        } catch (err) {
          console.warn('Could not read real file from disk:', err);
          fileWithContent.content = file.content || `// File: ${file.name}\n`;
        }
      }
      setOpenFiles((prev) => [...prev, fileWithContent]);
    }
    setActiveFilePath(file.path);
  };

  // Force close a tab without prompt
  const forceCloseTab = (filePath) => {
    const remaining = openFiles.filter((f) => f.path !== filePath);
    setOpenFiles(remaining);
    setDirtyFilePaths((prev) => {
      const next = new Set(prev);
      next.delete(filePath);
      return next;
    });
    if (activeFilePath === filePath && remaining.length > 0) {
      setActiveFilePath(remaining[remaining.length - 1].path);
    }
  };

  // Close tab with dirty check
  const handleCloseTab = (filePath) => {
    if (dirtyFilePaths.has(filePath)) {
      const target = openFiles.find((f) => f.path === filePath) || {
        path: filePath,
        name: filePath.split('/').pop() || filePath
      };
      setUnsavedConfirmFile(target);
      return;
    }
    forceCloseTab(filePath);
  };

  // Close all tabs
  const handleCloseAllTabs = () => {
    const dirty = openFiles.filter((f) => dirtyFilePaths.has(f.path));
    if (dirty.length > 0) {
      setUnsavedConfirmFile(dirty[0]);
      return;
    }
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

  // Save active file persistently to host disk
  const handleSaveFile = async (filePath) => {
    const target = openFiles.find((f) => f.path === filePath);
    if (!target) return;

    setIsSaving(true);
    try {
      await edithFsService.writeFile(activeProjectId, filePath, target.content || '');
      setDirtyFilePaths((prev) => {
        const next = new Set(prev);
        next.delete(filePath);
        return next;
      });
      addToast(`Saved "${target.name || filePath}" to disk`, 'success');
    } catch (err) {
      addToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Run active file in sandboxed terminal
  const handleRunFile = (file) => {
    setDockPanel('terminal');
    addToast(`Dispatching "${file.name}" to EDITH execution boundary...`, 'info');
  };

  // Add new file or folder to active project
  const handleAddFile = async (itemName, type = 'file') => {
    const cleanName = itemName.replace(/^\/+/, '');
    try {
      await edithFsService.createItem(activeProjectId, cleanName, type);
      addToast(`Created ${type} "${cleanName}"`, 'success');
      await reloadWorkspaceTree(activeProjectId);
      if (type !== 'directory') {
        handleOpenFile({ path: cleanName, name: cleanName.split('/').pop() || cleanName });
      }
    } catch (err) {
      addToast(`Create failed: ${err.message}`, 'error');
    }
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
      path: `${orig.path || ''}-copy`,
      files: (orig.files || []).map((f) => ({ ...f }))
    };
    setProjects((prev) => [duplicated, ...prev]);
    handleSelectProject(duplicated.id);
    addToast(`Duplicated "${orig.name}"`, 'success');
  };

  // Delete file from active project
  const handleDeleteFile = async (filePath) => {
    try {
      await edithFsService.deleteItem(activeProjectId, filePath);
      forceCloseTab(filePath);
      addToast(`Deleted "${filePath}"`, 'info');
      await reloadWorkspaceTree(activeProjectId);
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Rename file in active project
  const handleRenameFile = async (oldPath, newPath) => {
    if (!newPath || oldPath === newPath) return;
    const cleanNew = newPath.replace(/^\/+/, '');
    try {
      await edithFsService.renameItem(activeProjectId, oldPath, cleanNew);
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
      await reloadWorkspaceTree(activeProjectId);
    } catch (err) {
      addToast(`Rename failed: ${err.message}`, 'error');
    }
  };

  // Submit coding task to EDITH Assistant & backend
  const handleGenerateTask = async ({ instruction, taskType, targetFile }) => {
    setIsGenerating(true);
    addToast('EDITH Assistant analyzing task...', 'info');

    try {
      const created = await edithService.createCodingTask(
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
          const polled = await edithService.getCodingTask(created.id);
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
        await edithService.approveCodingTask(activeTask.id);
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
        await edithService.cancelCodingTask(activeTask.id);
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
        return <DatabasePanel projectId={activeProjectId} activeProject={activeProject} />;
      case 'git':
        return <GitPanel projectId={activeProjectId} activeProject={activeProject} />;
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
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="p-4 h-full"><TerminalPanel /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'database') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><DatabasePanel projectId={activeProjectId} activeProject={activeProject} /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'deploy') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><DeployPanel /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'testing') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><TestRunnerPanel /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'history') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><TaskHistoryPanel tasks={taskHistory} onRestoreTask={(t) => setActiveTask(t)} /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'git') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><GitPanel projectId={activeProjectId} activeProject={activeProject} /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'api_client') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><ApiClientPanel /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'debug') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><DebugPanel /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'pipelines') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><PipelinesPanel /></div>
      </EdithShell>
    );
  }

  if (activeNav === 'assistant') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2">
          <EdithAssistant
            activeFile={activeFile}
            activeProject={activeProject}
            onGenerateTask={handleGenerateTask}
            isGenerating={isGenerating}
            activeTask={activeTask}
          />
        </div>
      </EdithShell>
    );
  }

  if (activeNav === 'settings') {
    return (
      <EdithShell activeNav={activeNav} onSelectNav={setActiveNav} activeProject={activeProject} activeFile={activeFile} onBackToFriday={onBackToFriday}>
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-2"><EdithSettingsPanel /></div>
      </EdithShell>
    );
  }

  // Full IDE Multi-Pane Workspace
  return (
    <EdithShell
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      activeProject={activeProject}
      activeFile={activeFile}
      onBackToFriday={onBackToFriday}
      isZenMode={isZenMode}
      onToggleZenMode={() => setIsZenMode((p) => !p)}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
      isAssistantOpen={isAssistantOpen}
      onToggleAssistant={() => setIsAssistantOpen((p) => !p)}
    >
      <div
        className="flex h-full w-full"
        style={{
          padding: 0,
          margin: 0,
          gap: '0px',
          overflow: 'hidden',
          minHeight: 0,
          minWidth: 0,
          flex: 1,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Left Secondary Rail (Projects + File Tree) - hidden in Zen Mode or when collapsed */}
        {!isZenMode && isSidebarOpen && (
          <div
            className="flex flex-col"
            style={{
              width: `${sidebarWidth}px`,
              height: '100%',
              borderRadius: 0,
              background: '#0A101E',
              borderRight: '1px solid rgba(56, 189, 248, 0.18)',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: 0,
              transition: 'none'
            }}
          >
            {/* Sub-tab Switcher: Projects vs File Explorer + Collapse button */}
            <div
              className="flex items-center"
              style={{
                height: '42px',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(11, 15, 26, 0.7)'
              }}
            >
              <button
                onClick={() => setActiveNav('workspace')}
                className="glass-btn-ghost flex-1 py-2 flex items-center justify-center gap-2"
                style={{
                  fontSize: '15.5px',
                  fontWeight: 600,
                  color: activeNav === 'workspace' ? '#00D2FF' : 'var(--text-muted)',
                  borderBottom: activeNav === 'workspace' ? '2px solid #00D2FF' : 'none',
                  background: activeNav === 'workspace' ? 'rgba(0, 210, 255, 0.08)' : 'transparent'
                }}
              >
                Files
              </button>
              <button
                onClick={() => setActiveNav('projects_rail')}
                className="glass-btn-ghost flex-1 py-2 flex items-center justify-center gap-2"
                style={{
                  fontSize: '15.5px',
                  fontWeight: 600,
                  color: activeNav === 'projects_rail' ? '#00D2FF' : 'var(--text-muted)',
                  borderBottom: activeNav === 'projects_rail' ? '2px solid #00D2FF' : 'none',
                  background: activeNav === 'projects_rail' ? 'rgba(0, 210, 255, 0.08)' : 'transparent'
                }}
              >
                Projects
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white px-2.5"
                style={{ height: '100%', borderLeft: '1px solid rgba(255, 255, 255, 0.05)' }}
                title="Collapse Explorer (Ctrl+E)"
              >
                <ChevronLeft size={16} />
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

        {/* Left Rail Resizer */}
        {!isZenMode && isSidebarOpen && (
          <div
            className="edith-resizer-h"
            onMouseDown={handleSidebarResizeStart}
            onDoubleClick={() => setSidebarWidth(290)}
            title="Drag to resize explorer (Double-click to reset)"
          />
        )}

        {/* Center Main Work Area (Editor + Patch Review + Bottom Docks) */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0, minWidth: 0 }}>
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
                isSaving={isSaving}
              />
            )}
          </div>

          {/* Bottom Dock Resizer */}
          {dockState !== 'minimized' && (
            <div
              className="edith-resizer-v"
              onMouseDown={handleDockResizeStart}
              onDoubleClick={() => setDockHeight(290)}
              title="Drag to resize dock (Double-click to reset)"
            />
          )}

          {/* Bottom Half: Unified Single-Tier Dock Panels (Reclaims 38px vertical height) */}
          <div
            className="flex flex-col"
            style={{
              width: '100%',
              height:
                dockState === 'minimized'
                  ? '38px'
                  : dockState === 'maximized'
                    ? '60vh'
                    : `${dockHeight}px`,
              borderRadius: 0,
              background: '#060A14',
              borderTop: '1px solid rgba(56, 189, 248, 0.18)',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: 0,
              transition: 'none'
            }}
          >
            {/* Unified Single Dock Switcher & Diagnostics Tab Bar (15px Tabs) */}
            <div
              className="flex items-center justify-between px-3 overflow-x-auto"
              style={{
                height: '42px',
                background: 'rgba(7, 10, 24, 0.75)',
                borderBottom: dockState === 'minimized' ? 'none' : '1px solid var(--glass-border)',
                flexShrink: 0
              }}
            >
              {/* Left: Unified Diagnostic & Tool Tabs */}
              <div className="flex items-center gap-1.5">
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
                      className="glass-btn-ghost flex items-center gap-2"
                      style={{
                        padding: '6px 14px',
                        fontSize: '15px',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: '6px',
                        color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                        background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)' : 'transparent',
                        border: isActive ? '1px solid rgba(56, 189, 248, 0.55)' : '1px solid transparent',
                        boxShadow: isActive ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none'
                      }}
                    >
                      <Icon size={15} color={isActive ? '#00D2FF' : 'currentColor'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Subtle Group Divider */}
                <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 6px' }} />

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
                      className="glass-btn-ghost flex items-center gap-2"
                      style={{
                        padding: '6px 14px',
                        fontSize: '15px',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: '6px',
                        color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                        background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)' : 'transparent',
                        border: isActive ? '1px solid rgba(56, 189, 248, 0.55)' : '1px solid transparent',
                        boxShadow: isActive ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none'
                      }}
                    >
                      <Icon size={15} color={isActive ? '#00D2FF' : 'currentColor'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Security Badge & Window Expand/Minimize Controls */}
              <div className="flex items-center gap-2.5">
                <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  Execution: Disabled (Safe Boundary)
                </Badge>

                {/* Minimize / Expand Toggle */}
                <button
                  onClick={() => setDockState((prev) => (prev === 'minimized' ? 'standard' : 'minimized'))}
                  className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
                  style={{ width: '28px', height: '28px', borderRadius: '5px' }}
                  title={dockState === 'minimized' ? 'Expand Dock (Ctrl+`)' : 'Minimize Dock (Ctrl+`)'}
                >
                  {dockState === 'minimized' ? <ChevronUp size={15} /> : <Minus size={15} />}
                </button>

                {/* Maximize / Restore Toggle */}
                <button
                  onClick={() => setDockState((prev) => (prev === 'maximized' ? 'standard' : 'maximized'))}
                  className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
                  style={{ width: '28px', height: '28px', borderRadius: '5px' }}
                  title={dockState === 'maximized' ? 'Restore Dock Height' : 'Maximize Dock'}
                >
                  {dockState === 'maximized' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
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

        {/* Right Assistant Resizer */}
        {!isZenMode && isAssistantOpen && (
          <div
            className="edith-resizer-h"
            onMouseDown={handleAssistantResizeStart}
            onDoubleClick={() => setAssistantWidth(400)}
            title="Drag to resize assistant (Double-click to reset)"
          />
        )}

        {/* Right Side Pane: Assistant AI Panel - hidden in Zen Mode or when collapsed */}
        {!isZenMode && isAssistantOpen && (
          <div
            className="flex flex-col"
            style={{
              width: `${assistantWidth}px`,
              height: '100%',
              borderRadius: 0,
              background: '#0A1020',
              borderLeft: '1px solid rgba(56, 189, 248, 0.18)',
              flexShrink: 0,
              overflow: 'hidden',
              minHeight: 0,
              transition: 'none'
            }}
          >
            <EdithAssistant
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

      {/* Unsaved Changes Confirmation Modal */}
      <Modal
        isOpen={Boolean(unsavedConfirmFile)}
        onClose={() => setUnsavedConfirmFile(null)}
        title="Unsaved Changes"
        maxWidth="440px"
      >
        <div className="flex flex-col gap-4">
          <p className="body-medium" style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
            File <strong>"{unsavedConfirmFile?.name || unsavedConfirmFile?.path}"</strong> has unsaved changes. Do you want to save before closing or discard them?
          </p>
          <div className="flex justify-end gap-2.5" style={{ marginTop: '8px' }}>
            <Button variant="ghost" size="small" onClick={() => setUnsavedConfirmFile(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => {
                if (unsavedConfirmFile) {
                  forceCloseTab(unsavedConfirmFile.path);
                  setUnsavedConfirmFile(null);
                }
              }}
            >
              Discard Changes
            </Button>
            <Button
              variant="cyan"
              size="small"
              onClick={async () => {
                if (unsavedConfirmFile) {
                  await handleSaveFile(unsavedConfirmFile.path);
                  forceCloseTab(unsavedConfirmFile.path);
                  setUnsavedConfirmFile(null);
                }
              }}
            >
              Save & Close
            </Button>
          </div>
        </div>
      </Modal>
    </EdithShell>
  );
}
