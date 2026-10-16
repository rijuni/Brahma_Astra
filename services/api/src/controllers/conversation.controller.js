const conversationService = require('../services/conversation.service');

class ConversationController {
  async create(req, res, next) {
    try {
      const { title, projectId } = req.body;
      const conversation = await conversationService.createConversation({
        title,
        projectId,
        userId: req.user.id
      });
      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const { projectId } = req.query;
      const conversations = await conversationService.listConversations(req.user.id, projectId);
      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const conversation = await conversationService.getConversation(req.params.conversationId, req.user.id);
      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (err) {
      next(err);
    }
  }

  async addMessage(req, res, next) {
    try {
      const { content, role } = req.body;
      const message = await conversationService.addMessage(
        req.params.conversationId,
        req.user.id,
        { content, role }
      );
      res.status(201).json({
        success: true,
        data: message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ConversationController();
