const { z } = require('zod');

const registerProjectRootSchema = z.object({
  projectId: z.string().optional(),
  name: z.string().min(1).max(100).optional(),
  rootPath: z.string().min(1, 'rootPath is required').max(1000)
});

const writeFileSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  path: z.string().min(1, 'path is required'),
  content: z.string()
});

const createItemSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  path: z.string().min(1, 'path is required'),
  type: z.enum(['file', 'directory']).default('file')
});

const renameItemSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  oldPath: z.string().min(1, 'oldPath is required'),
  newPath: z.string().min(1, 'newPath is required')
});

const deleteItemSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  path: z.string().min(1, 'path is required')
});

module.exports = {
  registerProjectRootSchema,
  writeFileSchema,
  createItemSchema,
  renameItemSchema,
  deleteItemSchema
};

