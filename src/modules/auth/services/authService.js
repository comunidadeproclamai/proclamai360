import { apiClient } from '../../../services/apiClient.js';

export async function login(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/users/me');
  return data.user;
}
