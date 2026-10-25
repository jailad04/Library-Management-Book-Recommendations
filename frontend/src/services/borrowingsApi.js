/**
 * Borrowings API service
 */
import api from './api.js';

export const borrowingsApi = {
  /**
   * GET /api/borrowings/my
   * @param {{ status? }} params — 'all' | 'active' | 'returned' | 'overdue'
   */
  getMyBorrowings: (params = {}) => api.get('/borrowings/my', { params }),

  /**
   * POST /api/borrowings
   * @param {{ bookId: string }} data
   */
  borrowBook: (bookId) => api.post('/borrowings', { bookId }),

  /**
   * PUT /api/borrowings/:id/return
   */
  returnBook: (id) => api.put(`/borrowings/${id}/return`),

  /**
   * PUT /api/borrowings/:id/renew
   */
  renewBook: (id) => api.put(`/borrowings/${id}/renew`)
};

export default borrowingsApi;
