const { z } = require('zod');

const createAiTaskSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(100000),
  conversationId: z.string().uuid().optional(),
  taskType: z.string().default('general'),
  context: z.record(z.any()).optional()
});

module.exports = {
  createAiTaskSchema
};
