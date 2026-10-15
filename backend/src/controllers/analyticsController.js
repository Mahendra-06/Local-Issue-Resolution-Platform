import { analyticsService } from '../services/analyticsService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const analyticsController = {
  async getPlatformOverview(req, res, next) {
    try {
      const overview = await analyticsService.getPlatformOverview();
      return ApiResponse.success(res, overview, 'Platform overview metrics retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async getManagerMetrics(req, res, next) {
    try {
      const metrics = await analyticsService.getManagerMetrics(req.query.departmentId);
      return ApiResponse.success(res, metrics, 'Manager operational metrics retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async getResolutionTrends(req, res, next) {
    try {
      const trends = await analyticsService.getResolutionTrends(req.query.timeframe || '30d');
      return ApiResponse.success(res, trends, 'Resolution trends retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async getCategoryDistribution(req, res, next) {
    try {
      const distribution = await analyticsService.getCategoryDistribution();
      return ApiResponse.success(res, distribution, 'Category distribution retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async getDepartmentPerformance(req, res, next) {
    try {
      const performance = await analyticsService.getDepartmentPerformance();
      return ApiResponse.success(res, performance, 'Department performance metrics retrieved', 200);
    } catch (error) {
      next(error);
    }
  },
};
