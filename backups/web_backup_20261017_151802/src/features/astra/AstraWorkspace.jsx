import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../services/api';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { PatchReview } from './PatchReview';
import { TerminalPanel } from './TerminalPanel';
import { AstraAssistant } from './AstraAssistant';
import {
  Code,
  GitPullRequest,
  Terminal,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';

const INITIAL_PROJECT_FILES = [
  {
    path: 'src/server.js',
    content: `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health/live', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`ASTRA API Server active on port \${PORT}\`);
});
`,
    dirty: false
  },
  {
    path: 'src/controllers/auth.controller.js',
    content: `class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      // Authenticates user and issues signed JWT
      res.json({ success: true, message: 'Authenticated' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
`,
    dirty: false
  },
  {
    path: 'src/routes/api.js',
    content: `const express = require('express');
const router = express.Router();

router.get('/v1/status', (req, res) => {
  res.json({ service: 'astra-engine', execution_mode: 'disabled' });
});

module.exports = router;
`,
    dirty: false
  },
  {
    path: 'package.json',
    content: `{
  "name": "@brahma-astra/core-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node src/server.js",
    "test": "node --test tests/*.test.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.1",
    "helmet": "^8.0.0"
  }
}
`,
    dirty: false
  },
  {
    path: 'README.md',
    content: `# ASTRA Coding Studio Workspace

This workspace is managed by ASTRA.
- Architecture: Zero-Docker Native Windows
- Sandboxing: Execution mode disabled without verified sandbox
- Diff Planning: Real AST Patch Proposals via ASTRA Engine
`,
    dirty: false
  }
];

export function AstraWorkspace() {
  const { navigate } = useNavigation();

  // Projects & Workspace state
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [codingTasks, setCodingTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // File explorer & Editor state
  const [files, setFiles] = useState(INITIAL_PROJECT_FILES);
  const [openTabs, setOpenTabs] = useState([INITIAL_PROJECT_FILES[0]]);
  const [activeTabPath, setActiveTabPath] = useState(INITIAL_PROJECT_FILES[0].path);

  // Layout UI state
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('assistant'); // 'assistant' | 'review'
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load project list and create/fetch workspace on mount
  useEffect(() => {
    async function initWorkspace() {
      try {
        const projList = await api.listProjects();
        const pArray = Array.isArray(projList) ? projList : [];
        setProjects(pArray);

        if (pArray.length > 0) {
          const firstProj = pArray[0];
          setSelectedProjectId(firstProj.id);

          // Create or retrieve ASTRA workspace for this project
          try {
            const ws = await api.createAstraWorkspace({
              projectId: firstProj.id,
              name: `${firstProj.name} ASTRA Workspace`
            });
            setWorkspace(ws);
          } catch {
            // Workspace already exists or created
          }
        }
      } catch (err) {
        // Fallback to local workspace
      }
    }
    initWorkspace();
  }, []);

  // Open file in tabs
  const handleSelectFile = (file) => {
    if (!openTabs.some(t => t.path === file.path)) {
      setOpenTabs(prev => [...prev, file]);
    }
    setActiveTabPath(file.path);
  };

  // Close tab
  const handleCloseTab = (path) => {
    const remaining = openTabs.filter(t => t.path !== path);
    setOpenTabs(remaining);
    if (activeTabPath === path && remaining.length > 0) {
      setActiveTabPath(remaining[remaining.length - 1].path);
    }
  };

  // Update file content from editor
  const handleUpdateContent = (path, newContent) => {
    setOpenTabs(prev =>
      prev.map(t => (t.path === path ? { ...t, content: newContent, dirty: true } : t))
    );
    setFiles(prev =>
      prev.map(f => (f.path === path ? { ...f, content: newContent, dirty: true } : f))
    );
  };

  // Save file
  const handleSaveFile = (path) => {
    setOpenTabs(prev =>
      prev.map(t => (t.path === path ? { ...t, dirty: false } : t))
    );
    setFiles(prev =>
      prev.map(f => (f.path === path ? { ...f, dirty: false } : f))
    );
    setNotification(`File saved: ${path}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // New file in explorer
  const handleNewFile = (filename) => {
    const filePath = filename.includes('/') ? filename : `src/${filename}`;
    const newFile = {
      path: filePath,
      content: '// New file created in ASTRA workspace\n',
      dirty: true
    };
    setFiles(prev => [...prev, newFile]);
    handleSelectFile(newFile);
  };

  // Task created from assistant
  const handleTaskCreated = (task) => {
    setCodingTasks(prev => [task, ...prev]);
    setActiveTaskId(task.id);
  };

  // Approve patch proposal
  const handleApproveTask = async (taskId) => {
    setIsProcessingApproval(true);
    try {
      const res = await api.approveCodingTask(taskId);
      setCodingTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: 'approved' } : t))
      );
      setNotification('Patch proposal approved! Execution job dispatched.');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification(`Approval error: ${err.message}`);
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Reject / Cancel patch proposal
  const handleCancelTask = async (taskId) => {
    setIsProcessingApproval(true);
    try {
      await api.cancelCodingTask(taskId);
      setCodingTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
      );
      setNotification('Patch proposal rejected and cancelled.');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(`Cancellation error: ${err.message}`);
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const activeFile = files.find(f => f.path === activeTabPath);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--astra-bg)',
        color: 'var(--astra-text)',
        fontFamily: 'var(--font-ui)',
        overflow: 'hidden'
      }}
    >
      {/* ── Notification Banner ───────────────────────────────────────── */}
      {notification && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderBottom: '1px solid var(--astra-electric-blue)',
            color: 'var(--astra-electric-blue)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 100
          }}
        >
          <CheckCircle2 size={14} />
          <span>{notification}</span>
        </div>
      )}

      {/* ── IDE Main Multi-Pane Workspace ────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Pane: File Explorer */}
        <div
          style={{
            width: explorerCollapsed ? '0px' : '240px',
            minWidth: explorerCollapsed ? '0px' : '240px',
            transition: 'width var(--transition-normal)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <FileTree
            files={files}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onNewFile={handleNewFile}
          />
        </div>

        {/* Center Pane: Multi-Tab Code Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <CodeEditor
            openTabs={openTabs}
            activeTabPath={activeTabPath}
            onSelectTab={setActiveTabPath}
            onCloseTab={handleCloseTab}
            onUpdateContent={handleUpdateContent}
            onSaveFile={handleSaveFile}
          />
        </div>

        {/* Right Pane: Contextual Assistant & Patch Review */}
        <div
          style={{
            width: '380px',
            minWidth: '380px',
            backgroundColor: 'var(--astra-surface)',
            borderLeft: '1px solid var(--astra-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Right Pane Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--astra-panel)',
              borderBottom: '1px solid var(--astra-border)',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={() => setRightPanelTab('assistant')}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderBottom: rightPanelTab === 'assistant' ? '2px solid var(--astra-electric-blue)' : '2px solid transparent',
                backgroundColor: rightPanelTab === 'assistant' ? 'var(--astra-surface)' : 'transparent',
                color: rightPanelTab === 'assistant' ? 'var(--astra-electric-blue)' : 'var(--astra-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} />
              <span>AI Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => setRightPanelTab('review')}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderBottom: rightPanelTab === 'review' ? '2px solid var(--astra-violet)' : '2px solid transparent',
                backgroundColor: rightPanelTab === 'review' ? 'var(--astra-surface)' : 'transparent',
                color: rightPanelTab === 'review' ? 'var(--astra-violet)' : 'var(--astra-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <GitPullRequest size={14} />
              <span>
                Patch Review {codingTasks.length > 0 && `(${codingTasks.length})`}
              </span>
            </button>
          </div>

          {/* Right Tab Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightPanelTab === 'assistant' ? (
              <AstraAssistant
                workspaceId={workspace?.id || 'default-ws'}
                activeFile={activeFile}
                onTaskCreated={handleTaskCreated}
                onSwitchToPatchReview={(taskId) => {
                  setActiveTaskId(taskId);
                  setRightPanelTab('review');
                }}
              />
            ) : (
              <PatchReview
                codingTasks={codingTasks}
                activeTaskId={activeTaskId}
                onSelectTask={setActiveTaskId}
                onApproveTask={handleApproveTask}
                onCancelTask={handleCancelTask}
                isProcessing={isProcessingApproval}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Pane: Integrated Terminal & Logs ──────────────────── */}
      <TerminalPanel
        isCollapsed={terminalCollapsed}
        onToggleCollapse={() => setTerminalCollapsed(prev => !prev)}
      />
    </div>
  );
}
