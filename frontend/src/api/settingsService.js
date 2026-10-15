import { apiClient } from './client';

export const settingsService = {
  async getSettings() {
    return await apiClient.get('/settings');
  },

  async updateSettings(settingsData) {
    return await apiClient.put('/settings', settingsData);
  },
};
