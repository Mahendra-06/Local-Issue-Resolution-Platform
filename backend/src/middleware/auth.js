import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication required. No authorization token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return ApiResponse.error(res, 'Authentication token missing or invalid.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return ApiResponse.error(res, 'Your session has expired. Please sign in again.', 401);
      }
      return ApiResponse.error(res, 'Invalid authentication token.', 401);
    }

    const user = await User.findById(decoded.id).select('+passwordHash');
    if (!user) {
      return ApiResponse.error(res, 'User associated with this token no longer exists.', 401);
    }

    if (user.isActive === false) {
      return ApiResponse.error(res, 'Your user account has been deactivated. Please contact platform administration.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, `Authentication error: ${error.message}`, 500);
  }
};
