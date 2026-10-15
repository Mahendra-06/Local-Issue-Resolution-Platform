import { apiClient } from './client';

export const usersService = {
  async getUsers(params = {}) {
    return await apiClient.get('/users', params);
  },

  async getUserById(id) {
    return await apiClient.get(`/users/${id}`);
  },

  async createUser(userData) {
    return await apiClient.post('/users', userData);
  },

  async updateUserRole(id, role) {
    return await apiClient.patch(`/users/${id}/role`, { role });
  },

  async toggleUserStatus(id, isActive) {
    return await apiClient.patch(`/users/${id}/status`, { isActive });
  },

  async deleteUser(id) {
    return await apiClient.delete(`/users/${id}`);
  },
};
