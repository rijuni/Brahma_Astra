const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { FilesystemSecurityGuard } = require('./edith.fs.security');
const { AppError } = require('../middleware/errorHandler');

class GitSecurityGuard {
  /**
   * Validates a Git branch name to prevent flag injection, directory traversal, and malformed refs.
   * @param {string} branchName
   * @returns {string} Sanitized branch name
   */
  static validateBranchName(branchName) {
    if (!branchName || typeof branchName !== 'string') {
      throw new AppError('Branch name is required and must be a string.', 400, 'INVALID_BRANCH_NAME');
    }

    const trimmed = branchName.trim();

    if (trimmed.length === 0 || trimmed.length > 100) {
      throw new AppError('Branch name length must be between 1 and 100 characters.', 400, 'INVALID_BRANCH_NAME');
    }

    // Prohibit flags, path escapes, git ref control characters
    if (trimmed.startsWith('-')) {
      throw new AppError('Branch name cannot start with a dash ("-").', 400, 'INVALID_BRANCH_NAME');
    }

    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      throw new AppError('Branch name cannot start or end with a dot (".").', 400, 'INVALID_BRANCH_NAME');
    }

    if (trimmed.endsWith('.lock') || trimmed.endsWith('/')) {
      throw new AppError('Branch name cannot end with ".lock" or "/".', 400, 'INVALID_BRANCH_NAME');
    }

    if (trimmed.includes('..') || trimmed.includes('//') || trimmed.includes('@{')) {
      throw new AppError('Branch name contains invalid sequences ("..", "//", "@{").', 400, 'INVALID_BRANCH_NAME');
    }

    const validBranchRegex = /^[a-zA-Z0-9_\-\.\/]+$/;
    if (!validBranchRegex.test(trimmed)) {
      throw new AppError('Branch name contains invalid characters. Use alphanumeric, dash, underscore, or slash.', 400, 'INVALID_BRANCH_NAME');
    }

    return trimmed;
  }

  /**
   * Validates that an array of relative file paths are enclosed within canonicalRoot
   * and do not contain flag injection tokens.
   * @param {string} canonicalRoot
   * @param {string[]} paths
   * @returns {string[]} Verified relative paths
   */
  static validateRelativePaths(canonicalRoot, paths) {
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new AppError('Files argument must be a non-empty array of file paths.', 400, 'INVALID_FILE_PATHS');
    }

    const verifiedPaths = [];

    for (const rawPath of paths) {
      if (typeof rawPath !== 'string' || !rawPath.trim()) {
        throw new AppError('Each file path must be a non-empty string.', 400, 'INVALID_FILE_PATHS');
      }

      const trimmed = rawPath.trim();

      // Flag injection guard
      if (trimmed.startsWith('-')) {
        throw new AppError(`File path cannot start with a dash: "${trimmed}"`, 400, 'SECURITY_VIOLATION');
      }

      // Enclosure check inside canonicalRoot
      const { relativePath } = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, trimmed, {
        allowMissing: true,
        disallowRoot: true
      });

      verifiedPaths.push(relativePath);
    }

    return verifiedPaths;
  }

  /**
   * Executes a Git command safely via execFile without shell interpolation.
   * @param {string[]} args Array of arguments (e.g. ['status', '--porcelain=v1'])
   * @param {string} cwd Working directory (must be canonical root)
   * @param {number} timeoutMs
   * @returns {Promise<{ stdout: string, stderr: string }>}
   */
  static execGit(args, cwd, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(cwd)) {
        return reject(new AppError(`Working directory does not exist: "${cwd}"`, 404, 'DIR_NOT_FOUND'));
      }

      execFile(
        'git',
        args,
        {
          cwd,
          maxBuffer: 10 * 1024 * 1024,
          timeout: timeoutMs,
          windowsHide: true
        },
        (error, stdout, stderr) => {
          if (error) {
            const cleanStderr = (stderr || error.message || '').trim();
            const err = new AppError(
              cleanStderr || `Git command failed: git ${args[0]}`,
              400,
              'GIT_COMMAND_ERROR'
            );
            err.gitCode = error.code;
            err.details = cleanStderr;
            return reject(err);
          }
          resolve({ stdout: stdout || '', stderr: stderr || '' });
        }
      );
    });
  }

  /**
   * Verifies that the specified directory is an active Git repository.
   * @param {string} canonicalRoot
   */
  static async ensureGitRepo(canonicalRoot) {
    try {
      const { stdout } = await this.execGit(['rev-parse', '--is-inside-work-tree'], canonicalRoot, 5000);
      if (stdout.trim() !== 'true') {
        throw new AppError('The specified project directory is not a Git repository.', 400, 'NOT_A_GIT_REPO');
      }
    } catch (err) {
      if (err instanceof AppError && err.code === 'GIT_COMMAND_ERROR') {
        throw new AppError('The specified project directory is not a Git repository.', 400, 'NOT_A_GIT_REPO');
      }
      throw err;
    }
  }
}

module.exports = {
  GitSecurityGuard
};

