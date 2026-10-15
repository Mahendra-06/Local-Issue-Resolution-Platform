import { incidentService } from '../services/incidentService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const reportsController = {
  async getMyReports(req, res, next) {
    try {
      const result = await incidentService.getMyReports(req.user._id, req.query);
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

  async getReportById(req, res, next) {
    try {
      const report = await incidentService.getIncidentById(req.params.id, req.user);
      return ApiResponse.success(res, report, 'Report retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async createReport(req, res, next) {
    try {
      const report = await incidentService.createReport(req.user, req.body, req);
      return ApiResponse.success(res, report, 'Report registered successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No photo image provided in upload request.', 400);
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
        'Photo uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  },
};
