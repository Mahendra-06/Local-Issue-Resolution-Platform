/**
 * Centralized API response helper
 * Supports both direct object unwrapping and enveloped responses
 */
export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {}),
    });
  }

  static paginated(res, { data, total, page, limit, message = 'Success' }, statusCode = 200) {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: message,
      ...(errors ? { errors } : {}),
    });
  }
}
