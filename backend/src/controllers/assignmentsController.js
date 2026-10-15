import { assignmentService } from '../services/assignmentService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const assignmentsController = {
  async getStaffTasks(req, res, next) {
    try {
      const result = await assignmentService.getStaffTasks(req.user._id, req.query);
      return ApiResponse.paginated(res, {
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req, res, next) {
    try {
      const task = await assignmentService.getTaskById(req.params.taskId);
      return ApiResponse.success(res, task, 'Task assignment details retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async assignTask(req, res, next) {
    try {
      const assignment = await assignmentService.assignTask(req.body, req.user, req);
      return ApiResponse.success(res, assignment, 'Task assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async reassignTask(req, res, next) {
    try {
      const assignment = await assignmentService.reassignTask(req.params.assignmentId, req.body, req.user, req);
      return ApiResponse.success(res, assignment, 'Task reassigned successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async updateProgress(req, res, next) {
    try {
      const updated = await assignmentService.updateProgress(req.params.assignmentId, req.body, req.user, req);
      return ApiResponse.success(res, updated, 'Work progress updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async submitForVerification(req, res, next) {
    try {
      const submitted = await assignmentService.submitForVerification(
        req.params.assignmentId,
        req.body,
        req.user,
        req
      );
      return ApiResponse.success(res, submitted, 'Work submitted for verification successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async uploadEvidencePhoto(req, res, next) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No evidence photo provided in upload request.', 400);
      }

      const fileUrl = `${env.BASE_URL}/uploads/${req.file.filename}`;
      return ApiResponse.success(
        res,
        {
          url: fileUrl,
          photoUrl: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        'Evidence photo uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  },

  async getVerificationQueue(req, res, next) {
    try {
      const result = await assignmentService.getVerificationQueue(req.query);
      return ApiResponse.paginated(res, {
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyResolution(req, res, next) {
    try {
      const result = await assignmentService.verifyResolution(
        req.params.assignmentId,
        req.body,
        req.user,
        req
      );
      return ApiResponse.success(
        res,
        result,
        req.body.approved ? 'Resolution verified and closed.' : 'Resolution rejected and reopened.',
        200
      );
    } catch (error) {
      next(error);
    }
  },
};
