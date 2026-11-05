import { apiClient } from '../api-client.js';

export const edithDbService = {
  /**
   * Discovers available SQLite databases in the project workspace.
   */
  async getDatabases(projectId) {
    const params = new URLSearchParams({ projectId });
    return apiClient.get(`/edith/database/databases?${params.toString()}`);
  },

  /**
   * Retrieves all tables and views with row counts.
   */
  async getTables(projectId, database = 'default') {
    const params = new URLSearchParams({
      projectId,
      database: database || 'default'
    });
    return apiClient.get(`/edith/database/tables?${params.toString()}`);
  },

  /**
   * Retrieves column schema, foreign keys, and indexes for a table.
   */
  async getTableSchema(projectId, tableName, database = 'default') {
    const params = new URLSearchParams({
      projectId,
      database: database || 'default'
    });
    return apiClient.get(`/edith/database/schema/${encodeURIComponent(tableName)}?${params.toString()}`);
  },

  /**
   * Retrieves paginated records for a table.
   */
  async getTableRecords(projectId, tableName, page = 1, limit = 50, database = 'default') {
    const params = new URLSearchParams({
      projectId,
      database: database || 'default',
      page: String(page),
      limit: String(limit)
    });
    return apiClient.get(`/edith/database/records/${encodeURIComponent(tableName)}?${params.toString()}`);
  },

  /**
   * Executes a validated read-only SQL query with timing.
   */
  async executeQuery(projectId, sql, database = 'default', limit = 100) {
    return apiClient.post('/edith/database/query', {
      projectId,
      database: database || 'default',
      sql,
      limit
    });
  }
};

