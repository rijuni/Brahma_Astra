const fs = require('fs');
const path = require('path');
const prisma = require('../repositories/prisma');
const auditService = require('./audit.service');
const { FilesystemSecurityGuard, MAX_FILE_SIZE_BYTES } = require('./edith.fs.security');
const { AppError } = require('../middleware/errorHandler');

class EdithFsService {
  /**
   * Helper: Resolves and validates the project workspace and its registered canonical root.
   */
  async getProjectRoot(userId, projectId) {
    if (!projectId) {
      throw new AppError('projectId is required.', 400, 'INVALID_PROJECT_ID');
    }

    // Find workspace for this project accessible to this user
    let workspace = await prisma.edithWorkspace.findFirst({
      where: {
        OR: [
          { id: projectId },
          { projectId: projectId }
        ],
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        project: true
      }
    });

    if (!workspace) {
      // If user owns a project with this ID, auto-create a workspace if needed
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      if (!project) {
        throw new AppError(`Project "${projectId}" not found or unauthorized.`, 404, 'PROJECT_NOT_FOUND');
      }

      // Check if root directory can default to current working directory if available
      const defaultRoot = process.env.EDITH_DEFAULT_WORKSPACE_ROOT || process.cwd();
      const canonicalDefault = FilesystemSecurityGuard.validateAndCanonicalizeRoot(defaultRoot);

      workspace = await prisma.edithWorkspace.create({
        data: {
          projectId: project.id,
          name: `${project.name} Workspace`,
          rootPath: canonicalDefault,
          status: 'active'
        },
        include: { project: true }
      });
    }

    if (!workspace.rootPath) {
      throw new AppError(
        `Workspace "${workspace.id}" has no registered root path. Please register an authorized directory first.`,
        400,
        'NO_ROOT_REGISTERED'
      );
    }

    const canonicalRoot = FilesystemSecurityGuard.validateAndCanonicalizeRoot(workspace.rootPath);
    return { workspace, canonicalRoot };
  }

  /**
   * List all registered workspaces/project roots for the user.
   */
  async listProjects(userId) {
    const workspaces = await prisma.edithWorkspace.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        project: {
          select: { id: true, name: true, description: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return workspaces.map((ws) => ({
      id: ws.id,
      projectId: ws.projectId,
      projectName: ws.project?.name || ws.name,
      name: ws.name,
      rootPath: ws.rootPath,
      status: ws.status,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt
    }));
  }

  /**
   * Register or update a project root directory.
   */
  async registerProject(userId, { projectId, name, rootPath }) {
    if (!rootPath) {
      throw new AppError('rootPath is required.', 400, 'MISSING_ROOT_PATH');
    }

    const canonicalRoot = FilesystemSecurityGuard.validateAndCanonicalizeRoot(rootPath);

    // Verify project ownership
    let project;
    if (projectId) {
      project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId, role: { in: ['owner', 'admin'] } } } }
          ]
        }
      });
    }

    if (!project) {
      // Auto-create a project if no valid projectId was passed
      const projName = name || path.basename(canonicalRoot) || 'Workspace Project';
      project = await prisma.project.create({
        data: {
          name: projName,
          description: `Registered workspace for ${canonicalRoot}`,
          ownerId: userId,
          members: {
            create: { userId, role: 'owner' }
          }
        }
      });
    }

    // Upsert edithWorkspace
    const workspace = await prisma.edithWorkspace.upsert({
      where: {
        id: (await prisma.edithWorkspace.findFirst({ where: { projectId: project.id } }))?.id || 'non-existent'
      },
      update: {
        name: name || project.name,
        rootPath: canonicalRoot,
        status: 'active'
      },
      create: {
        projectId: project.id,
        name: name || project.name,
        rootPath: canonicalRoot,
        status: 'active'
      }
    });

    await auditService.record({
      userId,
      action: 'WORKSPACE_ROOT_REGISTERED',
      resourceType: 'EdithWorkspace',
      resourceId: workspace.id,
      details: { projectId: project.id, rootPath: canonicalRoot }
    });

    return {
      id: workspace.id,
      projectId: project.id,
      projectName: project.name,
      name: workspace.name,
      rootPath: workspace.rootPath,
      status: workspace.status
    };
  }

  /**
   * Recursively build directory tree within registered root.
   */
  async getTree(userId, projectId, subpath = '', maxDepth = 5) {
    const { canonicalRoot } = await this.getProjectRoot(userId, projectId);
    const resolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, subpath);

    const safeDepth = Math.min(Math.max(1, parseInt(maxDepth, 10) || 5), 10);

    const buildTree = (currentDir, relativeCurrent, currentDepth) => {
      const stats = fs.statSync(currentDir);
      const name = path.basename(currentDir) || path.basename(canonicalRoot);

      if (!stats.isDirectory()) {
        return {
          name,
          path: relativeCurrent.replace(/\\/g, '/'),
          type: 'file',
          size: stats.size,
          extension: path.extname(name),
          updatedAt: stats.mtime
        };
      }

      const node = {
        name,
        path: relativeCurrent.replace(/\\/g, '/'),
        type: 'directory',
        children: []
      };

      if (currentDepth >= safeDepth) {
        return node;
      }

      let entries;
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch (err) {
        return node;
      }

      // Sort: directories first, then alphabetical
      entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      for (const entry of entries) {
        const entryRel = path.join(relativeCurrent, entry.name);
        if (FilesystemSecurityGuard.isRestricted(entryRel)) {
          continue;
        }

        const fullEntryPath = path.join(currentDir, entry.name);
        try {
          if (entry.isDirectory()) {
            node.children.push(buildTree(fullEntryPath, entryRel, currentDepth + 1));
          } else if (entry.isFile()) {
            const fileStat = fs.statSync(fullEntryPath);
            node.children.push({
              name: entry.name,
              path: entryRel.replace(/\\/g, '/'),
              type: 'file',
              size: fileStat.size,
              extension: path.extname(entry.name),
              updatedAt: fileStat.mtime
            });
          }
        } catch {
          // Skip inaccessible entries
        }
      }

      return node;
    };

    return buildTree(resolved.absolutePath, resolved.relativePath, 0);
  }

  /**
   * Read file contents as UTF-8 text.
   */
  async readFile(userId, projectId, filePath) {
    const { canonicalRoot } = await this.getProjectRoot(userId, projectId);
    const resolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, filePath, { checkSize: true });

    const stats = await fs.promises.stat(resolved.absolutePath);
    if (stats.isDirectory()) {
      throw new AppError(`Cannot read directory as file: "${filePath}"`, 400, 'IS_DIRECTORY');
    }

    const content = await fs.promises.readFile(resolved.absolutePath, 'utf8');

    return {
      path: resolved.relativePath,
      name: path.basename(resolved.absolutePath),
      content,
      size: stats.size,
      extension: path.extname(resolved.absolutePath),
      updatedAt: stats.mtime
    };
  }

  /**
   * Write file contents atomically.
   */
  async writeFile(userId, projectId, filePath, content) {
    if (typeof content !== 'string') {
      throw new AppError('File content must be a string.', 400, 'INVALID_CONTENT');
    }

    const byteLen = Buffer.byteLength(content, 'utf8');
    if (byteLen > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `Payload too large: ${(byteLen / (1024 * 1024)).toFixed(2)}MB exceeds maximum 10MB limit.`,
        413,
        'PAYLOAD_TOO_LARGE'
      );
    }

    const { canonicalRoot } = await this.getProjectRoot(userId, projectId);
    const resolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, filePath, {
      allowMissing: true,
      disallowRoot: true
    });

    // Ensure parent directory exists
    const dir = path.dirname(resolved.absolutePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Atomic write via temp file
    const tempFile = `${resolved.absolutePath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await fs.promises.writeFile(tempFile, content, 'utf8');
    await fs.promises.rename(tempFile, resolved.absolutePath);

    const stats = await fs.promises.stat(resolved.absolutePath);

    await auditService.record({
      userId,
      action: 'FILE_SAVED',
      resourceType: 'File',
      resourceId: resolved.relativePath,
      details: { projectId, size: stats.size }
    });

    return {
      path: resolved.relativePath,
      name: path.basename(resolved.absolutePath),
      size: stats.size,
      updatedAt: stats.mtime
    };
  }

  /**
   * Create a new file or directory.
   */
  async createItem(userId, projectId, itemPath, type = 'file') {
    const { canonicalRoot } = await this.getProjectRoot(userId, projectId);
    const resolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, itemPath, {
      allowMissing: true,
      disallowRoot: true
    });

    if (resolved.exists) {
      throw new AppError(`Item already exists at "${itemPath}".`, 409, 'ALREADY_EXISTS');
    }

    if (type === 'directory') {
      await fs.promises.mkdir(resolved.absolutePath, { recursive: true });
    } else {
      await fs.promises.mkdir(path.dirname(resolved.absolutePath), { recursive: true });
      await fs.promises.writeFile(resolved.absolutePath, '', 'utf8');
    }

    await auditService.record({
      userId,
      action: 'FS_ITEM_CREATED',
      resourceType: type === 'directory' ? 'Directory' : 'File',
      resourceId: resolved.relativePath,
      details: { projectId, type }
    });

    return {
      path: resolved.relativePath,
      name: path.basename(resolved.absolutePath),
      type
    };
  }

  /**
   * Rename or move a file or folder.
   */
  async renameItem(userId, projectId, oldPath, newPath) {
    if (!oldPath || !newPath) {
      throw new AppError('Both oldPath and newPath are required.', 400, 'MISSING_PATH_ARG');
    }

    const { canonicalRoot } = await this.getProjectRoot(userId, projectId);
    const oldResolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, oldPath, { disallowRoot: true });
    const newResolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, newPath, {
      allowMissing: true,
      disallowRoot: true
    });

    if (newResolved.exists) {
      throw new AppError(`Destination "${newPath}" already exists.`, 409, 'DESTINATION_EXISTS');
    }

    await fs.promises.mkdir(path.dirname(newResolved.absolutePath), { recursive: true });
    await fs.promises.rename(oldResolved.absolutePath, newResolved.absolutePath);

    await auditService.record({
      userId,
      action: 'FS_ITEM_RENAMED',
      resourceType: 'File',
      resourceId: newResolved.relativePath,
      details: { projectId, oldPath: oldResolved.relativePath, newPath: newResolved.relativePath }
    });

    return {
      oldPath: oldResolved.relativePath,
      newPath: newResolved.relativePath
    };
  }

  /**
   * Delete a file or directory.
   */
  async deleteItem(userId, projectId, targetPath) {
    const { canonicalRoot } = await this.getProjectRoot(userId, projectId);
    const resolved = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, targetPath, { disallowRoot: true });

    const stats = await fs.promises.stat(resolved.absolutePath);
    if (stats.isDirectory()) {
      await fs.promises.rm(resolved.absolutePath, { recursive: true, force: true });
    } else {
      await fs.promises.unlink(resolved.absolutePath);
    }

    await auditService.record({
      userId,
      action: 'FS_ITEM_DELETED',
      resourceType: stats.isDirectory() ? 'Directory' : 'File',
      resourceId: resolved.relativePath,
      details: { projectId }
    });

    return {
      path: resolved.relativePath,
      deleted: true
    };
  }
}

module.exports = new EdithFsService();

