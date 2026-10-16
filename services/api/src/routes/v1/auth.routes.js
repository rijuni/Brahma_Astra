const express = require('express');
const authController = require('../../controllers/auth.controller');
const { authenticate } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validator');
const { registerSchema, loginSchema } = require('../../validators/auth.validator');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
