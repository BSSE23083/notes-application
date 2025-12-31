const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = err.error || 'InternalError';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'ValidationError';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    error = 'NotFound';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    error = 'Unauthorized';
  }

  res.status(statusCode).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
