import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const departmentsController = {
  async getDepartments(req, res, next) {
    try {
      const departments = await Department.find().sort({ name: 1 });
      return ApiResponse.success(res, departments.map((d) => d.toJSON()), 'Departments retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async getDepartmentById(req, res, next) {
    try {
      const department = await Department.findById(req.params.id);
      if (!department) {
        return ApiResponse.error(res, 'Department not found', 404);
      }
      return ApiResponse.success(res, department.toJSON(), 'Department retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async createDepartment(req, res, next) {
    try {
      const department = await Department.create(req.body);

      await logAuditEvent({
        action: 'DEPARTMENT_CREATED',
        entityType: 'department',
        targetId: department._id.toString(),
        actor: req.user,
        details: `Created department: ${department.name}`,
        req,
      });

      return ApiResponse.success(res, department.toJSON(), 'Department created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateDepartment(req, res, next) {
    try {
      const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!department) {
        return ApiResponse.error(res, 'Department not found', 404);
      }

      await logAuditEvent({
        action: 'DEPARTMENT_UPDATED',
        entityType: 'department',
        targetId: department._id.toString(),
        actor: req.user,
        details: `Updated department: ${department.name}`,
        req,
      });

      return ApiResponse.success(res, department.toJSON(), 'Department updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async deleteDepartment(req, res, next) {
    try {
      const department = await Department.findByIdAndDelete(req.params.id);
      if (!department) {
        return ApiResponse.error(res, 'Department not found', 404);
      }

      await logAuditEvent({
        action: 'DEPARTMENT_DELETED',
        entityType: 'department',
        targetId: department._id.toString(),
        actor: req.user,
        details: `Deleted department: ${department.name}`,
        req,
      });

      return ApiResponse.success(res, null, 'Department deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async getDepartmentStaff(req, res, next) {
    try {
      const staff = await User.find({
        role: 'staff',
        $or: [{ departmentId: req.params.departmentId }],
      }).sort({ name: 1 });

      return ApiResponse.success(res, staff.map((s) => s.toJSON()), 'Staff retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  },
};
