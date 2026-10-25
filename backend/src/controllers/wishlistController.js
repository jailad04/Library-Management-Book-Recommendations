import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';

/**
 * @desc    Get user's saved wishlist books
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    // Return array of bookIds for Redux compatibility + full book objects
    const bookIds = (user.wishlist || []).map((b) => b.customId || b._id.toString());

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      bookIds,
      books: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle book in wishlist (add if missing, remove if present)
 * @route   POST /api/wishlist/toggle
 * @access  Private
 */
export const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Book ID is required to toggle wishlist.'
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

    const user = await User.findById(req.user._id);
    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === book._id.toString()
    );

    let isWishlisted = false;
    if (existingIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(existingIndex, 1);
      isWishlisted = false;
    } else {
      // Add to wishlist
      user.wishlist.push(book._id);
      isWishlisted = true;
    }

    await user.save();

    // Populate updated wishlist to return fresh list of bookIds
    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    const bookIds = updatedUser.wishlist.map((b) => b.customId || b._id.toString());

    res.status(200).json({
      success: true,
      message: isWishlisted
        ? `Added "${book.title}" to wishlist.`
        : `Removed "${book.title}" from wishlist.`,
      isWishlisted,
      bookIds
    });
  } catch (error) {
    next(error);
  }
};

export default { getWishlist, toggleWishlist };
