import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import booksApi from '../../services/booksApi';

// ── Async thunks ─────────────────────────────────────────────────────────────

/** Fetch the book list with current filter/search/pagination params */
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params, { rejectWithValue }) => {
    try {
      return await booksApi.getBooks(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch a single book by id (ObjectId or customId) */
export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id, { rejectWithValue }) => {
    try {
      return await booksApi.getBookById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Admin: create a new book */
export const createBook = createAsyncThunk(
  'books/createBook',
  async (data, { rejectWithValue }) => {
    try {
      return await booksApi.createBook(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Admin: update an existing book */
export const updateBookThunk = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await booksApi.updateBook(id, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Admin: delete a book */
export const deleteBookThunk = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await booksApi.deleteBook(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  selectedBook: null,
  viewMode: 'grid', // 'grid' | 'list'
  filters: {
    search: '',
    genre: 'All',
    category: 'All',
    availability: 'all', // 'all', 'available', 'unavailable'
    sortBy: 'rating-desc' // 'rating-desc', 'title-asc', 'year-desc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 8,
    total: 0
  },
  loading: false,
  error: null
};

export const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks: (state, action) => {
      state.items = action.payload;
    },
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    addBook: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateBook: (state, action) => {
      const index = state.items.findIndex(b => b.id === action.payload.id || b._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteBook: (state, action) => {
      state.items = state.items.filter(b => b.id !== action.payload && b._id !== action.payload);
    },
    setBooksLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBooksError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    // fetchBooks
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.books || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
            total: action.payload.total || 0
          };
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchBookById
    builder
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBook = action.payload.book;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createBook
    builder
      .addCase(createBook.fulfilled, (state, action) => {
        state.items.unshift(action.payload.book);
      });

    // updateBookThunk
    builder
      .addCase(updateBookThunk.fulfilled, (state, action) => {
        const updated = action.payload.book;
        const idx = state.items.findIndex(b => b._id === updated._id || b.id === updated.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...updated };
        if (state.selectedBook?._id === updated._id) {
          state.selectedBook = { ...state.selectedBook, ...updated };
        }
      });

    // deleteBookThunk
    builder
      .addCase(deleteBookThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b._id !== action.payload && b.id !== action.payload);
      });
  }
});

export const {
  setBooks,
  setSelectedBook,
  setViewMode,
  setFilter,
  resetFilters,
  setPage,
  addBook,
  updateBook,
  deleteBook,
  setBooksLoading,
  setBooksError
} = booksSlice.actions;

export default booksSlice.reducer;
