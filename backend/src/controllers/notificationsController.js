import { notificationService } from '../services/notificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const notificationsController = {
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user._id, req.query);
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

  async markAsRead(req, res, next) {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user._id);
      return ApiResponse.success(res, updated, 'Notification marked as read', 200);
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, result, 'All notifications marked as read', 200);
    } catch (error) {
      next(error);
    }
  },
};
