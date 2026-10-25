import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import borrowingsApi from '../../services/borrowingsApi';

// ── Async thunks ─────────────────────────────────────────────────────────────

/** Fetch current user's borrowings */
export const fetchMyBorrowings = createAsyncThunk(
  'borrowings/fetchMy',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await borrowingsApi.getMyBorrowings(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Borrow a book by ID */
export const borrowBookThunk = createAsyncThunk(
  'borrowings/borrow',
  async (bookId, { rejectWithValue }) => {
    try {
      return await borrowingsApi.borrowBook(bookId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Return a borrowed book by borrowing record ID */
export const returnBookThunk = createAsyncThunk(
  'borrowings/return',
  async (id, { rejectWithValue }) => {
    try {
      return await borrowingsApi.returnBook(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Renew a borrowed book */
export const renewBookThunk = createAsyncThunk(
  'borrowings/renew',
  async (id, { rejectWithValue }) => {
    try {
      return await borrowingsApi.renewBook(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  activeFilter: 'all', // 'all', 'active', 'due-soon', 'returned'
  loading: false,
  actionLoading: null, // borrowing ID currently being processed
  error: null
};

// Helper to normalize id: prefer customId, fall back to _id string
const getId = (b) => b.customId || b._id || b.id;

export const borrowingSlice = createSlice({
  name: 'borrowings',
  initialState,
  reducers: {
    setBorrowings: (state, action) => {
      state.items = action.payload;
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    setBorrowingsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBorrowingsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // These synchronous reducers are kept for backward compatibility with
    // components that call them directly, but the thunks are preferred.
    borrowBook: (state, action) => {
      const { bookId, bookTitle, bookAuthor, bookCover } = action.payload;
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 14);
      state.items.unshift({
        id: `br-${Date.now()}`,
        bookId,
        bookTitle,
        bookAuthor,
        bookCover,
        borrowDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        returnDate: null,
        status: 'active',
        renewalsLeft: 2
      });
    },
    returnBook: (state, action) => {
      const id = action.payload;
      const index = state.items.findIndex(b => getId(b) === id || b.id === id);
      if (index !== -1) {
        state.items[index].status = 'returned';
        state.items[index].returnDate = new Date().toISOString().split('T')[0];
      }
    },
    renewBook: (state, action) => {
      const id = action.payload;
      const index = state.items.findIndex(b => getId(b) === id || b.id === id);
      if (index !== -1 && state.items[index].renewalsLeft > 0) {
        const currentDue = new Date(state.items[index].dueDate);
        currentDue.setDate(currentDue.getDate() + 14);
        state.items[index].dueDate = currentDue.toISOString().split('T')[0];
        state.items[index].renewalsLeft -= 1;
        state.items[index].status = 'active';
      }
    }
  },
  extraReducers: (builder) => {
    // fetchMyBorrowings
    builder
      .addCase(fetchMyBorrowings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBorrowings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.borrowings || [];
      })
      .addCase(fetchMyBorrowings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // borrowBookThunk
    builder
      .addCase(borrowBookThunk.fulfilled, (state, action) => {
        if (action.payload.borrowing) {
          state.items.unshift(action.payload.borrowing);
        }
      });

    // returnBookThunk
    builder
      .addCase(returnBookThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(returnBookThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        const updated = action.payload.borrowing;
        if (updated) {
          const idx = state.items.findIndex(b => getId(b) === getId(updated));
          if (idx !== -1) state.items[idx] = updated;
        }
      })
      .addCase(returnBookThunk.rejected, (state) => {
        state.actionLoading = null;
      });

    // renewBookThunk
    builder
      .addCase(renewBookThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(renewBookThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        const updated = action.payload.borrowing;
        if (updated) {
          const idx = state.items.findIndex(b => getId(b) === getId(updated));
          if (idx !== -1) state.items[idx] = updated;
        }
      })
      .addCase(renewBookThunk.rejected, (state) => {
        state.actionLoading = null;
      });
  }
});

export const {
  setBorrowings,
  setActiveFilter,
  borrowBook,
  returnBook,
  renewBook,
  setBorrowingsLoading,
  setBorrowingsError
} = borrowingSlice.actions;

export default borrowingSlice.reducer;
