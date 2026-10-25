/**
 * Centralized error handler middleware for Express.
 * Formats errors consistently as JSON with appropriate HTTP status codes.
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('⚠️ [API Error]:', err);
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with id of '${err.value}'`;
    return res.status(404).json({
      success: false,
      error: message
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `A record with ${field} '${value}' already exists.`;
    return res.status(409).json({
      success: false,
      error: message,
      field
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: message.length === 1 ? message[0] : message,
      details: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    });
  }

  // Malformed JSON payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload received.'
    });
  }

  // Default server response
  const statusCode = error.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Server Internal Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Route Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export default errorHandler;
