const express = require('express');
const auditController = require('../../controllers/audit.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', auditController.list);

module.exports = router;
