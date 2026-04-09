import api from './api.js';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async getPendingParkings() {
    const response = await api.get('/admin/parkings/pending');
    return response.data;
  },

  async approveParking(id) {
    const response = await api.patch(`/admin/parkings/${id}/approve`);
    return response.data;
  },

  async rejectParking(id) {
    const response = await api.delete(`/admin/parkings/${id}/reject`);
    return response.data;
  }
};
