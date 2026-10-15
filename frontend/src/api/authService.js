import { apiClient } from './client';

export const authService = {
  async login({ email, password, requestedRole }) {
    return await apiClient.post('/auth/login', {
      email,
      password,
      requestedRole,
    });
  },

  async register(registrationData) {
    return await apiClient.post('/auth/register', registrationData);
  },

  async registerCitizen(data) {
    return await apiClient.post('/auth/citizen/register', data);
  },

  async registerStaff(data) {
    return await apiClient.post('/auth/staff/register', data);
  },

  async registerManager(data) {
    return await apiClient.post('/auth/manager/register', data);
  },

  async registerAdmin(data) {
    return await apiClient.post('/auth/admin/register', data);
  },

  async getPublicDepartments() {
    return await apiClient.get('/auth/departments');
  },

  async getCurrentUser() {
    return await apiClient.get('/auth/me');
  },

  async updateProfile(profileData) {
    return await apiClient.put('/auth/profile', profileData);
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Local session termination proceeds regardless
    } finally {
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_user');
    }
  },
};
