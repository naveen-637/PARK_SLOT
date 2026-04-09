import api from './api.js';

export const parkingService = {
  async getAllParking(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        }
        return;
      }

      params.set(key, String(value));
    });

    const response = await api.get(`/parking?${params}`);
    return response.data;
  },

  async getParkingById(id) {
    const response = await api.get(`/parking/${id}`);
    return response.data;
  },

  async createParking(parkingData) {
    const response = await api.post('/parking', parkingData);
    return response.data;
  },

  async getMyParkings() {
    const response = await api.get('/parking/owner/mine');
    return response.data;
  },

  async updateParking(id, parkingData) {
    const response = await api.put(`/parking/${id}`, parkingData);
    return response.data;
  },

  async deleteParking(id) {
    const response = await api.delete(`/parking/${id}`);
    return response.data;
  },

  async uploadImages(parkingId, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await api.post(`/parking/${parkingId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async addReview(parkingId, payload) {
    const response = await api.post(`/parking/${parkingId}/reviews`, payload);
    return response.data;
  },

  async getReviews(parkingId) {
    const response = await api.get(`/parking/${parkingId}/reviews`);
    return response.data;
  }
};
