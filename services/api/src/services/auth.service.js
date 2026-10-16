const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../repositories/prisma');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');
const auditService = require('./audit.service');

class AuthService {
  async register({ email, password, name, ipAddress = null }) {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'CONFLICT');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        role: 'user'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    const token = this.generateToken(user);

    await auditService.record({
      userId: user.id,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress
    });

    return { user, token };
  }

  async login({ email, password, ipAddress = null }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHENTICATED');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHENTICATED');
    }

    const token = this.generateToken(user);

    // Record session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    await auditService.record({
      userId: user.id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async logout(token, userId) {
    if (token) {
      await prisma.session.deleteMany({
        where: { token }
      });
    }

    await auditService.record({
      userId,
      action: 'USER_LOGOUT',
      resourceType: 'Session'
    });

    return true;
  }

  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();
