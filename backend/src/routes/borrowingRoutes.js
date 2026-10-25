import express from 'express';
import {
  getMyBorrowings,
  getAllBorrowings,
  borrowBook,
  returnBook,
  renewBook
} from '../controllers/borrowingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin: get all borrowings across all users
router.get('/', authorize('admin'), getAllBorrowings);

// Student: their own borrowings
router.get('/my', getMyBorrowings);

// Borrow / return / renew
router.post('/', borrowBook);
router.post('/borrow', borrowBook);     // convenience alias for frontend service
router.put('/:id/return', returnBook);
router.put('/:id/renew', renewBook);

export default router;
