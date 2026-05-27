import { apiClient } from '../../../services/apiClient.js';

export async function getSettings() {
  const { data } = await apiClient.get('/settings');
  return data;
}

export async function saveSettings(payload) {
  const { data } = await apiClient.post('/settings', payload);
  return data;
}

export async function listUsers() {
  const { data } = await apiClient.get('/users/list');
  return data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users/create', payload);
  return data;
}

export async function updateUserRole(userId, role) {
  const { data } = await apiClient.patch('/users/role', { userId, role });
  return data;
}

export async function resetUserPassword(userId, password) {
  const { data } = await apiClient.patch('/users/password', { userId, password });
  return data;
}

export async function listAuditLogs() {
  const { data } = await apiClient.get('/users/audit');
  return data;
}
