const { AppError } = require('./errorHandler');

function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      const details = err.errors ? err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      })) : [{ message: err.message }];

      next(new AppError('Invalid request payload', 400, 'VALIDATION_ERROR', details));
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed;
      next();
    } catch (err) {
      const details = err.errors ? err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      })) : [{ message: err.message }];

      next(new AppError('Invalid query parameters', 400, 'VALIDATION_ERROR', details));
    }
  };
}

module.exports = {
  validateBody,
  validateQuery
};
