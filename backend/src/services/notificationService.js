import { Notification } from '../models/Notification.js';

export const notificationService = {
  async createNotification({ userId, title, message, type = 'status_change', incidentId = null, referenceId = '' }) {
    try {
      return await Notification.create({
        userId,
        title,
        message,
        type,
        incidentId,
        referenceId,
        isRead: false,
      });
    } catch (err) {
      console.warn('[NotificationService] Failed to create notification:', err.message);
      return null;
    }
  },

  async getUserNotifications(userId, { limit = 30, page = 1 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments({ userId });
    return {
      data: notifications.map((n) => n.toJSON()),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      const error = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }
    return notification.toJSON();
  },

  async markAllAsRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { success: true, message: 'All notifications marked as read.' };
  },
};
