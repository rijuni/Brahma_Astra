const auditService = require('./audit.service');
const edithFsService = require('./edith.fs.service');
const { GitSecurityGuard } = require('./edith.git.security');
const { AppError } = require('../middleware/errorHandler');

class EdithGitService {
  /**
   * Retrieves working tree status for a project repository.
   */
  async getStatus(userId, projectId) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    const { stdout } = await GitSecurityGuard.execGit(
      ['status', '--porcelain=v1', '-b', '-uall'],
      canonicalRoot
    );

    const lines = stdout.split(/\r?\n/).filter((l) => l.trim().length > 0);
    let branch = 'HEAD';
    let tracking = null;
    let ahead = 0;
    let behind = 0;

    const staged = [];
    const unstaged = [];
    const untracked = [];

    if (lines.length > 0 && lines[0].startsWith('## ')) {
      const branchLine = lines[0].substring(3).trim();
      
      // Handle cases: "Initial commit on main", "No commits yet on main", "main...origin/main [ahead 1, behind 2]", "main"
      if (branchLine.includes('No commits yet on ') || branchLine.includes('Initial commit on ')) {
        const parts = branchLine.split(' on ');
        branch = parts[1] ? parts[1].trim() : 'main';
      } else {
        const match = branchLine.match(/^([^\s\.]+)(?:\.\.\.([^\s]+))?(?:\s+\[(?:ahead (\d+))?(?:, )?(?:behind (\d+))?\])?/);
        if (match) {
          branch = match[1] || 'HEAD';
          tracking = match[2] || null;
          ahead = parseInt(match[3] || '0', 10);
          behind = parseInt(match[4] || '0', 10);
        } else {
          branch = branchLine.split('...')[0].trim();
        }
      }
    }

    // Process file status lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length < 3) continue;

      const indexStatus = line[0];
      const workStatus = line[1];
      let filePath = line.substring(3).trim();

      // Strip quotes if git quoted a filename with special chars
      if (filePath.startsWith('"') && filePath.endsWith('"')) {
        filePath = filePath.slice(1, -1);
      }

      if (indexStatus === '?' && workStatus === '?') {
        untracked.push({ path: filePath, status: '??' });
        continue;
      }

      if (indexStatus !== ' ' && indexStatus !== '?') {
        staged.push({ path: filePath, status: indexStatus });
      }

      if (workStatus !== ' ' && workStatus !== '?') {
        unstaged.push({ path: filePath, status: workStatus });
      }
    }

    const isClean = staged.length === 0 && unstaged.length === 0 && untracked.length === 0;

    return {
      branch,
      tracking,
      ahead,
      behind,
      isClean,
      staged,
      unstaged,
      untracked
    };
  }

  /**
   * Lists branches for the repository.
   */
  async getBranches(userId, projectId) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    const { stdout } = await GitSecurityGuard.execGit(['branch', '--list'], canonicalRoot);
    const lines = stdout.split(/\r?\n/).filter((l) => l.trim().length > 0);

    let current = 'main';
    const branches = [];

    for (const rawLine of lines) {
      const isCurrent = rawLine.startsWith('*');
      const branchName = rawLine.replace(/^\*?\s+/, '').trim();
      if (!branchName) continue;

      branches.push(branchName);
      if (isCurrent) {
        current = branchName;
      }
    }

    if (branches.length === 0) {
      // Default placeholder if repo has no branch yet
      branches.push('main');
      current = 'main';
    }

    return {
      current,
      branches
    };
  }

  /**
   * Creates a new branch, optionally checking it out.
   */
  async createBranch(userId, projectId, { branchName, checkout = false }) {
    const sanitizedBranch = GitSecurityGuard.validateBranchName(branchName);
    const { canonicalRoot, workspace } = await edithFsService.getProjectRoot(userId, projectId, { requireWrite: true });
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    const args = checkout
      ? ['checkout', '-b', sanitizedBranch]
      : ['branch', sanitizedBranch];

    await GitSecurityGuard.execGit(args, canonicalRoot);

    await auditService.record({
      userId,
      action: 'GIT_BRANCH_CREATED',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { branchName: sanitizedBranch, checkout: !!checkout }
    });

    return {
      branch: sanitizedBranch,
      checkedOut: !!checkout
    };
  }

  /**
   * Switches to an existing branch.
   */
  async checkoutBranch(userId, projectId, { branchName }) {
    const sanitizedBranch = GitSecurityGuard.validateBranchName(branchName);
    const { canonicalRoot, workspace } = await edithFsService.getProjectRoot(userId, projectId, { requireWrite: true });
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    await GitSecurityGuard.execGit(['checkout', sanitizedBranch], canonicalRoot);

    await auditService.record({
      userId,
      action: 'GIT_BRANCH_CHECKOUT',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { branchName: sanitizedBranch }
    });

    return {
      branch: sanitizedBranch
    };
  }

  /**
   * Stages file(s) or all changes into the Git index.
   */
  async stage(userId, projectId, { files, all = false }) {
    const { canonicalRoot, workspace } = await edithFsService.getProjectRoot(userId, projectId, { requireWrite: true });
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    let stagedCount = 0;
    if (all) {
      const { stdout } = await GitSecurityGuard.execGit(
        ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
        canonicalRoot
      );
      const paths = stdout.split('\0').filter((filePath) =>
        filePath && !filePath.startsWith('-') && !GitSecurityGuard.isRestrictedPath(filePath)
      );
      for (let offset = 0; offset < paths.length; offset += 100) {
        const verifiedPaths = GitSecurityGuard.validateRelativePaths(canonicalRoot, paths.slice(offset, offset + 100));
        await GitSecurityGuard.execGit(['add', '-A', '--', ...verifiedPaths], canonicalRoot);
      }
      stagedCount = paths.length;
    } else {
      const verifiedPaths = GitSecurityGuard.validateRelativePaths(canonicalRoot, files);
      await GitSecurityGuard.execGit(['add', '--', ...verifiedPaths], canonicalRoot);
      stagedCount = verifiedPaths.length;
    }

    await auditService.record({
      userId,
      action: 'GIT_FILES_STAGED',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { all: !!all, files: all ? null : files }
    });

    return {
      stagedCount
    };
  }

  /**
   * Unstages file(s) or all changes from the Git index.
   */
  async unstage(userId, projectId, { files, all = false }) {
    const { canonicalRoot, workspace } = await edithFsService.getProjectRoot(userId, projectId, { requireWrite: true });
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    let unstagedCount = 0;
    if (all) {
      await GitSecurityGuard.execGit(['reset', 'HEAD'], canonicalRoot);
      unstagedCount = 'all';
    } else {
      const verifiedPaths = GitSecurityGuard.validateRelativePaths(canonicalRoot, files);
      await GitSecurityGuard.execGit(['reset', 'HEAD', '--', ...verifiedPaths], canonicalRoot);
      unstagedCount = verifiedPaths.length;
    }

    await auditService.record({
      userId,
      action: 'GIT_FILES_UNSTAGED',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { all: !!all, files: all ? null : files }
    });

    return {
      unstagedCount
    };
  }

  /**
   * Commits staged changes with an explicit confirmation requirement.
   */
  async commit(userId, projectId, { message, confirmed }) {
    if (!confirmed) {
      throw new AppError(
        'Git commit requires explicit user confirmation. Set confirmed: true.',
        400,
        'CONFIRMATION_REQUIRED'
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new AppError('Commit message cannot be empty.', 400, 'INVALID_COMMIT_MESSAGE');
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length > 2000) {
      throw new AppError('Commit message is too long (max 2000 characters).', 400, 'INVALID_COMMIT_MESSAGE');
    }

    const { canonicalRoot, workspace } = await edithFsService.getProjectRoot(userId, projectId, { requireWrite: true });
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    // Check if anything is staged
    const { stdout: statusOut } = await GitSecurityGuard.execGit(
      ['status', '--porcelain=v1'],
      canonicalRoot
    );
    const hasStaged = statusOut
      .split(/\r?\n/)
      .some((l) => l.length >= 2 && l[0] !== ' ' && l[0] !== '?');

    if (!hasStaged) {
      throw new AppError('No changes are staged for commit. Please stage files first.', 400, 'NOTHING_TO_COMMIT');
    }

    const { stdout: stagedPathOutput } = await GitSecurityGuard.execGit(
      ['diff', '--cached', '--name-only', '-z'],
      canonicalRoot
    );
    if (stagedPathOutput.split('\0').some((filePath) => GitSecurityGuard.isRestrictedPath(filePath))) {
      throw new AppError('Unstage restricted files before committing.', 403, 'RESTRICTED_CONTENT');
    }

    await GitSecurityGuard.execGit(['commit', '-m', cleanMessage], canonicalRoot);

    // Retrieve new HEAD commit hash
    const { stdout: hashOut } = await GitSecurityGuard.execGit(['rev-parse', 'HEAD'], canonicalRoot);
    const commitHash = hashOut.trim();

    await auditService.record({
      userId,
      action: 'GIT_COMMIT_CREATED',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { commitHash, message: cleanMessage }
    });

    return {
      commitHash,
      message: cleanMessage
    };
  }

  /**
   * Gets diff for a specific file or the whole working tree / staged index.
   */
  async getDiff(userId, projectId, { file, staged = false }) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    try {
      const diffArgs = staged ? ['--cached'] : [];
      if (file) {
        const [verifiedPath] = GitSecurityGuard.validateRelativePaths(canonicalRoot, [file]);
        const { stdout } = await GitSecurityGuard.execGit(['diff', ...diffArgs, '--', verifiedPath], canonicalRoot);
        return { diff: stdout || '' };
      }

      const { stdout: nameOutput } = await GitSecurityGuard.execGit(
        ['diff', ...diffArgs, '--name-only', '-z'],
        canonicalRoot
      );
      const changedPaths = nameOutput.split('\0').filter((filePath) =>
        filePath && !filePath.startsWith('-') && !GitSecurityGuard.isRestrictedPath(filePath)
      );
      const diffs = [];
      for (let offset = 0; offset < changedPaths.length; offset += 100) {
        const verifiedPaths = GitSecurityGuard.validateRelativePaths(canonicalRoot, changedPaths.slice(offset, offset + 100));
        const { stdout } = await GitSecurityGuard.execGit(
          ['diff', ...diffArgs, '--', ...verifiedPaths],
          canonicalRoot
        );
        if (stdout) diffs.push(stdout);
      }
      return { diff: diffs.join('') };
    } catch (err) {
      return { diff: '' };
    }
  }

  /**
   * Retrieves commit history log.
   */
  async getLog(userId, projectId, limit = 20) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    await GitSecurityGuard.ensureGitRepo(canonicalRoot);

    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    try {
      const { stdout } = await GitSecurityGuard.execGit(
        ['log', `-n`, String(parsedLimit), '--format=%H%x1f%an%x1f%ae%x1f%ad%x1f%s'],
        canonicalRoot
      );

      const commits = stdout
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0)
        .map((line) => {
          const [hash, author, email, date, subject] = line.split('\x1f');
          return {
            hash: hash || '',
            author: author || 'Unknown',
            email: email || '',
            date: date || '',
            message: subject || ''
          };
        });

      return { commits };
    } catch (err) {
      // If repo has no commits yet, return empty list
      return { commits: [] };
    }
  }
}

module.exports = new EdithGitService();

