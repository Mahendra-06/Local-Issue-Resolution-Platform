import { apiClient } from './client';

export const notificationsService = {
  async getNotifications(params = {}) {
    return await apiClient.get('/notifications', params);
  },

  async markAsRead(notificationId) {
    return await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead() {
    return await apiClient.post('/notifications/read-all');
  },
};
