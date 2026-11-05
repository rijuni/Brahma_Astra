const { z } = require('zod');

const executeQuerySchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  database: z.string().optional().default('default'),
  sql: z.string().min(1, 'SQL query cannot be empty').max(10000),
  limit: z.number().int().min(1).max(500).optional().default(100)
});

const getTablesQuerySchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  database: z.string().optional().default('default')
});

const getTableSchemaQuerySchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  database: z.string().optional().default('default'),
  table: z.string().min(1, 'table name is required')
});

const getTableRecordsQuerySchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  database: z.string().optional().default('default'),
  table: z.string().min(1, 'table name is required'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50)
});

module.exports = {
  executeQuerySchema,
  getTablesQuerySchema,
  getTableSchemaQuerySchema,
  getTableRecordsQuerySchema
};

