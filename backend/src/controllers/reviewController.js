import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Book from '../models/Book.js';

/**
 * Helper to find review by either MongoDB ObjectId or customId (e.g. 'rev-1')
 */
const findReviewByIdOrCustomId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const rev = await Review.findById(id);
    if (rev) return rev;
  }
  return await Review.findOne({ customId: id });
};

/**
 * @desc    Get all reviews or filter by bookId
 * @route   GET /api/reviews
 * @access  Public
 */
export const getReviews = async (req, res, next) => {
  try {
    const { bookId } = req.query;
    const query = {};

    if (bookId) {
      if (mongoose.Types.ObjectId.isValid(bookId)) {
        query.$or = [{ book: bookId }, { bookId }];
      } else {
        query.bookId = bookId;
      }
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a new peer review for a book
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;

    if (!bookId || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Please provide book ID, rating (1-5), and review comment.'
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be an integer or number between 1 and 5.'
      });
    }

    // Find the book
    let book = null;
    if (mongoose.Types.ObjectId.isValid(bookId)) {
      book = await Book.findById(bookId);
    }
    if (!book) {
      book = await Book.findOne({ customId: bookId });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book with ID '${bookId}' not found.`
      });
    }

    const review = await Review.create({
      customId: `rev-${Date.now().toString().slice(-6)}`,
      book: book._id,
      user: req.user._id,
      bookId: book.customId || book._id.toString(),
      userName: req.user.name,
      userRole: req.user.role === 'admin' ? 'Library Staff' : req.user.department || 'Student Scholar',
      rating: ratingNum,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0]
    });

    // Recompute book average rating and ratingCount
    await Review.recalculateBookRating(book._id);

    res.status(201).json({
      success: true,
      message: 'Review posted successfully.',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review (Author or Admin only)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await findReviewByIdOrCustomId(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: `Review with ID '${req.params.id}' not found.`
      });
    }

    // Authorization check
    const isAuthor = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete a review written by another user.'
      });
    }

    const bookObjectId = review.book;
    await Review.findByIdAndDelete(review._id);

    // Recompute book average rating
    await Review.recalculateBookRating(bookObjectId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getReviews,
  createReview,
  deleteReview
};
