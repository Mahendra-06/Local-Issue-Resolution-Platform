import { apiClient } from './client';

export const assignmentsService = {
  // Field Staff: View assigned tasks
  async getStaffTasks(params = {}) {
    return await apiClient.get('/assignments/my-tasks', params);
  },

  // Task details
  async getTaskById(taskId) {
    return await apiClient.get(`/assignments/${taskId}`);
  },

  // Manager: Assign work to staff member
  async assignTask({ incidentId, staffId, instructions, dueDate, priority }) {
    return await apiClient.post('/assignments', {
      incidentId,
      staffId,
      instructions,
      dueDate,
      priority,
    });
  },

  // Manager: Reassign work
  async reassignTask(assignmentId, { staffId, instructions, dueDate, reason }) {
    return await apiClient.patch(`/assignments/${assignmentId}/reassign`, {
      staffId,
      instructions,
      dueDate,
      reason,
    });
  },

  // Staff: Update task progress (e.g. moving from assigned to in_progress, adding work log)
  async updateProgress(assignmentId, { status, notes }) {
    return await apiClient.patch(`/assignments/${assignmentId}/progress`, {
      status,
      notes,
    });
  },

  // Staff: Upload completion evidence and submit for manager verification
  async submitForVerification(assignmentId, { notes, evidenceUrls = [], completionTime }) {
    return await apiClient.post(`/assignments/${assignmentId}/submit-verification`, {
      notes,
      evidenceUrls,
      completionTime: completionTime || new Date().toISOString(),
    });
  },

  // Staff: Upload evidence photo
  async uploadEvidencePhoto(file) {
    const formData = new FormData();
    formData.append('evidence', file);
    return await apiClient.upload('/assignments/upload-evidence', formData);
  },

  // Manager: Get verification queue
  async getVerificationQueue(params = {}) {
    return await apiClient.get('/assignments/verification-queue', params);
  },

  // Manager: Verify resolution or reopen
  async verifyResolution(assignmentId, { approved, notes, reopenReason, newDueDate }) {
    return await apiClient.post(`/assignments/${assignmentId}/verify`, {
      approved,
      notes,
      reopenReason,
      newDueDate,
    });
  },
};
