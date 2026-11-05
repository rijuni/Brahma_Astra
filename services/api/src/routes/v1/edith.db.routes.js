const express = require('express');
const edithDbController = require('../../controllers/edith.db.controller');
const { validateBody } = require('../../middleware/validator');
const { executeQuerySchema } = require('../../validators/edith.db.validator');

const router = express.Router();

router.get('/databases', edithDbController.getDatabases);
router.get('/tables', edithDbController.getTables);
router.get('/schema/:table', edithDbController.getTableSchema);
router.get('/records/:table', edithDbController.getTableRecords);
router.post('/query', validateBody(executeQuerySchema), edithDbController.executeQuery);

module.exports = router;

