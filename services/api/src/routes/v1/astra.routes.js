const express = require('express');
const astraController = require('../../controllers/astra.controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { createWorkspaceSchema, createCodingTaskSchema } = require('../../validators/astra.validator');

const router = express.Router();

router.use(authenticate);

// Workspaces
router.post('/workspaces', validateBody(createWorkspaceSchema), astraController.createWorkspace);
router.get('/workspaces/:workspaceId', astraController.getWorkspace);

// Coding Tasks
router.post('/tasks', validateBody(createCodingTaskSchema), astraController.createCodingTask);
router.get('/tasks/:taskId', astraController.getCodingTask);
router.post('/tasks/:taskId/approve', astraController.approveCodingTask);
router.post('/tasks/:taskId/cancel', astraController.cancelCodingTask);

module.exports = router;
