const { z } = require('zod');

const createBranchSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  branchName: z.string().min(1, 'branchName is required').max(100),
  checkout: z.boolean().optional().default(false)
});

const checkoutBranchSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  branchName: z.string().min(1, 'branchName is required').max(100)
});

const stageSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  files: z.array(z.string().min(1)).optional(),
  all: z.boolean().optional().default(false)
}).refine((data) => data.all === true || (Array.isArray(data.files) && data.files.length > 0), {
  message: 'Must specify files array or set all: true'
});

const unstageSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  files: z.array(z.string().min(1)).optional(),
  all: z.boolean().optional().default(false)
}).refine((data) => data.all === true || (Array.isArray(data.files) && data.files.length > 0), {
  message: 'Must specify files array or set all: true'
});

const commitSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  message: z.string().min(1, 'Commit message cannot be empty').max(2000),
  confirmed: z.literal(true, {
    errorMap: () => ({ message: 'Commit requires explicit user confirmation (confirmed: true)' })
  })
});

module.exports = {
  createBranchSchema,
  checkoutBranchSchema,
  stageSchema,
  unstageSchema,
  commitSchema
};

