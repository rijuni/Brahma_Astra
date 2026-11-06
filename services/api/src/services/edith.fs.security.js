const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit for text editor buffer

// Restricted path components are enforced for every filesystem operation,
// not only when building the visible file tree.
const RESTRICTED_COMPONENTS = new Set([
  '.git', '.ssh', 'node_modules', '.venv', 'venv', 'env', '__pycache__',
  '.pytest_cache', '.ruff_cache', '.mypy_cache', '.ds_store', 'thumbs.db'
]);

// Block direct root access to entire drives or operating system folders
const DISALLOWED_ROOTS = [
  /^([a-zA-Z]:\\?|\/)$/,
  /^[a-zA-Z]:\\Windows/i,
  /^[a-zA-Z]:\\Program Files/i,
  /^\/(bin|boot|dev|etc|lib|proc|root|run|sbin|sys|usr|var)($|\/)/i
];

class FilesystemSecurityGuard {
  static isPathWithin(parentPath, candidatePath) {
    const relative = path.relative(parentPath, candidatePath);
    return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
  }

  static getConfiguredWorkspaceBase() {
    const configuredBase = process.env.EDITH_WORKSPACE_BASE_DIR;
    if (!configuredBase && process.env.NODE_ENV === 'test') return null;
    if (!configuredBase) {
      const err = new Error('EDITH_WORKSPACE_BASE_DIR must point to a dedicated workspace directory.');
      err.status = 503;
      throw err;
    }
    const resolvedBase = path.resolve(configuredBase);
    if (!fs.existsSync(resolvedBase) || !fs.statSync(resolvedBase).isDirectory()) {
      const err = new Error('EDITH_WORKSPACE_BASE_DIR must point to an existing directory.');
      err.status = 500;
      throw err;
    }
    return fs.realpathSync(resolvedBase);
  }

  static assertAllowedPath(relativePath) {
    if (this.isRestricted(relativePath)) {
      const err = new Error('Access denied: this path is restricted.');
      err.status = 403;
      throw err;
    }
  }

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

    const workspaceBase = this.getConfiguredWorkspaceBase();
    if (workspaceBase && !this.isPathWithin(workspaceBase, canonicalRoot)) {
      const err = new Error('Access denied: workspace roots must be inside EDITH_WORKSPACE_BASE_DIR.');
      err.status = 403;
      throw err;
    }
    if (workspaceBase) {
      this.assertAllowedPath(path.relative(workspaceBase, canonicalRoot).replace(/\\/g, '/'));
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

    this.assertAllowedPath(path.relative(canonicalRoot, absoluteTarget).replace(/\\/g, '/'));

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

    this.assertAllowedPath(path.relative(canonicalRoot, realTarget).replace(/\\/g, '/'));

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
    const components = (relPath || '').split(/[\\/]+/).filter(Boolean);
    return components.some((component) => {
      const lower = component.toLowerCase();
      return RESTRICTED_COMPONENTS.has(lower) || /^\.env(?:\..+)?$/i.test(component) ||
        /\.(?:pyc|pyo|pyd)$/i.test(component) || /id_rsa/i.test(component);
    });
  }
}

module.exports = {
  FilesystemSecurityGuard,
  MAX_FILE_SIZE_BYTES
};
