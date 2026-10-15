import { apiClient } from './client';

export const reportsService = {
  async getMyReports(params = {}) {
    return await apiClient.get('/reports/my-reports', params);
  },

  async getReportById(id) {
    return await apiClient.get(`/reports/${id}`);
  },

  async createReport(reportData) {
    // Supports JSON payload
    return await apiClient.post('/reports', reportData);
  },

  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);
    return await apiClient.upload('/reports/upload-photo', formData);
  },
};
