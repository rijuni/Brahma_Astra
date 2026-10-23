const { z } = require('zod');

const createConversationSchema = z.object({
  title: z.string().max(200).optional(),
  projectId: z.string().uuid().nullable().optional()
});

const addMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(50000),
  role: z.enum(['user', 'assistant', 'system']).default('user')
});

module.exports = {
  createConversationSchema,
  addMessageSchema
};
