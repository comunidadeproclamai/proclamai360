import axios from 'axios';
import { appConfig } from '../config/appConfig.js';
import { clearStoredToken, getStoredToken } from '../lib/storage.js';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent('proclamai:session-expired'));
    }

    return Promise.reject(error);
  },
);
