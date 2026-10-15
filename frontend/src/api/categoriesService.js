import { apiClient } from './client';

export const categoriesService = {
  async getCategories() {
    return await apiClient.get('/categories');
  },

  async getCategoryById(id) {
    return await apiClient.get(`/categories/${id}`);
  },

  async createCategory(categoryData) {
    return await apiClient.post('/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return await apiClient.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id) {
    return await apiClient.delete(`/categories/${id}`);
  },
};
