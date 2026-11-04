import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  ArrowUp,
  ArrowDown,
  Plus,
  Check,
  History,
  FileCode,
  RotateCw,
  GitMerge,
  X
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { useToast } from '../../../components/feedback/Toast';

export default function GitPanel() {
  const [branches, setBranches] = useState(['main', 'feat/ast-analyzer', 'fix/runner-sandbox']);
  const [activeBranch, setActiveBranch] = useState('main');
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [stagedFiles, setStagedFiles] = useState(['src/app.py', 'config/settings.py']);
  const [unstagedFiles, setUnstagedFiles] = useState(['tests/test_api.py', 'README.md']);
  const [commitLog, setCommitLog] = useState([
    { hash: '7c8a1e2', msg: 'Implement AST patch generator and risk evaluator', author: 'EDITH Lead', time: '10 mins ago' },
    { hash: '9b3f0d4', msg: 'Add sandbox execution restrictions for safe commands', author: 'Security Officer', time: '1 hour ago' },
    { hash: '1a4e8b9', msg: 'Initialize EDITH multi-workspace repository structure', author: 'FRIDAY Core', time: 'Yesterday' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const { addToast } = useToast();

  const handleStage = (file) => {
    setUnstagedFiles((prev) => prev.filter((f) => f !== file));
    setStagedFiles((prev) => [...prev, file]);
  };

  const handleUnstage = (file) => {
    setStagedFiles((prev) => prev.filter((f) => f !== file));
    setUnstagedFiles((prev) => [...prev, file]);
  };

  const handleStageAll = () => {
    setStagedFiles((prev) => [...prev, ...unstagedFiles]);
    setUnstagedFiles([]);
  };

  const handleUnstageAll = () => {
    setUnstagedFiles((prev) => [...prev, ...stagedFiles]);
    setStagedFiles([]);
  };

  const handleCommit = (e) => {
    e.preventDefault();
    if (!commitMsg.trim() || stagedFiles.length === 0) return;

    const newCommit = {
      hash: Math.random().toString(16).substring(2, 9),
      msg: commitMsg.trim(),
      author: 'You (Developer)',
      time: 'Just now'
    };

    setCommitLog((prev) => [newCommit, ...prev]);
    addToast(`Committed [${newCommit.hash}]: "${newCommit.msg}"`, 'success');
    setCommitMsg('');
    setStagedFiles([]);
  };

  const handleCreateBranch = (e) => {
    e.preventDefault();
    if (!newBranchInput.trim()) return;
    const name = newBranchInput.trim().toLowerCase().replace(/\s+/g, '-');
    setBranches((prev) => [...prev, name]);
    setActiveBranch(name);
    addToast(`Switched to new branch "${name}"`, 'success');
    setNewBranchInput('');
    setIsNewBranchOpen(false);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Synced with origin/main (0 conflicts, up to date)', 'info');
    }, 700);
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Git Header */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <GitBranch size={18} color="#38BDF8" />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Branch:</span>
          <select
            value={activeBranch}
            onChange={(e) => {
              setActiveBranch(e.target.value);
              addToast(`Switched to branch "${e.target.value}"`, 'info');
            }}
            className="glass-input"
            style={{ height: '38px', padding: '0 12px', fontSize: '15px', borderRadius: '6px', color: '#00D2FF' }}
          >
            {branches.map((b) => (
              <option key={b} value={b} style={{ background: '#0B0F1A' }}>
                {b}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsNewBranchOpen(true)}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
            title="Create new branch"
          >
            <Plus size={16} color="#00D2FF" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>SIMULATED GIT ENGINE</Badge>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="glass-btn-ghost flex items-center gap-2"
            style={{ height: '34px', padding: '0 12px', fontSize: '14px', borderRadius: '6px' }}
            title="Toggle Commit Log"
          >
            <History size={15} color={showHistory ? '#00D2FF' : 'var(--text-muted)'} />
            <span>History</span>
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="glass-btn-ghost flex items-center gap-2"
            style={{ height: '34px', padding: '0 12px', fontSize: '14px', borderRadius: '6px' }}
            title="Fetch and sync upstream"
          >
            <RotateCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Commit Input Box */}
      <form onSubmit={handleCommit} className="mb-3">
        <div className="glass-input flex items-center gap-3 p-2 px-3" style={{ borderRadius: 'var(--radius-sm)' }}>
          <input
            type="text"
            placeholder={stagedFiles.length > 0 ? 'Commit message (e.g. feat: add route validation)...' : 'Stage changes below to enable commit...'}
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            disabled={stagedFiles.length === 0}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '15px', flex: 1, height: '38px' }}
          />
          <Button
            variant="cyan"
            type="submit"
            disabled={!commitMsg.trim() || stagedFiles.length === 0}
            style={{ height: '38px', padding: '0 18px', fontSize: '15px', fontWeight: 600 }}
          >
            Commit
          </Button>
        </div>
      </form>

      {/* Main Area: Staged/Unstaged or History Drawer */}
      <div className="flex-1 overflow-y-auto">
        {showHistory ? (
          <div className="flex flex-col gap-2">
            <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              RECENT COMMITS ({commitLog.length})
            </span>
            {commitLog.map((c) => (
              <div
                key={c.hash}
                className="flex items-center justify-between p-3 rounded"
                style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <GitCommit size={16} color="#00D2FF" />
                  <span className="code-inline" style={{ fontSize: '13.5px', color: '#38BDF8' }}>{c.hash}</span>
                  <span style={{ fontSize: '14.5px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.msg}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted" style={{ fontSize: '13px', flexShrink: 0 }}>
                  <span>{c.author}</span>
                  <span>•</span>
                  <span>{c.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Staged Changes */}
            <div className="flex flex-col gap-2 overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5">
                <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>
                  STAGED CHANGES ({stagedFiles.length})
                </span>
                {stagedFiles.length > 0 && (
                  <button onClick={handleUnstageAll} className="glass-btn-ghost text-muted hover:text-white" style={{ fontSize: '13px', padding: '2px 8px' }}>
                    Unstage All
                  </button>
                )}
              </div>
              {stagedFiles.length === 0 ? (
                <div className="text-muted p-4 text-center body-regular" style={{ fontSize: '14px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                  No staged changes
                </div>
              ) : (
                stagedFiles.map((file) => (
                  <div key={file} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '14.5px' }}>
                    <span style={{ color: '#6EE7B7' }}>{file}</span>
                    <button onClick={() => handleUnstage(file)} className="glass-btn-ghost text-muted hover:text-white" style={{ padding: '2px 8px', fontSize: '13px' }}>
                      Unstage
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Unstaged Changes */}
            <div className="flex flex-col gap-2 overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5">
                <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>
                  CHANGES ({unstagedFiles.length})
                </span>
                {unstagedFiles.length > 0 && (
                  <button onClick={handleStageAll} className="glass-btn-ghost text-muted hover:text-white" style={{ fontSize: '13px', padding: '2px 8px' }}>
                    Stage All
                  </button>
                )}
              </div>
              {unstagedFiles.length === 0 ? (
                <div className="text-muted p-4 text-center body-regular" style={{ fontSize: '14px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                  Working tree clean
                </div>
              ) : (
                unstagedFiles.map((file) => (
                  <div key={file} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', fontSize: '14.5px' }}>
                    <span className="text-secondary">{file}</span>
                    <button onClick={() => handleStage(file)} className="glass-btn-ghost text-muted hover:text-white" style={{ padding: '2px 8px', fontSize: '13px' }}>
                      Stage
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Branch Modal */}
      <Modal
        isOpen={isNewBranchOpen}
        onClose={() => setIsNewBranchOpen(false)}
        title="Create New Branch"
        maxWidth="380px"
      >
        <form onSubmit={handleCreateBranch} className="flex flex-col gap-3">
          <Input
            label="Branch Name"
            placeholder="e.g. feat/telemetry-exporter"
            value={newBranchInput}
            onChange={(e) => setNewBranchInput(e.target.value)}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="small" type="button" onClick={() => setIsNewBranchOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="small" type="submit">
              Create & Checkout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
