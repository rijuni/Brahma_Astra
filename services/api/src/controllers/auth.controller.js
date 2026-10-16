const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register({
        email,
        password,
        name,
        ipAddress: req.ip
      });
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({
        email,
        password,
        ipAddress: req.ip
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.substring(7).trim() : null;
      await authService.logout(token, req.user ? req.user.id : null);
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' }
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
