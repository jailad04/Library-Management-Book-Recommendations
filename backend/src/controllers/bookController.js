import mongoose from 'mongoose';
import Book from '../models/Book.js';

/**
 * Helper to find book by either MongoDB ObjectId or customId (e.g. 'b-101')
 */
const findBookByIdOrCustomId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const book = await Book.findById(id);
    if (book) return book;
  }
  return await Book.findOne({ customId: id });
};

/**
 * @desc    Get all books with search, filter, sort, and pagination
 * @route   GET /api/books
 * @access  Public
 */
export const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      category,
      availability,
      sortBy = 'rating-desc',
      page = 1,
      limit = 8
    } = req.query;

    const query = {};

    // 1. Text Search across Title, Author, ISBN, Genre
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { isbn: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } }
      ];
    }

    // 2. Genre Filter
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    // 3. Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 4. Availability Filter
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      query.availableCopies = { $lte: 0 };
    }

    // 5. Sorting
    let sortOptions = { rating: -1, ratingCount: -1 };
    if (sortBy === 'title-asc') {
      sortOptions = { title: 1 };
    } else if (sortBy === 'year-desc') {
      sortOptions = { publishedYear: -1 };
    }

    // 6. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 8));
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      pagination: {
        currentPage: pageNum,
        totalPages,
        itemsPerPage: limitNum
      },
      books
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
export const getBookById = async (req, res, next) => {
  try {
    const book = await findBookByIdOrCustomId(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book not found with ID '${req.params.id}'`
      });
    }

    res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new book (Admin only)
 * @route   POST /api/books
 * @access  Private/Admin
 */
export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      category,
      publishedYear,
      publisher,
      pages,
      coverUrl,
      totalCopies = 5,
      availableCopies,
      shelfLocation,
      featured,
      tags,
      description
    } = req.body;

    if (!title || !author || !isbn || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, author, ISBN, and genre.'
      });
    }

    // Check duplicate ISBN
    const existingIsbn = await Book.findOne({ isbn: isbn.trim() });
    if (existingIsbn) {
      return res.status(409).json({
        success: false,
        error: `A book with ISBN '${isbn}' already exists.`
      });
    }

    const cleanIsbn = isbn.trim();
    const resolvedCover =
      coverUrl || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;

    const tot = Math.max(1, Number(totalCopies));
    const avail = availableCopies !== undefined ? Math.min(tot, Math.max(0, Number(availableCopies))) : tot;

    const book = await Book.create({
      customId: `b-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      author: author.trim(),
      isbn: cleanIsbn,
      genre: genre.trim(),
      category: category ? category.trim() : 'General',
      publishedYear: publishedYear ? Number(publishedYear) : new Date().getFullYear(),
      publisher: publisher ? publisher.trim() : 'University Press',
      pages: pages ? Number(pages) : 350,
      coverUrl: resolvedCover,
      totalCopies: tot,
      availableCopies: avail,
      shelfLocation: shelfLocation || 'Floor 1 — Shelf A-01',
      featured: Boolean(featured),
      tags: Array.isArray(tags) ? tags : [genre],
      description: description ? description.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update book details (Admin only)
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
export const updateBook = async (req, res, next) => {
  try {
    const book = await findBookByIdOrCustomId(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book not found with ID '${req.params.id}'`
      });
    }

    const updates = req.body;

    // Validate inventory counts if provided
    if (updates.totalCopies !== undefined && updates.availableCopies !== undefined) {
      if (Number(updates.availableCopies) > Number(updates.totalCopies)) {
        return res.status(400).json({
          success: false,
          error: 'Available copies cannot exceed total copies.'
        });
      }
    }

    Object.assign(book, updates);
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete book (Admin only)
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
export const deleteBook = async (req, res, next) => {
  try {
    const book = await findBookByIdOrCustomId(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: `Book not found with ID '${req.params.id}'`
      });
    }

    await Book.findByIdAndDelete(book._id);

    res.status(200).json({
      success: true,
      message: `Book '${book.title}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
