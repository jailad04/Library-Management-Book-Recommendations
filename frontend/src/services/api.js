/**
 * BookNest API Service — Central Axios Instance
 *
 * Automatically injects the JWT Bearer token from Redux store (via localStorage
 * mirror) on every request so individual callers don't need to manage headers.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── Request interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('booknest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap data & handle 401 ─────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Auto-clear token on 401 (token expired / invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('booknest_token');
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
