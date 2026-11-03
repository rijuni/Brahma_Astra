const express = require('express');
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const conversationRoutes = require('./conversation.routes');
const aiRoutes = require('./ai.routes');
const edithRoutes = require('./edith.routes');
const auditRoutes = require('./audit.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/conversations', conversationRoutes);
router.use('/ai', aiRoutes);
router.use('/edith', edithRoutes);
router.use('/astra', edithRoutes); // Backwards-compatible alias
router.use('/audit', auditRoutes);

module.exports = router;
