/**
 * Reviews API service
 */
import api from './api.js';

export const reviewsApi = {
  /**
   * GET /api/reviews
   * @param {{ bookId? }} params
   */
  getReviews: (params = {}) => api.get('/reviews', { params }),

  /**
   * POST /api/reviews  (authenticated)
   * @param {{ bookId, rating, comment }} data
   */
  createReview: (data) => api.post('/reviews', data),

  /**
   * DELETE /api/reviews/:id  (authenticated — author or admin)
   */
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};

export default reviewsApi;
