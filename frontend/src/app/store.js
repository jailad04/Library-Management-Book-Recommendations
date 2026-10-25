import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/uiSlice';
import authReducer from '../features/auth/authSlice';
import booksReducer from '../features/books/booksSlice';
import borrowingReducer from '../features/borrowings/borrowingSlice';
import recommendationsReducer from '../features/recommendations/recommendationsSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    books: booksReducer,
    borrowings: borrowingReducer,
    recommendations: recommendationsReducer,
    wishlist: wishlistReducer,
    reviews: reviewsReducer,
    notifications: notificationsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
