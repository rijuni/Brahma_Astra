const express = require('express');
const edithFsController = require('../../controllers/edith.fs.controller');
const { validateBody } = require('../../middleware/validator');
const {
  registerProjectRootSchema,
  writeFileSchema,
  createItemSchema,
  renameItemSchema,
  deleteItemSchema
} = require('../../validators/edith.fs.validator');

const router = express.Router();

// Operations on project roots & filesystem
router.get('/projects', edithFsController.getProjects);
router.post('/projects', validateBody(registerProjectRootSchema), edithFsController.registerProject);
router.get('/tree', edithFsController.getTree);
router.get('/read', edithFsController.readFile);
router.put('/write', validateBody(writeFileSchema), edithFsController.writeFile);
router.post('/create', validateBody(createItemSchema), edithFsController.createItem);
router.patch('/rename', validateBody(renameItemSchema), edithFsController.renameItem);
router.delete('/delete', validateBody(deleteItemSchema), edithFsController.deleteItem);

module.exports = router;

