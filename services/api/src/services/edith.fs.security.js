const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit for text editor buffer

// Prohibited sensitive directories and patterns
const RESTRICTED_PATTERNS = [
  /^\.git(\/|\\|$)/i,
  /^\.env(\..+)?$/i,
  /\.ssh(\/|\\|$)/i,
  /node_modules(\/|\\|$)/i,
  /\.venv(\/|\\|$)/i,
  /^venv(\/|\\|$)/i,
  /^env(\/|\\|$)/i,
  /__pycache__(\/|\\|$)/i,
  /\.pytest_cache(\/|\\|$)/i,
  /\.ruff_cache(\/|\\|$)/i,
  /\.mypy_cache(\/|\\|$)/i,
  /\.pyc$/i,
  /\.pyo$/i,
  /\.pyd$/i,
  /\.DS_Store$/i,
  /Thumbs\.db$/i,
  /id_rsa/i
];

// Block direct root access to entire drives or operating system folders
const DISALLOWED_ROOTS = [
  /^([a-zA-Z]:\\?|\/)$/,
  /^[a-zA-Z]:\\Windows/i,
  /^[a-zA-Z]:\\Program Files/i,
  /^\/(bin|boot|dev|etc|lib|proc|root|run|sbin|sys|usr|var)($|\/)/i
];

class FilesystemSecurityGuard {
  /**
   * Validates and canonicalizes a proposed project root directory.
   * @param {string} rawRootPath 
   * @returns {string} Canonical absolute root path
   */
  static validateAndCanonicalizeRoot(rawRootPath) {
    if (!rawRootPath || typeof rawRootPath !== 'string') {
      const err = new Error('Project root path must be a non-empty string.');
      err.status = 400;
      throw err;
    }

    const resolved = path.resolve(rawRootPath);
    if (!fs.existsSync(resolved)) {
      const err = new Error(`Specified root directory does not exist: "${rawRootPath}"`);
      err.status = 404;
      throw err;
    }

    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      const err = new Error(`Specified root path is not a directory: "${rawRootPath}"`);
      err.status = 400;
      throw err;
    }

    const canonicalRoot = fs.realpathSync(resolved);

    // Guard against registering system root or sensitive OS directories
    for (const pattern of DISALLOWED_ROOTS) {
      if (pattern.test(canonicalRoot)) {
        const err = new Error('Access denied: Cannot register system root or sensitive OS directories as project root.');
        err.status = 403;
        throw err;
      }
    }

    return canonicalRoot;
  }

  /**
   * Resolves, canonicalizes, and verifies that a relative path stays enclosed within the registered root.
   * @param {string} canonicalRoot 
   * @param {string} relativePath 
   * @param {Object} options { allowMissing: boolean, checkSize: boolean, disallowRoot: boolean }
   * @returns {{ absolutePath: string, relativePath: string, exists: boolean }}
   */
  static resolveAndVerify(canonicalRoot, relativePath, options = {}) {
    const { allowMissing = false, checkSize = false, disallowRoot = false } = options;

    if (relativePath === undefined || relativePath === null) {
      const err = new Error('Path argument is required.');
      err.status = 400;
      throw err;
    }

    // Reject null byte injection attacks
    if (typeof relativePath !== 'string' || relativePath.indexOf('\0') !== -1) {
      const err = new Error('Invalid path format: Null bytes detected.');
      err.status = 400;
      throw err;
    }

    // Direct resolve without stripping traversal tokens
    const absoluteTarget = path.isAbsolute(relativePath)
      ? path.resolve(relativePath)
      : path.resolve(canonicalRoot, relativePath);

    // Verify enclosure before resolving symlinks
    const isDirectlyEnclosed =
      absoluteTarget === canonicalRoot ||
      absoluteTarget.startsWith(canonicalRoot + path.sep);

    if (!isDirectlyEnclosed) {
      const err = new Error('Security violation: Path traversal outside registered project root.');
      err.status = 403;
      throw err;
    }

    if (disallowRoot && absoluteTarget === canonicalRoot) {
      const err = new Error('Action not permitted on the project root itself.');
      err.status = 400;
      throw err;
    }

    const exists = fs.existsSync(absoluteTarget);

    if (!exists) {
      if (!allowMissing) {
        const err = new Error(`File or directory not found: "${relativePath}"`);
        err.status = 404;
        throw err;
      }

      // If missing, verify the closest existing parent directory to prevent symlink escapes
      let parent = path.dirname(absoluteTarget);
      while (!fs.existsSync(parent) && parent !== canonicalRoot && parent !== path.dirname(parent)) {
        parent = path.dirname(parent);
      }

      if (fs.existsSync(parent)) {
        const realParent = fs.realpathSync(parent);
        const parentEnclosed =
          realParent === canonicalRoot || realParent.startsWith(canonicalRoot + path.sep);
        if (!parentEnclosed) {
          const err = new Error('Security violation: Parent path symlink escapes project root.');
          err.status = 403;
          throw err;
        }
      }

      return {
        absolutePath: absoluteTarget,
        relativePath: path.relative(canonicalRoot, absoluteTarget).replace(/\\/g, '/'),
        exists: false
      };
    }

    // File/Directory exists: resolve real path to verify symlink enclosure
    const realTarget = fs.realpathSync(absoluteTarget);
    const isRealEnclosed =
      realTarget === canonicalRoot || realTarget.startsWith(canonicalRoot + path.sep);

    if (!isRealEnclosed) {
      const err = new Error('Security violation: Symlink target escapes project root.');
      err.status = 403;
      throw err;
    }

    if (checkSize) {
      const stat = fs.statSync(realTarget);
      if (stat.isFile() && stat.size > MAX_FILE_SIZE_BYTES) {
        const err = new Error(
          `File exceeds maximum editable size of 10MB (${(stat.size / (1024 * 1024)).toFixed(2)} MB).`
        );
        err.status = 413;
        throw err;
      }
    }

    return {
      absolutePath: realTarget,
      relativePath: path.relative(canonicalRoot, realTarget).replace(/\\/g, '/'),
      exists: true
    };
  }

  /**
   * Checks if a relative path matches excluded / restricted patterns
   * @param {string} relPath 
   * @returns {boolean}
   */
  static isRestricted(relPath) {
    const clean = (relPath || '').replace(/^[\\\/]+/, '');
    for (const pattern of RESTRICTED_PATTERNS) {
      if (pattern.test(clean)) return true;
    }
    return false;
  }
}

module.exports = {
  FilesystemSecurityGuard,
  MAX_FILE_SIZE_BYTES
};
