/**
 * Wishlist API service
 */
import api from './api.js';

export const wishlistApi = {
  /**
   * GET /api/wishlist  (authenticated)
   * Returns { bookIds: string[], books: Book[] }
   */
  getWishlist: () => api.get('/wishlist'),

  /**
   * POST /api/wishlist/toggle  (authenticated)
   * Adds book if not present, removes if already present
   * @param {string} bookId — MongoDB ObjectId or customId
   * Returns { isWishlisted: boolean, bookIds: string[] }
   */
  toggleWishlist: (bookId) => api.post('/wishlist/toggle', { bookId })
};

export default wishlistApi;
