import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const normalizeApiError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    'Request failed';

  const normalized = new Error(message);
  normalized.response = error?.response;
  normalized.status = error?.response?.status;
  normalized.originalError = error;

  return normalized;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (status === 401 && !isAuthRequest && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.assign('/login');
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export default api;
