import { Setting } from '../models/Setting.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const settingsController = {
  async getSettings(req, res, next) {
    try {
      let settings = await Setting.findOne({ key: 'platform_settings' });
      if (!settings) {
        settings = await Setting.create({
          key: 'platform_settings',
          slaWarningThresholdHours: 6,
          autoAssignEnabled: false,
          emailNotifications: true,
          publicExplorerEnabled: true,
        });
      }
      return ApiResponse.success(res, settings.toJSON(), 'Platform settings retrieved', 200);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      let settings = await Setting.findOneAndUpdate(
        { key: 'platform_settings' },
        req.body,
        { new: true, upsert: true, runValidators: true }
      );

      await logAuditEvent({
        action: 'PLATFORM_SETTINGS_UPDATED',
        entityType: 'settings',
        targetId: settings._id.toString(),
        actor: req.user,
        details: `Platform operational settings updated`,
        req,
      });

      return ApiResponse.success(res, settings.toJSON(), 'Platform settings updated successfully', 200);
    } catch (error) {
      next(error);
    }
  },
};
