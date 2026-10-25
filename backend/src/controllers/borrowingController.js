import mongoose from 'mongoose';
import Borrowing from '../models/Borrowing.js';
import Book from '../models/Book.js';

/**
 * Helper to find borrowing by either MongoDB ObjectId or customId (e.g. 'br-901')
 */
const findBorrowingByIdOrCustomId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const loan = await Borrowing.findById(id);
    if (loan) return loan;
  }
  return await Borrowing.findOne({ customId: id });
};

/**
 * @desc    Get current user's borrowings
 * @route   GET /api/borrowings/my
 * @access  Private
 */
export const getMyBorrowings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = { $in: ['active', 'due-soon'] };
      } else {
        query.status = status;
      }
    }

    const borrowings = await Borrowing.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: borrowings.length,
      borrowings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Borrow an available book (safe atomic inventory update)
 * @route   POST /api/borrowings
 * @access  Private
 */
export const borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Book ID is required to borrow a book.'
      });
    }

    // 1. Locate the book first
    let bookQuery = {};
    if (mongoose.Types.ObjectId.isValid(bookId)) {
      bookQuery = { _id: bookId };
    } else {
      bookQuery = { customId: bookId };
    }

    const targetBook = await Book.findOne(bookQuery);
    if (!targetBook) {
      return res.status(404).json({
        success: false,
        error: `Book with ID '${bookId}' was not found in the catalogue.`
      });
    }

    // 2. Prevent duplicate active borrowings of the same title by this user
    const existingActiveLoan = await Borrowing.findOne({
      user: req.user._id,
      $or: [{ book: targetBook._id }, { bookId: targetBook.customId || targetBook._id.toString() }],
      status: { $in: ['active', 'due-soon'] }
    });

    if (existingActiveLoan) {
      return res.status(400).json({
        success: false,
        error: `You already have an active loan for "${targetBook.title}". Please return it before borrowing another copy.`
      });
    }

    // 3. Atomically decrement inventory only if availableCopies > 0
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: targetBook._id,
        availableCopies: { $gt: 0 }
      },
      {
        $inc: { availableCopies: -1 }
      },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(400).json({
        success: false,
        error: `All copies of "${targetBook.title}" are currently borrowed. No copies available.`
      });
    }

    // 4. Calculate due date (14 days from today)
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    const borrowing = await Borrowing.create({
      customId: `br-${Date.now().toString().slice(-6)}`,
      user: req.user._id,
      book: targetBook._id,
      bookId: targetBook.customId || targetBook._id.toString(),
      bookTitle: targetBook.title,
      bookAuthor: targetBook.author,
      bookCover: targetBook.coverUrl,
      borrowDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'active',
      renewalsLeft: 2
    });

    res.status(201).json({
      success: true,
      message: `Successfully borrowed "${targetBook.title}". Due in 14 days.`,
      borrowing,
      availableCopiesLeft: updatedBook.availableCopies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return a borrowed book
 * @route   PUT /api/borrowings/:id/return
 * @access  Private
 */
export const returnBook = async (req, res, next) => {
  try {
    const borrowing = await findBorrowingByIdOrCustomId(req.params.id);

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        error: `Borrowing record with ID '${req.params.id}' not found.`
      });
    }

    // Enforce ownership: only the borrowing user or an admin can return
    const isOwner = borrowing.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to return a loan belonging to another user.'
      });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({
        success: false,
        error: `Book "${borrowing.bookTitle}" has already been returned.`
      });
    }

    // Update borrowing status
    borrowing.status = 'returned';
    borrowing.returnDate = new Date().toISOString().split('T')[0];
    await borrowing.save();

    // Increment inventory atomically
    await Book.findByIdAndUpdate(borrowing.book, {
      $inc: { availableCopies: 1 }
    });

    res.status(200).json({
      success: true,
      message: `Successfully returned "${borrowing.bookTitle}". Thank you!`,
      borrowing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Renew a borrowed book (+14 days)
 * @route   PUT /api/borrowings/:id/renew
 * @access  Private
 */
export const renewBook = async (req, res, next) => {
  try {
    const borrowing = await findBorrowingByIdOrCustomId(req.params.id);

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        error: `Borrowing record with ID '${req.params.id}' not found.`
      });
    }

    // Enforce ownership
    const isOwner = borrowing.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to renew a loan belonging to another user.'
      });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({
        success: false,
        error: 'Cannot renew a book that has already been returned.'
      });
    }

    if (borrowing.renewalsLeft <= 0) {
      return res.status(400).json({
        success: false,
        error: `Maximum renewals reached (0 left) for "${borrowing.bookTitle}". Please return the volume.`
      });
    }

    // Extend due date by 14 days from current due date
    const currentDue = new Date(borrowing.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);

    borrowing.dueDate = currentDue.toISOString().split('T')[0];
    borrowing.renewalsLeft -= 1;
    borrowing.status = 'active';
    await borrowing.save();

    res.status(200).json({
      success: true,
      message: `Renewed "${borrowing.bookTitle}" for 14 days. Due date extended to ${borrowing.dueDate}.`,
      borrowing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ALL borrowings (admin only)
 * @route   GET /api/borrowings
 * @access  Private/Admin
 */
export const getAllBorrowings = async (req, res, next) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.user = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const [borrowings, total] = await Promise.all([
      Borrowing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email memberId'),
      Borrowing.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: borrowings.length,
      total,
      borrowings
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyBorrowings,
  getAllBorrowings,
  borrowBook,
  returnBook,
  renewBook
};
