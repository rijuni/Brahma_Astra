import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { useToast } from '../../../components/feedback/Toast';
import { edithGitService } from '../../../services/edith/edith-git-service';

export default function GitPanel({ projectId = null, activeProject = null }) {
  const [branches, setBranches] = useState(['main']);
  const [activeBranch, setActiveBranch] = useState('main');
  const [trackingInfo, setTrackingInfo] = useState({ tracking: null, ahead: 0, behind: 0 });
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [unstagedFiles, setUnstagedFiles] = useState([]);
  const [untrackedFiles, setUntrackedFiles] = useState([]);
  const [commitLog, setCommitLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Commit Confirmation Modal State
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);

  // Diff Modal State
  const [diffModal, setDiffModal] = useState({
    isOpen: false,
    file: null,
    isStaged: false,
    diffText: '',
    loading: false
  });

  // Branch Switch Confirmation Modal State
  const [pendingBranch, setPendingBranch] = useState(null);

  const { addToast } = useToast();

  const effectiveProjectId = projectId || activeProject?.id || '';

  const loadGitState = useCallback(async (silent = false) => {
    if (!effectiveProjectId) return;
    if (!silent) setIsLoading(true);
    setErrorBanner(null);

    try {
      // 1. Load branches
      const branchRes = await edithGitService.getBranches(effectiveProjectId);
      if (branchRes?.branches) {
        setBranches(branchRes.branches);
        if (branchRes.current) setActiveBranch(branchRes.current);
      }

      // 2. Load status
      const statusRes = await edithGitService.getStatus(effectiveProjectId);
      if (statusRes) {
        if (statusRes.branch) setActiveBranch(statusRes.branch);
        setTrackingInfo({
          tracking: statusRes.tracking,
          ahead: statusRes.ahead || 0,
          behind: statusRes.behind || 0
        });
        setStagedFiles(statusRes.staged || []);
        setUnstagedFiles(statusRes.unstaged || []);
        setUntrackedFiles(statusRes.untracked || []);
      }

      // 3. Load commit log
      const logRes = await edithGitService.getLog(effectiveProjectId, 25);
      if (logRes?.commits) {
        setCommitLog(logRes.commits);
      }
    } catch (err) {
      console.warn('Failed to load Git status:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to inspect Git status';
      setErrorBanner(msg);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    loadGitState();
  }, [loadGitState]);

  if (!effectiveProjectId) {
    return (
      <div className="edith-db-empty-state" role="status">
        <GitBranch size={24} aria-hidden="true" />
        <div>
          <strong>Select a workspace</strong>
          <p>Connect a workspace to view its local Git repository.</p>
        </div>
      </div>
    );
  }

  const handleStage = async (fileObj) => {
    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
    try {
      await edithGitService.stage(effectiveProjectId, [filePath]);
      addToast(`Staged: ${filePath}`, 'success');
      loadGitState(true);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Stage failed', 'error');
    }
  };

  const handleUnstage = async (fileObj) => {
    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
    try {
      await edithGitService.unstage(effectiveProjectId, [filePath]);
      addToast(`Unstaged: ${filePath}`, 'info');
      loadGitState(true);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Unstage failed', 'error');
    }
  };

  const handleStageAll = async () => {
    try {
      await edithGitService.stage(effectiveProjectId, null, true);
      addToast('Staged all changes', 'success');
      loadGitState(true);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Stage all failed', 'error');
    }
  };

  const handleUnstageAll = async () => {
    try {
      await edithGitService.unstage(effectiveProjectId, null, true);
      addToast('Unstaged all changes', 'info');
      loadGitState(true);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Unstage all failed', 'error');
    }
  };

  const handleCommit = (e) => {
    e.preventDefault();
    if (!commitMsg.trim() || stagedFiles.length === 0) return;
    setIsCommitModalOpen(true);
  };

  const handleOpenCommitModal = handleCommit;

  const handleConfirmCommit = async () => {
    if (!commitMsg.trim() || stagedFiles.length === 0) return;

    try {
      const res = await edithGitService.commit(effectiveProjectId, commitMsg.trim(), true);
      const hash = res.commitHash ? res.commitHash.substring(0, 7) : 'HEAD';
      addToast(`Committed [${hash}]: "${commitMsg.trim()}"`, 'success');
      setCommitMsg('');
      setIsCommitModalOpen(false);
      loadGitState(true);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Commit failed', 'error');
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchInput.trim()) return;
    const name = newBranchInput.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      await edithGitService.createBranch(effectiveProjectId, name, true);
      addToast(`Created and checked out branch "${name}"`, 'success');
      setNewBranchInput('');
      setIsNewBranchOpen(false);
      loadGitState();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Create branch failed', 'error');
    }
  };

  const handleBranchSelectChange = (newBranch) => {
    if (newBranch === activeBranch) return;

    // Check if dirty
    const isDirty = stagedFiles.length > 0 || unstagedFiles.length > 0;
    if (isDirty) {
      setPendingBranch(newBranch);
    } else {
      executeCheckout(newBranch);
    }
  };

  const executeCheckout = async (targetBranch) => {
    try {
      await edithGitService.checkoutBranch(effectiveProjectId, targetBranch);
      addToast(`Switched to branch "${targetBranch}"`, 'success');
      setPendingBranch(null);
      loadGitState();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Checkout failed', 'error');
    }
  };

  const handleOpenDiff = async (fileObj, isStaged) => {
    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
    setDiffModal({
      isOpen: true,
      file: filePath,
      isStaged,
      diffText: '',
      loading: true
    });

    try {
      const res = await edithGitService.getDiff(effectiveProjectId, filePath, isStaged);
      setDiffModal((prev) => ({
        ...prev,
        diffText: res?.diff || '(No textual differences detected)',
        loading: false
      }));
    } catch (err) {
      setDiffModal((prev) => ({
        ...prev,
        diffText: `Failed to load diff: ${err.message}`,
        loading: false
      }));
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await loadGitState(true);
      addToast('Git status refreshed and synchronized with repository', 'info');
    } catch (err) {
      addToast('Failed to refresh Git status', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const allUnstaged = [
    ...unstagedFiles.map((f) => ({ ...f, isUntracked: false })),
    ...untrackedFiles.map((f) => ({ ...f, isUntracked: true }))
  ];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Git Header */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <GitBranch size={18} color="#38BDF8" />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Branch:</span>
          <select
            value={activeBranch}
            onChange={(e) => handleBranchSelectChange(e.target.value)}
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

          {trackingInfo.tracking && (
            <div className="flex items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
              <span>{trackingInfo.tracking}</span>
              {trackingInfo.ahead > 0 && (
                <span className="flex items-center text-cyan-400">
                  <ArrowUp size={13} /> {trackingInfo.ahead}
                </span>
              )}
              {trackingInfo.behind > 0 && (
                <span className="flex items-center text-amber-400">
                  <ArrowDown size={13} /> {trackingInfo.behind}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>REAL GIT ENGINE</Badge>
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
            disabled={isSyncing || isLoading}
            className="glass-btn-ghost flex items-center gap-2"
            style={{ height: '34px', padding: '0 12px', fontSize: '14px', borderRadius: '6px' }}
            title="Fetch and refresh status"
          >
            <RotateCw size={15} className={isSyncing || isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error / Alert Banner */}
      {errorBanner && (
        <div
          className="flex items-center gap-2 px-3 py-2 mb-3 rounded"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '14px' }}
        >
          <AlertCircle size={16} />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Commit Input Box */}
      <form onSubmit={handleCommit} className="mb-3">
        <div className="glass-input flex items-center gap-3 p-2 px-3" style={{ borderRadius: 'var(--radius-sm)' }}>
          <input
            type="text"
            placeholder={stagedFiles.length > 0 ? 'Commit message (e.g. feat: add AST route validation)...' : 'Stage changes below to enable commit...'}
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
            {commitLog.length === 0 ? (
              <div className="text-muted p-4 text-center body-regular" style={{ fontSize: '14px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                No commit history found in this repository
              </div>
            ) : (
              commitLog.map((c) => (
                <div
                  key={c.hash}
                  className="flex items-center justify-between p-3 rounded"
                  style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <GitCommit size={16} color="#00D2FF" />
                    <span className="code-inline" style={{ fontSize: '13.5px', color: '#38BDF8' }}>
                      {c.hash.substring(0, 7)}
                    </span>
                    <span style={{ fontSize: '14.5px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted" style={{ fontSize: '13px', flexShrink: 0 }}>
                    <span>{c.author}</span>
                    <span>•</span>
                    <span>{c.date ? new Date(c.date).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))
            )}
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
                stagedFiles.map((file) => {
                  const pathStr = typeof file === 'string' ? file : file.path;
                  const statusBadge = typeof file === 'object' && file.status ? file.status : 'M';
                  return (
                    <div
                      key={pathStr}
                      className="flex items-center justify-between px-3 py-2 rounded"
                      style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '14.5px' }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="code-inline" style={{ fontSize: '12px', padding: '1px 5px', background: 'rgba(16, 185, 129, 0.25)', color: '#6EE7B7' }}>
                          {statusBadge}
                        </span>
                        <span
                          onClick={() => handleOpenDiff(pathStr, true)}
                          className="hover:underline cursor-pointer"
                          style={{ color: '#6EE7B7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title="Click to view staged diff"
                        >
                          {pathStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDiff(pathStr, true)}
                          className="glass-btn-ghost text-muted hover:text-white"
                          style={{ padding: '2px 8px', fontSize: '13px' }}
                          title="View diff"
                        >
                          Diff
                        </button>
                        <button
                          onClick={() => handleUnstage(file)}
                          className="glass-btn-ghost text-muted hover:text-white"
                          style={{ padding: '2px 8px', fontSize: '13px' }}
                        >
                          Unstage
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Unstaged & Untracked Changes */}
            <div className="flex flex-col gap-2 overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5">
                <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>
                  CHANGES ({allUnstaged.length})
                </span>
                {allUnstaged.length > 0 && (
                  <button onClick={handleStageAll} className="glass-btn-ghost text-muted hover:text-white" style={{ fontSize: '13px', padding: '2px 8px' }}>
                    Stage All
                  </button>
                )}
              </div>
              {allUnstaged.length === 0 ? (
                <div className="text-muted p-4 text-center body-regular" style={{ fontSize: '14px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                  Working tree clean
                </div>
              ) : (
                allUnstaged.map((file) => {
                  const pathStr = typeof file === 'string' ? file : file.path;
                  const statusBadge = typeof file === 'object' && file.status ? file.status : 'M';
                  const isUntracked = statusBadge === '??';
                  return (
                    <div
                      key={pathStr}
                      className="flex items-center justify-between px-3 py-2 rounded"
                      style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', fontSize: '14.5px' }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className="code-inline"
                          style={{
                            fontSize: '12px',
                            padding: '1px 5px',
                            background: isUntracked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            color: isUntracked ? '#38BDF8' : '#FDE047'
                          }}
                        >
                          {statusBadge}
                        </span>
                        <span
                          onClick={() => handleOpenDiff(pathStr, false)}
                          className="hover:underline cursor-pointer text-secondary"
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title="Click to view diff"
                        >
                          {pathStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isUntracked && (
                          <button
                            onClick={() => handleOpenDiff(pathStr, false)}
                            className="glass-btn-ghost text-muted hover:text-white"
                            style={{ padding: '2px 8px', fontSize: '13px' }}
                            title="View diff"
                          >
                            Diff
                          </button>
                        )}
                        <button
                          onClick={() => handleStage(file)}
                          className="glass-btn-ghost text-muted hover:text-white"
                          style={{ padding: '2px 8px', fontSize: '13px' }}
                        >
                          Stage
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Explicit Commit Confirmation Modal */}
      <Modal
        isOpen={isCommitModalOpen}
        onClose={() => setIsCommitModalOpen(false)}
        title="Confirm Git Commit"
        maxWidth="500px"
      >
        <div className="flex flex-col gap-4">
          <div>
            <span className="body-small text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
              COMMIT MESSAGE:
            </span>
            <div
              className="p-3 mt-1 rounded font-mono"
              style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--glass-border)', fontSize: '14.5px', color: '#38BDF8' }}
            >
              {commitMsg}
            </div>
          </div>

          <div>
            <span className="body-small text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
              STAGED FILES ({stagedFiles.length}):
            </span>
            <div className="flex flex-col gap-1 mt-1 max-h-40 overflow-y-auto">
              {stagedFiles.map((f) => (
                <div key={f.path || f} className="flex items-center gap-2 text-sm" style={{ color: '#6EE7B7' }}>
                  <Check size={14} />
                  <span>{f.path || f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <Button variant="ghost" size="small" type="button" onClick={() => setIsCommitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="small" type="button" onClick={handleConfirmCommit}>
              Confirm Commit
            </Button>
          </div>
        </div>
      </Modal>

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
            placeholder="e.g. feat/live-db-explorer"
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

      {/* Branch Switch Dirty Warning Modal */}
      <Modal
        isOpen={Boolean(pendingBranch)}
        onClose={() => setPendingBranch(null)}
        title="Uncommitted Changes Detected"
        maxWidth="440px"
      >
        <div className="flex flex-col gap-3">
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)' }}>
            You have uncommitted or staged changes in your current workspace. Switching to{' '}
            <strong style={{ color: '#00D2FF' }}>{pendingBranch}</strong> will move your working directory to that branch.
          </p>
          <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <Button variant="ghost" size="small" onClick={() => setPendingBranch(null)}>
              Cancel
            </Button>
            <Button variant="cyan" size="small" onClick={() => executeCheckout(pendingBranch)}>
              Switch Anyway
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unified Diff Modal */}
      <Modal
        isOpen={diffModal.isOpen}
        onClose={() => setDiffModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Diff: ${diffModal.file || 'File'} (${diffModal.isStaged ? 'Staged' : 'Working Tree'})`}
        maxWidth="800px"
      >
        <div className="flex flex-col gap-2">
          {diffModal.loading ? (
            <div className="p-8 text-center text-muted">Loading diff...</div>
          ) : (
            <pre
              className="p-3 rounded overflow-x-auto font-mono text-sm"
              style={{
                background: '#070A12',
                border: '1px solid var(--glass-border)',
                maxHeight: '480px',
                fontSize: '13.5px',
                lineHeight: 1.5
              }}
            >
              {diffModal.diffText.split('\n').map((line, idx) => {
                let color = 'var(--text-secondary)';
                let bg = 'transparent';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  color = '#6EE7B7';
                  bg = 'rgba(16, 185, 129, 0.1)';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  color = '#FCA5A5';
                  bg = 'rgba(239, 68, 68, 0.1)';
                } else if (line.startsWith('@@')) {
                  color = '#38BDF8';
                  bg = 'rgba(56, 189, 248, 0.1)';
                }
                return (
                  <div key={idx} style={{ color, background: bg, padding: '1px 4px' }}>
                    {line || ' '}
                  </div>
                );
              })}
            </pre>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="small" onClick={() => setDiffModal((prev) => ({ ...prev, isOpen: false }))}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
