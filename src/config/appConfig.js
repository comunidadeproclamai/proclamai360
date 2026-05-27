function normalizeApiBaseUrl(value) {
  const apiBaseUrl = value || '/api';
  return apiBaseUrl === '/API' ? '/api' : apiBaseUrl;
}

export const appConfig = {
  name: 'Proclamai 360',
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
};
