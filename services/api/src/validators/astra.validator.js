const { z } = require('zod');

const createWorkspaceSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
  name: z.string().min(1, 'Workspace name is required').max(100),
  repositoryUrl: z.string().url('Invalid repository URL').optional().or(z.literal(''))
});

const createCodingTaskSchema = z.object({
  workspaceId: z.string().uuid('Workspace ID must be a valid UUID'),
  title: z.string().max(200).optional(),
  instruction: z.string().min(1, 'Coding instruction cannot be empty').max(50000)
});

module.exports = {
  createWorkspaceSchema,
  createCodingTaskSchema
};
