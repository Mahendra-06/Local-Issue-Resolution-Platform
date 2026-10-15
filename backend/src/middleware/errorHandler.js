import { ApiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Resource not found with identifier: ${err.value}`, 404);
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return ApiResponse.error(res, `A record with ${field} '${value}' already exists.`, 409);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.error(res, errors[0]?.message || 'Database validation failed', 400, errors);
  }

  // Multer Error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.error(res, `File upload exceeds the maximum allowed limit of ${env.MAX_FILE_SIZE_MB}MB.`, 400);
    }
    return ApiResponse.error(res, `Upload error: ${err.message}`, 400);
  }

  // General Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  return ApiResponse.error(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};
