import { apiClient } from '../../../services/apiClient.js';

export const financeiroService = {
  async getSummary(filters = {}) {
    const { data } = await apiClient.get('/financial/summary', { params: filters });
    return data;
  },

  async getTransactions(filters = {}) {
    const { data } = await apiClient.get('/financial/transactions', {
      params: { ...filters, limit: 200 },
    });
    return data;
  },

  async getSupportData() {
    const { data } = await apiClient.get('/financial/support-data');
    return data;
  },

  async createTransaction(payload) {
    const { data } = await apiClient.post('/financial/transactions', payload);
    return data;
  },

  async deleteTransaction(id) {
    const { data } = await apiClient.delete(`/financial/transactions/${id}`);
    return data;
  },
};
