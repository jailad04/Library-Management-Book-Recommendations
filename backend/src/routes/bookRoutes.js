import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBooks)
  .post(protect, authorize('admin'), createBook);

router.route('/:id')
  .get(getBookById)
  .put(protect, authorize('admin'), updateBook)
  .delete(protect, authorize('admin'), deleteBook);

export default router;
