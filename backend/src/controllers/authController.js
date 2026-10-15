import { authService } from '../services/authService.js';
import { Department } from '../models/Department.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body, req);
      return ApiResponse.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async registerStaff(req, res, next) {
    try {
      const result = await authService.registerStaff(req.body, req);
      return ApiResponse.success(res, result, 'Staff account provisioned and registered successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async registerManager(req, res, next) {
    try {
      const result = await authService.registerManager(req.body, req);
      return ApiResponse.success(res, result, 'Department manager registered successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async registerAdmin(req, res, next) {
    try {
      await logAuditEvent({
        action: 'PUBLIC_ADMIN_REGISTRATION_ATTEMPT_BLOCKED',
        entityType: 'auth',
        targetId: 'admin_registration',
        actor: null,
        details: `Blocked unauthorized public administrator registration attempt from IP: ${req.ip || 'unknown'}`,
        req,
      });

      return ApiResponse.error(
        res,
        'Public administrator registration is prohibited. Administrator accounts must be provisioned through secure system operations or deployment commands.',
        403
      );
    } catch (error) {
      next(error);
    }
  },

  async getPublicDepartments(req, res, next) {
    try {
      const departments = await Department.find({ isActive: true }).select('name code description serviceArea').sort({ name: 1 });
      return ApiResponse.success(res, { departments }, 'Public departments list retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body, req);
      return ApiResponse.success(res, result, 'Sign in successful', 200);
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = req.user.toJSON();
      return ApiResponse.success(res, { user }, 'Profile retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user._id, req.body, req);
      return ApiResponse.success(res, { user: updatedUser }, 'Profile updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      if (req.user) {
        await logAuditEvent({
          action: 'USER_LOGOUT',
          entityType: 'auth',
          targetId: req.user._id.toString(),
          actor: req.user,
          details: `User ${req.user.email} signed out`,
          req,
        });
      }
      return ApiResponse.success(res, null, 'Signed out successfully', 200);
    } catch (error) {
      next(error);
    }
  },
};
