import { apiClient } from '../../../services/apiClient.js';

export const infantilService = {
  async listLive() {
    const { data } = await apiClient.get('/infantil/live');
    return data;
  },

  async listChildren() {
    const { data } = await apiClient.get('/infantil/children');
    return data;
  },

  async listHistory(limit = 20) {
    const { data } = await apiClient.get(`/infantil/history?limit=${limit}`);
    return data;
  },

  async listGuardians() {
    const { data } = await apiClient.get('/infantil/guardians');
    return data;
  },

  async createGuardian(payload) {
    const { data } = await apiClient.post('/infantil/guardians', payload);
    return data;
  },

  async createChild(payload) {
    const { data } = await apiClient.post('/infantil/children', payload);
    return data;
  },

  async checkin(payload) {
    const { data } = await apiClient.post('/infantil/checkin', payload);
    return data;
  },

  async checkout(id, securityCode) {
    const { data } = await apiClient.patch('/infantil/checkin', { id, securityCode });
    return data;
  },
};
