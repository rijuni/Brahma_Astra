const express = require('express');
const projectController = require('../../controllers/project.controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { createProjectSchema, updateProjectSchema } = require('../../validators/project.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validateBody(createProjectSchema), projectController.create);
router.get('/', projectController.list);
router.get('/:projectId', projectController.getById);
router.patch('/:projectId', validateBody(updateProjectSchema), projectController.update);
router.delete('/:projectId', projectController.delete);

module.exports = router;
