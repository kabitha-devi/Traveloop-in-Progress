const { sendError } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error(`❌ [${req.method} ${req.path}]`, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }
  if (err.code === 'P2003') {
    return sendError(res, 'Related record not found', 400);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return sendError(res, 'Validation failed', 400, details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication failed', 401);
  }

  // Custom AppError
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // Fallback
  return sendError(res, 'Internal server error', 500);
}

module.exports = errorHandler;
