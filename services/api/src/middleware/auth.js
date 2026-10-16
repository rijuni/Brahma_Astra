const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../repositories/prisma');
const { AppError } = require('./errorHandler');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401, 'UNAUTHENTICATED');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new AppError('Invalid token format', 401, 'UNAUTHENTICATED');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Authentication token has expired', 401, 'UNAUTHENTICATED');
      }
      throw new AppError('Invalid authentication token', 401, 'UNAUTHENTICATED');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401, 'UNAUTHENTICATED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError('Forbidden: insufficient permissions', 403, 'FORBIDDEN'));
    }
    next();
  };
}

function requireInternalService(req, res, next) {
  const serviceKey = req.headers['x-internal-service-key'];
  if (!serviceKey || serviceKey !== env.INTERNAL_SERVICE_KEY) {
    return next(new AppError('Forbidden: Invalid internal service authentication key', 403, 'FORBIDDEN'));
  }
  next();
}

module.exports = {
  authenticate,
  requireRole,
  requireInternalService
};
