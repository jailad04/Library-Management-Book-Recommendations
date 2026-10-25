/**
 * Auth API service
 */
import api from './api.js';

export const authApi = {
  /**
   * POST /api/auth/register
   * @param {{ name, email, password, memberId, department, preferredGenres }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * POST /api/auth/login
   * @param {{ email, password }} credentials
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * GET /api/auth/me
   * Returns the authenticated user profile
   */
  getMe: () => api.get('/auth/me'),

  /**
   * PUT /api/auth/profile
   * @param {{ name?, department?, preferredGenres?, readingGoal?, avatarUrl? }} updates
   */
  updateProfile: (updates) => api.put('/auth/profile', updates),

  /**
   * POST /api/auth/logout
   */
  logout: () => api.post('/auth/logout')
};

export default authApi;
