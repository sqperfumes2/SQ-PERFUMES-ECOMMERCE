const { ZodError } = require('zod');
const { ApiError } = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.flatten();
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map((e) => e.message);
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value';
    details = err.keyValue;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: process.env.NODE_ENV === 'production' && statusCode === 500 ? null : details,
  });
}

module.exports = { notFoundHandler, errorHandler };
