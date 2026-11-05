const express = require('express');
const edithController = require('../../controllers/edith.controller');
const edithFsRoutes = require('./edith.fs.routes');
const edithGitRoutes = require('./edith.git.routes');
const edithDbRoutes = require('./edith.db.routes');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { createWorkspaceSchema, createCodingTaskSchema } = require('../../validators/edith.validator');

const router = express.Router();

router.use(authenticate);

// Real Project Filesystem
router.use('/fs', edithFsRoutes);

// Real Git Operations
router.use('/git', edithGitRoutes);

// Real Database Explorer (Read-Only)
router.use('/database', edithDbRoutes);

// Workspaces
router.post('/workspaces', validateBody(createWorkspaceSchema), edithController.createWorkspace);
router.get('/workspaces/:workspaceId', edithController.getWorkspace);

// Coding Tasks
router.post('/tasks', validateBody(createCodingTaskSchema), edithController.createCodingTask);
router.get('/tasks/:taskId', edithController.getCodingTask);
router.post('/tasks/:taskId/approve', edithController.approveCodingTask);
router.post('/tasks/:taskId/cancel', edithController.cancelCodingTask);

module.exports = router;
