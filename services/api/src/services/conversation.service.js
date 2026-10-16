const prisma = require('../repositories/prisma');
const { AppError } = require('../middleware/errorHandler');

class ConversationService {
  async createConversation({ title, projectId = null, userId }) {
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
      });
      if (!project) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
      }
      const hasAccess = project.ownerId === userId || project.members.some(m => m.userId === userId);
      if (!hasAccess) {
        throw new AppError('Forbidden: Access to this project is denied', 403, 'FORBIDDEN');
      }
    }

    return await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        projectId: projectId || null,
        userId
      }
    });
  }

  async listConversations(userId, projectId = null) {
    const where = { userId };
    if (projectId) {
      where.projectId = projectId;
    }
    return await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  async getConversation(conversationId, userId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    if (conversation.userId !== userId) {
      throw new AppError('Forbidden: Access to this conversation is denied', 403, 'FORBIDDEN');
    }

    return conversation;
  }

  async addMessage(conversationId, userId, { role = 'user', content }) {
    await this.getConversation(conversationId, userId);

    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }
}

module.exports = new ConversationService();
