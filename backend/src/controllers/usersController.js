import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const usersController = {
  async getUsers(req, res, next) {
    try {
      const { search, role, page = 1, limit = 20 } = req.query;
      const query = {};

      if (role) {
        query.role = role.toLowerCase();
      }

      if (search) {
        const s = search.trim();
        query.$or = [
          { name: new RegExp(s, 'i') },
          { email: new RegExp(s, 'i') },
          { phone: new RegExp(s, 'i') },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        User.countDocuments(query),
      ]);

      return ApiResponse.paginated(res, {
        data: users.map((u) => u.toJSON()),
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }
      return ApiResponse.success(res, user.toJSON(), 'User retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async createUser(req, res, next) {
    try {
      const { name, email, password, role, departmentId, phone } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return ApiResponse.error(res, 'An account with this email address already exists.', 409);
      }

      let departmentName = '';
      if (departmentId) {
        const dept = await Department.findById(departmentId);
        if (dept) departmentName = dept.name;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        departmentId: departmentId || null,
        departmentName,
        phone: phone ? phone.trim() : '',
        isActive: true,
      });

      await logAuditEvent({
        action: 'USER_CREATED_BY_ADMIN',
        entityType: 'user',
        targetId: user._id.toString(),
        actor: req.user,
        details: `Administrator created user: ${user.name} (${user.email}) as role ${user.role}`,
        req,
      });

      return ApiResponse.success(res, user.toJSON(), 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const previousRole = user.role;
      user.role = role;
      await user.save();

      await logAuditEvent({
        action: 'USER_ROLE_CHANGED',
        entityType: 'user',
        targetId: user._id.toString(),
        actor: req.user,
        details: `User ${user.email} role changed from ${previousRole} to ${role}`,
        req,
      });

      return ApiResponse.success(res, user.toJSON(), 'User role updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async toggleUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      user.isActive = Boolean(isActive);
      await user.save();

      await logAuditEvent({
        action: 'USER_STATUS_TOGGLED',
        entityType: 'user',
        targetId: user._id.toString(),
        actor: req.user,
        details: `User ${user.email} status set to ${user.isActive ? 'Active' : 'Deactivated'}`,
        req,
      });

      return ApiResponse.success(res, user.toJSON(), 'User status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      await logAuditEvent({
        action: 'USER_DELETED',
        entityType: 'user',
        targetId: user._id.toString(),
        actor: req.user,
        details: `Deleted user: ${user.email}`,
        req,
      });

      return ApiResponse.success(res, null, 'User deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  },
};
