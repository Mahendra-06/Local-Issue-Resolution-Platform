import { apiClient } from './client';

export const auditService = {
  async getAuditLogs(params = {}) {
    return await apiClient.get('/audit-logs', params);
  },

  async getAuditLogById(id) {
    return await apiClient.get(`/audit-logs/${id}`);
  },
};
