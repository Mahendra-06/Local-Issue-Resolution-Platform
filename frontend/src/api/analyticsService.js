import { apiClient } from './client';

export const analyticsService = {
  // Platform-wide metrics for Administrator
  async getPlatformOverview() {
    return await apiClient.get('/analytics/overview');
  },

  // Operational metrics for Department Manager
  async getManagerMetrics(departmentId = null) {
    const params = departmentId ? { departmentId } : {};
    return await apiClient.get('/analytics/manager', params);
  },

  // Incident resolution trend over time
  async getResolutionTrends(timeframe = '30d') {
    return await apiClient.get('/analytics/trends', { timeframe });
  },

  // Distribution by issue category
  async getCategoryDistribution() {
    return await apiClient.get('/analytics/category-distribution');
  },

  // Department workload & resolution rate
  async getDepartmentPerformance() {
    return await apiClient.get('/analytics/department-performance');
  },
};
