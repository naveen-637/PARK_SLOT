import api from './api.js';

export const paymentService = {
  async createOrder(bookingId) {
    const response = await api.post('/payments/create-order', { bookingId });
    return response.data;
  },

  async verify(payload) {
    const response = await api.post('/payments/verify', payload);
    return response.data;
  },

  async getHistory() {
    const response = await api.get('/payments/history');
    return response.data;
  },

  async refund(paymentId) {
    const response = await api.post(`/payments/${paymentId}/refund`);
    return response.data;
  },

  async getInvoice(paymentId) {
    const response = await api.get(`/payments/${paymentId}/invoice`);
    return response.data;
  }
};
