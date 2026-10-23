// Centralized API Client for BRAHMA

class ApiClient {
  constructor() {
    this.baseUrl = (typeof process !== 'undefined' && process.env?.VITE_API_URL) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api/v1';
    this.onUnauthorized = null;
    this.memoryToken = null;
  }

  setUnauthorizedHandler(handler) {
    this.onUnauthorized = handler;
  }

  getToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('brahma_token');
    }
    return this.memoryToken;
  }

  setToken(token) {
    this.memoryToken = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('brahma_token', token);
      } else {
        localStorage.removeItem('brahma_token');
      }
    }
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401 && this.onUnauthorized) {
          this.setToken(null);
          this.onUnauthorized();
        }

        const errorMessage = (data && data.error && data.error.message) || (data && data.message) || response.statusText;
        const errorCode = (data && data.error && data.error.code) || 'API_ERROR';

        const error = new Error(errorMessage);
        error.status = response.status;
        error.code = errorCode;
        error.data = data;
        throw error;
      }

      return data?.data !== undefined ? data.data : data;
    } catch (err) {
      if (err.status) {
        throw err;
      }
      const networkError = new Error(err.message || 'Network request failed. Ensure backend services are running.');
      networkError.status = 0;
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
