const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional()
});

module.exports = {
  createProjectSchema,
  updateProjectSchema
};
