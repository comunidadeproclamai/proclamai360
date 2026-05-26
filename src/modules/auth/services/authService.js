import { apiClient } from '../../../services/apiClient.js';
import { appConfig } from '../../../config/appConfig.js';
import { getStoredToken } from '../../../lib/storage.js';

const MOCK_TOKEN = 'proclamai-local-admin-token';
const MOCK_ADMIN = {
  id: 'local-admin-renato',
  name: 'Renato',
  email: 'renato@proclamai.com.br',
  role: 'admin',
  createdAt: '2026-05-19T00:00:00.000Z',
};

function isMockAuthEnabled() {
  return import.meta.env.DEV && appConfig.authMode === 'mock';
}

function createAuthError(message) {
  const error = new Error(message);
  error.response = {
    data: {
      message,
    },
  };
  return error;
}

export async function login(credentials) {
  if (isMockAuthEnabled()) {
    const email = String(credentials.email || '').trim().toLowerCase();
    const password = String(credentials.password || '');

    if (email !== MOCK_ADMIN.email || password !== 'adm123') {
      throw createAuthError('E-mail ou senha invalidos.');
    }

    return {
      user: MOCK_ADMIN,
      token: MOCK_TOKEN,
    };
  }

  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
}



export async function getCurrentUser() {
  if (isMockAuthEnabled()) {
    if (getStoredToken() !== MOCK_TOKEN) {
      throw createAuthError('Sessao local nao encontrada.');
    }

    return MOCK_ADMIN;
  }

  const { data } = await apiClient.get('/users/me');
  return data.user;
}
