/**
 * Centralized API Client for BRAHMA + ASTRA
 * Connects to Node.js/Express public API at /api/v1 (or VITE_API_BASE_URL)
 * Zero secrets stored on the client.
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1';

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getStoredToken() {
  try {
    return localStorage.getItem('brahma_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem('brahma_token', token);
    } else {
      localStorage.removeItem('brahma_token');
    }
  } catch {
    // Local storage unavailable
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new ApiError(
      'Unable to connect to the backend server. Please verify services are running.',
      0,
      'NETWORK_ERROR'
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMsg = payload?.error?.message || payload?.message || `Request failed with status ${response.status}`;
    const errorCode = payload?.error?.code || payload?.code || 'API_ERROR';
    const errorDetails = payload?.error?.details || null;
    throw new ApiError(errorMsg, response.status, errorCode, errorDetails);
  }

  return payload?.data !== undefined ? payload.data : payload;
}

export const api = {
  // Authentication Endpoints
  async register({ email, password, name }) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    if (data?.token) setStoredToken(data.token);
    return data;
  },

  async login({ email, password }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data?.token) setStoredToken(data.token);
    return data;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  async getMe() {
    return request('/auth/me');
  },

  // Project Endpoints
  async listProjects() {
    return request('/projects');
  },

  async getProject(id) {
    return request(`/projects/${id}`);
  },

  async createProject(projectData) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  async updateProject(id, projectData) {
    return request(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData)
    });
  },

  async deleteProject(id) {
    return request(`/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // Conversations & Messages
  async listConversations() {
    return request('/conversations');
  },

  async getConversation(id) {
    return request(`/conversations/${id}`);
  },

  async createConversation({ title, projectId }) {
    return request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, projectId })
    });
  },

  async sendMessage(conversationId, { content, role = 'user' }) {
    return request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, role })
    });
  },

  // AI Tasks
  async createAiTask({ prompt, provider = 'mock', taskType = 'general', parameters = {} }) {
    return request('/ai/tasks', {
      method: 'POST',
      body: JSON.stringify({ prompt, provider, taskType, parameters })
    });
  },

  async getAiTask(id) {
    return request(`/ai/tasks/${id}`);
  },

  // ASTRA Workspaces & Tasks
  async createAstraWorkspace({ projectId, name, repositoryUrl }) {
    return request('/astra/workspaces', {
      method: 'POST',
      body: JSON.stringify({ projectId, name, repositoryUrl })
    });
  },

  async getAstraWorkspace(workspaceId) {
    return request(`/astra/workspaces/${workspaceId}`);
  },

  async createCodingTask({ workspaceId, title, instruction }) {
    return request('/astra/tasks', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, title, instruction })
    });
  },

  async getCodingTask(taskId) {
    return request(`/astra/tasks/${taskId}`);
  },

  async approveCodingTask(taskId) {
    return request(`/astra/tasks/${taskId}/approve`, {
      method: 'POST'
    });
  },

  async cancelCodingTask(taskId) {
    return request(`/astra/tasks/${taskId}/cancel`, {
      method: 'POST'
    });
  },

  // Health and Security Status Probes
  async checkHealthLive() {
    const res = await fetch('/health/live');
    return res.json();
  },

  async checkHealthReady() {
    const res = await fetch('/health/ready');
    return res.json();
  },

  async checkAstraSecurityStatus() {
    // Queries ASTRA Runner port directly or through dev proxy
    const res = await fetch('http://localhost:8003/api/v1/security-status').catch(() => null);
    if (!res) return { execution_mode: 'disabled', verified: true, error: 'Offline' };
    return res.json();
  }
};
