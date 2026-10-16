const express = require('express');
const conversationController = require('../../controllers/conversation.controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { createConversationSchema, addMessageSchema } = require('../../validators/conversation.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validateBody(createConversationSchema), conversationController.create);
router.get('/', conversationController.list);
router.get('/:conversationId', conversationController.getById);
router.post('/:conversationId/messages', validateBody(addMessageSchema), conversationController.addMessage);

module.exports = router;
