import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Main pages
import DashboardPage from './pages/DashboardPage';
import ExploreBooksPage from './pages/ExploreBooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import BorrowingsPage from './pages/BorrowingsPage';
import WishlistPage from './pages/WishlistPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import ReviewsPage from './pages/ReviewsPage';

// Admin pages
import AdminPage from './pages/AdminPage';

// Not found
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      {/* Auth routes (public layout) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
      </Route>

      {/* Protected app routes (main layout with sidebar + header) */}
      <Route
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/books" element={<ExploreBooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/borrowings" element={<BorrowingsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route
          path="/admin"
          element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
