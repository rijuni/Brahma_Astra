const express = require('express');
const edithController = require('../../controllers/edith.controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { createWorkspaceSchema, createCodingTaskSchema } = require('../../validators/edith.validator');

const router = express.Router();

router.use(authenticate);

// Workspaces
router.post('/workspaces', validateBody(createWorkspaceSchema), edithController.createWorkspace);
router.get('/workspaces/:workspaceId', edithController.getWorkspace);

// Coding Tasks
router.post('/tasks', validateBody(createCodingTaskSchema), edithController.createCodingTask);
router.get('/tasks/:taskId', edithController.getCodingTask);
router.post('/tasks/:taskId/approve', edithController.approveCodingTask);
router.post('/tasks/:taskId/cancel', edithController.cancelCodingTask);

module.exports = router;
