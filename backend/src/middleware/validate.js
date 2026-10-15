import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Zod validation middleware
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return ApiResponse.error(res, formattedErrors[0]?.message || 'Validation error', 400, formattedErrors);
    }
    return ApiResponse.error(res, error.message, 400);
  }
};
