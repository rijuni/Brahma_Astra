const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const requestIdMiddleware = require('./middleware/requestId');
const requestLoggerMiddleware = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandlerMiddleware, AppError } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health.routes');
const v1Routes = require('./routes/v1');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Internal-Service-Key']
}));

// Request Tracking & Logging
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Body Parsing with sensible limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check Routes (unthrottled)
app.use('/health', healthRoutes);

// Apply rate limiting to API routes
app.use(env.API_PREFIX, apiLimiter, v1Routes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Centralized Error Handler
app.use(errorHandlerMiddleware);

module.exports = app;
