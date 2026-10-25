/**
 * Books API service
 */
import api from './api.js';

export const booksApi = {
  /**
   * GET /api/books
   * @param {{ search?, genre?, category?, availability?, sortBy?, page?, limit? }} params
   */
  getBooks: (params = {}) => api.get('/books', { params }),

  /**
   * GET /api/books/:id
   * Accepts MongoDB ObjectId or customId (e.g. 'b-101')
   */
  getBookById: (id) => api.get(`/books/${id}`),

  /**
   * POST /api/books  (Admin only)
   */
  createBook: (data) => api.post('/books', data),

  /**
   * PUT /api/books/:id  (Admin only)
   */
  updateBook: (id, data) => api.put(`/books/${id}`, data),

  /**
   * DELETE /api/books/:id  (Admin only)
   */
  deleteBook: (id) => api.delete(`/books/${id}`)
};

export default booksApi;
