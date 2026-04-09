import api from './api.js';

export const bookingService = {
  async getMyBookings() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getOwnerBookings() {
    const response = await api.get('/bookings/owner');
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  async updateBooking(id, bookingData) {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  async checkAvailability(parkingId, checkInTime, checkOutTime, slotNumber) {
    const response = await api.post('/bookings/check-availability', {
      parkingId,
      checkInTime,
      checkOutTime,
      ...(slotNumber ? { slotNumber } : {})
    });
    return response.data;
  },

  async getBookingHistory() {
    const response = await api.get('/bookings/history');
    return response.data;
  }
};
