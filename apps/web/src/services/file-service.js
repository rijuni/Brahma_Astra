import { apiClient } from './api-client.js';

export const fileService = {
  /**
   * List files persistently stored for the user
   */
  async list(projectId = null) {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return apiClient.get(`/files${query}`);
  },

  /**
   * Upload a file with multipart/form-data
   */
  async upload(file, projectId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId);
    }
    return apiClient.upload('/files', formData);
  },

  /**
   * Get file metadata
   */
  async getMetadata(fileId) {
    return apiClient.get(`/files/${fileId}`);
  },

  /**
   * Trigger streaming file download
   */
  async download(fileId, fallbackName = 'download') {
    const token = apiClient.getToken();
    const url = `/api/v1/files/${fileId}/download`;

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download file (HTTP ${response.status})`);
    }

    // Try reading filename from Content-Disposition header
    let filename = fallbackName;
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    return { filename, size: blob.size };
  },

  /**
   * Delete a file
   */
  async delete(fileId) {
    return apiClient.delete(`/files/${fileId}`);
  }
};

