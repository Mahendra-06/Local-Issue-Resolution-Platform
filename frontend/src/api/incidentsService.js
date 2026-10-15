import { apiClient } from './client';

export const incidentsService = {
  async getIncidents(params = {}) {
    return await apiClient.get('/incidents', params);
  },

  async getIncidentById(id) {
    return await apiClient.get(`/incidents/${id}`);
  },

  async getPublicIncidents(params = {}) {
    return await apiClient.get('/incidents/public', params);
  },

  async updateIncidentStatus(id, { status, notes, priority }) {
    return await apiClient.patch(`/incidents/${id}/status`, {
      status,
      notes,
      priority,
    });
  },

  async getIncidentTimeline(id) {
    return await apiClient.get(`/incidents/${id}/timeline`);
  },
};
