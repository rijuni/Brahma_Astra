const express = require('express');
const aiController = require('../../controllers/ai.controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { createAiTaskSchema } = require('../../validators/ai.validator');

const router = express.Router();

router.use(authenticate);

router.post('/tasks', validateBody(createAiTaskSchema), aiController.createTask);
router.get('/tasks', aiController.listTasks);
router.get('/tasks/:taskId', aiController.getTask);
router.post('/tasks/:taskId/cancel', aiController.cancelTask);

module.exports = router;
