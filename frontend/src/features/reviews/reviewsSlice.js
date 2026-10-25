import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewsApi from '../../services/reviewsApi';

// ── Async thunks ─────────────────────────────────────────────────────────────

/** Fetch reviews — optionally filtered by bookId */
export const fetchReviews = createAsyncThunk(
  'reviews/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await reviewsApi.getReviews(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Submit a new review */
export const createReviewThunk = createAsyncThunk(
  'reviews/create',
  async (data, { rejectWithValue }) => {
    try {
      return await reviewsApi.createReview(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Delete a review (author or admin) */
export const deleteReviewThunk = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reviewsApi.deleteReview(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    // Synchronous — kept for compatibility
    addReview: (state, action) => {
      const newReview = {
        id: `rev-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...action.payload
      };
      state.items.unshift(newReview);
    },
    deleteReview: (state, action) => {
      state.items = state.items.filter(r => r.id !== action.payload && r._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // fetchReviews
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.reviews || [];
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createReviewThunk
    builder
      .addCase(createReviewThunk.fulfilled, (state, action) => {
        if (action.payload.review) {
          state.items.unshift(action.payload.review);
        }
      });

    // deleteReviewThunk
    builder
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.items = state.items.filter(
          r => r._id !== deletedId && r.id !== deletedId && r.customId !== deletedId
        );
      });
  }
});

export const { addReview, deleteReview } = reviewsSlice.actions;

export default reviewsSlice.reducer;
