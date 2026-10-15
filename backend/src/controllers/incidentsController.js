import { incidentService } from '../services/incidentService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const incidentsController = {
  async getIncidents(req, res, next) {
    try {
      const result = await incidentService.getIncidents(req.query);
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

  async getIncidentById(req, res, next) {
    try {
      const incident = await incidentService.getIncidentById(req.params.id, req.user);
      return ApiResponse.success(res, incident, 'Incident details retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async getPublicIncidents(req, res, next) {
    try {
      const result = await incidentService.getIncidents(req.query);
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

  async updateIncidentStatus(req, res, next) {
    try {
      const updated = await incidentService.updateIncidentStatus(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, updated, 'Incident status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },

  async getIncidentTimeline(req, res, next) {
    try {
      const timeline = await incidentService.getIncidentTimeline(req.params.id);
      return ApiResponse.success(res, timeline, 'Timeline milestones retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  },
};
