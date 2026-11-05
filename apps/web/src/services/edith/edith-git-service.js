import { apiClient } from '../api-client.js';

export const edithGitService = {
  /**
   * Retrieves working tree status (staged, unstaged, untracked, branch info).
   */
  async getStatus(projectId) {
    const params = new URLSearchParams({ projectId });
    return apiClient.get(`/edith/git/status?${params.toString()}`);
  },

  /**
   * Retrieves list of local branches and current active branch.
   */
  async getBranches(projectId) {
    const params = new URLSearchParams({ projectId });
    return apiClient.get(`/edith/git/branches?${params.toString()}`);
  },

  /**
   * Creates a new Git branch.
   */
  async createBranch(projectId, branchName, checkout = false) {
    return apiClient.post('/edith/git/branches', {
      projectId,
      branchName,
      checkout
    });
  },

  /**
   * Switches to an existing Git branch.
   */
  async checkoutBranch(projectId, branchName) {
    return apiClient.post('/edith/git/checkout', {
      projectId,
      branchName
    });
  },

  /**
   * Stages file(s) or all changes into the Git index.
   */
  async stage(projectId, files = null, all = false) {
    return apiClient.post('/edith/git/stage', {
      projectId,
      files: files || [],
      all
    });
  },

  /**
   * Unstages file(s) or all changes from the Git index.
   */
  async unstage(projectId, files = null, all = false) {
    return apiClient.post('/edith/git/unstage', {
      projectId,
      files: files || [],
      all
    });
  },

  /**
   * Commits staged changes with user confirmation.
   */
  async commit(projectId, message, confirmed = true) {
    return apiClient.post('/edith/git/commit', {
      projectId,
      message,
      confirmed
    });
  },

  /**
   * Fetches unified diff for a file or entire index/tree.
   */
  async getDiff(projectId, file = null, staged = false) {
    const params = new URLSearchParams({ projectId });
    if (file) params.append('file', file);
    if (staged) params.append('staged', 'true');
    return apiClient.get(`/edith/git/diff?${params.toString()}`);
  },

  /**
   * Retrieves recent commit history.
   */
  async getLog(projectId, limit = 20) {
    const params = new URLSearchParams({
      projectId,
      limit: String(limit)
    });
    return apiClient.get(`/edith/git/log?${params.toString()}`);
  }
};

