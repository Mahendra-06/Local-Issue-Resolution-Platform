import { apiClient } from './client';

export const departmentsService = {
  async getDepartments(params = {}) {
    return await apiClient.get('/departments', params);
  },

  async getDepartmentById(id) {
    return await apiClient.get(`/departments/${id}`);
  },

  async createDepartment(data) {
    return await apiClient.post('/departments', data);
  },

  async updateDepartment(id, data) {
    return await apiClient.put(`/departments/${id}`, data);
  },

  async deleteDepartment(id) {
    return await apiClient.delete(`/departments/${id}`);
  },

  async getDepartmentStaff(departmentId) {
    return await apiClient.get(`/departments/${departmentId}/staff`);
  },
};
