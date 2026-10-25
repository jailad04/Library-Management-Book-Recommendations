import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistApi from '../../services/wishlistApi';

// ── Async thunks ─────────────────────────────────────────────────────────────

/** Fetch the authenticated user's wishlist */
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistApi.getWishlist();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Toggle a book in/out of wishlist */
export const toggleWishlistThunk = createAsyncThunk(
  'wishlist/toggle',
  async (bookId, { rejectWithValue }) => {
    try {
      return await wishlistApi.toggleWishlist(bookId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  bookIds: [],
  loading: false,
  error: null
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Synchronous toggle — kept for compatibility, thunk preferred
    toggleWishlist: (state, action) => {
      const bookId = action.payload;
      const index = state.bookIds.indexOf(bookId);
      if (index === -1) {
        state.bookIds.push(bookId);
      } else {
        state.bookIds.splice(index, 1);
      }
    },
    addToWishlist: (state, action) => {
      if (!state.bookIds.includes(action.payload)) {
        state.bookIds.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.bookIds = state.bookIds.filter(id => id !== action.payload);
    },
    setWishlistIds: (state, action) => {
      state.bookIds = action.payload;
    }
  },
  extraReducers: (builder) => {
    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.bookIds = action.payload.bookIds || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // toggleWishlistThunk
    builder
      .addCase(toggleWishlistThunk.fulfilled, (state, action) => {
        // Server returns the fresh bookIds array after toggle
        state.bookIds = action.payload.bookIds || [];
      });
  }
});

export const {
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  setWishlistIds
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
