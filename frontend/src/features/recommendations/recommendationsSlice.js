import { createSlice } from '@reduxjs/toolkit';
import { MOCK_RECOMMENDATIONS } from '../../mocks/mockData';

const initialState = {
  items: MOCK_RECOMMENDATIONS,
  feedbackMap: {}, // { [recId]: 'relevant' | 'not-relevant' }
  loading: false,
  error: null
};

export const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    setRecommendations: (state, action) => {
      state.items = action.payload;
    },
    recordFeedback: (state, action) => {
      const { recId, feedback } = action.payload; // feedback: 'relevant' | 'not-relevant'
      state.feedbackMap[recId] = feedback;
    },
    setRecommendationsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRecommendationsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setRecommendations,
  recordFeedback,
  setRecommendationsLoading,
  setRecommendationsError
} = recommendationsSlice.actions;

export default recommendationsSlice.reducer;
