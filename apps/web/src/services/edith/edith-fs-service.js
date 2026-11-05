import { apiClient } from '../api-client.js';

export const edithFsService = {
  /**
   * Get registered project workspaces
   */
  async getProjects() {
    return apiClient.get('/edith/fs/projects');
  },

  /**
   * Register or update an authorized project root
   */
  async registerProject({ projectId, name, rootPath }) {
    return apiClient.post('/edith/fs/projects', { projectId, name, rootPath });
  },

  /**
   * Fetch hierarchical file tree
   */
  async getFileTree(projectId, subpath = '', maxDepth = 5) {
    const params = new URLSearchParams({
      projectId,
      subpath: subpath || '',
      maxDepth: String(maxDepth)
    });
    return apiClient.get(`/edith/fs/tree?${params.toString()}`);
  },

  /**
   * Read real file content
   */
  async readFile(projectId, filePath) {
    const params = new URLSearchParams({
      projectId,
      path: filePath
    });
    return apiClient.get(`/edith/fs/read?${params.toString()}`);
  },

  /**
   * Save file content to disk atomically
   */
  async writeFile(projectId, filePath, content) {
    return apiClient.put('/edith/fs/write', {
      projectId,
      path: filePath,
      content
    });
  },

  /**
   * Create new file or directory
   */
  async createItem(projectId, itemPath, type = 'file') {
    return apiClient.post('/edith/fs/create', {
      projectId,
      path: itemPath,
      type
    });
  },

  /**
   * Rename or move a file or directory
   */
  async renameItem(projectId, oldPath, newPath) {
    return apiClient.patch('/edith/fs/rename', {
      projectId,
      oldPath,
      newPath
    });
  },

  /**
   * Delete a file or directory
   */
  async deleteItem(projectId, targetPath) {
    return apiClient.request('/edith/fs/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        projectId,
        path: targetPath
      })
    });
  }
};

