import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowingRoutes from './routes/borrowingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  // CORS Configuration
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Request Body Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root welcome route
  app.get('/', (req, res) => {
    res.json({
      message: 'BookNest REST API is running',
      version: '1.0.0',
      health: '/api/health',
      endpoints: {
        auth: '/api/auth',
        books: '/api/books',
        borrowings: '/api/borrowings',
        reviews: '/api/reviews',
        wishlist: '/api/wishlist'
      }
    });
  });

  // API Route Mounts
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/borrowings', borrowingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/wishlist', wishlistRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
