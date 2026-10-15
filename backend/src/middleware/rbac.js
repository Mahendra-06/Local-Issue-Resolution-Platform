import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control middleware
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required before verifying permissions.', 401);
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return ApiResponse.error(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${userRole}.`,
        403
      );
    }

    next();
  };
};
