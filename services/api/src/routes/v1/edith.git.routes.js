const express = require('express');
const edithGitController = require('../../controllers/edith.git.controller');
const { validateBody } = require('../../middleware/validator');
const {
  createBranchSchema,
  checkoutBranchSchema,
  stageSchema,
  unstageSchema,
  commitSchema
} = require('../../validators/edith.git.validator');

const router = express.Router();

router.get('/status', edithGitController.getStatus);
router.get('/branches', edithGitController.getBranches);
router.post('/branches', validateBody(createBranchSchema), edithGitController.createBranch);
router.post('/checkout', validateBody(checkoutBranchSchema), edithGitController.checkoutBranch);
router.post('/stage', validateBody(stageSchema), edithGitController.stage);
router.post('/unstage', validateBody(unstageSchema), edithGitController.unstage);
router.post('/commit', validateBody(commitSchema), edithGitController.commit);
router.get('/diff', edithGitController.getDiff);
router.get('/log', edithGitController.getLog);

module.exports = router;

